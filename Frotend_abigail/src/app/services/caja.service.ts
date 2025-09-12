import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface MovimientoCaja {
  id_mov: number;
  fecha_hora: string;
  naturaleza: 'ingreso' | 'egreso';
  monto: number;
  monto_signed: number;
  cuenta: string;
  medio_pago: string;
  concepto: string;
  referencia?: string;
  descripcion?: string;
  id_feligres?: number;
  creado_por: number;
  created_at: string;
  updated_at?: string;
  feligres_nombre?: string;
  usuario_nombre?: string;
  usuario_apellido?: string;
}

export interface CrearMovimientoRequest {
  naturaleza: 'ingreso' | 'egreso';
  monto: number;
  cuenta: string;
  medio_pago: string;
  concepto: string;
  referencia?: string;
  descripcion?: string;
  id_feligres?: number;
}

export interface BalanceGlobal {
  total_ingresos: number;
  total_egresos: number;
  saldo_actual: number;
}

export interface BalancePorCuenta {
  cuenta: string;
  total_ingresos: number;
  total_egresos: number;
  saldo_actual: number;
}

export interface ResumenDiario {
  cuenta: string;
  fecha_utc: string;
  naturaleza: 'ingreso' | 'egreso';
  total: number;
}

export interface Kardex {
  id_mov: number;
  fecha_hora: string;
  cuenta: string;
  concepto: string;
  naturaleza: 'ingreso' | 'egreso';
  monto: number;
  monto_signed: number;
  saldo_acumulado_cuenta: number;
}

export interface Estadisticas {
  total_movimientos: number;
  total_ingresos: number;
  total_egresos: number;
  monto_total_ingresos: number;
  monto_total_egresos: number;
  saldo_actual: number;
}

export interface FiltrosMovimientos {
  naturaleza?: 'ingreso' | 'egreso';
  cuenta?: string;
  concepto?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  id_feligres?: number;
  pagina?: number;
  limite?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CajaService {
  private apiUrl = `${environment.apiUrl}/caja`;

  constructor(private http: HttpClient) {}

  // Crear nuevo movimiento
  crearMovimiento(movimiento: CrearMovimientoRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/movimientos`, movimiento);
  }

  // Obtener todos los movimientos con filtros y paginación
  obtenerMovimientos(filtros: FiltrosMovimientos = {}): Observable<any> {
    let params = new HttpParams();
    
    Object.keys(filtros).forEach(key => {
      const value = filtros[key as keyof FiltrosMovimientos];
      if (value !== undefined && value !== null) {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get(`${this.apiUrl}/movimientos`, { params });
  }

  // Obtener movimiento por ID
  obtenerMovimientoPorId(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/movimientos/${id}`);
  }

  // Actualizar movimiento
  actualizarMovimiento(id: number, movimiento: Partial<CrearMovimientoRequest>): Observable<any> {
    return this.http.put(`${this.apiUrl}/movimientos/${id}`, movimiento);
  }

  // Eliminar movimiento
  eliminarMovimiento(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/movimientos/${id}`);
  }

  // Obtener balance global
  obtenerBalanceGlobal(): Observable<any> {
    return this.http.get(`${this.apiUrl}/balance/global`);
  }

  // Obtener balance por cuenta
  obtenerBalancePorCuenta(): Observable<any> {
    return this.http.get(`${this.apiUrl}/balance/por-cuenta`);
  }

  // Obtener resumen diario
  obtenerResumenDiario(fecha_desde?: string, fecha_hasta?: string): Observable<any> {
    let params = new HttpParams();
    if (fecha_desde) params = params.set('fecha_desde', fecha_desde);
    if (fecha_hasta) params = params.set('fecha_hasta', fecha_hasta);
    
    return this.http.get(`${this.apiUrl}/resumen/diario`, { params });
  }

  // Obtener kardex
  obtenerKardex(cuenta?: string, fecha_desde?: string, fecha_hasta?: string): Observable<any> {
    let params = new HttpParams();
    if (cuenta) params = params.set('cuenta', cuenta);
    if (fecha_desde) params = params.set('fecha_desde', fecha_desde);
    if (fecha_hasta) params = params.set('fecha_hasta', fecha_hasta);
    
    return this.http.get(`${this.apiUrl}/kardex`, { params });
  }

  // Obtener estadísticas
  obtenerEstadisticas(fecha_desde?: string, fecha_hasta?: string): Observable<any> {
    let params = new HttpParams();
    if (fecha_desde) params = params.set('fecha_desde', fecha_desde);
    if (fecha_hasta) params = params.set('fecha_hasta', fecha_hasta);
    
    return this.http.get(`${this.apiUrl}/estadisticas`, { params });
  }

  // Obtener cuentas disponibles
  obtenerCuentas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/catalogos/cuentas`);
  }

  // Obtener conceptos disponibles
  obtenerConceptos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/catalogos/conceptos`);
  }

  // Obtener medios de pago disponibles
  obtenerMediosPago(): Observable<any> {
    return this.http.get(`${this.apiUrl}/catalogos/medios-pago`);
  }

  // Métodos de utilidad
  formatearMonto(monto: number): string {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ'
    }).format(monto);
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  obtenerColorNaturaleza(naturaleza: 'ingreso' | 'egreso'): string {
    return naturaleza === 'ingreso' ? 'text-green-600' : 'text-red-600';
  }

  obtenerIconoNaturaleza(naturaleza: 'ingreso' | 'egreso'): string {
    return naturaleza === 'ingreso' ? 'trending_up' : 'trending_down';
  }
}
