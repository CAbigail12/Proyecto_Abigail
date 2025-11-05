const { pool } = require('../config/db');

class CatComunidadModel {
  // Obtener todas las comunidades (sin filtros ni paginación - se aplican en el frontend)
  static async obtenerTodos(pagina = 1, limite = 10, filtros = {}) {
    // El backend siempre devuelve TODAS las comunidades
    // Los filtros y paginación se aplican en el frontend
    const query = `
      SELECT 
        id_comunidad,
        nombre,
        descripcion,
        activo,
        created_at,
        updated_at
      FROM cat_comunidad
      ORDER BY nombre ASC
    `;

    const result = await pool.query(query);
    return result.rows;
  }

  // Contar total de registros (ya no se usa, pero se mantiene por compatibilidad)
  static async contar(filtros = {}) {
    const query = 'SELECT COUNT(*) as total FROM cat_comunidad';
    const result = await pool.query(query);
    return parseInt(result.rows[0].total);
  }

  // Obtener por ID
  static async obtenerPorId(id) {
    const query = `
      SELECT 
        id_comunidad,
        nombre,
        descripcion,
        activo,
        created_at,
        updated_at
      FROM cat_comunidad 
      WHERE id_comunidad = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Crear nueva comunidad
  static async crear(datos) {
    const { nombre, descripcion, activo = true } = datos;
    const query = `
      INSERT INTO cat_comunidad (nombre, descripcion, activo)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await pool.query(query, [nombre, descripcion, activo]);
    return result.rows[0];
  }

  // Actualizar comunidad
  static async actualizar(id, datos) {
    const { nombre, descripcion, activo } = datos;
    const query = `
      UPDATE cat_comunidad 
      SET nombre = $1, descripcion = $2, activo = $3, updated_at = NOW()
      WHERE id_comunidad = $4
      RETURNING *
    `;
    const result = await pool.query(query, [nombre, descripcion, activo, id]);
    return result.rows[0];
  }

  // Eliminar comunidad (soft delete)
  static async eliminar(id) {
    const query = `
      UPDATE cat_comunidad 
      SET activo = false, updated_at = NOW()
      WHERE id_comunidad = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Eliminar permanentemente
  static async eliminarPermanente(id) {
    const query = 'DELETE FROM cat_comunidad WHERE id_comunidad = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount > 0;
  }

  // Verificar si existe por nombre
  static async existePorNombre(nombre, excluirId = null) {
    let query = 'SELECT id_comunidad FROM cat_comunidad WHERE nombre = $1';
    const params = [nombre];
    
    if (excluirId) {
      query += ' AND id_comunidad != $2';
      params.push(excluirId);
    }
    
    const result = await pool.query(query, params);
    return result.rows.length > 0;
  }

  // Obtener todas las comunidades activas (para selects)
  static async obtenerActivas() {
    const query = `
      SELECT id_comunidad, nombre, descripcion
      FROM cat_comunidad 
      WHERE activo = true 
      ORDER BY nombre ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  }
}

module.exports = CatComunidadModel;
