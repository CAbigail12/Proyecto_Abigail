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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Router } from '@angular/router';
import { FeligresService } from '../../services/feligres.service';
import { Feligres, FeligresCreate, FeligresUpdate, FiltrosFeligres, ComunidadSelect } from '../../models/mantenimiento.model';

@Component({
  selector: 'app-feligreses',
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
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './feligreses.component.html',
  styleUrls: ['./feligreses.component.css']
})
export class FeligresesComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['id_feligres', 'nombre_completo', 'fecha_nacimiento', 'sexo', 'comunidad', 'telefono', 'activo', 'created_at', 'acciones'];
  dataSource = new MatTableDataSource<Feligres>();
  
  loading = false;
  totalFeligreses = 0;
  currentPage = 1;
  pageSize = 10;
  
  // Filtros
  filtros: FiltrosFeligres = {
    busqueda: '',
    activo: '',
    id_comunidad: undefined,
    sexo: '',
    pagina: 1,
    limite: 10
  };

  // Formulario para crear/editar feligrés
  feligresForm: FormGroup;
  editMode = false;
  selectedFeligres: Feligres | null = null;
  mostrarDialogo = false;

  // Opciones para selects
  comunidades: ComunidadSelect[] = [];
  opcionesSexo = [
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Femenino' }
  ];

  constructor(
    private feligresService: FeligresService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.feligresForm = this.fb.group({
      primer_nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      segundo_nombre: ['', [Validators.maxLength(50)]],
      otros_nombres: ['', [Validators.maxLength(50)]],
      primer_apellido: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      segundo_apellido: ['', [Validators.maxLength(50)]],
      apellido_casada: ['', [Validators.maxLength(50)]],
      fecha_nacimiento: [''],
      sexo: [''],
      nombre_padre: ['', [Validators.maxLength(120)]],
      nombre_madre: ['', [Validators.maxLength(120)]],
      departamento: ['', [Validators.maxLength(80)]],
      municipio: ['', [Validators.maxLength(80)]],
      id_comunidad: [''],
      telefono: ['', [Validators.maxLength(30)]],
      correo: ['', [Validators.email, Validators.maxLength(120)]],
      direccion: ['', [Validators.maxLength(255)]],
      comentarios: ['', [Validators.maxLength(500)]],
      activo: [true]
    });
  }

  ngOnInit(): void {
    this.cargarFeligreses();
    this.cargarComunidades();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  cargarFeligreses(): void {
    this.loading = true;
    
    this.feligresService.obtenerFeligreses(this.filtros)
      .subscribe({
        next: (response) => {
          if (response.ok) {
            this.dataSource.data = response.datos.datos;
            this.totalFeligreses = response.datos.paginacion.total;
            this.loading = false;
          }
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open('Error al cargar feligreses', 'Cerrar', {
            duration: 3000
          });
        }
      });
  }

  cargarComunidades(): void {
    this.feligresService.obtenerComunidades()
      .subscribe({
        next: (response) => {
          if (response.ok) {
            this.comunidades = response.datos;
          }
        },
        error: (error) => {
          console.error('Error al cargar comunidades:', error);
        }
      });
  }

  aplicarFiltros(): void {
    this.currentPage = 1;
    this.filtros.pagina = this.currentPage;
    this.cargarFeligreses();
  }

  limpiarFiltros(): void {
    this.filtros = {
      busqueda: '',
      activo: '',
      id_comunidad: undefined,
      sexo: '',
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
    this.cargarFeligreses();
  }

  abrirDialogoFeligres(feligres?: Feligres): void {
    this.editMode = !!feligres;
    this.selectedFeligres = feligres || null;
    this.mostrarDialogo = true;
    
    if (feligres) {
      // Modo edición
      this.feligresForm.patchValue({
        primer_nombre: feligres.primer_nombre,
        segundo_nombre: feligres.segundo_nombre || '',
        otros_nombres: feligres.otros_nombres || '',
        primer_apellido: feligres.primer_apellido,
        segundo_apellido: feligres.segundo_apellido || '',
        apellido_casada: feligres.apellido_casada || '',
        fecha_nacimiento: feligres.fecha_nacimiento || '',
        sexo: feligres.sexo || '',
        nombre_padre: feligres.nombre_padre || '',
        nombre_madre: feligres.nombre_madre || '',
        departamento: feligres.departamento || '',
        municipio: feligres.municipio || '',
        id_comunidad: feligres.id_comunidad || '',
        telefono: feligres.telefono || '',
        correo: feligres.correo || '',
        direccion: feligres.direccion || '',
        comentarios: feligres.comentarios || '',
        activo: feligres.activo
      });
    } else {
      // Modo creación
      this.feligresForm.reset({
        activo: true
      });
    }
  }

  guardarFeligres(): void {
    if (this.feligresForm.valid) {
      const formData = this.feligresForm.value;
      
      if (this.editMode && this.selectedFeligres) {
        // Actualizar feligrés
        const updateData: FeligresUpdate = {
          primer_nombre: formData.primer_nombre,
          segundo_nombre: formData.segundo_nombre || null,
          otros_nombres: formData.otros_nombres || null,
          primer_apellido: formData.primer_apellido,
          segundo_apellido: formData.segundo_apellido || null,
          apellido_casada: formData.apellido_casada || null,
          fecha_nacimiento: formData.fecha_nacimiento || null,
          sexo: formData.sexo || null,
          nombre_padre: formData.nombre_padre || null,
          nombre_madre: formData.nombre_madre || null,
          departamento: formData.departamento || null,
          municipio: formData.municipio || null,
          id_comunidad: formData.id_comunidad ? parseInt(formData.id_comunidad) : undefined,
          telefono: formData.telefono || null,
          correo: formData.correo || null,
          direccion: formData.direccion || null,
          comentarios: formData.comentarios || null,
          activo: formData.activo
        };
        
        this.feligresService.actualizarFeligres(this.selectedFeligres.id_feligres, updateData)
          .subscribe({
            next: (response) => {
              if (response.ok) {
                this.snackBar.open('Feligrés actualizado correctamente', 'Cerrar', {
                  duration: 3000
                });
                this.cargarFeligreses();
                this.cerrarDialogo();
              }
            },
            error: (error) => {
              this.snackBar.open(error.error?.mensaje || 'Error al actualizar feligrés', 'Cerrar', {
                duration: 3000
              });
            }
          });
      } else {
        // Crear feligrés
        const newFeligres: FeligresCreate = {
          primer_nombre: formData.primer_nombre,
          segundo_nombre: formData.segundo_nombre || null,
          otros_nombres: formData.otros_nombres || null,
          primer_apellido: formData.primer_apellido,
          segundo_apellido: formData.segundo_apellido || null,
          apellido_casada: formData.apellido_casada || null,
          fecha_nacimiento: formData.fecha_nacimiento || null,
          sexo: formData.sexo || null,
          nombre_padre: formData.nombre_padre || null,
          nombre_madre: formData.nombre_madre || null,
          departamento: formData.departamento || null,
          municipio: formData.municipio || null,
          id_comunidad: formData.id_comunidad ? parseInt(formData.id_comunidad) : undefined,
          telefono: formData.telefono || null,
          correo: formData.correo || null,
          direccion: formData.direccion || null,
          comentarios: formData.comentarios || null,
          activo: formData.activo
        };
        
        this.feligresService.crearFeligres(newFeligres)
          .subscribe({
            next: (response) => {
              if (response.ok) {
                this.snackBar.open('Feligrés creado correctamente', 'Cerrar', {
                  duration: 3000
                });
                this.cargarFeligreses();
                this.cerrarDialogo();
              }
            },
            error: (error) => {
              this.snackBar.open(error.error?.mensaje || 'Error al crear feligrés', 'Cerrar', {
                duration: 3000
              });
            }
          });
      }
    }
  }

  eliminarFeligres(feligres: Feligres): void {
    const nombreCompleto = `${feligres.primer_nombre} ${feligres.primer_apellido}`;
    if (confirm(`¿Estás seguro de que deseas eliminar al feligrés "${nombreCompleto}"?`)) {
      this.feligresService.eliminarFeligres(feligres.id_feligres)
        .subscribe({
          next: (response) => {
            if (response.ok) {
              this.snackBar.open('Feligrés eliminado correctamente', 'Cerrar', {
                duration: 3000
              });
              this.cargarFeligreses();
            }
          },
          error: (error) => {
            this.snackBar.open(error.error?.mensaje || 'Error al eliminar feligrés', 'Cerrar', {
              duration: 3000
            });
          }
        });
    }
  }

  cerrarDialogo(): void {
    this.editMode = false;
    this.selectedFeligres = null;
    this.feligresForm.reset();
    this.mostrarDialogo = false;
  }

  getEstadoClass(activo: boolean): string {
    return activo ? 'estado-activo' : 'estado-inactivo';
  }

  getNombreCompleto(feligres: Feligres): string {
    let nombre = feligres.primer_nombre;
    if (feligres.segundo_nombre) nombre += ` ${feligres.segundo_nombre}`;
    if (feligres.otros_nombres) nombre += ` ${feligres.otros_nombres}`;
    
    let apellido = feligres.primer_apellido;
    if (feligres.segundo_apellido) apellido += ` ${feligres.segundo_apellido}`;
    if (feligres.apellido_casada) apellido += ` de ${feligres.apellido_casada}`;
    
    return `${nombre} ${apellido}`;
  }

  trackByFeligresId(index: number, feligres: Feligres): number {
    return feligres.id_feligres;
  }
}
