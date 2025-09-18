const express = require('express');
const UsuarioController = require('../controllers/usuarioController');
const { 
  verificarAutenticacion, 
  requiereRol, 
  puedeAccederUsuario, 
  puedeModificarUsuario 
} = require('../middlewares/authMiddleware');
const { validarSubida } = require('../middlewares/uploadMiddleware');

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(verificarAutenticacion);

// POST /api/usuarios - Crear nuevo usuario (solo ADMINISTRADOR)
router.post('/', requiereRol('ADMINISTRADOR'), validarSubida, UsuarioController.crear);

// GET /api/usuarios - Obtener todos los usuarios con paginación y filtros (solo ADMINISTRADOR)
router.get('/', requiereRol('ADMINISTRADOR'), UsuarioController.obtenerTodos);

// GET /api/usuarios/:id_usuario - Obtener usuario por ID (ADMINISTRADOR o propio usuario)
router.get('/:id_usuario', puedeAccederUsuario, UsuarioController.obtenerPorId);

// PUT /api/usuarios/:id_usuario - Actualizar usuario (ADMINISTRADOR o propio usuario con restricciones)
router.put('/:id_usuario', puedeModificarUsuario, validarSubida, UsuarioController.actualizar);

// DELETE /api/usuarios/:id_usuario - Eliminar usuario (solo ADMINISTRADOR)
router.delete('/:id_usuario', requiereRol('ADMINISTRADOR'), UsuarioController.eliminar);

// POST /api/usuarios/:id_usuario/cambiar-contrasena - Cambiar contraseña de usuario específico (solo ADMINISTRADOR)
router.post('/:id_usuario/cambiar-contrasena', requiereRol('ADMINISTRADOR'), UsuarioController.cambiarContrasenaUsuario);

module.exports = router;
