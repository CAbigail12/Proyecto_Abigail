const express = require('express');
const SacramentoAsignacionController = require('../controllers/sacramentoAsignacionController');
const { verificarAutenticacion, requiereRol } = require('../middlewares/authMiddleware');

const router = express.Router();

// Middleware de autenticación para todas las rutas
router.use(verificarAutenticacion);

// Middleware de validación básica (las validaciones detalladas están en el controlador con Joi)
const validarAsignacion = (req, res, next) => {
  // Validación básica - las validaciones detalladas se hacen en el controlador con Joi
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({
      ok: false,
      mensaje: 'Datos de entrada requeridos'
    });
  }
  next();
};

// Rutas para asignaciones de sacramentos
router.post('/asignaciones', 
  requiereRol(['ADMINISTRADOR', 'SECRETARIO']), 
  validarAsignacion, 
  SacramentoAsignacionController.crear
);

router.get('/asignaciones', SacramentoAsignacionController.obtenerTodos);

router.get('/asignaciones/:id', SacramentoAsignacionController.obtenerPorId);

router.put('/asignaciones/:id', 
  requiereRol(['ADMINISTRADOR', 'SECRETARIO']), 
  validarAsignacion, 
  SacramentoAsignacionController.actualizar
);

router.delete('/asignaciones/:id', 
  requiereRol(['ADMINISTRADOR']), 
  SacramentoAsignacionController.eliminar
);

// Rutas para catálogos
router.get('/sacramentos', SacramentoAsignacionController.obtenerSacramentos);

router.get('/roles-participante', SacramentoAsignacionController.obtenerRolesParticipante);

// Ruta para estadísticas
router.get('/estadisticas', SacramentoAsignacionController.obtenerEstadisticas);

module.exports = router;
