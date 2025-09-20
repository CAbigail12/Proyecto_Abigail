const { pool } = require('../config/db');
const { crearError } = require('../utils/errorHandler');

class ReporteController {
  // ========================================
  // REPORTES DE CAJA PARROQUIAL
  // ========================================

  // Reporte de todos los ingresos
  static async obtenerReporteIngresos(req, res, next) {
    const cliente = await pool.connect();
    try {
      const { fecha_desde, fecha_hasta } = req.query;
      
      let query = `
        SELECT 
          cm.id_mov,
          cm.fecha_hora,
          cm.monto,
          cm.cuenta,
          cm.medio_pago,
          cm.concepto,
          cm.referencia,
          cm.descripcion,
          CONCAT(f.primer_nombre, ' ', f.primer_apellido) as feligres_nombre,
          CONCAT(u.nombre, ' ', u.apellido) as usuario_nombre
        FROM caja_mov cm
        LEFT JOIN feligres f ON cm.id_feligres = f.id_feligres
        LEFT JOIN usuarios u ON cm.creado_por = u.id_usuario
        WHERE cm.naturaleza = 'ingreso'
      `;
      
      const params = [];
      let paramCount = 0;
      
      if (fecha_desde) {
        paramCount++;
        query += ` AND DATE(cm.fecha_hora) >= $${paramCount}`;
        params.push(fecha_desde);
      }
      
      if (fecha_hasta) {
        paramCount++;
        query += ` AND DATE(cm.fecha_hora) <= $${paramCount}`;
        params.push(fecha_hasta);
      }
      
      query += ` ORDER BY cm.fecha_hora DESC`;
      
      const resultado = await cliente.query(query, params);
      
      // Calcular total
      const totalIngresos = resultado.rows.reduce((sum, row) => sum + parseFloat(row.monto), 0);
      
      res.json({
        ok: true,
        mensaje: 'Reporte de ingresos obtenido correctamente',
        datos: {
          ingresos: resultado.rows,
          total_registros: resultado.rows.length,
          total_monto: totalIngresos,
          filtros: {
            fecha_desde: fecha_desde || null,
            fecha_hasta: fecha_hasta || null
          },
          fecha_generacion: new Date().toISOString()
        }
      });
      
    } catch (error) {
      next(error);
    } finally {
      cliente.release();
    }
  }

  // Reporte de todos los egresos
  static async obtenerReporteEgresos(req, res, next) {
    const cliente = await pool.connect();
    try {
      const { fecha_desde, fecha_hasta } = req.query;
      
      let query = `
        SELECT 
          cm.id_mov,
          cm.fecha_hora,
          cm.monto,
          cm.cuenta,
          cm.medio_pago,
          cm.concepto,
          cm.referencia,
          cm.descripcion,
          CONCAT(f.primer_nombre, ' ', f.primer_apellido) as feligres_nombre,
          CONCAT(u.nombre, ' ', u.apellido) as usuario_nombre
        FROM caja_mov cm
        LEFT JOIN feligres f ON cm.id_feligres = f.id_feligres
        LEFT JOIN usuarios u ON cm.creado_por = u.id_usuario
        WHERE cm.naturaleza = 'egreso'
      `;
      
      const params = [];
      let paramCount = 0;
      
      if (fecha_desde) {
        paramCount++;
        query += ` AND DATE(cm.fecha_hora) >= $${paramCount}`;
        params.push(fecha_desde);
      }
      
      if (fecha_hasta) {
        paramCount++;
        query += ` AND DATE(cm.fecha_hora) <= $${paramCount}`;
        params.push(fecha_hasta);
      }
      
      query += ` ORDER BY cm.fecha_hora DESC`;
      
      const resultado = await cliente.query(query, params);
      
      // Calcular total
      const totalEgresos = resultado.rows.reduce((sum, row) => sum + parseFloat(row.monto), 0);
      
      res.json({
        ok: true,
        mensaje: 'Reporte de egresos obtenido correctamente',
        datos: {
          egresos: resultado.rows,
          total_registros: resultado.rows.length,
          total_monto: totalEgresos,
          filtros: {
            fecha_desde: fecha_desde || null,
            fecha_hasta: fecha_hasta || null
          },
          fecha_generacion: new Date().toISOString()
        }
      });
      
    } catch (error) {
      next(error);
    } finally {
      cliente.release();
    }
  }

  // Reporte de balance completo
  static async obtenerReporteBalance(req, res, next) {
    const cliente = await pool.connect();
    try {
      const { fecha_desde, fecha_hasta } = req.query;
      
      // Obtener resumen de ingresos
      let queryIngresosResumen = `
        SELECT 
          SUM(cm.monto) as total_ingresos,
          COUNT(*) as cantidad_ingresos
        FROM caja_mov cm
        WHERE cm.naturaleza = 'ingreso'
      `;
      
      // Obtener resumen de egresos
      let queryEgresosResumen = `
        SELECT 
          SUM(cm.monto) as total_egresos,
          COUNT(*) as cantidad_egresos
        FROM caja_mov cm
        WHERE cm.naturaleza = 'egreso'
      `;
      
      // Obtener datos detallados de ingresos
      let queryIngresosDetalle = `
        SELECT 
          cm.id_mov,
          cm.fecha_hora,
          cm.monto,
          cm.cuenta,
          cm.medio_pago,
          cm.concepto,
          cm.referencia,
          cm.descripcion,
          CONCAT(f.primer_nombre, ' ', f.primer_apellido) as feligres_nombre,
          CONCAT(u.nombre, ' ', u.apellido) as usuario_nombre
        FROM caja_mov cm
        LEFT JOIN feligres f ON cm.id_feligres = f.id_feligres
        LEFT JOIN usuarios u ON cm.creado_por = u.id_usuario
        WHERE cm.naturaleza = 'ingreso'
      `;
      
      // Obtener datos detallados de egresos
      let queryEgresosDetalle = `
        SELECT 
          cm.id_mov,
          cm.fecha_hora,
          cm.monto,
          cm.cuenta,
          cm.medio_pago,
          cm.concepto,
          cm.referencia,
          cm.descripcion,
          CONCAT(f.primer_nombre, ' ', f.primer_apellido) as feligres_nombre,
          CONCAT(u.nombre, ' ', u.apellido) as usuario_nombre
        FROM caja_mov cm
        LEFT JOIN feligres f ON cm.id_feligres = f.id_feligres
        LEFT JOIN usuarios u ON cm.creado_por = u.id_usuario
        WHERE cm.naturaleza = 'egreso'
      `;
      
      const params = [];
      let paramCount = 0;
      
      if (fecha_desde) {
        paramCount++;
        queryIngresosResumen += ` AND DATE(cm.fecha_hora) >= $${paramCount}`;
        queryEgresosResumen += ` AND DATE(cm.fecha_hora) >= $${paramCount}`;
        queryIngresosDetalle += ` AND DATE(cm.fecha_hora) >= $${paramCount}`;
        queryEgresosDetalle += ` AND DATE(cm.fecha_hora) >= $${paramCount}`;
        params.push(fecha_desde);
      }
      
      if (fecha_hasta) {
        paramCount++;
        queryIngresosResumen += ` AND DATE(cm.fecha_hora) <= $${paramCount}`;
        queryEgresosResumen += ` AND DATE(cm.fecha_hora) <= $${paramCount}`;
        queryIngresosDetalle += ` AND DATE(cm.fecha_hora) <= $${paramCount}`;
        queryEgresosDetalle += ` AND DATE(cm.fecha_hora) <= $${paramCount}`;
        params.push(fecha_hasta);
      }
      
      queryIngresosDetalle += ` ORDER BY cm.fecha_hora DESC`;
      queryEgresosDetalle += ` ORDER BY cm.fecha_hora DESC`;
      
      const [resultadoIngresosResumen, resultadoEgresosResumen, resultadoIngresosDetalle, resultadoEgresosDetalle] = await Promise.all([
        cliente.query(queryIngresosResumen, params),
        cliente.query(queryEgresosResumen, params),
        cliente.query(queryIngresosDetalle, params),
        cliente.query(queryEgresosDetalle, params)
      ]);
      
      const totalIngresos = parseFloat(resultadoIngresosResumen.rows[0].total_ingresos || 0);
      const totalEgresos = parseFloat(resultadoEgresosResumen.rows[0].total_egresos || 0);
      const balance = totalIngresos - totalEgresos;
      
      res.json({
        ok: true,
        mensaje: 'Reporte de balance obtenido correctamente',
        datos: {
          resumen: {
            total_ingresos: totalIngresos,
            total_egresos: totalEgresos,
            balance: balance,
            cantidad_ingresos: parseInt(resultadoIngresosResumen.rows[0].cantidad_ingresos || 0),
            cantidad_egresos: parseInt(resultadoEgresosResumen.rows[0].cantidad_egresos || 0)
          },
          ingresos: resultadoIngresosDetalle.rows,
          egresos: resultadoEgresosDetalle.rows,
          filtros: {
            fecha_desde: fecha_desde || null,
            fecha_hasta: fecha_hasta || null
          },
          fecha_generacion: new Date().toISOString()
        }
      });
      
    } catch (error) {
      next(error);
    } finally {
      cliente.release();
    }
  }

  // ========================================
  // REPORTES DE FELIGRESES
  // ========================================

  // Reporte completo de feligreses
  static async obtenerReporteFeligreses(req, res, next) {
    const cliente = await pool.connect();
    try {
      const { activo, id_comunidad, fecha_desde, fecha_hasta } = req.query;
      
      let query = `
        SELECT 
          f.id_feligres,
          f.primer_nombre,
          f.segundo_nombre,
          f.primer_apellido,
          f.segundo_apellido,
          f.fecha_nacimiento,
          f.sexo,
          f.telefono,
          f.correo,
          f.direccion,
          f.activo,
          f.created_at,
          c.nombre as comunidad_nombre
        FROM feligres f
        LEFT JOIN cat_comunidad c ON f.id_comunidad = c.id_comunidad
        WHERE 1=1
      `;
      
      const params = [];
      let paramCount = 0;
      
      if (activo !== undefined && activo !== '') {
        paramCount++;
        query += ` AND f.activo = $${paramCount}`;
        params.push(activo === 'true');
      }
      
      if (id_comunidad) {
        paramCount++;
        query += ` AND f.id_comunidad = $${paramCount}`;
        params.push(id_comunidad);
      }
      
      if (fecha_desde) {
        paramCount++;
        query += ` AND DATE(f.created_at) >= $${paramCount}`;
        params.push(fecha_desde);
      }
      
      if (fecha_hasta) {
        paramCount++;
        query += ` AND DATE(f.created_at) <= $${paramCount}`;
        params.push(fecha_hasta);
      }
      
      query += ` ORDER BY f.created_at DESC`;
      
      const resultado = await cliente.query(query, params);
      
      // Obtener estadísticas
      const estadisticas = await cliente.query(`
        SELECT 
          COUNT(*) as total_feligreses,
          COUNT(CASE WHEN activo = true THEN 1 END) as feligreses_activos,
          COUNT(CASE WHEN activo = false THEN 1 END) as feligreses_inactivos,
          COUNT(CASE WHEN sexo = 'M' THEN 1 END) as masculinos,
          COUNT(CASE WHEN sexo = 'F' THEN 1 END) as femeninos
        FROM feligres
      `);
      
      res.json({
        ok: true,
        mensaje: 'Reporte de feligreses obtenido correctamente',
        datos: {
          feligreses: resultado.rows,
          total_registros: resultado.rows.length,
          estadisticas: estadisticas.rows[0],
          filtros: {
            activo: activo !== undefined ? activo : null,
            id_comunidad: id_comunidad || null,
            fecha_desde: fecha_desde || null,
            fecha_hasta: fecha_hasta || null
          },
          fecha_generacion: new Date().toISOString()
        }
      });
      
    } catch (error) {
      next(error);
    } finally {
      cliente.release();
    }
  }

  // ========================================
  // REPORTES DE SACRAMENTOS
  // ========================================

  // Reporte de bautizos
  static async obtenerReporteBautizos(req, res, next) {
    const cliente = await pool.connect();
    try {
      const { fecha_desde, fecha_hasta, pagado } = req.query;
      
      let query = `
        SELECT 
          sa.id_asignacion,
          sa.fecha_celebracion,
          sa.pagado,
          sa.comentarios,
          sa.created_at,
          CONCAT(f.primer_nombre, ' ', f.primer_apellido) as feligres_nombre,
          f.fecha_nacimiento,
          c.nombre as comunidad_nombre
        FROM sacramento_asignacion sa
        INNER JOIN sacramento_participante sp ON sa.id_asignacion = sp.id_asignacion
        INNER JOIN feligres f ON sp.id_feligres = f.id_feligres
        LEFT JOIN cat_comunidad c ON f.id_comunidad = c.id_comunidad
        WHERE sa.id_sacramento = 1 AND sa.activo = true
      `;
      
      const params = [];
      let paramCount = 0;
      
      if (fecha_desde) {
        paramCount++;
        query += ` AND DATE(sa.fecha_celebracion) >= $${paramCount}`;
        params.push(fecha_desde);
      }
      
      if (fecha_hasta) {
        paramCount++;
        query += ` AND DATE(sa.fecha_celebracion) <= $${paramCount}`;
        params.push(fecha_hasta);
      }
      
      if (pagado !== undefined && pagado !== '') {
        paramCount++;
        query += ` AND sa.pagado = $${paramCount}`;
        params.push(pagado === 'true');
      }
      
      query += ` ORDER BY sa.fecha_celebracion DESC`;
      
      const resultado = await cliente.query(query, params);
      
      // Obtener estadísticas
      const estadisticas = await cliente.query(`
        SELECT 
          COUNT(*) as total_bautizos,
          COUNT(CASE WHEN pagado = true THEN 1 END) as bautizos_pagados,
          COUNT(CASE WHEN pagado = false THEN 1 END) as bautizos_pendientes
        FROM sacramento_asignacion 
        WHERE id_sacramento = 1 AND activo = true
      `);
      
      res.json({
        ok: true,
        mensaje: 'Reporte de bautizos obtenido correctamente',
        datos: {
          bautizos: resultado.rows,
          total_registros: resultado.rows.length,
          estadisticas: estadisticas.rows[0],
          filtros: {
            fecha_desde: fecha_desde || null,
            fecha_hasta: fecha_hasta || null,
            pagado: pagado !== undefined ? pagado : null
          },
          fecha_generacion: new Date().toISOString()
        }
      });
      
    } catch (error) {
      next(error);
    } finally {
      cliente.release();
    }
  }

  // Reporte de confirmaciones
  static async obtenerReporteConfirmaciones(req, res, next) {
    const cliente = await pool.connect();
    try {
      const { fecha_desde, fecha_hasta, pagado } = req.query;
      
      let query = `
        SELECT 
          sa.id_asignacion,
          sa.fecha_celebracion,
          sa.pagado,
          sa.comentarios,
          sa.created_at,
          CONCAT(f.primer_nombre, ' ', f.primer_apellido) as feligres_nombre,
          f.fecha_nacimiento,
          c.nombre as comunidad_nombre
        FROM sacramento_asignacion sa
        INNER JOIN sacramento_participante sp ON sa.id_asignacion = sp.id_asignacion
        INNER JOIN feligres f ON sp.id_feligres = f.id_feligres
        LEFT JOIN cat_comunidad c ON f.id_comunidad = c.id_comunidad
        WHERE sa.id_sacramento = 3 AND sa.activo = true
      `;
      
      const params = [];
      let paramCount = 0;
      
      if (fecha_desde) {
        paramCount++;
        query += ` AND DATE(sa.fecha_celebracion) >= $${paramCount}`;
        params.push(fecha_desde);
      }
      
      if (fecha_hasta) {
        paramCount++;
        query += ` AND DATE(sa.fecha_celebracion) <= $${paramCount}`;
        params.push(fecha_hasta);
      }
      
      if (pagado !== undefined && pagado !== '') {
        paramCount++;
        query += ` AND sa.pagado = $${paramCount}`;
        params.push(pagado === 'true');
      }
      
      query += ` ORDER BY sa.fecha_celebracion DESC`;
      
      const resultado = await cliente.query(query, params);
      
      // Obtener estadísticas
      const estadisticas = await cliente.query(`
        SELECT 
          COUNT(*) as total_confirmaciones,
          COUNT(CASE WHEN pagado = true THEN 1 END) as confirmaciones_pagadas,
          COUNT(CASE WHEN pagado = false THEN 1 END) as confirmaciones_pendientes
        FROM sacramento_asignacion 
        WHERE id_sacramento = 3 AND activo = true
      `);
      
      res.json({
        ok: true,
        mensaje: 'Reporte de confirmaciones obtenido correctamente',
        datos: {
          confirmaciones: resultado.rows,
          total_registros: resultado.rows.length,
          estadisticas: estadisticas.rows[0],
          filtros: {
            fecha_desde: fecha_desde || null,
            fecha_hasta: fecha_hasta || null,
            pagado: pagado !== undefined ? pagado : null
          },
          fecha_generacion: new Date().toISOString()
        }
      });
      
    } catch (error) {
      next(error);
    } finally {
      cliente.release();
    }
  }

  // Reporte de matrimonios
  static async obtenerReporteMatrimonios(req, res, next) {
    const cliente = await pool.connect();
    try {
      const { fecha_desde, fecha_hasta, pagado } = req.query;
      
      let query = `
        SELECT 
          sa.id_asignacion,
          sa.fecha_celebracion,
          sa.pagado,
          sa.comentarios,
          sa.created_at,
          CONCAT(f1.primer_nombre, ' ', f1.primer_apellido) as novio_nombre,
          CONCAT(f2.primer_nombre, ' ', f2.primer_apellido) as novia_nombre,
          c1.nombre as novio_comunidad,
          c2.nombre as novia_comunidad
        FROM sacramento_asignacion sa
        INNER JOIN sacramento_participante sp1 ON sa.id_asignacion = sp1.id_asignacion
        INNER JOIN sacramento_participante sp2 ON sa.id_asignacion = sp2.id_asignacion
        INNER JOIN feligres f1 ON sp1.id_feligres = f1.id_feligres
        INNER JOIN feligres f2 ON sp2.id_feligres = f2.id_feligres
        LEFT JOIN cat_comunidad c1 ON f1.id_comunidad = c1.id_comunidad
        LEFT JOIN cat_comunidad c2 ON f2.id_comunidad = c2.id_comunidad
        WHERE sa.id_sacramento = 4 AND sa.activo = true
        AND sp1.id_feligres < sp2.id_feligres
      `;
      
      const params = [];
      let paramCount = 0;
      
      if (fecha_desde) {
        paramCount++;
        query += ` AND DATE(sa.fecha_celebracion) >= $${paramCount}`;
        params.push(fecha_desde);
      }
      
      if (fecha_hasta) {
        paramCount++;
        query += ` AND DATE(sa.fecha_celebracion) <= $${paramCount}`;
        params.push(fecha_hasta);
      }
      
      if (pagado !== undefined && pagado !== '') {
        paramCount++;
        query += ` AND sa.pagado = $${paramCount}`;
        params.push(pagado === 'true');
      }
      
      query += ` ORDER BY sa.fecha_celebracion DESC`;
      
      const resultado = await cliente.query(query, params);
      
      // Obtener estadísticas
      const estadisticas = await cliente.query(`
        SELECT 
          COUNT(*) as total_matrimonios,
          COUNT(CASE WHEN pagado = true THEN 1 END) as matrimonios_pagados,
          COUNT(CASE WHEN pagado = false THEN 1 END) as matrimonios_pendientes
        FROM sacramento_asignacion 
        WHERE id_sacramento = 4 AND activo = true
      `);
      
      res.json({
        ok: true,
        mensaje: 'Reporte de matrimonios obtenido correctamente',
        datos: {
          matrimonios: resultado.rows,
          total_registros: resultado.rows.length,
          estadisticas: estadisticas.rows[0],
          filtros: {
            fecha_desde: fecha_desde || null,
            fecha_hasta: fecha_hasta || null,
            pagado: pagado !== undefined ? pagado : null
          },
          fecha_generacion: new Date().toISOString()
        }
      });
      
    } catch (error) {
      next(error);
    } finally {
      cliente.release();
    }
  }

  // Reporte de sacramentos pendientes de pago
  static async obtenerReporteSacramentosPendientes(req, res, next) {
    const cliente = await pool.connect();
    try {
      const { tipo_sacramento } = req.query;
      
      let query = `
        SELECT 
          sa.id_asignacion,
          sa.fecha_celebracion,
          sa.pagado,
          sa.comentarios,
          sa.created_at,
          cs.nombre as sacramento_nombre,
          array_agg(
            json_build_object(
              'nombre_completo', CONCAT(f.primer_nombre, ' ', f.primer_apellido),
              'comunidad', c.nombre
            )
          ) as participantes
        FROM sacramento_asignacion sa
        INNER JOIN cat_sacramento cs ON sa.id_sacramento = cs.id_sacramento
        INNER JOIN sacramento_participante sp ON sa.id_asignacion = sp.id_asignacion
        INNER JOIN feligres f ON sp.id_feligres = f.id_feligres
        LEFT JOIN cat_comunidad c ON f.id_comunidad = c.id_comunidad
        WHERE sa.pagado = false AND sa.activo = true
      `;
      
      const params = [];
      let paramCount = 0;
      
      if (tipo_sacramento) {
        paramCount++;
        query += ` AND sa.id_sacramento = $${paramCount}`;
        params.push(tipo_sacramento);
      }
      
      query += `
        GROUP BY sa.id_asignacion, cs.nombre, sa.fecha_celebracion, sa.pagado, sa.comentarios, sa.created_at
        ORDER BY sa.fecha_celebracion ASC
      `;
      
      const resultado = await cliente.query(query, params);
      
      // Obtener estadísticas
      const estadisticas = await cliente.query(`
        SELECT 
          COUNT(*) as total_pendientes,
          COUNT(CASE WHEN id_sacramento = 1 THEN 1 END) as bautizos_pendientes,
          COUNT(CASE WHEN id_sacramento = 3 THEN 1 END) as confirmaciones_pendientes,
          COUNT(CASE WHEN id_sacramento = 4 THEN 1 END) as matrimonios_pendientes
        FROM sacramento_asignacion 
        WHERE pagado = false AND activo = true
      `);
      
      res.json({
        ok: true,
        mensaje: 'Reporte de sacramentos pendientes obtenido correctamente',
        datos: {
          sacramentos_pendientes: resultado.rows,
          total_registros: resultado.rows.length,
          estadisticas: estadisticas.rows[0],
          filtros: {
            tipo_sacramento: tipo_sacramento || null
          },
          fecha_generacion: new Date().toISOString()
        }
      });
      
    } catch (error) {
      next(error);
    } finally {
      cliente.release();
    }
  }

  // Reporte de sacramentos pagados
  static async obtenerReporteSacramentosPagados(req, res, next) {
    const cliente = await pool.connect();
    try {
      const { tipo_sacramento, fecha_desde, fecha_hasta } = req.query;
      
      let query = `
        SELECT 
          sa.id_asignacion,
          sa.fecha_celebracion,
          sa.pagado,
          sa.comentarios,
          sa.created_at,
          cs.nombre as sacramento_nombre,
          array_agg(
            json_build_object(
              'nombre_completo', CONCAT(f.primer_nombre, ' ', f.primer_apellido),
              'comunidad', c.nombre
            )
          ) as participantes
        FROM sacramento_asignacion sa
        INNER JOIN cat_sacramento cs ON sa.id_sacramento = cs.id_sacramento
        INNER JOIN sacramento_participante sp ON sa.id_asignacion = sp.id_asignacion
        INNER JOIN feligres f ON sp.id_feligres = f.id_feligres
        LEFT JOIN cat_comunidad c ON f.id_comunidad = c.id_comunidad
        WHERE sa.pagado = true AND sa.activo = true
      `;
      
      const params = [];
      let paramCount = 0;
      
      if (tipo_sacramento) {
        paramCount++;
        query += ` AND sa.id_sacramento = $${paramCount}`;
        params.push(tipo_sacramento);
      }
      
      if (fecha_desde) {
        paramCount++;
        query += ` AND DATE(sa.fecha_celebracion) >= $${paramCount}`;
        params.push(fecha_desde);
      }
      
      if (fecha_hasta) {
        paramCount++;
        query += ` AND DATE(sa.fecha_celebracion) <= $${paramCount}`;
        params.push(fecha_hasta);
      }
      
      query += `
        GROUP BY sa.id_asignacion, cs.nombre, sa.fecha_celebracion, sa.pagado, sa.comentarios, sa.created_at
        ORDER BY sa.fecha_celebracion DESC
      `;
      
      const resultado = await cliente.query(query, params);
      
      // Obtener estadísticas
      const estadisticas = await cliente.query(`
        SELECT 
          COUNT(*) as total_pagados,
          COUNT(CASE WHEN id_sacramento = 1 THEN 1 END) as bautizos_pagados,
          COUNT(CASE WHEN id_sacramento = 3 THEN 1 END) as confirmaciones_pagadas,
          COUNT(CASE WHEN id_sacramento = 4 THEN 1 END) as matrimonios_pagados
        FROM sacramento_asignacion 
        WHERE pagado = true AND activo = true
      `);
      
      res.json({
        ok: true,
        mensaje: 'Reporte de sacramentos pagados obtenido correctamente',
        datos: {
          sacramentos_pagados: resultado.rows,
          total_registros: resultado.rows.length,
          estadisticas: estadisticas.rows[0],
          filtros: {
            tipo_sacramento: tipo_sacramento || null,
            fecha_desde: fecha_desde || null,
            fecha_hasta: fecha_hasta || null
          },
          fecha_generacion: new Date().toISOString()
        }
      });
      
    } catch (error) {
      next(error);
    } finally {
      cliente.release();
    }
  }

  // ========================================
  // ESTADÍSTICAS GENERALES
  // ========================================

  // Obtener estadísticas generales del sistema
  static async obtenerEstadisticasGenerales(req, res, next) {
    const cliente = await pool.connect();
    try {
      // Estadísticas de feligreses
      const feligresesStats = await cliente.query(`
        SELECT 
          COUNT(*) as total_feligreses,
          COUNT(CASE WHEN activo = true THEN 1 END) as feligreses_activos,
          COUNT(CASE WHEN activo = false THEN 1 END) as feligreses_inactivos
        FROM feligres
      `);
      
      // Estadísticas de sacramentos
      const sacramentosStats = await cliente.query(`
        SELECT 
          COUNT(*) as total_sacramentos,
          COUNT(CASE WHEN pagado = true THEN 1 END) as sacramentos_pagados,
          COUNT(CASE WHEN pagado = false THEN 1 END) as sacramentos_pendientes,
          COUNT(CASE WHEN id_sacramento = 1 THEN 1 END) as total_bautizos,
          COUNT(CASE WHEN id_sacramento = 3 THEN 1 END) as total_confirmaciones,
          COUNT(CASE WHEN id_sacramento = 4 THEN 1 END) as total_matrimonios
        FROM sacramento_asignacion 
        WHERE activo = true
      `);
      
      // Estadísticas de caja
      const cajaStats = await cliente.query(`
        SELECT 
          COUNT(CASE WHEN naturaleza = 'ingreso' THEN 1 END) as total_ingresos,
          COUNT(CASE WHEN naturaleza = 'egreso' THEN 1 END) as total_egresos,
          COALESCE(SUM(CASE WHEN naturaleza = 'ingreso' THEN monto ELSE 0 END), 0) as monto_ingresos,
          COALESCE(SUM(CASE WHEN naturaleza = 'egreso' THEN monto ELSE 0 END), 0) as monto_egresos
        FROM caja_mov
      `);
      
      const balance = parseFloat(cajaStats.rows[0].monto_ingresos) - parseFloat(cajaStats.rows[0].monto_egresos);
      
      res.json({
        ok: true,
        mensaje: 'Estadísticas generales obtenidas correctamente',
        datos: {
          feligreses: feligresesStats.rows[0],
          sacramentos: sacramentosStats.rows[0],
          caja: {
            ...cajaStats.rows[0],
            balance: balance
          },
          fecha_generacion: new Date().toISOString()
        }
      });
      
    } catch (error) {
      next(error);
    } finally {
      cliente.release();
    }
  }
}

module.exports = ReporteController;