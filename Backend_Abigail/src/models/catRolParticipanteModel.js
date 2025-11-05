const { pool } = require('../config/db');

class CatRolParticipanteModel {
  // Obtener todos los roles de participante (sin filtros ni paginación - se aplican en el frontend)
  static async obtenerTodos(pagina = 1, limite = 10, filtros = {}) {
    // El backend siempre devuelve TODOS los roles de participante
    // Los filtros y paginación se aplican en el frontend
    const query = `
      SELECT 
        id_rol_participante,
        nombre,
        descripcion,
        activo,
        created_at,
        updated_at
      FROM cat_rol_participante
      ORDER BY nombre ASC
    `;

    const result = await pool.query(query);
    return result.rows;
  }

  // Contar total de registros (ya no se usa, pero se mantiene por compatibilidad)
  static async contar(filtros = {}) {
    const query = 'SELECT COUNT(*) as total FROM cat_rol_participante';
    const result = await pool.query(query);
    return parseInt(result.rows[0].total);
  }

  // Obtener por ID
  static async obtenerPorId(id) {
    const query = `
      SELECT 
        id_rol_participante,
        nombre,
        descripcion,
        activo,
        created_at,
        updated_at
      FROM cat_rol_participante 
      WHERE id_rol_participante = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Crear nuevo rol de participante
  static async crear(datos) {
    const { nombre, descripcion, activo = true } = datos;
    const query = `
      INSERT INTO cat_rol_participante (nombre, descripcion, activo)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await pool.query(query, [nombre, descripcion, activo]);
    return result.rows[0];
  }

  // Actualizar rol de participante
  static async actualizar(id, datos) {
    const { nombre, descripcion, activo } = datos;
    const query = `
      UPDATE cat_rol_participante 
      SET nombre = $1, descripcion = $2, activo = $3, updated_at = NOW()
      WHERE id_rol_participante = $4
      RETURNING *
    `;
    const result = await pool.query(query, [nombre, descripcion, activo, id]);
    return result.rows[0];
  }

  // Eliminar rol de participante (soft delete)
  static async eliminar(id) {
    const query = `
      UPDATE cat_rol_participante 
      SET activo = false, updated_at = NOW()
      WHERE id_rol_participante = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Eliminar permanentemente
  static async eliminarPermanente(id) {
    const query = 'DELETE FROM cat_rol_participante WHERE id_rol_participante = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount > 0;
  }

  // Verificar si existe por nombre
  static async existePorNombre(nombre, excluirId = null) {
    let query = 'SELECT id_rol_participante FROM cat_rol_participante WHERE nombre = $1';
    const params = [nombre];
    
    if (excluirId) {
      query += ' AND id_rol_participante != $2';
      params.push(excluirId);
    }
    
    const result = await pool.query(query, params);
    return result.rows.length > 0;
  }

  // Obtener todos los roles de participante activos (para selects)
  static async obtenerActivos() {
    const query = `
      SELECT id_rol_participante, nombre, descripcion
      FROM cat_rol_participante 
      WHERE activo = true 
      ORDER BY nombre ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  }
}

module.exports = CatRolParticipanteModel;
