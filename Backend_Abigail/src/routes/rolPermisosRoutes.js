const express = require('express');
const RolPermisosController = require('../controllers/rolPermisosController');
const { verificarAutenticacion, requiereRol } = require('../middlewares/authMiddleware');

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(verificarAutenticacion);

// GET /api/rol-permisos - Obtener todos los permisos (solo ADMINISTRADOR)
// Esta ruta debe ir ANTES de /:rolId para que Express la reconozca correctamente
router.get('/', requiereRol('ADMINISTRADOR'), RolPermisosController.obtenerTodos);

// GET /api/rol-permisos/:rolId - Obtener permisos por rol ID
router.get('/:rolId', RolPermisosController.obtenerPorRolId);

// POST /api/rol-permisos/:rolId - Crear o actualizar permisos (solo ADMINISTRADOR)
router.post('/:rolId', requiereRol('ADMINISTRADOR'), RolPermisosController.crearOActualizar);

// PUT /api/rol-permisos/:rolId - Crear o actualizar permisos (solo ADMINISTRADOR)
router.put('/:rolId', requiereRol('ADMINISTRADOR'), RolPermisosController.crearOActualizar);

// DELETE /api/rol-permisos/:rolId - Eliminar permisos (solo ADMINISTRADOR)
router.delete('/:rolId', requiereRol('ADMINISTRADOR'), RolPermisosController.eliminar);

module.exports = router;

