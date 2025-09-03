import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario, UsuarioCreate, UsuarioUpdate, ApiResponse, PaginatedResponse } from '../models/usuario.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  constructor(private http: HttpClient) { }

  // Obtener todos los usuarios con paginación y filtros
  obtenerUsuarios(pagina: number = 1, limite: number = 10, filtros?: any): Observable<ApiResponse<PaginatedResponse<Usuario>>> {
    let params = new HttpParams()
      .set('pagina', pagina.toString())
      .set('limite', limite.toString());

    if (filtros) {
      if (filtros.rol_id) params = params.set('rol_id', filtros.rol_id);
      if (filtros.estado) params = params.set('estado', filtros.estado);
      if (filtros.busqueda) params = params.set('busqueda', filtros.busqueda);
    }

    return this.http.get<ApiResponse<PaginatedResponse<Usuario>>>(`${environment.apiUrl}/usuarios`, { params });
  }

  // Obtener usuario por ID
  obtenerUsuario(id: number): Observable<ApiResponse<Usuario>> {
    return this.http.get<ApiResponse<Usuario>>(`${environment.apiUrl}/usuarios/${id}`);
  }

  // Crear nuevo usuario
  crearUsuario(usuario: UsuarioCreate, fotografia?: File): Observable<ApiResponse<Usuario>> {
    const formData = new FormData();
    
    // Agregar datos del usuario
    formData.append('nombre', usuario.nombre);
    formData.append('apellido', usuario.apellido);
    formData.append('correo', usuario.correo);
    formData.append('contrasena', usuario.contrasena);
    formData.append('rol_id', usuario.rol_id.toString());
    
    if (usuario.telefono) {
      formData.append('telefono', usuario.telefono);
    }
    
    if (usuario.estado) {
      formData.append('estado', usuario.estado);
    }
    
    // Agregar fotografía si existe
    if (fotografia) {
      formData.append('fotografia', fotografia);
    }
    
    return this.http.post<ApiResponse<Usuario>>(`${environment.apiUrl}/usuarios`, formData);
  }

  // Actualizar usuario
  actualizarUsuario(id: number, usuario: UsuarioUpdate, fotografia?: File): Observable<ApiResponse<Usuario>> {
    const formData = new FormData();
    
    // Agregar datos del usuario
    if (usuario.nombre) formData.append('nombre', usuario.nombre);
    if (usuario.apellido) formData.append('apellido', usuario.apellido);
    if (usuario.correo) formData.append('correo', usuario.correo);
    if (usuario.telefono) formData.append('telefono', usuario.telefono);
    if (usuario.rol_id) formData.append('rol_id', usuario.rol_id.toString());
    if (usuario.estado) formData.append('estado', usuario.estado);
    
    // Agregar fotografía si existe
    if (fotografia) {
      formData.append('fotografia', fotografia);
    }
    
    return this.http.put<ApiResponse<Usuario>>(`${environment.apiUrl}/usuarios/${id}`, formData);
  }

  // Eliminar usuario
  eliminarUsuario(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${environment.apiUrl}/usuarios/${id}`);
  }

  // Cambiar contraseña de usuario
  cambiarContrasenaUsuario(id: number, contrasenaNueva: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${environment.apiUrl}/usuarios/${id}/cambiar-contrasena`, {
      contrasena_nueva: contrasenaNueva
    });
  }

  // Obtener URL completa de la imagen
  obtenerUrlImagen(ruta: string): string {
    if (!ruta) return '';
    if (ruta.startsWith('http')) return ruta;
    return `${environment.apiUrl}${ruta}`;
  }
}
