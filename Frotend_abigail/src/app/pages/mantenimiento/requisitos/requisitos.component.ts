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
import { Requisito, RequisitoCreate, RequisitoUpdate, FiltrosGenerales } from '../../../models/mantenimiento.model';

@Component({
  selector: 'app-requisitos',
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
  templateUrl: './requisitos.component.html',
  styleUrls: ['./requisitos.component.css']
})
export class RequisitosComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['id_requisito', 'nombre', 'descripcion', 'activo', 'created_at', 'acciones'];
  dataSource = new MatTableDataSource<Requisito>();
  
  loading = false;
  totalRequisitos = 0;
  currentPage = 1;
  pageSize = 10;
  
  // Filtros
  filtros: FiltrosGenerales = {
    busqueda: '',
    activo: '',
    pagina: 1,
    limite: 10
  };

  // Formulario para crear/editar requisito
  requisitoForm: FormGroup;
  editMode = false;
  selectedRequisito: Requisito | null = null;
  mostrarDialogo = false;

  // Modal de confirmación de eliminación
  mostrarModalEliminar = false;
  requisitoAEliminar: Requisito | null = null;

  constructor(
    private mantenimientoService: MantenimientoService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.requisitoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      descripcion: ['', [Validators.maxLength(255)]],
      activo: [true]
    });
  }

  ngOnInit(): void {
    this.cargarRequisitos();
  }

  ngAfterViewInit() {
    // NO asignar paginator al dataSource cuando usamos paginación del servidor
    // this.dataSource.paginator = this.paginator; // ❌ REMOVIDO - causa conflictos
    this.dataSource.sort = this.sort;
    
    // Configurar paginator manualmente para paginación del servidor
    if (this.paginator) {
      this.paginator.pageIndex = this.currentPage - 1;
      this.paginator.pageSize = this.pageSize;
      this.paginator.length = this.totalRequisitos;
    }
  }

  cargarRequisitos(): void {
    this.loading = true;
    
    this.mantenimientoService.obtenerRequisitos(this.filtros)
      .subscribe({
        next: (response) => {
          if (response.ok) {
            this.dataSource.data = response.datos.datos;
            this.totalRequisitos = response.datos.paginacion.total;
            
            // Actualizar paginator después de cargar datos
            if (this.paginator) {
              this.paginator.length = this.totalRequisitos;
              this.paginator.pageIndex = this.currentPage - 1;
              this.paginator.pageSize = this.pageSize;
            }
            
            this.loading = false;
          }
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open('Error al cargar requisitos', 'Cerrar', {
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
    this.cargarRequisitos();
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
    this.cargarRequisitos();
  }

  abrirDialogoRequisito(requisito?: Requisito): void {
    this.editMode = !!requisito;
    this.selectedRequisito = requisito || null;
    this.mostrarDialogo = true;
    
    if (requisito) {
      // Modo edición
      this.requisitoForm.patchValue({
        nombre: requisito.nombre,
        descripcion: requisito.descripcion || '',
        activo: requisito.activo
      });
    } else {
      // Modo creación
      this.requisitoForm.reset({
        activo: true
      });
    }
  }

  guardarRequisito(): void {
    if (this.requisitoForm.valid) {
      const formData = this.requisitoForm.value;
      
      if (this.editMode && this.selectedRequisito) {
        // Actualizar requisito
        const updateData: RequisitoUpdate = {
          nombre: formData.nombre,
          descripcion: formData.descripcion || null,
          activo: formData.activo
        };
        
        this.mantenimientoService.actualizarRequisito(this.selectedRequisito.id_requisito, updateData)
          .subscribe({
            next: (response) => {
              if (response.ok) {
                this.snackBar.open('Requisito actualizado correctamente', 'Cerrar', {
                  duration: 3000
                });
                this.cargarRequisitos();
                this.cerrarDialogo();
              }
            },
            error: (error) => {
              this.snackBar.open(error.error?.mensaje || 'Error al actualizar requisito', 'Cerrar', {
                duration: 3000
              });
            }
          });
      } else {
        // Crear requisito
        const newRequisito: RequisitoCreate = {
          nombre: formData.nombre,
          descripcion: formData.descripcion || null,
          activo: formData.activo
        };
        
        this.mantenimientoService.crearRequisito(newRequisito)
          .subscribe({
            next: (response) => {
              if (response.ok) {
                this.snackBar.open('Requisito creado correctamente', 'Cerrar', {
                  duration: 3000
                });
                this.cargarRequisitos();
                this.cerrarDialogo();
              }
            },
            error: (error) => {
              this.snackBar.open(error.error?.mensaje || 'Error al crear requisito', 'Cerrar', {
                duration: 3000
              });
            }
          });
      }
    }
  }

  eliminarRequisito(requisito: Requisito): void {
    this.requisitoAEliminar = requisito;
    this.mostrarModalEliminar = true;
  }

  cerrarModalEliminar(): void {
    this.mostrarModalEliminar = false;
    this.requisitoAEliminar = null;
  }

  confirmarEliminacion(): void {
    if (!this.requisitoAEliminar) {
      return;
    }

    this.loading = true;
    this.mantenimientoService.eliminarRequisito(this.requisitoAEliminar.id_requisito)
      .subscribe({
        next: (response) => {
          if (response.ok) {
            this.snackBar.open('Requisito eliminado correctamente', 'Cerrar', {
              duration: 3000
            });
            this.cargarRequisitos();
            this.cerrarModalEliminar();
          }
          this.loading = false;
        },
        error: (error) => {
          this.snackBar.open(error.error?.mensaje || 'Error al eliminar requisito', 'Cerrar', {
            duration: 3000
          });
          this.loading = false;
        }
      });
  }

  cerrarDialogo(): void {
    this.editMode = false;
    this.selectedRequisito = null;
    this.requisitoForm.reset();
    this.mostrarDialogo = false;
  }

  getEstadoClass(activo: boolean): string {
    return activo ? 'estado-activo' : 'estado-inactivo';
  }

  trackByRequisitoId(index: number, requisito: Requisito): number {
    return requisito.id_requisito;
  }

  goBack(): void {
    this.router.navigate(['/mantenimiento']);
  }
}
