const express = require('express');
const router = express.Router();
const ActividadReligiosaController = require('../controllers/actividadReligiosaController');
const { verificarAutenticacion } = require('../middlewares/authMiddleware');

// Aplicar middleware de autenticación a todas las rutas
router.use(verificarAutenticacion);

// ========================================
// RUTAS PARA ACTIVIDADES RELIGIOSAS
// ========================================

// GET /api/actividades-religiosas - Obtener todas las actividades con filtros
router.get('/', ActividadReligiosaController.obtenerTodas);

// GET /api/actividades-religiosas/estadisticas - Obtener estadísticas
router.get('/estadisticas', ActividadReligiosaController.obtenerEstadisticas);

// GET /api/actividades-religiosas/:id - Obtener una actividad por ID
router.get('/:id', ActividadReligiosaController.obtenerPorId);

// POST /api/actividades-religiosas - Crear nueva actividad
router.post('/', ActividadReligiosaController.crear);

// PUT /api/actividades-religiosas/:id - Actualizar actividad
router.put('/:id', ActividadReligiosaController.actualizar);

// DELETE /api/actividades-religiosas/:id - Eliminar actividad
router.delete('/:id', ActividadReligiosaController.eliminar);

// ========================================
// RUTAS PARA TIPOS DE ACTIVIDAD
// ========================================

// GET /api/actividades-religiosas/tipos - Obtener todos los tipos de actividad
router.get('/tipos/actividad', ActividadReligiosaController.obtenerTiposActividad);

// POST /api/actividades-religiosas/tipos - Crear nuevo tipo de actividad
router.post('/tipos/actividad', ActividadReligiosaController.crearTipoActividad);

// PUT /api/actividades-religiosas/tipos/:id - Actualizar tipo de actividad
router.put('/tipos/actividad/:id', ActividadReligiosaController.actualizarTipoActividad);

// DELETE /api/actividades-religiosas/tipos/:id - Eliminar tipo de actividad
router.delete('/tipos/actividad/:id', ActividadReligiosaController.eliminarTipoActividad);

module.exports = router;
