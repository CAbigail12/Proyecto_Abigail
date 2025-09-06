// ============================================================
// MODELOS PARA EL MÓDULO DE MANTENIMIENTO
// ============================================================

// ============================================================
// MODELO DE SACRAMENTO
// ============================================================

export interface Sacramento {
  id_sacramento: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface SacramentoCreate {
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

export interface SacramentoUpdate {
  nombre?: string;
  descripcion?: string;
  activo?: boolean;
}

// ============================================================
// MODELO DE TIPO DE DOCUMENTO
// ============================================================

export interface TipoDocumento {
  id_tipo_documento: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface TipoDocumentoCreate {
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

export interface TipoDocumentoUpdate {
  nombre?: string;
  descripcion?: string;
  activo?: boolean;
}

// ============================================================
// MODELO DE REQUISITO
// ============================================================

export interface Requisito {
  id_requisito: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface RequisitoCreate {
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

export interface RequisitoUpdate {
  nombre?: string;
  descripcion?: string;
  activo?: boolean;
}

// ============================================================
// MODELO DE REQUISITO POR SACRAMENTO
// ============================================================

export interface RequisitoPorSacramento {
  id_sacramento: number;
  id_requisito: number;
  obligatorio: boolean;
  orden?: number;
  created_at: string;
  updated_at: string;
  nombre_sacramento?: string;
  nombre_requisito?: string;
}

export interface RequisitoPorSacramentoCreate {
  id_sacramento: number;
  id_requisito: number;
  obligatorio?: boolean;
  orden?: number;
}

export interface RequisitoPorSacramentoUpdate {
  obligatorio?: boolean;
  orden?: number;
}

// ============================================================
// MODELO DE ROL DE PARTICIPANTE
// ============================================================

export interface RolParticipante {
  id_rol_participante: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface RolParticipanteCreate {
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

export interface RolParticipanteUpdate {
  nombre?: string;
  descripcion?: string;
  activo?: boolean;
}

// ============================================================
// MODELO DE COMUNIDAD
// ============================================================

export interface Comunidad {
  id_comunidad: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ComunidadCreate {
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

export interface ComunidadUpdate {
  nombre?: string;
  descripcion?: string;
  activo?: boolean;
}

// ============================================================
// MODELO DE TIPO DE ESPACIO
// ============================================================

export interface TipoEspacio {
  id_tipo_espacio: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface TipoEspacioCreate {
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

export interface TipoEspacioUpdate {
  nombre?: string;
  descripcion?: string;
  activo?: boolean;
}

// ============================================================
// MODELOS DE RESPUESTA DE LA API
// ============================================================

export interface ApiResponse<T> {
  ok: boolean;
  mensaje?: string;
  datos: T;
}

export interface PaginatedResponse<T> {
  datos: T[];
  paginacion: {
    pagina: number;
    limite: number;
    total: number;
    totalPaginas: number;
  };
}

// ============================================================
// MODELOS DE FILTROS
// ============================================================

export interface FiltrosGenerales {
  busqueda?: string;
  activo?: string;
  pagina?: number;
  limite?: number;
}

export interface FiltrosRequisitoPorSacramento extends FiltrosGenerales {
  id_sacramento?: number;
  id_requisito?: number;
  obligatorio?: string;
}

// ============================================================
// MODELO DE FELIGRÉS
// ============================================================

export interface Feligres {
  id_feligres: number;
  primer_nombre: string;
  segundo_nombre?: string;
  otros_nombres?: string;
  primer_apellido: string;
  segundo_apellido?: string;
  apellido_casada?: string;
  fecha_nacimiento?: string;
  sexo?: string;
  nombre_padre?: string;
  nombre_madre?: string;
  departamento?: string;
  municipio?: string;
  id_comunidad?: number;
  telefono?: string;
  correo?: string;
  direccion?: string;
  comentarios?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
  comunidad_nombre?: string;
}

export interface FeligresCreate {
  primer_nombre: string;
  segundo_nombre?: string;
  otros_nombres?: string;
  primer_apellido: string;
  segundo_apellido?: string;
  apellido_casada?: string;
  fecha_nacimiento?: string;
  sexo?: string;
  nombre_padre?: string;
  nombre_madre?: string;
  departamento?: string;
  municipio?: string;
  id_comunidad?: number;
  telefono?: string;
  correo?: string;
  direccion?: string;
  comentarios?: string;
  activo?: boolean;
}

export interface FeligresUpdate {
  primer_nombre?: string;
  segundo_nombre?: string;
  otros_nombres?: string;
  primer_apellido?: string;
  segundo_apellido?: string;
  apellido_casada?: string;
  fecha_nacimiento?: string;
  sexo?: string;
  nombre_padre?: string;
  nombre_madre?: string;
  departamento?: string;
  municipio?: string;
  id_comunidad?: number;
  telefono?: string;
  correo?: string;
  direccion?: string;
  comentarios?: string;
  activo?: boolean;
}

// ============================================================
// MODELOS PARA SELECTS
// ============================================================

export interface OpcionSelect {
  id: number;
  nombre: string;
  descripcion?: string;
}

export interface ComunidadSelect {
  id_comunidad: number;
  nombre: string;
  descripcion?: string;
}

export interface FiltrosFeligres extends FiltrosGenerales {
  id_comunidad?: number;
  sexo?: string;
}
