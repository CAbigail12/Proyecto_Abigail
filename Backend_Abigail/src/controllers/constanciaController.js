const ConstanciaModel = require('../models/constanciaModel');
const Joi = require('joi');

// Esquema de validación para crear constancia
const esquemaConstancia = Joi.object({
  id_asignacion: Joi.number().integer().min(1).required()
    .messages({
      'number.base': 'El ID de asignación debe ser un número',
      'number.integer': 'El ID de asignación debe ser un número entero',
      'number.min': 'El ID de asignación debe ser mayor a 0',
      'any.required': 'El ID de asignación es requerido'
    }),
  
  tipo_sacramento: Joi.string().valid('bautizo', 'confirmacion', 'matrimonio').required()
    .messages({
      'string.base': 'El tipo de sacramento debe ser una cadena de texto',
      'any.only': 'El tipo de sacramento debe ser: bautizo, confirmacion o matrimonio',
      'any.required': 'El tipo de sacramento es requerido'
    }),
  
  id_parroco: Joi.number().integer().min(1).required()
    .messages({
      'number.base': 'El ID del párroco debe ser un número',
      'number.integer': 'El ID del párroco debe ser un número entero',
      'number.min': 'El ID del párroco debe ser mayor a 0',
      'any.required': 'El ID del párroco es requerido'
    }),
  
  libro: Joi.string().max(50).allow('', null).optional(),
  folio: Joi.string().max(50).allow('', null).optional(),
  acta: Joi.string().max(50).allow('', null).optional(),
  
  fecha_constancia: Joi.date().iso().optional(),
  datos_json: Joi.object().optional(),
  al_margen: Joi.string().max(255).allow('', null).optional()
});

// Esquema de validación para actualizar constancia
const esquemaConstanciaUpdate = Joi.object({
  id_parroco: Joi.number().integer().min(1).optional(),
  libro: Joi.string().max(50).allow('', null).optional(),
  folio: Joi.string().max(50).allow('', null).optional(),
  acta: Joi.string().max(50).allow('', null).optional(),
  fecha_constancia: Joi.date().iso().optional(),
  datos_json: Joi.object().optional(),
  al_margen: Joi.string().max(255).allow('', null).optional()
});

// Obtener constancia por id_asignacion
const obtenerConstancia = async (req, res) => {
  try {
    const { id_asignacion } = req.params;
    
    if (!id_asignacion || isNaN(parseInt(id_asignacion))) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El ID de asignación es requerido y debe ser un número válido'
      });
    }

    const constancia = await ConstanciaModel.obtenerPorAsignacion(parseInt(id_asignacion));
    
    if (!constancia) {
      return res.status(404).json({
        ok: false,
        mensaje: 'No se encontró constancia para esta asignación'
      });
    }

    // Parsear datos_json si existe
    if (constancia.datos_json) {
      try {
        constancia.datos_json = typeof constancia.datos_json === 'string' 
          ? JSON.parse(constancia.datos_json) 
          : constancia.datos_json;
      } catch (e) {
        console.error('Error al parsear datos_json:', e);
      }
    }

    res.json({
      ok: true,
      datos: constancia
    });
  } catch (error) {
    console.error('Error al obtener constancia:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Crear constancia
const crearConstancia = async (req, res) => {
  try {
    const { error, value } = esquemaConstancia.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errores = error.details.map(detail => ({
        campo: detail.path.join('.'),
        mensaje: detail.message
      }));
      
      return res.status(400).json({
        ok: false,
        mensaje: 'Error de validación',
        errores
      });
    }

    const constancia = await ConstanciaModel.crear(value);
    
    // Parsear datos_json si existe
    if (constancia.datos_json) {
      try {
        constancia.datos_json = typeof constancia.datos_json === 'string' 
          ? JSON.parse(constancia.datos_json) 
          : constancia.datos_json;
      } catch (e) {
        console.error('Error al parsear datos_json:', e);
      }
    }

    res.status(201).json({
      ok: true,
      mensaje: 'Constancia creada correctamente',
      datos: constancia
    });
  } catch (error) {
    console.error('Error al crear constancia:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Actualizar constancia
const actualizarConstancia = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El ID de constancia es requerido y debe ser un número válido'
      });
    }

    const { error, value } = esquemaConstanciaUpdate.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errores = error.details.map(detail => ({
        campo: detail.path.join('.'),
        mensaje: detail.message
      }));
      
      return res.status(400).json({
        ok: false,
        mensaje: 'Error de validación',
        errores
      });
    }

    const constancia = await ConstanciaModel.actualizar(parseInt(id), value);
    
    if (!constancia) {
      return res.status(404).json({
        ok: false,
        mensaje: 'No se encontró la constancia'
      });
    }

    // Parsear datos_json si existe
    if (constancia.datos_json) {
      try {
        constancia.datos_json = typeof constancia.datos_json === 'string' 
          ? JSON.parse(constancia.datos_json) 
          : constancia.datos_json;
      } catch (e) {
        console.error('Error al parsear datos_json:', e);
      }
    }

    res.json({
      ok: true,
      mensaje: 'Constancia actualizada correctamente',
      datos: constancia
    });
  } catch (error) {
    console.error('Error al actualizar constancia:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = {
  obtenerConstancia,
  crearConstancia,
  actualizarConstancia
};


