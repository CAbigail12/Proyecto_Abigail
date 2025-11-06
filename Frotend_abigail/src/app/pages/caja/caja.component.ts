import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import * as XLSX from 'xlsx';

import { CajaService, MovimientoCaja, BalanceGlobal, BalancePorCuenta, CrearMovimientoRequest } from '../../services/caja.service';
import { FeligresService } from '../../services/feligres.service';
import { Feligres } from '../../models/mantenimiento.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-caja',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    FormsModule,
    MatTabsModule, 
    MatIconModule, 
    MatInputModule, 
    MatButtonModule, 
    MatSelectModule, 
    MatDatepickerModule, 
    MatNativeDateModule,
    MatPaginatorModule
  ],
  templateUrl: './caja.component.html',
  styleUrls: ['./caja.component.css']
})
export class CajaComponent implements OnInit, AfterViewInit, OnDestroy {
  private destroy$ = new Subject<void>();

  @ViewChild('paginatorIngresos') paginatorIngresos!: MatPaginator;
  @ViewChild('paginatorEgresos') paginatorEgresos!: MatPaginator;
  @ViewChild('paginatorBalance') paginatorBalance!: MatPaginator;

  // Estados del componente
  cargando = false;
  tabSeleccionado = 0;

  // Datos originales (todos los movimientos)
  todosLosMovimientos: MovimientoCaja[] = [];
  
  // Datos filtrados y paginados
  balanceGlobal: BalanceGlobal | null = null;
  balancesPorCuenta: BalancePorCuenta[] = [];
  movimientosRecientes: MovimientoCaja[] = [];
  movimientosRecientesPaginados: MovimientoCaja[] = [];
  ingresos: MovimientoCaja[] = [];
  ingresosPaginados: MovimientoCaja[] = [];
  egresos: MovimientoCaja[] = [];
  egresosPaginados: MovimientoCaja[] = [];
  feligreses: Feligres[] = [];

  // Paginación
  pageSizeIngresos = 10;
  pageSizeEgresos = 10;
  pageSizeBalance = 10;
  totalIngresos = 0;
  totalEgresos = 0;
  totalMovimientos = 0;

  // Filtros y búsquedas
  filtrosIngresos = {
    concepto: '',
    cuenta: '',
    medio_pago: '',
    fecha_desde: '',
    fecha_hasta: '',
    feligres: ''
  };

  filtrosEgresos = {
    concepto: '',
    cuenta: '',
    medio_pago: '',
    fecha_desde: '',
    fecha_hasta: '',
    feligres: ''
  };

  filtrosBalance = {
    concepto: '',
    cuenta: '',
    naturaleza: '',
    fecha_desde: '',
    fecha_hasta: '',
    feligres: ''
  };

  // Opciones para selects
  cuentas: string[] = ['Caja Parroquial', 'Banco Corriente', 'Fondo de Emergencia'];
  conceptos: string[] = [];
  mediosPago: string[] = [];

  // Formularios
  formularioIngreso!: FormGroup;
  formularioEgreso!: FormGroup;

  constructor(
    private cajaService: CajaService,
    private feligresService: FeligresService,
    private authService: AuthService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    this.inicializarFormularios();
  }

  ngOnInit(): void {
    this.cargarDatosIniciales();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.paginatorIngresos) {
        this.paginatorIngresos.pageSize = this.pageSizeIngresos;
        this.paginatorIngresos.length = this.totalIngresos;
        this.actualizarDatosPaginadosIngresos();
      }
      if (this.paginatorEgresos) {
        this.paginatorEgresos.pageSize = this.pageSizeEgresos;
        this.paginatorEgresos.length = this.totalEgresos;
        this.actualizarDatosPaginadosEgresos();
      }
      if (this.paginatorBalance) {
        this.paginatorBalance.pageSize = this.pageSizeBalance;
        this.paginatorBalance.length = this.totalMovimientos;
        this.actualizarDatosPaginadosBalance();
      }
    }, 0);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private inicializarFormularios(): void {
    this.formularioIngreso = this.fb.group({
      monto: ['', [Validators.required, Validators.min(0.01)]],
      cuenta: ['Caja Parroquial', [Validators.required]],
      medio_pago: ['', [Validators.required]],
      concepto: ['', [Validators.required]],
      referencia: [''],
      descripcion: [''],
      id_feligres: ['']
    });

    this.formularioEgreso = this.fb.group({
      monto: ['', [Validators.required, Validators.min(0.01)]],
      cuenta: ['Caja Parroquial', [Validators.required]],
      medio_pago: ['', [Validators.required]],
      concepto: ['', [Validators.required]],
      referencia: [''],
      descripcion: [''],
      id_feligres: ['']
    });
  }

  private cargarDatosIniciales(): void {
    this.cargarBalanceGlobal();
    this.cargarBalancePorCuenta();
    this.cargarTodosLosMovimientos();
    this.cargarFeligreses();
    this.cargarOpcionesSelects();
  }

  private cargarTodosLosMovimientos(): void {
    this.cajaService.obtenerMovimientos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.ok) {
            this.todosLosMovimientos = response.datos.datos || [];
            this.aplicarFiltrosYActualizar();
            // Asegurar que los paginadores se actualicen después de cargar los datos
            setTimeout(() => {
              this.actualizarPaginadores();
            }, 100);
          }
        },
        error: (error) => {
          console.error('Error al cargar movimientos:', error);
          this.mostrarError('Error al cargar los movimientos');
        }
      });
  }

  private actualizarPaginadores(): void {
    if (this.paginatorIngresos) {
      this.paginatorIngresos.length = this.totalIngresos;
      this.actualizarDatosPaginadosIngresos();
    }
    if (this.paginatorEgresos) {
      this.paginatorEgresos.length = this.totalEgresos;
      this.actualizarDatosPaginadosEgresos();
    }
    if (this.paginatorBalance) {
      this.paginatorBalance.length = this.totalMovimientos;
      this.actualizarDatosPaginadosBalance();
    }
  }

  private cargarBalanceGlobal(): void {
    this.cajaService.obtenerBalanceGlobal()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.ok) {
            this.balanceGlobal = response.datos;
          }
        },
        error: (error) => {
          console.error('Error al cargar balance global:', error);
          this.mostrarError('Error al cargar el balance global');
        }
      });
  }

  private cargarBalancePorCuenta(): void {
    this.cajaService.obtenerBalancePorCuenta()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.ok) {
            this.balancesPorCuenta = response.datos;
          }
        },
        error: (error) => {
          console.error('Error al cargar balance por cuenta:', error);
          this.mostrarError('Error al cargar el balance por cuenta');
        }
      });
  }

  // Método para aplicar filtros localmente y actualizar las listas
  aplicarFiltrosYActualizar(): void {
    // Filtrar movimientos recientes (todos)
    this.movimientosRecientes = this.aplicarFiltrosLocales(this.todosLosMovimientos, this.filtrosBalance);
    this.totalMovimientos = this.movimientosRecientes.length;
    
    // Filtrar ingresos
    const ingresosFiltrados = this.todosLosMovimientos.filter(m => m.naturaleza === 'ingreso');
    this.ingresos = this.aplicarFiltrosLocales(ingresosFiltrados, this.filtrosIngresos);
    this.totalIngresos = this.ingresos.length;
    
    // Filtrar egresos
    const egresosFiltrados = this.todosLosMovimientos.filter(m => m.naturaleza === 'egreso');
    this.egresos = this.aplicarFiltrosLocales(egresosFiltrados, this.filtrosEgresos);
    this.totalEgresos = this.egresos.length;
    
    // Actualizar paginadores y datos paginados
    setTimeout(() => {
      this.actualizarPaginadores();
    }, 0);
  }

  // Método genérico para aplicar filtros locales
  aplicarFiltrosLocales(movimientos: MovimientoCaja[], filtros: any): MovimientoCaja[] {
    let resultado = [...movimientos];

    // Filtro por concepto
    if (filtros.concepto && filtros.concepto.trim() !== '') {
      const concepto = filtros.concepto.toLowerCase().trim();
      resultado = resultado.filter(m => 
        m.concepto && m.concepto.toLowerCase().includes(concepto)
      );
    }

    // Filtro por cuenta
    if (filtros.cuenta && filtros.cuenta !== '') {
      resultado = resultado.filter(m => m.cuenta === filtros.cuenta);
    }

    // Filtro por medio de pago
    if (filtros.medio_pago && filtros.medio_pago !== '') {
      resultado = resultado.filter(m => m.medio_pago === filtros.medio_pago);
    }

    // Filtro por fecha desde
    if (filtros.fecha_desde) {
      const fechaDesde = new Date(filtros.fecha_desde);
      fechaDesde.setHours(0, 0, 0, 0); // Inicio del día
      resultado = resultado.filter(m => {
        if (!m.fecha_hora) return false;
        const fechaMovimiento = new Date(m.fecha_hora);
        fechaMovimiento.setHours(0, 0, 0, 0);
        return fechaMovimiento >= fechaDesde;
      });
    }

    // Filtro por fecha hasta
    if (filtros.fecha_hasta) {
      const fechaHasta = new Date(filtros.fecha_hasta);
      fechaHasta.setHours(23, 59, 59, 999); // Fin del día
      resultado = resultado.filter(m => {
        if (!m.fecha_hora) return false;
        const fechaMovimiento = new Date(m.fecha_hora);
        return fechaMovimiento <= fechaHasta;
      });
    }

    // Filtro por naturaleza
    if (filtros.naturaleza && filtros.naturaleza !== '') {
      resultado = resultado.filter(m => m.naturaleza === filtros.naturaleza);
    }

    // Filtro por feligrés (búsqueda por nombre)
    if (filtros.feligres && filtros.feligres.trim() !== '') {
      const feligresBusqueda = filtros.feligres.toLowerCase().trim();
      resultado = resultado.filter(m => 
        m.feligres_nombre && m.feligres_nombre.toLowerCase().includes(feligresBusqueda)
      );
    }

    // Filtro por ID de feligrés
    if (filtros.id_feligres && filtros.id_feligres !== '') {
      const idFeligres = typeof filtros.id_feligres === 'string' 
        ? parseInt(filtros.id_feligres) 
        : filtros.id_feligres;
      if (!isNaN(idFeligres)) {
        resultado = resultado.filter(m => m.id_feligres === idFeligres);
      }
    }

    return resultado;
  }

  // Métodos para actualizar datos paginados
  actualizarDatosPaginadosIngresos(): void {
    if (!this.paginatorIngresos) {
      this.ingresosPaginados = this.ingresos.slice(0, this.pageSizeIngresos);
      return;
    }
    // Asegurar que el pageIndex no sea mayor que el número de páginas
    const maxPageIndex = Math.max(0, Math.ceil(this.totalIngresos / this.paginatorIngresos.pageSize) - 1);
    if (this.paginatorIngresos.pageIndex > maxPageIndex) {
      this.paginatorIngresos.pageIndex = 0;
    }
    const startIndex = this.paginatorIngresos.pageIndex * this.paginatorIngresos.pageSize;
    const endIndex = startIndex + this.paginatorIngresos.pageSize;
    this.ingresosPaginados = this.ingresos.slice(startIndex, endIndex);
          }

  actualizarDatosPaginadosEgresos(): void {
    if (!this.paginatorEgresos) {
      this.egresosPaginados = this.egresos.slice(0, this.pageSizeEgresos);
      return;
    }
    // Asegurar que el pageIndex no sea mayor que el número de páginas
    const maxPageIndex = Math.max(0, Math.ceil(this.totalEgresos / this.paginatorEgresos.pageSize) - 1);
    if (this.paginatorEgresos.pageIndex > maxPageIndex) {
      this.paginatorEgresos.pageIndex = 0;
    }
    const startIndex = this.paginatorEgresos.pageIndex * this.paginatorEgresos.pageSize;
    const endIndex = startIndex + this.paginatorEgresos.pageSize;
    this.egresosPaginados = this.egresos.slice(startIndex, endIndex);
        }

  actualizarDatosPaginadosBalance(): void {
    if (!this.paginatorBalance) {
      this.movimientosRecientesPaginados = this.movimientosRecientes.slice(0, this.pageSizeBalance);
      return;
    }
    // Asegurar que el pageIndex no sea mayor que el número de páginas
    const maxPageIndex = Math.max(0, Math.ceil(this.totalMovimientos / this.paginatorBalance.pageSize) - 1);
    if (this.paginatorBalance.pageIndex > maxPageIndex) {
      this.paginatorBalance.pageIndex = 0;
    }
    const startIndex = this.paginatorBalance.pageIndex * this.paginatorBalance.pageSize;
    const endIndex = startIndex + this.paginatorBalance.pageSize;
    this.movimientosRecientesPaginados = this.movimientosRecientes.slice(startIndex, endIndex);
  }

  // Handlers de paginación
  onPageChangeIngresos(event: any): void {
    this.pageSizeIngresos = event.pageSize;
    if (this.paginatorIngresos) {
      this.paginatorIngresos.length = this.totalIngresos;
    }
    this.actualizarDatosPaginadosIngresos();
    this.cdr.detectChanges();
          }

  onPageChangeEgresos(event: any): void {
    this.pageSizeEgresos = event.pageSize;
    if (this.paginatorEgresos) {
      this.paginatorEgresos.length = this.totalEgresos;
    }
    this.actualizarDatosPaginadosEgresos();
    this.cdr.detectChanges();
  }

  onPageChangeBalance(event: any): void {
    this.pageSizeBalance = event.pageSize;
    if (this.paginatorBalance) {
      this.paginatorBalance.length = this.totalMovimientos;
        }
    this.actualizarDatosPaginadosBalance();
    this.cdr.detectChanges();
  }

  private cargarFeligreses(): void {
    // Verificar autenticación
    const token = this.authService.getToken();
    console.log('🔐 Token disponible:', token ? 'Sí' : 'No');
    
    this.feligresService.obtenerFeligreses()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('✅ Respuesta feligreses:', response);
          if (response.ok) {
            this.feligreses = response.datos.datos;
            console.log('📋 Feligreses cargados:', this.feligreses.length);
          }
        },
        error: (error) => {
          console.error('❌ Error al cargar feligreses:', error);
          this.mostrarError('Error al cargar la lista de feligreses');
        }
      });
  }

  private cargarOpcionesSelects(): void {
    // Las cuentas están hardcodeadas arriba
    // Cargar conceptos
    this.cajaService.obtenerConceptos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.ok) {
            this.conceptos = response.datos;
          }
        },
        error: (error) => console.error('Error al cargar conceptos:', error)
      });

    // Cargar medios de pago
    this.cajaService.obtenerMediosPago()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.ok) {
            this.mediosPago = response.datos;
          }
        },
        error: (error) => console.error('Error al cargar medios de pago:', error)
      });
  }

  crearMovimiento(naturaleza: 'ingreso' | 'egreso'): void {
    if (this.cargando) return;

    const formulario = naturaleza === 'ingreso' ? this.formularioIngreso : this.formularioEgreso;
    
    if (formulario.invalid) {
      this.marcarCamposComoTocados(formulario);
      this.mostrarError('Por favor, complete todos los campos requeridos');
      return;
    }

    this.cargando = true;

    const datosMovimiento: CrearMovimientoRequest = {
      naturaleza,
      monto: formulario.value.monto,
      cuenta: formulario.value.cuenta,
      medio_pago: formulario.value.medio_pago,
      concepto: formulario.value.concepto,
      referencia: formulario.value.referencia || undefined,
      descripcion: formulario.value.descripcion || undefined,
      id_feligres: formulario.value.id_feligres ? parseInt(formulario.value.id_feligres) : undefined
    };

    this.cajaService.crearMovimiento(datosMovimiento)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.ok) {
            this.mostrarExito(`${naturaleza === 'ingreso' ? 'Ingreso' : 'Egreso'} registrado correctamente`);
            formulario.reset();
            formulario.patchValue({
              cuenta: 'Caja Parroquial'
            });
            this.cargarDatosIniciales(); // Recargar todos los datos
          } else {
            this.mostrarError(response.mensaje || 'Error al registrar el movimiento');
          }
        },
        error: (error) => {
          console.error('Error al crear movimiento:', error);
          this.mostrarError('Error al registrar el movimiento');
        },
        complete: () => {
          this.cargando = false;
        }
      });
  }

  onTabChange(index: number): void {
    this.tabSeleccionado = index;
    
    // Los datos ya están cargados, solo actualizar paginación
    if (index === 2) { // Balance
        this.cargarBalancePorCuenta();
    }
    // Los datos ya están disponibles desde todosLosMovimientos
  }

  private marcarCamposComoTocados(formulario: FormGroup): void {
    Object.keys(formulario.controls).forEach(key => {
      const control = formulario.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

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

  // Métodos de utilidad para el template
  formatearMonto(monto: number): string {
    return this.cajaService.formatearMonto(monto);
  }

  formatearFecha(fecha: string): string {
    return this.cajaService.formatearFecha(fecha);
  }

  obtenerColorNaturaleza(naturaleza: 'ingreso' | 'egreso'): string {
    return this.cajaService.obtenerColorNaturaleza(naturaleza);
  }

  obtenerIconoNaturaleza(naturaleza: 'ingreso' | 'egreso'): string {
    return this.cajaService.obtenerIconoNaturaleza(naturaleza);
  }

  obtenerNombreCompletoFeligres(feligres: Feligres): string {
    const nombres = [feligres.primer_nombre, feligres.segundo_nombre, feligres.otros_nombres].filter(Boolean).join(' ');
    const apellidos = [feligres.primer_apellido, feligres.segundo_apellido].filter(Boolean).join(' ');
    return `${nombres} ${apellidos}`.trim();
  }

  // Métodos de búsqueda y filtrado
  buscarIngresos(): void {
    if (this.paginatorIngresos) {
      this.paginatorIngresos.pageIndex = 0;
    }
    this.aplicarFiltrosYActualizar();
  }

  buscarEgresos(): void {
    if (this.paginatorEgresos) {
      this.paginatorEgresos.pageIndex = 0;
    }
    this.aplicarFiltrosYActualizar();
  }

  buscarMovimientosBalance(): void {
    if (this.paginatorBalance) {
      this.paginatorBalance.pageIndex = 0;
    }
    this.aplicarFiltrosYActualizar();
  }

  limpiarFiltrosIngresos(): void {
    this.filtrosIngresos = {
      concepto: '',
      cuenta: '',
      medio_pago: '',
      fecha_desde: '',
      fecha_hasta: '',
      feligres: ''
    };
    if (this.paginatorIngresos) {
      this.paginatorIngresos.pageIndex = 0;
    }
    this.aplicarFiltrosYActualizar();
  }

  limpiarFiltrosEgresos(): void {
    this.filtrosEgresos = {
      concepto: '',
      cuenta: '',
      medio_pago: '',
      fecha_desde: '',
      fecha_hasta: '',
      feligres: ''
    };
    if (this.paginatorEgresos) {
      this.paginatorEgresos.pageIndex = 0;
    }
    this.aplicarFiltrosYActualizar();
  }

  limpiarFiltrosBalance(): void {
    this.filtrosBalance = {
      concepto: '',
      cuenta: '',
      naturaleza: '',
      fecha_desde: '',
      fecha_hasta: '',
      feligres: ''
    };
    if (this.paginatorBalance) {
      this.paginatorBalance.pageIndex = 0;
    }
    this.aplicarFiltrosYActualizar();
  }

  // Métodos de exportación
  exportarIngresosExcel(): void {
    const datos = this.ingresos.map(mov => ({
      'Fecha': this.formatearFecha(mov.fecha_hora),
      'Concepto': mov.concepto,
      'Monto': mov.monto,
      'Cuenta': mov.cuenta,
      'Medio de Pago': mov.medio_pago,
      'Referencia': mov.referencia || '',
      'Descripción': mov.descripcion || '',
      'Feligrés': mov.feligres_nombre || '',
      'Usuario': `${mov.usuario_nombre} ${mov.usuario_apellido}`
    }));

    this.exportarAExcel(datos, 'Ingresos_Caja_Parroquial');
  }

  exportarEgresosExcel(): void {
    const datos = this.egresos.map(mov => ({
      'Fecha': this.formatearFecha(mov.fecha_hora),
      'Concepto': mov.concepto,
      'Monto': mov.monto,
      'Cuenta': mov.cuenta,
      'Medio de Pago': mov.medio_pago,
      'Referencia': mov.referencia || '',
      'Descripción': mov.descripcion || '',
      'Feligrés': mov.feligres_nombre || '',
      'Usuario': `${mov.usuario_nombre} ${mov.usuario_apellido}`
    }));

    this.exportarAExcel(datos, 'Egresos_Caja_Parroquial');
  }

  exportarBalanceExcel(): void {
    const datos = this.movimientosRecientes.map(mov => ({
      'Fecha': this.formatearFecha(mov.fecha_hora),
      'Tipo': mov.naturaleza.toUpperCase(),
      'Concepto': mov.concepto,
      'Monto': mov.monto,
      'Cuenta': mov.cuenta,
      'Medio de Pago': mov.medio_pago,
      'Referencia': mov.referencia || '',
      'Descripción': mov.descripcion || '',
      'Feligrés': mov.feligres_nombre || '',
      'Usuario': `${mov.usuario_nombre} ${mov.usuario_apellido}`
    }));

    this.exportarAExcel(datos, 'Movimientos_Caja_Parroquial');
  }

  exportarBalanceGlobalExcel(): void {
    const datos = [
      {
        'Cuenta': 'GLOBAL',
        'Total Ingresos': this.balanceGlobal?.total_ingresos || 0,
        'Total Egresos': this.balanceGlobal?.total_egresos || 0,
        'Saldo Actual': this.balanceGlobal?.saldo_actual || 0
      },
      ...this.balancesPorCuenta.map(balance => ({
        'Cuenta': balance.cuenta,
        'Total Ingresos': balance.total_ingresos,
        'Total Egresos': balance.total_egresos,
        'Saldo Actual': balance.saldo_actual
      }))
    ];

    this.exportarAExcel(datos, 'Balance_Caja_Parroquial');
  }

  private exportarAExcel(datos: any[], nombreArchivo: string): void {
    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Datos');
    
    // Ajustar ancho de columnas
    const colWidths = Object.keys(datos[0] || {}).map(key => ({ wch: 15 }));
    ws['!cols'] = colWidths;
    
    XLSX.writeFile(wb, `${nombreArchivo}_${new Date().toISOString().split('T')[0]}.xlsx`);
    this.mostrarExito('Archivo Excel exportado correctamente');
  }
}