const { pool } = require('../config/db');
const ConstanciaExternaModel = require('../models/constanciaExternaModel');

class ValidacionSacramentosService {
  /**
   * Validar si un feligrés tiene bautismo válido
   * Busca primero en sacramentos internos, luego en constancias externas
   * @param {number} idFeligres - ID del feligrés
   * @returns {Promise<{tieneBautismo: boolean, fuente: 'interno' | 'externo' | null}>}
   */
  static async validarBautismo(idFeligres) {
    try {
      // Paso 1: Buscar en sacramentos internos (sacramento_asignacion)
      const queryInterno = `
        SELECT sa.id_asignacion
        FROM sacramento_asignacion sa
        INNER JOIN sacramento_participante sp ON sa.id_asignacion = sp.id_asignacion
        WHERE sa.id_sacramento = 1
          AND sp.id_feligres = $1
          AND sa.activo = true
        LIMIT 1
      `;
      const resultadoInterno = await pool.query(queryInterno, [idFeligres]);

      if (resultadoInterno.rows.length > 0) {
        return {
          tieneBautismo: true,
          fuente: 'interno'
        };
      }

      // Paso 2: Si no existe en internos, buscar en constancias externas
      const constanciaExterna = await ConstanciaExternaModel.obtenerPorFeligresYSacramento(
        idFeligres,
        1 // Bautismo
      );

      if (constanciaExterna) {
        return {
          tieneBautismo: true,
          fuente: 'externo'
        };
      }

      return {
        tieneBautismo: false,
        fuente: null
      };
    } catch (error) {
      console.error('Error al validar bautismo:', error);
      throw error;
    }
  }

  /**
   * Validar si un feligrés puede registrar confirmación
   * Requiere bautismo válido (interno o externo)
   * @param {number} idFeligres - ID del feligrés
   * @returns {Promise<{tieneBautismo: boolean, tieneConfirmacion: boolean, puedeRegistrar: boolean, mensaje: string | null}>}
   */
  static async validarConfirmacion(idFeligres) {
    try {
      // Paso 1: Validar bautismo
      const validacionBautismo = await this.validarBautismo(idFeligres);

      if (!validacionBautismo.tieneBautismo) {
        return {
          tieneBautismo: false,
          tieneConfirmacion: false,
          puedeRegistrar: false,
          mensaje: 'No es posible registrar la confirmación porque la persona no tiene un bautismo válido.'
        };
      }

      // Paso 2: Si tiene bautismo, validar si ya tiene confirmación
      // Buscar primero en sacramentos internos
      const queryInterno = `
        SELECT sa.id_asignacion
        FROM sacramento_asignacion sa
        INNER JOIN sacramento_participante sp ON sa.id_asignacion = sp.id_asignacion
        WHERE sa.id_sacramento = 3
          AND sp.id_feligres = $1
          AND sa.activo = true
        LIMIT 1
      `;
      const resultadoInterno = await pool.query(queryInterno, [idFeligres]);

      if (resultadoInterno.rows.length > 0) {
        return {
          tieneBautismo: true,
          tieneConfirmacion: true,
          puedeRegistrar: true,
          mensaje: null
        };
      }

      // Paso 3: Si no existe en internos, buscar en constancias externas
      const constanciaExterna = await ConstanciaExternaModel.obtenerPorFeligresYSacramento(
        idFeligres,
        3 // Confirmación
      );

      if (constanciaExterna) {
        return {
          tieneBautismo: true,
          tieneConfirmacion: true,
          puedeRegistrar: true,
          mensaje: null
        };
      }

      // Tiene bautismo pero no tiene confirmación, puede registrar
      return {
        tieneBautismo: true,
        tieneConfirmacion: false,
        puedeRegistrar: true,
        mensaje: null
      };
    } catch (error) {
      console.error('Error al validar confirmación:', error);
      throw error;
    }
  }

  /**
   * Validar si dos feligreses pueden registrar matrimonio
   * Ambos deben tener bautismo y confirmación válidos
   * @param {number} idFeligresNovio - ID del feligrés novio
   * @param {number} idFeligresNovia - ID del feligrés novia
   * @returns {Promise<{novioValido: boolean, noviaValida: boolean, puedeRegistrar: boolean, mensaje: string | null}>}
   */
  static async validarMatrimonio(idFeligresNovio, idFeligresNovia) {
    try {
      // Validar novio
      const validacionBautismoNovio = await this.validarBautismo(idFeligresNovio);
      
      // Validar confirmación del novio
      const queryConfirmacionNovio = `
        SELECT sa.id_asignacion
        FROM sacramento_asignacion sa
        INNER JOIN sacramento_participante sp ON sa.id_asignacion = sp.id_asignacion
        WHERE sa.id_sacramento = 3
          AND sp.id_feligres = $1
          AND sa.activo = true
        LIMIT 1
      `;
      const resultadoConfirmacionNovio = await pool.query(queryConfirmacionNovio, [idFeligresNovio]);
      
      let tieneConfirmacionNovio = resultadoConfirmacionNovio.rows.length > 0;
      if (!tieneConfirmacionNovio) {
        const constanciaExternaNovio = await ConstanciaExternaModel.obtenerPorFeligresYSacramento(
          idFeligresNovio,
          3 // Confirmación
        );
        tieneConfirmacionNovio = !!constanciaExternaNovio;
      }

      // Validar novia
      const validacionBautismoNovia = await this.validarBautismo(idFeligresNovia);
      
      // Validar confirmación de la novia
      const queryConfirmacionNovia = `
        SELECT sa.id_asignacion
        FROM sacramento_asignacion sa
        INNER JOIN sacramento_participante sp ON sa.id_asignacion = sp.id_asignacion
        WHERE sa.id_sacramento = 3
          AND sp.id_feligres = $1
          AND sa.activo = true
        LIMIT 1
      `;
      const resultadoConfirmacionNovia = await pool.query(queryConfirmacionNovia, [idFeligresNovia]);
      
      let tieneConfirmacionNovia = resultadoConfirmacionNovia.rows.length > 0;
      if (!tieneConfirmacionNovia) {
        const constanciaExternaNovia = await ConstanciaExternaModel.obtenerPorFeligresYSacramento(
          idFeligresNovia,
          3 // Confirmación
        );
        tieneConfirmacionNovia = !!constanciaExternaNovia;
      }

      const novioValido = validacionBautismoNovio.tieneBautismo && tieneConfirmacionNovio;
      const noviaValida = validacionBautismoNovia.tieneBautismo && tieneConfirmacionNovia;

      if (novioValido && noviaValida) {
        return {
          novioValido: true,
          noviaValida: true,
          puedeRegistrar: true,
          mensaje: null
        };
      }

      return {
        novioValido,
        noviaValida,
        puedeRegistrar: false,
        mensaje: 'Ambos deben tener bautismo y confirmación válidos para registrar un matrimonio.'
      };
    } catch (error) {
      console.error('Error al validar matrimonio:', error);
      throw error;
    }
  }
}

module.exports = ValidacionSacramentosService;

