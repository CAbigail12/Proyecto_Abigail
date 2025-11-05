const { pool } = require('../config/db');

class CatRequisitoModel {
  // Obtener todos los requisitos (sin filtros ni paginación - se aplican en el frontend)
  static async obtenerTodos(pagina = 1, limite = 10, filtros = {}) {
    // El backend siempre devuelve TODOS los requisitos
    // Los filtros y paginación se aplican en el frontend
    const query = `
      SELECT 
        id_requisito,
        nombre,
        descripcion,
        activo,
        created_at,
        updated_at
      FROM cat_requisito
      ORDER BY nombre ASC
    `;

    const result = await pool.query(query);
    return result.rows;
  }

  // Contar total de registros (ya no se usa, pero se mantiene por compatibilidad)
  static async contar(filtros = {}) {
    const query = 'SELECT COUNT(*) as total FROM cat_requisito';
    const result = await pool.query(query);
    return parseInt(result.rows[0].total);
  }

  // Obtener por ID
  static async obtenerPorId(id) {
    const query = `
      SELECT 
        id_requisito,
        nombre,
        descripcion,
        activo,
        created_at,
        updated_at
      FROM cat_requisito 
      WHERE id_requisito = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Crear nuevo requisito
  static async crear(datos) {
    const { nombre, descripcion, activo = true } = datos;
    const query = `
      INSERT INTO cat_requisito (nombre, descripcion, activo)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await pool.query(query, [nombre, descripcion, activo]);
    return result.rows[0];
  }

  // Actualizar requisito
  static async actualizar(id, datos) {
    const { nombre, descripcion, activo } = datos;
    const query = `
      UPDATE cat_requisito 
      SET nombre = $1, descripcion = $2, activo = $3, updated_at = NOW()
      WHERE id_requisito = $4
      RETURNING *
    `;
    const result = await pool.query(query, [nombre, descripcion, activo, id]);
    return result.rows[0];
  }

  // Eliminar requisito (soft delete)
  static async eliminar(id) {
    const query = `
      UPDATE cat_requisito 
      SET activo = false, updated_at = NOW()
      WHERE id_requisito = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Eliminar permanentemente
  static async eliminarPermanente(id) {
    const query = 'DELETE FROM cat_requisito WHERE id_requisito = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount > 0;
  }

  // Verificar si existe por nombre
  static async existePorNombre(nombre, excluirId = null) {
    let query = 'SELECT id_requisito FROM cat_requisito WHERE nombre = $1';
    const params = [nombre];
    
    if (excluirId) {
      query += ' AND id_requisito != $2';
      params.push(excluirId);
    }
    
    const result = await pool.query(query, params);
    return result.rows.length > 0;
  }

  // Obtener todos los requisitos activos (para selects)
  static async obtenerActivos() {
    const query = `
      SELECT id_requisito, nombre, descripcion
      FROM cat_requisito 
      WHERE activo = true 
      ORDER BY nombre ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  }
}

module.exports = CatRequisitoModel;
