const express = require('express');
const router = express.Router();
const SacramentoEventoController = require('../controllers/sacramentoEventoController');
const { verificarAutenticacion } = require('../middlewares/authMiddleware');

// Aplicar middleware de autenticación a todas las rutas
router.use(verificarAutenticacion);

// CRUD de sacramento_evento con token
router.post('/', SacramentoEventoController.crearEvento);
router.get('/', SacramentoEventoController.obtenerEventos);
router.get('/:id', SacramentoEventoController.obtenerEventoPorId);
router.put('/:id', SacramentoEventoController.actualizarEvento);
router.delete('/:id', SacramentoEventoController.eliminarEvento);


module.exports = router;
