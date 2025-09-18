const bcrypt = require('bcrypt');
const UsuarioModel = require('../models/usuarioModel');
const { generarToken } = require('../utils/jwt');
const { crearError } = require('../utils/errorHandler');

class AuthController {
  // Login de usuario
  static async login(req, res, next) {
    try {
      console.log('🔐 Login attempt - Body:', req.body);
      const { correo, contrasena } = req.body;
      
      // Validar que se proporcionen los datos requeridos
      if (!correo || !contrasena) {
        console.log('❌ Login failed - Missing credentials');
        throw crearError('Correo y contraseña son requeridos', 400);
      }
      
      // Buscar usuario por correo
      console.log('🔍 Searching user by email:', correo);
      const usuario = await UsuarioModel.obtenerPorCorreo(correo);
      
      if (!usuario) {
        console.log('❌ Login failed - User not found');
        throw crearError('Credenciales inválidas', 401);
      }
      
      // Verificar si el usuario está activo
      if (usuario.estado !== 'ACTIVO') {
        throw crearError('Usuario inactivo', 401);
      }
      
      // Verificar contraseña
      const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena_hash);
      
      if (!contrasenaValida) {
        throw crearError('Credenciales inválidas', 401);
      }
      
      // Generar token JWT
      const token = generarToken({
        id_usuario: usuario.id_usuario,
        correo: usuario.correo,
        rol: usuario.rol_nombre
      });
      
      // Respuesta exitosa
      console.log('✅ Login successful for user:', usuario.correo);
      res.json({
        ok: true,
        mensaje: 'Inicio de sesión exitoso',
        datos: {
          token,
          usuario: {
            id_usuario: usuario.id_usuario,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            correo: usuario.correo,
            telefono: usuario.telefono,
            fotografia: usuario.fotografia,
            rol: usuario.rol_nombre
          }
        }
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Obtener información del usuario autenticado
  static async obtenerPerfil(req, res, next) {
    try {
      const usuario = await UsuarioModel.obtenerPorId(req.usuario.id_usuario);
      
      res.json({
        ok: true,
        mensaje: 'Perfil obtenido correctamente',
        datos: {
          id_usuario: usuario.id_usuario,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          correo: usuario.correo,
          telefono: usuario.telefono,
          fotografia: usuario.fotografia,
          rol: usuario.rol_nombre,
          estado: usuario.estado,
          fecha_registro: usuario.fecha_registro
        }
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Cambiar contraseña del usuario autenticado
  static async cambiarContrasena(req, res, next) {
    try {
      const { contrasena_actual, contrasena_nueva } = req.body;
      
      // Validar que se proporcionen las contraseñas
      if (!contrasena_actual || !contrasena_nueva) {
        throw crearError('Contraseña actual y nueva son requeridas', 400);
      }
      
      // Validar que la nueva contraseña sea diferente
      if (contrasena_actual === contrasena_nueva) {
        throw crearError('La nueva contraseña debe ser diferente a la actual', 400);
      }
      
      // Validar formato de la nueva contraseña
      const regexContrasena = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!regexContrasena.test(contrasena_nueva)) {
        throw crearError('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo', 400);
      }
      
      // Cambiar contraseña
      const resultado = await UsuarioModel.cambiarContrasena(
        req.usuario.id_usuario,
        contrasena_actual,
        contrasena_nueva
      );
      
      res.json({
        ok: true,
        mensaje: resultado.mensaje
      });
      
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
