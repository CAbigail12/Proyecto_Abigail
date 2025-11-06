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
import { Router } from '@angular/router';
import { MantenimientoService } from '../../../services/mantenimiento.service';
import { Comunidad, ComunidadCreate, ComunidadUpdate, FiltrosGenerales } from '../../../models/mantenimiento.model';

@Component({
  selector: 'app-comunidades',
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
    MatChipsModule
  ],
  templateUrl: './comunidades.component.html',
  styleUrls: ['./comunidades.component.css']
})
export class ComunidadesComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['id_comunidad', 'nombre', 'descripcion', 'activo', 'created_at', 'acciones'];
  dataSource = new MatTableDataSource<Comunidad>();
  
  loading = false;
  totalComunidades = 0;
  currentPage = 1;
  pageSize = 10;
  
  // Filtros
  filtros: FiltrosGenerales = {
    busqueda: '',
    activo: '',
    pagina: 1,
    limite: 10
  };

  // Formulario para crear/editar comunidad
  comunidadForm: FormGroup;
  editMode = false;
  selectedComunidad: Comunidad | null = null;
  mostrarDialogo = false;

  // Modal de confirmación de eliminación
  mostrarModalEliminar = false;
  comunidadAEliminar: Comunidad | null = null;

  constructor(
    private mantenimientoService: MantenimientoService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.comunidadForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      descripcion: ['', [Validators.maxLength(255)]],
      activo: [true]
    });
  }

  ngOnInit(): void {
    this.cargarComunidades();
  }

  ngAfterViewInit() {
    // NO asignar paginator al dataSource cuando usamos paginación del servidor
    // this.dataSource.paginator = this.paginator; // ❌ REMOVIDO - causa conflictos
    this.dataSource.sort = this.sort;
    
    // Configurar paginator manualmente para paginación del servidor
    if (this.paginator) {
      this.paginator.pageIndex = this.currentPage - 1;
      this.paginator.pageSize = this.pageSize;
      this.paginator.length = this.totalComunidades;
    }
  }

  cargarComunidades(): void {
    this.loading = true;
    
    this.mantenimientoService.obtenerComunidades(this.filtros)
      .subscribe({
        next: (response) => {
          if (response.ok) {
            this.dataSource.data = response.datos.datos;
            this.totalComunidades = response.datos.paginacion.total;
            
            // Actualizar paginator después de cargar datos
            if (this.paginator) {
              this.paginator.length = this.totalComunidades;
              this.paginator.pageIndex = this.currentPage - 1;
              this.paginator.pageSize = this.pageSize;
            }
            
            this.loading = false;
          }
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open('Error al cargar comunidades', 'Cerrar', {
            duration: 3000
          });
        }
      });
  }

  aplicarFiltros(): void {
    this.currentPage = 1;
    this.filtros.pagina = this.currentPage;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    this.cargarComunidades();
  }

  limpiarFiltros(): void {
    this.filtros = {
      busqueda: '',
      activo: '',
      pagina: 1,
      limite: 10
    };
    this.aplicarFiltros();
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.filtros.pagina = this.currentPage;
    this.filtros.limite = this.pageSize;
    this.cargarComunidades();
  }

  abrirDialogoComunidad(comunidad?: Comunidad): void {
    this.editMode = !!comunidad;
    this.selectedComunidad = comunidad || null;
    this.mostrarDialogo = true;
    
    if (comunidad) {
      // Modo edición
      this.comunidadForm.patchValue({
        nombre: comunidad.nombre,
        descripcion: comunidad.descripcion || '',
        activo: comunidad.activo
      });
    } else {
      // Modo creación
      this.comunidadForm.reset({
        activo: true
      });
    }
  }

  guardarComunidad(): void {
    if (this.comunidadForm.valid) {
      const formData = this.comunidadForm.value;
      
      if (this.editMode && this.selectedComunidad) {
        // Actualizar comunidad
        const updateData: ComunidadUpdate = {
          nombre: formData.nombre,
          descripcion: formData.descripcion || null,
          activo: formData.activo
        };
        
        this.mantenimientoService.actualizarComunidad(this.selectedComunidad.id_comunidad, updateData)
          .subscribe({
            next: (response) => {
              if (response.ok) {
                this.snackBar.open('Comunidad actualizada correctamente', 'Cerrar', {
                  duration: 3000
                });
                this.cargarComunidades();
                this.cerrarDialogo();
              }
            },
            error: (error) => {
              this.snackBar.open(error.error?.mensaje || 'Error al actualizar comunidad', 'Cerrar', {
                duration: 3000
              });
            }
          });
      } else {
        // Crear comunidad
        const newComunidad: ComunidadCreate = {
          nombre: formData.nombre,
          descripcion: formData.descripcion || null,
          activo: formData.activo
        };
        
        this.mantenimientoService.crearComunidad(newComunidad)
          .subscribe({
            next: (response) => {
              if (response.ok) {
                this.snackBar.open('Comunidad creada correctamente', 'Cerrar', {
                  duration: 3000
                });
                this.cargarComunidades();
                this.cerrarDialogo();
              }
            },
            error: (error) => {
              this.snackBar.open(error.error?.mensaje || 'Error al crear comunidad', 'Cerrar', {
                duration: 3000
              });
            }
          });
      }
    }
  }

  eliminarComunidad(comunidad: Comunidad): void {
    this.comunidadAEliminar = comunidad;
    this.mostrarModalEliminar = true;
  }

  cerrarModalEliminar(): void {
    this.mostrarModalEliminar = false;
    this.comunidadAEliminar = null;
  }

  confirmarEliminacion(): void {
    if (!this.comunidadAEliminar) {
      return;
    }

    this.loading = true;
    this.mantenimientoService.eliminarComunidad(this.comunidadAEliminar.id_comunidad)
      .subscribe({
        next: (response) => {
          if (response.ok) {
            this.snackBar.open('Comunidad eliminada correctamente', 'Cerrar', {
              duration: 3000
            });
            this.cargarComunidades();
            this.cerrarModalEliminar();
          }
          this.loading = false;
        },
        error: (error) => {
          this.snackBar.open(error.error?.mensaje || 'Error al eliminar comunidad', 'Cerrar', {
            duration: 3000
          });
          this.loading = false;
        }
      });
  }

  cerrarDialogo(): void {
    this.editMode = false;
    this.selectedComunidad = null;
    this.comunidadForm.reset();
    this.mostrarDialogo = false;
  }

  getEstadoClass(activo: boolean): string {
    return activo ? 'estado-activo' : 'estado-inactivo';
  }

  trackByComunidadId(index: number, comunidad: Comunidad): number {
    return comunidad.id_comunidad;
  }

  goBack(): void {
    this.router.navigate(['/mantenimiento']);
  }
}
