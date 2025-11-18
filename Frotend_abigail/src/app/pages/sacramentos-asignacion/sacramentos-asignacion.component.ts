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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
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
import { ConstanciaService } from '../../services/constancia.service';
import { MantenimientoService } from '../../services/mantenimiento.service';
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
import { Feligres, OpcionSelect } from '../../models/mantenimiento.model';
import { Constancia, ConstanciaCreate, ConstanciaUpdate } from '../../models/constancia.model';
import jsPDF from 'jspdf';

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
    MatDialogModule,
    MatSnackBarModule
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
  
  // Modal de constancia
  mostrarModalConstancia = false;
  asignacionParaConstancia: SacramentoAsignacion | null = null;
  constanciaExistente: Constancia | null = null;
  parrocosActivos: OpcionSelect[] = [];
  datosFeligresCompleto: Feligres | null = null;
  datosFeligresCompleto2: Feligres | null = null; // Para matrimonio
  datosPadrinos: Feligres[] = [];
  formularioConstancia: FormGroup;
  
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
  
  // Padrinos/Testigos seleccionados para el modal
  padrino1ModalBautizo: Feligres | null = null;
  padrino2ModalBautizo: Feligres | null = null;
  padrino1ModalConfirmacion: Feligres | null = null;
  padrino2ModalConfirmacion: Feligres | null = null;
  testigo1ModalMatrimonio: Feligres | null = null;
  testigo2ModalMatrimonio: Feligres | null = null;
  
  // Controladores de autocomplete para padrinos/testigos del modal
  controladorPadrino1ModalBautizo = this.fb.control<Feligres | string>('');
  controladorPadrino2ModalBautizo = this.fb.control<Feligres | string>('');
  controladorPadrino1ModalConfirmacion = this.fb.control<Feligres | string>('');
  controladorPadrino2ModalConfirmacion = this.fb.control<Feligres | string>('');
  controladorTestigo1ModalMatrimonio = this.fb.control<Feligres | string>('');
  controladorTestigo2ModalMatrimonio = this.fb.control<Feligres | string>('');
  
  // Observables para autocomplete de padrinos/testigos del modal
  feligresesFiltradosPadrino1ModalBautizo: Observable<Feligres[]> = new Observable();
  feligresesFiltradosPadrino2ModalBautizo: Observable<Feligres[]> = new Observable();
  feligresesFiltradosPadrino1ModalConfirmacion: Observable<Feligres[]> = new Observable();
  feligresesFiltradosPadrino2ModalConfirmacion: Observable<Feligres[]> = new Observable();
  feligresesFiltradosTestigo1ModalMatrimonio: Observable<Feligres[]> = new Observable();
  feligresesFiltradosTestigo2ModalMatrimonio: Observable<Feligres[]> = new Observable();
  
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
  tiposTestigoPadrino: any[] = [];
  
  // Padrinos/Testigos seleccionados
  padrino1Bautizo: Feligres | null = null;
  padrino2Bautizo: Feligres | null = null;
  padrino1Confirmacion: Feligres | null = null;
  padrino2Confirmacion: Feligres | null = null;
  testigo1Matrimonio: Feligres | null = null;
  testigo2Matrimonio: Feligres | null = null;
  
  // Controladores de autocomplete para padrinos/testigos
  controladorPadrino1Bautizo = this.fb.control<Feligres | string>('');
  controladorPadrino2Bautizo = this.fb.control<Feligres | string>('');
  controladorPadrino1Confirmacion = this.fb.control<Feligres | string>('');
  controladorPadrino2Confirmacion = this.fb.control<Feligres | string>('');
  controladorTestigo1Matrimonio = this.fb.control<Feligres | string>('');
  controladorTestigo2Matrimonio = this.fb.control<Feligres | string>('');
  
  // Observables para autocomplete de padrinos/testigos
  feligresesFiltradosPadrino1Bautizo: Observable<Feligres[]> = new Observable();
  feligresesFiltradosPadrino2Bautizo: Observable<Feligres[]> = new Observable();
  feligresesFiltradosPadrino1Confirmacion: Observable<Feligres[]> = new Observable();
  feligresesFiltradosPadrino2Confirmacion: Observable<Feligres[]> = new Observable();
  feligresesFiltradosTestigo1Matrimonio: Observable<Feligres[]> = new Observable();
  feligresesFiltradosTestigo2Matrimonio: Observable<Feligres[]> = new Observable();

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
    private constanciaService: ConstanciaService,
    private mantenimientoService: MantenimientoService,
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

    // Formulario para constancia
    this.formularioConstancia = this.fb.group({
      id_parroco: ['', [Validators.required]],
      libro: [''],
      folio: [''],
      acta: [''],
      fecha_constancia: [new Date()]
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
      this.cargarAsignaciones(),
      this.cargarTiposTestigoPadrino()
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
   * Cargar catálogo de tipos de testigos/padrinos
   */
  cargarTiposTestigoPadrino(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.sacramentoAsignacionService.obtenerTiposTestigoPadrino().subscribe({
        next: (response) => {
          if (response.ok) {
            this.tiposTestigoPadrino = response.datos;
            resolve();
          } else {
            reject(new Error('Error al cargar tipos de testigos/padrinos'));
          }
        },
        error: (error) => {
          console.error('Error al cargar tipos de testigos/padrinos:', error);
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
   * Helper para obtener el ID del tipo de testigo/padrino
   * El backend devuelve 'id' para activos, pero puede venir como 'id_tipo_testigo_padrino' en otros casos
   */
  private obtenerIdTipoTestigoPadrino(tipo: any): number | undefined {
    return tipo?.id || tipo?.id_tipo_testigo_padrino;
  }

  /**
   * Cargar asignaciones existentes
   */
  cargarAsignaciones(): void {
    this.loadingAsignaciones = true;
    console.log('📥 Cargando asignaciones con filtros:', this.filtros);
    
    this.sacramentoAsignacionService.obtenerAsignaciones(this.filtros).subscribe({
      next: (response) => {
        console.log('✅ Respuesta recibida:', response);
        console.log('✅ response.ok:', response.ok);
        console.log('✅ response.datos:', response.datos);
        
        if (response.ok) {
          // AsignacionResponse tiene la estructura: { asignaciones, total, pagina, limite, totalPaginas }
          console.log('✅ Asignaciones recibidas:', response.datos?.asignaciones?.length || 0);
          console.log('✅ Total:', response.datos?.total || 0);
          console.log('✅ Datos completos:', JSON.stringify(response.datos, null, 2));
          
          if (response.datos && response.datos.asignaciones) {
            this.dataSource.data = response.datos.asignaciones;
            this.totalAsignaciones = response.datos.total || response.datos.asignaciones.length;
            
            console.log('✅ DataSource actualizado con', this.dataSource.data.length, 'asignaciones');
            console.log('✅ Primeras asignaciones:', this.dataSource.data.slice(0, 3));
            
            // Actualizar paginator después de cargar datos
            if (this.paginator) {
              this.paginator.length = this.totalAsignaciones;
              this.paginator.pageIndex = this.currentPage - 1;
              this.paginator.pageSize = this.pageSize;
            }
          } else {
            console.warn('⚠️ No se encontraron asignaciones en la respuesta');
            this.dataSource.data = [];
            this.totalAsignaciones = 0;
          }
          
          this.loadingAsignaciones = false;
        } else {
          console.error('❌ Respuesta no exitosa:', response);
          this.snackBar.open(response.mensaje || 'Error al cargar asignaciones', 'Cerrar', { duration: 3000 });
          this.loadingAsignaciones = false;
        }
      },
      error: (error) => {
        console.error('❌ Error al cargar asignaciones:', error);
        console.error('❌ Error completo:', JSON.stringify(error, null, 2));
        this.snackBar.open('Error al cargar asignaciones: ' + (error.error?.mensaje || error.message || 'Error desconocido'), 'Cerrar', { duration: 5000 });
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
    
    // Autocompletes para padrinos/testigos
    this.feligresesFiltradosPadrino1Bautizo = this.controladorPadrino1Bautizo.valueChanges.pipe(
      startWith(''),
      map(value => this._filtrarFeligreses(value || ''))
    );
    
    this.feligresesFiltradosPadrino2Bautizo = this.controladorPadrino2Bautizo.valueChanges.pipe(
      startWith(''),
      map(value => this._filtrarFeligreses(value || ''))
    );
    
    this.feligresesFiltradosPadrino1Confirmacion = this.controladorPadrino1Confirmacion.valueChanges.pipe(
      startWith(''),
      map(value => this._filtrarFeligreses(value || ''))
    );
    
    this.feligresesFiltradosPadrino2Confirmacion = this.controladorPadrino2Confirmacion.valueChanges.pipe(
      startWith(''),
      map(value => this._filtrarFeligreses(value || ''))
    );
    
    this.feligresesFiltradosTestigo1Matrimonio = this.controladorTestigo1Matrimonio.valueChanges.pipe(
      startWith(''),
      map(value => this._filtrarFeligreses(value || ''))
    );
    
    this.feligresesFiltradosTestigo2Matrimonio = this.controladorTestigo2Matrimonio.valueChanges.pipe(
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
    
    // Autocompletes para padrinos/testigos del modal
    this.feligresesFiltradosPadrino1ModalBautizo = this.controladorPadrino1ModalBautizo.valueChanges.pipe(
      startWith(''),
      map(value => this._filtrarFeligreses(value || ''))
    );
    
    this.feligresesFiltradosPadrino2ModalBautizo = this.controladorPadrino2ModalBautizo.valueChanges.pipe(
      startWith(''),
      map(value => this._filtrarFeligreses(value || ''))
    );
    
    this.feligresesFiltradosPadrino1ModalConfirmacion = this.controladorPadrino1ModalConfirmacion.valueChanges.pipe(
      startWith(''),
      map(value => this._filtrarFeligreses(value || ''))
    );
    
    this.feligresesFiltradosPadrino2ModalConfirmacion = this.controladorPadrino2ModalConfirmacion.valueChanges.pipe(
      startWith(''),
      map(value => this._filtrarFeligreses(value || ''))
    );
    
    this.feligresesFiltradosTestigo1ModalMatrimonio = this.controladorTestigo1ModalMatrimonio.valueChanges.pipe(
      startWith(''),
      map(value => this._filtrarFeligreses(value || ''))
    );
    
    this.feligresesFiltradosTestigo2ModalMatrimonio = this.controladorTestigo2ModalMatrimonio.valueChanges.pipe(
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
   * Seleccionar padrinos/testigos
   */
  seleccionarPadrino1Bautizo(feligres: Feligres): void {
    this.padrino1Bautizo = feligres;
    this.controladorPadrino1Bautizo.setValue(`${feligres.primer_nombre} ${feligres.primer_apellido}`);
  }

  seleccionarPadrino2Bautizo(feligres: Feligres): void {
    this.padrino2Bautizo = feligres;
    this.controladorPadrino2Bautizo.setValue(`${feligres.primer_nombre} ${feligres.primer_apellido}`);
  }

  seleccionarPadrino1Confirmacion(feligres: Feligres): void {
    this.padrino1Confirmacion = feligres;
    this.controladorPadrino1Confirmacion.setValue(`${feligres.primer_nombre} ${feligres.primer_apellido}`);
  }

  seleccionarPadrino2Confirmacion(feligres: Feligres): void {
    this.padrino2Confirmacion = feligres;
    this.controladorPadrino2Confirmacion.setValue(`${feligres.primer_nombre} ${feligres.primer_apellido}`);
  }

  seleccionarTestigo1Matrimonio(feligres: Feligres): void {
    this.testigo1Matrimonio = feligres;
    this.controladorTestigo1Matrimonio.setValue(`${feligres.primer_nombre} ${feligres.primer_apellido}`);
  }

  seleccionarTestigo2Matrimonio(feligres: Feligres): void {
    this.testigo2Matrimonio = feligres;
    this.controladorTestigo2Matrimonio.setValue(`${feligres.primer_nombre} ${feligres.primer_apellido}`);
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
      
      // Preparar testigos/padrinos
      const testigosPadrinos: any[] = [];
      const tipoPadrinoBautizo = this.tiposTestigoPadrino.find(t => 
        t.nombre.toLowerCase().includes('padrino') && t.nombre.toLowerCase().includes('bautizo')
      );
      
      if (tipoPadrinoBautizo) {
        const idTipo = this.obtenerIdTipoTestigoPadrino(tipoPadrinoBautizo);
        if (idTipo) {
          if (this.padrino1Bautizo) {
            testigosPadrinos.push({
              id_feligres: this.padrino1Bautizo.id_feligres,
              id_tipo_testigo_padrino: idTipo,
              numero_orden: 1
            });
          }
          if (this.padrino2Bautizo) {
            testigosPadrinos.push({
              id_feligres: this.padrino2Bautizo.id_feligres,
              id_tipo_testigo_padrino: idTipo,
              numero_orden: 2
            });
          }
        }
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
        }],
        testigos_padrinos: testigosPadrinos.length > 0 ? testigosPadrinos : []
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
      
      // Preparar testigos/padrinos
      const testigosPadrinos: any[] = [];
      const tipoPadrinoConfirmacion = this.tiposTestigoPadrino.find(t => 
        t.nombre.toLowerCase().includes('padrino') && t.nombre.toLowerCase().includes('confirmación')
      );
      
      if (tipoPadrinoConfirmacion) {
        const idTipo = this.obtenerIdTipoTestigoPadrino(tipoPadrinoConfirmacion);
        if (idTipo) {
          if (this.padrino1Confirmacion) {
            testigosPadrinos.push({
              id_feligres: this.padrino1Confirmacion.id_feligres,
              id_tipo_testigo_padrino: idTipo,
              numero_orden: 1
            });
          }
          if (this.padrino2Confirmacion) {
            testigosPadrinos.push({
              id_feligres: this.padrino2Confirmacion.id_feligres,
              id_tipo_testigo_padrino: idTipo,
              numero_orden: 2
            });
          }
        }
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
        }],
        testigos_padrinos: testigosPadrinos.length > 0 ? testigosPadrinos : []
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
      
      // Preparar testigos/padrinos
      const testigosPadrinos: any[] = [];
      const tipoTestigoMatrimonio = this.tiposTestigoPadrino.find(t => 
        t.nombre.toLowerCase().includes('testigo') && t.nombre.toLowerCase().includes('matrimonio')
      );
      
      if (tipoTestigoMatrimonio) {
        const idTipo = this.obtenerIdTipoTestigoPadrino(tipoTestigoMatrimonio);
        if (idTipo) {
          if (this.testigo1Matrimonio) {
            testigosPadrinos.push({
              id_feligres: this.testigo1Matrimonio.id_feligres,
              id_tipo_testigo_padrino: idTipo,
              numero_orden: 1
            });
          }
          if (this.testigo2Matrimonio) {
            testigosPadrinos.push({
              id_feligres: this.testigo2Matrimonio.id_feligres,
              id_tipo_testigo_padrino: idTipo,
              numero_orden: 2
            });
          }
        }
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
        ],
        testigos_padrinos: testigosPadrinos.length > 0 ? testigosPadrinos : []
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
      participantes: asignacion.participantes,
      testigos_padrinos: asignacion.testigos_padrinos
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
    
    // Limpiar padrinos/testigos
    this.padrino1Bautizo = null;
    this.padrino2Bautizo = null;
    this.padrino1Confirmacion = null;
    this.padrino2Confirmacion = null;
    this.testigo1Matrimonio = null;
    this.testigo2Matrimonio = null;
    
    this.controladorPadrino1Bautizo.setValue('');
    this.controladorPadrino2Bautizo.setValue('');
    this.controladorPadrino1Confirmacion.setValue('');
    this.controladorPadrino2Confirmacion.setValue('');
    this.controladorTestigo1Matrimonio.setValue('');
    this.controladorTestigo2Matrimonio.setValue('');
    
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
    
    // Limpiar padrinos/testigos del modal
    this.padrino1ModalBautizo = null;
    this.padrino2ModalBautizo = null;
    this.padrino1ModalConfirmacion = null;
    this.padrino2ModalConfirmacion = null;
    this.testigo1ModalMatrimonio = null;
    this.testigo2ModalMatrimonio = null;
    
    this.controladorPadrino1ModalBautizo.setValue('');
    this.controladorPadrino2ModalBautizo.setValue('');
    this.controladorPadrino1ModalConfirmacion.setValue('');
    this.controladorPadrino2ModalConfirmacion.setValue('');
    this.controladorTestigo1ModalMatrimonio.setValue('');
    this.controladorTestigo2ModalMatrimonio.setValue('');
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
    
    // Cargar padrinos si existen
    console.log('📋 Tipos de testigos/padrinos disponibles:', this.tiposTestigoPadrino);
    console.log('📋 Testigos/padrinos en asignación:', asignacion.testigos_padrinos);
    
    if (asignacion.testigos_padrinos && asignacion.testigos_padrinos.length > 0) {
      // Buscar tipo de padrino para bautizo (ID = 1 según la base de datos)
      // Intentar primero por ID directo, luego por nombre
      let tipoPadrinoBautizo = this.tiposTestigoPadrino.find(t => {
        const id = this.obtenerIdTipoTestigoPadrino(t);
        return id === 1;
      });
      
      // Si no se encuentra por ID, buscar por nombre
      if (!tipoPadrinoBautizo) {
        tipoPadrinoBautizo = this.tiposTestigoPadrino.find(t => 
          t.nombre.toLowerCase().includes('padrino') && t.nombre.toLowerCase().includes('bautizo')
        );
      }
      
      console.log('🔍 Tipo padrino bautizo encontrado:', tipoPadrinoBautizo);
      console.log('🔍 Total tipos disponibles:', this.tiposTestigoPadrino.length);
      
      if (tipoPadrinoBautizo) {
        const idTipoPadrino = this.obtenerIdTipoTestigoPadrino(tipoPadrinoBautizo);
        console.log('🔍 ID tipo padrino bautizo:', idTipoPadrino);
        
        // Filtrar padrinos comparando IDs (manejar tanto string como number)
        const padrinos = asignacion.testigos_padrinos.filter(tp => {
          const idTp = typeof tp.id_tipo_testigo_padrino === 'string' 
            ? parseInt(tp.id_tipo_testigo_padrino, 10) 
            : tp.id_tipo_testigo_padrino;
          const idTipo = typeof idTipoPadrino === 'string' 
            ? parseInt(idTipoPadrino, 10) 
            : idTipoPadrino;
          return idTp === idTipo || String(idTp) === String(idTipo);
        });
        
        console.log('📋 Padrinos filtrados (total:', padrinos.length, '):', padrinos);
        console.log('📋 Total feligreses disponibles:', this.feligreses.length);
        
        padrinos.forEach((padrino, index) => {
          console.log(`🔍 Procesando padrino ${index + 1}:`, padrino);
          console.log(`🔍 ID feligres del padrino:`, padrino.id_feligres, '| Tipo:', typeof padrino.id_feligres);
          
          const feligres = this.feligreses.find(f => {
            const idF = typeof f.id_feligres === 'string' ? parseInt(f.id_feligres, 10) : f.id_feligres;
            const idP = typeof padrino.id_feligres === 'string' ? parseInt(padrino.id_feligres, 10) : padrino.id_feligres;
            const match = idF === idP || f.id_feligres === padrino.id_feligres || String(f.id_feligres) === String(padrino.id_feligres);
            if (match) {
              console.log(`✅ Match encontrado: Feligres ID ${f.id_feligres} (${typeof f.id_feligres}) === Padrino ID ${padrino.id_feligres} (${typeof padrino.id_feligres})`);
            }
            return match;
          });
          
          console.log('🔍 Feligres encontrado para padrino:', feligres);
          
          if (feligres) {
            const numeroOrden = padrino.numero_orden || (index + 1);
            console.log(`🔍 Número de orden del padrino: ${numeroOrden}`);
            
            if (numeroOrden === 1 || (padrinos.length === 1 && index === 0)) {
              this.padrino1ModalBautizo = feligres;
              this.controladorPadrino1ModalBautizo.setValue(feligres);
              console.log('✅ Padrino 1 cargado:', feligres.primer_nombre, feligres.primer_apellido);
            } else if (numeroOrden === 2 || (padrinos.length === 2 && index === 1)) {
              this.padrino2ModalBautizo = feligres;
              this.controladorPadrino2ModalBautizo.setValue(feligres);
              console.log('✅ Padrino 2 cargado:', feligres.primer_nombre, feligres.primer_apellido);
            } else {
              console.warn(`⚠️ Número de orden ${numeroOrden} no reconocido para padrino`);
            }
          } else {
            console.warn('⚠️ No se encontró el feligres para padrino con ID:', padrino.id_feligres);
            console.warn('⚠️ IDs de feligreses disponibles:', this.feligreses.map(f => ({ id: f.id_feligres, tipo: typeof f.id_feligres, nombre: `${f.primer_nombre} ${f.primer_apellido}` })));
          }
        });
      } else {
        console.warn('⚠️ No se encontró el tipo de padrino para bautizo');
        console.warn('⚠️ Tipos disponibles:', this.tiposTestigoPadrino.map(t => ({ id: this.obtenerIdTipoTestigoPadrino(t), nombre: t.nombre })));
      }
    } else {
      console.log('ℹ️ No hay testigos/padrinos en esta asignación');
      console.log('ℹ️ asignacion.testigos_padrinos:', asignacion.testigos_padrinos);
    }
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
    
    // Cargar padrinos si existen
    console.log('📋 Tipos de testigos/padrinos disponibles:', this.tiposTestigoPadrino);
    console.log('📋 Testigos/padrinos en asignación:', asignacion.testigos_padrinos);
    
    if (asignacion.testigos_padrinos && asignacion.testigos_padrinos.length > 0) {
      // Buscar tipo de padrino para confirmación (ID = 2 según la base de datos)
      let tipoPadrinoConfirmacion = this.tiposTestigoPadrino.find(t => {
        const id = this.obtenerIdTipoTestigoPadrino(t);
        return id === 2;
      });
      
      if (!tipoPadrinoConfirmacion) {
        tipoPadrinoConfirmacion = this.tiposTestigoPadrino.find(t => 
          t.nombre.toLowerCase().includes('padrino') && t.nombre.toLowerCase().includes('confirmación')
        );
      }
      
      console.log('🔍 Tipo padrino confirmación encontrado:', tipoPadrinoConfirmacion);
      
      if (tipoPadrinoConfirmacion) {
        const idTipoPadrino = this.obtenerIdTipoTestigoPadrino(tipoPadrinoConfirmacion);
        console.log('🔍 ID tipo padrino confirmación:', idTipoPadrino);
        
        const padrinos = asignacion.testigos_padrinos.filter(tp => {
          const idTp = typeof tp.id_tipo_testigo_padrino === 'string' 
            ? parseInt(tp.id_tipo_testigo_padrino, 10) 
            : tp.id_tipo_testigo_padrino;
          const idTipo = typeof idTipoPadrino === 'string' 
            ? parseInt(idTipoPadrino, 10) 
            : idTipoPadrino;
          return idTp === idTipo || String(idTp) === String(idTipo);
        });
        
        console.log('📋 Padrinos filtrados (total:', padrinos.length, '):', padrinos);
        
        padrinos.forEach((padrino, index) => {
          console.log(`🔍 Procesando padrino ${index + 1}:`, padrino);
          
          const feligres = this.feligreses.find(f => {
            const idF = typeof f.id_feligres === 'string' ? parseInt(f.id_feligres, 10) : f.id_feligres;
            const idP = typeof padrino.id_feligres === 'string' ? parseInt(padrino.id_feligres, 10) : padrino.id_feligres;
            const match = idF === idP || f.id_feligres === padrino.id_feligres || String(f.id_feligres) === String(padrino.id_feligres);
            if (match) {
              console.log(`✅ Match encontrado: Feligres ID ${f.id_feligres} === Padrino ID ${padrino.id_feligres}`);
            }
            return match;
          });
          
          if (feligres) {
            const numeroOrden = padrino.numero_orden || (index + 1);
            if (numeroOrden === 1 || (padrinos.length === 1 && index === 0)) {
              this.padrino1ModalConfirmacion = feligres;
              this.controladorPadrino1ModalConfirmacion.setValue(feligres);
              console.log('✅ Padrino 1 cargado:', feligres.primer_nombre, feligres.primer_apellido);
            } else if (numeroOrden === 2 || (padrinos.length === 2 && index === 1)) {
              this.padrino2ModalConfirmacion = feligres;
              this.controladorPadrino2ModalConfirmacion.setValue(feligres);
              console.log('✅ Padrino 2 cargado:', feligres.primer_nombre, feligres.primer_apellido);
            }
          } else {
            console.warn('⚠️ No se encontró el feligres para padrino con ID:', padrino.id_feligres);
          }
        });
      } else {
        console.warn('⚠️ No se encontró el tipo de padrino para confirmación');
      }
    } else {
      console.log('ℹ️ No hay testigos/padrinos en esta asignación');
    }
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
    
    // Cargar testigos si existen
    console.log('📋 Tipos de testigos/padrinos disponibles:', this.tiposTestigoPadrino);
    console.log('📋 Testigos/padrinos en asignación:', asignacion.testigos_padrinos);
    
    if (asignacion.testigos_padrinos && asignacion.testigos_padrinos.length > 0) {
      // Buscar tipo de testigo para matrimonio (ID = 3 según la base de datos)
      let tipoTestigoMatrimonio = this.tiposTestigoPadrino.find(t => {
        const id = this.obtenerIdTipoTestigoPadrino(t);
        return id === 3;
      });
      
      if (!tipoTestigoMatrimonio) {
        tipoTestigoMatrimonio = this.tiposTestigoPadrino.find(t => 
          t.nombre.toLowerCase().includes('testigo') && t.nombre.toLowerCase().includes('matrimonio')
        );
      }
      
      console.log('🔍 Tipo testigo matrimonio encontrado:', tipoTestigoMatrimonio);
      
      if (tipoTestigoMatrimonio) {
        const idTipoTestigo = this.obtenerIdTipoTestigoPadrino(tipoTestigoMatrimonio);
        console.log('🔍 ID tipo testigo matrimonio:', idTipoTestigo);
        
        const testigos = asignacion.testigos_padrinos.filter(tp => {
          const idTp = typeof tp.id_tipo_testigo_padrino === 'string' 
            ? parseInt(tp.id_tipo_testigo_padrino, 10) 
            : tp.id_tipo_testigo_padrino;
          const idTipo = typeof idTipoTestigo === 'string' 
            ? parseInt(idTipoTestigo, 10) 
            : idTipoTestigo;
          return idTp === idTipo || String(idTp) === String(idTipo);
        });
        
        console.log('📋 Testigos filtrados (total:', testigos.length, '):', testigos);
        
        testigos.forEach((testigo, index) => {
          console.log(`🔍 Procesando testigo ${index + 1}:`, testigo);
          
          const feligres = this.feligreses.find(f => {
            const idF = typeof f.id_feligres === 'string' ? parseInt(f.id_feligres, 10) : f.id_feligres;
            const idP = typeof testigo.id_feligres === 'string' ? parseInt(testigo.id_feligres, 10) : testigo.id_feligres;
            const match = idF === idP || f.id_feligres === testigo.id_feligres || String(f.id_feligres) === String(testigo.id_feligres);
            if (match) {
              console.log(`✅ Match encontrado: Feligres ID ${f.id_feligres} === Testigo ID ${testigo.id_feligres}`);
            }
            return match;
          });
          
          if (feligres) {
            const numeroOrden = testigo.numero_orden || (index + 1);
            if (numeroOrden === 1 || (testigos.length === 1 && index === 0)) {
              this.testigo1ModalMatrimonio = feligres;
              this.controladorTestigo1ModalMatrimonio.setValue(feligres);
              console.log('✅ Testigo 1 cargado:', feligres.primer_nombre, feligres.primer_apellido);
            } else if (numeroOrden === 2 || (testigos.length === 2 && index === 1)) {
              this.testigo2ModalMatrimonio = feligres;
              this.controladorTestigo2ModalMatrimonio.setValue(feligres);
              console.log('✅ Testigo 2 cargado:', feligres.primer_nombre, feligres.primer_apellido);
            }
          } else {
            console.warn('⚠️ No se encontró el feligres para testigo con ID:', testigo.id_feligres);
          }
        });
      } else {
        console.warn('⚠️ No se encontró el tipo de testigo para matrimonio');
      }
    } else {
      console.log('ℹ️ No hay testigos/padrinos en esta asignación');
    }
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
   * Seleccionar padrinos/testigos en modal
   */
  seleccionarPadrino1ModalBautizo(feligres: Feligres): void {
    this.padrino1ModalBautizo = feligres;
    this.controladorPadrino1ModalBautizo.setValue(feligres);
  }

  seleccionarPadrino2ModalBautizo(feligres: Feligres): void {
    this.padrino2ModalBautizo = feligres;
    this.controladorPadrino2ModalBautizo.setValue(feligres);
  }

  seleccionarPadrino1ModalConfirmacion(feligres: Feligres): void {
    this.padrino1ModalConfirmacion = feligres;
    this.controladorPadrino1ModalConfirmacion.setValue(feligres);
  }

  seleccionarPadrino2ModalConfirmacion(feligres: Feligres): void {
    this.padrino2ModalConfirmacion = feligres;
    this.controladorPadrino2ModalConfirmacion.setValue(feligres);
  }

  seleccionarTestigo1ModalMatrimonio(feligres: Feligres): void {
    this.testigo1ModalMatrimonio = feligres;
    this.controladorTestigo1ModalMatrimonio.setValue(feligres);
  }

  seleccionarTestigo2ModalMatrimonio(feligres: Feligres): void {
    this.testigo2ModalMatrimonio = feligres;
    this.controladorTestigo2ModalMatrimonio.setValue(feligres);
  }

  /**
   * Verificar si se puede guardar el modal de bautizo
   * Permite guardar si el formulario es válido O si solo se cambiaron los padrinos
   */
  puedeGuardarModalBautizo(): boolean {
    if (!this.feligresSeleccionadoModalBautizo || !this.asignacionEditando) {
      return false;
    }
    
    // Si el formulario es válido, se puede guardar
    if (this.formularioModalBautizo.valid) {
      return true;
    }
    
    // Si el formulario no es válido, verificar si solo falta monto_pagado cuando pagado está marcado
    // pero hay cambios en los padrinos
    const formData = this.formularioModalBautizo.value;
    const tieneErrorSoloEnMonto = formData.pagado && 
      this.formularioModalBautizo.get('monto_pagado')?.hasError('required');
    
    // Si solo falta el monto pero hay padrinos seleccionados, permitir guardar
    // (el backend manejará el monto_pagado correctamente)
    if (tieneErrorSoloEnMonto && (this.padrino1ModalBautizo || this.padrino2ModalBautizo)) {
      return true;
    }
    
    return false;
  }

  /**
   * Guardar cambios desde el modal - Bautizo
   */
  guardarModalBautizo(): void {
    if (this.puedeGuardarModalBautizo()) {
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
      
      // Preparar testigos/padrinos
      const testigosPadrinos: any[] = [];
      const tipoPadrinoBautizo = this.tiposTestigoPadrino.find(t => 
        t.nombre.toLowerCase().includes('padrino') && t.nombre.toLowerCase().includes('bautizo')
      );
      
      console.log('🔍 Tipos de testigo/padrino disponibles:', this.tiposTestigoPadrino);
      console.log('🔍 Tipo padrino bautizo encontrado:', tipoPadrinoBautizo);
      
      const idTipoPadrino = this.obtenerIdTipoTestigoPadrino(tipoPadrinoBautizo);
      
      if (!tipoPadrinoBautizo || !idTipoPadrino) {
        console.error('❌ No se encontró el tipo de padrino para bautizo o no tiene id');
        console.error('❌ Tipos disponibles:', this.tiposTestigoPadrino.map(t => ({ nombre: t.nombre, id: this.obtenerIdTipoTestigoPadrino(t) })));
      } else {
        if (this.padrino1ModalBautizo) {
          testigosPadrinos.push({
            id_feligres: this.padrino1ModalBautizo.id_feligres,
            id_tipo_testigo_padrino: idTipoPadrino,
            numero_orden: 1
          });
          console.log('✅ Padrino 1 agregado:', {
            id_feligres: this.padrino1ModalBautizo.id_feligres,
            id_tipo_testigo_padrino: idTipoPadrino,
            numero_orden: 1
          });
        }
        if (this.padrino2ModalBautizo) {
          testigosPadrinos.push({
            id_feligres: this.padrino2ModalBautizo.id_feligres,
            id_tipo_testigo_padrino: idTipoPadrino,
            numero_orden: 2
          });
          console.log('✅ Padrino 2 agregado:', {
            id_feligres: this.padrino2ModalBautizo.id_feligres,
            id_tipo_testigo_padrino: idTipoPadrino,
            numero_orden: 2
          });
        }
      }
      
      console.log('📤 Testigos/padrinos a enviar:', testigosPadrinos);
      
      if (!this.feligresSeleccionadoModalBautizo) {
        this.snackBar.open('Por favor seleccione un feligrés', 'Cerrar', { duration: 3000 });
        return;
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
        }],
        testigos_padrinos: testigosPadrinos.length > 0 ? testigosPadrinos : []
      };

      this.actualizarAsignacion(asignacion, 'Bautizo actualizado correctamente');
    } else {
      this.snackBar.open('Por favor complete todos los campos requeridos', 'Cerrar', { duration: 3000 });
    }
  }

  /**
   * Verificar si se puede guardar el modal de confirmación
   * Permite guardar si el formulario es válido O si solo se cambiaron los padrinos
   */
  puedeGuardarModalConfirmacion(): boolean {
    if (!this.feligresSeleccionadoModalConfirmacion || !this.asignacionEditando) {
      return false;
    }
    
    // Si el formulario es válido, se puede guardar
    if (this.formularioModalConfirmacion.valid) {
      return true;
    }
    
    // Si el formulario no es válido, verificar si solo falta monto_pagado cuando pagado está marcado
    // pero hay cambios en los padrinos
    const formData = this.formularioModalConfirmacion.value;
    const tieneErrorSoloEnMonto = formData.pagado && 
      this.formularioModalConfirmacion.get('monto_pagado')?.hasError('required');
    
    // Si solo falta el monto pero hay padrinos seleccionados, permitir guardar
    if (tieneErrorSoloEnMonto && (this.padrino1ModalConfirmacion || this.padrino2ModalConfirmacion)) {
      return true;
    }
    
    return false;
  }

  /**
   * Guardar cambios desde el modal - Confirmación
   */
  guardarModalConfirmacion(): void {
    if (this.puedeGuardarModalConfirmacion()) {
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
      
      // Preparar testigos/padrinos
      const testigosPadrinos: any[] = [];
      const tipoPadrinoConfirmacion = this.tiposTestigoPadrino.find(t => 
        t.nombre.toLowerCase().includes('padrino') && t.nombre.toLowerCase().includes('confirmación')
      );
      
      if (tipoPadrinoConfirmacion) {
        const idTipo = this.obtenerIdTipoTestigoPadrino(tipoPadrinoConfirmacion);
        if (idTipo) {
          if (this.padrino1ModalConfirmacion) {
            testigosPadrinos.push({
              id_feligres: this.padrino1ModalConfirmacion.id_feligres,
              id_tipo_testigo_padrino: idTipo,
              numero_orden: 1
            });
          }
          if (this.padrino2ModalConfirmacion) {
            testigosPadrinos.push({
              id_feligres: this.padrino2ModalConfirmacion.id_feligres,
              id_tipo_testigo_padrino: idTipo,
              numero_orden: 2
            });
          }
        }
      }
      
      if (!this.feligresSeleccionadoModalConfirmacion) {
        this.snackBar.open('Por favor seleccione un feligrés', 'Cerrar', { duration: 3000 });
        return;
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
        }],
        testigos_padrinos: testigosPadrinos.length > 0 ? testigosPadrinos : []
      };

      this.actualizarAsignacion(asignacion, 'Confirmación actualizada correctamente');
    } else {
      this.snackBar.open('Por favor complete todos los campos requeridos', 'Cerrar', { duration: 3000 });
    }
  }

  /**
   * Verificar si se puede guardar el modal de matrimonio
   * Permite guardar si el formulario es válido O si solo se cambiaron los testigos
   */
  puedeGuardarModalMatrimonio(): boolean {
    if (!this.feligresSeleccionadoModalNovio || !this.feligresSeleccionadoModalNovia || !this.asignacionEditando) {
      return false;
    }
    
    // Si el formulario es válido, se puede guardar
    if (this.formularioModalMatrimonio.valid) {
      return true;
    }
    
    // Si el formulario no es válido, verificar si solo falta monto_pagado cuando pagado está marcado
    // pero hay cambios en los testigos
    const formData = this.formularioModalMatrimonio.value;
    const tieneErrorSoloEnMonto = formData.pagado && 
      this.formularioModalMatrimonio.get('monto_pagado')?.hasError('required');
    
    // Si solo falta el monto pero hay testigos seleccionados, permitir guardar
    if (tieneErrorSoloEnMonto && (this.testigo1ModalMatrimonio || this.testigo2ModalMatrimonio)) {
      return true;
    }
    
    return false;
  }

  /**
   * Guardar cambios desde el modal - Matrimonio
   */
  guardarModalMatrimonio(): void {
    if (this.puedeGuardarModalMatrimonio()) {
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
      
      // Preparar testigos/padrinos
      const testigosPadrinos: any[] = [];
      const tipoTestigoMatrimonio = this.tiposTestigoPadrino.find(t => 
        t.nombre.toLowerCase().includes('testigo') && t.nombre.toLowerCase().includes('matrimonio')
      );
      
      if (tipoTestigoMatrimonio) {
        const idTipo = this.obtenerIdTipoTestigoPadrino(tipoTestigoMatrimonio);
        if (idTipo) {
          if (this.testigo1ModalMatrimonio) {
            testigosPadrinos.push({
              id_feligres: this.testigo1ModalMatrimonio.id_feligres,
              id_tipo_testigo_padrino: idTipo,
              numero_orden: 1
            });
          }
          if (this.testigo2ModalMatrimonio) {
            testigosPadrinos.push({
              id_feligres: this.testigo2ModalMatrimonio.id_feligres,
              id_tipo_testigo_padrino: idTipo,
              numero_orden: 2
            });
          }
        }
      }
      
      if (!this.feligresSeleccionadoModalNovio || !this.feligresSeleccionadoModalNovia) {
        this.snackBar.open('Por favor seleccione novio y novia', 'Cerrar', { duration: 3000 });
        return;
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
        ],
        testigos_padrinos: testigosPadrinos.length > 0 ? testigosPadrinos : []
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
   * Verificar si hay participantes
   */
  tieneParticipantes(): boolean {
    return !!(this.asignacionParaConstancia?.participantes && this.asignacionParaConstancia.participantes.length > 0);
  }

  /**
   * Obtener participantes para el modal
   */
  obtenerParticipantesModal(): any[] {
    return this.asignacionParaConstancia?.participantes || [];
  }

  // ============================================================
  // MÉTODOS PARA CONSTANCIAS
  // ============================================================

  /**
   * Abrir modal para generar constancia
   */
  generarConstancia(asignacion: SacramentoAsignacion): void {
    this.asignacionParaConstancia = asignacion;
    this.mostrarModalConstancia = true;
    this.cargarParrocosActivos();
    this.cargarDatosConstancia();
  }

  /**
   * Cargar párrocos activos
   */
  cargarParrocosActivos(): void {
    this.mantenimientoService.obtenerParrocosActivos().subscribe({
      next: (response) => {
        if (response.ok && response.datos) {
          this.parrocosActivos = response.datos;
        }
      },
      error: (error) => {
        console.error('Error al cargar párrocos:', error);
        this.snackBar.open('Error al cargar párrocos', 'Cerrar', { duration: 3000 });
      }
    });
  }

  /**
   * Cargar datos de constancia existente y datos completos
   */
  cargarDatosConstancia(): void {
    if (!this.asignacionParaConstancia) return;

    // Cargar constancia existente si existe
    this.constanciaService.obtenerConstancia(this.asignacionParaConstancia.id_asignacion).subscribe({
      next: (response) => {
        if (response.ok && response.datos) {
          this.constanciaExistente = response.datos;
          // Llenar formulario con datos existentes
          const fechaConstancia = response.datos.fecha_constancia 
            ? new Date(response.datos.fecha_constancia) 
            : new Date();
          this.formularioConstancia.patchValue({
            id_parroco: response.datos.id_parroco,
            libro: response.datos.libro || '',
            folio: response.datos.folio || '',
            acta: response.datos.acta || '',
            fecha_constancia: fechaConstancia
          });
        } else {
          // Limpiar formulario si no existe constancia
          this.formularioConstancia.reset({
            id_parroco: '',
            libro: '',
            folio: '',
            acta: '',
            fecha_constancia: new Date()
          });
        }
      },
      error: (error) => {
        // Si no existe constancia, es normal que devuelva 404
        if (error.status !== 404) {
          console.error('Error al cargar constancia:', error);
        }
        this.formularioConstancia.reset({
          id_parroco: '',
          libro: '',
          folio: '',
          acta: '',
          fecha_constancia: new Date()
        });
      }
    });

    // Cargar datos completos del feligrés(es)
    this.cargarDatosFeligresCompleto();
  }

  /**
   * Cargar datos completos del feligrés y padrinos
   */
  cargarDatosFeligresCompleto(): void {
    if (!this.asignacionParaConstancia || !this.asignacionParaConstancia.participantes) {
      this.datosFeligresCompleto = null;
      this.datosFeligresCompleto2 = null;
      return;
    }

    const participantes = this.asignacionParaConstancia.participantes;
    
    // Cargar primer participante (bautizo/confirmación) o ambos (matrimonio)
    if (participantes.length > 0 && participantes[0] && participantes[0].id_feligres) {
      this.feligresService.obtenerFeligresPorId(participantes[0].id_feligres).subscribe({
        next: (response) => {
          if (response && response.ok && response.datos) {
            this.datosFeligresCompleto = response.datos;
          }
        },
        error: (error) => {
          console.error('Error al cargar datos del feligrés:', error);
          this.datosFeligresCompleto = null;
        }
      });
    } else {
      this.datosFeligresCompleto = null;
    }

    // Para matrimonio, cargar segundo participante
    if (participantes.length > 1 && participantes[1] && participantes[1].id_feligres && 
        this.asignacionParaConstancia.sacramento_nombre === 'Matrimonio') {
      this.feligresService.obtenerFeligresPorId(participantes[1].id_feligres).subscribe({
        next: (response) => {
          if (response && response.ok && response.datos) {
            this.datosFeligresCompleto2 = response.datos;
          }
        },
        error: (error) => {
          console.error('Error al cargar datos del segundo feligrés:', error);
          this.datosFeligresCompleto2 = null;
        }
      });
    } else {
      this.datosFeligresCompleto2 = null;
    }

    // Cargar padrinos/testigos
    this.cargarDatosPadrinos();
  }

  /**
   * Cargar datos de padrinos/testigos
   */
  cargarDatosPadrinos(): void {
    if (!this.asignacionParaConstancia || !this.asignacionParaConstancia.testigos_padrinos) {
      this.datosPadrinos = [];
      return;
    }

    const testigosPadrinos = this.asignacionParaConstancia.testigos_padrinos;
    this.datosPadrinos = [];

    if (!testigosPadrinos || testigosPadrinos.length === 0) {
      return;
    }

    testigosPadrinos.forEach((tp) => {
      if (tp && tp.id_feligres) {
        this.feligresService.obtenerFeligresPorId(tp.id_feligres).subscribe({
          next: (response) => {
            if (response && response.ok && response.datos) {
              this.datosPadrinos.push(response.datos);
            }
          },
          error: (error) => {
            console.error('Error al cargar datos del padrino/testigo:', error);
            // No agregar nada al array si hay error
          }
        });
      }
    });
  }

  /**
   * Cerrar modal de constancia
   */
  cerrarModalConstancia(): void {
    this.mostrarModalConstancia = false;
    this.asignacionParaConstancia = null;
    this.constanciaExistente = null;
    this.datosFeligresCompleto = null;
    this.datosFeligresCompleto2 = null;
    this.datosPadrinos = [];
    this.formularioConstancia.reset();
  }

  /**
   * Guardar constancia y generar PDF
   */
  guardarConstancia(): void {
    if (!this.formularioConstancia.valid || !this.asignacionParaConstancia) {
      this.snackBar.open('Por favor complete todos los campos requeridos', 'Cerrar', { duration: 3000 });
      return;
    }

    const formData = this.formularioConstancia.value;
    const tipoSacramento = this.obtenerTipoSacramento(this.asignacionParaConstancia.id_sacramento);

    if (!tipoSacramento) {
      this.snackBar.open('Tipo de sacramento no válido', 'Cerrar', { duration: 3000 });
      return;
    }

    // Convertir fecha a string si es Date
    const fechaConstancia = formData.fecha_constancia instanceof Date 
      ? formData.fecha_constancia.toISOString().split('T')[0]
      : formData.fecha_constancia || new Date().toISOString().split('T')[0];

    // Preparar datos JSON
    const datosJson = {
      asignacion: this.asignacionParaConstancia,
      feligres: this.datosFeligresCompleto,
      feligres2: this.datosFeligresCompleto2,
      padrinos: this.datosPadrinos
    };

    // Guardar o actualizar constancia
    let operacion;
    if (this.constanciaExistente) {
      // Actualizar constancia existente
      const constanciaUpdate: ConstanciaUpdate = {
        id_parroco: parseInt(formData.id_parroco),
        libro: formData.libro || null,
        folio: formData.folio || null,
        acta: formData.acta || null,
        fecha_constancia: fechaConstancia,
        datos_json: datosJson
      };
      operacion = this.constanciaService.actualizarConstancia(this.constanciaExistente.id_constancia, constanciaUpdate);
    } else {
      // Crear nueva constancia
      const constanciaData: ConstanciaCreate = {
        id_asignacion: this.asignacionParaConstancia.id_asignacion,
        tipo_sacramento: tipoSacramento,
        id_parroco: parseInt(formData.id_parroco),
        libro: formData.libro || null,
        folio: formData.folio || null,
        acta: formData.acta || null,
        fecha_constancia: fechaConstancia,
        datos_json: datosJson
      };
      operacion = this.constanciaService.crearConstancia(constanciaData);
    }

    operacion.subscribe({
      next: (response) => {
        if (response.ok) {
          this.constanciaExistente = response.datos;
          // Generar PDF
          this.generarPDFConstancia();
        }
      },
      error: (error) => {
        console.error('Error al guardar constancia:', error);
        this.snackBar.open(
          error.error?.mensaje || 'Error al guardar constancia',
          'Cerrar',
          { duration: 3000 }
        );
      }
    });
  }

  /**
   * Obtener tipo de sacramento
   */
  obtenerTipoSacramento(idSacramento: number): 'bautizo' | 'confirmacion' | 'matrimonio' | null {
    const nombre = this.obtenerNombreSacramento(idSacramento).toLowerCase();
    if (nombre.includes('bautizo')) return 'bautizo';
    if (nombre.includes('confirmación') || nombre.includes('confirmacion')) return 'confirmacion';
    if (nombre.includes('matrimonio')) return 'matrimonio';
    return null;
  }

  /**
   * Generar PDF de constancia
   */
  generarPDFConstancia(): void {
    if (!this.asignacionParaConstancia || !this.constanciaExistente) return;

    const tipo = this.constanciaExistente.tipo_sacramento;
    
    switch (tipo) {
      case 'bautizo':
        this.generarPDFBautizo();
        break;
      case 'confirmacion':
        this.generarPDFConfirmacion();
        break;
      case 'matrimonio':
        this.generarPDFMatrimonio();
        break;
    }
  }

  /**
   * Generar PDF de Bautizo
   */
  generarPDFBautizo(): void {
    if (!this.asignacionParaConstancia || !this.constanciaExistente || !this.datosFeligresCompleto) {
      console.error('Error: Faltan datos para generar PDF de bautizo');
      this.snackBar.open('Error: Faltan datos para generar la constancia', 'Cerrar', { duration: 3000 });
      return;
    }

    const doc = new jsPDF();
    const fechaCelebracion = new Date(this.asignacionParaConstancia.fecha_celebracion);
    const fechaConstancia = new Date(this.constanciaExistente.fecha_constancia);
    const parrocoNombre = this.constanciaExistente.parroco_nombre || '';
    const parrocoApellido = this.constanciaExistente.parroco_apellido || '';
    const nombreCompleto = `${this.datosFeligresCompleto?.primer_nombre || ''} ${this.datosFeligresCompleto?.segundo_nombre || ''} ${this.datosFeligresCompleto?.primer_apellido || ''} ${this.datosFeligresCompleto?.segundo_apellido || ''}`.trim();
    const fechaNacimiento = this.datosFeligresCompleto?.fecha_nacimiento ? new Date(this.datosFeligresCompleto.fecha_nacimiento) : null;
    const padrinos = this.datosPadrinos && this.datosPadrinos.length > 0 
      ? this.datosPadrinos.map(p => p ? `${p.primer_nombre || ''} ${p.primer_apellido || ''}` : '').filter(p => p).join(' y ')
      : '';

    let y = 20;
    doc.setFontSize(12);
    doc.text('CONSTANCIA DE BAUTISMO', 105, y, { align: 'center' });
    y += 8;
    doc.setFontSize(10);
    doc.text('DIÓCESIS DE SOLOLÁ Y CHIMALTENANGO', 105, y, { align: 'center' });
    y += 6;
    doc.text('PARROQUIA DE SAN PABLO APÓSTOL, TABLÓN, SOLOLÁ.', 105, y, { align: 'center' });
    y += 10;
    doc.text('El infrascrito párroco hace constar que :', 20, y);
    y += 10;
    doc.text(`Hijo (a) de ${this.datosFeligresCompleto?.nombre_padre || '________________________'} y de ${this.datosFeligresCompleto?.nombre_madre || '__________________________'}`, 20, y);
    y += 6;
    const diaNac = fechaNacimiento ? fechaNacimiento.getDate().toString() : '______';
    const mesNac = fechaNacimiento ? this.obtenerNombreMes(fechaNacimiento.getMonth()) : '*******';
    const anioNac = fechaNacimiento ? fechaNacimiento.getFullYear().toString() : '______';
    doc.text(`Nacido (a) el día ${diaNac} del mes de ${mesNac} del año ${anioNac}`, 20, y);
    y += 6;
    const diaBaut = fechaCelebracion.getDate().toString();
    const mesBaut = this.obtenerNombreMes(fechaCelebracion.getMonth());
    const anioBaut = fechaCelebracion.getFullYear().toString();
    doc.text(`Fue bautizado (a) el día ${diaBaut} del mes de ${mesBaut} del año ${anioBaut}`, 20, y);
    y += 6;
    doc.text(`Sus padrinos son : ${padrinos || '_________________________ y _________________________'}`, 20, y);
    y += 6;
    doc.text(`Según consta en el libro No. ${this.constanciaExistente.libro || '_______'} Folio ${this.constanciaExistente.folio || '______'} Acta No. ${this.constanciaExistente.acta || '________'}`, 20, y);
    y += 6;
    doc.text('Al margen se lee______________________________________________', 20, y);
    y += 10;
    const diaConst = fechaConstancia.getDate().toString();
    const mesConst = this.obtenerNombreMes(fechaConstancia.getMonth());
    const anioConst = fechaConstancia.getFullYear().toString();
    doc.text(`Se extiende la presente constancia en la parroquia de San Pablo Apóstol a los ${diaConst} días del mes de ${mesConst} del año ${anioConst}`, 20, y);
    y += 8;
    doc.text('Doy fe.', 20, y);
    y += 6;
    doc.text('Sello', 20, y);
    y += 8;
    doc.text(`P. ${parrocoNombre} ${parrocoApellido}`, 20, y);
    y += 6;
    doc.text('Párroco', 20, y);

    const nombreArchivo = `Constancia_Bautizo_${nombreCompleto.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
    doc.save(nombreArchivo);
    this.snackBar.open('Constancia de bautizo generada correctamente', 'Cerrar', { duration: 3000 });
  }

  /**
   * Generar PDF de Confirmación
   */
  generarPDFConfirmacion(): void {
    if (!this.asignacionParaConstancia || !this.constanciaExistente || !this.datosFeligresCompleto) {
      console.error('Error: Faltan datos para generar PDF de confirmación');
      this.snackBar.open('Error: Faltan datos para generar la constancia', 'Cerrar', { duration: 3000 });
      return;
    }

    const doc = new jsPDF();
    const fechaCelebracion = new Date(this.asignacionParaConstancia.fecha_celebracion);
    const fechaConstancia = new Date(this.constanciaExistente.fecha_constancia);
    const parrocoNombre = this.constanciaExistente.parroco_nombre || '';
    const parrocoApellido = this.constanciaExistente.parroco_apellido || '';
    const nombreCompleto = `${this.datosFeligresCompleto?.primer_nombre || ''} ${this.datosFeligresCompleto?.segundo_nombre || ''} ${this.datosFeligresCompleto?.primer_apellido || ''} ${this.datosFeligresCompleto?.segundo_apellido || ''}`.trim();
    const fechaNacimiento = this.datosFeligresCompleto?.fecha_nacimiento ? new Date(this.datosFeligresCompleto.fecha_nacimiento) : null;
    const edad = fechaNacimiento ? this.calcularEdad(fechaNacimiento, fechaCelebracion) : '______';
    const padrinos = this.datosPadrinos && this.datosPadrinos.length > 0 
      ? this.datosPadrinos.map(p => p ? `${p.primer_nombre || ''} ${p.primer_apellido || ''}` : '').filter(p => p).join(' y ')
      : '';

    let y = 20;
    doc.setFontSize(12);
    doc.text('PARROQUIA "SAN PABLO APÓSTOL", TABLÓN', 105, y, { align: 'center' });
    y += 6;
    doc.setFontSize(10);
    doc.text('DIOCESIS DE SOLOLÀ-CHIMALTENANGO', 105, y, { align: 'center' });
    y += 8;
    doc.setFontSize(12);
    doc.text('CONSTANCIA DE CONFIRMACIÓN', 105, y, { align: 'center' });
    y += 10;
    doc.setFontSize(10);
    doc.text('En la parroquia de San Pablo Apóstol, tablón, Sololà.', 20, y);
    y += 8;
    const dia = fechaCelebracion.getDate().toString();
    const mes = this.obtenerNombreMes(fechaCelebracion.getMonth());
    const anio = fechaCelebracion.getFullYear().toString();
    doc.text(`El día ${dia} de ${mes} de ${anio}`, 20, y);
    y += 6;
    doc.text(`En el libro No. ${this.constanciaExistente.libro || '***********************'} Folio ${this.constanciaExistente.folio || '***********************'}`, 20, y);
    y += 6;
    doc.text('El excmo. Monseñor ( o delegado )_____________________________________________', 20, y);
    y += 6;
    doc.text('Confirió el Sacramento de la Confirmación a:', 20, y);
    y += 8;
    doc.text(nombreCompleto, 20, y);
    y += 8;
    doc.text(`De ${edad} años de edad; bautizado en la parroquia: ${this.datosFeligresCompleto?.comunidad_nombre || '_________________________'}`, 20, y);
    y += 6;
    doc.text(`Hijo (a) de ${this.datosFeligresCompleto?.nombre_padre || '______________________________'} y de ${this.datosFeligresCompleto?.nombre_madre || '______________________________'}`, 20, y);
    y += 6;
    doc.text(`Fueron sus padrinos: ${padrinos || '________________________________________________________'}.`, 20, y);
    y += 10;
    const diaConst = fechaConstancia.getDate().toString();
    const mesConst = this.obtenerNombreMes(fechaConstancia.getMonth());
    const anioConst = fechaConstancia.getFullYear().toString();
    doc.text(`Tablón a los ${diaConst} días del mes de ${mesConst} del año ${anioConst}`, 20, y);
    y += 8;
    doc.text('F.______________________________', 20, y);
    y += 6;
    doc.text(`P. ${parrocoNombre} ${parrocoApellido}`, 20, y);

    const nombreArchivo = `Constancia_Confirmacion_${nombreCompleto.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
    doc.save(nombreArchivo);
    this.snackBar.open('Constancia de confirmación generada correctamente', 'Cerrar', { duration: 3000 });
  }

  /**
   * Generar PDF de Matrimonio
   */
  generarPDFMatrimonio(): void {
    if (!this.asignacionParaConstancia || !this.constanciaExistente || !this.datosFeligresCompleto) {
      console.error('Error: Faltan datos para generar PDF de matrimonio');
      this.snackBar.open('Error: Faltan datos para generar la constancia', 'Cerrar', { duration: 3000 });
      return;
    }
    
    if (!this.datosFeligresCompleto2) {
      console.error('Error: Falta el segundo feligrés para generar PDF de matrimonio');
      this.snackBar.open('Error: Faltan datos del segundo participante', 'Cerrar', { duration: 3000 });
      return;
    }

    const doc = new jsPDF();
    const fechaCelebracion = new Date(this.asignacionParaConstancia.fecha_celebracion);
    const fechaConstancia = new Date(this.constanciaExistente.fecha_constancia);
    const parrocoNombre = this.constanciaExistente.parroco_nombre || '';
    const parrocoApellido = this.constanciaExistente.parroco_apellido || '';
    const novio = this.datosFeligresCompleto;
    const novia = this.datosFeligresCompleto2;
    const nombreNovio = novio ? `${novio.primer_nombre || ''} ${novio.segundo_nombre || ''} ${novio.primer_apellido || ''} ${novio.segundo_apellido || ''}`.trim() : '';
    const nombreNovia = novia ? `${novia.primer_nombre || ''} ${novia.segundo_nombre || ''} ${novia.primer_apellido || ''} ${novia.segundo_apellido || ''}`.trim() : '';
    const testigos = this.datosPadrinos && this.datosPadrinos.length > 0 
      ? this.datosPadrinos.map(p => p ? `${p.primer_nombre || ''} ${p.primer_apellido || ''}` : '').filter(p => p).join(' Y ')
      : '';

    let y = 20;
    doc.setFontSize(12);
    doc.text('PARROQUIA SAN PABLO APÓSTOL, TABLON', 105, y, { align: 'center' });
    y += 6;
    doc.setFontSize(10);
    doc.text('Diòcesis de Sololà-Chimaltenango.', 105, y, { align: 'center' });
    y += 10;
    doc.setFontSize(12);
    doc.text('CERTIFICO:', 20, y);
    y += 8;
    doc.setFontSize(10);
    doc.text('Que conforme consta en el libro de actas matrimoniales de esta parroquia, se encuentra registrados en el:', 20, y);
    y += 6;
    doc.text(`Libro No. ${this.constanciaExistente.libro || '______'} Folio No. ${this.constanciaExistente.folio || '________'} Acta No. ${this.constanciaExistente.acta || '______'}`, 20, y);
    y += 6;
    const dia = fechaCelebracion.getDate().toString();
    const mes = this.obtenerNombreMes(fechaCelebracion.getMonth());
    const anio = fechaCelebracion.getFullYear().toString();
    doc.text(`El día ${dia} del mes de ${mes} del año ${anio}`, 20, y);
    y += 8;
    doc.setFontSize(12);
    doc.text('CONTRAJERON MATRIMONIO CANÓNICO :', 20, y);
    y += 6;
    doc.setFontSize(10);
    doc.text(`${nombreNovio} Y ${nombreNovia}`, 20, y);
    y += 8;
    doc.setFontSize(12);
    doc.text('ASISTIENDO COMO TESTIGOS:', 20, y);
    y += 6;
    doc.setFontSize(10);
    doc.text(`${testigos || '__________________________ Y ______________________________'}`, 20, y);
    y += 10;
    const diaConst = fechaConstancia.getDate().toString();
    const mesConst = this.obtenerNombreMes(fechaConstancia.getMonth());
    const anioConst = fechaConstancia.getFullYear().toString();
    doc.text(`Para que así conste y convenga, firmo y sello en la parroquia a los ${diaConst} días del mes ${mesConst} del año ${anioConst}`, 20, y);
    y += 8;
    doc.text('F. _____________________', 20, y);
    y += 6;
    doc.text('Pàrroco.', 20, y);
    y += 6;
    doc.text(`P. ${parrocoNombre} ${parrocoApellido}`, 20, y);

    const nombreArchivo = `Constancia_Matrimonio_${nombreNovio.replace(/\s+/g, '_')}_${nombreNovia.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
    doc.save(nombreArchivo);
    this.snackBar.open('Constancia de matrimonio generada correctamente', 'Cerrar', { duration: 3000 });
  }

  /**
   * Obtener nombre del mes en español
   */
  obtenerNombreMes(mes: number): string {
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                   'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return meses[mes] || '';
  }

  /**
   * Calcular edad
   */
  calcularEdad(fechaNacimiento: Date, fechaReferencia: Date): number {
    let edad = fechaReferencia.getFullYear() - fechaNacimiento.getFullYear();
    const mes = fechaReferencia.getMonth() - fechaNacimiento.getMonth();
    if (mes < 0 || (mes === 0 && fechaReferencia.getDate() < fechaNacimiento.getDate())) {
      edad--;
    }
    return edad;
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
