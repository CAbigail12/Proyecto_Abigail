// ============================================================
// MODELOS PARA CONSTANCIAS EXTERNAS DE SACRAMENTOS
// ============================================================

export interface ConstanciaExterna {
  id_constancia_externa: number;
  id_feligres: number;
  id_sacramento: number;
  libro: string;
  folio: string;
  descripcion?: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
  nombre_feligres_completo?: string;
  nombre_sacramento?: string;
}

export interface ConstanciaExternaCreate {
  id_feligres: number;
  id_sacramento: number; // Solo 1 (Bautismo) o 3 (Confirmación)
  libro: string;
  folio: string;
  descripcion?: string | null;
}

export interface ConstanciaExternaUpdate {
  id_feligres: number;
  id_sacramento: number; // Solo 1 (Bautismo) o 3 (Confirmación)
  libro: string;
  folio: string;
  descripcion?: string | null;
}

export interface FiltrosConstanciaExterna {
  id_feligres?: number;
  id_sacramento?: number;
  busqueda?: string;
}

export interface Paginacion {
  pagina: number;
  limite: number;
  total?: number;
  totalPaginas?: number;
}

export interface ApiResponse<T> {
  ok: boolean;
  datos: T;
  mensaje?: string;
  errores?: any;
  paginacion?: Paginacion;
}

