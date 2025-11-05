import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ActividadReligiosa,
  TipoActividad,
  ActividadReligiosaCreate,
  ActividadReligiosaUpdate,
  TipoActividadCreate,
  TipoActividadUpdate,
  FiltrosActividad,
  ActividadResponse,
  EstadisticasActividades,
  ApiResponse
} from '../models/actividad-religiosa.model';

@Injectable({
  providedIn: 'root'
})
export class ActividadReligiosaService {
  private apiUrl = `${environment.apiUrl}/actividades-religiosas`;

  constructor(private http: HttpClient) {}

  // ========================================
  // ACTIVIDADES RELIGIOSAS
  // ========================================

  // Obtener todas las actividades (sin filtros ni paginación - se aplican en el frontend)
  obtenerActividades(): Observable<ApiResponse<ActividadResponse>> {
    // El backend siempre devuelve todas las actividades
    return this.http.get<ApiResponse<ActividadResponse>>(this.apiUrl);
  }

  // Obtener una actividad por ID
  obtenerActividadPorId(id: number): Observable<ApiResponse<ActividadReligiosa>> {
    return this.http.get<ApiResponse<ActividadReligiosa>>(`${this.apiUrl}/${id}`);
  }

  // Crear nueva actividad
  crearActividad(actividad: ActividadReligiosaCreate): Observable<ApiResponse<ActividadReligiosa>> {
    return this.http.post<ApiResponse<ActividadReligiosa>>(this.apiUrl, actividad);
  }

  // Actualizar actividad
  actualizarActividad(id: number, actividad: ActividadReligiosaUpdate): Observable<ApiResponse<ActividadReligiosa>> {
    return this.http.put<ApiResponse<ActividadReligiosa>>(`${this.apiUrl}/${id}`, actividad);
  }

  // Eliminar actividad
  eliminarActividad(id: number): Observable<ApiResponse<{ id_actividad: number }>> {
    return this.http.delete<ApiResponse<{ id_actividad: number }>>(`${this.apiUrl}/${id}`);
  }

  // Obtener estadísticas
  obtenerEstadisticas(): Observable<ApiResponse<EstadisticasActividades>> {
    return this.http.get<ApiResponse<EstadisticasActividades>>(`${this.apiUrl}/estadisticas`);
  }

  // ========================================
  // TIPOS DE ACTIVIDAD
  // ========================================

  // Obtener todos los tipos de actividad
  obtenerTiposActividad(): Observable<ApiResponse<TipoActividad[]>> {
    return this.http.get<ApiResponse<TipoActividad[]>>(`${this.apiUrl}/tipos/actividad`);
  }

  // Crear nuevo tipo de actividad
  crearTipoActividad(tipo: TipoActividadCreate): Observable<ApiResponse<TipoActividad>> {
    return this.http.post<ApiResponse<TipoActividad>>(`${this.apiUrl}/tipos/actividad`, tipo);
  }

  // Actualizar tipo de actividad
  actualizarTipoActividad(id: number, tipo: TipoActividadUpdate): Observable<ApiResponse<TipoActividad>> {
    return this.http.put<ApiResponse<TipoActividad>>(`${this.apiUrl}/tipos/actividad/${id}`, tipo);
  }

  // Eliminar tipo de actividad
  eliminarTipoActividad(id: number): Observable<ApiResponse<{ id_tipo_actividad: number }>> {
    return this.http.delete<ApiResponse<{ id_tipo_actividad: number }>>(`${this.apiUrl}/tipos/actividad/${id}`);
  }

  // ========================================
  // MÉTODOS UTILITARIOS
  // ========================================

  // Formatear fecha para mostrar
  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-GT', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  // Formatear hora para mostrar
  formatearHora(hora: string): string {
    if (!hora) return '';
    return hora.substring(0, 5); // HH:MM
  }

  // Formatear fecha y hora para mostrar
  formatearFechaHora(fecha: string, hora?: string): string {
    const fechaFormateada = this.formatearFecha(fecha);
    if (hora) {
      return `${fechaFormateada} ${this.formatearHora(hora)}`;
    }
    return fechaFormateada;
  }

  // Validar si una actividad es futura
  esActividadFutura(fecha: string, hora?: string): boolean {
    const ahora = new Date();
    const fechaActividad = new Date(fecha);
    
    if (hora) {
      const [horas, minutos] = hora.split(':');
      fechaActividad.setHours(parseInt(horas), parseInt(minutos), 0, 0);
    }
    
    return fechaActividad > ahora;
  }

  // Obtener color del badge según el tipo de actividad
  obtenerColorTipoActividad(tipo: string): string {
    const colores: { [key: string]: string } = {
      'Misa': 'bg-blue-100 text-blue-800',
      'Bendición': 'bg-green-100 text-green-800',
      'Recaudación': 'bg-yellow-100 text-yellow-800',
      'Catequesis': 'bg-purple-100 text-purple-800',
      'Retiro Espiritual': 'bg-indigo-100 text-indigo-800',
      'Procesión': 'bg-pink-100 text-pink-800',
      'Vigilia': 'bg-gray-100 text-gray-800',
      'Bautizo': 'bg-cyan-100 text-cyan-800',
      'Matrimonio': 'bg-red-100 text-red-800',
      'Confirmación': 'bg-orange-100 text-orange-800'
    };
    
    return colores[tipo] || 'bg-gray-100 text-gray-800';
  }
}
