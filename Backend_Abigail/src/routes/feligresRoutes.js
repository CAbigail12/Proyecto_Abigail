const express = require('express');
const router = express.Router();
const FeligresController = require('../controllers/feligresController');
const { verificarAutenticacion } = require('../middlewares/authMiddleware');

// Aplicar middleware de autenticación a todas las rutas
router.use(verificarAutenticacion);

// Rutas para feligreses
router.get('/', FeligresController.obtenerFeligreses);
router.get('/comunidades', FeligresController.obtenerComunidades);
router.get('/:id', FeligresController.obtenerFeligresPorId);
router.post('/', FeligresController.crearFeligres);
router.put('/:id', FeligresController.actualizarFeligres);
router.delete('/:id', FeligresController.eliminarFeligres);

module.exports = router;
