import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Observable, map, startWith } from 'rxjs';

import { SacramentoAsignacionService } from '../../services/sacramento-asignacion.service';
import { FeligresService } from '../../services/feligres.service';
import { environment } from '../../../environments/environment';
import { 
  SacramentoAsignacion, 
  SacramentoAsignacionCreate,
  SacramentoAsignacionUpdate,
  SacramentoCatalogo, 
  RolParticipanteCatalogo,
  FiltrosAsignacion,
  FormularioBautizo,
  FormularioConfirmacion,
  FormularioMatrimonio,
  EstadisticasSacramentos
} from '../../models/sacramento-asignacion.model';
import { Feligres } from '../../models/mantenimiento.model';

@Component({
  selector: 'app-sacramentos-asignacion',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatChipsModule,
    MatTabsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatAutocompleteModule,
    MatDialogModule
  ],
  templateUrl: './sacramentos-asignacion.component.html',
  styleUrls: ['./sacramentos-asignacion.component.css']
})
export class SacramentosAsignacionComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Environment para debug
  environment = environment;
  currentTime = new Date().toLocaleString();

  // Estados del componente
  loading = false;
  loadingAsignaciones = false;
  tabSeleccionado = 0;
  modoEdicion = false;
  asignacionEditando: SacramentoAsignacion | null = null;

  // Datos de la tabla
  displayedColumns: string[] = ['id_asignacion', 'sacramento', 'participantes', 'fecha_celebracion', 'pagado', 'acciones'];
  dataSource = new MatTableDataSource<SacramentoAsignacion>();
  
  // Paginación
  totalAsignaciones = 0;
  currentPage = 1;
  pageSize = 10;

  // Filtros
  filtros: FiltrosAsignacion = {
    pagina: 1,
    limite: 10
  };

  // Catálogos
  sacramentos: SacramentoCatalogo[] = [];
  rolesParticipante: RolParticipanteCatalogo[] = [];
  feligreses: Feligres[] = [];
  estadisticas: EstadisticasSacramentos | null = null;

  // Autocomplete para feligreses
  feligresesFiltrados: Observable<Feligres[]>[] = [];
  feligresesFiltradosNovio: Observable<Feligres[]> = new Observable();
  feligresesFiltradosNovia: Observable<Feligres[]> = new Observable();

  // Formularios
  formularioBautizo: FormGroup;
  formularioConfirmacion: FormGroup;
  formularioMatrimonio: FormGroup;

  // Controladores de autocomplete
  controladorFeligresBautizo = this.fb.control('');
  controladorFeligresConfirmacion = this.fb.control('');
  controladorFeligresNovio = this.fb.control('');
  controladorFeligresNovia = this.fb.control('');

  // Feligreses seleccionados
  feligresSeleccionadoBautizo: Feligres | null = null;
  feligresSeleccionadoConfirmacion: Feligres | null = null;
  feligresSeleccionadoNovio: Feligres | null = null;
  feligresSeleccionadoNovia: Feligres | null = null;

  constructor(
    private sacramentoAsignacionService: SacramentoAsignacionService,
    private feligresService: FeligresService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    // Inicializar formularios
    this.formularioBautizo = this.fb.group({
      fecha_celebracion: ['', [Validators.required]],
      pagado: [false],
      comentarios: ['']
    });

    this.formularioConfirmacion = this.fb.group({
      fecha_celebracion: ['', [Validators.required]],
      pagado: [false],
      comentarios: ['']
    });

    this.formularioMatrimonio = this.fb.group({
      fecha_celebracion: ['', [Validators.required]],
      pagado: [false],
      comentarios: ['']
    });
  }

  ngOnInit(): void {
    console.log('🎉 SacramentosAsignacionComponent: ngOnInit ejecutado correctamente');
    console.log('🔧 Environment API URL:', this.environment.apiUrl);
    console.log('⏰ Timestamp:', this.currentTime);
    
    // Cargar datos iniciales
    this.cargarDatosIniciales();
    this.configurarAutocomplete();
  }

  ngAfterViewInit() {
    // NO asignar paginator al dataSource cuando usamos paginación del servidor
    // this.dataSource.paginator = this.paginator; // ❌ REMOVIDO - causa conflictos
    this.dataSource.sort = this.sort;
    
    // Configurar paginator manualmente para paginación del servidor
    if (this.paginator) {
      this.paginator.pageIndex = this.currentPage - 1;
      this.paginator.pageSize = this.pageSize;
      this.paginator.length = this.totalAsignaciones;
    }
  }

  /**
   * Cargar datos iniciales del componente
   */
  cargarDatosIniciales(): void {
    this.loading = true;
    
    // Cargar datos en paralelo
    Promise.all([
      this.cargarSacramentos(),
      this.cargarRolesParticipante(),
      this.cargarFeligreses(),
      this.cargarEstadisticas(),
      this.cargarAsignaciones()
    ]).finally(() => {
      this.loading = false;
    });
  }

  /**
   * Cargar catálogo de sacramentos
   */
  cargarSacramentos(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.sacramentoAsignacionService.obtenerSacramentos().subscribe({
        next: (response) => {
          if (response.ok) {
            this.sacramentos = response.datos;
            resolve();
          } else {
            reject(new Error('Error al cargar sacramentos'));
          }
        },
        error: (error) => {
          console.error('Error al cargar sacramentos:', error);
          reject(error);
        }
      });
    });
  }

  /**
   * Cargar catálogo de roles de participante
   */
  cargarRolesParticipante(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.sacramentoAsignacionService.obtenerRolesParticipante().subscribe({
        next: (response) => {
          if (response.ok) {
            this.rolesParticipante = response.datos;
            resolve();
          } else {
            reject(new Error('Error al cargar roles de participante'));
          }
        },
        error: (error) => {
          console.error('Error al cargar roles de participante:', error);
          reject(error);
        }
      });
    });
  }

  /**
   * Cargar lista de feligreses
   */
  cargarFeligreses(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.feligresService.obtenerFeligreses({ limite: 1000 }).subscribe({
        next: (response) => {
          if (response.ok) {
            this.feligreses = response.datos.datos;
            console.log('📋 Feligreses cargados:', this.feligreses.length);
            resolve();
          } else {
            reject(new Error('Error al cargar feligreses'));
          }
        },
        error: (error) => {
          console.error('Error al cargar feligreses:', error);
          reject(error);
        }
      });
    });
  }

  /**
   * Cargar estadísticas
   */
  cargarEstadisticas(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.sacramentoAsignacionService.obtenerEstadisticas().subscribe({
        next: (response) => {
          if (response.ok) {
            this.estadisticas = response.datos;
            resolve();
          } else {
            reject(new Error('Error al cargar estadísticas'));
          }
        },
        error: (error) => {
          console.error('Error al cargar estadísticas:', error);
          reject(error);
        }
      });
    });
  }

  /**
   * Cargar asignaciones existentes
   */
  cargarAsignaciones(): void {
    this.loadingAsignaciones = true;
    
    this.sacramentoAsignacionService.obtenerAsignaciones(this.filtros).subscribe({
      next: (response) => {
        if (response.ok) {
          // AsignacionResponse tiene la estructura: { asignaciones, total, pagina, limite, totalPaginas }
          this.dataSource.data = response.datos.asignaciones;
          this.totalAsignaciones = response.datos.total;
          
          // Actualizar paginator después de cargar datos
          if (this.paginator) {
            this.paginator.length = this.totalAsignaciones;
            this.paginator.pageIndex = this.currentPage - 1;
            this.paginator.pageSize = this.pageSize;
          }
          
          this.loadingAsignaciones = false;
        }
      },
      error: (error) => {
        console.error('Error al cargar asignaciones:', error);
        this.snackBar.open('Error al cargar asignaciones', 'Cerrar', { duration: 3000 });
        this.loadingAsignaciones = false;
      }
    });
  }

  /**
   * Configurar autocomplete para feligreses
   */
  configurarAutocomplete(): void {
    // Autocomplete para bautizo
    this.feligresesFiltrados[0] = this.controladorFeligresBautizo.valueChanges.pipe(
      startWith(''),
      map(value => this._filtrarFeligreses(value || ''))
    );

    // Autocomplete para confirmación
    this.feligresesFiltrados[1] = this.controladorFeligresConfirmacion.valueChanges.pipe(
      startWith(''),
      map(value => this._filtrarFeligreses(value || ''))
    );

    // Autocomplete para novio
    this.feligresesFiltradosNovio = this.controladorFeligresNovio.valueChanges.pipe(
      startWith(''),
      map(value => this._filtrarFeligreses(value || ''))
    );

    // Autocomplete para novia
    this.feligresesFiltradosNovia = this.controladorFeligresNovia.valueChanges.pipe(
      startWith(''),
      map(value => this._filtrarFeligreses(value || ''))
    );
  }

  /**
   * Método para activar el autocomplete al hacer clic
   */
  activarAutocomplete(control: any): void {
    console.log('🎯 Activando autocomplete para control:', control);
    // Forzar la activación del autocomplete
    if (!control.value) {
      control.setValue('');
    }
    // Disparar el evento de cambio para activar el filtrado
    control.updateValueAndValidity();
  }

  /**
   * Filtrar feligreses para autocomplete
   */
  private _filtrarFeligreses(value: string): Feligres[] {
    // Si no hay valor de búsqueda, mostrar todos los feligreses
    if (!value || value.trim() === '') {
      console.log('🔍 Mostrando todos los feligreses:', this.feligreses.length);
      return this.feligreses;
    }
    
    const filterValue = value.toLowerCase();
    const filtered = this.feligreses.filter(feligres => 
      feligres.primer_nombre.toLowerCase().includes(filterValue) ||
      feligres.primer_apellido.toLowerCase().includes(filterValue) ||
      `${feligres.primer_nombre} ${feligres.primer_apellido}`.toLowerCase().includes(filterValue) ||
      feligres.comunidad_nombre?.toLowerCase().includes(filterValue)
    );
    console.log('🔍 Filtrando feligreses:', { value, total: this.feligreses.length, filtered: filtered.length });
    return filtered;
  }

  /**
   * Función para mostrar el feligrés seleccionado en el input
   */
  displayFeligres = (feligres: Feligres | null): string => {
    console.log('🎯 displayFeligres llamado con:', feligres);
    return feligres ? `${feligres.primer_nombre} ${feligres.primer_apellido}` : '';
  }

  /**
   * Seleccionar feligrés para bautizo
   */
  seleccionarFeligresBautizo(feligres: Feligres): void {
    this.feligresSeleccionadoBautizo = feligres;
    this.controladorFeligresBautizo.setValue(`${feligres.primer_nombre} ${feligres.primer_apellido}`);
  }

  /**
   * Seleccionar feligrés para confirmación
   */
  seleccionarFeligresConfirmacion(feligres: Feligres): void {
    this.feligresSeleccionadoConfirmacion = feligres;
    this.controladorFeligresConfirmacion.setValue(`${feligres.primer_nombre} ${feligres.primer_apellido}`);
  }

  /**
   * Seleccionar novio para matrimonio
   */
  seleccionarNovio(feligres: Feligres): void {
    this.feligresSeleccionadoNovio = feligres;
    this.controladorFeligresNovio.setValue(`${feligres.primer_nombre} ${feligres.primer_apellido}`);
  }

  /**
   * Seleccionar novia para matrimonio
   */
  seleccionarNovia(feligres: Feligres): void {
    this.feligresSeleccionadoNovia = feligres;
    this.controladorFeligresNovia.setValue(`${feligres.primer_nombre} ${feligres.primer_apellido}`);
  }

  /**
   * Asignar bautizo
   */
  asignarBautizo(): void {
    if (this.formularioBautizo.valid && this.feligresSeleccionadoBautizo) {
      const formData = this.formularioBautizo.value;
      
      // Formatear fecha correctamente
      const fechaFormateada = formData.fecha_celebracion instanceof Date 
        ? formData.fecha_celebracion.toISOString().split('T')[0]
        : formData.fecha_celebracion;
      
      const asignacion: SacramentoAsignacionCreate = {
        id_sacramento: 1, // Bautizo
        fecha_celebracion: fechaFormateada,
        pagado: formData.pagado,
        comentarios: formData.comentarios || null,
        participantes: [{
          id_feligres: this.feligresSeleccionadoBautizo.id_feligres,
          id_rol_participante: 1 // Bautizado
        }]
      };

      if (this.modoEdicion && this.asignacionEditando) {
        this.actualizarAsignacion(asignacion, 'Bautizo actualizado correctamente');
      } else {
        this.crearAsignacion(asignacion, 'Bautizo asignado correctamente');
      }
    } else {
      this.snackBar.open('Por favor complete todos los campos requeridos', 'Cerrar', { duration: 3000 });
    }
  }

  /**
   * Asignar confirmación
   */
  asignarConfirmacion(): void {
    if (this.formularioConfirmacion.valid && this.feligresSeleccionadoConfirmacion) {
      const formData = this.formularioConfirmacion.value;
      
      // Formatear fecha correctamente
      const fechaFormateada = formData.fecha_celebracion instanceof Date 
        ? formData.fecha_celebracion.toISOString().split('T')[0]
        : formData.fecha_celebracion;
      
      const asignacion: SacramentoAsignacionCreate = {
        id_sacramento: 3, // Confirmación
        fecha_celebracion: fechaFormateada,
        pagado: formData.pagado,
        comentarios: formData.comentarios || null,
        participantes: [{
          id_feligres: this.feligresSeleccionadoConfirmacion.id_feligres,
          id_rol_participante: 2 // Confirmando
        }]
      };

      if (this.modoEdicion && this.asignacionEditando) {
        this.actualizarAsignacion(asignacion, 'Confirmación actualizada correctamente');
      } else {
        this.crearAsignacion(asignacion, 'Confirmación asignada correctamente');
      }
    } else {
      this.snackBar.open('Por favor complete todos los campos requeridos', 'Cerrar', { duration: 3000 });
    }
  }

  /**
   * Asignar matrimonio
   */
  asignarMatrimonio(): void {
    if (this.formularioMatrimonio.valid && this.feligresSeleccionadoNovio && this.feligresSeleccionadoNovia) {
      const formData = this.formularioMatrimonio.value;
      
      // Formatear fecha correctamente
      const fechaFormateada = formData.fecha_celebracion instanceof Date 
        ? formData.fecha_celebracion.toISOString().split('T')[0]
        : formData.fecha_celebracion;
      
      const asignacion: SacramentoAsignacionCreate = {
        id_sacramento: 4, // Matrimonio
        fecha_celebracion: fechaFormateada,
        pagado: formData.pagado,
        comentarios: formData.comentarios || null,
        participantes: [
          {
            id_feligres: this.feligresSeleccionadoNovio.id_feligres,
            id_rol_participante: 4 // Novio/Novia
          },
          {
            id_feligres: this.feligresSeleccionadoNovia.id_feligres,
            id_rol_participante: 4 // Novio/Novia
          }
        ]
      };

      if (this.modoEdicion && this.asignacionEditando) {
        this.actualizarAsignacion(asignacion, 'Matrimonio actualizado correctamente');
      } else {
        this.crearAsignacion(asignacion, 'Matrimonio asignado correctamente');
      }
    } else {
      this.snackBar.open('Por favor complete todos los campos requeridos', 'Cerrar', { duration: 3000 });
    }
  }

  /**
   * Crear asignación en el backend
   */
  private crearAsignacion(asignacion: SacramentoAsignacionCreate, mensajeExito: string): void {
    this.loading = true;
    
    // La fecha ya viene formateada como string desde los métodos asignarBautizo/Confirmacion/Matrimonio
    // Nos aseguramos de que siempre sea string
    let fechaFormateada: string;
    if (typeof asignacion.fecha_celebracion === 'string') {
      fechaFormateada = asignacion.fecha_celebracion;
    } else {
      // Si por alguna razón no es string, convertir a string
      fechaFormateada = String(asignacion.fecha_celebracion);
    }
    
    const asignacionEnviar: SacramentoAsignacionCreate = {
      ...asignacion,
      fecha_celebracion: fechaFormateada
    };
    
    this.sacramentoAsignacionService.crearAsignacion(asignacionEnviar).subscribe({
      next: (response) => {
        if (response.ok) {
          this.snackBar.open(mensajeExito, 'Cerrar', { duration: 3000 });
          this.limpiarFormularios();
          this.cargarAsignaciones();
          this.cargarEstadisticas();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al crear asignación:', error);
        this.snackBar.open(error.error?.mensaje || 'Error al crear asignación', 'Cerrar', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  /**
   * Actualizar asignación en el backend
   */
  private actualizarAsignacion(asignacion: SacramentoAsignacionCreate, mensajeExito: string): void {
    if (!this.asignacionEditando) {
      return;
    }
    
    this.loading = true;
    
    // Convertir SacramentoAsignacionCreate a SacramentoAsignacionUpdate
    const asignacionUpdate = {
      id_sacramento: asignacion.id_sacramento,
      fecha_celebracion: asignacion.fecha_celebracion,
      pagado: asignacion.pagado,
      comentarios: asignacion.comentarios,
      participantes: asignacion.participantes
    };
    
    this.sacramentoAsignacionService.actualizarAsignacion(this.asignacionEditando.id_asignacion, asignacionUpdate).subscribe({
      next: (response) => {
        if (response.ok) {
          this.snackBar.open(mensajeExito, 'Cerrar', { duration: 3000 });
          this.limpiarFormularios();
          this.cargarAsignaciones();
          this.cargarEstadisticas();
          // Cambiar al tab de lista después de actualizar
          this.tabSeleccionado = 3;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al actualizar asignación:', error);
        this.snackBar.open(error.error?.mensaje || 'Error al actualizar asignación', 'Cerrar', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  /**
   * Limpiar formularios
   */
  limpiarFormularios(): void {
    this.formularioBautizo.reset({ pagado: false });
    this.formularioConfirmacion.reset({ pagado: false });
    this.formularioMatrimonio.reset({ pagado: false });
    
    this.feligresSeleccionadoBautizo = null;
    this.feligresSeleccionadoConfirmacion = null;
    this.feligresSeleccionadoNovio = null;
    this.feligresSeleccionadoNovia = null;
    
    this.controladorFeligresBautizo.setValue('');
    this.controladorFeligresConfirmacion.setValue('');
    this.controladorFeligresNovio.setValue('');
    this.controladorFeligresNovia.setValue('');
    
    this.modoEdicion = false;
    this.asignacionEditando = null;
  }

  /**
   * Editar asignación
   */
  editarAsignacion(asignacion: SacramentoAsignacion): void {
    this.loading = true;
    // Obtener la asignación completa con todos los detalles
    this.sacramentoAsignacionService.obtenerAsignacionPorId(asignacion.id_asignacion).subscribe({
      next: (response) => {
        if (response.ok) {
          this.asignacionEditando = response.datos;
          this.modoEdicion = true;
          
          // Determinar qué tab abrir según el tipo de sacramento
          if (asignacion.id_sacramento === 1) {
            // Bautizo
            this.tabSeleccionado = 0;
            this.cargarDatosEnFormularioBautizo(response.datos);
          } else if (asignacion.id_sacramento === 3) {
            // Confirmación
            this.tabSeleccionado = 1;
            this.cargarDatosEnFormularioConfirmacion(response.datos);
          } else if (asignacion.id_sacramento === 4) {
            // Matrimonio
            this.tabSeleccionado = 2;
            this.cargarDatosEnFormularioMatrimonio(response.datos);
          }
          
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error al cargar asignación:', error);
        this.snackBar.open(error.error?.mensaje || 'Error al cargar asignación', 'Cerrar', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  /**
   * Cargar datos en formulario de bautizo para edición
   */
  private cargarDatosEnFormularioBautizo(asignacion: SacramentoAsignacion): void {
    if (asignacion.participantes && asignacion.participantes.length > 0) {
      const participante = asignacion.participantes[0];
      const feligres = this.feligreses.find(f => f.id_feligres === participante.id_feligres);
      
      if (feligres) {
        this.feligresSeleccionadoBautizo = feligres;
        this.controladorFeligresBautizo.setValue(`${feligres.primer_nombre} ${feligres.primer_apellido}`);
      }
    }
    
    this.formularioBautizo.patchValue({
      fecha_celebracion: new Date(asignacion.fecha_celebracion),
      pagado: asignacion.pagado,
      comentarios: asignacion.comentarios || ''
    });
  }

  /**
   * Cargar datos en formulario de confirmación para edición
   */
  private cargarDatosEnFormularioConfirmacion(asignacion: SacramentoAsignacion): void {
    if (asignacion.participantes && asignacion.participantes.length > 0) {
      const participante = asignacion.participantes[0];
      const feligres = this.feligreses.find(f => f.id_feligres === participante.id_feligres);
      
      if (feligres) {
        this.feligresSeleccionadoConfirmacion = feligres;
        this.controladorFeligresConfirmacion.setValue(`${feligres.primer_nombre} ${feligres.primer_apellido}`);
      }
    }
    
    this.formularioConfirmacion.patchValue({
      fecha_celebracion: new Date(asignacion.fecha_celebracion),
      pagado: asignacion.pagado,
      comentarios: asignacion.comentarios || ''
    });
  }

  /**
   * Cargar datos en formulario de matrimonio para edición
   */
  private cargarDatosEnFormularioMatrimonio(asignacion: SacramentoAsignacion): void {
    if (asignacion.participantes && asignacion.participantes.length >= 2) {
      // Novio (primer participante)
      const participanteNovio = asignacion.participantes[0];
      const feligresNovio = this.feligreses.find(f => f.id_feligres === participanteNovio.id_feligres);
      
      if (feligresNovio) {
        this.feligresSeleccionadoNovio = feligresNovio;
        this.controladorFeligresNovio.setValue(`${feligresNovio.primer_nombre} ${feligresNovio.primer_apellido}`);
      }
      
      // Novia (segundo participante)
      const participanteNovia = asignacion.participantes[1];
      const feligresNovia = this.feligreses.find(f => f.id_feligres === participanteNovia.id_feligres);
      
      if (feligresNovia) {
        this.feligresSeleccionadoNovia = feligresNovia;
        this.controladorFeligresNovia.setValue(`${feligresNovia.primer_nombre} ${feligresNovia.primer_apellido}`);
      }
    }
    
    this.formularioMatrimonio.patchValue({
      fecha_celebracion: new Date(asignacion.fecha_celebracion),
      pagado: asignacion.pagado,
      comentarios: asignacion.comentarios || ''
    });
  }

  /**
   * Eliminar asignación
   */
  eliminarAsignacion(asignacion: SacramentoAsignacion): void {
    if (confirm(`¿Estás seguro de que deseas eliminar esta asignación de ${asignacion.sacramento_nombre}?`)) {
      this.sacramentoAsignacionService.eliminarAsignacion(asignacion.id_asignacion).subscribe({
        next: (response) => {
          if (response.ok) {
            this.snackBar.open('Asignación eliminada correctamente', 'Cerrar', { duration: 3000 });
            this.cargarAsignaciones();
            this.cargarEstadisticas();
          }
        },
        error: (error) => {
          console.error('Error al eliminar asignación:', error);
          this.snackBar.open(error.error?.mensaje || 'Error al eliminar asignación', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  /**
   * Cambiar página en la tabla
   */
  onPageChange(event: any): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.filtros.pagina = this.currentPage;
    this.filtros.limite = this.pageSize;
    this.cargarAsignaciones();
  }

  /**
   * Aplicar filtros
   */
  aplicarFiltros(): void {
    this.currentPage = 1;
    this.filtros.pagina = this.currentPage;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    this.cargarAsignaciones();
  }

  /**
   * Limpiar filtros
   */
  limpiarFiltros(): void {
    this.filtros = {
      pagina: 1,
      limite: 10
    };
    this.aplicarFiltros();
  }

  /**
   * Obtener nombre del sacramento por ID
   */
  obtenerNombreSacramento(idSacramento: number): string {
    const sacramento = this.sacramentos.find(s => s.id_sacramento === idSacramento);
    return sacramento ? sacramento.nombre : 'Desconocido';
  }

  /**
   * Formatear fecha para mostrar
   */
  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES');
  }

  /**
   * Obtener clase CSS para estado de pago
   */
  obtenerClaseEstadoPago(pagado: boolean): string {
    return pagado ? 'estado-pagado' : 'estado-pendiente';
  }

  /**
   * Navegar de vuelta
   */
  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  /**
   * TrackBy function para optimizar el rendimiento de la tabla
   */
  trackByAsignacionId(index: number, asignacion: SacramentoAsignacion): number {
    return asignacion.id_asignacion;
  }

  /**
   * Método de prueba para verificar funcionalidad
   */
  testClick(): void {
    console.log('🎉 ¡Botón de prueba funcionando!');
    alert('¡El componente está funcionando correctamente!');
  }
}
