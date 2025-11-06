import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
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
  
  // Modal de edición
  mostrarModalEdicion = false;
  tipoSacramentoModal: 'bautizo' | 'confirmacion' | 'matrimonio' | null = null;
  
  // Modal de confirmación de eliminación
  mostrarModalEliminar = false;
  asignacionAEliminar: SacramentoAsignacion | null = null;
  
  // Formularios para el modal
  formularioModalBautizo: FormGroup;
  formularioModalConfirmacion: FormGroup;
  formularioModalMatrimonio: FormGroup;
  
  // Controladores de autocomplete para el modal
  controladorFeligresModalBautizo = this.fb.control<Feligres | string>('');
  controladorFeligresModalConfirmacion = this.fb.control<Feligres | string>('');
  controladorFeligresModalNovio = this.fb.control<Feligres | string>('');
  controladorFeligresModalNovia = this.fb.control<Feligres | string>('');
  
  // Feligreses seleccionados para el modal
  feligresSeleccionadoModalBautizo: Feligres | null = null;
  feligresSeleccionadoModalConfirmacion: Feligres | null = null;
  feligresSeleccionadoModalNovio: Feligres | null = null;
  feligresSeleccionadoModalNovia: Feligres | null = null;
  
  // Observables para autocomplete del modal
  feligresesFiltradosModalBautizo: Observable<Feligres[]> = new Observable();
  feligresesFiltradosModalConfirmacion: Observable<Feligres[]> = new Observable();
  feligresesFiltradosModalNovio: Observable<Feligres[]> = new Observable();
  feligresesFiltradosModalNovia: Observable<Feligres[]> = new Observable();

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

  // Formulario de filtros
  formularioFiltros: FormGroup;

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
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    // Inicializar formularios
    this.formularioBautizo = this.fb.group({
      fecha_celebracion: ['', [Validators.required]],
      pagado: [false],
      monto_pagado: ['', []],
      comentarios: ['']
    });

    this.formularioConfirmacion = this.fb.group({
      fecha_celebracion: ['', [Validators.required]],
      pagado: [false],
      monto_pagado: ['', []],
      comentarios: ['']
    });

    this.formularioMatrimonio = this.fb.group({
      fecha_celebracion: ['', [Validators.required]],
      pagado: [false],
      monto_pagado: ['', []],
      comentarios: ['']
    });

    // La validación condicional se configurará en ngOnInit después de que todos los formularios estén inicializados

    // Formulario de filtros para la lista
    this.formularioFiltros = this.fb.group({
      id_sacramento: [''],
      busqueda: [''],
      fecha_desde: [''],
      fecha_hasta: [''],
      pagado: ['']
    });

    // Formularios para el modal
    this.formularioModalBautizo = this.fb.group({
      fecha_celebracion: ['', [Validators.required]],
      pagado: [false],
      monto_pagado: ['', []],
      comentarios: ['']
    });

    this.formularioModalConfirmacion = this.fb.group({
      fecha_celebracion: ['', [Validators.required]],
      pagado: [false],
      monto_pagado: ['', []],
      comentarios: ['']
    });

    this.formularioModalMatrimonio = this.fb.group({
      fecha_celebracion: ['', [Validators.required]],
      pagado: [false],
      monto_pagado: ['', []],
      comentarios: ['']
    });
  }

  /**
   * Configurar validación condicional para monto_pagado
   * Si pagado está marcado, monto_pagado es requerido y debe ser mayor a 0
   */
  configurarValidacionCondicional(): void {
    // Para formulario de Bautizo
    this.formularioBautizo.get('pagado')?.valueChanges.subscribe(pagado => {
      const montoControl = this.formularioBautizo.get('monto_pagado');
      if (pagado) {
        montoControl?.setValidators([Validators.required, Validators.min(0.01)]);
      } else {
        montoControl?.clearValidators();
        montoControl?.setValue('');
      }
      montoControl?.updateValueAndValidity();
    });

    // Para formulario de Confirmación
    this.formularioConfirmacion.get('pagado')?.valueChanges.subscribe(pagado => {
      const montoControl = this.formularioConfirmacion.get('monto_pagado');
      if (pagado) {
        montoControl?.setValidators([Validators.required, Validators.min(0.01)]);
      } else {
        montoControl?.clearValidators();
        montoControl?.setValue('');
      }
      montoControl?.updateValueAndValidity();
    });

    // Para formulario de Matrimonio
    this.formularioMatrimonio.get('pagado')?.valueChanges.subscribe(pagado => {
      const montoControl = this.formularioMatrimonio.get('monto_pagado');
      if (pagado) {
        montoControl?.setValidators([Validators.required, Validators.min(0.01)]);
      } else {
        montoControl?.clearValidators();
        montoControl?.setValue('');
      }
      montoControl?.updateValueAndValidity();
    });

    // Para formularios del modal
    this.formularioModalBautizo.get('pagado')?.valueChanges.subscribe(pagado => {
      const montoControl = this.formularioModalBautizo.get('monto_pagado');
      if (pagado) {
        montoControl?.setValidators([Validators.required, Validators.min(0.01)]);
      } else {
        montoControl?.clearValidators();
        montoControl?.setValue('');
      }
      montoControl?.updateValueAndValidity();
    });

    this.formularioModalConfirmacion.get('pagado')?.valueChanges.subscribe(pagado => {
      const montoControl = this.formularioModalConfirmacion.get('monto_pagado');
      if (pagado) {
        montoControl?.setValidators([Validators.required, Validators.min(0.01)]);
      } else {
        montoControl?.clearValidators();
        montoControl?.setValue('');
      }
      montoControl?.updateValueAndValidity();
    });

    this.formularioModalMatrimonio.get('pagado')?.valueChanges.subscribe(pagado => {
      const montoControl = this.formularioModalMatrimonio.get('monto_pagado');
      if (pagado) {
        montoControl?.setValidators([Validators.required, Validators.min(0.01)]);
      } else {
        montoControl?.clearValidators();
        montoControl?.setValue('');
      }
      montoControl?.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    console.log('🎉 SacramentosAsignacionComponent: ngOnInit ejecutado correctamente');
    console.log('🔧 Environment API URL:', this.environment.apiUrl);
    console.log('⏰ Timestamp:', this.currentTime);
    
    // Configurar validación condicional después de que todos los formularios estén inicializados
    this.configurarValidacionCondicional();
    
    // Cargar datos iniciales
    this.cargarDatosIniciales();
    this.configurarAutocomplete();
    this.configurarAutocompleteModal();
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
      this.feligresService.obtenerFeligreses().subscribe({
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
   * Configurar autocomplete para el modal
   */
  configurarAutocompleteModal(): void {
    this.feligresesFiltradosModalBautizo = this.controladorFeligresModalBautizo.valueChanges.pipe(
      startWith(this.controladorFeligresModalBautizo.value || ''),
      map(value => {
        const filterValue = typeof value === 'string' ? value : (value ? `${value.primer_nombre} ${value.primer_apellido}` : '');
        return this._filtrarFeligreses(filterValue);
      })
    );

    this.feligresesFiltradosModalConfirmacion = this.controladorFeligresModalConfirmacion.valueChanges.pipe(
      startWith(this.controladorFeligresModalConfirmacion.value || ''),
      map(value => {
        const filterValue = typeof value === 'string' ? value : (value ? `${value.primer_nombre} ${value.primer_apellido}` : '');
        return this._filtrarFeligreses(filterValue);
      })
    );

    this.feligresesFiltradosModalNovio = this.controladorFeligresModalNovio.valueChanges.pipe(
      startWith(this.controladorFeligresModalNovio.value || ''),
      map(value => {
        const filterValue = typeof value === 'string' ? value : (value ? `${value.primer_nombre} ${value.primer_apellido}` : '');
        return this._filtrarFeligreses(filterValue);
      })
    );

    this.feligresesFiltradosModalNovia = this.controladorFeligresModalNovia.valueChanges.pipe(
      startWith(this.controladorFeligresModalNovia.value || ''),
      map(value => {
        const filterValue = typeof value === 'string' ? value : (value ? `${value.primer_nombre} ${value.primer_apellido}` : '');
        return this._filtrarFeligreses(filterValue);
      })
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
  private _filtrarFeligreses(value: string | Feligres | null): Feligres[] {
    // Si no hay valor de búsqueda, mostrar todos los feligreses
    if (!value) {
      console.log('🔍 Mostrando todos los feligreses:', this.feligreses.length);
      return this.feligreses;
    }
    
    // Si el valor es un objeto Feligres, no filtrar (ya está seleccionado)
    if (typeof value !== 'string') {
      return this.feligreses;
    }
    
    // Si es string vacío, mostrar todos
    if (value.trim() === '') {
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
  displayFeligres = (feligres: Feligres | null | string): string => {
    if (!feligres || typeof feligres === 'string') {
      return feligres || '';
    }
    return `${feligres.primer_nombre} ${feligres.primer_apellido}`;
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
      
      // Convertir monto_pagado a número o null
      let montoPagado: number | null = null;
      if (formData.pagado && formData.monto_pagado) {
        const monto = typeof formData.monto_pagado === 'string' 
          ? parseFloat(formData.monto_pagado) 
          : Number(formData.monto_pagado);
        montoPagado = isNaN(monto) ? null : monto;
      }
      
      const asignacion: SacramentoAsignacionCreate = {
        id_sacramento: 1, // Bautizo
        fecha_celebracion: fechaFormateada,
        pagado: formData.pagado,
        monto_pagado: montoPagado,
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
      
      // Convertir monto_pagado a número o null
      let montoPagado: number | null = null;
      if (formData.pagado && formData.monto_pagado) {
        const monto = typeof formData.monto_pagado === 'string' 
          ? parseFloat(formData.monto_pagado) 
          : Number(formData.monto_pagado);
        montoPagado = isNaN(monto) ? null : monto;
      }
      
      const asignacion: SacramentoAsignacionCreate = {
        id_sacramento: 3, // Confirmación
        fecha_celebracion: fechaFormateada,
        pagado: formData.pagado,
        monto_pagado: montoPagado,
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
      
      // Convertir monto_pagado a número o null
      let montoPagado: number | null = null;
      if (formData.pagado && formData.monto_pagado) {
        const monto = typeof formData.monto_pagado === 'string' 
          ? parseFloat(formData.monto_pagado) 
          : Number(formData.monto_pagado);
        montoPagado = isNaN(monto) ? null : monto;
      }
      
      const asignacion: SacramentoAsignacionCreate = {
        id_sacramento: 4, // Matrimonio
        fecha_celebracion: fechaFormateada,
        pagado: formData.pagado,
        monto_pagado: montoPagado,
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
    
    // Preparar datos para enviar
    // Si pagado es false, no enviar monto_pagado o enviarlo como null
    const asignacionEnviar: SacramentoAsignacionCreate = {
      ...asignacion,
      fecha_celebracion: fechaFormateada
    };
    
    // Si no está pagado, asegurar que monto_pagado sea null o undefined
    if (!asignacionEnviar.pagado) {
      asignacionEnviar.monto_pagado = null;
    }
    
    console.log('📤 Enviando asignación al backend:', JSON.stringify(asignacionEnviar, null, 2));
    
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
      monto_pagado: asignacion.monto_pagado,
      comentarios: asignacion.comentarios,
      participantes: asignacion.participantes
    };
    
    this.sacramentoAsignacionService.actualizarAsignacion(this.asignacionEditando.id_asignacion, asignacionUpdate).subscribe({
      next: (response) => {
        if (response.ok) {
          this.snackBar.open(mensajeExito, 'Cerrar', { duration: 3000 });
          this.cerrarModalEdicion();
          this.cargarAsignaciones();
          this.cargarEstadisticas();
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
   * Editar asignación - Abre modal
   */
  editarAsignacion(asignacion: SacramentoAsignacion): void {
    console.log('🔧 Editar asignación llamada:', asignacion);
    console.log('🔧 ID Sacramento:', asignacion.id_sacramento);
    this.loading = true;
    // Obtener la asignación completa con todos los detalles
    this.sacramentoAsignacionService.obtenerAsignacionPorId(asignacion.id_asignacion).subscribe({
      next: (response) => {
        if (response.ok) {
          console.log('✅ Asignación cargada:', response.datos);
          this.asignacionEditando = response.datos;
          this.modoEdicion = true;
          
          // Determinar qué tipo de sacramento es y cargar datos en el modal
          // Usar response.datos.id_sacramento en lugar de asignacion.id_sacramento por si acaso
          // Convertir a número por si viene como string
          const idSacramentoRaw = response.datos.id_sacramento || asignacion.id_sacramento;
          const idSacramento = typeof idSacramentoRaw === 'string' ? parseInt(idSacramentoRaw, 10) : Number(idSacramentoRaw);
          console.log('🔧 ID Sacramento a procesar (raw):', idSacramentoRaw, '| (parsed):', idSacramento, '| (type):', typeof idSacramento);
          
          if (idSacramento === 1) {
            // Bautizo
            console.log('✅ Cargando modal de Bautizo');
            this.tipoSacramentoModal = 'bautizo';
            this.cargarDatosEnModalBautizo(response.datos);
          } else if (idSacramento === 3) {
            // Confirmación
            console.log('✅ Cargando modal de Confirmación');
            this.tipoSacramentoModal = 'confirmacion';
            this.cargarDatosEnModalConfirmacion(response.datos);
          } else if (idSacramento === 4) {
            // Matrimonio
            console.log('✅ Cargando modal de Matrimonio');
            this.tipoSacramentoModal = 'matrimonio';
            this.cargarDatosEnModalMatrimonio(response.datos);
          } else {
            console.error('❌ Tipo de sacramento no reconocido:', idSacramento, '| Tipo:', typeof idSacramento);
            this.snackBar.open(`Tipo de sacramento no reconocido: ${idSacramento}`, 'Cerrar', { duration: 3000 });
            this.loading = false;
            return;
          }
          
          // Asegurar que los feligreses estén cargados antes de abrir el modal
          if (this.feligreses.length === 0) {
            console.log('⚠️ No hay feligreses cargados, recargando...');
            this.cargarFeligreses().then(() => {
              // Recargar datos del modal después de cargar feligreses
              if (this.tipoSacramentoModal === 'bautizo') {
                this.cargarDatosEnModalBautizo(response.datos);
              } else if (this.tipoSacramentoModal === 'confirmacion') {
                this.cargarDatosEnModalConfirmacion(response.datos);
              } else if (this.tipoSacramentoModal === 'matrimonio') {
                this.cargarDatosEnModalMatrimonio(response.datos);
              }
              // Abrir modal después de cargar
              setTimeout(() => {
                this.mostrarModalEdicion = true;
                console.log('✅ Modal abierto. mostrarModalEdicion:', this.mostrarModalEdicion);
                console.log('✅ Tipo sacramento modal:', this.tipoSacramentoModal);
                console.log('✅ Total feligreses disponibles:', this.feligreses.length);
                this.loading = false;
                this.cdr.detectChanges();
              }, 100);
            });
          } else {
            // Abrir modal después de configurar todo
            // Usar setTimeout para asegurar que Angular detecte los cambios
            setTimeout(() => {
              this.mostrarModalEdicion = true;
              console.log('✅ Modal abierto. mostrarModalEdicion:', this.mostrarModalEdicion);
              console.log('✅ Tipo sacramento modal:', this.tipoSacramentoModal);
              console.log('✅ Total feligreses disponibles:', this.feligreses.length);
              this.loading = false;
              this.cdr.detectChanges();
            }, 200);
          }
        }
      },
      error: (error) => {
        console.error('❌ Error al cargar asignación:', error);
        this.snackBar.open(error.error?.mensaje || 'Error al cargar asignación', 'Cerrar', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  /**
   * Cerrar modal de edición
   */
  cerrarModalEdicion(): void {
    this.mostrarModalEdicion = false;
    this.tipoSacramentoModal = null;
    this.asignacionEditando = null;
    this.modoEdicion = false;
    this.limpiarFormulariosModal();
  }

  /**
   * Limpiar formularios del modal
   */
  limpiarFormulariosModal(): void {
    this.formularioModalBautizo.reset({ pagado: false });
    this.formularioModalConfirmacion.reset({ pagado: false });
    this.formularioModalMatrimonio.reset({ pagado: false });
    
    this.feligresSeleccionadoModalBautizo = null;
    this.feligresSeleccionadoModalConfirmacion = null;
    this.feligresSeleccionadoModalNovio = null;
    this.feligresSeleccionadoModalNovia = null;
    
    this.controladorFeligresModalBautizo.setValue('');
    this.controladorFeligresModalConfirmacion.setValue('');
    this.controladorFeligresModalNovio.setValue('');
    this.controladorFeligresModalNovia.setValue('');
  }

  /**
   * Cargar datos en modal de bautizo
   */
  private cargarDatosEnModalBautizo(asignacion: SacramentoAsignacion): void {
    console.log('📋 Cargando datos en modal Bautizo:', asignacion);
    console.log('📋 Total feligreses disponibles:', this.feligreses.length);
    console.log('📋 IDs de feligreses disponibles:', this.feligreses.map(f => f.id_feligres));
    
    if (asignacion.participantes && asignacion.participantes.length > 0) {
      const participante = asignacion.participantes[0];
      console.log('📋 Participante encontrado:', participante);
      console.log('📋 ID Feligres del participante:', participante.id_feligres, '| Tipo:', typeof participante.id_feligres);
      
      // Buscar por id_feligres, comparando tanto string como número
      const idFeligresParticipante = participante.id_feligres;
      const feligres = this.feligreses.find(f => {
        // Comparar ambos como números y como strings
        const idF = typeof f.id_feligres === 'string' ? parseInt(f.id_feligres, 10) : f.id_feligres;
        const idP = typeof idFeligresParticipante === 'string' ? parseInt(idFeligresParticipante, 10) : idFeligresParticipante;
        return idF === idP || f.id_feligres === idFeligresParticipante || String(f.id_feligres) === String(idFeligresParticipante);
      });
      
      console.log('📋 Feligres encontrado:', feligres);
      if (feligres) {
        this.feligresSeleccionadoModalBautizo = feligres;
        // Establecer el objeto completo, no el string
        this.controladorFeligresModalBautizo.setValue(feligres);
        console.log('✅ Feligres establecido en modal Bautizo:', feligres.primer_nombre, feligres.primer_apellido);
      } else {
        console.warn('⚠️ No se encontró el feligres con ID:', idFeligresParticipante);
        console.warn('⚠️ Buscando en lista de feligreses:', this.feligreses.map(f => ({ id: f.id_feligres, nombre: `${f.primer_nombre} ${f.primer_apellido}` })));
      }
    }
    
    this.formularioModalBautizo.patchValue({
      fecha_celebracion: new Date(asignacion.fecha_celebracion),
      pagado: asignacion.pagado,
      monto_pagado: asignacion.monto_pagado || '',
      comentarios: asignacion.comentarios || ''
    });
  }

  /**
   * Cargar datos en modal de confirmación
   */
  private cargarDatosEnModalConfirmacion(asignacion: SacramentoAsignacion): void {
    console.log('📋 Cargando datos en modal Confirmación:', asignacion);
    console.log('📋 Total feligreses disponibles:', this.feligreses.length);
    
    if (asignacion.participantes && asignacion.participantes.length > 0) {
      const participante = asignacion.participantes[0];
      console.log('📋 Participante encontrado:', participante);
      
      const idFeligresParticipante = participante.id_feligres;
      const feligres = this.feligreses.find(f => {
        const idF = typeof f.id_feligres === 'string' ? parseInt(f.id_feligres, 10) : f.id_feligres;
        const idP = typeof idFeligresParticipante === 'string' ? parseInt(idFeligresParticipante, 10) : idFeligresParticipante;
        return idF === idP || f.id_feligres === idFeligresParticipante || String(f.id_feligres) === String(idFeligresParticipante);
      });
      
      console.log('📋 Feligres encontrado:', feligres);
      if (feligres) {
        this.feligresSeleccionadoModalConfirmacion = feligres;
        this.controladorFeligresModalConfirmacion.setValue(feligres);
        console.log('✅ Feligres establecido en modal Confirmación');
      } else {
        console.warn('⚠️ No se encontró el feligres con ID:', idFeligresParticipante);
      }
    }
    
    this.formularioModalConfirmacion.patchValue({
      fecha_celebracion: new Date(asignacion.fecha_celebracion),
      pagado: asignacion.pagado,
      monto_pagado: asignacion.monto_pagado || '',
      comentarios: asignacion.comentarios || ''
    });
  }

  /**
   * Cargar datos en modal de matrimonio
   */
  private cargarDatosEnModalMatrimonio(asignacion: SacramentoAsignacion): void {
    console.log('📋 Cargando datos en modal Matrimonio:', asignacion);
    console.log('📋 Total feligreses disponibles:', this.feligreses.length);
    
    if (asignacion.participantes && asignacion.participantes.length >= 2) {
      // Novio (primer participante)
      const participanteNovio = asignacion.participantes[0];
      console.log('📋 Participante Novio:', participanteNovio);
      const idFeligresNovio = participanteNovio.id_feligres;
      const feligresNovio = this.feligreses.find(f => {
        const idF = typeof f.id_feligres === 'string' ? parseInt(f.id_feligres, 10) : f.id_feligres;
        const idP = typeof idFeligresNovio === 'string' ? parseInt(idFeligresNovio, 10) : idFeligresNovio;
        return idF === idP || f.id_feligres === idFeligresNovio || String(f.id_feligres) === String(idFeligresNovio);
      });
      
      console.log('📋 Feligres Novio encontrado:', feligresNovio);
      if (feligresNovio) {
        this.feligresSeleccionadoModalNovio = feligresNovio;
        this.controladorFeligresModalNovio.setValue(feligresNovio);
        console.log('✅ Novio establecido en modal Matrimonio');
      } else {
        console.warn('⚠️ No se encontró el feligres Novio con ID:', idFeligresNovio);
      }
      
      // Novia (segundo participante)
      const participanteNovia = asignacion.participantes[1];
      console.log('📋 Participante Novia:', participanteNovia);
      const idFeligresNovia = participanteNovia.id_feligres;
      const feligresNovia = this.feligreses.find(f => {
        const idF = typeof f.id_feligres === 'string' ? parseInt(f.id_feligres, 10) : f.id_feligres;
        const idP = typeof idFeligresNovia === 'string' ? parseInt(idFeligresNovia, 10) : idFeligresNovia;
        return idF === idP || f.id_feligres === idFeligresNovia || String(f.id_feligres) === String(idFeligresNovia);
      });
      
      console.log('📋 Feligres Novia encontrado:', feligresNovia);
      if (feligresNovia) {
        this.feligresSeleccionadoModalNovia = feligresNovia;
        this.controladorFeligresModalNovia.setValue(feligresNovia);
        console.log('✅ Novia establecida en modal Matrimonio');
      } else {
        console.warn('⚠️ No se encontró el feligres Novia con ID:', idFeligresNovia);
      }
    }
    
    this.formularioModalMatrimonio.patchValue({
      fecha_celebracion: new Date(asignacion.fecha_celebracion),
      pagado: asignacion.pagado,
      monto_pagado: asignacion.monto_pagado || '',
      comentarios: asignacion.comentarios || ''
    });
  }

  /**
   * Seleccionar feligrés en modal - Bautizo
   */
  seleccionarFeligresModalBautizo(feligres: Feligres): void {
    this.feligresSeleccionadoModalBautizo = feligres;
    this.controladorFeligresModalBautizo.setValue(`${feligres.primer_nombre} ${feligres.primer_apellido}`);
  }

  /**
   * Seleccionar feligrés en modal - Confirmación
   */
  seleccionarFeligresModalConfirmacion(feligres: Feligres): void {
    this.feligresSeleccionadoModalConfirmacion = feligres;
    this.controladorFeligresModalConfirmacion.setValue(`${feligres.primer_nombre} ${feligres.primer_apellido}`);
  }

  /**
   * Seleccionar novio en modal
   */
  seleccionarNovioModal(feligres: Feligres): void {
    this.feligresSeleccionadoModalNovio = feligres;
    this.controladorFeligresModalNovio.setValue(`${feligres.primer_nombre} ${feligres.primer_apellido}`);
  }

  /**
   * Seleccionar novia en modal
   */
  seleccionarNoviaModal(feligres: Feligres): void {
    this.feligresSeleccionadoModalNovia = feligres;
    this.controladorFeligresModalNovia.setValue(`${feligres.primer_nombre} ${feligres.primer_apellido}`);
  }

  /**
   * Guardar cambios desde el modal - Bautizo
   */
  guardarModalBautizo(): void {
    if (this.formularioModalBautizo.valid && this.feligresSeleccionadoModalBautizo && this.asignacionEditando) {
      const formData = this.formularioModalBautizo.value;
      
      const fechaFormateada = formData.fecha_celebracion instanceof Date 
        ? formData.fecha_celebracion.toISOString().split('T')[0]
        : formData.fecha_celebracion;
      
      // Convertir monto_pagado a número o null
      let montoPagado: number | null = null;
      if (formData.pagado && formData.monto_pagado) {
        const monto = typeof formData.monto_pagado === 'string' 
          ? parseFloat(formData.monto_pagado) 
          : Number(formData.monto_pagado);
        montoPagado = isNaN(monto) ? null : monto;
      }
      
      const asignacion: SacramentoAsignacionCreate = {
        id_sacramento: 1,
        fecha_celebracion: fechaFormateada,
        pagado: formData.pagado,
        monto_pagado: montoPagado,
        comentarios: formData.comentarios || null,
        participantes: [{
          id_feligres: this.feligresSeleccionadoModalBautizo.id_feligres,
          id_rol_participante: 1
        }]
      };

      this.actualizarAsignacion(asignacion, 'Bautizo actualizado correctamente');
    } else {
      this.snackBar.open('Por favor complete todos los campos requeridos', 'Cerrar', { duration: 3000 });
    }
  }

  /**
   * Guardar cambios desde el modal - Confirmación
   */
  guardarModalConfirmacion(): void {
    if (this.formularioModalConfirmacion.valid && this.feligresSeleccionadoModalConfirmacion && this.asignacionEditando) {
      const formData = this.formularioModalConfirmacion.value;
      
      const fechaFormateada = formData.fecha_celebracion instanceof Date 
        ? formData.fecha_celebracion.toISOString().split('T')[0]
        : formData.fecha_celebracion;
      
      // Convertir monto_pagado a número o null
      let montoPagado: number | null = null;
      if (formData.pagado && formData.monto_pagado) {
        const monto = typeof formData.monto_pagado === 'string' 
          ? parseFloat(formData.monto_pagado) 
          : Number(formData.monto_pagado);
        montoPagado = isNaN(monto) ? null : monto;
      }
      
      const asignacion: SacramentoAsignacionCreate = {
        id_sacramento: 3,
        fecha_celebracion: fechaFormateada,
        pagado: formData.pagado,
        monto_pagado: montoPagado,
        comentarios: formData.comentarios || null,
        participantes: [{
          id_feligres: this.feligresSeleccionadoModalConfirmacion.id_feligres,
          id_rol_participante: 2
        }]
      };

      this.actualizarAsignacion(asignacion, 'Confirmación actualizada correctamente');
    } else {
      this.snackBar.open('Por favor complete todos los campos requeridos', 'Cerrar', { duration: 3000 });
    }
  }

  /**
   * Guardar cambios desde el modal - Matrimonio
   */
  guardarModalMatrimonio(): void {
    if (this.formularioModalMatrimonio.valid && this.feligresSeleccionadoModalNovio && this.feligresSeleccionadoModalNovia && this.asignacionEditando) {
      const formData = this.formularioModalMatrimonio.value;
      
      const fechaFormateada = formData.fecha_celebracion instanceof Date 
        ? formData.fecha_celebracion.toISOString().split('T')[0]
        : formData.fecha_celebracion;
      
      // Convertir monto_pagado a número o null
      let montoPagado: number | null = null;
      if (formData.pagado && formData.monto_pagado) {
        const monto = typeof formData.monto_pagado === 'string' 
          ? parseFloat(formData.monto_pagado) 
          : Number(formData.monto_pagado);
        montoPagado = isNaN(monto) ? null : monto;
      }
      
      const asignacion: SacramentoAsignacionCreate = {
        id_sacramento: 4,
        fecha_celebracion: fechaFormateada,
        pagado: formData.pagado,
        monto_pagado: montoPagado,
        comentarios: formData.comentarios || null,
        participantes: [
          {
            id_feligres: this.feligresSeleccionadoModalNovio.id_feligres,
            id_rol_participante: 4
          },
          {
            id_feligres: this.feligresSeleccionadoModalNovia.id_feligres,
            id_rol_participante: 4
          }
        ]
      };

      this.actualizarAsignacion(asignacion, 'Matrimonio actualizado correctamente');
    } else {
      this.snackBar.open('Por favor complete todos los campos requeridos', 'Cerrar', { duration: 3000 });
    }
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
   * Abrir modal de confirmación para eliminar asignación
   */
  eliminarAsignacion(asignacion: SacramentoAsignacion): void {
    this.asignacionAEliminar = asignacion;
    this.mostrarModalEliminar = true;
  }

  /**
   * Cerrar modal de confirmación de eliminación
   */
  cerrarModalEliminar(): void {
    this.mostrarModalEliminar = false;
    this.asignacionAEliminar = null;
  }

  /**
   * Confirmar eliminación de asignación
   */
  confirmarEliminacion(): void {
    if (!this.asignacionAEliminar) {
      return;
    }

    this.loading = true;
    this.sacramentoAsignacionService.eliminarAsignacion(this.asignacionAEliminar.id_asignacion).subscribe({
      next: (response) => {
        if (response.ok) {
          this.snackBar.open('Asignación eliminada correctamente', 'Cerrar', { duration: 3000 });
          this.cargarAsignaciones();
          this.cargarEstadisticas();
          this.cerrarModalEliminar();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al eliminar asignación:', error);
        this.snackBar.open(error.error?.mensaje || 'Error al eliminar asignación', 'Cerrar', { duration: 3000 });
        this.loading = false;
      }
    });
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
    const filtrosForm = this.formularioFiltros.value;
    
    // Limpiar filtros anteriores
    this.filtros = {
      pagina: 1,
      limite: this.pageSize
    };
    
    // Aplicar filtros del formulario
    if (filtrosForm.id_sacramento && filtrosForm.id_sacramento !== '') {
      this.filtros.id_sacramento = parseInt(filtrosForm.id_sacramento);
    }
    
    if (filtrosForm.busqueda && filtrosForm.busqueda.trim() !== '') {
      this.filtros.busqueda = filtrosForm.busqueda.trim();
    }
    
    if (filtrosForm.fecha_desde && filtrosForm.fecha_desde !== '') {
      const fecha = filtrosForm.fecha_desde instanceof Date 
        ? filtrosForm.fecha_desde.toISOString().split('T')[0]
        : filtrosForm.fecha_desde;
      this.filtros.fecha_desde = fecha;
    }
    
    if (filtrosForm.fecha_hasta && filtrosForm.fecha_hasta !== '') {
      const fecha = filtrosForm.fecha_hasta instanceof Date 
        ? filtrosForm.fecha_hasta.toISOString().split('T')[0]
        : filtrosForm.fecha_hasta;
      this.filtros.fecha_hasta = fecha;
    }
    
    if (filtrosForm.pagado !== '' && filtrosForm.pagado !== null && filtrosForm.pagado !== undefined) {
      this.filtros.pagado = filtrosForm.pagado === 'true' ? 'true' : filtrosForm.pagado === 'false' ? 'false' : '';
    }
    
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
    this.formularioFiltros.reset({
      id_sacramento: '',
      busqueda: '',
      fecha_desde: '',
      fecha_hasta: '',
      pagado: ''
    });
    this.filtros = {
      pagina: 1,
      limite: this.pageSize
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

}
