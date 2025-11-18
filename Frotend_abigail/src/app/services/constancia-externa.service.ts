import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ConstanciaExterna,
  ConstanciaExternaCreate,
  ConstanciaExternaUpdate,
  FiltrosConstanciaExterna,
  ApiResponse
} from '../models/constancia-externa.model';

@Injectable({
  providedIn: 'root'
})
export class ConstanciaExternaService {
  private apiUrl = `${environment.apiUrl}/constancias-externas`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener todas las constancias externas con filtros y paginación
   */
  obtenerConstanciasExternas(
    filtros: FiltrosConstanciaExterna = {},
    paginacion: { pagina: number; limite: number } = { pagina: 1, limite: 10 }
  ): Observable<ApiResponse<ConstanciaExterna[]>> {
    let params = new HttpParams()
      .set('pagina', paginacion.pagina.toString())
      .set('limite', paginacion.limite.toString());

    if (filtros.id_feligres) {
      params = params.set('id_feligres', filtros.id_feligres.toString());
    }

    if (filtros.id_sacramento) {
      params = params.set('id_sacramento', filtros.id_sacramento.toString());
    }

    if (filtros.busqueda) {
      params = params.set('busqueda', filtros.busqueda);
    }

    return this.http.get<ApiResponse<ConstanciaExterna[]>>(this.apiUrl, { params });
  }

  /**
   * Obtener una constancia externa por ID
   */
  obtenerConstanciaExterna(id: number): Observable<ApiResponse<ConstanciaExterna>> {
    return this.http.get<ApiResponse<ConstanciaExterna>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crear una nueva constancia externa
   */
  crearConstanciaExterna(datos: ConstanciaExternaCreate): Observable<ApiResponse<{ id_constancia_externa: number }>> {
    return this.http.post<ApiResponse<{ id_constancia_externa: number }>>(this.apiUrl, datos);
  }

  /**
   * Actualizar una constancia externa
   */
  actualizarConstanciaExterna(
    id: number,
    datos: ConstanciaExternaUpdate
  ): Observable<ApiResponse<{ id_constancia_externa: number }>> {
    return this.http.put<ApiResponse<{ id_constancia_externa: number }>>(`${this.apiUrl}/${id}`, datos);
  }

  /**
   * Eliminar una constancia externa (soft delete)
   */
  eliminarConstanciaExterna(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}

