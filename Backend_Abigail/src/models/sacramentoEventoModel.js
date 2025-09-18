const { pool } = require('../config/db');
const { crearError } = require('../utils/errorHandler');

class SacramentoEventoModel {
  // Obtener todos los eventos con filtros y paginación
  static async obtenerEventos(filtros = {}) {
    const {
      busqueda = '',
      id_sacramento = '',
      pagina = 1,
      limite = 10
    } = filtros;

    const offset = (pagina - 1) * limite;

    let query = `
      SELECT 
        e.id_evento,
        f1.primer_nombre || ' ' || f1.primer_apellido AS feligres_principal,
        f2.primer_nombre || ' ' || f2.primer_apellido AS feligres_pareja,
        s.nombre AS sacramento,
        e.estado_pago,
        e.estado_ceremonia,
        e.fecha_evento
      FROM sacramento_evento e
      INNER JOIN feligres f1 ON e.id_feligres = f1.id_feligres
      LEFT JOIN feligres f2 ON e.id_feligres_pareja = f2.id_feligres
      INNER JOIN cat_sacramento s ON e.id_sacramento = s.id_sacramento
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 0;

    // Filtro búsqueda por nombre de feligrés principal o pareja
    if (busqueda) {
      paramCount++;
      query += ` AND (
        f1.primer_nombre ILIKE $${paramCount} OR
        f1.primer_apellido ILIKE $${paramCount} OR
        f2.primer_nombre ILIKE $${paramCount} OR
        f2.primer_apellido ILIKE $${paramCount}
      )`;
      params.push(`%${busqueda}%`);
    }

    // Filtro por tipo de sacramento
    if (id_sacramento) {
      paramCount++;
      query += ` AND e.id_sacramento = $${paramCount}`;
      params.push(id_sacramento);
    }

    // Ordenamiento
    query += ` ORDER BY e.fecha_evento DESC`;

    // Paginación
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(limite);

    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(offset);

    // Query para contar total de registros
    let countQuery = `
      SELECT COUNT(*) as total
      FROM sacramento_evento e
      INNER JOIN feligres f1 ON e.id_feligres = f1.id_feligres
      LEFT JOIN feligres f2 ON e.id_feligres_pareja = f2.id_feligres
      INNER JOIN cat_sacramento s ON e.id_sacramento = s.id_sacramento
      WHERE 1=1
    `;

    const countParams = [];
    let countParamCount = 0;

    if (busqueda) {
      countParamCount++;
      countQuery += ` AND (
        f1.primer_nombre ILIKE $${countParamCount} OR
        f1.primer_apellido ILIKE $${countParamCount} OR
        f2.primer_nombre ILIKE $${countParamCount} OR
        f2.primer_apellido ILIKE $${countParamCount}
      )`;
      countParams.push(`%${busqueda}%`);
    }

    if (id_sacramento) {
      countParamCount++;
      countQuery += ` AND e.id_sacramento = $${countParamCount}`;
      countParams.push(id_sacramento);
    }

    try {
      const [resultados, conteo] = await Promise.all([
        pool.query(query, params),
        pool.query(countQuery, countParams)
      ]);

      const total = parseInt(conteo.rows[0].total);
      const totalPaginas = Math.ceil(total / limite);

      return {
        datos: resultados.rows,
        paginacion: {
          pagina_actual: parseInt(pagina),
          total_paginas: totalPaginas,
          total_registros: total,
          limite: parseInt(limite)
        }
      };
    } catch (error) {
      throw crearError(`Error al obtener eventos: ${error.message}`, 500, error);
    }
  }

  // Obtener un evento por ID
  static async obtenerPorId(id_evento) {
    const query = `
      SELECT 
        e.id_evento,
        f1.primer_nombre || ' ' || f1.primer_apellido AS feligres_principal,
        f2.primer_nombre || ' ' || f2.primer_apellido AS feligres_pareja,
        s.nombre AS sacramento,
        e.estado_pago,
        e.estado_ceremonia,
        e.fecha_evento
      FROM sacramento_evento e
      INNER JOIN feligres f1 ON e.id_feligres = f1.id_feligres
      LEFT JOIN feligres f2 ON e.id_feligres_pareja = f2.id_feligres
      INNER JOIN cat_sacramento s ON e.id_sacramento = s.id_sacramento
      WHERE e.id_evento = $1
    `;

    try {
      const resultado = await pool.query(query, [id_evento]);
      return resultado.rows[0];
    } catch (error) {
      throw crearError(`Error al obtener evento por ID: ${error.message}`, 500, error);
    }
  }

  // Crear un nuevo evento
  static async crear(datos) {
    const query = `
      INSERT INTO sacramento_evento (
        id_feligres, id_sacramento, id_feligres_pareja,
        estado_pago, estado_ceremonia, fecha_evento
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const valores = [
      datos.id_feligres,
      datos.id_sacramento,
      datos.id_feligres_pareja || null,
      datos.estado_pago || null,
      datos.estado_ceremonia || null,
      datos.fecha_evento
    ];

    try {
      const resultado = await pool.query(query, valores);
      return resultado.rows[0];
    } catch (error) {
      throw crearError(`Error al crear evento: ${error.message}`, 500, error);
    }
  }

  // Actualizar un evento
  static async actualizar(id_evento, datos) {
    const campos = [];
    const valores = [];
    let paramCount = 0;

    Object.keys(datos).forEach(campo => {
      if (datos[campo] !== undefined) {
        paramCount++;
        campos.push(`${campo} = $${paramCount}`);
        valores.push(datos[campo]);
      }
    });

    if (campos.length === 0) {
      throw crearError('No hay campos para actualizar', 400);
    }

    paramCount++;
    campos.push(`updated_at = NOW()`);
    valores.push(id_evento);

    const query = `
      UPDATE sacramento_evento
      SET ${campos.join(', ')}
      WHERE id_evento = $${paramCount}
      RETURNING *;
    `;

    try {
      const resultado = await pool.query(query, valores);
      return resultado.rows[0];
    } catch (error) {
      throw crearError(`Error al actualizar evento: ${error.message}`, 500, error);
    }
  }

  // Eliminar un evento (borrado físico)
  static async eliminar(id_evento) {
    const query = `
      DELETE FROM sacramento_evento
      WHERE id_evento = $1
      RETURNING *;
    `;

    try {
      const resultado = await pool.query(query, [id_evento]);
      return resultado.rows[0];
    } catch (error) {
      throw crearError(`Error al eliminar evento: ${error.message}`, 500, error);
    }
  }

  // Obtener sacramentos para combos
  static async obtenerSacramentos() {
    const query = `
      SELECT id_sacramento, nombre
      FROM cat_sacramento
      ORDER BY nombre;
    `;

    try {
      const resultado = await pool.query(query);
      return resultado.rows;
    } catch (error) {
      throw crearError(`Error al obtener sacramentos: ${error.message}`, 500, error);
    }
  }
}

module.exports = SacramentoEventoModel;


