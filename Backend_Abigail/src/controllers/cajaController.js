const Joi = require('joi');
const CajaModel = require('../models/cajaModel');
const { crearError } = require('../utils/errorHandler');
const { validarPaginacion, construirPaginacion, construirRespuestaPaginada } = require('../utils/pagination');

// Esquemas de validación
const esquemaCrearMovimiento = Joi.object({
  naturaleza: Joi.string().valid('ingreso', 'egreso').required().messages({
    'any.only': 'La naturaleza debe ser "ingreso" o "egreso"',
    'any.required': 'La naturaleza es requerida'
  }),
  monto: Joi.number().positive().precision(2).required().messages({
    'number.positive': 'El monto debe ser positivo',
    'number.precision': 'El monto debe tener máximo 2 decimales',
    'any.required': 'El monto es requerido'
  }),
  cuenta: Joi.string().min(1).max(100).required().messages({
    'string.min': 'La cuenta es requerida',
    'string.max': 'La cuenta no puede exceder 100 caracteres',
    'any.required': 'La cuenta es requerida'
  }),
  medio_pago: Joi.string().min(1).max(60).required().messages({
    'string.min': 'El medio de pago es requerido',
    'string.max': 'El medio de pago no puede exceder 60 caracteres',
    'any.required': 'El medio de pago es requerido'
  }),
  concepto: Joi.string().min(1).max(120).required().messages({
    'string.min': 'El concepto es requerido',
    'string.max': 'El concepto no puede exceder 120 caracteres',
    'any.required': 'El concepto es requerido'
  }),
  referencia: Joi.string().max(120).optional().allow('').messages({
    'string.max': 'La referencia no puede exceder 120 caracteres'
  }),
  descripcion: Joi.string().max(500).optional().allow('').messages({
    'string.max': 'La descripción no puede exceder 500 caracteres'
  }),
  id_feligres: Joi.number().integer().positive().optional().allow(null).messages({
    'number.base': 'El ID del feligrés debe ser un número',
    'number.integer': 'El ID del feligrés debe ser un número entero',
    'number.positive': 'El ID del feligrés debe ser positivo'
  })
});

const esquemaActualizarMovimiento = Joi.object({
  naturaleza: Joi.string().valid('ingreso', 'egreso').messages({
    'any.only': 'La naturaleza debe ser "ingreso" o "egreso"'
  }),
  monto: Joi.number().positive().precision(2).messages({
    'number.positive': 'El monto debe ser positivo',
    'number.precision': 'El monto debe tener máximo 2 decimales'
  }),
  cuenta: Joi.string().min(1).max(100).messages({
    'string.min': 'La cuenta es requerida',
    'string.max': 'La cuenta no puede exceder 100 caracteres'
  }),
  medio_pago: Joi.string().min(1).max(60).messages({
    'string.min': 'El medio de pago es requerido',
    'string.max': 'El medio de pago no puede exceder 60 caracteres'
  }),
  concepto: Joi.string().min(1).max(120).messages({
    'string.min': 'El concepto es requerido',
    'string.max': 'El concepto no puede exceder 120 caracteres'
  }),
  referencia: Joi.string().max(120).optional().allow('').messages({
    'string.max': 'La referencia no puede exceder 120 caracteres'
  }),
  descripcion: Joi.string().max(500).optional().allow('').messages({
    'string.max': 'La descripción no puede exceder 500 caracteres'
  }),
  id_feligres: Joi.number().integer().positive().optional().allow(null).messages({
    'number.base': 'El ID del feligrés debe ser un número',
    'number.integer': 'El ID del feligrés debe ser un número entero',
    'number.positive': 'El ID del feligrés debe ser positivo'
  })
});

class CajaController {
  // Crear nuevo movimiento de caja
  static async crear(req, res, next) {
    try {
      // Validar datos de entrada
      const { error, value } = esquemaCrearMovimiento.validate(req.body);
      if (error) {
        throw crearError('Datos de entrada inválidos', 400, error.details);
      }
      
      // Agregar el usuario que crea el movimiento
      value.creado_por = req.usuario.id_usuario;
      
      // Crear movimiento
      const movimiento = await CajaModel.crear(value);
      
      res.status(201).json({
        ok: true,
        mensaje: 'Movimiento creado correctamente',
        datos: movimiento
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Obtener todos los movimientos (sin filtros ni paginación - se aplican en el frontend)
  static async obtenerTodos(req, res, next) {
    try {
      // El backend siempre devuelve TODOS los movimientos sin filtros ni paginación
      const resultado = await CajaModel.obtenerTodos({}, {});
      
      res.json({
        ok: true,
        mensaje: 'Movimientos obtenidos correctamente',
        datos: {
          datos: resultado.movimientos,
          paginacion: {
            total_registros: resultado.total
          }
        }
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Obtener movimiento por ID
  static async obtenerPorId(req, res, next) {
    try {
      const { id_mov } = req.params;
      
      // Validar que el ID sea un número
      const id = parseInt(id_mov);
      if (isNaN(id)) {
        throw crearError('ID de movimiento inválido', 400);
      }
      
      // Obtener movimiento
      const movimiento = await CajaModel.obtenerPorId(id);
      
      res.json({
        ok: true,
        mensaje: 'Movimiento obtenido correctamente',
        datos: movimiento
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Actualizar movimiento
  static async actualizar(req, res, next) {
    try {
      const { id_mov } = req.params;
      const datosActualizacion = req.body;
      
      // Validar que el ID sea un número
      const id = parseInt(id_mov);
      if (isNaN(id)) {
        throw crearError('ID de movimiento inválido', 400);
      }
      
      // Validar datos de entrada
      const { error, value } = esquemaActualizarMovimiento.validate(datosActualizacion);
      if (error) {
        throw crearError('Datos de entrada inválidos', 400, error.details);
      }
      
      // Actualizar movimiento
      const movimiento = await CajaModel.actualizar(id, value);
      
      res.json({
        ok: true,
        mensaje: 'Movimiento actualizado correctamente',
        datos: movimiento
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Eliminar movimiento
  static async eliminar(req, res, next) {
    try {
      const { id_mov } = req.params;
      
      // Validar que el ID sea un número
      const id = parseInt(id_mov);
      if (isNaN(id)) {
        throw crearError('ID de movimiento inválido', 400);
      }
      
      // Eliminar movimiento
      const resultado = await CajaModel.eliminar(id);
      
      res.json({
        ok: true,
        mensaje: resultado.mensaje
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Obtener balance global
  static async obtenerBalanceGlobal(req, res, next) {
    try {
      const balance = await CajaModel.obtenerBalanceGlobal();
      
      res.json({
        ok: true,
        mensaje: 'Balance global obtenido correctamente',
        datos: balance
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Obtener balance por cuenta
  static async obtenerBalancePorCuenta(req, res, next) {
    try {
      const balances = await CajaModel.obtenerBalancePorCuenta();
      
      res.json({
        ok: true,
        mensaje: 'Balance por cuenta obtenido correctamente',
        datos: balances
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Obtener resumen diario
  static async obtenerResumenDiario(req, res, next) {
    try {
      const { fecha_desde, fecha_hasta } = req.query;
      
      const resumen = await CajaModel.obtenerResumenDiario(fecha_desde, fecha_hasta);
      
      res.json({
        ok: true,
        mensaje: 'Resumen diario obtenido correctamente',
        datos: resumen
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Obtener kardex
  static async obtenerKardex(req, res, next) {
    try {
      const { cuenta, fecha_desde, fecha_hasta } = req.query;
      
      const kardex = await CajaModel.obtenerKardex(cuenta, fecha_desde, fecha_hasta);
      
      res.json({
        ok: true,
        mensaje: 'Kardex obtenido correctamente',
        datos: kardex
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Obtener estadísticas
  static async obtenerEstadisticas(req, res, next) {
    try {
      const { fecha_desde, fecha_hasta } = req.query;
      
      const estadisticas = await CajaModel.obtenerEstadisticas(fecha_desde, fecha_hasta);
      
      res.json({
        ok: true,
        mensaje: 'Estadísticas obtenidas correctamente',
        datos: estadisticas
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Obtener cuentas disponibles
  static async obtenerCuentas(req, res, next) {
    try {
      const cuentas = await CajaModel.obtenerCuentas();
      
      res.json({
        ok: true,
        mensaje: 'Cuentas obtenidas correctamente',
        datos: cuentas
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Obtener conceptos disponibles
  static async obtenerConceptos(req, res, next) {
    try {
      const conceptos = await CajaModel.obtenerConceptos();
      
      res.json({
        ok: true,
        mensaje: 'Conceptos obtenidos correctamente',
        datos: conceptos
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Obtener medios de pago disponibles
  static async obtenerMediosPago(req, res, next) {
    try {
      const mediosPago = await CajaModel.obtenerMediosPago();
      
      res.json({
        ok: true,
        mensaje: 'Medios de pago obtenidos correctamente',
        datos: mediosPago
      });
      
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CajaController;
