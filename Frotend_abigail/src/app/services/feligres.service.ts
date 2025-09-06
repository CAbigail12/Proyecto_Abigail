import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  Feligres, 
  FeligresCreate, 
  FeligresUpdate, 
  FiltrosFeligres,
  ApiResponse,
  PaginatedResponse,
  ComunidadSelect
} from '../models/mantenimiento.model';

@Injectable({
  providedIn: 'root'
})
export class FeligresService {
  private apiUrl = `${environment.apiUrl}/feligreses`;

  constructor(private http: HttpClient) { }

  // Obtener feligreses con filtros y paginación
  obtenerFeligreses(filtros: FiltrosFeligres = {}): Observable<ApiResponse<PaginatedResponse<Feligres>>> {
    let params = new HttpParams();
    
    if (filtros.busqueda) {
      params = params.set('busqueda', filtros.busqueda);
    }
    if (filtros.activo !== undefined && filtros.activo !== '') {
      params = params.set('activo', filtros.activo);
    }
    if (filtros.id_comunidad) {
      params = params.set('id_comunidad', filtros.id_comunidad.toString());
    }
    if (filtros.sexo) {
      params = params.set('sexo', filtros.sexo);
    }
    if (filtros.pagina) {
      params = params.set('pagina', filtros.pagina.toString());
    }
    if (filtros.limite) {
      params = params.set('limite', filtros.limite.toString());
    }

    return this.http.get<ApiResponse<PaginatedResponse<Feligres>>>(this.apiUrl, { params });
  }

  // Obtener un feligrés por ID
  obtenerFeligresPorId(id: number): Observable<ApiResponse<Feligres>> {
    return this.http.get<ApiResponse<Feligres>>(`${this.apiUrl}/${id}`);
  }

  // Crear nuevo feligrés
  crearFeligres(feligres: FeligresCreate): Observable<ApiResponse<Feligres>> {
    return this.http.post<ApiResponse<Feligres>>(this.apiUrl, feligres);
  }

  // Actualizar feligrés
  actualizarFeligres(id: number, feligres: FeligresUpdate): Observable<ApiResponse<Feligres>> {
    return this.http.put<ApiResponse<Feligres>>(`${this.apiUrl}/${id}`, feligres);
  }

  // Eliminar feligrés (soft delete)
  eliminarFeligres(id: number): Observable<ApiResponse<Feligres>> {
    return this.http.delete<ApiResponse<Feligres>>(`${this.apiUrl}/${id}`);
  }

  // Obtener comunidades para el select
  obtenerComunidades(): Observable<ApiResponse<ComunidadSelect[]>> {
    return this.http.get<ApiResponse<ComunidadSelect[]>>(`${this.apiUrl}/comunidades`);
  }
}
