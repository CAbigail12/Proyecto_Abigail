import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Constancia,
  ConstanciaCreate,
  ConstanciaUpdate
} from '../models/constancia.model';
import { ApiResponse } from '../models/sacramento-asignacion.model';

@Injectable({
  providedIn: 'root'
})
export class ConstanciaService {
  private readonly baseUrl = `${environment.apiUrl}/constancias`;

  constructor(private http: HttpClient) {}

  // ============================================================
  // SERVICIOS DE CONSTANCIAS
  // ============================================================

  /**
   * Obtener constancia por id_asignacion
   */
  obtenerConstancia(idAsignacion: number): Observable<ApiResponse<Constancia>> {
    return this.http.get<ApiResponse<Constancia>>(`${this.baseUrl}/${idAsignacion}`);
  }

  /**
   * Crear nueva constancia
   */
  crearConstancia(constancia: ConstanciaCreate): Observable<ApiResponse<Constancia>> {
    return this.http.post<ApiResponse<Constancia>>(`${this.baseUrl}`, constancia);
  }

  /**
   * Actualizar constancia existente
   */
  actualizarConstancia(idConstancia: number, constancia: ConstanciaUpdate): Observable<ApiResponse<Constancia>> {
    return this.http.put<ApiResponse<Constancia>>(`${this.baseUrl}/${idConstancia}`, constancia);
  }
}

