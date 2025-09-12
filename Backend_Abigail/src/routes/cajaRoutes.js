const express = require('express');
const CajaController = require('../controllers/cajaController');
const { verificarAutenticacion, requiereRol } = require('../middlewares/authMiddleware');

const router = express.Router();

// Middleware de autenticación para todas las rutas
router.use(verificarAutenticacion);

// Rutas para movimientos de caja
router.post('/movimientos', requiereRol(['ADMINISTRADOR', 'SECRETARIO']), CajaController.crear);
router.get('/movimientos', CajaController.obtenerTodos);
router.get('/movimientos/:id_mov', CajaController.obtenerPorId);
router.put('/movimientos/:id_mov', requiereRol(['ADMINISTRADOR', 'SECRETARIO']), CajaController.actualizar);
router.delete('/movimientos/:id_mov', requiereRol(['ADMINISTRADOR']), CajaController.eliminar);

// Rutas para balances y reportes
router.get('/balance/global', CajaController.obtenerBalanceGlobal);
router.get('/balance/por-cuenta', CajaController.obtenerBalancePorCuenta);
router.get('/resumen/diario', CajaController.obtenerResumenDiario);
router.get('/kardex', CajaController.obtenerKardex);
router.get('/estadisticas', CajaController.obtenerEstadisticas);

// Rutas para catálogos
router.get('/catalogos/cuentas', CajaController.obtenerCuentas);
router.get('/catalogos/conceptos', CajaController.obtenerConceptos);
router.get('/catalogos/medios-pago', CajaController.obtenerMediosPago);

module.exports = router;
