import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse, Usuario } from '../models/usuario.model';
import { environment } from '../../environments/environment';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loadStoredUser();
  }

  // Helper method to check if we're in the browser
  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  // Helper method to safely access localStorage
  private getLocalStorageItem(key: string): string | null {
    if (this.isBrowser()) {
      return localStorage.getItem(key);
    }
    return null;
  }

  private setLocalStorageItem(key: string, value: string): void {
    if (this.isBrowser()) {
      localStorage.setItem(key, value);
    }
  }

  private removeLocalStorageItem(key: string): void {
    if (this.isBrowser()) {
      localStorage.removeItem(key);
    }
  }

  private loadStoredUser(): void {
    const token = this.getLocalStorageItem('token');
    const user = this.getLocalStorageItem('user');
    const permisos = this.getLocalStorageItem('permisos_menu');
    
    if (token && user) {
      try {
        const userData = JSON.parse(user);
        if (permisos) {
          userData.permisos_menu = JSON.parse(permisos);
        }
        this.currentUserSubject.next(userData);
        this.isAuthenticatedSubject.next(true);
      } catch (error) {
        this.logout();
      }
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          if (response.ok) {
            this.setLocalStorageItem('token', response.datos.token);
            this.setLocalStorageItem('user', JSON.stringify(response.datos.usuario));
            
            // Guardar permisos del menú
            if (response.datos.permisos_menu) {
              this.setLocalStorageItem('permisos_menu', JSON.stringify(response.datos.permisos_menu));
              response.datos.usuario.permisos_menu = response.datos.permisos_menu;
            }
            
            this.currentUserSubject.next(response.datos.usuario);
            this.isAuthenticatedSubject.next(true);
          }
        })
      );
  }

  logout(): void {
    this.removeLocalStorageItem('token');
    this.removeLocalStorageItem('user');
    this.removeLocalStorageItem('permisos_menu');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    
    // Limpiar cualquier otro dato de sesión que pueda existir
    if (this.isBrowser()) {
      // Limpiar cualquier cookie de sesión si existe
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
    }
  }

  // Función para limpiar completamente el localStorage
  clearStorage(): void {
    if (this.isBrowser()) {
      localStorage.clear();
    }
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  getToken(): string | null {
    return this.getLocalStorageItem('token');
  }

  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getCurrentUser();
    const isAuth = this.isAuthenticatedSubject.value;
    
    // Si no hay token o usuario, asegurar que el estado sea false
    if (!token || !user) {
      if (isAuth) {
        this.isAuthenticatedSubject.next(false);
        this.currentUserSubject.next(null);
      }
      return false;
    }
    
    return isAuth;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.rol === 'ADMINISTRADOR';
  }

  // Función para verificar si el usuario es personal
  isPersonal(): boolean {
    const user = this.getCurrentUser();
    return user?.rol === 'PERSONAL';
  }

  // Función para verificar si el usuario es invitado
  isInvitado(): boolean {
    const user = this.getCurrentUser();
    return user?.rol === 'INVITADO';
  }

  // Obtener permisos del menú
  getPermisosMenu(): any {
    const user = this.getCurrentUser();
    return user?.permisos_menu || {};
  }

  // Verificar si el usuario tiene permiso para una opción del menú
  tienePermiso(opcion: string): boolean {
    const permisos = this.getPermisosMenu();
    // Si es admin, siempre tiene todos los permisos
    if (this.isAdmin()) {
      return true;
    }
    // Si no hay permisos configurados, no tiene acceso (excepto dashboard)
    if (!permisos || Object.keys(permisos).length === 0) {
      return opcion === 'dashboard'; // Solo dashboard está disponible
    }
    // Verificar permiso específico
    return permisos[opcion] === true;
  }

  // Recargar permisos del usuario actual desde el backend
  recargarPermisos(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/auth/perfil`).pipe(
      tap(response => {
        if (response.ok && response.datos) {
          const usuario = response.datos;
          // Actualizar permisos en localStorage
          if (usuario.permisos_menu) {
            this.setLocalStorageItem('permisos_menu', JSON.stringify(usuario.permisos_menu));
          }
          // Actualizar usuario en el subject
          const currentUser = this.getCurrentUser();
          if (currentUser) {
            currentUser.permisos_menu = usuario.permisos_menu;
            this.setLocalStorageItem('user', JSON.stringify(currentUser));
            this.currentUserSubject.next(currentUser);
          }
        }
      })
    );
  }
}
