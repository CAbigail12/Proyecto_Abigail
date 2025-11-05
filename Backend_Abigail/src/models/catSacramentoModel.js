const { pool } = require('../config/db');

class CatSacramentoModel {
  // Obtener todos los sacramentos (sin filtros ni paginación - se aplican en el frontend)
  static async obtenerTodos(pagina = 1, limite = 10, filtros = {}) {
    // El backend siempre devuelve TODOS los sacramentos
    // Los filtros y paginación se aplican en el frontend
    const query = `
      SELECT 
        id_sacramento,
        nombre,
        descripcion,
        activo,
        created_at,
        updated_at
      FROM cat_sacramento
      ORDER BY nombre ASC
    `;

    const result = await pool.query(query);
    return result.rows;
  }

  // Contar total de registros (ya no se usa, pero se mantiene por compatibilidad)
  static async contar(filtros = {}) {
    const query = 'SELECT COUNT(*) as total FROM cat_sacramento';
    const result = await pool.query(query);
    return parseInt(result.rows[0].total);
  }

  // Obtener por ID
  static async obtenerPorId(id) {
    const query = `
      SELECT 
        id_sacramento,
        nombre,
        descripcion,
        activo,
        created_at,
        updated_at
      FROM cat_sacramento 
      WHERE id_sacramento = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Crear nuevo sacramento
  static async crear(datos) {
    const { nombre, descripcion, activo = true } = datos;
    const query = `
      INSERT INTO cat_sacramento (nombre, descripcion, activo)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await pool.query(query, [nombre, descripcion, activo]);
    return result.rows[0];
  }

  // Actualizar sacramento
  static async actualizar(id, datos) {
    const { nombre, descripcion, activo } = datos;
    const query = `
      UPDATE cat_sacramento 
      SET nombre = $1, descripcion = $2, activo = $3, updated_at = NOW()
      WHERE id_sacramento = $4
      RETURNING *
    `;
    const result = await pool.query(query, [nombre, descripcion, activo, id]);
    return result.rows[0];
  }

  // Eliminar sacramento (soft delete)
  static async eliminar(id) {
    const query = `
      UPDATE cat_sacramento 
      SET activo = false, updated_at = NOW()
      WHERE id_sacramento = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Eliminar permanentemente
  static async eliminarPermanente(id) {
    const query = 'DELETE FROM cat_sacramento WHERE id_sacramento = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount > 0;
  }

  // Verificar si existe por nombre
  static async existePorNombre(nombre, excluirId = null) {
    let query = 'SELECT id_sacramento FROM cat_sacramento WHERE nombre = $1';
    const params = [nombre];
    
    if (excluirId) {
      query += ' AND id_sacramento != $2';
      params.push(excluirId);
    }
    
    const result = await pool.query(query, params);
    return result.rows.length > 0;
  }

  // Obtener todos los sacramentos activos (para selects)
  static async obtenerActivos() {
    const query = `
      SELECT id_sacramento, nombre, descripcion
      FROM cat_sacramento 
      WHERE activo = true 
      ORDER BY nombre ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  }
}

module.exports = CatSacramentoModel;
