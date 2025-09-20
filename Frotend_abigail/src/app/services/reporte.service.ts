import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import * as XLSX from 'xlsx';

export interface ApiResponse<T> {
  ok: boolean;
  datos: T;
  mensaje?: string;
  errores?: any;
}

export interface ReporteIngresos {
  ingresos: any[];
  total_registros: number;
  total_monto: number;
  filtros: {
    fecha_desde: string | null;
    fecha_hasta: string | null;
  };
  fecha_generacion: string;
}

export interface ReporteEgresos {
  egresos: any[];
  total_registros: number;
  total_monto: number;
  filtros: {
    fecha_desde: string | null;
    fecha_hasta: string | null;
  };
  fecha_generacion: string;
}

export interface ReporteBalance {
  resumen: {
    total_ingresos: number;
    total_egresos: number;
    balance: number;
    cantidad_ingresos: number;
    cantidad_egresos: number;
  };
  ingresos: any[];
  egresos: any[];
  filtros: {
    fecha_desde: string | null;
    fecha_hasta: string | null;
  };
  fecha_generacion: string;
}

export interface ReporteFeligreses {
  feligreses: any[];
  total_registros: number;
  estadisticas: {
    total_feligreses: number;
    feligreses_activos: number;
    feligreses_inactivos: number;
    masculinos: number;
    femeninos: number;
  };
  filtros: {
    activo: string | null;
    id_comunidad: string | null;
    fecha_desde: string | null;
    fecha_hasta: string | null;
  };
  fecha_generacion: string;
}

export interface ReporteSacramentos {
  total_registros: number;
  estadisticas: any;
  filtros: any;
  fecha_generacion: string;
}

export interface EstadisticasGenerales {
  feligreses: {
    total_feligreses: number;
    feligreses_activos: number;
    feligreses_inactivos: number;
  };
  sacramentos: {
    total_sacramentos: number;
    sacramentos_pagados: number;
    sacramentos_pendientes: number;
    total_bautizos: number;
    total_confirmaciones: number;
    total_matrimonios: number;
  };
  caja: {
    total_ingresos: number;
    total_egresos: number;
    monto_ingresos: number;
    monto_egresos: number;
    balance: number;
  };
  fecha_generacion: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReporteService {
  private apiUrl = `${environment.apiUrl}/reportes`;

  constructor(private http: HttpClient) {}

  // ========================================
  // REPORTES DE CAJA PARROQUIAL
  // ========================================

  obtenerReporteIngresos(filtros?: any): Observable<ApiResponse<ReporteIngresos>> {
    let params = new HttpParams();
    if (filtros?.fecha_desde) params = params.set('fecha_desde', filtros.fecha_desde);
    if (filtros?.fecha_hasta) params = params.set('fecha_hasta', filtros.fecha_hasta);
    
    return this.http.get<ApiResponse<ReporteIngresos>>(`${this.apiUrl}/caja/ingresos`, { params });
  }

  obtenerReporteEgresos(filtros?: any): Observable<ApiResponse<ReporteEgresos>> {
    let params = new HttpParams();
    if (filtros?.fecha_desde) params = params.set('fecha_desde', filtros.fecha_desde);
    if (filtros?.fecha_hasta) params = params.set('fecha_hasta', filtros.fecha_hasta);
    
    return this.http.get<ApiResponse<ReporteEgresos>>(`${this.apiUrl}/caja/egresos`, { params });
  }

  obtenerReporteBalance(filtros?: any): Observable<ApiResponse<ReporteBalance>> {
    let params = new HttpParams();
    if (filtros?.fecha_desde) params = params.set('fecha_desde', filtros.fecha_desde);
    if (filtros?.fecha_hasta) params = params.set('fecha_hasta', filtros.fecha_hasta);
    
    return this.http.get<ApiResponse<ReporteBalance>>(`${this.apiUrl}/caja/balance`, { params });
  }

  // ========================================
  // REPORTES DE FELIGRESES
  // ========================================

  obtenerReporteFeligreses(filtros?: any): Observable<ApiResponse<ReporteFeligreses>> {
    let params = new HttpParams();
    if (filtros?.activo !== undefined) params = params.set('activo', filtros.activo);
    if (filtros?.id_comunidad) params = params.set('id_comunidad', filtros.id_comunidad);
    if (filtros?.fecha_desde) params = params.set('fecha_desde', filtros.fecha_desde);
    if (filtros?.fecha_hasta) params = params.set('fecha_hasta', filtros.fecha_hasta);
    
    return this.http.get<ApiResponse<ReporteFeligreses>>(`${this.apiUrl}/feligreses`, { params });
  }

  // ========================================
  // REPORTES DE SACRAMENTOS
  // ========================================

  obtenerReporteBautizos(filtros?: any): Observable<ApiResponse<ReporteSacramentos>> {
    let params = new HttpParams();
    if (filtros?.fecha_desde) params = params.set('fecha_desde', filtros.fecha_desde);
    if (filtros?.fecha_hasta) params = params.set('fecha_hasta', filtros.fecha_hasta);
    if (filtros?.pagado !== undefined) params = params.set('pagado', filtros.pagado);
    
    return this.http.get<ApiResponse<ReporteSacramentos>>(`${this.apiUrl}/sacramentos/bautizos`, { params });
  }

  obtenerReporteConfirmaciones(filtros?: any): Observable<ApiResponse<ReporteSacramentos>> {
    let params = new HttpParams();
    if (filtros?.fecha_desde) params = params.set('fecha_desde', filtros.fecha_desde);
    if (filtros?.fecha_hasta) params = params.set('fecha_hasta', filtros.fecha_hasta);
    if (filtros?.pagado !== undefined) params = params.set('pagado', filtros.pagado);
    
    return this.http.get<ApiResponse<ReporteSacramentos>>(`${this.apiUrl}/sacramentos/confirmaciones`, { params });
  }

  obtenerReporteMatrimonios(filtros?: any): Observable<ApiResponse<ReporteSacramentos>> {
    let params = new HttpParams();
    if (filtros?.fecha_desde) params = params.set('fecha_desde', filtros.fecha_desde);
    if (filtros?.fecha_hasta) params = params.set('fecha_hasta', filtros.fecha_hasta);
    if (filtros?.pagado !== undefined) params = params.set('pagado', filtros.pagado);
    
    return this.http.get<ApiResponse<ReporteSacramentos>>(`${this.apiUrl}/sacramentos/matrimonios`, { params });
  }

  obtenerReporteSacramentosPendientes(filtros?: any): Observable<ApiResponse<ReporteSacramentos>> {
    let params = new HttpParams();
    if (filtros?.tipo_sacramento) params = params.set('tipo_sacramento', filtros.tipo_sacramento);
    
    return this.http.get<ApiResponse<ReporteSacramentos>>(`${this.apiUrl}/sacramentos/pendientes`, { params });
  }

  obtenerReporteSacramentosPagados(filtros?: any): Observable<ApiResponse<ReporteSacramentos>> {
    let params = new HttpParams();
    if (filtros?.tipo_sacramento) params = params.set('tipo_sacramento', filtros.tipo_sacramento);
    if (filtros?.fecha_desde) params = params.set('fecha_desde', filtros.fecha_desde);
    if (filtros?.fecha_hasta) params = params.set('fecha_hasta', filtros.fecha_hasta);
    
    return this.http.get<ApiResponse<ReporteSacramentos>>(`${this.apiUrl}/sacramentos/pagados`, { params });
  }

  // ========================================
  // ESTADÍSTICAS GENERALES
  // ========================================

  obtenerEstadisticasGenerales(): Observable<ApiResponse<EstadisticasGenerales>> {
    return this.http.get<ApiResponse<EstadisticasGenerales>>(`${this.apiUrl}/estadisticas`);
  }

  // ========================================
  // UTILIDADES PARA EXPORTACIÓN
  // ========================================

  exportarAExcel(datos: any[], nombreArchivo: string, tipoReporte?: string, totales?: any): void {
    if (!datos || datos.length === 0) {
      console.error('No hay datos para exportar');
      return;
    }

    try {
      // Preparar los datos para exportación
      const datosFormateados = this.formatearDatosParaExcel(datos, tipoReporte);
      
      // Crear libro de trabajo
      const wb = XLSX.utils.book_new();
      
      // Crear hoja principal con los datos
      const ws = XLSX.utils.json_to_sheet(datosFormateados);
      const colWidths = this.calcularAnchoColumnas(datosFormateados);
      ws['!cols'] = colWidths;
      XLSX.utils.book_append_sheet(wb, ws, 'Datos');
      
      // Si es reporte de balance, crear hoja separada para el resumen
      if (tipoReporte === 'caja-balance' && totales) {
        this.crearHojaResumenBalance(wb, totales);
      }
      
      // Generar archivo Excel
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      
      // Descargar archivo
      this.descargarArchivoExcel(excelBuffer, `${nombreArchivo}.xlsx`);
      
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
    }
  }

  private formatearDatosParaExcel(datos: any[], tipoReporte?: string): any[] {
    return datos.map(item => {
      const itemFormateado: any = {};
      
      // Formatear cada campo según su tipo
      Object.keys(item).forEach(key => {
        const valor = item[key];
        
        switch (key) {
          case 'fecha_hora':
          case 'fecha_celebracion':
          case 'fecha_nacimiento':
            itemFormateado[this.formatearNombreColumna(key)] = this.formatearFechaParaExcel(valor);
            break;
          case 'monto':
            itemFormateado[this.formatearNombreColumna(key)] = this.formatearMonedaParaExcel(valor);
            break;
          case 'activo':
          case 'pagado':
            itemFormateado[this.formatearNombreColumna(key)] = valor ? 'Sí' : 'No';
            break;
          case 'participantes':
            itemFormateado[this.formatearNombreColumna(key)] = this.formatearParticipantesParaExcel(valor);
            break;
          case 'tipo':
            itemFormateado[this.formatearNombreColumna(key)] = valor;
            break;
          default:
            itemFormateado[this.formatearNombreColumna(key)] = valor || '-';
        }
      });
      
      return itemFormateado;
    });
  }

  private formatearFechaParaExcel(fecha: any): string {
    if (!fecha) return '-';
    
    try {
      const fechaObj = new Date(fecha);
      if (isNaN(fechaObj.getTime())) {
        return '-';
      }
      return fechaObj.toLocaleDateString('es-ES');
    } catch (error) {
      return '-';
    }
  }

  private formatearMonedaParaExcel(monto: any): string {
    if (monto === null || monto === undefined || monto === '' || isNaN(monto)) {
      return 'Q0.00';
    }
    
    try {
      const numero = parseFloat(monto);
      if (isNaN(numero)) {
        return 'Q0.00';
      }
      return new Intl.NumberFormat('es-GT', {
        style: 'currency',
        currency: 'GTQ'
      }).format(numero);
    } catch (error) {
      return 'Q0.00';
    }
  }

  private formatearParticipantesParaExcel(participantes: any[]): string {
    if (!participantes || participantes.length === 0) return 'Sin participantes';
    return participantes.map(p => p.nombre_completo).join(', ');
  }

  private formatearNombreColumna(columna: string): string {
    const nombres: { [key: string]: string } = {
      'fecha_hora': 'Fecha y Hora',
      'fecha_celebracion': 'Fecha de Celebración',
      'fecha_nacimiento': 'Fecha de Nacimiento',
      'monto': 'Monto',
      'concepto': 'Concepto',
      'medio_pago': 'Medio de Pago',
      'feligres_nombre': 'Feligrés',
      'primer_nombre': 'Nombre',
      'primer_apellido': 'Apellido',
      'sexo': 'Sexo',
      'comunidad_nombre': 'Comunidad',
      'activo': 'Estado',
      'pagado': 'Pagado',
      'sacramento_nombre': 'Sacramento',
      'participantes': 'Participantes',
      'novio_nombre': 'Novio',
      'novia_nombre': 'Novia',
      'tipo': 'Tipo',
      'id_mov': 'ID Movimiento',
      'cuenta': 'Cuenta',
      'referencia': 'Referencia',
      'descripcion': 'Descripción',
      'usuario_nombre': 'Usuario'
    };
    return nombres[columna] || columna.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  private calcularAnchoColumnas(datos: any[]): any[] {
    if (datos.length === 0) return [];
    
    const headers = Object.keys(datos[0]);
    return headers.map(header => {
      const maxLength = Math.max(
        header.length,
        ...datos.map(row => String(row[header] || '').length)
      );
      return { wch: Math.min(Math.max(maxLength + 2, 10), 50) };
    });
  }

  private crearHojaResumenBalance(wb: any, totales: any): void {
    // Calcular totales
    const totalIngresos = totales.total_ingresos || 0;
    const totalEgresos = totales.total_egresos || 0;
    const balance = totales.balance || 0;
    
    // Crear datos para la hoja de resumen
    const resumenData = [
      { Concepto: 'Total de Ingresos', Monto: this.formatearMonedaParaExcel(totalIngresos) },
      { Concepto: 'Total de Egresos', Monto: this.formatearMonedaParaExcel(totalEgresos) },
      { Concepto: 'Balance', Monto: this.formatearMonedaParaExcel(balance) }
    ];
    
    // Crear hoja de trabajo para el resumen
    const wsResumen = XLSX.utils.json_to_sheet(resumenData);
    
    // Configurar ancho de columnas
    wsResumen['!cols'] = [
      { wch: 20 }, // Concepto
      { wch: 15 }  // Monto
    ];
    
    // Agregar hoja al libro
    XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen de Balance');
  }

  private descargarArchivoExcel(data: ArrayBuffer, filename: string): void {
    const blob = new Blob([data], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}
