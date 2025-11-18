const { pool } = require('../config/db');

class ConstanciaExternaModel {
  // Obtener todas las constancias externas con filtros y paginación
  static async obtenerTodos(filtros = {}, paginacion = {}) {
    const cliente = await pool.connect();
    try {
      let whereClause = 'WHERE ce.activo = true';
      const parametros = [];
      let contadorParametros = 1;

      // Filtros
      if (filtros.id_feligres) {
        whereClause += ` AND ce.id_feligres = $${contadorParametros}`;
        parametros.push(filtros.id_feligres);
        contadorParametros++;
      }

      if (filtros.id_sacramento) {
        whereClause += ` AND ce.id_sacramento = $${contadorParametros}`;
        parametros.push(filtros.id_sacramento);
        contadorParametros++;
      }

      if (filtros.busqueda) {
        const busquedaParam = `%${filtros.busqueda}%`;
        whereClause += ` AND (
          f.primer_nombre ILIKE $${contadorParametros} OR
          f.segundo_nombre ILIKE $${contadorParametros} OR
          f.primer_apellido ILIKE $${contadorParametros} OR
          f.segundo_apellido ILIKE $${contadorParametros} OR
          cs.nombre ILIKE $${contadorParametros} OR
          ce.libro ILIKE $${contadorParametros} OR
          ce.folio ILIKE $${contadorParametros}
        )`;
        parametros.push(busquedaParam);
        contadorParametros++;
      }

      // Paginación
      const limite = paginacion.limite || 10;
      const pagina = paginacion.pagina || 1;
      const offset = (pagina - 1) * limite;

      // Query principal
      const query = `
        SELECT 
          ce.id_constancia_externa,
          ce.id_feligres,
          ce.id_sacramento,
          ce.libro,
          ce.folio,
          ce.descripcion,
          ce.activo,
          ce.created_at,
          ce.updated_at,
          f.primer_nombre || ' ' || COALESCE(f.segundo_nombre || ' ', '') || 
          f.primer_apellido || ' ' || COALESCE(f.segundo_apellido, '') as nombre_feligres_completo,
          cs.nombre as nombre_sacramento
        FROM constancias_externas_sacramentos ce
        INNER JOIN feligres f ON ce.id_feligres = f.id_feligres
        INNER JOIN cat_sacramento cs ON ce.id_sacramento = cs.id_sacramento
        ${whereClause}
        ORDER BY ce.created_at DESC
        LIMIT $${contadorParametros} OFFSET $${contadorParametros + 1}
      `;
      parametros.push(limite, offset);

      const resultado = await cliente.query(query, parametros);

      // Query para contar total
      const queryCount = `
        SELECT COUNT(*) as total
        FROM constancias_externas_sacramentos ce
        INNER JOIN feligres f ON ce.id_feligres = f.id_feligres
        INNER JOIN cat_sacramento cs ON ce.id_sacramento = cs.id_sacramento
        ${whereClause}
      `;
      const countParametros = parametros.slice(0, -2); // Excluir limite y offset
      const resultadoCount = await cliente.query(queryCount, countParametros);
      const total = parseInt(resultadoCount.rows[0].total);

      return {
        datos: resultado.rows,
        paginacion: {
          total,
          pagina,
          limite,
          totalPaginas: Math.ceil(total / limite)
        }
      };
    } finally {
      cliente.release();
    }
  }

  // Obtener constancia externa por ID
  static async obtenerPorId(idConstanciaExterna) {
    const query = `
      SELECT 
        ce.id_constancia_externa,
        ce.id_feligres,
        ce.id_sacramento,
        ce.libro,
        ce.folio,
        ce.descripcion,
        ce.activo,
        ce.created_at,
        ce.updated_at,
        f.primer_nombre || ' ' || COALESCE(f.segundo_nombre || ' ', '') || 
        f.primer_apellido || ' ' || COALESCE(f.segundo_apellido, '') as nombre_feligres_completo,
        cs.nombre as nombre_sacramento
      FROM constancias_externas_sacramentos ce
      INNER JOIN feligres f ON ce.id_feligres = f.id_feligres
      INNER JOIN cat_sacramento cs ON ce.id_sacramento = cs.id_sacramento
      WHERE ce.id_constancia_externa = $1 AND ce.activo = true
    `;
    const result = await pool.query(query, [idConstanciaExterna]);
    return result.rows[0] || null;
  }

  // Obtener constancia externa por feligrés y sacramento (para validación rápida)
  static async obtenerPorFeligresYSacramento(idFeligres, idSacramento) {
    const query = `
      SELECT 
        ce.id_constancia_externa,
        ce.id_feligres,
        ce.id_sacramento,
        ce.libro,
        ce.folio,
        ce.descripcion
      FROM constancias_externas_sacramentos ce
      WHERE ce.id_feligres = $1 
        AND ce.id_sacramento = $2 
        AND ce.activo = true
      LIMIT 1
    `;
    const result = await pool.query(query, [idFeligres, idSacramento]);
    return result.rows[0] || null;
  }

  // Crear nueva constancia externa
  static async crear(datos) {
    const query = `
      INSERT INTO constancias_externas_sacramentos 
        (id_feligres, id_sacramento, libro, folio, descripcion)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id_constancia_externa
    `;
    const result = await pool.query(query, [
      datos.id_feligres,
      datos.id_sacramento,
      datos.libro,
      datos.folio,
      datos.descripcion || null
    ]);
    return { id_constancia_externa: result.rows[0].id_constancia_externa };
  }

  // Actualizar constancia externa
  static async actualizar(idConstanciaExterna, datos) {
    const query = `
      UPDATE constancias_externas_sacramentos 
      SET 
        id_feligres = $1,
        id_sacramento = $2,
        libro = $3,
        folio = $4,
        descripcion = $5
      WHERE id_constancia_externa = $6 AND activo = true
      RETURNING id_constancia_externa
    `;
    const result = await pool.query(query, [
      datos.id_feligres,
      datos.id_sacramento,
      datos.libro,
      datos.folio,
      datos.descripcion || null,
      idConstanciaExterna
    ]);
    return result.rows[0] || null;
  }

  // Eliminar constancia externa (soft delete)
  static async eliminar(idConstanciaExterna) {
    const query = `
      UPDATE constancias_externas_sacramentos 
      SET activo = false
      WHERE id_constancia_externa = $1 AND activo = true
      RETURNING id_constancia_externa
    `;
    const result = await pool.query(query, [idConstanciaExterna]);
    return result.rows[0] || null;
  }
}

module.exports = ConstanciaExternaModel;

