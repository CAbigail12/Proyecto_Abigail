import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
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
import { Parroco, ParrocoCreate, ParrocoUpdate, FiltrosGenerales } from '../../../models/mantenimiento.model';

@Component({
  selector: 'app-parrocos',
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
  templateUrl: './parrocos.component.html',
  styleUrls: ['./parrocos.component.css']
})
export class ParrocosComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['id_parroco', 'nombre', 'apellido', 'activo', 'created_at', 'acciones'];
  dataSource = new MatTableDataSource<Parroco>();
  
  loading = false;
  totalParrocos = 0;
  currentPage = 1;
  pageSize = 10;
  
  // Filtros
  filtros: FiltrosGenerales = {
    busqueda: '',
    activo: '',
    pagina: 1,
    limite: 10
  };

  // Formulario para crear/editar párroco
  parrocoForm: FormGroup;
  editMode = false;
  selectedParroco: Parroco | null = null;
  mostrarDialogo = false;

  // Modal de confirmación de eliminación
  mostrarModalEliminar = false;
  parrocoAEliminar: Parroco | null = null;

  constructor(
    private mantenimientoService: MantenimientoService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.parrocoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      apellido: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      activo: [true]
    });
  }

  ngOnInit(): void {
    this.cargarParrocos();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    
    if (this.paginator) {
      this.paginator.pageIndex = this.currentPage - 1;
      this.paginator.pageSize = this.pageSize;
      this.paginator.length = this.totalParrocos;
    }
  }

  cargarParrocos(): void {
    this.loading = true;
    
    this.mantenimientoService.obtenerParrocos(this.filtros)
      .subscribe({
        next: (response) => {
          if (response.ok) {
            this.dataSource.data = response.datos.datos;
            this.totalParrocos = response.datos.paginacion.total || 0;
            
            if (this.paginator) {
              this.paginator.length = this.totalParrocos;
              this.paginator.pageIndex = this.currentPage - 1;
              this.paginator.pageSize = this.pageSize;
            }
            
            this.loading = false;
          }
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open('Error al cargar párrocos', 'Cerrar', {
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
    this.cargarParrocos();
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
    this.cargarParrocos();
  }

  abrirDialogoParroco(parroco?: Parroco): void {
    this.editMode = !!parroco;
    this.selectedParroco = parroco || null;
    this.mostrarDialogo = true;
    
    if (parroco) {
      this.parrocoForm.patchValue({
        nombre: parroco.nombre,
        apellido: parroco.apellido,
        activo: parroco.activo
      });
    } else {
      this.parrocoForm.reset({
        activo: true
      });
    }
  }

  guardarParroco(): void {
    if (this.parrocoForm.valid) {
      const formData = this.parrocoForm.value;
      
      if (this.editMode && this.selectedParroco) {
        const updateData: ParrocoUpdate = {
          nombre: formData.nombre,
          apellido: formData.apellido,
          activo: formData.activo
        };
        
        this.mantenimientoService.actualizarParroco(this.selectedParroco.id_parroco, updateData)
          .subscribe({
            next: (response) => {
              if (response.ok) {
                this.snackBar.open('Párroco actualizado correctamente', 'Cerrar', {
                  duration: 3000
                });
                this.cargarParrocos();
                this.cerrarDialogo();
              }
            },
            error: (error) => {
              this.snackBar.open(error.error?.mensaje || 'Error al actualizar párroco', 'Cerrar', {
                duration: 3000
              });
            }
          });
      } else {
        const newParroco: ParrocoCreate = {
          nombre: formData.nombre,
          apellido: formData.apellido,
          activo: formData.activo
        };
        
        this.mantenimientoService.crearParroco(newParroco)
          .subscribe({
            next: (response) => {
              if (response.ok) {
                this.snackBar.open('Párroco creado correctamente', 'Cerrar', {
                  duration: 3000
                });
                this.cargarParrocos();
                this.cerrarDialogo();
              }
            },
            error: (error) => {
              this.snackBar.open(error.error?.mensaje || 'Error al crear párroco', 'Cerrar', {
                duration: 3000
              });
            }
          });
      }
    }
  }

  eliminarParroco(parroco: Parroco): void {
    this.parrocoAEliminar = parroco;
    this.mostrarModalEliminar = true;
  }

  cerrarModalEliminar(): void {
    this.mostrarModalEliminar = false;
    this.parrocoAEliminar = null;
  }

  confirmarEliminacion(): void {
    if (!this.parrocoAEliminar) {
      return;
    }

    this.loading = true;
    this.mantenimientoService.eliminarParroco(this.parrocoAEliminar.id_parroco)
      .subscribe({
        next: (response) => {
          if (response.ok) {
            this.snackBar.open('Párroco eliminado correctamente', 'Cerrar', {
              duration: 3000
            });
            this.cargarParrocos();
            this.cerrarModalEliminar();
          }
          this.loading = false;
        },
        error: (error) => {
          this.snackBar.open(error.error?.mensaje || 'Error al eliminar párroco', 'Cerrar', {
            duration: 3000
          });
          this.loading = false;
        }
      });
  }

  cerrarDialogo(): void {
    this.editMode = false;
    this.selectedParroco = null;
    this.parrocoForm.reset();
    this.mostrarDialogo = false;
  }

  getEstadoClass(activo: boolean): string {
    return activo ? 'estado-activo' : 'estado-inactivo';
  }

  trackByParrocoId(index: number, parroco: Parroco): number {
    return parroco.id_parroco;
  }

  goBack(): void {
    this.router.navigate(['/mantenimiento']);
  }
}

