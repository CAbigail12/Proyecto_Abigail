const { pool } = require('../config/db');

class CatTipoDocumentoModel {
  // Obtener todos los tipos de documento (sin filtros ni paginación - se aplican en el frontend)
  static async obtenerTodos(pagina = 1, limite = 10, filtros = {}) {
    // El backend siempre devuelve TODOS los tipos de documento
    // Los filtros y paginación se aplican en el frontend
    const query = `
      SELECT 
        id_tipo_documento,
        nombre,
        descripcion,
        activo,
        created_at,
        updated_at
      FROM cat_tipo_documento
      ORDER BY nombre ASC
    `;

    const result = await pool.query(query);
    return result.rows;
  }

  // Contar total de registros (ya no se usa, pero se mantiene por compatibilidad)
  static async contar(filtros = {}) {
    const query = 'SELECT COUNT(*) as total FROM cat_tipo_documento';
    const result = await pool.query(query);
    return parseInt(result.rows[0].total);
  }

  // Obtener por ID
  static async obtenerPorId(id) {
    const query = `
      SELECT 
        id_tipo_documento,
        nombre,
        descripcion,
        activo,
        created_at,
        updated_at
      FROM cat_tipo_documento 
      WHERE id_tipo_documento = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Crear nuevo tipo de documento
  static async crear(datos) {
    const { nombre, descripcion, activo = true } = datos;
    const query = `
      INSERT INTO cat_tipo_documento (nombre, descripcion, activo)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await pool.query(query, [nombre, descripcion, activo]);
    return result.rows[0];
  }

  // Actualizar tipo de documento
  static async actualizar(id, datos) {
    const { nombre, descripcion, activo } = datos;
    const query = `
      UPDATE cat_tipo_documento 
      SET nombre = $1, descripcion = $2, activo = $3, updated_at = NOW()
      WHERE id_tipo_documento = $4
      RETURNING *
    `;
    const result = await pool.query(query, [nombre, descripcion, activo, id]);
    return result.rows[0];
  }

  // Eliminar tipo de documento (soft delete)
  static async eliminar(id) {
    const query = `
      UPDATE cat_tipo_documento 
      SET activo = false, updated_at = NOW()
      WHERE id_tipo_documento = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Eliminar permanentemente
  static async eliminarPermanente(id) {
    const query = 'DELETE FROM cat_tipo_documento WHERE id_tipo_documento = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount > 0;
  }

  // Verificar si existe por nombre
  static async existePorNombre(nombre, excluirId = null) {
    let query = 'SELECT id_tipo_documento FROM cat_tipo_documento WHERE nombre = $1';
    const params = [nombre];
    
    if (excluirId) {
      query += ' AND id_tipo_documento != $2';
      params.push(excluirId);
    }
    
    const result = await pool.query(query, params);
    return result.rows.length > 0;
  }

  // Obtener todos los tipos de documento activos (para selects)
  static async obtenerActivos() {
    const query = `
      SELECT id_tipo_documento, nombre, descripcion
      FROM cat_tipo_documento 
      WHERE activo = true 
      ORDER BY nombre ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  }
}

module.exports = CatTipoDocumentoModel;
