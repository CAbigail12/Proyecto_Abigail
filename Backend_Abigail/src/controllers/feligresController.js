const FeligresModel = require('../models/feligresModel');

class FeligresController {
  // Obtener todos los feligreses con filtros y paginación
  static async obtenerFeligreses(req, res) {
    try {
      const filtros = {
        busqueda: req.query.busqueda || '',
        activo: req.query.activo || '',
        id_comunidad: req.query.id_comunidad || '',
        sexo: req.query.sexo || '',
        pagina: parseInt(req.query.pagina) || 1,
        limite: parseInt(req.query.limite) || 10
      };

      const resultado = await FeligresModel.obtenerFeligreses(filtros);

      res.json({
        ok: true,
        mensaje: 'Feligreses obtenidos correctamente',
        datos: resultado
      });
    } catch (error) {
      console.error('Error en obtenerFeligreses:', error);
      res.status(500).json({
        ok: false,
        mensaje: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener un feligrés por ID
  static async obtenerFeligresPorId(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          ok: false,
          mensaje: 'ID de feligrés inválido'
        });
      }

      const feligres = await FeligresModel.obtenerFeligresPorId(id);

      if (!feligres) {
        return res.status(404).json({
          ok: false,
          mensaje: 'Feligrés no encontrado'
        });
      }

      res.json({
        ok: true,
        mensaje: 'Feligrés obtenido correctamente',
        datos: feligres
      });
    } catch (error) {
      console.error('Error en obtenerFeligresPorId:', error);
      res.status(500).json({
        ok: false,
        mensaje: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Crear nuevo feligrés
  static async crearFeligres(req, res) {
    try {
      const {
        primer_nombre,
        segundo_nombre,
        otros_nombres,
        primer_apellido,
        segundo_apellido,
        apellido_casada,
        fecha_nacimiento,
        sexo,
        nombre_padre,
        nombre_madre,
        departamento,
        municipio,
        id_comunidad,
        telefono,
        correo,
        direccion,
        comentarios,
        activo
      } = req.body;

      // Validaciones básicas
      if (!primer_nombre || !primer_apellido) {
        return res.status(400).json({
          ok: false,
          mensaje: 'El primer nombre y primer apellido son obligatorios'
        });
      }

      const datosFeligres = {
        primer_nombre: primer_nombre.trim(),
        segundo_nombre: segundo_nombre?.trim() || null,
        otros_nombres: otros_nombres?.trim() || null,
        primer_apellido: primer_apellido.trim(),
        segundo_apellido: segundo_apellido?.trim() || null,
        apellido_casada: apellido_casada?.trim() || null,
        fecha_nacimiento: fecha_nacimiento || null,
        sexo: sexo?.trim() || null,
        nombre_padre: nombre_padre?.trim() || null,
        nombre_madre: nombre_madre?.trim() || null,
        departamento: departamento?.trim() || null,
        municipio: municipio?.trim() || null,
        id_comunidad: id_comunidad || null,
        telefono: telefono?.trim() || null,
        correo: correo?.trim() || null,
        direccion: direccion?.trim() || null,
        comentarios: comentarios?.trim() || null,
        activo: activo !== undefined ? activo : true
      };

      const nuevoFeligres = await FeligresModel.crearFeligres(datosFeligres);

      res.status(201).json({
        ok: true,
        mensaje: 'Feligrés creado correctamente',
        datos: nuevoFeligres
      });
    } catch (error) {
      console.error('Error en crearFeligres:', error);
      res.status(500).json({
        ok: false,
        mensaje: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Actualizar feligrés
  static async actualizarFeligres(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          ok: false,
          mensaje: 'ID de feligrés inválido'
        });
      }

      const {
        primer_nombre,
        segundo_nombre,
        otros_nombres,
        primer_apellido,
        segundo_apellido,
        apellido_casada,
        fecha_nacimiento,
        sexo,
        nombre_padre,
        nombre_madre,
        departamento,
        municipio,
        id_comunidad,
        telefono,
        correo,
        direccion,
        comentarios,
        activo
      } = req.body;

      // Validaciones básicas
      if (primer_nombre !== undefined && !primer_nombre.trim()) {
        return res.status(400).json({
          ok: false,
          mensaje: 'El primer nombre no puede estar vacío'
        });
      }

      if (primer_apellido !== undefined && !primer_apellido.trim()) {
        return res.status(400).json({
          ok: false,
          mensaje: 'El primer apellido no puede estar vacío'
        });
      }

      const datosActualizacion = {};
      
      // Solo incluir campos que se proporcionaron
      if (primer_nombre !== undefined) datosActualizacion.primer_nombre = primer_nombre.trim();
      if (segundo_nombre !== undefined) datosActualizacion.segundo_nombre = segundo_nombre?.trim() || null;
      if (otros_nombres !== undefined) datosActualizacion.otros_nombres = otros_nombres?.trim() || null;
      if (primer_apellido !== undefined) datosActualizacion.primer_apellido = primer_apellido.trim();
      if (segundo_apellido !== undefined) datosActualizacion.segundo_apellido = segundo_apellido?.trim() || null;
      if (apellido_casada !== undefined) datosActualizacion.apellido_casada = apellido_casada?.trim() || null;
      if (fecha_nacimiento !== undefined) datosActualizacion.fecha_nacimiento = fecha_nacimiento || null;
      if (sexo !== undefined) datosActualizacion.sexo = sexo?.trim() || null;
      if (nombre_padre !== undefined) datosActualizacion.nombre_padre = nombre_padre?.trim() || null;
      if (nombre_madre !== undefined) datosActualizacion.nombre_madre = nombre_madre?.trim() || null;
      if (departamento !== undefined) datosActualizacion.departamento = departamento?.trim() || null;
      if (municipio !== undefined) datosActualizacion.municipio = municipio?.trim() || null;
      if (id_comunidad !== undefined) datosActualizacion.id_comunidad = id_comunidad || null;
      if (telefono !== undefined) datosActualizacion.telefono = telefono?.trim() || null;
      if (correo !== undefined) datosActualizacion.correo = correo?.trim() || null;
      if (direccion !== undefined) datosActualizacion.direccion = direccion?.trim() || null;
      if (comentarios !== undefined) datosActualizacion.comentarios = comentarios?.trim() || null;
      if (activo !== undefined) datosActualizacion.activo = activo;

      const feligresActualizado = await FeligresModel.actualizarFeligres(id, datosActualizacion);

      if (!feligresActualizado) {
        return res.status(404).json({
          ok: false,
          mensaje: 'Feligrés no encontrado'
        });
      }

      res.json({
        ok: true,
        mensaje: 'Feligrés actualizado correctamente',
        datos: feligresActualizado
      });
    } catch (error) {
      console.error('Error en actualizarFeligres:', error);
      res.status(500).json({
        ok: false,
        mensaje: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Eliminar feligrés (soft delete)
  static async eliminarFeligres(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          ok: false,
          mensaje: 'ID de feligrés inválido'
        });
      }

      const feligresEliminado = await FeligresModel.eliminarFeligres(id);

      if (!feligresEliminado) {
        return res.status(404).json({
          ok: false,
          mensaje: 'Feligrés no encontrado'
        });
      }

      res.json({
        ok: true,
        mensaje: 'Feligrés eliminado correctamente',
        datos: feligresEliminado
      });
    } catch (error) {
      console.error('Error en eliminarFeligres:', error);
      res.status(500).json({
        ok: false,
        mensaje: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener comunidades para el select
  static async obtenerComunidades(req, res) {
    try {
      const comunidades = await FeligresModel.obtenerComunidades();

      res.json({
        ok: true,
        mensaje: 'Comunidades obtenidas correctamente',
        datos: comunidades
      });
    } catch (error) {
      console.error('Error en obtenerComunidades:', error);
      res.status(500).json({
        ok: false,
        mensaje: 'Error interno del servidor',
        error: error.message
      });
    }
  }
}

module.exports = FeligresController;
