const express = require('express');
const router = express.Router();
const constanciaExternaController = require('../controllers/constanciaExternaController');
const { verificarAutenticacion } = require('../middlewares/authMiddleware');

// Todas las rutas requieren autenticación
router.use(verificarAutenticacion);

// GET /api/constancias-externas - Obtener todas las constancias externas
router.get('/', constanciaExternaController.obtenerTodas);

// GET /api/constancias-externas/:id - Obtener constancia externa por ID
router.get('/:id', constanciaExternaController.obtenerPorId);

// POST /api/constancias-externas - Crear nueva constancia externa
router.post('/', constanciaExternaController.crear);

// PUT /api/constancias-externas/:id - Actualizar constancia externa
router.put('/:id', constanciaExternaController.actualizar);

// DELETE /api/constancias-externas/:id - Eliminar constancia externa (soft delete)
router.delete('/:id', constanciaExternaController.eliminar);

module.exports = router;

