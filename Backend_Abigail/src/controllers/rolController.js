const RolModel = require('../models/rolModel');
const { crearError } = require('../utils/errorHandler');

class RolController {
  // Obtener todos los roles
  static async obtenerTodos(req, res, next) {
    try {
      console.log('🔍 Obteniendo todos los roles - Usuario:', req.usuario);
      const roles = await RolModel.obtenerTodos();
      console.log('✅ Roles obtenidos:', roles);
      
      res.json({
        ok: true,
        mensaje: 'Roles obtenidos correctamente',
        datos: roles
      });
    } catch (error) {
      console.error('❌ Error al obtener roles:', error);
      next(error);
    }
  }

  // Obtener rol por ID
  static async obtenerPorId(req, res, next) {
    try {
      const { id } = req.params;
      
      if (!id) {
        throw crearError('ID de rol es requerido', 400);
      }
      
      const rol = await RolModel.obtenerPorId(parseInt(id));
      
      res.json({
        ok: true,
        mensaje: 'Rol obtenido correctamente',
        datos: rol
      });
    } catch (error) {
      next(error);
    }
  }

  // Crear nuevo rol
  static async crear(req, res, next) {
    try {
      const { nombre, descripcion } = req.body;
      
      if (!nombre || nombre.trim() === '') {
        throw crearError('El nombre del rol es requerido', 400);
      }
      
      // Verificar que no exista un rol con el mismo nombre
      try {
        const rolExistente = await RolModel.obtenerPorNombre(nombre.trim().toUpperCase());
        if (rolExistente) {
          throw crearError('Ya existe un rol con ese nombre', 400);
        }
      } catch (error) {
        // Si el error es 404 (rol no encontrado), está bien, podemos continuar
        if (error.statusCode !== 404) {
          throw error;
        }
      }
      
      const rolCreado = await RolModel.crear(nombre, descripcion);
      
      res.json({
        ok: true,
        mensaje: 'Rol creado correctamente',
        datos: rolCreado
      });
    } catch (error) {
      next(error);
    }
  }

  // Actualizar rol
  static async actualizar(req, res, next) {
    try {
      const { id } = req.params;
      const { nombre, descripcion, activo } = req.body;
      
      if (!id) {
        throw crearError('ID de rol es requerido', 400);
      }
      
      // Verificar que el rol existe
      await RolModel.obtenerPorId(parseInt(id));
      
      const datosActualizacion = {};
      if (nombre !== undefined) datosActualizacion.nombre = nombre;
      if (descripcion !== undefined) datosActualizacion.descripcion = descripcion;
      if (activo !== undefined) datosActualizacion.activo = activo;
      
      if (Object.keys(datosActualizacion).length === 0) {
        throw crearError('No hay campos para actualizar', 400);
      }
      
      const rolActualizado = await RolModel.actualizar(parseInt(id), datosActualizacion);
      
      res.json({
        ok: true,
        mensaje: 'Rol actualizado correctamente',
        datos: rolActualizado
      });
    } catch (error) {
      next(error);
    }
  }

  // Eliminar rol (soft delete)
  static async eliminar(req, res, next) {
    try {
      const { id } = req.params;
      
      if (!id) {
        throw crearError('ID de rol es requerido', 400);
      }
      
      // Verificar que el rol existe
      await RolModel.obtenerPorId(parseInt(id));
      
      await RolModel.eliminar(parseInt(id));
      
      res.json({
        ok: true,
        mensaje: 'Rol eliminado correctamente'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = RolController;

