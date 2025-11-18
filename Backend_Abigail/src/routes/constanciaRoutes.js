const express = require('express');
const router = express.Router();
const constanciaController = require('../controllers/constanciaController');

// ============================================================
// RUTAS DE CONSTANCIAS
// ============================================================

// GET /api/constancias/:id_asignacion - Obtener constancia por id_asignacion
router.get('/:id_asignacion', constanciaController.obtenerConstancia);

// POST /api/constancias - Crear nueva constancia
router.post('/', constanciaController.crearConstancia);

// PUT /api/constancias/:id - Actualizar constancia
router.put('/:id', constanciaController.actualizarConstancia);

module.exports = router;


