import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActividadReligiosaService } from '../../services/actividad-religiosa.service';
import {
  ActividadReligiosa,
  TipoActividad,
  FiltrosActividad,
  EstadisticasActividades,
  FormularioActividad,
  FormularioTipoActividad
} from '../../models/actividad-religiosa.model';

@Component({
  selector: 'app-actividades-religiosas',
  templateUrl: './actividades-religiosas.component.html',
  styleUrls: ['./actividades-religiosas.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ]
})
export class ActividadesReligiosasComponent implements OnInit {
  // Propiedades para el template
  Math = Math;
  
  // Estados de carga
  cargandoActividades = false;
  cargandoEstadisticas = false;
  cargandoTipos = false;
  guardando = false;

  // Datos
  actividades: ActividadReligiosa[] = [];
  tiposActividad: TipoActividad[] = [];
  estadisticas: EstadisticasActividades | null = null;
  actividadSeleccionada: ActividadReligiosa | null = null;

  // Formularios
  formularioActividad!: FormGroup;
  formularioTipo!: FormGroup;
  formularioFiltros!: FormGroup;

  // Paginación
  paginaActual = 1;
  limitePorPagina = 10;
  totalActividades = 0;
  totalPaginas = 0;

  // Modales
  mostrarModalActividad = false;
  mostrarModalTipo = false;
  modoEdicion = false;

  // Filtros
  filtros: FiltrosActividad = {
    pagina: 1,
    limite: 10,
    busqueda: '',
    fecha_desde: '',
    fecha_hasta: '',
    id_tipo_actividad: undefined,
    activo: true
  };

  constructor(
    private actividadService: ActividadReligiosaService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.inicializarFormularios();
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  // ========================================
  // INICIALIZACIÓN
  // ========================================

  private inicializarFormularios(): void {
    this.formularioActividad = this.fb.group({
      id_tipo_actividad: [null, [Validators.required]],
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
      descripcion: ['', [Validators.maxLength(500)]],
      fecha_actividad: ['', [Validators.required]],
      hora_actividad: [''],
      lugar: ['', [Validators.maxLength(150)]]
    });

    this.formularioTipo = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      descripcion: ['', [Validators.maxLength(255)]]
    });

    this.formularioFiltros = this.fb.group({
      busqueda: [''],
      fecha_desde: [''],
      fecha_hasta: [''],
      id_tipo_actividad: ['']
    });
  }

  // ========================================
  // CARGA DE DATOS
  // ========================================

  cargarDatos(): void {
    this.cargarActividades();
    this.cargarTiposActividad();
    this.cargarEstadisticas();
  }

  cargarActividades(): void {
    this.cargandoActividades = true;
    
    this.actividadService.obtenerActividades(this.filtros).subscribe({
      next: (response) => {
        if (response.ok) {
          this.actividades = response.datos.actividades;
          this.totalActividades = response.datos.total;
          this.totalPaginas = response.datos.totalPaginas;
          this.paginaActual = response.datos.pagina;
        } else {
          this.mostrarError('Error al cargar actividades');
        }
        this.cargandoActividades = false;
      },
      error: (error) => {
        console.error('Error al cargar actividades:', error);
        this.mostrarError('Error al cargar actividades');
        this.cargandoActividades = false;
      }
    });
  }

  cargarTiposActividad(): void {
    this.cargandoTipos = true;
    
    this.actividadService.obtenerTiposActividad().subscribe({
      next: (response) => {
        if (response.ok) {
          this.tiposActividad = response.datos;
        } else {
          this.mostrarError('Error al cargar tipos de actividad');
        }
        this.cargandoTipos = false;
      },
      error: (error) => {
        console.error('Error al cargar tipos de actividad:', error);
        this.mostrarError('Error al cargar tipos de actividad');
        this.cargandoTipos = false;
      }
    });
  }

  cargarEstadisticas(): void {
    this.cargandoEstadisticas = true;
    
    this.actividadService.obtenerEstadisticas().subscribe({
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

  // ========================================
  // FILTROS Y BÚSQUEDA
  // ========================================

  aplicarFiltros(): void {
    const filtrosForm = this.formularioFiltros.value;
    
    this.filtros = {
      ...this.filtros,
      busqueda: filtrosForm.busqueda || '',
      fecha_desde: filtrosForm.fecha_desde || '',
      fecha_hasta: filtrosForm.fecha_hasta || '',
      id_tipo_actividad: filtrosForm.id_tipo_actividad || undefined,
      pagina: 1
    };
    
    this.paginaActual = 1;
    this.cargarActividades();
  }

  limpiarFiltros(): void {
    this.formularioFiltros.reset();
    this.filtros = {
      pagina: 1,
      limite: 10,
      busqueda: '',
      fecha_desde: '',
      fecha_hasta: '',
      id_tipo_actividad: undefined,
      activo: true
    };
    this.paginaActual = 1;
    this.cargarActividades();
  }

  // ========================================
  // PAGINACIÓN
  // ========================================

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.filtros.pagina = pagina;
      this.paginaActual = pagina;
      this.cargarActividades();
    }
  }

  // ========================================
  // ACTIVIDADES
  // ========================================

  abrirModalActividad(actividad?: ActividadReligiosa): void {
    this.modoEdicion = !!actividad;
    this.actividadSeleccionada = actividad || null;
    
    if (actividad) {
      this.formularioActividad.patchValue({
        id_tipo_actividad: actividad.id_tipo_actividad,
        nombre: actividad.nombre,
        descripcion: actividad.descripcion || '',
        fecha_actividad: actividad.fecha_actividad,
        hora_actividad: actividad.hora_actividad || '',
        lugar: actividad.lugar || ''
      });
    } else {
      this.formularioActividad.reset();
    }
    
    this.mostrarModalActividad = true;
  }

  cerrarModalActividad(): void {
    this.mostrarModalActividad = false;
    this.actividadSeleccionada = null;
    this.formularioActividad.reset();
  }

  guardarActividad(): void {
    if (this.formularioActividad.valid) {
      this.guardando = true;
      const datos = this.formularioActividad.value;
      
      const operacion = this.modoEdicion
        ? this.actividadService.actualizarActividad(this.actividadSeleccionada!.id_actividad, datos)
        : this.actividadService.crearActividad(datos);
      
      operacion.subscribe({
        next: (response) => {
          if (response.ok) {
            this.mostrarExito(
              this.modoEdicion 
                ? 'Actividad actualizada correctamente' 
                : 'Actividad creada correctamente'
            );
            this.cerrarModalActividad();
            this.cargarActividades();
            this.cargarEstadisticas();
          } else {
            this.mostrarError('Error al guardar actividad');
          }
          this.guardando = false;
        },
        error: (error) => {
          console.error('Error al guardar actividad:', error);
          this.mostrarError('Error al guardar actividad');
          this.guardando = false;
        }
      });
    } else {
      this.marcarCamposComoTocados();
    }
  }

  eliminarActividad(actividad: ActividadReligiosa): void {
    if (confirm(`¿Estás seguro de que deseas eliminar la actividad "${actividad.nombre}"?`)) {
      this.actividadService.eliminarActividad(actividad.id_actividad).subscribe({
        next: (response) => {
          if (response.ok) {
            this.mostrarExito('Actividad eliminada correctamente');
            this.cargarActividades();
            this.cargarEstadisticas();
          } else {
            this.mostrarError('Error al eliminar actividad');
          }
        },
        error: (error) => {
          console.error('Error al eliminar actividad:', error);
          this.mostrarError('Error al eliminar actividad');
        }
      });
    }
  }

  // ========================================
  // TIPOS DE ACTIVIDAD
  // ========================================

  abrirModalTipo(tipo?: TipoActividad): void {
    if (tipo) {
      this.formularioTipo.patchValue({
        nombre: tipo.nombre,
        descripcion: tipo.descripcion || ''
      });
    } else {
      this.formularioTipo.reset();
    }
    
    this.mostrarModalTipo = true;
  }

  cerrarModalTipo(): void {
    this.mostrarModalTipo = false;
    this.formularioTipo.reset();
  }

  guardarTipo(): void {
    if (this.formularioTipo.valid) {
      this.guardando = true;
      const datos = this.formularioTipo.value;
      
      this.actividadService.crearTipoActividad(datos).subscribe({
        next: (response) => {
          if (response.ok) {
            this.mostrarExito('Tipo de actividad creado correctamente');
            this.cerrarModalTipo();
            this.cargarTiposActividad();
          } else {
            this.mostrarError('Error al crear tipo de actividad');
          }
          this.guardando = false;
        },
        error: (error) => {
          console.error('Error al crear tipo de actividad:', error);
          this.mostrarError('Error al crear tipo de actividad');
          this.guardando = false;
        }
      });
    } else {
      this.marcarCamposComoTocados();
    }
  }

  // ========================================
  // MÉTODOS UTILITARIOS
  // ========================================

  private marcarCamposComoTocados(): void {
    Object.keys(this.formularioActividad.controls).forEach(key => {
      this.formularioActividad.get(key)?.markAsTouched();
    });
  }

  obtenerColorTipoActividad(tipo: string): string {
    return this.actividadService.obtenerColorTipoActividad(tipo);
  }

  formatearFecha(fecha: string): string {
    return this.actividadService.formatearFecha(fecha);
  }

  formatearFechaHora(fecha: string, hora?: string): string {
    return this.actividadService.formatearFechaHora(fecha, hora);
  }

  esActividadFutura(fecha: string, hora?: string): boolean {
    return this.actividadService.esActividadFutura(fecha, hora);
  }

  // ========================================
  // NOTIFICACIONES
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
}
