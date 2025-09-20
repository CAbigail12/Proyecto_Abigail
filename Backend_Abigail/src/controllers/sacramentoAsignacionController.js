const SacramentoAsignacionModel = require('../models/sacramentoAsignacionModel');
const Joi = require('joi');

// Esquema de validación para asignación de sacramento
const esquemaAsignacion = Joi.object({
  id_sacramento: Joi.number().integer().min(1).required()
    .messages({
      'number.base': 'El ID del sacramento debe ser un número',
      'number.integer': 'El ID del sacramento debe ser un número entero',
      'number.min': 'El ID del sacramento debe ser mayor a 0',
      'any.required': 'El ID del sacramento es requerido'
    }),
  
  fecha_celebracion: Joi.date().iso().required()
    .messages({
      'date.base': 'La fecha de celebración debe ser una fecha válida',
      'date.format': 'La fecha de celebración debe estar en formato ISO',
      'any.required': 'La fecha de celebración es requerida'
    }),
  
  pagado: Joi.boolean().default(false)
    .messages({
      'boolean.base': 'El estado de pago debe ser verdadero o falso'
    }),
  
  comentarios: Joi.string().max(500).allow('', null)
    .messages({
      'string.max': 'Los comentarios no pueden exceder 500 caracteres'
    }),
  
  participantes: Joi.array().items(
    Joi.object({
      id_feligres: Joi.number().integer().min(1).required()
        .messages({
          'number.base': 'El ID del feligrés debe ser un número',
          'number.integer': 'El ID del feligrés debe ser un número entero',
          'number.min': 'El ID del feligrés debe ser mayor a 0',
          'any.required': 'El ID del feligrés es requerido'
        }),
      id_rol_participante: Joi.number().integer().min(1).allow(null)
        .messages({
          'number.base': 'El ID del rol de participante debe ser un número',
          'number.integer': 'El ID del rol de participante debe ser un número entero',
          'number.min': 'El ID del rol de participante debe ser mayor a 0'
        })
    })
  ).min(1).required()
    .messages({
      'array.min': 'Debe incluir al menos un participante',
      'any.required': 'Los participantes son requeridos'
    })
});

class SacramentoAsignacionController {
  // Crear nueva asignación de sacramento
  static async crear(req, res) {
    try {
      // Validar datos con Joi
      const { error, value } = esquemaAsignacion.validate(req.body, { abortEarly: false });
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

      const datos = value;
      
      // Validaciones específicas
      if (!datos.participantes || datos.participantes.length === 0) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Debe seleccionar al menos un feligrés'
        });
      }

      // Para matrimonio, validar que sean exactamente 2 feligreses
      if (datos.id_sacramento == 4) { // Matrimonio
        if (datos.participantes.length !== 2) {
          return res.status(400).json({
            ok: false,
            mensaje: 'El matrimonio requiere exactamente 2 feligreses (novio y novia)'
          });
        }
      }

      // Validar que no se repitan feligreses
      const feligresesIds = datos.participantes.map(p => p.id_feligres);
      const feligresesUnicos = [...new Set(feligresesIds)];
      if (feligresesIds.length !== feligresesUnicos.length) {
        return res.status(400).json({
          ok: false,
          mensaje: 'No se puede asignar el mismo feligrés múltiples veces'
        });
      }

      const resultado = await SacramentoAsignacionModel.crear(datos);
      
      res.status(201).json({
        ok: true,
        mensaje: 'Asignación de sacramento creada correctamente',
        datos: resultado
      });
    } catch (error) {
      console.error('Error en crear asignación de sacramento:', error);
      res.status(500).json({
        ok: false,
        mensaje: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener todas las asignaciones
  static async obtenerTodos(req, res) {
    try {
      const filtros = {
        id_sacramento: req.query.id_sacramento,
        fecha_desde: req.query.fecha_desde,
        fecha_hasta: req.query.fecha_hasta,
        pagado: req.query.pagado,
        busqueda: req.query.busqueda
      };

      const paginacion = {
        pagina: parseInt(req.query.pagina) || 1,
        limite: parseInt(req.query.limite) || 10
      };

      const resultado = await SacramentoAsignacionModel.obtenerTodos(filtros, paginacion);
      
      res.json({
        ok: true,
        mensaje: 'Asignaciones obtenidas correctamente',
        datos: resultado
      });
    } catch (error) {
      console.error('Error en obtener asignaciones:', error);
      res.status(500).json({
        ok: false,
        mensaje: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener asignación por ID
  static async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          ok: false,
          mensaje: 'ID de asignación inválido'
        });
      }

      const asignacion = await SacramentoAsignacionModel.obtenerPorId(id);
      
      if (!asignacion) {
        return res.status(404).json({
          ok: false,
          mensaje: 'Asignación no encontrada'
        });
      }

      res.json({
        ok: true,
        mensaje: 'Asignación obtenida correctamente',
        datos: asignacion
      });
    } catch (error) {
      console.error('Error en obtener asignación por ID:', error);
      res.status(500).json({
        ok: false,
        mensaje: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Actualizar asignación
  static async actualizar(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          ok: false,
          mensaje: 'ID de asignación inválido'
        });
      }

      // Validar datos con Joi
      const { error, value } = esquemaAsignacion.validate(req.body, { abortEarly: false });
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

      const datos = value;
      
      // Validaciones específicas
      if (!datos.participantes || datos.participantes.length === 0) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Debe seleccionar al menos un feligrés'
        });
      }

      // Para matrimonio, validar que sean exactamente 2 feligreses
      if (datos.id_sacramento == 4) { // Matrimonio
        if (datos.participantes.length !== 2) {
          return res.status(400).json({
            ok: false,
            mensaje: 'El matrimonio requiere exactamente 2 feligreses (novio y novia)'
          });
        }
      }

      // Validar que no se repitan feligreses
      const feligresesIds = datos.participantes.map(p => p.id_feligres);
      const feligresesUnicos = [...new Set(feligresesIds)];
      if (feligresesIds.length !== feligresesUnicos.length) {
        return res.status(400).json({
          ok: false,
          mensaje: 'No se puede asignar el mismo feligrés múltiples veces'
        });
      }

      const actualizado = await SacramentoAsignacionModel.actualizar(id, datos);
      
      if (!actualizado) {
        return res.status(404).json({
          ok: false,
          mensaje: 'Asignación no encontrada'
        });
      }

      res.json({
        ok: true,
        mensaje: 'Asignación actualizada correctamente'
      });
    } catch (error) {
      console.error('Error en actualizar asignación:', error);
      res.status(500).json({
        ok: false,
        mensaje: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Eliminar asignación (eliminación lógica)
  static async eliminar(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          ok: false,
          mensaje: 'ID de asignación inválido'
        });
      }

      const eliminado = await SacramentoAsignacionModel.eliminar(id);
      
      if (!eliminado) {
        return res.status(404).json({
          ok: false,
          mensaje: 'Asignación no encontrada'
        });
      }

      res.json({
        ok: true,
        mensaje: 'Asignación eliminada correctamente'
      });
    } catch (error) {
      console.error('Error en eliminar asignación:', error);
      res.status(500).json({
        ok: false,
        mensaje: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener sacramentos disponibles
  static async obtenerSacramentos(req, res) {
    try {
      const sacramentos = await SacramentoAsignacionModel.obtenerSacramentos();
      
      res.json({
        ok: true,
        mensaje: 'Sacramentos obtenidos correctamente',
        datos: sacramentos
      });
    } catch (error) {
      console.error('Error en obtener sacramentos:', error);
      res.status(500).json({
        ok: false,
        mensaje: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener roles de participante
  static async obtenerRolesParticipante(req, res) {
    try {
      const roles = await SacramentoAsignacionModel.obtenerRolesParticipante();
      
      res.json({
        ok: true,
        mensaje: 'Roles de participante obtenidos correctamente',
        datos: roles
      });
    } catch (error) {
      console.error('Error en obtener roles de participante:', error);
      res.status(500).json({
        ok: false,
        mensaje: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener estadísticas
  static async obtenerEstadisticas(req, res) {
    try {
      const estadisticas = await SacramentoAsignacionModel.obtenerEstadisticas();
      
      res.json({
        ok: true,
        mensaje: 'Estadísticas obtenidas correctamente',
        datos: estadisticas
      });
    } catch (error) {
      console.error('Error en obtener estadísticas:', error);
      res.status(500).json({
        ok: false,
        mensaje: 'Error interno del servidor',
        error: error.message
      });
    }
  }
}

module.exports = SacramentoAsignacionController;
