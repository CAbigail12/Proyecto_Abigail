const { pool } = require('../config/db');
const { crearError } = require('../utils/errorHandler');

class CajaModel {
  // Crear nuevo movimiento de caja
  static async crear(datosMovimiento) {
    const cliente = await pool.connect();
    try {
      const resultado = await cliente.query(
        `INSERT INTO caja_mov (naturaleza, monto, cuenta, medio_pago, concepto, referencia, descripcion, id_feligres, creado_por)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id_mov, fecha_hora, naturaleza, monto, monto_signed, cuenta, medio_pago, concepto, referencia, descripcion, id_feligres, creado_por, created_at`,
        [
          datosMovimiento.naturaleza,
          datosMovimiento.monto,
          datosMovimiento.cuenta,
          datosMovimiento.medio_pago,
          datosMovimiento.concepto,
          datosMovimiento.referencia || null,
          datosMovimiento.descripcion || null,
          datosMovimiento.id_feligres || null,
          datosMovimiento.creado_por
        ]
      );
      
      return resultado.rows[0];
    } finally {
      cliente.release();
    }
  }

  // Obtener movimiento por ID
  static async obtenerPorId(idMovimiento) {
    const cliente = await pool.connect();
    try {
      const resultado = await cliente.query(
        `SELECT cm.id_mov, cm.fecha_hora, cm.naturaleza, cm.monto, cm.monto_signed, cm.cuenta, cm.medio_pago, 
                cm.concepto, cm.referencia, cm.descripcion, cm.id_feligres, cm.creado_por, cm.created_at, cm.updated_at,
                CONCAT(f.primer_nombre, ' ', f.primer_apellido) as feligres_nombre,
                u.nombre as usuario_nombre, u.apellido as usuario_apellido
         FROM caja_mov cm
         LEFT JOIN feligres f ON cm.id_feligres = f.id_feligres
         LEFT JOIN usuarios u ON cm.creado_por = u.id_usuario
         WHERE cm.id_mov = $1`,
        [idMovimiento]
      );
      
      if (resultado.rows.length === 0) {
        throw crearError('Movimiento no encontrado', 404);
      }
      
      return resultado.rows[0];
    } finally {
      cliente.release();
    }
  }

  // Obtener todos los movimientos con paginación y filtros
  static async obtenerTodos(filtros = {}, paginacion = {}) {
    const cliente = await pool.connect();
    try {
      let consulta = `
        SELECT cm.id_mov, cm.fecha_hora, cm.naturaleza, cm.monto, cm.monto_signed, cm.cuenta, cm.medio_pago, 
               cm.concepto, cm.referencia, cm.descripcion, cm.id_feligres, cm.creado_por, cm.created_at,
               CONCAT(f.primer_nombre, ' ', f.primer_apellido) as feligres_nombre,
               u.nombre as usuario_nombre, u.apellido as usuario_apellido
        FROM caja_mov cm
        LEFT JOIN feligres f ON cm.id_feligres = f.id_feligres
        LEFT JOIN usuarios u ON cm.creado_por = u.id_usuario
        WHERE 1=1
      `;
      
      const parametros = [];
      let contadorParametros = 1;
      
      // Aplicar filtros
      if (filtros.naturaleza) {
        consulta += ` AND cm.naturaleza = $${contadorParametros}`;
        parametros.push(filtros.naturaleza);
        contadorParametros++;
      }
      
      if (filtros.cuenta) {
        consulta += ` AND cm.cuenta = $${contadorParametros}`;
        parametros.push(filtros.cuenta);
        contadorParametros++;
      }
      
      if (filtros.concepto) {
        consulta += ` AND LOWER(cm.concepto) LIKE $${contadorParametros}`;
        parametros.push(`%${filtros.concepto.toLowerCase()}%`);
        contadorParametros++;
      }
      
      if (filtros.fecha_desde) {
        consulta += ` AND cm.fecha_hora >= $${contadorParametros}`;
        parametros.push(filtros.fecha_desde);
        contadorParametros++;
      }
      
      if (filtros.fecha_hasta) {
        consulta += ` AND cm.fecha_hora <= $${contadorParametros}`;
        parametros.push(filtros.fecha_hasta);
        contadorParametros++;
      }
      
      if (filtros.id_feligres) {
        consulta += ` AND cm.id_feligres = $${contadorParametros}`;
        parametros.push(filtros.id_feligres);
        contadorParametros++;
      }
      
      // Contar total de registros
      const consultaCount = consulta.replace(/SELECT.*FROM/, 'SELECT COUNT(*) FROM');
      const resultadoCount = await cliente.query(consultaCount, parametros);
      const total = parseInt(resultadoCount.rows[0].count);
      
      // Aplicar paginación
      consulta += ` ORDER BY cm.fecha_hora DESC, cm.id_mov DESC`;
      if (paginacion.limite) {
        consulta += ` LIMIT $${contadorParametros}`;
        parametros.push(paginacion.limite);
        contadorParametros++;
      }
      
      if (paginacion.offset) {
        consulta += ` OFFSET $${contadorParametros}`;
        parametros.push(paginacion.offset);
      }
      
      const resultado = await cliente.query(consulta, parametros);
      
      return {
        movimientos: resultado.rows,
        total
      };
    } finally {
      cliente.release();
    }
  }

  // Obtener balance global
  static async obtenerBalanceGlobal() {
    const cliente = await pool.connect();
    try {
      const resultado = await cliente.query(`
        SELECT * FROM vw_caja_balance_global
      `);
      
      return resultado.rows[0];
    } finally {
      cliente.release();
    }
  }

  // Obtener balance por cuenta
  static async obtenerBalancePorCuenta() {
    const cliente = await pool.connect();
    try {
      const resultado = await cliente.query(`
        SELECT * FROM vw_caja_balance_por_cuenta
      `);
      
      return resultado.rows;
    } finally {
      cliente.release();
    }
  }

  // Obtener resumen diario
  static async obtenerResumenDiario(fecha_desde = null, fecha_hasta = null) {
    const cliente = await pool.connect();
    try {
      let consulta = `
        SELECT * FROM vw_caja_resumen_diario
        WHERE 1=1
      `;
      
      const parametros = [];
      let contadorParametros = 1;
      
      if (fecha_desde) {
        consulta += ` AND fecha_utc >= $${contadorParametros}`;
        parametros.push(fecha_desde);
        contadorParametros++;
      }
      
      if (fecha_hasta) {
        consulta += ` AND fecha_utc <= $${contadorParametros}`;
        parametros.push(fecha_hasta);
        contadorParametros++;
      }
      
      consulta += ` ORDER BY fecha_utc DESC, cuenta, naturaleza`;
      
      const resultado = await cliente.query(consulta, parametros);
      return resultado.rows;
    } finally {
      cliente.release();
    }
  }

  // Obtener kardex con saldo acumulado
  static async obtenerKardex(cuenta = null, fecha_desde = null, fecha_hasta = null) {
    const cliente = await pool.connect();
    try {
      let consulta = `
        SELECT * FROM vw_caja_kardex
        WHERE 1=1
      `;
      
      const parametros = [];
      let contadorParametros = 1;
      
      if (cuenta) {
        consulta += ` AND cuenta = $${contadorParametros}`;
        parametros.push(cuenta);
        contadorParametros++;
      }
      
      if (fecha_desde) {
        consulta += ` AND fecha_hora >= $${contadorParametros}`;
        parametros.push(fecha_desde);
        contadorParametros++;
      }
      
      if (fecha_hasta) {
        consulta += ` AND fecha_hora <= $${contadorParametros}`;
        parametros.push(fecha_hasta);
        contadorParametros++;
      }
      
      consulta += ` ORDER BY cuenta, fecha_hora, id_mov`;
      
      const resultado = await cliente.query(consulta, parametros);
      return resultado.rows;
    } finally {
      cliente.release();
    }
  }

  // Actualizar movimiento
  static async actualizar(idMovimiento, datosActualizacion) {
    const cliente = await pool.connect();
    try {
      // Verificar que el movimiento existe
      const movimientoExiste = await cliente.query(
        'SELECT 1 FROM caja_mov WHERE id_mov = $1',
        [idMovimiento]
      );
      
      if (movimientoExiste.rows.length === 0) {
        throw crearError('Movimiento no encontrado', 404);
      }
      
      // Construir consulta de actualización
      const camposActualizables = ['naturaleza', 'monto', 'cuenta', 'medio_pago', 'concepto', 'referencia', 'descripcion', 'id_feligres'];
      const camposParaActualizar = [];
      const valores = [];
      let contadorParametros = 1;
      
      camposActualizables.forEach(campo => {
        if (datosActualizacion[campo] !== undefined) {
          camposParaActualizar.push(`${campo} = $${contadorParametros}`);
          valores.push(datosActualizacion[campo]);
          contadorParametros++;
        }
      });
      
      if (camposParaActualizar.length === 0) {
        throw crearError('No hay campos para actualizar', 400);
      }
      
      valores.push(idMovimiento);
      
      const consulta = `
        UPDATE caja_mov 
        SET ${camposParaActualizar.join(', ')}
        WHERE id_mov = $${contadorParametros}
        RETURNING id_mov, fecha_hora, naturaleza, monto, monto_signed, cuenta, medio_pago, concepto, referencia, descripcion, id_feligres, creado_por, created_at, updated_at
      `;
      
      const resultado = await cliente.query(consulta, valores);
      return resultado.rows[0];
    } finally {
      cliente.release();
    }
  }

  // Eliminar movimiento
  static async eliminar(idMovimiento) {
    const cliente = await pool.connect();
    try {
      const resultado = await cliente.query(
        'DELETE FROM caja_mov WHERE id_mov = $1 RETURNING id_mov',
        [idMovimiento]
      );
      
      if (resultado.rows.length === 0) {
        throw crearError('Movimiento no encontrado', 404);
      }
      
      return { mensaje: 'Movimiento eliminado correctamente' };
    } finally {
      cliente.release();
    }
  }

  // Obtener estadísticas de movimientos
  static async obtenerEstadisticas(fecha_desde = null, fecha_hasta = null) {
    const cliente = await pool.connect();
    try {
      let consulta = `
        SELECT 
          COUNT(*) as total_movimientos,
          COUNT(CASE WHEN naturaleza='ingreso' THEN 1 END) as total_ingresos,
          COUNT(CASE WHEN naturaleza='egreso' THEN 1 END) as total_egresos,
          COALESCE(SUM(CASE WHEN naturaleza='ingreso' THEN monto END), 0) as monto_total_ingresos,
          COALESCE(SUM(CASE WHEN naturaleza='egreso' THEN monto END), 0) as monto_total_egresos,
          COALESCE(SUM(monto_signed), 0) as saldo_actual
        FROM caja_mov
        WHERE 1=1
      `;
      
      const parametros = [];
      let contadorParametros = 1;
      
      if (fecha_desde) {
        consulta += ` AND fecha_hora >= $${contadorParametros}`;
        parametros.push(fecha_desde);
        contadorParametros++;
      }
      
      if (fecha_hasta) {
        consulta += ` AND fecha_hora <= $${contadorParametros}`;
        parametros.push(fecha_hasta);
        contadorParametros++;
      }
      
      const resultado = await cliente.query(consulta, parametros);
      return resultado.rows[0];
    } finally {
      cliente.release();
    }
  }

  // Obtener cuentas disponibles
  static async obtenerCuentas() {
    const cliente = await pool.connect();
    try {
      const resultado = await cliente.query(`
        SELECT DISTINCT cuenta 
        FROM caja_mov 
        ORDER BY cuenta
      `);
      
      return resultado.rows.map(row => row.cuenta);
    } finally {
      cliente.release();
    }
  }

  // Obtener conceptos disponibles
  static async obtenerConceptos() {
    const cliente = await pool.connect();
    try {
      const resultado = await cliente.query(`
        SELECT DISTINCT concepto 
        FROM caja_mov 
        ORDER BY concepto
      `);
      
      return resultado.rows.map(row => row.concepto);
    } finally {
      cliente.release();
    }
  }

  // Obtener medios de pago disponibles
  static async obtenerMediosPago() {
    const cliente = await pool.connect();
    try {
      const resultado = await cliente.query(`
        SELECT DISTINCT medio_pago 
        FROM caja_mov 
        ORDER BY medio_pago
      `);
      
      return resultado.rows.map(row => row.medio_pago);
    } finally {
      cliente.release();
    }
  }
}

module.exports = CajaModel;
