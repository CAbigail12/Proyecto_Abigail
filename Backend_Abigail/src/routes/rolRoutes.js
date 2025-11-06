const express = require('express');
const RolController = require('../controllers/rolController');
const { verificarAutenticacion, requiereRol } = require('../middlewares/authMiddleware');

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(verificarAutenticacion);

// GET /api/roles - Obtener todos los roles (solo ADMINISTRADOR)
router.get('/', requiereRol('ADMINISTRADOR'), RolController.obtenerTodos);

// GET /api/roles/:id - Obtener rol por ID (solo ADMINISTRADOR)
router.get('/:id', requiereRol('ADMINISTRADOR'), RolController.obtenerPorId);

// POST /api/roles - Crear nuevo rol (solo ADMINISTRADOR)
router.post('/', requiereRol('ADMINISTRADOR'), RolController.crear);

// PUT /api/roles/:id - Actualizar rol (solo ADMINISTRADOR)
router.put('/:id', requiereRol('ADMINISTRADOR'), RolController.actualizar);

// DELETE /api/roles/:id - Eliminar rol (solo ADMINISTRADOR)
router.delete('/:id', requiereRol('ADMINISTRADOR'), RolController.eliminar);

module.exports = router;

