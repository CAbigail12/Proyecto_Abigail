import { Component, OnInit, AfterViewInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
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
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
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
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatTableModule,
    MatSortModule
  ]
})
export class ActividadesReligiosasComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Propiedades para el template
  Math = Math;
  
  // Estados de carga
  cargandoActividades = false;
  cargandoEstadisticas = false;
  cargandoTipos = false;
  guardando = false;

  // Datos
  dataSource = new MatTableDataSource<ActividadReligiosa>();
  actividades: ActividadReligiosa[] = [];
  actividadesPaginadas: ActividadReligiosa[] = [];
  todosLosDatos: ActividadReligiosa[] = [];
  tiposActividad: TipoActividad[] = [];
  estadisticas: EstadisticasActividades | null = null;
  actividadSeleccionada: ActividadReligiosa | null = null;

  // Formularios
  formularioActividad!: FormGroup;
  formularioTipo!: FormGroup;
  formularioFiltros!: FormGroup;

  // Paginación
  pageSize = 10;
  totalActividades = 0;

  // Modales
  mostrarModalActividad = false;
  mostrarModalTipo = false;
  modoEdicion = false;

  // Filtros (id_tipo_actividad puede ser number, string o undefined cuando viene del formulario)
  filtros: FiltrosActividad & { id_tipo_actividad?: number | string | undefined } = {
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
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {
    this.inicializarFormularios();
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    setTimeout(() => {
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
        this.paginator.pageSize = this.pageSize;
        this.paginator.length = this.totalActividades;
        this.actualizarDatosPaginados();
      }
    }, 0);
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
    
    // Obtener TODAS las actividades sin filtros del backend
    this.actividadService.obtenerActividades().subscribe({
      next: (response) => {
        if (response.ok) {
          // Obtener todos los datos
          let todosLosDatos: ActividadReligiosa[] = [];
          if (response.datos.actividades && Array.isArray(response.datos.actividades)) {
            todosLosDatos = response.datos.actividades;
          } else if (Array.isArray(response.datos)) {
            todosLosDatos = response.datos;
          }
          
          // Guardar todos los datos originales
          this.todosLosDatos = todosLosDatos;
          
          // Aplicar filtros localmente en el frontend
          let datosFiltrados = this.aplicarFiltrosLocales(todosLosDatos);
          
          // Asignar los datos filtrados al dataSource
          this.dataSource.data = datosFiltrados;
          this.actividades = datosFiltrados;
          this.totalActividades = datosFiltrados.length;
          
          // Inicializar datos paginados directamente
          this.actividadesPaginadas = datosFiltrados.slice(0, this.pageSize);
          
          // Asegurar que el paginator esté asignado después de cargar los datos
          setTimeout(() => {
            if (this.paginator && !this.dataSource.paginator) {
              this.dataSource.paginator = this.paginator;
            }
            if (this.paginator) {
              this.paginator.pageSize = this.pageSize;
              this.paginator.length = this.totalActividades;
            }
            this.actualizarDatosPaginados();
          }, 0);
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

  // Método para aplicar filtros localmente en el frontend
  aplicarFiltrosLocales(datos: ActividadReligiosa[]): ActividadReligiosa[] {
    let datosFiltrados = [...datos];

    // Filtro de búsqueda (nombre, descripción)
    if (this.filtros.busqueda && this.filtros.busqueda.trim() !== '') {
      const busqueda = this.filtros.busqueda.toLowerCase().trim();
      datosFiltrados = datosFiltrados.filter(actividad => {
        const nombre = (actividad.nombre || '').toLowerCase();
        const descripcion = (actividad.descripcion || '').toLowerCase();
        const tipoNombre = (actividad.tipo_actividad_nombre || '').toLowerCase();
        return nombre.includes(busqueda) || descripcion.includes(busqueda) || tipoNombre.includes(busqueda);
      });
    }

    // Filtro por tipo de actividad
    const idTipoActividadRaw = this.filtros.id_tipo_actividad;
    if (idTipoActividadRaw !== undefined && idTipoActividadRaw !== null) {
      let idTipo: number | null = null;
      
      if (typeof idTipoActividadRaw === 'string') {
        const valorString = (idTipoActividadRaw as string).trim();
        if (valorString !== '') {
          idTipo = parseInt(valorString);
        }
      } else if (typeof idTipoActividadRaw === 'number') {
        idTipo = idTipoActividadRaw;
      }
      
      if (idTipo !== null && !isNaN(idTipo)) {
        datosFiltrados = datosFiltrados.filter(actividad => actividad.id_tipo_actividad === idTipo);
      }
    }

    // Filtro por fecha desde
    if (this.filtros.fecha_desde && this.filtros.fecha_desde.trim() !== '') {
      const fechaDesde = new Date(this.filtros.fecha_desde);
      datosFiltrados = datosFiltrados.filter(actividad => {
        const fechaActividad = new Date(actividad.fecha_actividad);
        return fechaActividad >= fechaDesde;
      });
    }

    // Filtro por fecha hasta
    if (this.filtros.fecha_hasta && this.filtros.fecha_hasta.trim() !== '') {
      const fechaHasta = new Date(this.filtros.fecha_hasta);
      fechaHasta.setHours(23, 59, 59, 999);
      datosFiltrados = datosFiltrados.filter(actividad => {
        const fechaActividad = new Date(actividad.fecha_actividad);
        return fechaActividad <= fechaHasta;
      });
    }

    // Filtro por estado activo
    if (this.filtros.activo !== undefined && this.filtros.activo !== null) {
      datosFiltrados = datosFiltrados.filter(actividad => actividad.activo === this.filtros.activo);
    }

    return datosFiltrados;
  }

  actualizarDatosPaginados(): void {
    if (!this.dataSource.paginator) {
      this.actividadesPaginadas = this.actividades.slice(0, this.pageSize);
      return;
    }
    // Asegurar que el pageIndex no sea mayor que el número de páginas
    const maxPageIndex = Math.max(0, Math.ceil(this.totalActividades / this.dataSource.paginator.pageSize) - 1);
    if (this.dataSource.paginator.pageIndex > maxPageIndex) {
      this.dataSource.paginator.pageIndex = 0;
    }
    const startIndex = this.dataSource.paginator.pageIndex * this.dataSource.paginator.pageSize;
    const endIndex = startIndex + this.dataSource.paginator.pageSize;
    this.actividadesPaginadas = this.actividades.slice(startIndex, endIndex);
  }

  onPageChange(event: any): void {
    this.pageSize = event.pageSize;
    if (this.paginator) {
      this.paginator.length = this.totalActividades;
    }
    this.actualizarDatosPaginados();
    this.cdr.detectChanges();
  }

  aplicarFiltros(): void {
    // Obtener valores del formulario
    const filtrosForm = this.formularioFiltros.value;
    
    // Actualizar los filtros
    this.filtros = {
      busqueda: filtrosForm.busqueda || '',
      fecha_desde: filtrosForm.fecha_desde || '',
      fecha_hasta: filtrosForm.fecha_hasta || '',
      id_tipo_actividad: filtrosForm.id_tipo_actividad || undefined,
      activo: true
    };
    
    // Resetear a la primera página cuando se aplican filtros
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    
    // Si ya tenemos todos los datos cargados, aplicar filtros localmente
    if (this.todosLosDatos.length > 0) {
      // Aplicar filtros sobre todos los datos originales
      let datosFiltrados = this.aplicarFiltrosLocales(this.todosLosDatos);
      
      // Actualizar el dataSource con los datos filtrados
      this.dataSource.data = datosFiltrados;
      this.actividades = datosFiltrados;
      this.totalActividades = datosFiltrados.length;
      
      // Inicializar datos paginados directamente
      this.actividadesPaginadas = datosFiltrados.slice(0, this.pageSize);
      
      // Actualizar paginador y datos paginados
      setTimeout(() => {
        if (this.paginator) {
          this.paginator.length = this.totalActividades;
        }
        this.actualizarDatosPaginados();
      }, 0);
    } else {
      // Si no hay datos cargados, cargar desde el backend
      this.cargarActividades();
    }
  }

  limpiarFiltros(): void {
    this.formularioFiltros.reset();
    this.filtros = {
      busqueda: '',
      fecha_desde: '',
      fecha_hasta: '',
      id_tipo_actividad: undefined,
      activo: true
    };
    
    // Resetear a la primera página
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    
    // Si ya tenemos todos los datos cargados, aplicar filtros localmente (vacíos)
    if (this.todosLosDatos.length > 0) {
      let datosFiltrados = this.aplicarFiltrosLocales(this.todosLosDatos);
      this.dataSource.data = datosFiltrados;
      this.actividades = datosFiltrados;
      this.totalActividades = datosFiltrados.length;
      
      // Inicializar datos paginados directamente
      this.actividadesPaginadas = datosFiltrados.slice(0, this.pageSize);
      
      setTimeout(() => {
        if (this.paginator) {
          this.paginator.length = this.totalActividades;
        }
        this.actualizarDatosPaginados();
      }, 0);
    } else {
      // Si no hay datos cargados, cargar desde el backend
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

  trackByActividadId(index: number, actividad: ActividadReligiosa): number {
    return actividad.id_actividad;
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
