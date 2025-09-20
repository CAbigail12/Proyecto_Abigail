const { pool } = require('../config/db');

class SacramentoAsignacionModel {
  // Crear nueva asignación de sacramento
  static async crear(datos) {
    const cliente = await pool.connect();
    try {
      await cliente.query('BEGIN');
      
      // Insertar la asignación principal
      const queryAsignacion = `
        INSERT INTO sacramento_asignacion (id_sacramento, fecha_celebracion, pagado, comentarios)
        VALUES ($1, $2, $3, $4)
        RETURNING id_asignacion
      `;
      
      const resultadoAsignacion = await cliente.query(queryAsignacion, [
        datos.id_sacramento,
        datos.fecha_celebracion,
        datos.pagado || false,
        datos.comentarios || null
      ]);
      
      const idAsignacion = resultadoAsignacion.rows[0].id_asignacion;
      
      // Insertar participantes
      if (datos.participantes && datos.participantes.length > 0) {
        for (const participante of datos.participantes) {
          const queryParticipante = `
            INSERT INTO sacramento_participante (id_asignacion, id_feligres, id_rol_participante)
            VALUES ($1, $2, $3)
          `;
          await cliente.query(queryParticipante, [
            idAsignacion,
            participante.id_feligres,
            participante.id_rol_participante || null
          ]);
        }
      }
      
      await cliente.query('COMMIT');
      return { id_asignacion: idAsignacion };
    } catch (error) {
      await cliente.query('ROLLBACK');
      throw error;
    } finally {
      cliente.release();
    }
  }

  // Obtener todas las asignaciones con filtros
  static async obtenerTodos(filtros = {}, paginacion = {}) {
    const cliente = await pool.connect();
    try {
      const { pagina = 1, limite = 10 } = paginacion;
      const offset = (pagina - 1) * limite;
      
      let consulta = `
        SELECT 
          sa.id_asignacion,
          sa.id_sacramento,
          sa.fecha_celebracion,
          sa.pagado,
          sa.comentarios,
          sa.activo,
          sa.created_at,
          sa.updated_at,
          cs.nombre as sacramento_nombre,
          cs.descripcion as sacramento_descripcion,
          array_agg(
            json_build_object(
              'id_feligres', f.id_feligres,
              'nombre_completo', CONCAT(f.primer_nombre, ' ', f.primer_apellido),
              'primer_nombre', f.primer_nombre,
              'primer_apellido', f.primer_apellido,
              'id_rol_participante', sp.id_rol_participante,
              'rol_nombre', crp.nombre
            )
          ) as participantes
        FROM sacramento_asignacion sa
        INNER JOIN cat_sacramento cs ON sa.id_sacramento = cs.id_sacramento
        LEFT JOIN sacramento_participante sp ON sa.id_asignacion = sp.id_asignacion
        LEFT JOIN feligres f ON sp.id_feligres = f.id_feligres
        LEFT JOIN cat_rol_participante crp ON sp.id_rol_participante = crp.id_rol_participante
        WHERE sa.activo = true
      `;
      
      const parametros = [];
      let contadorParametros = 1;
      
      // Filtros
      if (filtros.id_sacramento) {
        consulta += ` AND sa.id_sacramento = $${contadorParametros}`;
        parametros.push(filtros.id_sacramento);
        contadorParametros++;
      }
      
      if (filtros.fecha_desde) {
        consulta += ` AND sa.fecha_celebracion >= $${contadorParametros}`;
        parametros.push(filtros.fecha_desde);
        contadorParametros++;
      }
      
      if (filtros.fecha_hasta) {
        consulta += ` AND sa.fecha_celebracion <= $${contadorParametros}`;
        parametros.push(filtros.fecha_hasta);
        contadorParametros++;
      }
      
      if (filtros.pagado !== undefined && filtros.pagado !== '') {
        consulta += ` AND sa.pagado = $${contadorParametros}`;
        parametros.push(filtros.pagado === 'true');
        contadorParametros++;
      }
      
      if (filtros.busqueda) {
        consulta += ` AND (
          cs.nombre ILIKE $${contadorParametros} OR
          f.primer_nombre ILIKE $${contadorParametros} OR
          f.primer_apellido ILIKE $${contadorParametros} OR
          sa.comentarios ILIKE $${contadorParametros}
        )`;
        parametros.push(`%${filtros.busqueda}%`);
        contadorParametros++;
      }
      
      consulta += `
        GROUP BY sa.id_asignacion, cs.nombre, cs.descripcion
        ORDER BY sa.fecha_celebracion DESC, sa.created_at DESC
        LIMIT $${contadorParametros} OFFSET $${contadorParametros + 1}
      `;
      parametros.push(limite, offset);
      
      const resultado = await cliente.query(consulta, parametros);
      
      // Contar total para paginación
      let consultaCount = `
        SELECT COUNT(DISTINCT sa.id_asignacion) as total
        FROM sacramento_asignacion sa
        INNER JOIN cat_sacramento cs ON sa.id_sacramento = cs.id_sacramento
        LEFT JOIN sacramento_participante sp ON sa.id_asignacion = sp.id_asignacion
        LEFT JOIN feligres f ON sp.id_feligres = f.id_feligres
        WHERE sa.activo = true
      `;
      
      const parametrosCount = [];
      let contadorCount = 1;
      
      if (filtros.id_sacramento) {
        consultaCount += ` AND sa.id_sacramento = $${contadorCount}`;
        parametrosCount.push(filtros.id_sacramento);
        contadorCount++;
      }
      
      if (filtros.fecha_desde) {
        consultaCount += ` AND sa.fecha_celebracion >= $${contadorCount}`;
        parametrosCount.push(filtros.fecha_desde);
        contadorCount++;
      }
      
      if (filtros.fecha_hasta) {
        consultaCount += ` AND sa.fecha_celebracion <= $${contadorCount}`;
        parametrosCount.push(filtros.fecha_hasta);
        contadorCount++;
      }
      
      if (filtros.pagado !== undefined && filtros.pagado !== '') {
        consultaCount += ` AND sa.pagado = $${contadorCount}`;
        parametrosCount.push(filtros.pagado === 'true');
        contadorCount++;
      }
      
      if (filtros.busqueda) {
        consultaCount += ` AND (
          cs.nombre ILIKE $${contadorCount} OR
          f.primer_nombre ILIKE $${contadorCount} OR
          f.primer_apellido ILIKE $${contadorCount} OR
          sa.comentarios ILIKE $${contadorCount}
        )`;
        parametrosCount.push(`%${filtros.busqueda}%`);
        contadorCount++;
      }
      
      const resultadoCount = await cliente.query(consultaCount, parametrosCount);
      const total = parseInt(resultadoCount.rows[0].total);
      
      return {
        asignaciones: resultado.rows,
        total: total,
        pagina: pagina,
        limite: limite,
        totalPaginas: Math.ceil(total / limite)
      };
    } finally {
      cliente.release();
    }
  }

  // Obtener asignación por ID
  static async obtenerPorId(idAsignacion) {
    const cliente = await pool.connect();
    try {
      const consulta = `
        SELECT 
          sa.id_asignacion,
          sa.id_sacramento,
          sa.fecha_celebracion,
          sa.pagado,
          sa.comentarios,
          sa.activo,
          sa.created_at,
          sa.updated_at,
          cs.nombre as sacramento_nombre,
          cs.descripcion as sacramento_descripcion,
          array_agg(
            json_build_object(
              'id_feligres', f.id_feligres,
              'nombre_completo', CONCAT(f.primer_nombre, ' ', f.primer_apellido),
              'primer_nombre', f.primer_nombre,
              'primer_apellido', f.primer_apellido,
              'id_rol_participante', sp.id_rol_participante,
              'rol_nombre', crp.nombre
            )
          ) as participantes
        FROM sacramento_asignacion sa
        INNER JOIN cat_sacramento cs ON sa.id_sacramento = cs.id_sacramento
        LEFT JOIN sacramento_participante sp ON sa.id_asignacion = sp.id_asignacion
        LEFT JOIN feligres f ON sp.id_feligres = f.id_feligres
        LEFT JOIN cat_rol_participante crp ON sp.id_rol_participante = crp.id_rol_participante
        WHERE sa.id_asignacion = $1 AND sa.activo = true
        GROUP BY sa.id_asignacion, cs.nombre, cs.descripcion
      `;
      
      const resultado = await cliente.query(consulta, [idAsignacion]);
      return resultado.rows[0] || null;
    } finally {
      cliente.release();
    }
  }

  // Actualizar asignación
  static async actualizar(idAsignacion, datos) {
    const cliente = await pool.connect();
    try {
      await cliente.query('BEGIN');
      
      // Actualizar la asignación principal
      const queryAsignacion = `
        UPDATE sacramento_asignacion 
        SET id_sacramento = $1, fecha_celebracion = $2, pagado = $3, comentarios = $4
        WHERE id_asignacion = $5 AND activo = true
      `;
      
      await cliente.query(queryAsignacion, [
        datos.id_sacramento,
        datos.fecha_celebracion,
        datos.pagado || false,
        datos.comentarios || null,
        idAsignacion
      ]);
      
      // Eliminar participantes existentes
      await cliente.query(
        'DELETE FROM sacramento_participante WHERE id_asignacion = $1',
        [idAsignacion]
      );
      
      // Insertar nuevos participantes
      if (datos.participantes && datos.participantes.length > 0) {
        for (const participante of datos.participantes) {
          const queryParticipante = `
            INSERT INTO sacramento_participante (id_asignacion, id_feligres, id_rol_participante)
            VALUES ($1, $2, $3)
          `;
          await cliente.query(queryParticipante, [
            idAsignacion,
            participante.id_feligres,
            participante.id_rol_participante || null
          ]);
        }
      }
      
      await cliente.query('COMMIT');
      return true;
    } catch (error) {
      await cliente.query('ROLLBACK');
      throw error;
    } finally {
      cliente.release();
    }
  }

  // Eliminación lógica
  static async eliminar(idAsignacion) {
    const cliente = await pool.connect();
    try {
      const query = `
        UPDATE sacramento_asignacion 
        SET activo = false 
        WHERE id_asignacion = $1 AND activo = true
      `;
      
      const resultado = await cliente.query(query, [idAsignacion]);
      return resultado.rowCount > 0;
    } finally {
      cliente.release();
    }
  }

  // Obtener sacramentos disponibles
  static async obtenerSacramentos() {
    const cliente = await pool.connect();
    try {
      const query = `
        SELECT id_sacramento, nombre, descripcion 
        FROM cat_sacramento 
        WHERE activo = true 
        ORDER BY nombre
      `;
      
      const resultado = await cliente.query(query);
      return resultado.rows;
    } finally {
      cliente.release();
    }
  }

  // Obtener roles de participante
  static async obtenerRolesParticipante() {
    const cliente = await pool.connect();
    try {
      const query = `
        SELECT id_rol_participante, nombre, descripcion 
        FROM cat_rol_participante 
        WHERE activo = true 
        ORDER BY nombre
      `;
      
      const resultado = await cliente.query(query);
      return resultado.rows;
    } finally {
      cliente.release();
    }
  }

  // Obtener estadísticas
  static async obtenerEstadisticas() {
    const cliente = await pool.connect();
    try {
      const query = `
        SELECT 
          COUNT(*) as total_asignaciones,
          COUNT(CASE WHEN pagado = true THEN 1 END) as asignaciones_pagadas,
          COUNT(CASE WHEN pagado = false THEN 1 END) as asignaciones_pendientes,
          COUNT(CASE WHEN fecha_celebracion >= CURRENT_DATE THEN 1 END) as proximas_celebraciones,
          COUNT(CASE WHEN id_sacramento = 1 THEN 1 END) as total_bautizos,
          COUNT(CASE WHEN id_sacramento = 3 THEN 1 END) as total_confirmaciones,
          COUNT(CASE WHEN id_sacramento = 4 THEN 1 END) as total_matrimonios
        FROM sacramento_asignacion 
        WHERE activo = true
      `;
      
      const resultado = await cliente.query(query);
      return resultado.rows[0];
    } finally {
      cliente.release();
    }
  }
}

module.exports = SacramentoAsignacionModel;
