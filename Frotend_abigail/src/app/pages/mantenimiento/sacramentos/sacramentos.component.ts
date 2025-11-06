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
import { Sacramento, SacramentoCreate, SacramentoUpdate, FiltrosGenerales } from '../../../models/mantenimiento.model';

@Component({
  selector: 'app-sacramentos',
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
  templateUrl: './sacramentos.component.html',
  styleUrls: ['./sacramentos.component.css']
})
export class SacramentosComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['id_sacramento', 'nombre', 'descripcion', 'activo', 'created_at', 'acciones'];
  dataSource = new MatTableDataSource<Sacramento>();
  
  loading = false;
  totalSacramentos = 0;
  currentPage = 1;
  pageSize = 10;
  
  // Filtros
  filtros: FiltrosGenerales = {
    busqueda: '',
    activo: '',
    pagina: 1,
    limite: 10
  };

  // Formulario para crear/editar sacramento
  sacramentoForm: FormGroup;
  editMode = false;
  selectedSacramento: Sacramento | null = null;
  mostrarDialogo = false;

  // Modal de confirmación de eliminación
  mostrarModalEliminar = false;
  sacramentoAEliminar: Sacramento | null = null;

  constructor(
    private mantenimientoService: MantenimientoService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.sacramentoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(60)]],
      descripcion: ['', [Validators.maxLength(255)]],
      activo: [true]
    });
  }

  ngOnInit(): void {
    this.cargarSacramentos();
  }

  ngAfterViewInit() {
    // NO asignar paginator al dataSource cuando usamos paginación del servidor
    // this.dataSource.paginator = this.paginator; // ❌ REMOVIDO - causa conflictos
    this.dataSource.sort = this.sort;
    
    // Configurar paginator manualmente para paginación del servidor
    if (this.paginator) {
      this.paginator.pageIndex = this.currentPage - 1;
      this.paginator.pageSize = this.pageSize;
      this.paginator.length = this.totalSacramentos;
    }
  }

  cargarSacramentos(): void {
    this.loading = true;
    
    this.mantenimientoService.obtenerSacramentos(this.filtros)
      .subscribe({
        next: (response) => {
          if (response.ok) {
            this.dataSource.data = response.datos.datos;
            this.totalSacramentos = response.datos.paginacion.total;
            
            // Actualizar paginator después de cargar datos
            if (this.paginator) {
              this.paginator.length = this.totalSacramentos;
              this.paginator.pageIndex = this.currentPage - 1;
              this.paginator.pageSize = this.pageSize;
            }
            
            this.loading = false;
          }
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open('Error al cargar sacramentos', 'Cerrar', {
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
    this.cargarSacramentos();
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
    this.cargarSacramentos();
  }

  abrirDialogoSacramento(sacramento?: Sacramento): void {
    this.editMode = !!sacramento;
    this.selectedSacramento = sacramento || null;
    this.mostrarDialogo = true;
    
    if (sacramento) {
      // Modo edición
      this.sacramentoForm.patchValue({
        nombre: sacramento.nombre,
        descripcion: sacramento.descripcion || '',
        activo: sacramento.activo
      });
    } else {
      // Modo creación
      this.sacramentoForm.reset({
        activo: true
      });
    }
  }

  guardarSacramento(): void {
    if (this.sacramentoForm.valid) {
      const formData = this.sacramentoForm.value;
      
      if (this.editMode && this.selectedSacramento) {
        // Actualizar sacramento
        const updateData: SacramentoUpdate = {
          nombre: formData.nombre,
          descripcion: formData.descripcion || null,
          activo: formData.activo
        };
        
        this.mantenimientoService.actualizarSacramento(this.selectedSacramento.id_sacramento, updateData)
          .subscribe({
            next: (response) => {
              if (response.ok) {
                this.snackBar.open('Sacramento actualizado correctamente', 'Cerrar', {
                  duration: 3000
                });
                this.cargarSacramentos();
                this.cerrarDialogo();
              }
            },
            error: (error) => {
              this.snackBar.open(error.error?.mensaje || 'Error al actualizar sacramento', 'Cerrar', {
                duration: 3000
              });
            }
          });
      } else {
        // Crear sacramento
        const newSacramento: SacramentoCreate = {
          nombre: formData.nombre,
          descripcion: formData.descripcion || null,
          activo: formData.activo
        };
        
        this.mantenimientoService.crearSacramento(newSacramento)
          .subscribe({
            next: (response) => {
              if (response.ok) {
                this.snackBar.open('Sacramento creado correctamente', 'Cerrar', {
                  duration: 3000
                });
                this.cargarSacramentos();
                this.cerrarDialogo();
              }
            },
            error: (error) => {
              this.snackBar.open(error.error?.mensaje || 'Error al crear sacramento', 'Cerrar', {
                duration: 3000
              });
            }
          });
      }
    }
  }

  eliminarSacramento(sacramento: Sacramento): void {
    this.sacramentoAEliminar = sacramento;
    this.mostrarModalEliminar = true;
  }

  cerrarModalEliminar(): void {
    this.mostrarModalEliminar = false;
    this.sacramentoAEliminar = null;
  }

  confirmarEliminacion(): void {
    if (!this.sacramentoAEliminar) {
      return;
    }

    this.loading = true;
    this.mantenimientoService.eliminarSacramento(this.sacramentoAEliminar.id_sacramento)
      .subscribe({
        next: (response) => {
          if (response.ok) {
            this.snackBar.open('Sacramento eliminado correctamente', 'Cerrar', {
              duration: 3000
            });
            this.cargarSacramentos();
            this.cerrarModalEliminar();
          }
          this.loading = false;
        },
        error: (error) => {
          this.snackBar.open(error.error?.mensaje || 'Error al eliminar sacramento', 'Cerrar', {
            duration: 3000
          });
          this.loading = false;
        }
      });
  }

  cerrarDialogo(): void {
    this.editMode = false;
    this.selectedSacramento = null;
    this.sacramentoForm.reset();
    this.mostrarDialogo = false;
  }

  getEstadoClass(activo: boolean): string {
    return activo ? 'estado-activo' : 'estado-inactivo';
  }

  trackBySacramentoId(index: number, sacramento: Sacramento): number {
    return sacramento.id_sacramento;
  }

  goBack(): void {
    this.router.navigate(['/mantenimiento']);
  }
}
