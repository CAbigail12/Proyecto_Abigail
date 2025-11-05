const { pool } = require('../config/db');

class ActividadReligiosaModel {
  // ========================================
  // MÉTODOS PARA ACTIVIDADES RELIGIOSAS
  // ========================================

  // Obtener todas las actividades (sin filtros ni paginación - se aplican en el frontend)
  static async obtenerTodas(filtros = {}) {
    const cliente = await pool.connect();
    try {
      // El backend siempre devuelve TODAS las actividades activas
      // Los filtros y paginación se aplican en el frontend
      const query = `
        SELECT 
          ar.id_actividad,
          ar.id_tipo_actividad,
          ar.nombre,
          ar.descripcion,
          ar.fecha_actividad,
          ar.hora_actividad,
          ar.lugar,
          ar.activo,
          ar.created_at,
          ar.updated_at,
          cta.nombre as tipo_actividad_nombre,
          cta.descripcion as tipo_actividad_descripcion
        FROM actividad_religiosa ar
        INNER JOIN cat_tipo_actividad cta ON ar.id_tipo_actividad = cta.id_tipo_actividad
        WHERE ar.activo = true
        ORDER BY ar.fecha_actividad DESC, ar.hora_actividad ASC
      `;

      const resultado = await cliente.query(query);
      const total = resultado.rows.length;

      return {
        actividades: resultado.rows,
        total,
        pagina: 1,
        limite: total,
        totalPaginas: 1
      };
    } finally {
      cliente.release();
    }
  }

  // Obtener una actividad por ID
  static async obtenerPorId(id) {
    const cliente = await pool.connect();
    try {
      const query = `
        SELECT 
          ar.id_actividad,
          ar.id_tipo_actividad,
          ar.nombre,
          ar.descripcion,
          ar.fecha_actividad,
          ar.hora_actividad,
          ar.lugar,
          ar.activo,
          ar.created_at,
          ar.updated_at,
          cta.nombre as tipo_actividad_nombre,
          cta.descripcion as tipo_actividad_descripcion
        FROM actividad_religiosa ar
        INNER JOIN cat_tipo_actividad cta ON ar.id_tipo_actividad = cta.id_tipo_actividad
        WHERE ar.id_actividad = $1 AND ar.activo = true
      `;
      
      const resultado = await cliente.query(query, [id]);
      return resultado.rows[0] || null;
    } finally {
      cliente.release();
    }
  }

  // Crear nueva actividad
  static async crear(datos) {
    const cliente = await pool.connect();
    try {
      const {
        id_tipo_actividad,
        nombre,
        descripcion,
        fecha_actividad,
        hora_actividad,
        lugar
      } = datos;

      const query = `
        INSERT INTO actividad_religiosa (
          id_tipo_actividad, nombre, descripcion, 
          fecha_actividad, hora_actividad, lugar
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;

      const params = [
        id_tipo_actividad,
        nombre,
        descripcion,
        fecha_actividad,
        hora_actividad || null,
        lugar || null
      ];

      const resultado = await cliente.query(query, params);
      return resultado.rows[0];
    } finally {
      cliente.release();
    }
  }

  // Actualizar actividad
  static async actualizar(id, datos) {
    const cliente = await pool.connect();
    try {
      const {
        id_tipo_actividad,
        nombre,
        descripcion,
        fecha_actividad,
        hora_actividad,
        lugar
      } = datos;

      const query = `
        UPDATE actividad_religiosa SET
          id_tipo_actividad = $2,
          nombre = $3,
          descripcion = $4,
          fecha_actividad = $5,
          hora_actividad = $6,
          lugar = $7,
          updated_at = NOW()
        WHERE id_actividad = $1 AND activo = true
        RETURNING *
      `;

      const params = [
        id,
        id_tipo_actividad,
        nombre,
        descripcion,
        fecha_actividad,
        hora_actividad || null,
        lugar || null
      ];

      const resultado = await cliente.query(query, params);
      return resultado.rows[0] || null;
    } finally {
      cliente.release();
    }
  }

  // Eliminar actividad (soft delete)
  static async eliminar(id) {
    const cliente = await pool.connect();
    try {
      const query = `
        UPDATE actividad_religiosa SET
          activo = false,
          updated_at = NOW()
        WHERE id_actividad = $1 AND activo = true
        RETURNING id_actividad
      `;

      const resultado = await cliente.query(query, [id]);
      return resultado.rows[0] || null;
    } finally {
      cliente.release();
    }
  }

  // ========================================
  // MÉTODOS PARA TIPOS DE ACTIVIDAD
  // ========================================

  // Obtener todos los tipos de actividad
  static async obtenerTiposActividad() {
    const cliente = await pool.connect();
    try {
      const query = `
        SELECT 
          id_tipo_actividad,
          nombre,
          descripcion,
          activo,
          created_at,
          updated_at
        FROM cat_tipo_actividad
        WHERE activo = true
        ORDER BY nombre ASC
      `;

      const resultado = await cliente.query(query);
      return resultado.rows;
    } finally {
      cliente.release();
    }
  }

  // Crear nuevo tipo de actividad
  static async crearTipoActividad(datos) {
    const cliente = await pool.connect();
    try {
      const { nombre, descripcion } = datos;

      const query = `
        INSERT INTO cat_tipo_actividad (nombre, descripcion)
        VALUES ($1, $2)
        RETURNING *
      `;

      const resultado = await cliente.query(query, [nombre, descripcion]);
      return resultado.rows[0];
    } finally {
      cliente.release();
    }
  }

  // Actualizar tipo de actividad
  static async actualizarTipoActividad(id, datos) {
    const cliente = await pool.connect();
    try {
      const { nombre, descripcion } = datos;

      const query = `
        UPDATE cat_tipo_actividad SET
          nombre = $2,
          descripcion = $3,
          updated_at = NOW()
        WHERE id_tipo_actividad = $1 AND activo = true
        RETURNING *
      `;

      const resultado = await cliente.query(query, [id, nombre, descripcion]);
      return resultado.rows[0] || null;
    } finally {
      cliente.release();
    }
  }

  // Eliminar tipo de actividad (soft delete)
  static async eliminarTipoActividad(id) {
    const cliente = await pool.connect();
    try {
      const query = `
        UPDATE cat_tipo_actividad SET
          activo = false,
          updated_at = NOW()
        WHERE id_tipo_actividad = $1 AND activo = true
        RETURNING id_tipo_actividad
      `;

      const resultado = await cliente.query(query, [id]);
      return resultado.rows[0] || null;
    } finally {
      cliente.release();
    }
  }

  // Obtener estadísticas
  static async obtenerEstadisticas() {
    const cliente = await pool.connect();
    try {
      const query = `
        SELECT 
          COUNT(*) as total_actividades,
          COUNT(CASE WHEN fecha_actividad >= CURRENT_DATE THEN 1 END) as actividades_futuras,
          COUNT(CASE WHEN fecha_actividad < CURRENT_DATE THEN 1 END) as actividades_pasadas,
          COUNT(DISTINCT id_tipo_actividad) as tipos_actividad_utilizados
        FROM actividad_religiosa
        WHERE activo = true
      `;

      const resultado = await cliente.query(query);
      return resultado.rows[0];
    } finally {
      cliente.release();
    }
  }
}

module.exports = ActividadReligiosaModel;
