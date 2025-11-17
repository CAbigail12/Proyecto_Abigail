const { pool } = require('../config/db');

class TestigosPadrinosModel {
  // Crear testigo/padrino
  static async crear(datos) {
    const cliente = await pool.connect();
    try {
      const query = `
        INSERT INTO testigos_padrinos (id_asignacion, id_feligres, id_tipo_testigo_padrino, numero_orden)
        VALUES ($1, $2, $3, $4)
        RETURNING id_testigo_padrino, id_asignacion, id_feligres, id_tipo_testigo_padrino, numero_orden, activo, created_at
      `;
      
      const resultado = await cliente.query(query, [
        datos.id_asignacion,
        datos.id_feligres,
        datos.id_tipo_testigo_padrino,
        datos.numero_orden || 1
      ]);
      
      return resultado.rows[0];
    } finally {
      cliente.release();
    }
  }

  // Crear múltiples testigos/padrinos
  static async crearMultiples(datos) {
    const cliente = await pool.connect();
    try {
      await cliente.query('BEGIN');
      
      const resultados = [];
      for (const item of datos) {
        const query = `
          INSERT INTO testigos_padrinos (id_asignacion, id_feligres, id_tipo_testigo_padrino, numero_orden)
          VALUES ($1, $2, $3, $4)
          RETURNING id_testigo_padrino
        `;
        
        const resultado = await cliente.query(query, [
          item.id_asignacion,
          item.id_feligres,
          item.id_tipo_testigo_padrino,
          item.numero_orden || 1
        ]);
        
        resultados.push(resultado.rows[0]);
      }
      
      await cliente.query('COMMIT');
      return resultados;
    } catch (error) {
      await cliente.query('ROLLBACK');
      throw error;
    } finally {
      cliente.release();
    }
  }

  // Obtener testigos/padrinos por asignación
  static async obtenerPorAsignacion(idAsignacion) {
    const cliente = await pool.connect();
    try {
      const query = `
        SELECT 
          tp.id_testigo_padrino,
          tp.id_asignacion,
          tp.id_feligres,
          tp.id_tipo_testigo_padrino,
          tp.numero_orden,
          tp.activo,
          tp.created_at,
          f.primer_nombre || ' ' || COALESCE(f.segundo_nombre || ' ', '') || f.primer_apellido || ' ' || COALESCE(f.segundo_apellido, '') as nombre_completo,
          ttp.nombre as tipo_nombre,
          ttp.descripcion as tipo_descripcion
        FROM testigos_padrinos tp
        INNER JOIN feligres f ON tp.id_feligres = f.id_feligres
        INNER JOIN cat_tipo_testigo_padrino ttp ON tp.id_tipo_testigo_padrino = ttp.id_tipo_testigo_padrino
        WHERE tp.id_asignacion = $1 AND tp.activo = true
        ORDER BY tp.id_tipo_testigo_padrino, tp.numero_orden
      `;
      
      const resultado = await cliente.query(query, [idAsignacion]);
      return resultado.rows;
    } finally {
      cliente.release();
    }
  }

  // Obtener por tipo y asignación
  static async obtenerPorTipoYAsignacion(idAsignacion, idTipoTestigoPadrino) {
    const cliente = await pool.connect();
    try {
      const query = `
        SELECT 
          tp.id_testigo_padrino,
          tp.id_asignacion,
          tp.id_feligres,
          tp.id_tipo_testigo_padrino,
          tp.numero_orden,
          f.primer_nombre || ' ' || COALESCE(f.segundo_nombre || ' ', '') || f.primer_apellido || ' ' || COALESCE(f.segundo_apellido, '') as nombre_completo
        FROM testigos_padrinos tp
        INNER JOIN feligres f ON tp.id_feligres = f.id_feligres
        WHERE tp.id_asignacion = $1 
          AND tp.id_tipo_testigo_padrino = $2 
          AND tp.activo = true
        ORDER BY tp.numero_orden
      `;
      
      const resultado = await cliente.query(query, [idAsignacion, idTipoTestigoPadrino]);
      return resultado.rows;
    } finally {
      cliente.release();
    }
  }

  // Eliminar testigos/padrinos de una asignación (soft delete)
  static async eliminarPorAsignacion(idAsignacion) {
    const cliente = await pool.connect();
    try {
      const query = `
        UPDATE testigos_padrinos
        SET activo = false
        WHERE id_asignacion = $1
        RETURNING id_testigo_padrino
      `;
      
      const resultado = await cliente.query(query, [idAsignacion]);
      return resultado.rows;
    } finally {
      cliente.release();
    }
  }

  // Eliminar físicamente testigos/padrinos de una asignación (para actualizaciones)
  static async eliminarFisicamentePorAsignacion(idAsignacion) {
    const cliente = await pool.connect();
    try {
      const query = `
        DELETE FROM testigos_padrinos
        WHERE id_asignacion = $1
        RETURNING id_testigo_padrino
      `;
      
      const resultado = await cliente.query(query, [idAsignacion]);
      return resultado.rows;
    } finally {
      cliente.release();
    }
  }

  // Eliminar testigo/padrino específico
  static async eliminar(idTestigoPadrino) {
    const cliente = await pool.connect();
    try {
      const query = `
        UPDATE testigos_padrinos
        SET activo = false
        WHERE id_testigo_padrino = $1
        RETURNING id_testigo_padrino
      `;
      
      const resultado = await cliente.query(query, [idTestigoPadrino]);
      return resultado.rows[0];
    } finally {
      cliente.release();
    }
  }

  // Actualizar testigo/padrino
  static async actualizar(idTestigoPadrino, datos) {
    const cliente = await pool.connect();
    try {
      const { id_feligres, numero_orden } = datos;
      const campos = [];
      const valores = [];
      let contador = 1;

      if (id_feligres !== undefined) {
        campos.push(`id_feligres = $${contador}`);
        valores.push(id_feligres);
        contador++;
      }
      if (numero_orden !== undefined) {
        campos.push(`numero_orden = $${contador}`);
        valores.push(numero_orden);
        contador++;
      }

      if (campos.length === 0) {
        throw new Error('No hay campos para actualizar');
      }

      valores.push(idTestigoPadrino);
      const query = `
        UPDATE testigos_padrinos
        SET ${campos.join(', ')}
        WHERE id_testigo_padrino = $${contador}
        RETURNING id_testigo_padrino, id_asignacion, id_feligres, id_tipo_testigo_padrino, numero_orden, activo, updated_at
      `;
      
      const resultado = await cliente.query(query, valores);
      return resultado.rows[0];
    } finally {
      cliente.release();
    }
  }
}

module.exports = TestigosPadrinosModel;

