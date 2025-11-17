const { pool } = require('../config/db');

class CatParrocoModel {
  // Obtener todos los párrocos (sin filtros ni paginación - se aplican en el frontend)
  static async obtenerTodos(pagina = 1, limite = 10, filtros = {}) {
    // El backend siempre devuelve TODOS los párrocos
    // Los filtros y paginación se aplican en el frontend
    const query = `
      SELECT 
        id_parroco,
        nombre,
        apellido,
        activo,
        created_at,
        updated_at
      FROM cat_parroco
      ORDER BY apellido ASC, nombre ASC
    `;

    const result = await pool.query(query);
    return result.rows;
  }

  // Contar total de registros
  static async contar(filtros = {}) {
    const query = 'SELECT COUNT(*) as total FROM cat_parroco';
    const result = await pool.query(query);
    return parseInt(result.rows[0].total);
  }

  // Obtener por ID
  static async obtenerPorId(id) {
    const query = `
      SELECT 
        id_parroco,
        nombre,
        apellido,
        activo,
        created_at,
        updated_at
      FROM cat_parroco 
      WHERE id_parroco = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Crear nuevo párroco
  static async crear(datos) {
    const { nombre, apellido, activo = true } = datos;
    const query = `
      INSERT INTO cat_parroco (nombre, apellido, activo)
      VALUES ($1, $2, $3)
      RETURNING id_parroco, nombre, apellido, activo, created_at, updated_at
    `;
    const result = await pool.query(query, [nombre, apellido, activo]);
    return result.rows[0];
  }

  // Actualizar párroco
  static async actualizar(id, datos) {
    const { nombre, apellido, activo } = datos;
    const campos = [];
    const valores = [];
    let contador = 1;

    if (nombre !== undefined) {
      campos.push(`nombre = $${contador}`);
      valores.push(nombre);
      contador++;
    }
    if (apellido !== undefined) {
      campos.push(`apellido = $${contador}`);
      valores.push(apellido);
      contador++;
    }
    if (activo !== undefined) {
      campos.push(`activo = $${contador}`);
      valores.push(activo);
      contador++;
    }

    if (campos.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    valores.push(id);
    const query = `
      UPDATE cat_parroco
      SET ${campos.join(', ')}
      WHERE id_parroco = $${contador}
      RETURNING id_parroco, nombre, apellido, activo, created_at, updated_at
    `;
    const result = await pool.query(query, valores);
    return result.rows[0];
  }

  // Eliminar párroco (soft delete)
  static async eliminar(id) {
    const query = `
      UPDATE cat_parroco
      SET activo = false
      WHERE id_parroco = $1
      RETURNING id_parroco
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Eliminar permanentemente
  static async eliminarPermanente(id) {
    const query = `
      DELETE FROM cat_parroco
      WHERE id_parroco = $1
      RETURNING id_parroco
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Verificar si existe por nombre y apellido
  static async existePorNombreApellido(nombre, apellido, excluirId = null) {
    let query = `
      SELECT COUNT(*) as total
      FROM cat_parroco
      WHERE nombre = $1 AND apellido = $2 AND activo = true
    `;
    const valores = [nombre, apellido];
    
    if (excluirId) {
      query += ' AND id_parroco != $3';
      valores.push(excluirId);
    }
    
    const result = await pool.query(query, valores);
    return parseInt(result.rows[0].total) > 0;
  }

  // Obtener solo los activos (para selects)
  static async obtenerActivos() {
    const query = `
      SELECT 
        id_parroco as id,
        nombre || ' ' || apellido as nombre
      FROM cat_parroco
      WHERE activo = true
      ORDER BY apellido ASC, nombre ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  }
}

module.exports = CatParrocoModel;

