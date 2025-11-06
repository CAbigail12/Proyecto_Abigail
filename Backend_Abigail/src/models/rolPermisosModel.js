const { pool } = require('../config/db');
const { crearError } = require('../utils/errorHandler');

class RolPermisosModel {
  // Obtener permisos de un rol
  static async obtenerPorRolId(rolId) {
    const cliente = await pool.connect();
    try {
      const resultado = await cliente.query(
        `SELECT id_permiso, rol_id, permisos_menu::text as permisos_menu, activo, created_at, updated_at
         FROM rol_permisos_menu
         WHERE rol_id = $1 AND activo = true`,
        [rolId]
      );
      
      if (resultado.rows.length === 0) {
        return null;
      }
      
      const row = resultado.rows[0];
      // Parsear el JSONB si viene como string
      if (row.permisos_menu && typeof row.permisos_menu === 'string') {
        try {
          row.permisos_menu = JSON.parse(row.permisos_menu);
        } catch (e) {
          console.error('Error al parsear permisos_menu:', e);
          row.permisos_menu = {};
        }
      }
      
      return row;
    } finally {
      cliente.release();
    }
  }

  // Crear o actualizar permisos de un rol
  static async crearOActualizar(rolId, permisosMenu) {
    const cliente = await pool.connect();
    try {
      await cliente.query('BEGIN');
      
      // Verificar si ya existe
      const existe = await cliente.query(
        'SELECT id_permiso FROM rol_permisos_menu WHERE rol_id = $1',
        [rolId]
      );
      
      let resultado;
      if (existe.rows.length > 0) {
        // Actualizar
        resultado = await cliente.query(
          `UPDATE rol_permisos_menu
           SET permisos_menu = $1, activo = true, updated_at = NOW()
           WHERE rol_id = $2
           RETURNING id_permiso, rol_id, permisos_menu, activo, created_at, updated_at`,
          [JSON.stringify(permisosMenu), rolId]
        );
      } else {
        // Crear
        resultado = await cliente.query(
          `INSERT INTO rol_permisos_menu (rol_id, permisos_menu, activo)
           VALUES ($1, $2, true)
           RETURNING id_permiso, rol_id, permisos_menu, activo, created_at, updated_at`,
          [rolId, JSON.stringify(permisosMenu)]
        );
      }
      
      await cliente.query('COMMIT');
      
      const row = resultado.rows[0];
      // Parsear el JSONB si viene como string
      if (row.permisos_menu && typeof row.permisos_menu === 'string') {
        try {
          row.permisos_menu = JSON.parse(row.permisos_menu);
        } catch (e) {
          console.error('Error al parsear permisos_menu en crearOActualizar:', e);
          row.permisos_menu = {};
        }
      }
      
      return row;
    } catch (error) {
      await cliente.query('ROLLBACK');
      throw error;
    } finally {
      cliente.release();
    }
  }

  // Obtener todos los permisos (para administración)
  static async obtenerTodos() {
    const cliente = await pool.connect();
    try {
      const resultado = await cliente.query(
        `SELECT rpm.id_permiso, rpm.rol_id, rpm.permisos_menu, rpm.activo, rpm.created_at, rpm.updated_at,
                r.nombre as rol_nombre
         FROM rol_permisos_menu rpm
         JOIN roles r ON rpm.rol_id = r.id_rol
         WHERE rpm.activo = true
         ORDER BY r.nombre`
      );
      
      return resultado.rows;
    } finally {
      cliente.release();
    }
  }

  // Eliminar permisos de un rol (soft delete)
  static async eliminar(rolId) {
    const cliente = await pool.connect();
    try {
      const resultado = await cliente.query(
        `UPDATE rol_permisos_menu
         SET activo = false, updated_at = NOW()
         WHERE rol_id = $1
         RETURNING id_permiso`,
        [rolId]
      );
      
      if (resultado.rows.length === 0) {
        throw crearError('Permisos no encontrados para este rol', 404);
      }
      
      return { mensaje: 'Permisos eliminados correctamente' };
    } finally {
      cliente.release();
    }
  }
}

module.exports = RolPermisosModel;

