const { extraerToken, verificarToken } = require('../utils/jwt');
const { crearError } = require('../utils/errorHandler');
const { pool } = require('../config/db');
const RolPermisosModel = require('../models/rolPermisosModel');

// Middleware para verificar autenticación
const verificarAutenticacion = async (req, res, next) => {
  try {
    const token = extraerToken(req);
    const datosToken = verificarToken(token);
    
    // Verificar que el usuario existe en la base de datos
    const cliente = await pool.connect();
    const resultado = await cliente.query(
      `SELECT u.id_usuario, u.correo, u.estado, r.nombre as rol
       FROM usuarios u
       JOIN roles r ON u.rol_id = r.id_rol
       WHERE u.id_usuario = $1 AND u.estado = 'ACTIVO'`,
      [datosToken.id_usuario]
    );
    cliente.release();
    
    if (resultado.rows.length === 0) {
      throw crearError('Usuario no encontrado o inactivo', 401);
    }
    
    const usuario = resultado.rows[0];
    req.usuario = {
      id_usuario: usuario.id_usuario,
      correo: usuario.correo,
      rol: usuario.rol
    };
    
    next();
  } catch (error) {
    next(error);
  }
};

// Middleware para verificar rol específico
const requiereRol = (rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      console.log('❌ requiereRol - Usuario no autenticado');
      return next(crearError('Autenticación requerida', 401));
    }
    
    const roles = Array.isArray(rolesPermitidos) ? rolesPermitidos : [rolesPermitidos];
    console.log('🔍 Verificando rol - Usuario rol:', req.usuario.rol, 'Roles permitidos:', roles);
    
    if (!roles.includes(req.usuario.rol)) {
      console.log('❌ requiereRol - Rol no permitido. Usuario:', req.usuario.rol, 'Permitidos:', roles);
      return next(crearError('No tienes permisos para realizar esta acción', 403));
    }
    
    console.log('✅ requiereRol - Acceso permitido');
    next();
  };
};

// Middleware para verificar que el usuario puede acceder a sus propios datos
const puedeAccederUsuario = (req, res, next) => {
  const idUsuarioSolicitado = parseInt(req.params.id_usuario);
  
  if (!req.usuario) {
    return next(crearError('Autenticación requerida', 401));
  }
  
  // Los administradores pueden acceder a cualquier usuario
  if (req.usuario.rol === 'ADMINISTRADOR') {
    return next();
  }
  
  // Los usuarios solo pueden acceder a sus propios datos
  if (req.usuario.id_usuario !== idUsuarioSolicitado) {
    return next(crearError('No tienes permisos para acceder a estos datos', 403));
  }
  
  next();
};

// Middleware para verificar que el usuario puede modificar sus propios datos
const puedeModificarUsuario = (req, res, next) => {
  const idUsuarioSolicitado = parseInt(req.params.id_usuario);
  
  if (!req.usuario) {
    return next(crearError('Autenticación requerida', 401));
  }
  
  // Los administradores pueden modificar cualquier usuario
  if (req.usuario.rol === 'ADMINISTRADOR') {
    return next();
  }
  
  // Los usuarios solo pueden modificar sus propios datos
  if (req.usuario.id_usuario !== idUsuarioSolicitado) {
    return next(crearError('No tienes permisos para modificar estos datos', 403));
  }
  
  // Los usuarios no pueden cambiar su rol ni estado
  if (req.body.rol_id || req.body.estado) {
    return next(crearError('No puedes cambiar tu rol o estado', 403));
  }
  
  next();
};

// Middleware para verificar permisos del menú
const requierePermisoMenu = (permisoRequerido) => {
  return async (req, res, next) => {
    try {
      if (!req.usuario) {
        console.log('❌ requierePermisoMenu - Usuario no autenticado');
        return next(crearError('Autenticación requerida', 401));
      }
      
      // Los administradores siempre tienen acceso
      if (req.usuario.rol === 'ADMINISTRADOR') {
        console.log('✅ requierePermisoMenu - Administrador, acceso permitido');
        return next();
      }
      
      // Obtener permisos del rol del usuario
      const cliente = await pool.connect();
      try {
        const usuarioCompleto = await cliente.query(
          'SELECT rol_id FROM usuarios WHERE id_usuario = $1',
          [req.usuario.id_usuario]
        );
        
        if (usuarioCompleto.rows.length === 0) {
          cliente.release();
          return next(crearError('Usuario no encontrado', 404));
        }
        
        const rolId = usuarioCompleto.rows[0].rol_id;
        const permisos = await RolPermisosModel.obtenerPorRolId(rolId);
        
        cliente.release();
        
        if (!permisos || !permisos.permisos_menu) {
          console.log('❌ requierePermisoMenu - No hay permisos configurados para el rol');
          return next(crearError('No tienes permisos para realizar esta acción', 403));
        }
        
        let permisosMenu = permisos.permisos_menu;
        if (typeof permisosMenu === 'string') {
          try {
            permisosMenu = JSON.parse(permisosMenu);
          } catch (e) {
            console.error('Error al parsear permisos_menu:', e);
            permisosMenu = {};
          }
        }
        
        console.log('🔍 Verificando permiso - Permiso requerido:', permisoRequerido);
        console.log('🔍 Permisos del usuario:', permisosMenu);
        
        // Verificar si el usuario tiene el permiso requerido
        if (permisosMenu[permisoRequerido] === true) {
          console.log('✅ requierePermisoMenu - Permiso concedido');
          return next();
        } else {
          console.log('❌ requierePermisoMenu - Permiso denegado. Permiso requerido:', permisoRequerido, 'Permisos:', permisosMenu);
          return next(crearError('No tienes permisos para realizar esta acción', 403));
        }
      } catch (error) {
        if (cliente) {
          cliente.release();
        }
        console.error('❌ Error al verificar permisos:', error);
        return next(crearError('Error al verificar permisos', 500));
      }
    } catch (error) {
      console.error('❌ Error en requierePermisoMenu:', error);
      return next(crearError('Error al verificar permisos', 500));
    }
  };
};

module.exports = {
  verificarAutenticacion,
  requiereRol,
  puedeAccederUsuario,
  puedeModificarUsuario,
  requierePermisoMenu
};
