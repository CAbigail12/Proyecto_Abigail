const { pool } = require('../config/db');
const TestigosPadrinosModel = require('./testigosPadrinosModel');

class SacramentoAsignacionModel {
  // Crear nueva asignación de sacramento
  static async crear(datos) {
    const cliente = await pool.connect();
    try {
      await cliente.query('BEGIN');
      
      // Insertar la asignación principal
      const queryAsignacion = `
        INSERT INTO sacramento_asignacion (id_sacramento, fecha_celebracion, pagado, monto_pagado, comentarios)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id_asignacion
      `;
      
      const resultadoAsignacion = await cliente.query(queryAsignacion, [
        datos.id_sacramento,
        datos.fecha_celebracion,
        datos.pagado || false,
        datos.monto_pagado || null,
        datos.comentarios || null
      ]);
      
      const idAsignacion = resultadoAsignacion.rows[0].id_asignacion;
      
      // Insertar participantes
      if (datos.participantes && datos.participantes.length > 0) {
        for (const participante of datos.participantes) {
          const queryParticipante = `
            INSERT INTO sacramento_participante (id_asignacion, id_feligres, id_rol_participante)
            VALUES ($1, $2, $3)
          `;
          await cliente.query(queryParticipante, [
            idAsignacion,
            participante.id_feligres,
            participante.id_rol_participante || null
          ]);
        }
      }
      
      // Insertar testigos/padrinos si existen
      if (datos.testigos_padrinos && datos.testigos_padrinos.length > 0) {
        const testigosPadrinosData = datos.testigos_padrinos.map(tp => ({
          id_asignacion: idAsignacion,
          id_feligres: tp.id_feligres,
          id_tipo_testigo_padrino: tp.id_tipo_testigo_padrino,
          numero_orden: tp.numero_orden || 1
        }));
        await TestigosPadrinosModel.crearMultiples(testigosPadrinosData);
      }
      
      await cliente.query('COMMIT');
      return { id_asignacion: idAsignacion };
    } catch (error) {
      await cliente.query('ROLLBACK');
      throw error;
    } finally {
      cliente.release();
    }
  }

  // Obtener todas las asignaciones con filtros (sin paginación - trae todos los datos)
  static async obtenerTodos(filtros = {}, paginacion = {}) {
    const cliente = await pool.connect();
    try {
      // Construir la parte WHERE de la consulta
      let whereClause = 'WHERE sa.activo = true';
      const parametros = [];
      let contadorParametros = 1;
      
      // Filtros
      if (filtros.id_sacramento) {
        whereClause += ` AND sa.id_sacramento = $${contadorParametros}`;
        parametros.push(filtros.id_sacramento);
        contadorParametros++;
      }
      
      if (filtros.fecha_desde) {
        whereClause += ` AND sa.fecha_celebracion >= $${contadorParametros}`;
        parametros.push(filtros.fecha_desde);
        contadorParametros++;
      }
      
      if (filtros.fecha_hasta) {
        whereClause += ` AND sa.fecha_celebracion <= $${contadorParametros}`;
        parametros.push(filtros.fecha_hasta);
        contadorParametros++;
      }
      
      if (filtros.pagado !== undefined && filtros.pagado !== '') {
        whereClause += ` AND sa.pagado = $${contadorParametros}`;
        parametros.push(filtros.pagado === 'true');
        contadorParametros++;
      }
      
      if (filtros.busqueda) {
        const busquedaParam = `%${filtros.busqueda}%`;
        whereClause += ` AND (
          cs.nombre ILIKE $${contadorParametros} OR
          f.primer_nombre ILIKE $${contadorParametros + 1} OR
          f.primer_apellido ILIKE $${contadorParametros + 2} OR
          sa.comentarios ILIKE $${contadorParametros + 3}
        )`;
        parametros.push(busquedaParam, busquedaParam, busquedaParam, busquedaParam);
        contadorParametros += 4;
      }
      
      // Consulta principal SIN paginación - trae todos los datos
      let consulta = `
        SELECT 
          sa.id_asignacion,
          sa.id_sacramento,
          sa.fecha_celebracion,
          sa.pagado,
          sa.monto_pagado,
          sa.comentarios,
          sa.activo,
          sa.created_at,
          sa.updated_at,
          cs.nombre as sacramento_nombre,
          cs.descripcion as sacramento_descripcion,
          COALESCE(
            array_agg(
              json_build_object(
                'id_feligres', f.id_feligres,
                'nombre_completo', CONCAT(f.primer_nombre, ' ', f.primer_apellido),
                'primer_nombre', f.primer_nombre,
                'primer_apellido', f.primer_apellido,
                'id_rol_participante', sp.id_rol_participante,
                'rol_nombre', crp.nombre
              )
            ) FILTER (WHERE f.id_feligres IS NOT NULL),
            ARRAY[]::json[]
          ) as participantes
        FROM sacramento_asignacion sa
        INNER JOIN cat_sacramento cs ON sa.id_sacramento = cs.id_sacramento
        LEFT JOIN sacramento_participante sp ON sa.id_asignacion = sp.id_asignacion
        LEFT JOIN feligres f ON sp.id_feligres = f.id_feligres
        LEFT JOIN cat_rol_participante crp ON sp.id_rol_participante = crp.id_rol_participante
        ${whereClause}
        GROUP BY sa.id_asignacion, sa.id_sacramento, sa.fecha_celebracion, sa.pagado, sa.monto_pagado, 
                 sa.comentarios, sa.activo, sa.created_at, sa.updated_at, cs.nombre, cs.descripcion
        ORDER BY sa.fecha_celebracion ASC, sa.created_at DESC
      `;
      
      console.log('🔍 Consulta SQL:', consulta);
      console.log('📋 Parámetros:', parametros);
      
      const resultado = await cliente.query(consulta, parametros);
      
      console.log('✅ Resultado obtenido:', resultado.rows.length, 'asignaciones (todas sin paginación)');
      
      // Obtener testigos/padrinos para cada asignación
      const asignacionesConTestigos = await Promise.all(
        resultado.rows.map(async (asignacion) => {
          const testigosPadrinos = await TestigosPadrinosModel.obtenerPorAsignacion(asignacion.id_asignacion);
          return {
            ...asignacion,
            testigos_padrinos: testigosPadrinos
          };
        })
      );
      
      // Devolver todos los datos con información de paginación para el frontend
      // (aunque no se aplicó paginación en el backend)
      const total = asignacionesConTestigos.length;
      const pagina = paginacion.pagina || 1;
      const limite = paginacion.limite || 10;
      const totalPaginas = Math.ceil(total / limite);
      
      return {
        asignaciones: asignacionesConTestigos,
        total: total,
        pagina: pagina,
        limite: limite,
        totalPaginas: totalPaginas
      };
    } catch (error) {
      console.error('❌ Error en obtenerTodos:', error);
      console.error('Stack:', error.stack);
      throw error;
    } finally {
      cliente.release();
    }
  }

  // Obtener asignación por ID
  static async obtenerPorId(idAsignacion) {
    const cliente = await pool.connect();
    try {
      const consulta = `
        SELECT 
          sa.id_asignacion,
          sa.id_sacramento,
          sa.fecha_celebracion,
          sa.pagado,
          sa.monto_pagado,
          sa.comentarios,
          sa.activo,
          sa.created_at,
          sa.updated_at,
          cs.nombre as sacramento_nombre,
          cs.descripcion as sacramento_descripcion,
          COALESCE(
            array_agg(
              json_build_object(
                'id_feligres', f.id_feligres,
                'nombre_completo', CONCAT(f.primer_nombre, ' ', f.primer_apellido),
                'primer_nombre', f.primer_nombre,
                'primer_apellido', f.primer_apellido,
                'id_rol_participante', sp.id_rol_participante,
                'rol_nombre', crp.nombre
              )
            ) FILTER (WHERE f.id_feligres IS NOT NULL),
            ARRAY[]::json[]
          ) as participantes
        FROM sacramento_asignacion sa
        INNER JOIN cat_sacramento cs ON sa.id_sacramento = cs.id_sacramento
        LEFT JOIN sacramento_participante sp ON sa.id_asignacion = sp.id_asignacion
        LEFT JOIN feligres f ON sp.id_feligres = f.id_feligres
        LEFT JOIN cat_rol_participante crp ON sp.id_rol_participante = crp.id_rol_participante
        WHERE sa.id_asignacion = $1 AND sa.activo = true
        GROUP BY sa.id_asignacion, sa.id_sacramento, sa.fecha_celebracion, sa.pagado, sa.monto_pagado, 
                 sa.comentarios, sa.activo, sa.created_at, sa.updated_at, cs.nombre, cs.descripcion
      `;
      
      const resultado = await cliente.query(consulta, [idAsignacion]);
      const asignacion = resultado.rows[0] || null;
      
      // Obtener testigos/padrinos si existe la asignación
      if (asignacion) {
        asignacion.testigos_padrinos = await TestigosPadrinosModel.obtenerPorAsignacion(idAsignacion);
      }
      
      return asignacion;
    } finally {
      cliente.release();
    }
  }

  // Actualizar asignación
  static async actualizar(idAsignacion, datos) {
    const cliente = await pool.connect();
    try {
      await cliente.query('BEGIN');
      
      // Actualizar la asignación principal
      const queryAsignacion = `
        UPDATE sacramento_asignacion 
        SET id_sacramento = $1, fecha_celebracion = $2, pagado = $3, monto_pagado = $4, comentarios = $5
        WHERE id_asignacion = $6 AND activo = true
      `;
      
      await cliente.query(queryAsignacion, [
        datos.id_sacramento,
        datos.fecha_celebracion,
        datos.pagado || false,
        datos.monto_pagado || null,
        datos.comentarios || null,
        idAsignacion
      ]);
      
      // Eliminar participantes existentes
      await cliente.query(
        'DELETE FROM sacramento_participante WHERE id_asignacion = $1',
        [idAsignacion]
      );
      
      // Insertar nuevos participantes
      if (datos.participantes && datos.participantes.length > 0) {
        for (const participante of datos.participantes) {
          const queryParticipante = `
            INSERT INTO sacramento_participante (id_asignacion, id_feligres, id_rol_participante)
            VALUES ($1, $2, $3)
          `;
          await cliente.query(queryParticipante, [
            idAsignacion,
            participante.id_feligres,
            participante.id_rol_participante || null
          ]);
        }
      }
      
      // Eliminar físicamente testigos/padrinos existentes antes de insertar nuevos
      // (necesario para evitar violación de restricción única)
      // Usar la misma conexión de cliente para mantener la transacción
      await cliente.query(
        'DELETE FROM testigos_padrinos WHERE id_asignacion = $1',
        [idAsignacion]
      );
      
      // Insertar nuevos testigos/padrinos si existen
      // Usar la misma conexión de cliente para mantener la transacción
      if (datos.testigos_padrinos && datos.testigos_padrinos.length > 0) {
        for (const tp of datos.testigos_padrinos) {
          const queryTestigoPadrino = `
            INSERT INTO testigos_padrinos (id_asignacion, id_feligres, id_tipo_testigo_padrino, numero_orden)
            VALUES ($1, $2, $3, $4)
          `;
          await cliente.query(queryTestigoPadrino, [
            idAsignacion,
            tp.id_feligres,
            tp.id_tipo_testigo_padrino,
            tp.numero_orden || 1
          ]);
        }
      }
      
      await cliente.query('COMMIT');
      return true;
    } catch (error) {
      await cliente.query('ROLLBACK');
      throw error;
    } finally {
      cliente.release();
    }
  }

  // Eliminación lógica
  static async eliminar(idAsignacion) {
    const cliente = await pool.connect();
    try {
      const query = `
        UPDATE sacramento_asignacion 
        SET activo = false 
        WHERE id_asignacion = $1 AND activo = true
      `;
      
      const resultado = await cliente.query(query, [idAsignacion]);
      return resultado.rowCount > 0;
    } finally {
      cliente.release();
    }
  }

  // Obtener sacramentos disponibles
  static async obtenerSacramentos() {
    const cliente = await pool.connect();
    try {
      const query = `
        SELECT id_sacramento, nombre, descripcion 
        FROM cat_sacramento 
        WHERE activo = true 
        ORDER BY nombre
      `;
      
      const resultado = await cliente.query(query);
      return resultado.rows;
    } finally {
      cliente.release();
    }
  }

  // Obtener roles de participante
  static async obtenerRolesParticipante() {
    const cliente = await pool.connect();
    try {
      const query = `
        SELECT id_rol_participante, nombre, descripcion 
        FROM cat_rol_participante 
        WHERE activo = true 
        ORDER BY nombre
      `;
      
      const resultado = await cliente.query(query);
      return resultado.rows;
    } finally {
      cliente.release();
    }
  }

  // Obtener estadísticas
  static async obtenerEstadisticas() {
    const cliente = await pool.connect();
    try {
      // Primero obtener los IDs de los sacramentos por nombre
      const sacramentosQuery = await cliente.query(`
        SELECT id_sacramento, nombre 
        FROM cat_sacramento 
        WHERE activo = true
      `);
      
      // Buscar IDs de los sacramentos principales
      let idBautizo = null;
      let idConfirmacion = null;
      let idMatrimonio = null;
      
      sacramentosQuery.rows.forEach(sacramento => {
        const nombre = sacramento.nombre.toLowerCase();
        if (nombre.includes('bautizo') || nombre.includes('bautismo')) {
          idBautizo = sacramento.id_sacramento;
        } else if (nombre.includes('confirmación') || nombre.includes('confirmacion')) {
          idConfirmacion = sacramento.id_sacramento;
        } else if (nombre.includes('matrimonio')) {
          idMatrimonio = sacramento.id_sacramento;
        }
      });
      
      // Construir la consulta con los IDs encontrados
      let query = `
        SELECT 
          COUNT(*) as total_asignaciones,
          COUNT(CASE WHEN pagado = true THEN 1 END) as asignaciones_pagadas,
          COUNT(CASE WHEN pagado = false THEN 1 END) as asignaciones_pendientes,
          COUNT(CASE WHEN fecha_celebracion >= CURRENT_DATE THEN 1 END) as proximas_celebraciones
      `;
      
      // Agregar conteos por sacramento solo si se encontraron los IDs
      if (idBautizo) {
        query += `, COUNT(CASE WHEN id_sacramento = ${idBautizo} THEN 1 END) as total_bautizos`;
      } else {
        query += `, 0 as total_bautizos`;
      }
      
      if (idConfirmacion) {
        query += `, COUNT(CASE WHEN id_sacramento = ${idConfirmacion} THEN 1 END) as total_confirmaciones`;
      } else {
        query += `, 0 as total_confirmaciones`;
      }
      
      if (idMatrimonio) {
        query += `, COUNT(CASE WHEN id_sacramento = ${idMatrimonio} THEN 1 END) as total_matrimonios`;
      } else {
        query += `, 0 as total_matrimonios`;
      }
      
      query += `
        FROM sacramento_asignacion 
        WHERE activo = true
      `;
      
      const resultado = await cliente.query(query);
      return resultado.rows[0];
    } finally {
      cliente.release();
    }
  }
}

module.exports = SacramentoAsignacionModel;
