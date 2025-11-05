const { pool } = require('../config/db');

class FeligresModel {
  // Obtener todos los feligreses (sin filtros ni paginación - se aplican en el frontend)
  static async obtenerFeligreses(filtros = {}) {
    // El backend siempre devuelve TODOS los feligreses
    // Los filtros y paginación se aplican en el frontend
    let query = `
      SELECT 
        f.*,
        c.nombre as comunidad_nombre
      FROM feligres f
      LEFT JOIN cat_comunidad c ON f.id_comunidad = c.id_comunidad
      ORDER BY f.primer_apellido, f.primer_nombre
    `;

    try {
      const resultados = await pool.query(query);
      
      const total = resultados.rows.length;

      return {
        datos: resultados.rows,
        paginacion: {
          total_registros: total
        }
      };
    } catch (error) {
      throw new Error(`Error al obtener feligreses: ${error.message}`);
    }
  }

  // Obtener un feligrés por ID
  static async obtenerFeligresPorId(id) {
    const query = `
      SELECT 
        f.*,
        c.nombre as comunidad_nombre
      FROM feligres f
      LEFT JOIN cat_comunidad c ON f.id_comunidad = c.id_comunidad
      WHERE f.id_feligres = $1
    `;
    
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al obtener feligrés: ${error.message}`);
    }
  }

  // Crear nuevo feligrés
  static async crearFeligres(datos) {
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
      activo = true
    } = datos;

    const query = `
      INSERT INTO feligres (
        primer_nombre, segundo_nombre, otros_nombres,
        primer_apellido, segundo_apellido, apellido_casada,
        fecha_nacimiento, sexo, nombre_padre, nombre_madre,
        departamento, municipio, id_comunidad,
        telefono, correo, direccion, comentarios, activo
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18
      ) RETURNING *
    `;

    const params = [
      primer_nombre, segundo_nombre, otros_nombres,
      primer_apellido, segundo_apellido, apellido_casada,
      fecha_nacimiento, sexo, nombre_padre, nombre_madre,
      departamento, municipio, id_comunidad,
      telefono, correo, direccion, comentarios, activo
    ];

    try {
      const result = await pool.query(query, params);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al crear feligrés: ${error.message}`);
    }
  }

  // Actualizar feligrés
  static async actualizarFeligres(id, datos) {
    const campos = [];
    const valores = [];
    let paramCount = 0;

    // Construir dinámicamente la consulta UPDATE
    Object.keys(datos).forEach(campo => {
      if (datos[campo] !== undefined) {
        paramCount++;
        campos.push(`${campo} = $${paramCount}`);
        valores.push(datos[campo]);
      }
    });

    if (campos.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    // Agregar updated_at
    paramCount++;
    campos.push(`updated_at = $${paramCount}`);
    valores.push(new Date());

    // Agregar ID al final
    paramCount++;
    valores.push(id);

    const query = `
      UPDATE feligres 
      SET ${campos.join(', ')}
      WHERE id_feligres = $${paramCount}
      RETURNING *
    `;

    try {
      const result = await pool.query(query, valores);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al actualizar feligrés: ${error.message}`);
    }
  }

  // Eliminar feligrés (soft delete)
  static async eliminarFeligres(id) {
    const query = `
      UPDATE feligres 
      SET activo = false, updated_at = NOW()
      WHERE id_feligres = $1
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error al eliminar feligrés: ${error.message}`);
    }
  }

  // Obtener comunidades para el select
  static async obtenerComunidades() {
    const query = `
      SELECT id_comunidad, nombre 
      FROM cat_comunidad 
      WHERE activo = true 
      ORDER BY nombre
    `;

    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw new Error(`Error al obtener comunidades: ${error.message}`);
    }
  }
}

module.exports = FeligresModel;
