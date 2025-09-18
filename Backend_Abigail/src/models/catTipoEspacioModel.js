const { pool } = require('../config/db');

class CatTipoEspacioModel {
  // Obtener todos los tipos de espacio con paginación
  static async obtenerTodos(pagina = 1, limite = 10, filtros = {}) {
    const offset = (pagina - 1) * limite;
    let query = `
      SELECT 
        id_tipo_espacio,
        nombre,
        descripcion,
        activo,
        created_at,
        updated_at
      FROM cat_tipo_espacio
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 0;

    // Aplicar filtros
    if (filtros.busqueda) {
      paramCount++;
      query += ` AND (nombre ILIKE $${paramCount} OR descripcion ILIKE $${paramCount})`;
      params.push(`%${filtros.busqueda}%`);
    }

    if (filtros.activo !== undefined && filtros.activo !== '') {
      paramCount++;
      query += ` AND activo = $${paramCount}`;
      params.push(filtros.activo === 'true');
    }

    // Ordenar por nombre
    query += ` ORDER BY nombre ASC`;

    // Agregar paginación
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(limite);
    
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(offset);

    const result = await pool.query(query, params);
    return result.rows;
  }

  // Contar total de registros
  static async contar(filtros = {}) {
    let query = 'SELECT COUNT(*) as total FROM cat_tipo_espacio WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (filtros.busqueda) {
      paramCount++;
      query += ` AND (nombre ILIKE $${paramCount} OR descripcion ILIKE $${paramCount})`;
      params.push(`%${filtros.busqueda}%`);
    }

    if (filtros.activo !== undefined && filtros.activo !== '') {
      paramCount++;
      query += ` AND activo = $${paramCount}`;
      params.push(filtros.activo === 'true');
    }

    const result = await pool.query(query, params);
    return parseInt(result.rows[0].total);
  }

  // Obtener por ID
  static async obtenerPorId(id) {
    const query = `
      SELECT 
        id_tipo_espacio,
        nombre,
        descripcion,
        activo,
        created_at,
        updated_at
      FROM cat_tipo_espacio 
      WHERE id_tipo_espacio = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Crear nuevo tipo de espacio
  static async crear(datos) {
    const { nombre, descripcion, activo = true } = datos;
    const query = `
      INSERT INTO cat_tipo_espacio (nombre, descripcion, activo)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await pool.query(query, [nombre, descripcion, activo]);
    return result.rows[0];
  }

  // Actualizar tipo de espacio
  static async actualizar(id, datos) {
    const { nombre, descripcion, activo } = datos;
    const query = `
      UPDATE cat_tipo_espacio 
      SET nombre = $1, descripcion = $2, activo = $3, updated_at = NOW()
      WHERE id_tipo_espacio = $4
      RETURNING *
    `;
    const result = await pool.query(query, [nombre, descripcion, activo, id]);
    return result.rows[0];
  }

  // Eliminar tipo de espacio (soft delete)
  static async eliminar(id) {
    const query = `
      UPDATE cat_tipo_espacio 
      SET activo = false, updated_at = NOW()
      WHERE id_tipo_espacio = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Eliminar permanentemente
  static async eliminarPermanente(id) {
    const query = 'DELETE FROM cat_tipo_espacio WHERE id_tipo_espacio = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount > 0;
  }

  // Verificar si existe por nombre
  static async existePorNombre(nombre, excluirId = null) {
    let query = 'SELECT id_tipo_espacio FROM cat_tipo_espacio WHERE nombre = $1';
    const params = [nombre];
    
    if (excluirId) {
      query += ' AND id_tipo_espacio != $2';
      params.push(excluirId);
    }
    
    const result = await pool.query(query, params);
    return result.rows.length > 0;
  }

  // Obtener todos los tipos de espacio activos (para selects)
  static async obtenerActivos() {
    const query = `
      SELECT id_tipo_espacio, nombre, descripcion
      FROM cat_tipo_espacio 
      WHERE activo = true 
      ORDER BY nombre ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  }
}

module.exports = CatTipoEspacioModel;
