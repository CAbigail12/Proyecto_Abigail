import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Sacramento,
  SacramentoCreate,
  SacramentoUpdate,
  TipoDocumento,
  TipoDocumentoCreate,
  TipoDocumentoUpdate,
  Requisito,
  RequisitoCreate,
  RequisitoUpdate,
  RequisitoPorSacramento,
  RequisitoPorSacramentoCreate,
  RequisitoPorSacramentoUpdate,
  RolParticipante,
  RolParticipanteCreate,
  RolParticipanteUpdate,
  Comunidad,
  ComunidadCreate,
  ComunidadUpdate,
  TipoEspacio,
  TipoEspacioCreate,
  TipoEspacioUpdate,
  ApiResponse,
  PaginatedResponse,
  FiltrosGenerales,
  FiltrosRequisitoPorSacramento,
  OpcionSelect
} from '../models/mantenimiento.model';

@Injectable({
  providedIn: 'root'
})
export class MantenimientoService {
  private readonly baseUrl = `${environment.apiUrl}/mantenimiento`;

  constructor(private http: HttpClient) {}

  // ============================================================
  // SERVICIOS DE SACRAMENTOS
  // ============================================================

  obtenerSacramentos(filtros: FiltrosGenerales = {}): Observable<ApiResponse<PaginatedResponse<Sacramento>>> {
    let params = new HttpParams();
    
    if (filtros.pagina) params = params.set('pagina', filtros.pagina.toString());
    if (filtros.limite) params = params.set('limite', filtros.limite.toString());
    if (filtros.busqueda) params = params.set('busqueda', filtros.busqueda);
    if (filtros.activo) params = params.set('activo', filtros.activo);

    return this.http.get<ApiResponse<PaginatedResponse<Sacramento>>>(`${this.baseUrl}/sacramentos`, { params });
  }

  obtenerSacramentoPorId(id: number): Observable<ApiResponse<Sacramento>> {
    return this.http.get<ApiResponse<Sacramento>>(`${this.baseUrl}/sacramentos/${id}`);
  }

  crearSacramento(sacramento: SacramentoCreate): Observable<ApiResponse<Sacramento>> {
    return this.http.post<ApiResponse<Sacramento>>(`${this.baseUrl}/sacramentos`, sacramento);
  }

  actualizarSacramento(id: number, sacramento: SacramentoUpdate): Observable<ApiResponse<Sacramento>> {
    return this.http.put<ApiResponse<Sacramento>>(`${this.baseUrl}/sacramentos/${id}`, sacramento);
  }

  eliminarSacramento(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/sacramentos/${id}`);
  }

  obtenerSacramentosActivos(): Observable<ApiResponse<OpcionSelect[]>> {
    return this.http.get<ApiResponse<OpcionSelect[]>>(`${this.baseUrl}/sacramentos/activos`);
  }

  // ============================================================
  // SERVICIOS DE TIPOS DE DOCUMENTO
  // ============================================================

  obtenerTiposDocumento(filtros: FiltrosGenerales = {}): Observable<ApiResponse<PaginatedResponse<TipoDocumento>>> {
    let params = new HttpParams();
    
    if (filtros.pagina) params = params.set('pagina', filtros.pagina.toString());
    if (filtros.limite) params = params.set('limite', filtros.limite.toString());
    if (filtros.busqueda) params = params.set('busqueda', filtros.busqueda);
    if (filtros.activo) params = params.set('activo', filtros.activo);

    return this.http.get<ApiResponse<PaginatedResponse<TipoDocumento>>>(`${this.baseUrl}/tipos-documento`, { params });
  }

  obtenerTipoDocumentoPorId(id: number): Observable<ApiResponse<TipoDocumento>> {
    return this.http.get<ApiResponse<TipoDocumento>>(`${this.baseUrl}/tipos-documento/${id}`);
  }

  crearTipoDocumento(tipoDocumento: TipoDocumentoCreate): Observable<ApiResponse<TipoDocumento>> {
    return this.http.post<ApiResponse<TipoDocumento>>(`${this.baseUrl}/tipos-documento`, tipoDocumento);
  }

  actualizarTipoDocumento(id: number, tipoDocumento: TipoDocumentoUpdate): Observable<ApiResponse<TipoDocumento>> {
    return this.http.put<ApiResponse<TipoDocumento>>(`${this.baseUrl}/tipos-documento/${id}`, tipoDocumento);
  }

  eliminarTipoDocumento(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/tipos-documento/${id}`);
  }

  obtenerTiposDocumentoActivos(): Observable<ApiResponse<OpcionSelect[]>> {
    return this.http.get<ApiResponse<OpcionSelect[]>>(`${this.baseUrl}/tipos-documento/activos`);
  }

  // ============================================================
  // SERVICIOS DE REQUISITOS
  // ============================================================

  obtenerRequisitos(filtros: FiltrosGenerales = {}): Observable<ApiResponse<PaginatedResponse<Requisito>>> {
    let params = new HttpParams();
    
    if (filtros.pagina) params = params.set('pagina', filtros.pagina.toString());
    if (filtros.limite) params = params.set('limite', filtros.limite.toString());
    if (filtros.busqueda) params = params.set('busqueda', filtros.busqueda);
    if (filtros.activo) params = params.set('activo', filtros.activo);

    return this.http.get<ApiResponse<PaginatedResponse<Requisito>>>(`${this.baseUrl}/requisitos`, { params });
  }

  obtenerRequisitoPorId(id: number): Observable<ApiResponse<Requisito>> {
    return this.http.get<ApiResponse<Requisito>>(`${this.baseUrl}/requisitos/${id}`);
  }

  crearRequisito(requisito: RequisitoCreate): Observable<ApiResponse<Requisito>> {
    return this.http.post<ApiResponse<Requisito>>(`${this.baseUrl}/requisitos`, requisito);
  }

  actualizarRequisito(id: number, requisito: RequisitoUpdate): Observable<ApiResponse<Requisito>> {
    return this.http.put<ApiResponse<Requisito>>(`${this.baseUrl}/requisitos/${id}`, requisito);
  }

  eliminarRequisito(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/requisitos/${id}`);
  }

  obtenerRequisitosActivos(): Observable<ApiResponse<OpcionSelect[]>> {
    return this.http.get<ApiResponse<OpcionSelect[]>>(`${this.baseUrl}/requisitos/activos`);
  }

  // ============================================================
  // SERVICIOS DE REQUISITOS POR SACRAMENTO
  // ============================================================

  obtenerRequisitosPorSacramento(filtros: FiltrosRequisitoPorSacramento = {}): Observable<ApiResponse<PaginatedResponse<RequisitoPorSacramento>>> {
    let params = new HttpParams();
    
    if (filtros.pagina) params = params.set('pagina', filtros.pagina.toString());
    if (filtros.limite) params = params.set('limite', filtros.limite.toString());
    if (filtros.busqueda) params = params.set('busqueda', filtros.busqueda);
    if (filtros.id_sacramento) params = params.set('id_sacramento', filtros.id_sacramento.toString());
    if (filtros.id_requisito) params = params.set('id_requisito', filtros.id_requisito.toString());
    if (filtros.obligatorio) params = params.set('obligatorio', filtros.obligatorio);

    return this.http.get<ApiResponse<PaginatedResponse<RequisitoPorSacramento>>>(`${this.baseUrl}/requisitos-por-sacramento`, { params });
  }

  obtenerRequisitoPorSacramentoPorIds(idSacramento: number, idRequisito: number): Observable<ApiResponse<RequisitoPorSacramento>> {
    return this.http.get<ApiResponse<RequisitoPorSacramento>>(`${this.baseUrl}/requisitos-por-sacramento/${idSacramento}/${idRequisito}`);
  }

  crearRequisitoPorSacramento(relacion: RequisitoPorSacramentoCreate): Observable<ApiResponse<RequisitoPorSacramento>> {
    return this.http.post<ApiResponse<RequisitoPorSacramento>>(`${this.baseUrl}/requisitos-por-sacramento`, relacion);
  }

  actualizarRequisitoPorSacramento(idSacramento: number, idRequisito: number, relacion: RequisitoPorSacramentoUpdate): Observable<ApiResponse<RequisitoPorSacramento>> {
    return this.http.put<ApiResponse<RequisitoPorSacramento>>(`${this.baseUrl}/requisitos-por-sacramento/${idSacramento}/${idRequisito}`, relacion);
  }

  eliminarRequisitoPorSacramento(idSacramento: number, idRequisito: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/requisitos-por-sacramento/${idSacramento}/${idRequisito}`);
  }

  obtenerRequisitosDeSacramento(idSacramento: number): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/sacramentos/${idSacramento}/requisitos`);
  }

  // ============================================================
  // SERVICIOS DE ROLES DE PARTICIPANTE
  // ============================================================

  obtenerRolesParticipante(filtros: FiltrosGenerales = {}): Observable<ApiResponse<PaginatedResponse<RolParticipante>>> {
    let params = new HttpParams();
    
    if (filtros.pagina) params = params.set('pagina', filtros.pagina.toString());
    if (filtros.limite) params = params.set('limite', filtros.limite.toString());
    if (filtros.busqueda) params = params.set('busqueda', filtros.busqueda);
    if (filtros.activo) params = params.set('activo', filtros.activo);

    return this.http.get<ApiResponse<PaginatedResponse<RolParticipante>>>(`${this.baseUrl}/roles-participante`, { params });
  }

  obtenerRolParticipantePorId(id: number): Observable<ApiResponse<RolParticipante>> {
    return this.http.get<ApiResponse<RolParticipante>>(`${this.baseUrl}/roles-participante/${id}`);
  }

  crearRolParticipante(rolParticipante: RolParticipanteCreate): Observable<ApiResponse<RolParticipante>> {
    return this.http.post<ApiResponse<RolParticipante>>(`${this.baseUrl}/roles-participante`, rolParticipante);
  }

  actualizarRolParticipante(id: number, rolParticipante: RolParticipanteUpdate): Observable<ApiResponse<RolParticipante>> {
    return this.http.put<ApiResponse<RolParticipante>>(`${this.baseUrl}/roles-participante/${id}`, rolParticipante);
  }

  eliminarRolParticipante(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/roles-participante/${id}`);
  }

  obtenerRolesParticipanteActivos(): Observable<ApiResponse<OpcionSelect[]>> {
    return this.http.get<ApiResponse<OpcionSelect[]>>(`${this.baseUrl}/roles-participante/activos`);
  }

  // ============================================================
  // SERVICIOS DE COMUNIDADES
  // ============================================================

  obtenerComunidades(filtros: FiltrosGenerales = {}): Observable<ApiResponse<PaginatedResponse<Comunidad>>> {
    let params = new HttpParams();
    
    if (filtros.pagina) params = params.set('pagina', filtros.pagina.toString());
    if (filtros.limite) params = params.set('limite', filtros.limite.toString());
    if (filtros.busqueda) params = params.set('busqueda', filtros.busqueda);
    if (filtros.activo) params = params.set('activo', filtros.activo);

    return this.http.get<ApiResponse<PaginatedResponse<Comunidad>>>(`${this.baseUrl}/comunidades`, { params });
  }

  obtenerComunidadPorId(id: number): Observable<ApiResponse<Comunidad>> {
    return this.http.get<ApiResponse<Comunidad>>(`${this.baseUrl}/comunidades/${id}`);
  }

  crearComunidad(comunidad: ComunidadCreate): Observable<ApiResponse<Comunidad>> {
    return this.http.post<ApiResponse<Comunidad>>(`${this.baseUrl}/comunidades`, comunidad);
  }

  actualizarComunidad(id: number, comunidad: ComunidadUpdate): Observable<ApiResponse<Comunidad>> {
    return this.http.put<ApiResponse<Comunidad>>(`${this.baseUrl}/comunidades/${id}`, comunidad);
  }

  eliminarComunidad(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/comunidades/${id}`);
  }

  obtenerComunidadesActivas(): Observable<ApiResponse<OpcionSelect[]>> {
    return this.http.get<ApiResponse<OpcionSelect[]>>(`${this.baseUrl}/comunidades/activas`);
  }

  // ============================================================
  // SERVICIOS DE TIPOS DE ESPACIO
  // ============================================================

  obtenerTiposEspacio(filtros: FiltrosGenerales = {}): Observable<ApiResponse<PaginatedResponse<TipoEspacio>>> {
    let params = new HttpParams();
    
    if (filtros.pagina) params = params.set('pagina', filtros.pagina.toString());
    if (filtros.limite) params = params.set('limite', filtros.limite.toString());
    if (filtros.busqueda) params = params.set('busqueda', filtros.busqueda);
    if (filtros.activo) params = params.set('activo', filtros.activo);

    return this.http.get<ApiResponse<PaginatedResponse<TipoEspacio>>>(`${this.baseUrl}/tipos-espacio`, { params });
  }

  obtenerTipoEspacioPorId(id: number): Observable<ApiResponse<TipoEspacio>> {
    return this.http.get<ApiResponse<TipoEspacio>>(`${this.baseUrl}/tipos-espacio/${id}`);
  }

  crearTipoEspacio(tipoEspacio: TipoEspacioCreate): Observable<ApiResponse<TipoEspacio>> {
    return this.http.post<ApiResponse<TipoEspacio>>(`${this.baseUrl}/tipos-espacio`, tipoEspacio);
  }

  actualizarTipoEspacio(id: number, tipoEspacio: TipoEspacioUpdate): Observable<ApiResponse<TipoEspacio>> {
    return this.http.put<ApiResponse<TipoEspacio>>(`${this.baseUrl}/tipos-espacio/${id}`, tipoEspacio);
  }

  eliminarTipoEspacio(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/tipos-espacio/${id}`);
  }

  obtenerTiposEspacioActivos(): Observable<ApiResponse<OpcionSelect[]>> {
    return this.http.get<ApiResponse<OpcionSelect[]>>(`${this.baseUrl}/tipos-espacio/activos`);
  }
}
