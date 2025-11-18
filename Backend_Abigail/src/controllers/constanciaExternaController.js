const ConstanciaExternaModel = require('../models/constanciaExternaModel');
const Joi = require('joi');

// Esquema de validación para crear constancia externa
const esquemaConstanciaExterna = Joi.object({
  id_feligres: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'El ID del feligrés debe ser un número',
      'number.integer': 'El ID del feligrés debe ser un número entero',
      'number.positive': 'El ID del feligrés debe ser positivo',
      'any.required': 'El ID del feligrés es requerido'
    }),
  id_sacramento: Joi.number().integer().valid(1, 3).required()
    .messages({
      'number.base': 'El ID del sacramento debe ser un número',
      'number.integer': 'El ID del sacramento debe ser un número entero',
      'any.only': 'Solo se permiten constancias de Bautismo (1) o Confirmación (3)',
      'any.required': 'El ID del sacramento es requerido'
    }),
  libro: Joi.string().max(50).trim().required()
    .messages({
      'string.base': 'El libro debe ser un texto',
      'string.max': 'El libro no puede exceder 50 caracteres',
      'string.empty': 'El libro no puede estar vacío',
      'any.required': 'El libro es requerido'
    }),
  folio: Joi.string().max(50).trim().required()
    .messages({
      'string.base': 'El folio debe ser un texto',
      'string.max': 'El folio no puede exceder 50 caracteres',
      'string.empty': 'El folio no puede estar vacío',
      'any.required': 'El folio es requerido'
    }),
  descripcion: Joi.string().max(255).trim().allow('', null).optional()
    .messages({
      'string.base': 'La descripción debe ser un texto',
      'string.max': 'La descripción no puede exceder 255 caracteres'
    })
});

// Esquema de validación para actualizar constancia externa
const esquemaConstanciaExternaUpdate = Joi.object({
  id_feligres: Joi.number().integer().positive().required(),
  id_sacramento: Joi.number().integer().valid(1, 3).required(),
  libro: Joi.string().max(50).trim().required(),
  folio: Joi.string().max(50).trim().required(),
  descripcion: Joi.string().max(255).trim().allow('', null).optional()
});

class ConstanciaExternaController {
  // Obtener todas las constancias externas
  static async obtenerTodas(req, res) {
    try {
      const { pagina = 1, limite = 10, id_feligres, id_sacramento, busqueda } = req.query;
      
      const filtros = {};
      if (id_feligres) filtros.id_feligres = parseInt(id_feligres);
      if (id_sacramento) filtros.id_sacramento = parseInt(id_sacramento);
      if (busqueda) filtros.busqueda = busqueda;

      const paginacion = {
        pagina: parseInt(pagina),
        limite: parseInt(limite)
      };

      const resultado = await ConstanciaExternaModel.obtenerTodos(filtros, paginacion);

      res.json({
        ok: true,
        datos: resultado.datos,
        paginacion: resultado.paginacion
      });
    } catch (error) {
      console.error('Error al obtener constancias externas:', error);
      res.status(500).json({
        ok: false,
        mensaje: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener constancia externa por ID
  static async obtenerPorId(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          ok: false,
          mensaje: 'El ID de constancia externa es requerido y debe ser un número válido'
        });
      }

      const constancia = await ConstanciaExternaModel.obtenerPorId(parseInt(id));

      if (!constancia) {
        return res.status(404).json({
          ok: false,
          mensaje: 'No se encontró la constancia externa'
        });
      }

      res.json({
        ok: true,
        datos: constancia
      });
    } catch (error) {
      console.error('Error al obtener constancia externa:', error);
      res.status(500).json({
        ok: false,
        mensaje: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Crear nueva constancia externa
  static async crear(req, res) {
    try {
      const { error, value } = esquemaConstanciaExterna.validate(req.body, {
        abortEarly: false
      });

      if (error) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Datos de entrada inválidos',
          errores: error.details.map(detail => ({
            campo: detail.path.join('.'),
            mensaje: detail.message
          }))
        });
      }

      const resultado = await ConstanciaExternaModel.crear(value);

      res.status(201).json({
        ok: true,
        mensaje: 'Constancia externa creada correctamente',
        datos: { id_constancia_externa: resultado.id_constancia_externa }
      });
    } catch (error) {
      console.error('Error al crear constancia externa:', error);
      res.status(500).json({
        ok: false,
        mensaje: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Actualizar constancia externa
  static async actualizar(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          ok: false,
          mensaje: 'El ID de constancia externa es requerido y debe ser un número válido'
        });
      }

      const { error, value } = esquemaConstanciaExternaUpdate.validate(req.body, {
        abortEarly: false
      });

      if (error) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Datos de entrada inválidos',
          errores: error.details.map(detail => ({
            campo: detail.path.join('.'),
            mensaje: detail.message
          }))
        });
      }

      const constancia = await ConstanciaExternaModel.actualizar(parseInt(id), value);

      if (!constancia) {
        return res.status(404).json({
          ok: false,
          mensaje: 'No se encontró la constancia externa para actualizar'
        });
      }

      res.json({
        ok: true,
        mensaje: 'Constancia externa actualizada correctamente',
        datos: { id_constancia_externa: constancia.id_constancia_externa }
      });
    } catch (error) {
      console.error('Error al actualizar constancia externa:', error);
      res.status(500).json({
        ok: false,
        mensaje: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Eliminar constancia externa (soft delete)
  static async eliminar(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          ok: false,
          mensaje: 'El ID de constancia externa es requerido y debe ser un número válido'
        });
      }

      const constancia = await ConstanciaExternaModel.eliminar(parseInt(id));

      if (!constancia) {
        return res.status(404).json({
          ok: false,
          mensaje: 'No se encontró la constancia externa para eliminar'
        });
      }

      res.json({
        ok: true,
        mensaje: 'Constancia externa eliminada correctamente'
      });
    } catch (error) {
      console.error('Error al eliminar constancia externa:', error);
      res.status(500).json({
        ok: false,
        mensaje: 'Error interno del servidor',
        error: error.message
      });
    }
  }
}

module.exports = ConstanciaExternaController;

