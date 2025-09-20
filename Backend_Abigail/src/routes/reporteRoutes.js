const express = require('express');
const ReporteController = require('../controllers/reporteController');
const { verificarAutenticacion, requiereRol } = require('../middlewares/authMiddleware');

const router = express.Router();

// Aplicar autenticación y autorización de ADMINISTRADOR a todas las rutas
router.use(verificarAutenticacion);
router.use(requiereRol('ADMINISTRADOR'));

// ========================================
// REPORTES DE CAJA PARROQUIAL
// ========================================

// GET /api/reportes/caja/ingresos - Reporte de todos los ingresos
router.get('/caja/ingresos', ReporteController.obtenerReporteIngresos);

// GET /api/reportes/caja/egresos - Reporte de todos los egresos
router.get('/caja/egresos', ReporteController.obtenerReporteEgresos);

// GET /api/reportes/caja/balance - Reporte de balance completo
router.get('/caja/balance', ReporteController.obtenerReporteBalance);

// ========================================
// REPORTES DE FELIGRESES
// ========================================

// GET /api/reportes/feligreses - Reporte completo de feligreses
router.get('/feligreses', ReporteController.obtenerReporteFeligreses);

// ========================================
// REPORTES DE SACRAMENTOS
// ========================================

// GET /api/reportes/sacramentos/bautizos - Reporte de bautizos
router.get('/sacramentos/bautizos', ReporteController.obtenerReporteBautizos);

// GET /api/reportes/sacramentos/confirmaciones - Reporte de confirmaciones
router.get('/sacramentos/confirmaciones', ReporteController.obtenerReporteConfirmaciones);

// GET /api/reportes/sacramentos/matrimonios - Reporte de matrimonios
router.get('/sacramentos/matrimonios', ReporteController.obtenerReporteMatrimonios);

// GET /api/reportes/sacramentos/pendientes - Reporte de sacramentos pendientes de pago
router.get('/sacramentos/pendientes', ReporteController.obtenerReporteSacramentosPendientes);

// GET /api/reportes/sacramentos/pagados - Reporte de sacramentos pagados
router.get('/sacramentos/pagados', ReporteController.obtenerReporteSacramentosPagados);

// ========================================
// ESTADÍSTICAS GENERALES
// ========================================

// GET /api/reportes/estadisticas - Estadísticas generales del sistema
router.get('/estadisticas', ReporteController.obtenerEstadisticasGenerales);

module.exports = router;