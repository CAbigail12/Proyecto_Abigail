const SacramentoEventoModel = require('../models/sacramentoEventoModel');

class SacramentoEventoController {
  // Obtener todos los eventos con filtros y paginación
  static async obtenerEventos(req, res) {
    try {
      const filtros = {
        busqueda: req.query.busqueda || '',
        id_sacramento: req.query.id_sacramento || '',
        pagina: parseInt(req.query.pagina) || 1,
        limite: parseInt(req.query.limite) || 10
      };

      const resultado = await SacramentoEventoModel.obtenerEventos(filtros);

      res.json({
        ok: true,
        mensaje: 'Eventos obtenidos correctamente',
        datos: resultado
      });
    } catch (error) {
      console.error('Error en obtenerEventos:', error);
      res.status(500).json({
        ok: false,
        mensaje: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener un evento por ID
  static async obtenerEventoPorId(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          ok: false,
          mensaje: 'ID de evento inválido'
        });
      }

      const evento = await SacramentoEventoModel.obtenerPorId(id);

      if (!evento) {
        return res.status(404).json({
          ok: false,
          mensaje: 'Evento no encontrado'
        });
      }

      res.json({
        ok: true,
        mensaje: 'Evento obtenido correctamente',
        datos: evento
      });
    } catch (error) {
      console.error('Error en obtenerEventoPorId:', error);
      res.status(500).json({
        ok: false,
        mensaje: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Crear nuevo evento
  static async crearEvento(req, res) {
    try {
      const {
        id_feligres,
        id_sacramento,
        id_feligres_pareja,
        estado_pago,
        estado_ceremonia,
        fecha_evento
      } = req.body;

      // Validaciones básicas
      if (!id_feligres || !id_sacramento || !fecha_evento) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Los campos id_feligres, id_sacramento y fecha_evento son obligatorios'
        });
      }

      const datosEvento = {
        id_feligres,
        id_sacramento,
        id_feligres_pareja: id_feligres_pareja || null,
        estado_pago: estado_pago || null,
        estado_ceremonia: estado_ceremonia || null,
        fecha_evento
      };

      const nuevoEvento = await SacramentoEventoModel.crear(datosEvento);

      res.status(201).json({
        ok: true,
        mensaje: 'Evento creado correctamente',
        datos: nuevoEvento
      });
    } catch (error) {
      console.error('Error en crearEvento:', error);
      res.status(500).json({
        ok: false,
        mensaje: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Actualizar evento
  static async actualizarEvento(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          ok: false,
          mensaje: 'ID de evento inválido'
        });
      }

      const datosActualizacion = { ...req.body };

      if (Object.keys(datosActualizacion).length === 0) {
        return res.status(400).json({
          ok: false,
          mensaje: 'No se enviaron datos para actualizar'
        });
      }

      const eventoActualizado = await SacramentoEventoModel.actualizar(id, datosActualizacion);

      if (!eventoActualizado) {
        return res.status(404).json({
          ok: false,
          mensaje: 'Evento no encontrado'
        });
      }

      res.json({
        ok: true,
        mensaje: 'Evento actualizado correctamente',
        datos: eventoActualizado
      });
    } catch (error) {
      console.error('Error en actualizarEvento:', error);
      res.status(500).json({
        ok: false,
        mensaje: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Eliminar evento (soft delete)
  static async eliminarEvento(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          ok: false,
          mensaje: 'ID de evento inválido'
        });
      }

      const eventoEliminado = await SacramentoEventoModel.eliminar(id);

      if (!eventoEliminado) {
        return res.status(404).json({
          ok: false,
          mensaje: 'Evento no encontrado'
        });
      }

      res.json({
        ok: true,
        mensaje: 'Evento eliminado correctamente',
        datos: eventoEliminado
      });
    } catch (error) {
      console.error('Error en eliminarEvento:', error);
      res.status(500).json({
        ok: false,
        mensaje: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener sacramentos para select
  static async obtenerSacramentos(req, res) {
    try {
      const sacramentos = await SacramentoEventoModel.obtenerSacramentos();

      res.json({
        ok: true,
        mensaje: 'Sacramentos obtenidos correctamente',
        datos: sacramentos
      });
    } catch (error) {
      console.error('Error en obtenerSacramentos:', error);
      res.status(500).json({
        ok: false,
        mensaje: 'Error interno del servidor',
        error: error.message
      });
    }
  }
}

module.exports = SacramentoEventoController;

