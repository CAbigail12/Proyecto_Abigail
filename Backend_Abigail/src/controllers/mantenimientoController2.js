const CatRequisitoModel = require('../models/catRequisitoModel');
const RequisitoPorSacramentoModel = require('../models/requisitoPorSacramentoModel');
const CatRolParticipanteModel = require('../models/catRolParticipanteModel');
const CatComunidadModel = require('../models/catComunidadModel');
const CatTipoEspacioModel = require('../models/catTipoEspacioModel');

// ============================================================
// CONTROLADOR DE REQUISITOS
// ============================================================

const obtenerRequisitos = async (req, res) => {
  try {
    const { pagina = 1, limite = 10, busqueda = '', activo = '' } = req.query;
    const filtros = { busqueda, activo };
    
    const [datos, total] = await Promise.all([
      CatRequisitoModel.obtenerTodos(parseInt(pagina), parseInt(limite), filtros),
      CatRequisitoModel.contar(filtros)
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
    console.error('Error al obtener requisitos:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

const obtenerRequisitoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const requisito = await CatRequisitoModel.obtenerPorId(id);
    
    if (!requisito) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Requisito no encontrado'
      });
    }

    res.json({
      ok: true,
      datos: requisito
    });
  } catch (error) {
    console.error('Error al obtener requisito:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

const crearRequisito = async (req, res) => {
  try {
    const { nombre, descripcion, activo = true } = req.body;

    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({
        ok: false,
        mensaje: 'El nombre es requerido'
      });
    }

    const existe = await CatRequisitoModel.existePorNombre(nombre.trim());
    if (existe) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Ya existe un requisito con ese nombre'
      });
    }

    const nuevoRequisito = await CatRequisitoModel.crear({
      nombre: nombre.trim(),
      descripcion: descripcion?.trim() || null,
      activo
    });

    res.status(201).json({
      ok: true,
      mensaje: 'Requisito creado correctamente',
      datos: nuevoRequisito
    });
  } catch (error) {
    console.error('Error al crear requisito:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

const actualizarRequisito = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, activo } = req.body;

    const requisitoExistente = await CatRequisitoModel.obtenerPorId(id);
    if (!requisitoExistente) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Requisito no encontrado'
      });
    }

    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({
        ok: false,
        mensaje: 'El nombre es requerido'
      });
    }

    const existe = await CatRequisitoModel.existePorNombre(nombre.trim(), id);
    if (existe) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Ya existe otro requisito con ese nombre'
      });
    }

    const requisitoActualizado = await CatRequisitoModel.actualizar(id, {
      nombre: nombre.trim(),
      descripcion: descripcion?.trim() || null,
      activo
    });

    res.json({
      ok: true,
      mensaje: 'Requisito actualizado correctamente',
      datos: requisitoActualizado
    });
  } catch (error) {
    console.error('Error al actualizar requisito:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

const eliminarRequisito = async (req, res) => {
  try {
    const { id } = req.params;

    const requisitoExistente = await CatRequisitoModel.obtenerPorId(id);
    if (!requisitoExistente) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Requisito no encontrado'
      });
    }

    await CatRequisitoModel.eliminar(id);

    res.json({
      ok: true,
      mensaje: 'Requisito eliminado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar requisito:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

const obtenerRequisitosActivos = async (req, res) => {
  try {
    const requisitos = await CatRequisitoModel.obtenerActivos();
    res.json({
      ok: true,
      datos: requisitos
    });
  } catch (error) {
    console.error('Error al obtener requisitos activos:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

// ============================================================
// CONTROLADOR DE REQUISITOS POR SACRAMENTO
// ============================================================

const obtenerRequisitosPorSacramento = async (req, res) => {
  try {
    const { pagina = 1, limite = 10, id_sacramento, id_requisito, obligatorio = '', busqueda = '' } = req.query;
    const filtros = { id_sacramento, id_requisito, obligatorio, busqueda };
    
    const [datos, total] = await Promise.all([
      RequisitoPorSacramentoModel.obtenerTodos(parseInt(pagina), parseInt(limite), filtros),
      RequisitoPorSacramentoModel.contar(filtros)
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
    console.error('Error al obtener requisitos por sacramento:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

const obtenerRequisitoPorSacramentoPorIds = async (req, res) => {
  try {
    const { idSacramento, idRequisito } = req.params;
    const relacion = await RequisitoPorSacramentoModel.obtenerPorIds(idSacramento, idRequisito);
    
    if (!relacion) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Relación no encontrada'
      });
    }

    res.json({
      ok: true,
      datos: relacion
    });
  } catch (error) {
    console.error('Error al obtener relación:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

const crearRequisitoPorSacramento = async (req, res) => {
  try {
    const { id_sacramento, id_requisito, obligatorio = true, orden } = req.body;

    if (!id_sacramento || !id_requisito) {
      return res.status(400).json({
        ok: false,
        mensaje: 'ID de sacramento e ID de requisito son requeridos'
      });
    }

    const existe = await RequisitoPorSacramentoModel.existeRelacion(id_sacramento, id_requisito);
    if (existe) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Ya existe esta relación'
      });
    }

    // Si no se proporciona orden, obtener el siguiente
    let ordenFinal = orden;
    if (!ordenFinal) {
      ordenFinal = await RequisitoPorSacramentoModel.obtenerSiguienteOrden(id_sacramento);
    }

    const nuevaRelacion = await RequisitoPorSacramentoModel.crear({
      id_sacramento,
      id_requisito,
      obligatorio,
      orden: ordenFinal
    });

    res.status(201).json({
      ok: true,
      mensaje: 'Relación creada correctamente',
      datos: nuevaRelacion
    });
  } catch (error) {
    console.error('Error al crear relación:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

const actualizarRequisitoPorSacramento = async (req, res) => {
  try {
    const { idSacramento, idRequisito } = req.params;
    const { obligatorio, orden } = req.body;

    const relacionExistente = await RequisitoPorSacramentoModel.obtenerPorIds(idSacramento, idRequisito);
    if (!relacionExistente) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Relación no encontrada'
      });
    }

    const relacionActualizada = await RequisitoPorSacramentoModel.actualizar(idSacramento, idRequisito, {
      obligatorio,
      orden
    });

    res.json({
      ok: true,
      mensaje: 'Relación actualizada correctamente',
      datos: relacionActualizada
    });
  } catch (error) {
    console.error('Error al actualizar relación:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

const eliminarRequisitoPorSacramento = async (req, res) => {
  try {
    const { idSacramento, idRequisito } = req.params;

    const relacionExistente = await RequisitoPorSacramentoModel.obtenerPorIds(idSacramento, idRequisito);
    if (!relacionExistente) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Relación no encontrada'
      });
    }

    await RequisitoPorSacramentoModel.eliminar(idSacramento, idRequisito);

    res.json({
      ok: true,
      mensaje: 'Relación eliminada correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar relación:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

const obtenerRequisitosDeSacramento = async (req, res) => {
  try {
    const { idSacramento } = req.params;
    const requisitos = await RequisitoPorSacramentoModel.obtenerRequisitosPorSacramento(idSacramento);
    res.json({
      ok: true,
      datos: requisitos
    });
  } catch (error) {
    console.error('Error al obtener requisitos del sacramento:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = {
  // Requisitos
  obtenerRequisitos,
  obtenerRequisitoPorId,
  crearRequisito,
  actualizarRequisito,
  eliminarRequisito,
  obtenerRequisitosActivos,
  
  // Requisitos por Sacramento
  obtenerRequisitosPorSacramento,
  obtenerRequisitoPorSacramentoPorIds,
  crearRequisitoPorSacramento,
  actualizarRequisitoPorSacramento,
  eliminarRequisitoPorSacramento,
  obtenerRequisitosDeSacramento
};
