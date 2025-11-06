const { pool } = require('../config/db');
const { crearError } = require('../utils/errorHandler');

class RolModel {
  // Obtener todos los roles activos
  static async obtenerTodos() {
    const cliente = await pool.connect();
    try {
      const resultado = await cliente.query(
        'SELECT id_rol, nombre, descripcion, activo, fecha_creacion FROM roles WHERE activo = true ORDER BY nombre'
      );
      return resultado.rows;
    } finally {
      cliente.release();
    }
  }

  // Obtener rol por ID
  static async obtenerPorId(idRol) {
    const cliente = await pool.connect();
    try {
      const resultado = await cliente.query(
        'SELECT id_rol, nombre, descripcion, activo, fecha_creacion FROM roles WHERE id_rol = $1',
        [idRol]
      );
      
      if (resultado.rows.length === 0) {
        throw crearError('Rol no encontrado', 404);
      }
      
      return resultado.rows[0];
    } finally {
      cliente.release();
    }
  }

  // Obtener rol por nombre
  static async obtenerPorNombre(nombre) {
    const cliente = await pool.connect();
    try {
      const resultado = await cliente.query(
        'SELECT id_rol, nombre, descripcion, activo, fecha_creacion FROM roles WHERE nombre = $1',
        [nombre]
      );
      
      if (resultado.rows.length === 0) {
        throw crearError('Rol no encontrado', 404);
      }
      
      return resultado.rows[0];
    } finally {
      cliente.release();
    }
  }

  // Verificar si existe un rol
  static async existe(idRol) {
    const cliente = await pool.connect();
    try {
      const resultado = await cliente.query(
        'SELECT 1 FROM roles WHERE id_rol = $1 AND activo = true',
        [idRol]
      );
      return resultado.rows.length > 0;
    } finally {
      cliente.release();
    }
  }

  // Crear nuevo rol
  static async crear(nombre, descripcion = null) {
    const cliente = await pool.connect();
    try {
      const resultado = await cliente.query(
        `INSERT INTO roles (nombre, descripcion, activo)
         VALUES ($1, $2, true)
         RETURNING id_rol, nombre, descripcion, activo, fecha_creacion`,
        [nombre.trim().toUpperCase(), descripcion || null]
      );
      return resultado.rows[0];
    } finally {
      cliente.release();
    }
  }

  // Actualizar rol
  static async actualizar(idRol, datos) {
    const cliente = await pool.connect();
    try {
      const campos = [];
      const valores = [];
      let contador = 1;
      
      if (datos.nombre !== undefined) {
        campos.push(`nombre = $${contador}`);
        valores.push(datos.nombre.trim().toUpperCase());
        contador++;
      }
      
      if (datos.descripcion !== undefined) {
        campos.push(`descripcion = $${contador}`);
        valores.push(datos.descripcion || null);
        contador++;
      }
      
      if (datos.activo !== undefined) {
        campos.push(`activo = $${contador}`);
        valores.push(datos.activo);
        contador++;
      }
      
      if (campos.length === 0) {
        throw crearError('No hay campos para actualizar', 400);
      }
      
      valores.push(idRol);
      
      const resultado = await cliente.query(
        `UPDATE roles 
         SET ${campos.join(', ')}
         WHERE id_rol = $${contador}
         RETURNING id_rol, nombre, descripcion, activo, fecha_creacion`,
        valores
      );
      
      return resultado.rows[0];
    } finally {
      cliente.release();
    }
  }

  // Eliminar rol (soft delete)
  static async eliminar(idRol) {
    const cliente = await pool.connect();
    try {
      await cliente.query(
        'UPDATE roles SET activo = false WHERE id_rol = $1',
        [idRol]
      );
      return true;
    } finally {
      cliente.release();
    }
  }
}

module.exports = RolModel;
