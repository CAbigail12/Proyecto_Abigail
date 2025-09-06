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
import { RolParticipante, RolParticipanteCreate, RolParticipanteUpdate, FiltrosGenerales } from '../../../models/mantenimiento.model';

@Component({
  selector: 'app-roles-participante',
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
  templateUrl: './roles-participante.component.html',
  styleUrls: ['./roles-participante.component.css']
})
export class RolesParticipanteComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['id_rol_participante', 'nombre', 'descripcion', 'activo', 'created_at', 'acciones'];
  dataSource = new MatTableDataSource<RolParticipante>();
  
  loading = false;
  totalRolesParticipante = 0;
  currentPage = 1;
  pageSize = 10;
  
  // Filtros
  filtros: FiltrosGenerales = {
    busqueda: '',
    activo: '',
    pagina: 1,
    limite: 10
  };

  // Formulario para crear/editar rol de participante
  rolParticipanteForm: FormGroup;
  editMode = false;
  selectedRolParticipante: RolParticipante | null = null;
  mostrarDialogo = false;

  constructor(
    private mantenimientoService: MantenimientoService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.rolParticipanteForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
      descripcion: ['', [Validators.maxLength(255)]],
      activo: [true]
    });
  }

  ngOnInit(): void {
    this.cargarRolesParticipante();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  cargarRolesParticipante(): void {
    this.loading = true;
    
    this.mantenimientoService.obtenerRolesParticipante(this.filtros)
      .subscribe({
        next: (response) => {
          if (response.ok) {
            this.dataSource.data = response.datos.datos;
            this.totalRolesParticipante = response.datos.paginacion.total;
            this.loading = false;
          }
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open('Error al cargar roles de participante', 'Cerrar', {
            duration: 3000
          });
        }
      });
  }

  aplicarFiltros(): void {
    this.currentPage = 1;
    this.filtros.pagina = this.currentPage;
    this.cargarRolesParticipante();
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
    this.cargarRolesParticipante();
  }

  abrirDialogoRolParticipante(rolParticipante?: RolParticipante): void {
    this.editMode = !!rolParticipante;
    this.selectedRolParticipante = rolParticipante || null;
    this.mostrarDialogo = true;
    
    if (rolParticipante) {
      // Modo edición
      this.rolParticipanteForm.patchValue({
        nombre: rolParticipante.nombre,
        descripcion: rolParticipante.descripcion || '',
        activo: rolParticipante.activo
      });
    } else {
      // Modo creación
      this.rolParticipanteForm.reset({
        activo: true
      });
    }
  }

  guardarRolParticipante(): void {
    if (this.rolParticipanteForm.valid) {
      const formData = this.rolParticipanteForm.value;
      
      if (this.editMode && this.selectedRolParticipante) {
        // Actualizar rol de participante
        const updateData: RolParticipanteUpdate = {
          nombre: formData.nombre,
          descripcion: formData.descripcion || null,
          activo: formData.activo
        };
        
        this.mantenimientoService.actualizarRolParticipante(this.selectedRolParticipante.id_rol_participante, updateData)
          .subscribe({
            next: (response) => {
              if (response.ok) {
                this.snackBar.open('Rol de participante actualizado correctamente', 'Cerrar', {
                  duration: 3000
                });
                this.cargarRolesParticipante();
                this.cerrarDialogo();
              }
            },
            error: (error) => {
              this.snackBar.open(error.error?.mensaje || 'Error al actualizar rol de participante', 'Cerrar', {
                duration: 3000
              });
            }
          });
      } else {
        // Crear rol de participante
        const newRolParticipante: RolParticipanteCreate = {
          nombre: formData.nombre,
          descripcion: formData.descripcion || null,
          activo: formData.activo
        };
        
        this.mantenimientoService.crearRolParticipante(newRolParticipante)
          .subscribe({
            next: (response) => {
              if (response.ok) {
                this.snackBar.open('Rol de participante creado correctamente', 'Cerrar', {
                  duration: 3000
                });
                this.cargarRolesParticipante();
                this.cerrarDialogo();
              }
            },
            error: (error) => {
              this.snackBar.open(error.error?.mensaje || 'Error al crear rol de participante', 'Cerrar', {
                duration: 3000
              });
            }
          });
      }
    }
  }

  eliminarRolParticipante(rolParticipante: RolParticipante): void {
    if (confirm(`¿Estás seguro de que deseas eliminar el rol de participante "${rolParticipante.nombre}"?`)) {
      this.mantenimientoService.eliminarRolParticipante(rolParticipante.id_rol_participante)
        .subscribe({
          next: (response) => {
            if (response.ok) {
              this.snackBar.open('Rol de participante eliminado correctamente', 'Cerrar', {
                duration: 3000
              });
              this.cargarRolesParticipante();
            }
          },
          error: (error) => {
            this.snackBar.open(error.error?.mensaje || 'Error al eliminar rol de participante', 'Cerrar', {
              duration: 3000
            });
          }
        });
    }
  }

  cerrarDialogo(): void {
    this.editMode = false;
    this.selectedRolParticipante = null;
    this.rolParticipanteForm.reset();
    this.mostrarDialogo = false;
  }

  getEstadoClass(activo: boolean): string {
    return activo ? 'estado-activo' : 'estado-inactivo';
  }

  trackByRolParticipanteId(index: number, rolParticipante: RolParticipante): number {
    return rolParticipante.id_rol_participante;
  }

  goBack(): void {
    this.router.navigate(['/mantenimiento']);
  }
}
