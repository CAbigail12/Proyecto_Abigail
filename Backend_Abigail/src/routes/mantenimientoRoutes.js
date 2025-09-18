const express = require('express');
const router = express.Router();

// Importar controladores
const mantenimientoController = require('../controllers/mantenimientoController');
const mantenimientoController2 = require('../controllers/mantenimientoController2');
const mantenimientoController3 = require('../controllers/mantenimientoController3');

// Importar middleware de autenticación
const { verificarAutenticacion } = require('../middlewares/authMiddleware');

// Aplicar middleware de autenticación a todas las rutas
router.use(verificarAutenticacion);

// ============================================================
// RUTAS DE SACRAMENTOS
// ============================================================

// GET /api/mantenimiento/sacramentos - Obtener todos los sacramentos
router.get('/sacramentos', mantenimientoController.obtenerSacramentos);

// GET /api/mantenimiento/sacramentos/activos - Obtener sacramentos activos
router.get('/sacramentos/activos', mantenimientoController.obtenerSacramentosActivos);

// GET /api/mantenimiento/sacramentos/:id - Obtener sacramento por ID
router.get('/sacramentos/:id', mantenimientoController.obtenerSacramentoPorId);

// POST /api/mantenimiento/sacramentos - Crear nuevo sacramento
router.post('/sacramentos', mantenimientoController.crearSacramento);

// PUT /api/mantenimiento/sacramentos/:id - Actualizar sacramento
router.put('/sacramentos/:id', mantenimientoController.actualizarSacramento);

// DELETE /api/mantenimiento/sacramentos/:id - Eliminar sacramento
router.delete('/sacramentos/:id', mantenimientoController.eliminarSacramento);

// ============================================================
// RUTAS DE TIPOS DE DOCUMENTO
// ============================================================

// GET /api/mantenimiento/tipos-documento - Obtener todos los tipos de documento
router.get('/tipos-documento', mantenimientoController.obtenerTiposDocumento);

// GET /api/mantenimiento/tipos-documento/activos - Obtener tipos de documento activos
router.get('/tipos-documento/activos', mantenimientoController.obtenerTiposDocumentoActivos);

// GET /api/mantenimiento/tipos-documento/:id - Obtener tipo de documento por ID
router.get('/tipos-documento/:id', mantenimientoController.obtenerTipoDocumentoPorId);

// POST /api/mantenimiento/tipos-documento - Crear nuevo tipo de documento
router.post('/tipos-documento', mantenimientoController.crearTipoDocumento);

// PUT /api/mantenimiento/tipos-documento/:id - Actualizar tipo de documento
router.put('/tipos-documento/:id', mantenimientoController.actualizarTipoDocumento);

// DELETE /api/mantenimiento/tipos-documento/:id - Eliminar tipo de documento
router.delete('/tipos-documento/:id', mantenimientoController.eliminarTipoDocumento);

// ============================================================
// RUTAS DE REQUISITOS
// ============================================================

// GET /api/mantenimiento/requisitos - Obtener todos los requisitos
router.get('/requisitos', mantenimientoController2.obtenerRequisitos);

// GET /api/mantenimiento/requisitos/activos - Obtener requisitos activos
router.get('/requisitos/activos', mantenimientoController2.obtenerRequisitosActivos);

// GET /api/mantenimiento/requisitos/:id - Obtener requisito por ID
router.get('/requisitos/:id', mantenimientoController2.obtenerRequisitoPorId);

// POST /api/mantenimiento/requisitos - Crear nuevo requisito
router.post('/requisitos', mantenimientoController2.crearRequisito);

// PUT /api/mantenimiento/requisitos/:id - Actualizar requisito
router.put('/requisitos/:id', mantenimientoController2.actualizarRequisito);

// DELETE /api/mantenimiento/requisitos/:id - Eliminar requisito
router.delete('/requisitos/:id', mantenimientoController2.eliminarRequisito);

// ============================================================
// RUTAS DE REQUISITOS POR SACRAMENTO
// ============================================================

// GET /api/mantenimiento/requisitos-por-sacramento - Obtener todas las relaciones
router.get('/requisitos-por-sacramento', mantenimientoController2.obtenerRequisitosPorSacramento);

// GET /api/mantenimiento/requisitos-por-sacramento/:idSacramento/:idRequisito - Obtener relación específica
router.get('/requisitos-por-sacramento/:idSacramento/:idRequisito', mantenimientoController2.obtenerRequisitoPorSacramentoPorIds);

// GET /api/mantenimiento/sacramentos/:idSacramento/requisitos - Obtener requisitos de un sacramento
router.get('/sacramentos/:idSacramento/requisitos', mantenimientoController2.obtenerRequisitosDeSacramento);

// POST /api/mantenimiento/requisitos-por-sacramento - Crear nueva relación
router.post('/requisitos-por-sacramento', mantenimientoController2.crearRequisitoPorSacramento);

// PUT /api/mantenimiento/requisitos-por-sacramento/:idSacramento/:idRequisito - Actualizar relación
router.put('/requisitos-por-sacramento/:idSacramento/:idRequisito', mantenimientoController2.actualizarRequisitoPorSacramento);

// DELETE /api/mantenimiento/requisitos-por-sacramento/:idSacramento/:idRequisito - Eliminar relación
router.delete('/requisitos-por-sacramento/:idSacramento/:idRequisito', mantenimientoController2.eliminarRequisitoPorSacramento);

// ============================================================
// RUTAS DE ROLES DE PARTICIPANTE
// ============================================================

// GET /api/mantenimiento/roles-participante - Obtener todos los roles de participante
router.get('/roles-participante', mantenimientoController3.obtenerRolesParticipante);

// GET /api/mantenimiento/roles-participante/activos - Obtener roles de participante activos
router.get('/roles-participante/activos', mantenimientoController3.obtenerRolesParticipanteActivos);

// GET /api/mantenimiento/roles-participante/:id - Obtener rol de participante por ID
router.get('/roles-participante/:id', mantenimientoController3.obtenerRolParticipantePorId);

// POST /api/mantenimiento/roles-participante - Crear nuevo rol de participante
router.post('/roles-participante', mantenimientoController3.crearRolParticipante);

// PUT /api/mantenimiento/roles-participante/:id - Actualizar rol de participante
router.put('/roles-participante/:id', mantenimientoController3.actualizarRolParticipante);

// DELETE /api/mantenimiento/roles-participante/:id - Eliminar rol de participante
router.delete('/roles-participante/:id', mantenimientoController3.eliminarRolParticipante);

// ============================================================
// RUTAS DE COMUNIDADES
// ============================================================

// GET /api/mantenimiento/comunidades - Obtener todas las comunidades
router.get('/comunidades', mantenimientoController3.obtenerComunidades);

// GET /api/mantenimiento/comunidades/activas - Obtener comunidades activas
router.get('/comunidades/activas', mantenimientoController3.obtenerComunidadesActivas);

// GET /api/mantenimiento/comunidades/:id - Obtener comunidad por ID
router.get('/comunidades/:id', mantenimientoController3.obtenerComunidadPorId);

// POST /api/mantenimiento/comunidades - Crear nueva comunidad
router.post('/comunidades', mantenimientoController3.crearComunidad);

// PUT /api/mantenimiento/comunidades/:id - Actualizar comunidad
router.put('/comunidades/:id', mantenimientoController3.actualizarComunidad);

// DELETE /api/mantenimiento/comunidades/:id - Eliminar comunidad
router.delete('/comunidades/:id', mantenimientoController3.eliminarComunidad);

// ============================================================
// RUTAS DE TIPOS DE ESPACIO
// ============================================================

// GET /api/mantenimiento/tipos-espacio - Obtener todos los tipos de espacio
router.get('/tipos-espacio', mantenimientoController3.obtenerTiposEspacio);

// GET /api/mantenimiento/tipos-espacio/activos - Obtener tipos de espacio activos
router.get('/tipos-espacio/activos', mantenimientoController3.obtenerTiposEspacioActivos);

// GET /api/mantenimiento/tipos-espacio/:id - Obtener tipo de espacio por ID
router.get('/tipos-espacio/:id', mantenimientoController3.obtenerTipoEspacioPorId);

// POST /api/mantenimiento/tipos-espacio - Crear nuevo tipo de espacio
router.post('/tipos-espacio', mantenimientoController3.crearTipoEspacio);

// PUT /api/mantenimiento/tipos-espacio/:id - Actualizar tipo de espacio
router.put('/tipos-espacio/:id', mantenimientoController3.actualizarTipoEspacio);

// DELETE /api/mantenimiento/tipos-espacio/:id - Eliminar tipo de espacio
router.delete('/tipos-espacio/:id', mantenimientoController3.eliminarTipoEspacio);

module.exports = router;
