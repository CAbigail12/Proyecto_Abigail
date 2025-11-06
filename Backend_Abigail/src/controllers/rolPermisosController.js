const RolPermisosModel = require('../models/rolPermisosModel');
const { crearError } = require('../utils/errorHandler');

class RolPermisosController {
  // Obtener permisos por rol ID
  static async obtenerPorRolId(req, res, next) {
    try {
      const { rolId } = req.params;
      
      console.log('🔍 Obteniendo permisos para rol ID:', rolId);
      
      if (!rolId || rolId === 'undefined' || rolId === 'null') {
        return res.status(400).json({
          ok: false,
          mensaje: 'ID de rol es requerido'
        });
      }
      
      const rolIdNum = parseInt(rolId);
      if (isNaN(rolIdNum)) {
        return res.status(400).json({
          ok: false,
          mensaje: 'ID de rol inválido'
        });
      }
      
      const permisos = await RolPermisosModel.obtenerPorRolId(rolIdNum);
      
      console.log('📋 Permisos encontrados:', permisos);
      
      if (!permisos) {
        console.log('⚠️ No se encontraron permisos para el rol ID:', rolIdNum);
        return res.json({
          ok: true,
          mensaje: 'No se encontraron permisos para este rol',
          datos: { 
            rol_id: rolIdNum,
            permisos_menu: {} 
          }
        });
      }
      
      // Asegurar que permisos_menu sea un objeto
      let permisosMenu = permisos.permisos_menu;
      if (typeof permisosMenu === 'string') {
        try {
          permisosMenu = JSON.parse(permisosMenu);
        } catch (e) {
          console.error('Error al parsear permisos_menu en controller:', e);
          permisosMenu = {};
        }
      }
      
      console.log('✅ Permisos parseados:', permisosMenu);
      
      res.json({
        ok: true,
        mensaje: 'Permisos obtenidos correctamente',
        datos: {
          ...permisos,
          permisos_menu: permisosMenu
        }
      });
    } catch (error) {
      console.error('❌ Error en obtenerPorRolId:', error);
      next(error);
    }
  }

  // Crear o actualizar permisos
  static async crearOActualizar(req, res, next) {
    try {
      const { rolId } = req.params;
      const { permisos_menu } = req.body;
      
      if (!rolId) {
        throw crearError('ID de rol es requerido', 400);
      }
      
      if (!permisos_menu || typeof permisos_menu !== 'object') {
        throw crearError('permisos_menu debe ser un objeto JSON válido', 400);
      }
      
      const resultado = await RolPermisosModel.crearOActualizar(
        parseInt(rolId),
        permisos_menu
      );
      
      res.json({
        ok: true,
        mensaje: 'Permisos guardados correctamente',
        datos: resultado
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener todos los permisos
  static async obtenerTodos(req, res, next) {
    try {
      const permisos = await RolPermisosModel.obtenerTodos();
      
      res.json({
        ok: true,
        mensaje: 'Permisos obtenidos correctamente',
        datos: permisos
      });
    } catch (error) {
      next(error);
    }
  }

  // Eliminar permisos
  static async eliminar(req, res, next) {
    try {
      const { rolId } = req.params;
      
      if (!rolId) {
        throw crearError('ID de rol es requerido', 400);
      }
      
      const resultado = await RolPermisosModel.eliminar(parseInt(rolId));
      
      res.json({
        ok: true,
        mensaje: resultado.mensaje,
        datos: resultado
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = RolPermisosController;

