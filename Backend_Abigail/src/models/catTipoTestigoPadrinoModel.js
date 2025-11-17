const { pool } = require('../config/db');

class CatTipoTestigoPadrinoModel {
  // Obtener todos los tipos (sin filtros ni paginación - se aplican en el frontend)
  static async obtenerTodos(pagina = 1, limite = 10, filtros = {}) {
    const query = `
      SELECT 
        id_tipo_testigo_padrino,
        nombre,
        descripcion,
        activo,
        created_at,
        updated_at
      FROM cat_tipo_testigo_padrino
      WHERE activo = true
      ORDER BY nombre ASC
    `;

    const result = await pool.query(query);
    return result.rows;
  }

  // Contar total de registros
  static async contar(filtros = {}) {
    const query = 'SELECT COUNT(*) as total FROM cat_tipo_testigo_padrino WHERE activo = true';
    const result = await pool.query(query);
    return parseInt(result.rows[0].total);
  }

  // Obtener por ID
  static async obtenerPorId(id) {
    const query = `
      SELECT 
        id_tipo_testigo_padrino,
        nombre,
        descripcion,
        activo,
        created_at,
        updated_at
      FROM cat_tipo_testigo_padrino 
      WHERE id_tipo_testigo_padrino = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Crear nuevo tipo
  static async crear(datos) {
    const { nombre, descripcion, activo = true } = datos;
    const query = `
      INSERT INTO cat_tipo_testigo_padrino (nombre, descripcion, activo)
      VALUES ($1, $2, $3)
      RETURNING id_tipo_testigo_padrino, nombre, descripcion, activo, created_at, updated_at
    `;
    const result = await pool.query(query, [nombre, descripcion, activo]);
    return result.rows[0];
  }

  // Actualizar tipo
  static async actualizar(id, datos) {
    const { nombre, descripcion, activo } = datos;
    const campos = [];
    const valores = [];
    let contador = 1;

    if (nombre !== undefined) {
      campos.push(`nombre = $${contador}`);
      valores.push(nombre);
      contador++;
    }
    if (descripcion !== undefined) {
      campos.push(`descripcion = $${contador}`);
      valores.push(descripcion);
      contador++;
    }
    if (activo !== undefined) {
      campos.push(`activo = $${contador}`);
      valores.push(activo);
      contador++;
    }

    if (campos.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    valores.push(id);
    const query = `
      UPDATE cat_tipo_testigo_padrino
      SET ${campos.join(', ')}
      WHERE id_tipo_testigo_padrino = $${contador}
      RETURNING id_tipo_testigo_padrino, nombre, descripcion, activo, created_at, updated_at
    `;
    const result = await pool.query(query, valores);
    return result.rows[0];
  }

  // Eliminar tipo (soft delete)
  static async eliminar(id) {
    const query = `
      UPDATE cat_tipo_testigo_padrino
      SET activo = false
      WHERE id_tipo_testigo_padrino = $1
      RETURNING id_tipo_testigo_padrino
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Eliminar permanentemente
  static async eliminarPermanente(id) {
    const query = `
      DELETE FROM cat_tipo_testigo_padrino
      WHERE id_tipo_testigo_padrino = $1
      RETURNING id_tipo_testigo_padrino
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Verificar si existe por nombre
  static async existePorNombre(nombre, excluirId = null) {
    let query = `
      SELECT COUNT(*) as total
      FROM cat_tipo_testigo_padrino
      WHERE nombre = $1 AND activo = true
    `;
    const valores = [nombre];
    
    if (excluirId) {
      query += ' AND id_tipo_testigo_padrino != $2';
      valores.push(excluirId);
    }
    
    const result = await pool.query(query, valores);
    return parseInt(result.rows[0].total) > 0;
  }

  // Obtener solo los activos (para selects)
  static async obtenerActivos() {
    const query = `
      SELECT 
        id_tipo_testigo_padrino as id,
        nombre as nombre
      FROM cat_tipo_testigo_padrino
      WHERE activo = true
      ORDER BY nombre ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  }
}

module.exports = CatTipoTestigoPadrinoModel;

