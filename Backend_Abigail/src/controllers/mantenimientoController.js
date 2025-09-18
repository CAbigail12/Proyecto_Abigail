const CatSacramentoModel = require('../models/catSacramentoModel');
const CatTipoDocumentoModel = require('../models/catTipoDocumentoModel');
const CatRequisitoModel = require('../models/catRequisitoModel');
const RequisitoPorSacramentoModel = require('../models/requisitoPorSacramentoModel');
const CatRolParticipanteModel = require('../models/catRolParticipanteModel');
const CatComunidadModel = require('../models/catComunidadModel');
const CatTipoEspacioModel = require('../models/catTipoEspacioModel');

// ============================================================
// CONTROLADOR DE SACRAMENTOS
// ============================================================

const obtenerSacramentos = async (req, res) => {
  try {
    const { pagina = 1, limite = 10, busqueda = '', activo = '' } = req.query;
    const filtros = { busqueda, activo };
    
    const [datos, total] = await Promise.all([
      CatSacramentoModel.obtenerTodos(parseInt(pagina), parseInt(limite), filtros),
      CatSacramentoModel.contar(filtros)
    ]);

    res.json({
      ok: true,
      datos: {
        datos,
        paginacion: {
          pagina: parseInt(pagina),
          limite: parseInt(limite),
          total,
          totalPaginas: Math.ceil(total / parseInt(limite))
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener sacramentos:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

const obtenerSacramentoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const sacramento = await CatSacramentoModel.obtenerPorId(id);
    
    if (!sacramento) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Sacramento no encontrado'
      });
    }

    res.json({
      ok: true,
      datos: sacramento
    });
  } catch (error) {
    console.error('Error al obtener sacramento:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

const crearSacramento = async (req, res) => {
  try {
    const { nombre, descripcion, activo = true } = req.body;

    // Validaciones
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({
        ok: false,
        mensaje: 'El nombre es requerido'
      });
    }

    // Verificar si ya existe
    const existe = await CatSacramentoModel.existePorNombre(nombre.trim());
    if (existe) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Ya existe un sacramento con ese nombre'
      });
    }

    const nuevoSacramento = await CatSacramentoModel.crear({
      nombre: nombre.trim(),
      descripcion: descripcion?.trim() || null,
      activo
    });

    res.status(201).json({
      ok: true,
      mensaje: 'Sacramento creado correctamente',
      datos: nuevoSacramento
    });
  } catch (error) {
    console.error('Error al crear sacramento:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

const actualizarSacramento = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, activo } = req.body;

    // Verificar si existe
    const sacramentoExistente = await CatSacramentoModel.obtenerPorId(id);
    if (!sacramentoExistente) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Sacramento no encontrado'
      });
    }

    // Validaciones
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({
        ok: false,
        mensaje: 'El nombre es requerido'
      });
    }

    // Verificar si ya existe otro con el mismo nombre
    const existe = await CatSacramentoModel.existePorNombre(nombre.trim(), id);
    if (existe) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Ya existe otro sacramento con ese nombre'
      });
    }

    const sacramentoActualizado = await CatSacramentoModel.actualizar(id, {
      nombre: nombre.trim(),
      descripcion: descripcion?.trim() || null,
      activo
    });

    res.json({
      ok: true,
      mensaje: 'Sacramento actualizado correctamente',
      datos: sacramentoActualizado
    });
  } catch (error) {
    console.error('Error al actualizar sacramento:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

const eliminarSacramento = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si existe
    const sacramentoExistente = await CatSacramentoModel.obtenerPorId(id);
    if (!sacramentoExistente) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Sacramento no encontrado'
      });
    }

    await CatSacramentoModel.eliminar(id);

    res.json({
      ok: true,
      mensaje: 'Sacramento eliminado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar sacramento:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

const obtenerSacramentosActivos = async (req, res) => {
  try {
    const sacramentos = await CatSacramentoModel.obtenerActivos();
    res.json({
      ok: true,
      datos: sacramentos
    });
  } catch (error) {
    console.error('Error al obtener sacramentos activos:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

// ============================================================
// CONTROLADOR DE TIPOS DE DOCUMENTO
// ============================================================

const obtenerTiposDocumento = async (req, res) => {
  try {
    const { pagina = 1, limite = 10, busqueda = '', activo = '' } = req.query;
    const filtros = { busqueda, activo };
    
    const [datos, total] = await Promise.all([
      CatTipoDocumentoModel.obtenerTodos(parseInt(pagina), parseInt(limite), filtros),
      CatTipoDocumentoModel.contar(filtros)
    ]);

    res.json({
      ok: true,
      datos: {
        datos,
        paginacion: {
          pagina: parseInt(pagina),
          limite: parseInt(limite),
          total,
          totalPaginas: Math.ceil(total / parseInt(limite))
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener tipos de documento:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

const obtenerTipoDocumentoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const tipoDocumento = await CatTipoDocumentoModel.obtenerPorId(id);
    
    if (!tipoDocumento) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Tipo de documento no encontrado'
      });
    }

    res.json({
      ok: true,
      datos: tipoDocumento
    });
  } catch (error) {
    console.error('Error al obtener tipo de documento:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

const crearTipoDocumento = async (req, res) => {
  try {
    const { nombre, descripcion, activo = true } = req.body;

    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({
        ok: false,
        mensaje: 'El nombre es requerido'
      });
    }

    const existe = await CatTipoDocumentoModel.existePorNombre(nombre.trim());
    if (existe) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Ya existe un tipo de documento con ese nombre'
      });
    }

    const nuevoTipoDocumento = await CatTipoDocumentoModel.crear({
      nombre: nombre.trim(),
      descripcion: descripcion?.trim() || null,
      activo
    });

    res.status(201).json({
      ok: true,
      mensaje: 'Tipo de documento creado correctamente',
      datos: nuevoTipoDocumento
    });
  } catch (error) {
    console.error('Error al crear tipo de documento:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

const actualizarTipoDocumento = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, activo } = req.body;

    const tipoDocumentoExistente = await CatTipoDocumentoModel.obtenerPorId(id);
    if (!tipoDocumentoExistente) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Tipo de documento no encontrado'
      });
    }

    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({
        ok: false,
        mensaje: 'El nombre es requerido'
      });
    }

    const existe = await CatTipoDocumentoModel.existePorNombre(nombre.trim(), id);
    if (existe) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Ya existe otro tipo de documento con ese nombre'
      });
    }

    const tipoDocumentoActualizado = await CatTipoDocumentoModel.actualizar(id, {
      nombre: nombre.trim(),
      descripcion: descripcion?.trim() || null,
      activo
    });

    res.json({
      ok: true,
      mensaje: 'Tipo de documento actualizado correctamente',
      datos: tipoDocumentoActualizado
    });
  } catch (error) {
    console.error('Error al actualizar tipo de documento:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

const eliminarTipoDocumento = async (req, res) => {
  try {
    const { id } = req.params;

    const tipoDocumentoExistente = await CatTipoDocumentoModel.obtenerPorId(id);
    if (!tipoDocumentoExistente) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Tipo de documento no encontrado'
      });
    }

    await CatTipoDocumentoModel.eliminar(id);

    res.json({
      ok: true,
      mensaje: 'Tipo de documento eliminado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar tipo de documento:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

const obtenerTiposDocumentoActivos = async (req, res) => {
  try {
    const tiposDocumento = await CatTipoDocumentoModel.obtenerActivos();
    res.json({
      ok: true,
      datos: tiposDocumento
    });
  } catch (error) {
    console.error('Error al obtener tipos de documento activos:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = {
  // Sacramentos
  obtenerSacramentos,
  obtenerSacramentoPorId,
  crearSacramento,
  actualizarSacramento,
  eliminarSacramento,
  obtenerSacramentosActivos,
  
  // Tipos de Documento
  obtenerTiposDocumento,
  obtenerTipoDocumentoPorId,
  crearTipoDocumento,
  actualizarTipoDocumento,
  eliminarTipoDocumento,
  obtenerTiposDocumentoActivos
};
