import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
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
    MatNativeDateModule
  ],
  templateUrl: './caja.component.html',
  styleUrls: ['./caja.component.css']
})
export class CajaComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Estados del componente
  cargando = false;
  tabSeleccionado = 0;

  // Datos
  balanceGlobal: BalanceGlobal | null = null;
  balancesPorCuenta: BalancePorCuenta[] = [];
  movimientosRecientes: MovimientoCaja[] = [];
  ingresos: MovimientoCaja[] = [];
  egresos: MovimientoCaja[] = [];
  feligreses: Feligres[] = [];

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
    private snackBar: MatSnackBar
  ) {
    this.inicializarFormularios();
  }

  ngOnInit(): void {
    this.cargarDatosIniciales();
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
    this.cargarMovimientosRecientes();
    this.cargarIngresos();
    this.cargarEgresos();
    this.cargarFeligreses();
    this.cargarOpcionesSelects();
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

  private cargarMovimientosRecientes(): void {
    this.cajaService.obtenerMovimientos({ limite: 10 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.ok) {
            this.movimientosRecientes = response.datos.datos;
          }
        },
        error: (error) => {
          console.error('Error al cargar movimientos recientes:', error);
          this.mostrarError('Error al cargar los movimientos recientes');
        }
      });
  }

  private cargarIngresos(): void {
    this.cajaService.obtenerMovimientos({ naturaleza: 'ingreso', limite: 10 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.ok) {
            this.ingresos = response.datos.datos;
          }
        },
        error: (error) => {
          console.error('Error al cargar ingresos:', error);
          this.mostrarError('Error al cargar los ingresos');
        }
      });
  }

  private cargarEgresos(): void {
    this.cajaService.obtenerMovimientos({ naturaleza: 'egreso', limite: 10 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.ok) {
            this.egresos = response.datos.datos;
          }
        },
        error: (error) => {
          console.error('Error al cargar egresos:', error);
          this.mostrarError('Error al cargar los egresos');
        }
      });
  }

  private cargarFeligreses(): void {
    // Verificar autenticación
    const token = this.authService.getToken();
    console.log('🔐 Token disponible:', token ? 'Sí' : 'No');
    
    this.feligresService.obtenerFeligreses({ activo: 'true', limite: 100 })
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
    
    // Recargar datos específicos según el tab
    switch (index) {
      case 0: // Ingresos
        this.cargarIngresos();
        break;
      case 1: // Egresos
        this.cargarEgresos();
        break;
      case 2: // Balance
        this.cargarBalancePorCuenta();
        this.cargarMovimientosRecientes();
        break;
    }
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
    const filtros: any = {};
    if (this.filtrosIngresos.concepto) filtros.concepto = this.filtrosIngresos.concepto;
    if (this.filtrosIngresos.cuenta) filtros.cuenta = this.filtrosIngresos.cuenta;
    if (this.filtrosIngresos.medio_pago) filtros.medio_pago = this.filtrosIngresos.medio_pago;
    if (this.filtrosIngresos.fecha_desde) filtros.fecha_desde = this.filtrosIngresos.fecha_desde;
    if (this.filtrosIngresos.fecha_hasta) filtros.fecha_hasta = this.filtrosIngresos.fecha_hasta;
    if (this.filtrosIngresos.feligres) filtros.id_feligres = this.filtrosIngresos.feligres;
    
    filtros.naturaleza = 'ingreso';
    filtros.limite = 100;

    this.cajaService.obtenerMovimientos(filtros)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.ok) {
            this.ingresos = response.datos.datos;
          }
        },
        error: (error) => {
          console.error('Error al buscar ingresos:', error);
          this.mostrarError('Error al buscar ingresos');
        }
      });
  }

  buscarEgresos(): void {
    const filtros: any = {};
    if (this.filtrosEgresos.concepto) filtros.concepto = this.filtrosEgresos.concepto;
    if (this.filtrosEgresos.cuenta) filtros.cuenta = this.filtrosEgresos.cuenta;
    if (this.filtrosEgresos.medio_pago) filtros.medio_pago = this.filtrosEgresos.medio_pago;
    if (this.filtrosEgresos.fecha_desde) filtros.fecha_desde = this.filtrosEgresos.fecha_desde;
    if (this.filtrosEgresos.fecha_hasta) filtros.fecha_hasta = this.filtrosEgresos.fecha_hasta;
    if (this.filtrosEgresos.feligres) filtros.id_feligres = this.filtrosEgresos.feligres;
    
    filtros.naturaleza = 'egreso';
    filtros.limite = 100;

    this.cajaService.obtenerMovimientos(filtros)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.ok) {
            this.egresos = response.datos.datos;
          }
        },
        error: (error) => {
          console.error('Error al buscar egresos:', error);
          this.mostrarError('Error al buscar egresos');
        }
      });
  }

  buscarMovimientosBalance(): void {
    const filtros: any = {};
    if (this.filtrosBalance.concepto) filtros.concepto = this.filtrosBalance.concepto;
    if (this.filtrosBalance.cuenta) filtros.cuenta = this.filtrosBalance.cuenta;
    if (this.filtrosBalance.naturaleza) filtros.naturaleza = this.filtrosBalance.naturaleza;
    if (this.filtrosBalance.fecha_desde) filtros.fecha_desde = this.filtrosBalance.fecha_desde;
    if (this.filtrosBalance.fecha_hasta) filtros.fecha_hasta = this.filtrosBalance.fecha_hasta;
    if (this.filtrosBalance.feligres) filtros.id_feligres = this.filtrosBalance.feligres;
    
    filtros.limite = 100;

    this.cajaService.obtenerMovimientos(filtros)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.ok) {
            this.movimientosRecientes = response.datos.datos;
          }
        },
        error: (error) => {
          console.error('Error al buscar movimientos:', error);
          this.mostrarError('Error al buscar movimientos');
        }
      });
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
    this.cargarIngresos();
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
    this.cargarEgresos();
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
    this.cargarMovimientosRecientes();
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