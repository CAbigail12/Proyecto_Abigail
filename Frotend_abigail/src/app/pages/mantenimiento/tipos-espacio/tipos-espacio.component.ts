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
import { TipoEspacio, TipoEspacioCreate, TipoEspacioUpdate, FiltrosGenerales } from '../../../models/mantenimiento.model';

@Component({
  selector: 'app-tipos-espacio',
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
  templateUrl: './tipos-espacio.component.html',
  styleUrls: ['./tipos-espacio.component.css']
})
export class TiposEspacioComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['id_tipo_espacio', 'nombre', 'descripcion', 'activo', 'created_at', 'acciones'];
  dataSource = new MatTableDataSource<TipoEspacio>();
  
  loading = false;
  totalTiposEspacio = 0;
  currentPage = 1;
  pageSize = 10;
  
  // Filtros
  filtros: FiltrosGenerales = {
    busqueda: '',
    activo: '',
    pagina: 1,
    limite: 10
  };

  // Formulario para crear/editar tipo de espacio
  tipoEspacioForm: FormGroup;
  editMode = false;
  selectedTipoEspacio: TipoEspacio | null = null;
  mostrarDialogo = false;

  // Modal de confirmación de eliminación
  mostrarModalEliminar = false;
  tipoEspacioAEliminar: TipoEspacio | null = null;

  constructor(
    private mantenimientoService: MantenimientoService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.tipoEspacioForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      descripcion: ['', [Validators.maxLength(255)]],
      activo: [true]
    });
  }

  ngOnInit(): void {
    this.cargarTiposEspacio();
  }

  ngAfterViewInit() {
    // NO asignar paginator al dataSource cuando usamos paginación del servidor
    // this.dataSource.paginator = this.paginator; // ❌ REMOVIDO - causa conflictos
    this.dataSource.sort = this.sort;
    
    // Configurar paginator manualmente para paginación del servidor
    if (this.paginator) {
      this.paginator.pageIndex = this.currentPage - 1;
      this.paginator.pageSize = this.pageSize;
      this.paginator.length = this.totalTiposEspacio;
    }
  }

  cargarTiposEspacio(): void {
    this.loading = true;
    
    this.mantenimientoService.obtenerTiposEspacio(this.filtros)
      .subscribe({
        next: (response) => {
          if (response.ok) {
            this.dataSource.data = response.datos.datos;
            this.totalTiposEspacio = response.datos.paginacion.total;
            
            // Actualizar paginator después de cargar datos
            if (this.paginator) {
              this.paginator.length = this.totalTiposEspacio;
              this.paginator.pageIndex = this.currentPage - 1;
              this.paginator.pageSize = this.pageSize;
            }
            
            this.loading = false;
          }
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open('Error al cargar tipos de espacio', 'Cerrar', {
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
    this.cargarTiposEspacio();
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
    this.cargarTiposEspacio();
  }

  abrirDialogoTipoEspacio(tipoEspacio?: TipoEspacio): void {
    this.editMode = !!tipoEspacio;
    this.selectedTipoEspacio = tipoEspacio || null;
    this.mostrarDialogo = true;
    
    if (tipoEspacio) {
      // Modo edición
      this.tipoEspacioForm.patchValue({
        nombre: tipoEspacio.nombre,
        descripcion: tipoEspacio.descripcion || '',
        activo: tipoEspacio.activo
      });
    } else {
      // Modo creación
      this.tipoEspacioForm.reset({
        activo: true
      });
    }
  }

  guardarTipoEspacio(): void {
    if (this.tipoEspacioForm.valid) {
      const formData = this.tipoEspacioForm.value;
      
      if (this.editMode && this.selectedTipoEspacio) {
        // Actualizar tipo de espacio
        const updateData: TipoEspacioUpdate = {
          nombre: formData.nombre,
          descripcion: formData.descripcion || null,
          activo: formData.activo
        };
        
        this.mantenimientoService.actualizarTipoEspacio(this.selectedTipoEspacio.id_tipo_espacio, updateData)
          .subscribe({
            next: (response) => {
              if (response.ok) {
                this.snackBar.open('Tipo de espacio actualizado correctamente', 'Cerrar', {
                  duration: 3000
                });
                this.cargarTiposEspacio();
                this.cerrarDialogo();
              }
            },
            error: (error) => {
              this.snackBar.open(error.error?.mensaje || 'Error al actualizar tipo de espacio', 'Cerrar', {
                duration: 3000
              });
            }
          });
      } else {
        // Crear tipo de espacio
        const newTipoEspacio: TipoEspacioCreate = {
          nombre: formData.nombre,
          descripcion: formData.descripcion || null,
          activo: formData.activo
        };
        
        this.mantenimientoService.crearTipoEspacio(newTipoEspacio)
          .subscribe({
            next: (response) => {
              if (response.ok) {
                this.snackBar.open('Tipo de espacio creado correctamente', 'Cerrar', {
                  duration: 3000
                });
                this.cargarTiposEspacio();
                this.cerrarDialogo();
              }
            },
            error: (error) => {
              this.snackBar.open(error.error?.mensaje || 'Error al crear tipo de espacio', 'Cerrar', {
                duration: 3000
              });
            }
          });
      }
    }
  }

  eliminarTipoEspacio(tipoEspacio: TipoEspacio): void {
    this.tipoEspacioAEliminar = tipoEspacio;
    this.mostrarModalEliminar = true;
  }

  cerrarModalEliminar(): void {
    this.mostrarModalEliminar = false;
    this.tipoEspacioAEliminar = null;
  }

  confirmarEliminacion(): void {
    if (!this.tipoEspacioAEliminar) {
      return;
    }

    this.loading = true;
    this.mantenimientoService.eliminarTipoEspacio(this.tipoEspacioAEliminar.id_tipo_espacio)
      .subscribe({
        next: (response) => {
          if (response.ok) {
            this.snackBar.open('Tipo de espacio eliminado correctamente', 'Cerrar', {
              duration: 3000
            });
            this.cargarTiposEspacio();
            this.cerrarModalEliminar();
          }
          this.loading = false;
        },
        error: (error) => {
          this.snackBar.open(error.error?.mensaje || 'Error al eliminar tipo de espacio', 'Cerrar', {
            duration: 3000
          });
          this.loading = false;
        }
      });
  }

  cerrarDialogo(): void {
    this.editMode = false;
    this.selectedTipoEspacio = null;
    this.tipoEspacioForm.reset();
    this.mostrarDialogo = false;
  }

  getEstadoClass(activo: boolean): string {
    return activo ? 'estado-activo' : 'estado-inactivo';
  }

  trackByTipoEspacioId(index: number, tipoEspacio: TipoEspacio): number {
    return tipoEspacio.id_tipo_espacio;
  }

  goBack(): void {
    this.router.navigate(['/mantenimiento']);
  }
}
