const ActividadReligiosaModel = require('../models/actividadReligiosaModel');
const { crearError } = require('../utils/errorHandler');

class ActividadReligiosaController {
  // ========================================
  // ACTIVIDADES RELIGIOSAS
  // ========================================

  // Obtener todas las actividades (sin filtros ni paginación - se aplican en el frontend)
  static async obtenerTodas(req, res, next) {
    try {
      // El backend siempre devuelve TODAS las actividades sin filtros ni paginación
      const resultado = await ActividadReligiosaModel.obtenerTodas({});

      res.json({
        ok: true,
        mensaje: 'Actividades religiosas obtenidas correctamente',
        datos: {
          actividades: resultado.actividades,
          total: resultado.total,
          pagina: 1,
          limite: resultado.total,
          totalPaginas: 1
        }
      });
    } catch (error) {
      next(crearError('Error al obtener actividades religiosas', 500, error));
    }
  }

  // Obtener una actividad por ID
  static async obtenerPorId(req, res, next) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return next(crearError('ID de actividad inválido', 400));
      }

      const actividad = await ActividadReligiosaModel.obtenerPorId(id);

      if (!actividad) {
        return next(crearError('Actividad religiosa no encontrada', 404));
      }

      res.json({
        ok: true,
        mensaje: 'Actividad religiosa obtenida correctamente',
        datos: actividad
      });
    } catch (error) {
      next(crearError('Error al obtener actividad religiosa', 500, error));
    }
  }

  // Crear nueva actividad
  static async crear(req, res, next) {
    try {
      const {
        id_tipo_actividad,
        nombre,
        descripcion,
        fecha_actividad,
        hora_actividad,
        lugar
      } = req.body;

      // Validaciones
      if (!id_tipo_actividad || isNaN(id_tipo_actividad)) {
        return next(crearError('Tipo de actividad es requerido', 400));
      }

      if (!nombre || nombre.trim() === '') {
        return next(crearError('Nombre de la actividad es requerido', 400));
      }

      if (!fecha_actividad) {
        return next(crearError('Fecha de la actividad es requerida', 400));
      }

      // Validar formato de fecha
      const fecha = new Date(fecha_actividad);
      if (isNaN(fecha.getTime())) {
        return next(crearError('Formato de fecha inválido', 400));
      }

      // Validar formato de hora si se proporciona
      if (hora_actividad) {
        // Aceptar formato HH:MM o HH:MM:SS
        const horaRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
        if (!horaRegex.test(hora_actividad)) {
          return next(crearError('Formato de hora inválido (HH:MM o HH:MM:SS)', 400));
        }
      }

      const datosActividad = {
        id_tipo_actividad: parseInt(id_tipo_actividad),
        nombre: nombre.trim(),
        descripcion: descripcion ? descripcion.trim() : null,
        fecha_actividad,
        hora_actividad: hora_actividad || null,
        lugar: lugar ? lugar.trim() : null
      };

      const nuevaActividad = await ActividadReligiosaModel.crear(datosActividad);

      res.status(201).json({
        ok: true,
        mensaje: 'Actividad religiosa creada correctamente',
        datos: nuevaActividad
      });
    } catch (error) {
      if (error.code === '23505') { // Violación de restricción única
        return next(crearError('Ya existe una actividad con ese nombre', 409));
      }
      if (error.code === '23503') { // Violación de clave foránea
        return next(crearError('Tipo de actividad no válido', 400));
      }
      next(crearError('Error al crear actividad religiosa', 500, error));
    }
  }

  // Actualizar actividad
  static async actualizar(req, res, next) {
    try {
      const { id } = req.params;
      const {
        id_tipo_actividad,
        nombre,
        descripcion,
        fecha_actividad,
        hora_actividad,
        lugar
      } = req.body;

      if (!id || isNaN(id)) {
        return next(crearError('ID de actividad inválido', 400));
      }

      // Validaciones
      if (!id_tipo_actividad || isNaN(id_tipo_actividad)) {
        return next(crearError('Tipo de actividad es requerido', 400));
      }

      if (!nombre || nombre.trim() === '') {
        return next(crearError('Nombre de la actividad es requerido', 400));
      }

      if (!fecha_actividad) {
        return next(crearError('Fecha de la actividad es requerida', 400));
      }

      // Validar formato de fecha
      const fecha = new Date(fecha_actividad);
      if (isNaN(fecha.getTime())) {
        return next(crearError('Formato de fecha inválido', 400));
      }

      // Validar formato de hora si se proporciona
      if (hora_actividad) {
        // Aceptar formato HH:MM o HH:MM:SS
        const horaRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
        if (!horaRegex.test(hora_actividad)) {
          return next(crearError('Formato de hora inválido (HH:MM o HH:MM:SS)', 400));
        }
      }

      const datosActividad = {
        id_tipo_actividad: parseInt(id_tipo_actividad),
        nombre: nombre.trim(),
        descripcion: descripcion ? descripcion.trim() : null,
        fecha_actividad,
        hora_actividad: hora_actividad || null,
        lugar: lugar ? lugar.trim() : null
      };

      const actividadActualizada = await ActividadReligiosaModel.actualizar(id, datosActividad);

      if (!actividadActualizada) {
        return next(crearError('Actividad religiosa no encontrada', 404));
      }

      res.json({
        ok: true,
        mensaje: 'Actividad religiosa actualizada correctamente',
        datos: actividadActualizada
      });
    } catch (error) {
      if (error.code === '23505') { // Violación de restricción única
        return next(crearError('Ya existe una actividad con ese nombre', 409));
      }
      if (error.code === '23503') { // Violación de clave foránea
        return next(crearError('Tipo de actividad no válido', 400));
      }
      next(crearError('Error al actualizar actividad religiosa', 500, error));
    }
  }

  // Eliminar actividad
  static async eliminar(req, res, next) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return next(crearError('ID de actividad inválido', 400));
      }

      const actividadEliminada = await ActividadReligiosaModel.eliminar(id);

      if (!actividadEliminada) {
        return next(crearError('Actividad religiosa no encontrada', 404));
      }

      res.json({
        ok: true,
        mensaje: 'Actividad religiosa eliminada correctamente',
        datos: { id_actividad: parseInt(id) }
      });
    } catch (error) {
      next(crearError('Error al eliminar actividad religiosa', 500, error));
    }
  }

  // ========================================
  // TIPOS DE ACTIVIDAD
  // ========================================

  // Obtener todos los tipos de actividad
  static async obtenerTiposActividad(req, res, next) {
    try {
      const tipos = await ActividadReligiosaModel.obtenerTiposActividad();

      res.json({
        ok: true,
        mensaje: 'Tipos de actividad obtenidos correctamente',
        datos: tipos
      });
    } catch (error) {
      next(crearError('Error al obtener tipos de actividad', 500, error));
    }
  }

  // Crear nuevo tipo de actividad
  static async crearTipoActividad(req, res, next) {
    try {
      const { nombre, descripcion } = req.body;

      if (!nombre || nombre.trim() === '') {
        return next(crearError('Nombre del tipo de actividad es requerido', 400));
      }

      const datosTipo = {
        nombre: nombre.trim(),
        descripcion: descripcion ? descripcion.trim() : null
      };

      const nuevoTipo = await ActividadReligiosaModel.crearTipoActividad(datosTipo);

      res.status(201).json({
        ok: true,
        mensaje: 'Tipo de actividad creado correctamente',
        datos: nuevoTipo
      });
    } catch (error) {
      if (error.code === '23505') { // Violación de restricción única
        return next(crearError('Ya existe un tipo de actividad con ese nombre', 409));
      }
      next(crearError('Error al crear tipo de actividad', 500, error));
    }
  }

  // Actualizar tipo de actividad
  static async actualizarTipoActividad(req, res, next) {
    try {
      const { id } = req.params;
      const { nombre, descripcion } = req.body;

      if (!id || isNaN(id)) {
        return next(crearError('ID de tipo de actividad inválido', 400));
      }

      if (!nombre || nombre.trim() === '') {
        return next(crearError('Nombre del tipo de actividad es requerido', 400));
      }

      const datosTipo = {
        nombre: nombre.trim(),
        descripcion: descripcion ? descripcion.trim() : null
      };

      const tipoActualizado = await ActividadReligiosaModel.actualizarTipoActividad(id, datosTipo);

      if (!tipoActualizado) {
        return next(crearError('Tipo de actividad no encontrado', 404));
      }

      res.json({
        ok: true,
        mensaje: 'Tipo de actividad actualizado correctamente',
        datos: tipoActualizado
      });
    } catch (error) {
      if (error.code === '23505') { // Violación de restricción única
        return next(crearError('Ya existe un tipo de actividad con ese nombre', 409));
      }
      next(crearError('Error al actualizar tipo de actividad', 500, error));
    }
  }

  // Eliminar tipo de actividad
  static async eliminarTipoActividad(req, res, next) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return next(crearError('ID de tipo de actividad inválido', 400));
      }

      const tipoEliminado = await ActividadReligiosaModel.eliminarTipoActividad(id);

      if (!tipoEliminado) {
        return next(crearError('Tipo de actividad no encontrado', 404));
      }

      res.json({
        ok: true,
        mensaje: 'Tipo de actividad eliminado correctamente',
        datos: { id_tipo_actividad: parseInt(id) }
      });
    } catch (error) {
      next(crearError('Error al eliminar tipo de actividad', 500, error));
    }
  }

  // Obtener estadísticas
  static async obtenerEstadisticas(req, res, next) {
    try {
      const estadisticas = await ActividadReligiosaModel.obtenerEstadisticas();

      res.json({
        ok: true,
        mensaje: 'Estadísticas obtenidas correctamente',
        datos: estadisticas
      });
    } catch (error) {
      next(crearError('Error al obtener estadísticas', 500, error));
    }
  }
}

module.exports = ActividadReligiosaController;
