const { pool } = require('../config/db');

class ConstanciaModel {
  // Obtener constancia por id_asignacion
  static async obtenerPorAsignacion(idAsignacion) {
    const query = `
      SELECT 
        c.id_constancia,
        c.id_asignacion,
        c.tipo_sacramento,
        c.id_parroco,
        c.libro,
        c.folio,
        c.acta,
        c.fecha_constancia,
        c.datos_json,
        c.created_at,
        c.updated_at,
        p.nombre as parroco_nombre,
        p.apellido as parroco_apellido
      FROM constancias_sacramentos c
      INNER JOIN cat_parroco p ON c.id_parroco = p.id_parroco
      WHERE c.id_asignacion = $1
    `;
    const result = await pool.query(query, [idAsignacion]);
    return result.rows[0] || null;
  }

  // Obtener constancia por ID
  static async obtenerPorId(idConstancia) {
    const query = `
      SELECT 
        c.id_constancia,
        c.id_asignacion,
        c.tipo_sacramento,
        c.id_parroco,
        c.libro,
        c.folio,
        c.acta,
        c.fecha_constancia,
        c.datos_json,
        c.created_at,
        c.updated_at,
        p.nombre as parroco_nombre,
        p.apellido as parroco_apellido
      FROM constancias_sacramentos c
      INNER JOIN cat_parroco p ON c.id_parroco = p.id_parroco
      WHERE c.id_constancia = $1
    `;
    const result = await pool.query(query, [idConstancia]);
    return result.rows[0] || null;
  }

  // Crear nueva constancia
  static async crear(datos) {
    const {
      id_asignacion,
      tipo_sacramento,
      id_parroco,
      libro,
      folio,
      acta,
      fecha_constancia,
      datos_json
    } = datos;

    const query = `
      INSERT INTO constancias_sacramentos (
        id_asignacion,
        tipo_sacramento,
        id_parroco,
        libro,
        folio,
        acta,
        fecha_constancia,
        datos_json
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id_asignacion) 
      DO UPDATE SET
        tipo_sacramento = EXCLUDED.tipo_sacramento,
        id_parroco = EXCLUDED.id_parroco,
        libro = EXCLUDED.libro,
        folio = EXCLUDED.folio,
        acta = EXCLUDED.acta,
        fecha_constancia = EXCLUDED.fecha_constancia,
        datos_json = EXCLUDED.datos_json,
        updated_at = NOW()
      RETURNING id_constancia, id_asignacion, tipo_sacramento, id_parroco, 
                libro, folio, acta, fecha_constancia, datos_json, created_at, updated_at
    `;

    const result = await pool.query(query, [
      id_asignacion,
      tipo_sacramento,
      id_parroco,
      libro || null,
      folio || null,
      acta || null,
      fecha_constancia || new Date().toISOString().split('T')[0],
      datos_json ? JSON.stringify(datos_json) : null
    ]);

    return result.rows[0];
  }

  // Actualizar constancia
  static async actualizar(idConstancia, datos) {
    const {
      id_parroco,
      libro,
      folio,
      acta,
      fecha_constancia,
      datos_json
    } = datos;

    const campos = [];
    const valores = [];
    let contador = 1;

    if (id_parroco !== undefined) {
      campos.push(`id_parroco = $${contador}`);
      valores.push(id_parroco);
      contador++;
    }
    if (libro !== undefined) {
      campos.push(`libro = $${contador}`);
      valores.push(libro || null);
      contador++;
    }
    if (folio !== undefined) {
      campos.push(`folio = $${contador}`);
      valores.push(folio || null);
      contador++;
    }
    if (acta !== undefined) {
      campos.push(`acta = $${contador}`);
      valores.push(acta || null);
      contador++;
    }
    if (fecha_constancia !== undefined) {
      campos.push(`fecha_constancia = $${contador}`);
      valores.push(fecha_constancia);
      contador++;
    }
    if (datos_json !== undefined) {
      campos.push(`datos_json = $${contador}`);
      valores.push(datos_json ? JSON.stringify(datos_json) : null);
      contador++;
    }

    if (campos.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    valores.push(idConstancia);
    const query = `
      UPDATE constancias_sacramentos
      SET ${campos.join(', ')}
      WHERE id_constancia = $${contador}
      RETURNING id_constancia, id_asignacion, tipo_sacramento, id_parroco, 
                libro, folio, acta, fecha_constancia, datos_json, created_at, updated_at
    `;

    const result = await pool.query(query, valores);
    return result.rows[0];
  }

  // Eliminar constancia
  static async eliminar(idConstancia) {
    const query = `
      DELETE FROM constancias_sacramentos
      WHERE id_constancia = $1
      RETURNING id_constancia
    `;
    const result = await pool.query(query, [idConstancia]);
    return result.rows[0];
  }
}

module.exports = ConstanciaModel;


