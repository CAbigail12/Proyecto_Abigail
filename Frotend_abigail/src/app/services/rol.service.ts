import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/usuario.model';

export interface Rol {
  id_rol: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  fecha_creacion?: string;
}

export interface RolCreate {
  nombre: string;
  descripcion?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RolService {
  private apiUrl = `${environment.apiUrl}/roles`;

  constructor(private http: HttpClient) {}

  obtenerTodos(): Observable<ApiResponse<Rol[]>> {
    return this.http.get<ApiResponse<Rol[]>>(`${this.apiUrl}`);
  }

  obtenerPorId(id: number): Observable<ApiResponse<Rol>> {
    return this.http.get<ApiResponse<Rol>>(`${this.apiUrl}/${id}`);
  }

  crear(rol: RolCreate): Observable<ApiResponse<Rol>> {
    return this.http.post<ApiResponse<Rol>>(this.apiUrl, rol);
  }

  actualizar(id: number, rol: Partial<RolCreate>): Observable<ApiResponse<Rol>> {
    return this.http.put<ApiResponse<Rol>>(`${this.apiUrl}/${id}`, rol);
  }

  eliminar(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }
}

