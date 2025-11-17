const CatRolParticipanteModel = require('../models/catRolParticipanteModel');
const CatComunidadModel = require('../models/catComunidadModel');
const CatTipoEspacioModel = require('../models/catTipoEspacioModel');
const CatTipoTestigoPadrinoModel = require('../models/catTipoTestigoPadrinoModel');
const CatParrocoModel = require('../models/catParrocoModel');

// ============================================================
// CONTROLADOR DE ROLES DE PARTICIPANTE
// ============================================================

const obtenerRolesParticipante = async (req, res) => {
  try {
    // El backend siempre devuelve TODOS los roles de participante sin filtros ni paginación
    const datos = await CatRolParticipanteModel.obtenerTodos();
    const total = datos.length;

    res.json({
      ok: true,
      datos: {
        datos,
        paginacion: {
          total_registros: total
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
    // El backend siempre devuelve TODAS las comunidades sin filtros ni paginación
    const datos = await CatComunidadModel.obtenerTodos();
    const total = datos.length;

    res.json({
      ok: true,
      datos: {
        datos,
        paginacion: {
          total_registros: total
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
    // El backend siempre devuelve TODOS los tipos de espacio sin filtros ni paginación
    const datos = await CatTipoEspacioModel.obtenerTodos();
    const total = datos.length;

    res.json({
      ok: true,
      datos: {
        datos,
        paginacion: {
          total_registros: total
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

// ============================================================
// CONTROLADOR DE TIPOS DE TESTIGOS/PADRINOS
// ============================================================

const obtenerTiposTestigoPadrino = async (req, res) => {
  try {
    const { pagina = 1, limite = 10 } = req.query;
    const datos = await CatTipoTestigoPadrinoModel.obtenerTodos(parseInt(pagina), parseInt(limite));
    const total = await CatTipoTestigoPadrinoModel.contar();

    res.json({
      ok: true,
      datos: {
        datos,
        paginacion: {
          total_registros: total,
          pagina: parseInt(pagina),
          limite: parseInt(limite)
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener tipos de testigos/padrinos:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

const obtenerTipoTestigoPadrinoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const tipo = await CatTipoTestigoPadrinoModel.obtenerPorId(id);
    
    if (!tipo) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Tipo de testigo/padrino no encontrado'
      });
    }

    res.json({
      ok: true,
      datos: tipo
    });
  } catch (error) {
    console.error('Error al obtener tipo de testigo/padrino:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

const crearTipoTestigoPadrino = async (req, res) => {
  try {
    const { nombre, descripcion, activo = true } = req.body;
    
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({
        ok: false,
        mensaje: 'El nombre es requerido'
      });
    }

    const existe = await CatTipoTestigoPadrinoModel.existePorNombre(nombre);
    if (existe) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Ya existe un tipo de testigo/padrino con ese nombre'
      });
    }

    const nuevoTipo = await CatTipoTestigoPadrinoModel.crear({ nombre, descripcion, activo });
    
    res.status(201).json({
      ok: true,
      mensaje: 'Tipo de testigo/padrino creado correctamente',
      datos: nuevoTipo
    });
  } catch (error) {
    console.error('Error al crear tipo de testigo/padrino:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

const actualizarTipoTestigoPadrino = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, activo } = req.body;

    const tipoExistente = await CatTipoTestigoPadrinoModel.obtenerPorId(id);
    if (!tipoExistente) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Tipo de testigo/padrino no encontrado'
      });
    }

    if (nombre && nombre !== tipoExistente.nombre) {
      const existe = await CatTipoTestigoPadrinoModel.existePorNombre(nombre, id);
      if (existe) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Ya existe un tipo de testigo/padrino con ese nombre'
        });
      }
    }

    const tipoActualizado = await CatTipoTestigoPadrinoModel.actualizar(id, { nombre, descripcion, activo });
    
    res.json({
      ok: true,
      mensaje: 'Tipo de testigo/padrino actualizado correctamente',
      datos: tipoActualizado
    });
  } catch (error) {
    console.error('Error al actualizar tipo de testigo/padrino:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

const eliminarTipoTestigoPadrino = async (req, res) => {
  try {
    const { id } = req.params;

    const tipoExistente = await CatTipoTestigoPadrinoModel.obtenerPorId(id);
    if (!tipoExistente) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Tipo de testigo/padrino no encontrado'
      });
    }

    await CatTipoTestigoPadrinoModel.eliminar(id);
    
    res.json({
      ok: true,
      mensaje: 'Tipo de testigo/padrino eliminado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar tipo de testigo/padrino:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

const obtenerTiposTestigoPadrinoActivos = async (req, res) => {
  try {
    const tipos = await CatTipoTestigoPadrinoModel.obtenerActivos();
    
    res.json({
      ok: true,
      datos: tipos
    });
  } catch (error) {
    console.error('Error al obtener tipos de testigos/padrinos activos:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

// ============================================================
// CONTROLADOR DE PÁRROCOS
// ============================================================

const obtenerParrocos = async (req, res) => {
  try {
    const { pagina = 1, limite = 10 } = req.query;
    const datos = await CatParrocoModel.obtenerTodos(parseInt(pagina), parseInt(limite));
    const total = await CatParrocoModel.contar();

    res.json({
      ok: true,
      datos: {
        datos,
        paginacion: {
          total: total,
          total_registros: total,
          pagina: parseInt(pagina),
          limite: parseInt(limite)
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener párrocos:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

const obtenerParrocoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const parroco = await CatParrocoModel.obtenerPorId(id);
    
    if (!parroco) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Párroco no encontrado'
      });
    }

    res.json({
      ok: true,
      datos: parroco
    });
  } catch (error) {
    console.error('Error al obtener párroco:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

const crearParroco = async (req, res) => {
  try {
    const { nombre, apellido, activo = true } = req.body;
    
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({
        ok: false,
        mensaje: 'El nombre es requerido'
      });
    }

    if (!apellido || apellido.trim() === '') {
      return res.status(400).json({
        ok: false,
        mensaje: 'El apellido es requerido'
      });
    }

    const existe = await CatParrocoModel.existePorNombreApellido(nombre.trim(), apellido.trim());
    if (existe) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Ya existe un párroco con ese nombre y apellido'
      });
    }

    const nuevoParroco = await CatParrocoModel.crear({ 
      nombre: nombre.trim(), 
      apellido: apellido.trim(), 
      activo 
    });
    
    res.status(201).json({
      ok: true,
      mensaje: 'Párroco creado correctamente',
      datos: nuevoParroco
    });
  } catch (error) {
    console.error('Error al crear párroco:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

const actualizarParroco = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, activo } = req.body;

    const parrocoExistente = await CatParrocoModel.obtenerPorId(id);
    if (!parrocoExistente) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Párroco no encontrado'
      });
    }

    if (nombre && apellido && 
        (nombre.trim() !== parrocoExistente.nombre || apellido.trim() !== parrocoExistente.apellido)) {
      const existe = await CatParrocoModel.existePorNombreApellido(nombre.trim(), apellido.trim(), id);
      if (existe) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Ya existe otro párroco con ese nombre y apellido'
        });
      }
    }

    const parrocoActualizado = await CatParrocoModel.actualizar(id, {
      nombre: nombre?.trim(),
      apellido: apellido?.trim(),
      activo
    });
    
    res.json({
      ok: true,
      mensaje: 'Párroco actualizado correctamente',
      datos: parrocoActualizado
    });
  } catch (error) {
    console.error('Error al actualizar párroco:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

const eliminarParroco = async (req, res) => {
  try {
    const { id } = req.params;

    const parrocoExistente = await CatParrocoModel.obtenerPorId(id);
    if (!parrocoExistente) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Párroco no encontrado'
      });
    }

    await CatParrocoModel.eliminar(id);
    
    res.json({
      ok: true,
      mensaje: 'Párroco eliminado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar párroco:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
};

const obtenerParrocosActivos = async (req, res) => {
  try {
    const parrocos = await CatParrocoModel.obtenerActivos();
    
    res.json({
      ok: true,
      datos: parrocos
    });
  } catch (error) {
    console.error('Error al obtener párrocos activos:', error);
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
  obtenerTiposEspacioActivos,
  
  // Tipos de Testigos/Padrinos
  obtenerTiposTestigoPadrino,
  obtenerTipoTestigoPadrinoPorId,
  crearTipoTestigoPadrino,
  actualizarTipoTestigoPadrino,
  eliminarTipoTestigoPadrino,
  obtenerTiposTestigoPadrinoActivos,
  
  // Párrocos
  obtenerParrocos,
  obtenerParrocoPorId,
  crearParroco,
  actualizarParroco,
  eliminarParroco,
  obtenerParrocosActivos
};
