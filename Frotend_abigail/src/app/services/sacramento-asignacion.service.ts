import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  SacramentoAsignacion,
  SacramentoAsignacionCreate,
  SacramentoAsignacionUpdate,
  SacramentoCatalogo,
  RolParticipanteCatalogo,
  FiltrosAsignacion,
  AsignacionResponse,
  EstadisticasSacramentos,
  ApiResponse
} from '../models/sacramento-asignacion.model';

@Injectable({
  providedIn: 'root'
})
export class SacramentoAsignacionService {
  private readonly baseUrl = `${environment.apiUrl}/sacramentos`;

  constructor(private http: HttpClient) {}

  // ============================================================
  // SERVICIOS DE ASIGNACIONES
  // ============================================================

  /**
   * Obtener todas las asignaciones con filtros y paginación
   */
  obtenerAsignaciones(filtros: FiltrosAsignacion = {}): Observable<ApiResponse<AsignacionResponse>> {
    let params = new HttpParams();
    
    // Siempre enviar parámetros de paginación (valores por defecto si no están presentes)
    const pagina = filtros.pagina || 1;
    const limite = filtros.limite || 10;
    params = params.set('pagina', pagina.toString());
    params = params.set('limite', limite.toString());
    
    // Filtros opcionales
    if (filtros.id_sacramento) params = params.set('id_sacramento', filtros.id_sacramento.toString());
    if (filtros.fecha_desde) params = params.set('fecha_desde', filtros.fecha_desde);
    if (filtros.fecha_hasta) params = params.set('fecha_hasta', filtros.fecha_hasta);
    if (filtros.pagado !== undefined && filtros.pagado !== null && filtros.pagado !== '') {
      params = params.set('pagado', filtros.pagado.toString());
    }
    if (filtros.busqueda) params = params.set('busqueda', filtros.busqueda);

    return this.http.get<ApiResponse<AsignacionResponse>>(`${this.baseUrl}/asignaciones`, { params });
  }

  /**
   * Obtener asignación por ID
   */
  obtenerAsignacionPorId(id: number): Observable<ApiResponse<SacramentoAsignacion>> {
    return this.http.get<ApiResponse<SacramentoAsignacion>>(`${this.baseUrl}/asignaciones/${id}`);
  }

  /**
   * Crear nueva asignación de sacramento
   */
  crearAsignacion(asignacion: SacramentoAsignacionCreate): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/asignaciones`, asignacion);
  }

  /**
   * Actualizar asignación existente
   */
  actualizarAsignacion(id: number, asignacion: SacramentoAsignacionUpdate): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/asignaciones/${id}`, asignacion);
  }

  /**
   * Eliminar asignación (eliminación lógica)
   */
  eliminarAsignacion(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/asignaciones/${id}`);
  }

  // ============================================================
  // SERVICIOS DE CATÁLOGOS
  // ============================================================

  /**
   * Obtener catálogo de sacramentos disponibles
   */
  obtenerSacramentos(): Observable<ApiResponse<SacramentoCatalogo[]>> {
    return this.http.get<ApiResponse<SacramentoCatalogo[]>>(`${this.baseUrl}/sacramentos`);
  }

  /**
   * Obtener catálogo de roles de participante
   */
  obtenerRolesParticipante(): Observable<ApiResponse<RolParticipanteCatalogo[]>> {
    return this.http.get<ApiResponse<RolParticipanteCatalogo[]>>(`${this.baseUrl}/roles-participante`);
  }

  /**
   * Obtener catálogo de tipos de testigos/padrinos
   */
  obtenerTiposTestigoPadrino(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${environment.apiUrl}/mantenimiento/tipos-testigo-padrino/activos`);
  }

  // ============================================================
  // SERVICIOS DE ESTADÍSTICAS
  // ============================================================

  /**
   * Obtener estadísticas de sacramentos
   */
  obtenerEstadisticas(): Observable<ApiResponse<EstadisticasSacramentos>> {
    return this.http.get<ApiResponse<EstadisticasSacramentos>>(`${this.baseUrl}/estadisticas`);
  }

  // ============================================================
  // MÉTODOS DE UTILIDAD
  // ============================================================

  /**
   * Obtener sacramentos para formularios (solo los principales)
   */
  obtenerSacramentosPrincipales(): Observable<ApiResponse<SacramentoCatalogo[]>> {
    return this.obtenerSacramentos();
  }

  /**
   * Obtener roles específicos por tipo de sacramento
   */
  obtenerRolesPorSacramento(idSacramento: number): Observable<ApiResponse<RolParticipanteCatalogo[]>> {
    // Por ahora retornamos todos los roles, pero se puede filtrar por sacramento
    return this.obtenerRolesParticipante();
  }

  /**
   * Validar datos de asignación antes de enviar
   */
  validarAsignacion(asignacion: SacramentoAsignacionCreate): string[] {
    const errores: string[] = [];

    if (!asignacion.id_sacramento) {
      errores.push('El tipo de sacramento es requerido');
    }

    if (!asignacion.fecha_celebracion) {
      errores.push('La fecha de celebración es requerida');
    }

    if (!asignacion.participantes || asignacion.participantes.length === 0) {
      errores.push('Debe seleccionar al menos un participante');
    }

    // Validación específica para matrimonio
    if (asignacion.id_sacramento === 4) { // Matrimonio
      if (asignacion.participantes.length !== 2) {
        errores.push('El matrimonio requiere exactamente 2 feligreses');
      }
    }

    // Validar que no se repitan feligreses
    const feligresesIds = asignacion.participantes.map(p => p.id_feligres);
    const feligresesUnicos = [...new Set(feligresesIds)];
    if (feligresesIds.length !== feligresesUnicos.length) {
      errores.push('No se puede asignar el mismo feligrés múltiples veces');
    }

    return errores;
  }
}
