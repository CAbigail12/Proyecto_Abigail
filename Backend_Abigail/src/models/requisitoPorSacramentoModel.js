const { pool } = require('../config/db');

class RequisitoPorSacramentoModel {
  // Obtener todos los requisitos por sacramento con paginación
  static async obtenerTodos(pagina = 1, limite = 10, filtros = {}) {
    const offset = (pagina - 1) * limite;
    let query = `
      SELECT 
        rps.id_sacramento,
        rps.id_requisito,
        rps.obligatorio,
        rps.orden,
        rps.created_at,
        rps.updated_at,
        s.nombre as nombre_sacramento,
        r.nombre as nombre_requisito
      FROM requisito_por_sacramento rps
      INNER JOIN cat_sacramento s ON rps.id_sacramento = s.id_sacramento
      INNER JOIN cat_requisito r ON rps.id_requisito = r.id_requisito
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 0;

    // Aplicar filtros
    if (filtros.id_sacramento) {
      paramCount++;
      query += ` AND rps.id_sacramento = $${paramCount}`;
      params.push(filtros.id_sacramento);
    }

    if (filtros.id_requisito) {
      paramCount++;
      query += ` AND rps.id_requisito = $${paramCount}`;
      params.push(filtros.id_requisito);
    }

    if (filtros.obligatorio !== undefined && filtros.obligatorio !== '') {
      paramCount++;
      query += ` AND rps.obligatorio = $${paramCount}`;
      params.push(filtros.obligatorio === 'true');
    }

    if (filtros.busqueda) {
      paramCount++;
      query += ` AND (s.nombre ILIKE $${paramCount} OR r.nombre ILIKE $${paramCount})`;
      params.push(`%${filtros.busqueda}%`);
    }

    // Ordenar por sacramento y orden
    query += ` ORDER BY s.nombre ASC, rps.orden ASC`;

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
    let query = `
      SELECT COUNT(*) as total 
      FROM requisito_por_sacramento rps
      INNER JOIN cat_sacramento s ON rps.id_sacramento = s.id_sacramento
      INNER JOIN cat_requisito r ON rps.id_requisito = r.id_requisito
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (filtros.id_sacramento) {
      paramCount++;
      query += ` AND rps.id_sacramento = $${paramCount}`;
      params.push(filtros.id_sacramento);
    }

    if (filtros.id_requisito) {
      paramCount++;
      query += ` AND rps.id_requisito = $${paramCount}`;
      params.push(filtros.id_requisito);
    }

    if (filtros.obligatorio !== undefined && filtros.obligatorio !== '') {
      paramCount++;
      query += ` AND rps.obligatorio = $${paramCount}`;
      params.push(filtros.obligatorio === 'true');
    }

    if (filtros.busqueda) {
      paramCount++;
      query += ` AND (s.nombre ILIKE $${paramCount} OR r.nombre ILIKE $${paramCount})`;
      params.push(`%${filtros.busqueda}%`);
    }

    const result = await pool.query(query, params);
    return parseInt(result.rows[0].total);
  }

  // Obtener por IDs compuestos
  static async obtenerPorIds(idSacramento, idRequisito) {
    const query = `
      SELECT 
        rps.id_sacramento,
        rps.id_requisito,
        rps.obligatorio,
        rps.orden,
        rps.created_at,
        rps.updated_at,
        s.nombre as nombre_sacramento,
        r.nombre as nombre_requisito
      FROM requisito_por_sacramento rps
      INNER JOIN cat_sacramento s ON rps.id_sacramento = s.id_sacramento
      INNER JOIN cat_requisito r ON rps.id_requisito = r.id_requisito
      WHERE rps.id_sacramento = $1 AND rps.id_requisito = $2
    `;
    const result = await pool.query(query, [idSacramento, idRequisito]);
    return result.rows[0];
  }

  // Crear nueva relación requisito-sacramento
  static async crear(datos) {
    const { id_sacramento, id_requisito, obligatorio = true, orden } = datos;
    const query = `
      INSERT INTO requisito_por_sacramento (id_sacramento, id_requisito, obligatorio, orden)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await pool.query(query, [id_sacramento, id_requisito, obligatorio, orden]);
    return result.rows[0];
  }

  // Actualizar relación requisito-sacramento
  static async actualizar(idSacramento, idRequisito, datos) {
    const { obligatorio, orden } = datos;
    const query = `
      UPDATE requisito_por_sacramento 
      SET obligatorio = $1, orden = $2, updated_at = NOW()
      WHERE id_sacramento = $3 AND id_requisito = $4
      RETURNING *
    `;
    const result = await pool.query(query, [obligatorio, orden, idSacramento, idRequisito]);
    return result.rows[0];
  }

  // Eliminar relación requisito-sacramento
  static async eliminar(idSacramento, idRequisito) {
    const query = `
      DELETE FROM requisito_por_sacramento 
      WHERE id_sacramento = $1 AND id_requisito = $2
    `;
    const result = await pool.query(query, [idSacramento, idRequisito]);
    return result.rowCount > 0;
  }

  // Verificar si existe la relación
  static async existeRelacion(idSacramento, idRequisito) {
    const query = `
      SELECT id_sacramento, id_requisito 
      FROM requisito_por_sacramento 
      WHERE id_sacramento = $1 AND id_requisito = $2
    `;
    const result = await pool.query(query, [idSacramento, idRequisito]);
    return result.rows.length > 0;
  }

  // Obtener requisitos por sacramento
  static async obtenerRequisitosPorSacramento(idSacramento) {
    const query = `
      SELECT 
        rps.id_requisito,
        rps.obligatorio,
        rps.orden,
        r.nombre as nombre_requisito,
        r.descripcion as descripcion_requisito
      FROM requisito_por_sacramento rps
      INNER JOIN cat_requisito r ON rps.id_requisito = r.id_requisito
      WHERE rps.id_sacramento = $1 AND r.activo = true
      ORDER BY rps.orden ASC, r.nombre ASC
    `;
    const result = await pool.query(query, [idSacramento]);
    return result.rows;
  }

  // Obtener sacramentos por requisito
  static async obtenerSacramentosPorRequisito(idRequisito) {
    const query = `
      SELECT 
        rps.id_sacramento,
        rps.obligatorio,
        rps.orden,
        s.nombre as nombre_sacramento,
        s.descripcion as descripcion_sacramento
      FROM requisito_por_sacramento rps
      INNER JOIN cat_sacramento s ON rps.id_sacramento = s.id_sacramento
      WHERE rps.id_requisito = $1 AND s.activo = true
      ORDER BY s.nombre ASC
    `;
    const result = await pool.query(query, [idRequisito]);
    return result.rows;
  }

  // Obtener el siguiente orden para un sacramento
  static async obtenerSiguienteOrden(idSacramento) {
    const query = `
      SELECT COALESCE(MAX(orden), 0) + 1 as siguiente_orden
      FROM requisito_por_sacramento 
      WHERE id_sacramento = $1
    `;
    const result = await pool.query(query, [idSacramento]);
    return result.rows[0].siguiente_orden;
  }
}

module.exports = RequisitoPorSacramentoModel;
