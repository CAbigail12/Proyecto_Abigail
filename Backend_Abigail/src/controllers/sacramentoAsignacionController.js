const SacramentoAsignacionModel = require('../models/sacramentoAsignacionModel');
const CajaModel = require('../models/cajaModel');
const { pool } = require('../config/db');
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
  
  monto_pagado: Joi.alternatives().try(
    Joi.number().precision(2).min(0),
    Joi.string().allow('', null),
    Joi.valid(null)
  ).optional()
    .messages({
      'number.base': 'El monto pagado debe ser un número',
      'number.min': 'El monto pagado no puede ser negativo',
      'number.precision': 'El monto pagado debe tener máximo 2 decimales',
      'alternatives.match': 'El monto pagado debe ser un número válido o null'
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
      console.log('📥 POST /api/sacramentos/asignaciones - Body recibido:', JSON.stringify(req.body, null, 2));
      
      // Validar datos con Joi - permitir campos desconocidos temporalmente para debug
      const { error, value } = esquemaAsignacion.validate(req.body, { 
        abortEarly: false,
        allowUnknown: false,
        stripUnknown: false
      });
      if (error) {
        console.error('❌ Error de validación Joi:', JSON.stringify(error.details, null, 2));
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
      console.log('✅ Datos validados correctamente:', JSON.stringify(datos, null, 2));
      
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

      // Limpiar y convertir monto_pagado
      console.log('🔧 monto_pagado antes de limpiar:', datos.monto_pagado, '| Tipo:', typeof datos.monto_pagado);
      
      // Si pagado es false, asegurar que monto_pagado sea null
      if (!datos.pagado) {
        datos.monto_pagado = null;
      } else {
        // Si pagado es true, convertir a número si es necesario
        if (datos.monto_pagado === '' || datos.monto_pagado === undefined || datos.monto_pagado === null) {
          datos.monto_pagado = null;
        } else if (typeof datos.monto_pagado === 'string') {
          const monto = parseFloat(datos.monto_pagado);
          datos.monto_pagado = isNaN(monto) ? null : monto;
        } else if (typeof datos.monto_pagado === 'number') {
          // Ya es número, asegurar que sea positivo
          datos.monto_pagado = datos.monto_pagado < 0 ? null : datos.monto_pagado;
        }
      }
      
      console.log('🔧 monto_pagado después de limpiar:', datos.monto_pagado);

      console.log('💾 Creando asignación en la base de datos...');
      const resultado = await SacramentoAsignacionModel.crear(datos);
      console.log('✅ Asignación creada con ID:', resultado.id_asignacion);
      
      // Si el sacramento fue pagado y tiene monto, crear ingreso en caja parroquial
      console.log('💰 Verificando si se debe crear ingreso en caja...');
      console.log('   - pagado:', datos.pagado);
      console.log('   - monto_pagado:', datos.monto_pagado);
      console.log('   - participantes:', datos.participantes?.length);
      
      if (datos.pagado && datos.monto_pagado && datos.monto_pagado > 0 && datos.participantes && datos.participantes.length > 0) {
        console.log('✅ Condiciones cumplidas, creando ingreso en caja...');
        try {
          // Obtener el nombre del sacramento
          const sacramentos = await SacramentoAsignacionModel.obtenerSacramentos();
          console.log('   - Sacramentos disponibles:', JSON.stringify(sacramentos, null, 2));
          console.log('   - ID sacramento buscado:', datos.id_sacramento, '| Tipo:', typeof datos.id_sacramento);
          
          // Comparar convirtiendo ambos a número para evitar problemas de tipo
          const idSacramentoBuscado = parseInt(datos.id_sacramento);
          const sacramento = sacramentos.find(s => {
            const idSac = parseInt(s.id_sacramento);
            return idSac === idSacramentoBuscado;
          });
          
          const nombreSacramento = sacramento ? sacramento.nombre : 'Sacramento';
          console.log('   - Sacramento encontrado:', sacramento ? JSON.stringify(sacramento) : 'NO ENCONTRADO');
          console.log('   - Nombre del sacramento:', nombreSacramento);
          
          // Obtener los nombres de los feligreses participantes
          const FeligresModel = require('../models/feligresModel');
          const nombresFeligreses = [];
          for (const participante of datos.participantes) {
            try {
              const feligres = await FeligresModel.obtenerFeligresPorId(participante.id_feligres);
              if (feligres) {
                const nombreCompleto = `${feligres.primer_nombre} ${feligres.primer_apellido}`;
                nombresFeligreses.push(nombreCompleto);
              }
            } catch (error) {
              console.error(`⚠️ Error al obtener feligrés ${participante.id_feligres}:`, error);
            }
          }
          
          console.log('   - Nombres de participantes:', nombresFeligreses);
          
          // Construir el concepto según el tipo de sacramento
          let concepto = `Pago de ${nombreSacramento}`;
          if (datos.id_sacramento == 4) { // Matrimonio
            // Para matrimonio, incluir nombres de ambas personas
            if (nombresFeligreses.length >= 2) {
              concepto = `Pago de ${nombreSacramento} - ${nombresFeligreses[0]} y ${nombresFeligreses[1]}`;
            } else if (nombresFeligreses.length === 1) {
              concepto = `Pago de ${nombreSacramento} - ${nombresFeligreses[0]}`;
            }
          } else {
            // Para bautizo o confirmación, incluir nombre del participante
            if (nombresFeligreses.length > 0) {
              concepto = `Pago de ${nombreSacramento} - ${nombresFeligreses[0]}`;
            }
          }
          
          // Obtener el primer participante para asociarlo al movimiento
          const primerParticipante = datos.participantes[0];
          console.log('   - Primer participante ID:', primerParticipante.id_feligres);
          console.log('   - Concepto final:', concepto);
          
          // Crear movimiento de ingreso en la caja
          const movimientoCaja = {
            naturaleza: 'ingreso',
            monto: parseFloat(datos.monto_pagado),
            cuenta: 'Caja General',
            medio_pago: 'Efectivo',
            concepto: concepto,
            referencia: `Asignación ID: ${resultado.id_asignacion}`,
            descripcion: `Pago de ${nombreSacramento} - Asignación #${resultado.id_asignacion}`,
            id_feligres: primerParticipante.id_feligres,
            creado_por: req.usuario ? req.usuario.id_usuario : null
          };
          
          console.log('💾 Creando movimiento de caja:', JSON.stringify(movimientoCaja, null, 2));
          await CajaModel.crear(movimientoCaja);
          console.log(`✅ Ingreso de caja creado: ${concepto} - Monto: Q${datos.monto_pagado}`);
        } catch (error) {
          console.error('⚠️ Error al crear ingreso en caja:', error);
          console.error('⚠️ Stack trace:', error.stack);
          // No fallar la creación de la asignación si falla el ingreso
          // Solo loguear el error
        }
      } else {
        console.log('ℹ️ No se creará ingreso en caja (condiciones no cumplidas)');
      }
      
      console.log('✅ Respuesta exitosa enviada al cliente');
      res.status(201).json({
        ok: true,
        mensaje: 'Asignación de sacramento creada correctamente',
        datos: resultado
      });
    } catch (error) {
      console.error('❌ Error en crear asignación de sacramento:', error);
      console.error('❌ Stack trace:', error.stack);
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
      console.log('📥 GET /api/sacramentos/asignaciones - Query params:', req.query);
      
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

      console.log('🔍 Filtros aplicados:', filtros);
      console.log('📄 Paginación:', paginacion);

      const resultado = await SacramentoAsignacionModel.obtenerTodos(filtros, paginacion);
      
      console.log('✅ Asignaciones obtenidas:', resultado.asignaciones.length);
      
      res.json({
        ok: true,
        mensaje: 'Asignaciones obtenidas correctamente',
        datos: resultado
      });
    } catch (error) {
      console.error('❌ Error en obtener asignaciones:', error);
      console.error('Stack completo:', error.stack);
      res.status(500).json({
        ok: false,
        mensaje: 'Error interno del servidor',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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

      // Limpiar monto_pagado si es string vacío o no está presente
      if (datos.monto_pagado === '' || datos.monto_pagado === undefined) {
        datos.monto_pagado = null;
      }
      // Si pagado es false, asegurar que monto_pagado sea null
      if (!datos.pagado) {
        datos.monto_pagado = null;
      }
      // Convertir string a número si es necesario
      if (typeof datos.monto_pagado === 'string' && datos.monto_pagado !== '') {
        const monto = parseFloat(datos.monto_pagado);
        datos.monto_pagado = isNaN(monto) ? null : monto;
      }
      
      // Obtener la asignación actual para verificar si ya tenía un ingreso
      const asignacionActual = await SacramentoAsignacionModel.obtenerPorId(id);
      
      const actualizado = await SacramentoAsignacionModel.actualizar(id, datos);
      
      if (!actualizado) {
        return res.status(404).json({
          ok: false,
          mensaje: 'Asignación no encontrada'
        });
      }

      // Si el sacramento fue pagado y tiene monto, crear o actualizar ingreso en caja parroquial
      if (datos.pagado && datos.monto_pagado && datos.monto_pagado > 0 && datos.participantes && datos.participantes.length > 0) {
        try {
          // Verificar si ya existe un ingreso para esta asignación
          const referencia = `Asignación ID: ${id}`;
          const cliente = await pool.connect();
          try {
            const movimientoExistente = await cliente.query(
              'SELECT id_mov FROM caja_mov WHERE referencia = $1 AND naturaleza = $2',
              [referencia, 'ingreso']
            );
            
            if (movimientoExistente.rows.length === 0) {
              // No existe, crear nuevo ingreso
              const sacramentos = await SacramentoAsignacionModel.obtenerSacramentos();
              console.log('   - Sacramentos disponibles (actualizar):', JSON.stringify(sacramentos, null, 2));
              console.log('   - ID sacramento buscado (actualizar):', datos.id_sacramento, '| Tipo:', typeof datos.id_sacramento);
              
              // Comparar convirtiendo ambos a número para evitar problemas de tipo
              const idSacramentoBuscado = parseInt(datos.id_sacramento);
              const sacramento = sacramentos.find(s => {
                const idSac = parseInt(s.id_sacramento);
                return idSac === idSacramentoBuscado;
              });
              
              const nombreSacramento = sacramento ? sacramento.nombre : 'Sacramento';
              console.log('   - Sacramento encontrado (actualizar):', sacramento ? JSON.stringify(sacramento) : 'NO ENCONTRADO');
              console.log('   - Nombre del sacramento (actualizar):', nombreSacramento);
              
              // Obtener los nombres de los feligreses participantes
              const FeligresModel = require('../models/feligresModel');
              const nombresFeligreses = [];
              for (const participante of datos.participantes) {
                try {
                  const feligres = await FeligresModel.obtenerFeligresPorId(participante.id_feligres);
                  if (feligres) {
                    const nombreCompleto = `${feligres.primer_nombre} ${feligres.primer_apellido}`;
                    nombresFeligreses.push(nombreCompleto);
                  }
                } catch (error) {
                  console.error(`⚠️ Error al obtener feligrés ${participante.id_feligres}:`, error);
                }
              }
              
              // Construir el concepto según el tipo de sacramento
              let concepto = `Pago de ${nombreSacramento}`;
              if (datos.id_sacramento == 4) { // Matrimonio
                // Para matrimonio, incluir nombres de ambas personas
                if (nombresFeligreses.length >= 2) {
                  concepto = `Pago de ${nombreSacramento} - ${nombresFeligreses[0]} y ${nombresFeligreses[1]}`;
                } else if (nombresFeligreses.length === 1) {
                  concepto = `Pago de ${nombreSacramento} - ${nombresFeligreses[0]}`;
                }
              } else {
                // Para bautizo o confirmación, incluir nombre del participante
                if (nombresFeligreses.length > 0) {
                  concepto = `Pago de ${nombreSacramento} - ${nombresFeligreses[0]}`;
                }
              }
              
              const primerParticipante = datos.participantes[0];
              
              const movimientoCaja = {
                naturaleza: 'ingreso',
                monto: parseFloat(datos.monto_pagado),
                cuenta: 'Caja General',
                medio_pago: 'Efectivo',
                concepto: concepto,
                referencia: referencia,
                descripcion: `Pago de ${nombreSacramento} - Asignación #${id}`,
                id_feligres: primerParticipante.id_feligres,
                creado_por: req.usuario ? req.usuario.id_usuario : null
              };
              
              await CajaModel.crear(movimientoCaja);
              console.log(`✅ Ingreso de caja creado por actualización: ${concepto}`);
            } else {
              // Ya existe, actualizar el monto y concepto si es necesario
              const movimientoCaja = await cliente.query(
                'SELECT monto, concepto FROM caja_mov WHERE id_mov = $1',
                [movimientoExistente.rows[0].id_mov]
              );
              
              // Obtener el nombre del sacramento y los nombres de los participantes
              const sacramentos = await SacramentoAsignacionModel.obtenerSacramentos();
              
              // Comparar convirtiendo ambos a número para evitar problemas de tipo
              const idSacramentoBuscado = parseInt(datos.id_sacramento);
              const sacramento = sacramentos.find(s => {
                const idSac = parseInt(s.id_sacramento);
                return idSac === idSacramentoBuscado;
              });
              
              const nombreSacramento = sacramento ? sacramento.nombre : 'Sacramento';
              console.log('   - Nombre del sacramento (actualizar monto):', nombreSacramento);
              
              // Obtener los nombres de los feligreses participantes
              const FeligresModel = require('../models/feligresModel');
              const nombresFeligreses = [];
              for (const participante of datos.participantes) {
                try {
                  const feligres = await FeligresModel.obtenerFeligresPorId(participante.id_feligres);
                  if (feligres) {
                    const nombreCompleto = `${feligres.primer_nombre} ${feligres.primer_apellido}`;
                    nombresFeligreses.push(nombreCompleto);
                  }
                } catch (error) {
                  console.error(`⚠️ Error al obtener feligrés ${participante.id_feligres}:`, error);
                }
              }
              
              // Construir el concepto según el tipo de sacramento
              let concepto = `Pago de ${nombreSacramento}`;
              if (datos.id_sacramento == 4) { // Matrimonio
                if (nombresFeligreses.length >= 2) {
                  concepto = `Pago de ${nombreSacramento} - ${nombresFeligreses[0]} y ${nombresFeligreses[1]}`;
                } else if (nombresFeligreses.length === 1) {
                  concepto = `Pago de ${nombreSacramento} - ${nombresFeligreses[0]}`;
                }
              } else {
                if (nombresFeligreses.length > 0) {
                  concepto = `Pago de ${nombreSacramento} - ${nombresFeligreses[0]}`;
                }
              }
              
              const montoActual = parseFloat(movimientoCaja.rows[0].monto);
              const montoNuevo = parseFloat(datos.monto_pagado);
              const conceptoActual = movimientoCaja.rows[0].concepto;
              
              // Actualizar si el monto o el concepto cambió
              if (montoActual !== montoNuevo || conceptoActual !== concepto) {
                await cliente.query(
                  'UPDATE caja_mov SET monto = $1, monto_signed = $1, concepto = $3 WHERE id_mov = $2',
                  [montoNuevo, movimientoExistente.rows[0].id_mov, concepto]
                );
                console.log(`✅ Monto y concepto del ingreso actualizado para asignación #${id}: ${concepto}`);
              }
            }
          } finally {
            cliente.release();
          }
        } catch (error) {
          console.error('⚠️ Error al crear/actualizar ingreso en caja:', error);
          // No fallar la actualización de la asignación si falla el ingreso
        }
      } else if (datos.pagado === false && asignacionActual && asignacionActual.pagado) {
        // Si se cambió de pagado a no pagado, eliminar el ingreso si existe
        try {
          const referencia = `Asignación ID: ${id}`;
          const cliente = await pool.connect();
          try {
            await cliente.query(
              'DELETE FROM caja_mov WHERE referencia = $1 AND naturaleza = $2',
              [referencia, 'ingreso']
            );
            console.log(`✅ Ingreso eliminado para asignación #${id} (marcado como no pagado)`);
          } finally {
            cliente.release();
          }
        } catch (error) {
          console.error('⚠️ Error al eliminar ingreso de caja:', error);
        }
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
