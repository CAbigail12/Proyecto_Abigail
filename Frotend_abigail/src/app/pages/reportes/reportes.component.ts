import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';

import { ReporteService, EstadisticasGenerales, ReporteIngresos, ReporteEgresos, ReporteBalance, ReporteFeligreses, ReporteSacramentos } from '../../services/reporte.service';
import { MantenimientoService } from '../../services/mantenimiento.service';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatChipsModule,
    MatBadgeModule
  ],
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.css']
})
export class ReportesComponent implements OnInit {
  // Estados de carga
  cargandoEstadisticas = false;
  cargandoReporte = false;

  // Datos
  estadisticas: EstadisticasGenerales | null = null;
  datosReporte: any[] = [];
  comunidades: any[] = [];
  totalesBalance: any = null;
  
  // Tipo de reporte activo en Caja Parroquial
  tipoReporteActivo: string = 'ingresos';

  // Formularios
  formularioFiltros: FormGroup;

  // Configuración de tabs
  tabs = [
    { id: 'estadisticas', label: 'Estadísticas Generales', icon: 'analytics' },
    { id: 'caja-ingresos', label: 'Ingresos', icon: 'trending_up' },
    { id: 'caja-egresos', label: 'Egresos', icon: 'trending_down' },
    { id: 'caja-balance', label: 'Balance', icon: 'account_balance' },
    { id: 'feligreses', label: 'Feligreses', icon: 'people' },
    { id: 'bautizos', label: 'Bautizos', icon: 'child_care' },
    { id: 'confirmaciones', label: 'Confirmaciones', icon: 'confirmation_number' },
    { id: 'matrimonios', label: 'Matrimonios', icon: 'favorite' },
    { id: 'pagados', label: 'Pagados', icon: 'check_circle' }
  ];

  tabActivo = 0;

  // Columnas de tablas
  columnasIngresos = ['fecha_hora', 'monto', 'concepto', 'medio_pago', 'feligres_nombre'];
  columnasEgresos = ['fecha_hora', 'monto', 'concepto', 'medio_pago', 'feligres_nombre'];
  columnasBalance = ['tipo', 'fecha_hora', 'monto', 'concepto', 'medio_pago', 'feligres_nombre', 'usuario_nombre'];
  columnasFeligreses = ['primer_nombre', 'primer_apellido', 'fecha_nacimiento', 'sexo', 'comunidad_nombre', 'activo'];
  columnasBautizos = ['fecha_celebracion', 'feligres_nombre', 'fecha_nacimiento', 'comunidad_nombre', 'pagado'];
  columnasConfirmaciones = ['fecha_celebracion', 'feligres_nombre', 'fecha_nacimiento', 'comunidad_nombre', 'pagado'];
  columnasMatrimonios = ['fecha_celebracion', 'novio_nombre', 'novia_nombre', 'pagado'];
  columnasPendientes = ['fecha_celebracion', 'sacramento_nombre', 'participantes', 'pagado'];
  columnasPagados = ['fecha_celebracion', 'sacramento_nombre', 'participantes', 'pagado'];

  constructor(
    private reporteService: ReporteService,
    private mantenimientoService: MantenimientoService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.formularioFiltros = this.fb.group({
      fecha_desde: [''],
      fecha_hasta: [''],
      activo: [''],
      id_comunidad: [''],
      pagado: [''],
      tipo_sacramento: ['']
    });
  }

  ngOnInit(): void {
    this.cargarEstadisticas();
    this.cargarComunidades();
  }

  // ========================================
  // MÉTODOS DE CARGA DE DATOS
  // ========================================

  cargarEstadisticas(): void {
    this.cargandoEstadisticas = true;
    this.reporteService.obtenerEstadisticasGenerales().subscribe({
      next: (response) => {
        if (response.ok) {
          this.estadisticas = response.datos;
        } else {
          this.mostrarError('Error al cargar estadísticas');
        }
        this.cargandoEstadisticas = false;
      },
      error: (error) => {
        console.error('Error al cargar estadísticas:', error);
        this.mostrarError('Error al cargar estadísticas');
        this.cargandoEstadisticas = false;
      }
    });
  }

  cargarComunidades(): void {
    this.mantenimientoService.obtenerComunidades().subscribe({
      next: (response: any) => {
        if (response.ok) {
          // Manejar tanto respuesta paginada como directa
          if (response.datos.datos) {
            this.comunidades = response.datos.datos;
          } else if (Array.isArray(response.datos)) {
            this.comunidades = response.datos;
          } else {
            this.comunidades = [];
          }
        }
      },
      error: (error: any) => {
        console.error('Error al cargar comunidades:', error);
        this.comunidades = [];
      }
    });
  }

  // ========================================
  // MÉTODOS DE GENERACIÓN DE REPORTES
  // ========================================

  generarReporte(tipoReporte: string): void {
    this.cargandoReporte = true;
    this.tipoReporteActivo = tipoReporte; // Actualizar el tipo de reporte activo
    const filtros = this.obtenerFiltros();

    let observable: Observable<any>;
    switch (tipoReporte) {
      case 'ingresos':
        observable = this.reporteService.obtenerReporteIngresos(filtros);
        break;
      case 'egresos':
        observable = this.reporteService.obtenerReporteEgresos(filtros);
        break;
      case 'balance':
        observable = this.reporteService.obtenerReporteBalance(filtros);
        break;
      case 'feligreses':
        observable = this.reporteService.obtenerReporteFeligreses(filtros);
        break;
      case 'bautizos':
        observable = this.reporteService.obtenerReporteBautizos(filtros);
        break;
      case 'confirmaciones':
        observable = this.reporteService.obtenerReporteConfirmaciones(filtros);
        break;
      case 'matrimonios':
        observable = this.reporteService.obtenerReporteMatrimonios(filtros);
        break;
      case 'pendientes':
        observable = this.reporteService.obtenerReporteSacramentosPendientes(filtros);
        break;
      case 'pagados':
        observable = this.reporteService.obtenerReporteSacramentosPagados(filtros);
        break;
      default:
        this.mostrarError('Tipo de reporte no válido');
        this.cargandoReporte = false;
        return;
    }

    observable.subscribe(
      (response: any) => {
        if (response.ok) {
          this.procesarDatosReporte(response.datos, tipoReporte);
          this.mostrarExito('Reporte generado correctamente');
        } else {
          this.mostrarError('Error al generar el reporte');
        }
        this.cargandoReporte = false;
      },
      (error: any) => {
        console.error('Error al generar reporte:', error);
        this.mostrarError('Error al generar el reporte');
        this.cargandoReporte = false;
      }
    );
  }

  private procesarDatosReporte(datos: any, tipoReporte: string): void {
    console.log('Datos recibidos para', tipoReporte, ':', datos);
    
    switch (tipoReporte) {
      case 'ingresos':
        this.datosReporte = datos.ingresos || [];
        break;
      case 'egresos':
        this.datosReporte = datos.egresos || [];
        break;
      case 'balance':
        // Para balance, mostrar tanto ingresos como egresos
        const balanceData = [];
        if (datos.ingresos && Array.isArray(datos.ingresos)) {
          balanceData.push(...datos.ingresos.map((item: any) => ({ ...item, tipo: 'Ingreso' })));
        }
        if (datos.egresos && Array.isArray(datos.egresos)) {
          balanceData.push(...datos.egresos.map((item: any) => ({ ...item, tipo: 'Egreso' })));
        }
        
        this.datosReporte = balanceData;
        // Almacenar totales para exportación
        this.totalesBalance = datos.resumen;
        break;
      case 'feligreses':
        this.datosReporte = datos.feligreses || [];
        break;
      case 'bautizos':
        const bautizosData = datos.bautizos || [];
        this.datosReporte = bautizosData.map((bautizo: any) => ({
          ...bautizo,
          sacramento_nombre: 'Bautizo',
          participantes: [
            { nombre_completo: bautizo.feligres_nombre || 'No asignado' }
          ]
        }));
        break;
      case 'confirmaciones':
        const confirmacionesData = datos.confirmaciones || [];
        this.datosReporte = confirmacionesData.map((confirmacion: any) => ({
          ...confirmacion,
          sacramento_nombre: 'Confirmación',
          participantes: [
            { nombre_completo: confirmacion.feligres_nombre || 'No asignado' }
          ]
        }));
        break;
      case 'matrimonios':
        const matrimoniosData = datos.matrimonios || [];
        // Transformar los datos para que tengan la estructura esperada
        this.datosReporte = matrimoniosData.map((matrimonio: any) => ({
          ...matrimonio,
          sacramento_nombre: 'Matrimonio',
          participantes: [
            { nombre_completo: matrimonio.novio_nombre || 'No asignado' },
            { nombre_completo: matrimonio.novia_nombre || 'No asignado' }
          ],
          comunidad_nombre: matrimonio.novio_comunidad || matrimonio.novia_comunidad || 'N/A'
        }));
        break;
      case 'pagados':
        const pagadosData = datos.sacramentos_pagados || [];
        this.datosReporte = pagadosData.map((sacramento: any) => ({
          ...sacramento,
          participantes: sacramento.participantes || []
        }));
        break;
    }
    
    console.log('Datos procesados:', this.datosReporte);
  }

  // ========================================
  // MÉTODOS DE EXPORTACIÓN
  // ========================================

  exportarExcel(): void {
    if (this.datosReporte.length === 0) {
      this.mostrarError('No hay datos para exportar');
      return;
    }

    const nombreArchivo = this.obtenerNombreArchivo();
    const tipoReporte = this.obtenerTipoReporte();
    
    // Pasar totales solo si es reporte de balance
    const totales = tipoReporte === 'caja-balance' ? this.totalesBalance : undefined;
    
    
    this.reporteService.exportarAExcel(this.datosReporte, nombreArchivo, tipoReporte, totales);
    this.mostrarExito('Archivo exportado correctamente');
  }

  private obtenerNombreArchivo(): string {
    const fecha = new Date().toISOString().split('T')[0];
    const tabActivo = this.tabs[this.tabActivo];
    return `reporte_${tabActivo.id}_${fecha}`;
  }

  obtenerTipoReporte(): string {
    const tabActivo = this.tabs[this.tabActivo];
    
    // Si estamos en el tab de Caja Parroquial, usar el tipo de reporte activo
    if (tabActivo.id === 'caja-ingresos') {
      return `caja-${this.tipoReporteActivo}`;
    }
    
    return tabActivo.id;
  }

  // ========================================
  // MÉTODOS DE UTILIDAD
  // ========================================

  private obtenerFiltros(): any {
    const filtros = this.formularioFiltros.value;
    const filtrosLimpios: any = {};

    if (filtros.fecha_desde) {
      filtrosLimpios.fecha_desde = filtros.fecha_desde.toISOString().split('T')[0];
    }
    if (filtros.fecha_hasta) {
      filtrosLimpios.fecha_hasta = filtros.fecha_hasta.toISOString().split('T')[0];
    }
    if (filtros.activo !== '') {
      filtrosLimpios.activo = filtros.activo;
    }
    if (filtros.id_comunidad) {
      filtrosLimpios.id_comunidad = filtros.id_comunidad;
    }
    if (filtros.pagado !== '') {
      filtrosLimpios.pagado = filtros.pagado;
    }
    if (filtros.tipo_sacramento) {
      filtrosLimpios.tipo_sacramento = filtros.tipo_sacramento;
    }

    return filtrosLimpios;
  }

  limpiarFiltros(): void {
    this.formularioFiltros.reset();
    this.datosReporte = [];
    this.totalesBalance = null;
    this.tipoReporteActivo = 'ingresos'; // Resetear al tipo por defecto
  }

  cambiarTab(index: number): void {
    this.tabActivo = index;
    this.datosReporte = [];
    this.totalesBalance = null;
    this.tipoReporteActivo = 'ingresos'; // Resetear al tipo por defecto
  }

  // ========================================
  // MÉTODOS DE NOTIFICACIÓN
  // ========================================

  private mostrarExito(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private mostrarError(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  // ========================================
  // MÉTODOS DE FORMATEO
  // ========================================

  formatearFecha(fecha: any): string {
    if (!fecha) return '-';
    
    try {
      // Si es una fecha válida
      const fechaObj = new Date(fecha);
      if (isNaN(fechaObj.getTime())) {
        return '-';
      }
      return fechaObj.toLocaleDateString('es-ES');
    } catch (error) {
      console.error('Error al formatear fecha:', error, fecha);
      return '-';
    }
  }

  formatearMoneda(monto: any): string {
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
      console.error('Error al formatear moneda:', error, monto);
      return 'Q0.00';
    }
  }

  formatearBoolean(valor: boolean): string {
    return valor ? 'Sí' : 'No';
  }

  formatearParticipantes(participantes: any[]): string {
    if (!participantes || participantes.length === 0) return 'Sin participantes';
    return participantes.map(p => p.nombre_completo).join(', ');
  }

  obtenerColumnas(): string[] {
    const tabActual = this.tabs[this.tabActivo];
    let columnas: string[] = [];
    
    switch (tabActual.id) {
      case 'caja-ingresos':
        columnas = this.columnasIngresos;
        break;
      case 'caja-egresos':
        columnas = this.columnasEgresos;
        break;
      case 'caja-balance':
        columnas = this.columnasBalance;
        break;
      case 'feligreses':
        columnas = this.columnasFeligreses;
        break;
      case 'bautizos':
      case 'confirmaciones':
      case 'matrimonios':
      case 'pagados':
        columnas = this.obtenerColumnasSacramentos();
        break;
      default:
        columnas = this.columnasIngresos;
    }
    
    return columnas;
  }

  obtenerColumnasSacramentos(): string[] {
    return ['sacramento', 'participantes', 'fecha_celebracion', 'pagado', 'comunidad_nombre', 'comentarios'];
  }

  formatearNombreColumna(columna: string): string {
    const nombres: { [key: string]: string } = {
      'fecha_hora': 'Fecha y Hora',
      'fecha_celebracion': 'Fecha de Celebración',
      'fecha_nacimiento': 'Fecha de Nacimiento',
      'monto': 'Monto',
      'concepto': 'Concepto',
      'medio_pago': 'Medio de Pago',
      'feligres_nombre': 'Feligrés',
      'usuario_nombre': 'Usuario',
      'totales': 'Totales',
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
      'tipo': 'Tipo'
    };
    return nombres[columna] || columna.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}
