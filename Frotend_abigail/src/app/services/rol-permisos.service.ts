import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PermisosMenu {
  dashboard?: boolean;
  feligreses?: boolean;
  sacramentos_asignacion?: boolean;
  calendario_sacramentos?: boolean;
  actividades_religiosas?: boolean;
  caja_parroquial?: boolean;
  reportes?: boolean;
  usuarios?: boolean;
  mantenimiento?: boolean;
}

export interface RolPermisos {
  id_permiso?: number;
  rol_id: number;
  permisos_menu: PermisosMenu;
  activo?: boolean;
  created_at?: string;
  updated_at?: string;
  rol_nombre?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RolPermisosService {
  private apiUrl = `${environment.apiUrl}/rol-permisos`;

  constructor(private http: HttpClient) {}

  obtenerPorRolId(rolId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${rolId}`);
  }

  crearOActualizar(rolId: number, permisosMenu: PermisosMenu): Observable<any> {
    return this.http.post(`${this.apiUrl}/${rolId}`, { permisos_menu: permisosMenu });
  }

  obtenerTodos(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  eliminar(rolId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${rolId}`);
  }
}

