// ============================================================
// MODELOS PARA ACTIVIDADES RELIGIOSAS
// ============================================================

export interface ApiResponse<T> {
  ok: boolean;
  mensaje: string;
  datos: T;
  errores?: any;
}

export interface ActividadReligiosa {
  id_actividad: number;
  id_tipo_actividad: number;
  nombre: string;
  descripcion?: string;
  fecha_actividad: string;
  hora_actividad?: string;
  lugar?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
  tipo_actividad_nombre?: string;
  tipo_actividad_descripcion?: string;
}

export interface TipoActividad {
  id_tipo_actividad: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ActividadReligiosaCreate {
  id_tipo_actividad: number;
  nombre: string;
  descripcion?: string;
  fecha_actividad: string;
  hora_actividad?: string;
  lugar?: string;
}

export interface ActividadReligiosaUpdate {
  id_tipo_actividad?: number;
  nombre?: string;
  descripcion?: string;
  fecha_actividad?: string;
  hora_actividad?: string;
  lugar?: string;
}

export interface TipoActividadCreate {
  nombre: string;
  descripcion?: string;
}

export interface TipoActividadUpdate {
  nombre?: string;
  descripcion?: string;
}

// ============================================================
// MODELOS PARA FILTROS
// ============================================================

export interface FiltrosActividad {
  pagina?: number;
  limite?: number;
  busqueda?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  id_tipo_actividad?: number;
  activo?: boolean;
}

// ============================================================
// MODELOS PARA RESPUESTAS
// ============================================================

export interface ActividadResponse {
  actividades: ActividadReligiosa[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

export interface EstadisticasActividades {
  total_actividades: number;
  actividades_futuras: number;
  actividades_pasadas: number;
  tipos_actividad_utilizados: number;
}

// ============================================================
// MODELOS PARA FORMULARIOS
// ============================================================

export interface FormularioActividad {
  id_tipo_actividad: number | null;
  nombre: string;
  descripcion: string;
  fecha_actividad: string;
  hora_actividad: string;
  lugar: string;
}

export interface FormularioTipoActividad {
  nombre: string;
  descripcion: string;
}
