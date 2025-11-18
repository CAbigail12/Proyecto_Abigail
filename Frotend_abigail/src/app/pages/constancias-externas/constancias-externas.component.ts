import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
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
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Observable, map, startWith, firstValueFrom } from 'rxjs';
import { ConstanciaExternaService } from '../../services/constancia-externa.service';
import { FeligresService } from '../../services/feligres.service';
import { MantenimientoService } from '../../services/mantenimiento.service';
import {
  ConstanciaExterna,
  ConstanciaExternaCreate,
  ConstanciaExternaUpdate,
  FiltrosConstanciaExterna
} from '../../models/constancia-externa.model';
import { Feligres } from '../../models/mantenimiento.model';
import { OpcionSelect } from '../../models/mantenimiento.model';

@Component({
  selector: 'app-constancias-externas',
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
    MatAutocompleteModule,
    MatSnackBarModule
  ],
  templateUrl: './constancias-externas.component.html',
  styleUrls: ['./constancias-externas.component.css']
})
export class ConstanciasExternasComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = [
    'nombre_feligres_completo',
    'nombre_sacramento',
    'libro',
    'folio',
    'descripcion',
    'created_at',
    'acciones'
  ];
  dataSource = new MatTableDataSource<ConstanciaExterna>();

  loading = false;
  totalConstancias = 0;
  currentPage = 1;
  pageSize = 10;

  // Filtros
  filtros: FiltrosConstanciaExterna = {};
  busquedaTexto = '';

  // Formulario para crear/editar constancia externa
  constanciaForm: FormGroup;
  editMode = false;
  selectedConstancia: ConstanciaExterna | null = null;
  mostrarDialogo = false;

  // Modal de confirmación de eliminación
  mostrarModalEliminar = false;
  constanciaAEliminar: ConstanciaExterna | null = null;

  // Opciones para selects
  sacramentosPermitidos: OpcionSelect[] = [
    { id: 1, nombre: 'Bautizo' },
    { id: 3, nombre: 'Confirmación' }
  ];

  // Autocomplete para feligrés
  feligreses: Feligres[] = [];
  controladorFeligres = this.fb.control<Feligres | string>('');
  feligresesFiltrados: Observable<Feligres[]> = new Observable();

  constructor(
    private constanciaExternaService: ConstanciaExternaService,
    private feligresService: FeligresService,
    private mantenimientoService: MantenimientoService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.constanciaForm = this.fb.group({
      id_feligres: [null, Validators.required],
      id_sacramento: [null, [Validators.required, Validators.pattern(/^(1|3)$/)]],
      libro: ['', [Validators.required, Validators.maxLength(50)]],
      folio: ['', [Validators.required, Validators.maxLength(50)]],
      descripcion: ['', Validators.maxLength(255)]
    });
  }

  ngOnInit(): void {
    this.cargarConstancias();
    this.cargarFeligreses();
    this.configurarAutocomplete();
  }

  /**
   * Obtener nombre completo del feligrés
   */
  getNombreCompleto(feligres: Feligres): string {
    if (!feligres) return '';
    const partes = [
      feligres.primer_nombre,
      feligres.segundo_nombre,
      feligres.primer_apellido,
      feligres.segundo_apellido
    ].filter(p => p && p.trim() !== '');
    return partes.join(' ').trim();
  }

  /**
   * Configurar autocomplete para feligrés
   */
  configurarAutocomplete(): void {
    this.feligresesFiltrados = this.controladorFeligres.valueChanges.pipe(
      startWith(''),
      map(value => {
        // Si el valor es un objeto Feligres, no filtrar (ya está seleccionado)
        if (value && typeof value === 'object' && 'id_feligres' in value) {
          return this.feligreses;
        }
        // Si es string, filtrar
        const nombre = typeof value === 'string' ? value : '';
        return nombre ? this.filtrarFeligreses(nombre) : this.feligreses.slice();
      })
    );
  }

  /**
   * Filtrar feligreses por nombre
   */
  filtrarFeligreses(nombre: string): Feligres[] {
    const filtro = nombre.toLowerCase();
    return this.feligreses.filter(feligres => {
      const nombreCompleto = this.getNombreCompleto(feligres).toLowerCase();
      return nombreCompleto.includes(filtro) ||
        feligres.primer_nombre?.toLowerCase().includes(filtro) ||
        feligres.primer_apellido?.toLowerCase().includes(filtro);
    });
  }

  /**
   * Mostrar nombre del feligrés en el autocomplete
   * Función arrow para mantener el contexto de 'this'
   */
  mostrarNombreFeligres = (feligres: Feligres | null | string): string => {
    if (!feligres || typeof feligres === 'string') {
      return feligres || '';
    }
    return this.getNombreCompleto(feligres);
  }

  /**
   * Seleccionar feligrés del autocomplete
   */
  seleccionarFeligres(feligres: Feligres): void {
    this.constanciaForm.patchValue({ id_feligres: feligres.id_feligres });
  }

  /**
   * Cargar feligreses para el autocomplete
   */
  cargarFeligreses(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.feligresService.obtenerFeligreses({ activo: 'true', pagina: 1, limite: 1000 }).subscribe({
        next: (response) => {
          if (response.ok && response.datos && response.datos.datos) {
            this.feligreses = response.datos.datos;
            resolve();
          } else {
            resolve();
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
   * Cargar constancias externas
   */
  cargarConstancias(): void {
    this.loading = true;
    const filtros: FiltrosConstanciaExterna = {};
    
    if (this.busquedaTexto) {
      filtros.busqueda = this.busquedaTexto;
    }

    this.constanciaExternaService
      .obtenerConstanciasExternas(filtros, { pagina: this.currentPage, limite: this.pageSize })
      .subscribe({
        next: (response) => {
          if (response.ok && response.datos) {
            this.dataSource.data = response.datos;
            this.totalConstancias = response.paginacion?.total || 0;
          } else {
            this.dataSource.data = [];
            this.totalConstancias = 0;
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar constancias externas:', error);
          this.snackBar.open('Error al cargar constancias externas', 'Cerrar', { duration: 3000 });
          this.loading = false;
        }
      });
  }

  /**
   * Manejar cambio de página
   */
  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.cargarConstancias();
  }

  /**
   * Buscar constancias
   */
  buscar(): void {
    this.currentPage = 1;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    this.cargarConstancias();
  }

  /**
   * Limpiar búsqueda
   */
  limpiarBusqueda(): void {
    this.busquedaTexto = '';
    this.currentPage = 1;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    this.cargarConstancias();
  }

  /**
   * Abrir modal para crear nueva constancia
   */
  abrirModalCrear(): void {
    this.editMode = false;
    this.selectedConstancia = null;
    this.constanciaForm.reset();
    this.controladorFeligres.setValue('');
    this.mostrarDialogo = true;
  }

  /**
   * Abrir modal para editar constancia
   */
  async abrirModalEditar(constancia: ConstanciaExterna): Promise<void> {
    this.editMode = true;
    this.selectedConstancia = constancia;
    
    // Asegurarse de que los feligreses estén cargados
    if (this.feligreses.length === 0) {
      try {
        await this.cargarFeligreses();
      } catch (error) {
        console.error('Error al cargar feligreses:', error);
      }
    }

    // Cargar datos en el formulario
    this.constanciaForm.patchValue({
      id_feligres: constancia.id_feligres,
      id_sacramento: Number(constancia.id_sacramento), // Asegurar que sea número
      libro: constancia.libro,
      folio: constancia.folio,
      descripcion: constancia.descripcion || ''
    });

    // Buscar el feligrés correspondiente
    let feligres = this.feligreses.find(f => f.id_feligres === constancia.id_feligres);
    
    if (!feligres) {
      // Si no está en la lista, cargarlo desde el backend
      try {
        const response = await firstValueFrom(this.feligresService.obtenerFeligresPorId(constancia.id_feligres));
        if (response && response.ok && response.datos) {
          feligres = response.datos;
          // Agregar a la lista si no existe
          if (!this.feligreses.find(f => f.id_feligres === feligres!.id_feligres)) {
            this.feligreses.push(feligres);
          }
        }
      } catch (error) {
        console.error('Error al cargar feligrés:', error);
      }
    }

    // Abrir el modal primero
    this.mostrarDialogo = true;

    // Configurar el autocomplete con el feligrés después de que el modal se abra
    if (feligres) {
      // Usar setTimeout para asegurar que el autocomplete se actualice después de que el modal se renderice
      setTimeout(() => {
        this.controladorFeligres.setValue(feligres!);
        // Forzar detección de cambios
        this.constanciaForm.updateValueAndValidity();
      }, 200);
    } else {
      this.controladorFeligres.setValue('');
    }
  }

  /**
   * Cerrar modal
   */
  cerrarModal(): void {
    this.mostrarDialogo = false;
    this.editMode = false;
    this.selectedConstancia = null;
    this.constanciaForm.reset();
    this.controladorFeligres.setValue('');
  }

  /**
   * Guardar constancia (crear o actualizar)
   */
  guardarConstancia(): void {
    if (this.constanciaForm.invalid) {
      this.snackBar.open('Por favor complete todos los campos requeridos', 'Cerrar', { duration: 3000 });
      return;
    }

    const formData = this.constanciaForm.value;

    if (this.editMode && this.selectedConstancia) {
      // Actualizar
      const datos: ConstanciaExternaUpdate = {
        id_feligres: formData.id_feligres,
        id_sacramento: formData.id_sacramento,
        libro: formData.libro.trim(),
        folio: formData.folio.trim(),
        descripcion: formData.descripcion?.trim() || null
      };

      this.constanciaExternaService.actualizarConstanciaExterna(this.selectedConstancia.id_constancia_externa, datos).subscribe({
        next: (response) => {
          if (response.ok) {
            this.snackBar.open('Constancia externa actualizada correctamente', 'Cerrar', { duration: 3000 });
            this.cerrarModal();
            this.cargarConstancias();
          }
        },
        error: (error) => {
          console.error('Error al actualizar constancia externa:', error);
          this.snackBar.open(
            error.error?.mensaje || 'Error al actualizar constancia externa',
            'Cerrar',
            { duration: 3000 }
          );
        }
      });
    } else {
      // Crear
      const datos: ConstanciaExternaCreate = {
        id_feligres: formData.id_feligres,
        id_sacramento: formData.id_sacramento,
        libro: formData.libro.trim(),
        folio: formData.folio.trim(),
        descripcion: formData.descripcion?.trim() || null
      };

      this.constanciaExternaService.crearConstanciaExterna(datos).subscribe({
        next: (response) => {
          if (response.ok) {
            this.snackBar.open('Constancia externa creada correctamente', 'Cerrar', { duration: 3000 });
            this.cerrarModal();
            this.cargarConstancias();
          }
        },
        error: (error) => {
          console.error('Error al crear constancia externa:', error);
          this.snackBar.open(
            error.error?.mensaje || 'Error al crear constancia externa',
            'Cerrar',
            { duration: 3000 }
          );
        }
      });
    }
  }

  /**
   * Abrir modal de confirmación de eliminación
   */
  abrirModalEliminar(constancia: ConstanciaExterna): void {
    this.constanciaAEliminar = constancia;
    this.mostrarModalEliminar = true;
  }

  /**
   * Cerrar modal de eliminación
   */
  cerrarModalEliminar(): void {
    this.mostrarModalEliminar = false;
    this.constanciaAEliminar = null;
  }

  /**
   * Confirmar eliminación
   */
  confirmarEliminar(): void {
    if (!this.constanciaAEliminar) return;

    this.constanciaExternaService.eliminarConstanciaExterna(this.constanciaAEliminar.id_constancia_externa).subscribe({
      next: (response) => {
        if (response.ok) {
          this.snackBar.open('Constancia externa eliminada correctamente', 'Cerrar', { duration: 3000 });
          this.cerrarModalEliminar();
          this.cargarConstancias();
        }
      },
      error: (error) => {
        console.error('Error al eliminar constancia externa:', error);
        this.snackBar.open(
          error.error?.mensaje || 'Error al eliminar constancia externa',
          'Cerrar',
          { duration: 3000 }
        );
      }
    });
  }

  /**
   * Formatear fecha
   */
  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-GT');
  }
}

