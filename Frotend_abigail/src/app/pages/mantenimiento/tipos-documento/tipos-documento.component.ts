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
import { TipoDocumento, TipoDocumentoCreate, TipoDocumentoUpdate, FiltrosGenerales } from '../../../models/mantenimiento.model';

@Component({
  selector: 'app-tipos-documento',
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
  templateUrl: './tipos-documento.component.html',
  styleUrls: ['./tipos-documento.component.css']
})
export class TiposDocumentoComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['id_tipo_documento', 'nombre', 'descripcion', 'activo', 'created_at', 'acciones'];
  dataSource = new MatTableDataSource<TipoDocumento>();
  
  loading = false;
  totalTiposDocumento = 0;
  currentPage = 1;
  pageSize = 10;
  
  // Filtros
  filtros: FiltrosGenerales = {
    busqueda: '',
    activo: '',
    pagina: 1,
    limite: 10
  };

  // Formulario para crear/editar tipo de documento
  tipoDocumentoForm: FormGroup;
  editMode = false;
  selectedTipoDocumento: TipoDocumento | null = null;
  mostrarDialogo = false;

  // Modal de confirmación de eliminación
  mostrarModalEliminar = false;
  tipoDocumentoAEliminar: TipoDocumento | null = null;

  constructor(
    private mantenimientoService: MantenimientoService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.tipoDocumentoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
      descripcion: ['', [Validators.maxLength(255)]],
      activo: [true]
    });
  }

  ngOnInit(): void {
    this.cargarTiposDocumento();
  }

  ngAfterViewInit() {
    // NO asignar paginator al dataSource cuando usamos paginación del servidor
    // this.dataSource.paginator = this.paginator; // ❌ REMOVIDO - causa conflictos
    this.dataSource.sort = this.sort;
    
    // Configurar paginator manualmente para paginación del servidor
    if (this.paginator) {
      this.paginator.pageIndex = this.currentPage - 1;
      this.paginator.pageSize = this.pageSize;
      this.paginator.length = this.totalTiposDocumento;
    }
  }

  cargarTiposDocumento(): void {
    this.loading = true;
    
    this.mantenimientoService.obtenerTiposDocumento(this.filtros)
      .subscribe({
        next: (response) => {
          if (response.ok) {
            this.dataSource.data = response.datos.datos;
            this.totalTiposDocumento = response.datos.paginacion.total;
            
            // Actualizar paginator después de cargar datos
            if (this.paginator) {
              this.paginator.length = this.totalTiposDocumento;
              this.paginator.pageIndex = this.currentPage - 1;
              this.paginator.pageSize = this.pageSize;
            }
            
            this.loading = false;
          }
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open('Error al cargar tipos de documento', 'Cerrar', {
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
    this.cargarTiposDocumento();
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
    this.cargarTiposDocumento();
  }

  abrirDialogoTipoDocumento(tipoDocumento?: TipoDocumento): void {
    this.editMode = !!tipoDocumento;
    this.selectedTipoDocumento = tipoDocumento || null;
    this.mostrarDialogo = true;
    
    if (tipoDocumento) {
      // Modo edición
      this.tipoDocumentoForm.patchValue({
        nombre: tipoDocumento.nombre,
        descripcion: tipoDocumento.descripcion || '',
        activo: tipoDocumento.activo
      });
    } else {
      // Modo creación
      this.tipoDocumentoForm.reset({
        activo: true
      });
    }
  }

  guardarTipoDocumento(): void {
    if (this.tipoDocumentoForm.valid) {
      const formData = this.tipoDocumentoForm.value;
      
      if (this.editMode && this.selectedTipoDocumento) {
        // Actualizar tipo de documento
        const updateData: TipoDocumentoUpdate = {
          nombre: formData.nombre,
          descripcion: formData.descripcion || null,
          activo: formData.activo
        };
        
        this.mantenimientoService.actualizarTipoDocumento(this.selectedTipoDocumento.id_tipo_documento, updateData)
          .subscribe({
            next: (response) => {
              if (response.ok) {
                this.snackBar.open('Tipo de documento actualizado correctamente', 'Cerrar', {
                  duration: 3000
                });
                this.cargarTiposDocumento();
                this.cerrarDialogo();
              }
            },
            error: (error) => {
              this.snackBar.open(error.error?.mensaje || 'Error al actualizar tipo de documento', 'Cerrar', {
                duration: 3000
              });
            }
          });
      } else {
        // Crear tipo de documento
        const newTipoDocumento: TipoDocumentoCreate = {
          nombre: formData.nombre,
          descripcion: formData.descripcion || null,
          activo: formData.activo
        };
        
        this.mantenimientoService.crearTipoDocumento(newTipoDocumento)
          .subscribe({
            next: (response) => {
              if (response.ok) {
                this.snackBar.open('Tipo de documento creado correctamente', 'Cerrar', {
                  duration: 3000
                });
                this.cargarTiposDocumento();
                this.cerrarDialogo();
              }
            },
            error: (error) => {
              this.snackBar.open(error.error?.mensaje || 'Error al crear tipo de documento', 'Cerrar', {
                duration: 3000
              });
            }
          });
      }
    }
  }

  eliminarTipoDocumento(tipoDocumento: TipoDocumento): void {
    this.tipoDocumentoAEliminar = tipoDocumento;
    this.mostrarModalEliminar = true;
  }

  cerrarModalEliminar(): void {
    this.mostrarModalEliminar = false;
    this.tipoDocumentoAEliminar = null;
  }

  confirmarEliminacion(): void {
    if (!this.tipoDocumentoAEliminar) {
      return;
    }

    this.loading = true;
    this.mantenimientoService.eliminarTipoDocumento(this.tipoDocumentoAEliminar.id_tipo_documento)
      .subscribe({
        next: (response) => {
          if (response.ok) {
            this.snackBar.open('Tipo de documento eliminado correctamente', 'Cerrar', {
              duration: 3000
            });
            this.cargarTiposDocumento();
            this.cerrarModalEliminar();
          }
          this.loading = false;
        },
        error: (error) => {
          this.snackBar.open(error.error?.mensaje || 'Error al eliminar tipo de documento', 'Cerrar', {
            duration: 3000
          });
          this.loading = false;
        }
      });
  }

  cerrarDialogo(): void {
    this.editMode = false;
    this.selectedTipoDocumento = null;
    this.tipoDocumentoForm.reset();
    this.mostrarDialogo = false;
  }

  getEstadoClass(activo: boolean): string {
    return activo ? 'estado-activo' : 'estado-inactivo';
  }

  trackByTipoDocumentoId(index: number, tipoDocumento: TipoDocumento): number {
    return tipoDocumento.id_tipo_documento;
  }

  goBack(): void {
    this.router.navigate(['/mantenimiento']);
  }
}
