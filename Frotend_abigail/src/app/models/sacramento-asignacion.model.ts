// ============================================================
// MODELOS PARA ASIGNACIÓN DE SACRAMENTOS
// ============================================================

export interface ApiResponse<T> {
  ok: boolean;
  datos: T;
  mensaje?: string;
  errores?: any;
}

export interface SacramentoAsignacion {
  id_asignacion: number;
  id_sacramento: number;
  fecha_celebracion: string;
  pagado: boolean;
  monto_pagado?: number;
  comentarios?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
  sacramento_nombre?: string;
  sacramento_descripcion?: string;
  participantes: ParticipanteAsignacion[];
  testigos_padrinos?: TestigoPadrino[];
}

export interface ParticipanteAsignacion {
  id_feligres: number;
  nombre_completo: string;
  primer_nombre: string;
  primer_apellido: string;
  feligres_nombre: string;
  id_rol_participante?: number;
  rol_nombre?: string;
}

export interface SacramentoAsignacionCreate {
  id_sacramento: number;
  fecha_celebracion: string;
  pagado: boolean;
  monto_pagado?: number | null;
  comentarios?: string;
  participantes: ParticipanteAsignacionCreate[];
  testigos_padrinos?: TestigoPadrinoCreate[];
}

export interface ParticipanteAsignacionCreate {
  id_feligres: number;
  id_rol_participante?: number;
}

export interface SacramentoAsignacionUpdate {
  id_sacramento?: number;
  fecha_celebracion?: string;
  pagado?: boolean;
  monto_pagado?: number | null;
  comentarios?: string;
  participantes?: ParticipanteAsignacionCreate[];
  testigos_padrinos?: TestigoPadrinoCreate[];
}

// ============================================================
// MODELOS PARA CATÁLOGOS
// ============================================================

export interface SacramentoCatalogo {
  id_sacramento: number;
  nombre: string;
  descripcion?: string;
}

export interface RolParticipanteCatalogo {
  id_rol_participante: number;
  nombre: string;
  descripcion?: string;
}

// ============================================================
// MODELOS PARA FILTROS
// ============================================================

export interface FiltrosAsignacion {
  id_sacramento?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  pagado?: string;
  busqueda?: string;
  pagina?: number;
  limite?: number;
}

// ============================================================
// MODELOS PARA RESPUESTAS
// ============================================================

export interface AsignacionResponse {
  asignaciones: SacramentoAsignacion[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

// ============================================================
// MODELOS PARA FORMULARIOS
// ============================================================

export interface FormularioBautizo {
  id_feligres: number | null;
  fecha_celebracion: string;
  pagado: boolean;
  comentarios: string;
}

export interface FormularioConfirmacion {
  id_feligres: number | null;
  fecha_celebracion: string;
  pagado: boolean;
  comentarios: string;
}

export interface FormularioMatrimonio {
  id_feligres_novio: number | null;
  id_feligres_novia: number | null;
  fecha_celebracion: string;
  pagado: boolean;
  comentarios: string;
}

// ============================================================
// MODELOS PARA ESTADÍSTICAS
// ============================================================

export interface EstadisticasSacramentos {
  total_asignaciones: number;
  asignaciones_pagadas: number;
  asignaciones_pendientes: number;
  pendientes_pago: number;
  proximas_celebraciones: number;
  total_bautizos: number;
  total_confirmaciones: number;
  total_matrimonios: number;
}

// ============================================================
// MODELOS PARA TESTIGOS/PADRINOS
// ============================================================

export interface TestigoPadrino {
  id_testigo_padrino: number;
  id_asignacion: number;
  id_feligres: number;
  id_tipo_testigo_padrino: number;
  numero_orden: number;
  nombre_completo?: string;
  tipo_nombre?: string;
  tipo_descripcion?: string;
}

export interface TestigoPadrinoCreate {
  id_feligres: number;
  id_tipo_testigo_padrino: number;
  numero_orden: number;
}

export interface TipoTestigoPadrino {
  id_tipo_testigo_padrino: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}
