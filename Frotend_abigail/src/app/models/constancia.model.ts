// ============================================================
// MODELOS PARA CONSTANCIAS DE SACRAMENTOS
// ============================================================

export interface Constancia {
  id_constancia: number;
  id_asignacion: number;
  tipo_sacramento: 'bautizo' | 'confirmacion' | 'matrimonio';
  id_parroco: number;
  libro?: string | null;
  folio?: string | null;
  acta?: string | null;
  fecha_constancia: string;
  datos_json?: any;
  al_margen?: string | null;
  created_at: string;
  updated_at: string;
  parroco_nombre?: string;
  parroco_apellido?: string;
}

export interface ConstanciaCreate {
  id_asignacion: number;
  tipo_sacramento: 'bautizo' | 'confirmacion' | 'matrimonio';
  id_parroco: number;
  libro?: string | null;
  folio?: string | null;
  acta?: string | null;
  fecha_constancia?: string;
  datos_json?: any;
  al_margen?: string | null;
}

export interface ConstanciaUpdate {
  id_parroco?: number;
  libro?: string | null;
  folio?: string | null;
  acta?: string | null;
  fecha_constancia?: string;
  datos_json?: any;
  al_margen?: string | null;
}


