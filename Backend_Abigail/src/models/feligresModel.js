const { pool } = require('../config/db');

class FeligresModel {
  // Obtener todos los feligreses con filtros y paginación
  static async obtenerFeligreses(filtros = {}) {
    const {
      busqueda = '',
      activo = '',
      id_comunidad = '',
      pagina = 1,
      limite = 10
    } = filtros;

    const offset = (pagina - 1) * limite;
    
    let query = `
      SELECT 
        f.*,
        c.nombre as comunidad_nombre
      FROM feligres f
      LEFT JOIN cat_comunidad c ON f.id_comunidad = c.id_comunidad
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 0;

    // Filtro de búsqueda
    if (busqueda) {
      paramCount++;
      query += ` AND (
        f.primer_nombre ILIKE $${paramCount} OR 
        f.segundo_nombre ILIKE $${paramCount} OR 
        f.primer_apellido ILIKE $${paramCount} OR 
        f.segundo_apellido ILIKE $${paramCount} OR
        CONCAT(f.primer_nombre, ' ', f.primer_apellido) ILIKE $${paramCount}
      )`;
      params.push(`%${busqueda}%`);
    }

    // Filtro de estado activo
    if (activo !== '') {
      paramCount++;
      query += ` AND f.activo = $${paramCount}`;
      params.push(activo === 'true');
    }

    // Filtro por comunidad
    if (id_comunidad) {
      paramCount++;
      query += ` AND f.id_comunidad = $${paramCount}`;
      params.push(id_comunidad);
    }

    // Ordenamiento
    query += ` ORDER BY f.primer_apellido, f.primer_nombre`;

    // Paginación
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(limite);

    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(offset);

    // Contar total de registros
    let countQuery = `
      SELECT COUNT(*) as total
      FROM feligres f
      WHERE 1=1
    `;
    
    const countParams = [];
    let countParamCount = 0;

    if (busqueda) {
      countParamCount++;
      countQuery += ` AND (
        f.primer_nombre ILIKE $${countParamCount} OR 
        f.segundo_nombre ILIKE $${countParamCount} OR 
        f.primer_apellido ILIKE $${countParamCount} OR 
        f.segundo_apellido ILIKE $${countParamCount} OR
        CONCAT(f.primer_nombre, ' ', f.primer_apellido) ILIKE $${countParamCount}
      )`;
      countParams.push(`%${busqueda}%`);
    }

    if (activo !== '') {
      countParamCount++;
      countQuery += ` AND f.activo = $${countParamCount}`;
      countParams.push(activo === 'true');
    }

    if (id_comunidad) {
      countParamCount++;
      countQuery += ` AND f.id_comunidad = $${countParamCount}`;
      countParams.push(id_comunidad);
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
      throw new Error(`Error al obtener feligreses: ${error.message}`);
    }
  }

  // Obtener un feligrés por ID
  static async obtenerFeligresPorId(id) {
    const query = `
      SELECT 
        f.*,
        c.nombre as comunidad_nombre
      FROM feligres f
      LEFT JOIN cat_comunidad c ON f.id_comunidad = c.id_comunidad
      WHERE f.id_feligres = $1
    `;
    
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al obtener feligrés: ${error.message}`);
    }
  }

  // Crear nuevo feligrés
  static async crearFeligres(datos) {
    const {
      primer_nombre,
      segundo_nombre,
      otros_nombres,
      primer_apellido,
      segundo_apellido,
      apellido_casada,
      fecha_nacimiento,
      sexo,
      nombre_padre,
      nombre_madre,
      departamento,
      municipio,
      id_comunidad,
      telefono,
      correo,
      direccion,
      comentarios,
      activo = true
    } = datos;

    const query = `
      INSERT INTO feligres (
        primer_nombre, segundo_nombre, otros_nombres,
        primer_apellido, segundo_apellido, apellido_casada,
        fecha_nacimiento, sexo, nombre_padre, nombre_madre,
        departamento, municipio, id_comunidad,
        telefono, correo, direccion, comentarios, activo
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18
      ) RETURNING *
    `;

    const params = [
      primer_nombre, segundo_nombre, otros_nombres,
      primer_apellido, segundo_apellido, apellido_casada,
      fecha_nacimiento, sexo, nombre_padre, nombre_madre,
      departamento, municipio, id_comunidad,
      telefono, correo, direccion, comentarios, activo
    ];

    try {
      const result = await pool.query(query, params);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al crear feligrés: ${error.message}`);
    }
  }

  // Actualizar feligrés
  static async actualizarFeligres(id, datos) {
    const campos = [];
    const valores = [];
    let paramCount = 0;

    // Construir dinámicamente la consulta UPDATE
    Object.keys(datos).forEach(campo => {
      if (datos[campo] !== undefined) {
        paramCount++;
        campos.push(`${campo} = $${paramCount}`);
        valores.push(datos[campo]);
      }
    });

    if (campos.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    // Agregar updated_at
    paramCount++;
    campos.push(`updated_at = $${paramCount}`);
    valores.push(new Date());

    // Agregar ID al final
    paramCount++;
    valores.push(id);

    const query = `
      UPDATE feligres 
      SET ${campos.join(', ')}
      WHERE id_feligres = $${paramCount}
      RETURNING *
    `;

    try {
      const result = await pool.query(query, valores);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al actualizar feligrés: ${error.message}`);
    }
  }

  // Eliminar feligrés (soft delete)
  static async eliminarFeligres(id) {
    const query = `
      UPDATE feligres 
      SET activo = false, updated_at = NOW()
      WHERE id_feligres = $1
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al eliminar feligrés: ${error.message}`);
    }
  }

  // Obtener comunidades para el select
  static async obtenerComunidades() {
    const query = `
      SELECT id_comunidad, nombre 
      FROM cat_comunidad 
      WHERE activo = true 
      ORDER BY nombre
    `;

    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw new Error(`Error al obtener comunidades: ${error.message}`);
    }
  }
}

module.exports = FeligresModel;
