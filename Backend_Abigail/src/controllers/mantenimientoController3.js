const CatRolParticipanteModel = require('../models/catRolParticipanteModel');
const CatComunidadModel = require('../models/catComunidadModel');
const CatTipoEspacioModel = require('../models/catTipoEspacioModel');

// ============================================================
// CONTROLADOR DE ROLES DE PARTICIPANTE
// ============================================================

const obtenerRolesParticipante = async (req, res) => {
  try {
    const { pagina = 1, limite = 10, busqueda = '', activo = '' } = req.query;
    const filtros = { busqueda, activo };
    
    const [datos, total] = await Promise.all([
      CatRolParticipanteModel.obtenerTodos(parseInt(pagina), parseInt(limite), filtros),
      CatRolParticipanteModel.contar(filtros)
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
    console.error('Error al obtener roles de participante:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

const obtenerRolParticipantePorId = async (req, res) => {
  try {
    const { id } = req.params;
    const rolParticipante = await CatRolParticipanteModel.obtenerPorId(id);
    
    if (!rolParticipante) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Rol de participante no encontrado'
      });
    }

    res.json({
      ok: true,
      datos: rolParticipante
    });
  } catch (error) {
    console.error('Error al obtener rol de participante:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

const crearRolParticipante = async (req, res) => {
  try {
    const { nombre, descripcion, activo = true } = req.body;

    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({
        ok: false,
        mensaje: 'El nombre es requerido'
      });
    }

    const existe = await CatRolParticipanteModel.existePorNombre(nombre.trim());
    if (existe) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Ya existe un rol de participante con ese nombre'
      });
    }

    const nuevoRolParticipante = await CatRolParticipanteModel.crear({
      nombre: nombre.trim(),
      descripcion: descripcion?.trim() || null,
      activo
    });

    res.status(201).json({
      ok: true,
      mensaje: 'Rol de participante creado correctamente',
      datos: nuevoRolParticipante
    });
  } catch (error) {
    console.error('Error al crear rol de participante:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

const actualizarRolParticipante = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, activo } = req.body;

    const rolParticipanteExistente = await CatRolParticipanteModel.obtenerPorId(id);
    if (!rolParticipanteExistente) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Rol de participante no encontrado'
      });
    }

    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({
        ok: false,
        mensaje: 'El nombre es requerido'
      });
    }

    const existe = await CatRolParticipanteModel.existePorNombre(nombre.trim(), id);
    if (existe) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Ya existe otro rol de participante con ese nombre'
      });
    }

    const rolParticipanteActualizado = await CatRolParticipanteModel.actualizar(id, {
      nombre: nombre.trim(),
      descripcion: descripcion?.trim() || null,
      activo
    });

    res.json({
      ok: true,
      mensaje: 'Rol de participante actualizado correctamente',
      datos: rolParticipanteActualizado
    });
  } catch (error) {
    console.error('Error al actualizar rol de participante:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

const eliminarRolParticipante = async (req, res) => {
  try {
    const { id } = req.params;

    const rolParticipanteExistente = await CatRolParticipanteModel.obtenerPorId(id);
    if (!rolParticipanteExistente) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Rol de participante no encontrado'
      });
    }

    await CatRolParticipanteModel.eliminar(id);

    res.json({
      ok: true,
      mensaje: 'Rol de participante eliminado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar rol de participante:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

const obtenerRolesParticipanteActivos = async (req, res) => {
  try {
    const rolesParticipante = await CatRolParticipanteModel.obtenerActivos();
    res.json({
      ok: true,
      datos: rolesParticipante
    });
  } catch (error) {
    console.error('Error al obtener roles de participante activos:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

// ============================================================
// CONTROLADOR DE COMUNIDADES
// ============================================================

const obtenerComunidades = async (req, res) => {
  try {
    const { pagina = 1, limite = 10, busqueda = '', activo = '' } = req.query;
    const filtros = { busqueda, activo };
    
    const [datos, total] = await Promise.all([
      CatComunidadModel.obtenerTodos(parseInt(pagina), parseInt(limite), filtros),
      CatComunidadModel.contar(filtros)
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
    console.error('Error al obtener comunidades:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

const obtenerComunidadPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const comunidad = await CatComunidadModel.obtenerPorId(id);
    
    if (!comunidad) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Comunidad no encontrada'
      });
    }

    res.json({
      ok: true,
      datos: comunidad
    });
  } catch (error) {
    console.error('Error al obtener comunidad:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

const crearComunidad = async (req, res) => {
  try {
    const { nombre, descripcion, activo = true } = req.body;

    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({
        ok: false,
        mensaje: 'El nombre es requerido'
      });
    }

    const existe = await CatComunidadModel.existePorNombre(nombre.trim());
    if (existe) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Ya existe una comunidad con ese nombre'
      });
    }

    const nuevaComunidad = await CatComunidadModel.crear({
      nombre: nombre.trim(),
      descripcion: descripcion?.trim() || null,
      activo
    });

    res.status(201).json({
      ok: true,
      mensaje: 'Comunidad creada correctamente',
      datos: nuevaComunidad
    });
  } catch (error) {
    console.error('Error al crear comunidad:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

const actualizarComunidad = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, activo } = req.body;

    const comunidadExistente = await CatComunidadModel.obtenerPorId(id);
    if (!comunidadExistente) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Comunidad no encontrada'
      });
    }

    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({
        ok: false,
        mensaje: 'El nombre es requerido'
      });
    }

    const existe = await CatComunidadModel.existePorNombre(nombre.trim(), id);
    if (existe) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Ya existe otra comunidad con ese nombre'
      });
    }

    const comunidadActualizada = await CatComunidadModel.actualizar(id, {
      nombre: nombre.trim(),
      descripcion: descripcion?.trim() || null,
      activo
    });

    res.json({
      ok: true,
      mensaje: 'Comunidad actualizada correctamente',
      datos: comunidadActualizada
    });
  } catch (error) {
    console.error('Error al actualizar comunidad:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

const eliminarComunidad = async (req, res) => {
  try {
    const { id } = req.params;

    const comunidadExistente = await CatComunidadModel.obtenerPorId(id);
    if (!comunidadExistente) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Comunidad no encontrada'
      });
    }

    await CatComunidadModel.eliminar(id);

    res.json({
      ok: true,
      mensaje: 'Comunidad eliminada correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar comunidad:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

const obtenerComunidadesActivas = async (req, res) => {
  try {
    const comunidades = await CatComunidadModel.obtenerActivas();
    res.json({
      ok: true,
      datos: comunidades
    });
  } catch (error) {
    console.error('Error al obtener comunidades activas:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

// ============================================================
// CONTROLADOR DE TIPOS DE ESPACIO
// ============================================================

const obtenerTiposEspacio = async (req, res) => {
  try {
    const { pagina = 1, limite = 10, busqueda = '', activo = '' } = req.query;
    const filtros = { busqueda, activo };
    
    const [datos, total] = await Promise.all([
      CatTipoEspacioModel.obtenerTodos(parseInt(pagina), parseInt(limite), filtros),
      CatTipoEspacioModel.contar(filtros)
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
    console.error('Error al obtener tipos de espacio:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

const obtenerTipoEspacioPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const tipoEspacio = await CatTipoEspacioModel.obtenerPorId(id);
    
    if (!tipoEspacio) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Tipo de espacio no encontrado'
      });
    }

    res.json({
      ok: true,
      datos: tipoEspacio
    });
  } catch (error) {
    console.error('Error al obtener tipo de espacio:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

const crearTipoEspacio = async (req, res) => {
  try {
    const { nombre, descripcion, activo = true } = req.body;

    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({
        ok: false,
        mensaje: 'El nombre es requerido'
      });
    }

    const existe = await CatTipoEspacioModel.existePorNombre(nombre.trim());
    if (existe) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Ya existe un tipo de espacio con ese nombre'
      });
    }

    const nuevoTipoEspacio = await CatTipoEspacioModel.crear({
      nombre: nombre.trim(),
      descripcion: descripcion?.trim() || null,
      activo
    });

    res.status(201).json({
      ok: true,
      mensaje: 'Tipo de espacio creado correctamente',
      datos: nuevoTipoEspacio
    });
  } catch (error) {
    console.error('Error al crear tipo de espacio:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

const actualizarTipoEspacio = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, activo } = req.body;

    const tipoEspacioExistente = await CatTipoEspacioModel.obtenerPorId(id);
    if (!tipoEspacioExistente) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Tipo de espacio no encontrado'
      });
    }

    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({
        ok: false,
        mensaje: 'El nombre es requerido'
      });
    }

    const existe = await CatTipoEspacioModel.existePorNombre(nombre.trim(), id);
    if (existe) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Ya existe otro tipo de espacio con ese nombre'
      });
    }

    const tipoEspacioActualizado = await CatTipoEspacioModel.actualizar(id, {
      nombre: nombre.trim(),
      descripcion: descripcion?.trim() || null,
      activo
    });

    res.json({
      ok: true,
      mensaje: 'Tipo de espacio actualizado correctamente',
      datos: tipoEspacioActualizado
    });
  } catch (error) {
    console.error('Error al actualizar tipo de espacio:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

const eliminarTipoEspacio = async (req, res) => {
  try {
    const { id } = req.params;

    const tipoEspacioExistente = await CatTipoEspacioModel.obtenerPorId(id);
    if (!tipoEspacioExistente) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Tipo de espacio no encontrado'
      });
    }

    await CatTipoEspacioModel.eliminar(id);

    res.json({
      ok: true,
      mensaje: 'Tipo de espacio eliminado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar tipo de espacio:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

const obtenerTiposEspacioActivos = async (req, res) => {
  try {
    const tiposEspacio = await CatTipoEspacioModel.obtenerActivos();
    res.json({
      ok: true,
      datos: tiposEspacio
    });
  } catch (error) {
    console.error('Error al obtener tipos de espacio activos:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = {
  // Roles de Participante
  obtenerRolesParticipante,
  obtenerRolParticipantePorId,
  crearRolParticipante,
  actualizarRolParticipante,
  eliminarRolParticipante,
  obtenerRolesParticipanteActivos,
  
  // Comunidades
  obtenerComunidades,
  obtenerComunidadPorId,
  crearComunidad,
  actualizarComunidad,
  eliminarComunidad,
  obtenerComunidadesActivas,
  
  // Tipos de Espacio
  obtenerTiposEspacio,
  obtenerTipoEspacioPorId,
  crearTipoEspacio,
  actualizarTipoEspacio,
  eliminarTipoEspacio,
  obtenerTiposEspacioActivos
};
