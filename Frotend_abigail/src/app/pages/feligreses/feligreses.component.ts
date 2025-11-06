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
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
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
  datosPaginados: Feligres[] = [];
  
  // Almacenar todos los datos originales del backend (sin filtros)
  todosLosDatos: Feligres[] = [];
  
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

  // Modal de confirmación de eliminación
  mostrarModalEliminar = false;
  feligresAEliminar: Feligres | null = null;

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
    private router: Router,
    private cdr: ChangeDetectorRef
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
    // Asignar sort al dataSource
    this.dataSource.sort = this.sort;
    
    // Asignar paginator después de que la vista esté inicializada
    // Usar setTimeout para asegurar que el paginator esté completamente renderizado
    setTimeout(() => {
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
        this.paginator.pageSize = this.pageSize;
        // Actualizar datos paginados iniciales
        this.actualizarDatosPaginados();
      }
    }, 0);
  }

  cargarFeligreses(): void {
    this.loading = true;
    
    // Obtener TODOS los feligreses sin filtros del backend
    this.feligresService.obtenerFeligreses({})
      .subscribe({
        next: (response) => {
          if (response.ok) {
            // Obtener todos los datos (puede venir en diferentes formatos)
            let todosLosDatos: any[] = [];
            if (response.datos.datos && Array.isArray(response.datos.datos)) {
              todosLosDatos = response.datos.datos;
            } else if (Array.isArray(response.datos)) {
              todosLosDatos = response.datos;
            }
            
            // Guardar todos los datos originales
            this.todosLosDatos = todosLosDatos;
            
            // Aplicar filtros localmente en el frontend
            let datosFiltrados = this.aplicarFiltrosLocales(todosLosDatos);
            
            // Asignar los datos filtrados al dataSource
            this.dataSource.data = datosFiltrados;
            this.totalFeligreses = datosFiltrados.length;
            
            // Asegurar que el paginator esté asignado después de cargar los datos
            setTimeout(() => {
              if (this.paginator && !this.dataSource.paginator) {
                this.dataSource.paginator = this.paginator;
              }
              // Asegurar que el pageSize esté correcto
              if (this.paginator) {
                this.paginator.pageSize = this.pageSize;
              }
              // Actualizar datos paginados
              this.actualizarDatosPaginados();
            }, 0);
            
            this.loading = false;
          }
        },
        error: (error) => {
          console.error('Error al cargar feligreses:', error);
          this.loading = false;
          this.snackBar.open('Error al cargar feligreses', 'Cerrar', {
            duration: 3000
          });
        }
      });
  }

  // Método para aplicar filtros localmente en el frontend
  aplicarFiltrosLocales(datos: Feligres[]): Feligres[] {
    let datosFiltrados = [...datos];

    // Filtro de búsqueda (nombre, apellido, correo)
    if (this.filtros.busqueda && this.filtros.busqueda.trim() !== '') {
      const busqueda = this.filtros.busqueda.toLowerCase().trim();
      datosFiltrados = datosFiltrados.filter(feligres => {
        const nombreCompleto = this.getNombreCompleto(feligres).toLowerCase();
        const correo = (feligres.correo || '').toLowerCase();
        return nombreCompleto.includes(busqueda) || correo.includes(busqueda);
      });
    }

    // Filtro de estado (activo/inactivo)
    if (this.filtros.activo !== '' && this.filtros.activo !== undefined && this.filtros.activo !== null) {
      const activo = this.filtros.activo === 'true';
      datosFiltrados = datosFiltrados.filter(feligres => feligres.activo === activo);
    }

    // Filtro de comunidad
    if (this.filtros.id_comunidad !== undefined && this.filtros.id_comunidad !== null) {
      const idComunidad = typeof this.filtros.id_comunidad === 'string' 
        ? parseInt(this.filtros.id_comunidad) 
        : this.filtros.id_comunidad;
      if (!isNaN(idComunidad)) {
        datosFiltrados = datosFiltrados.filter(feligres => {
          const feligresComunidad = typeof feligres.id_comunidad === 'string' 
            ? parseInt(feligres.id_comunidad) 
            : feligres.id_comunidad;
          return feligresComunidad === idComunidad;
        });
      }
    }

    // Filtro de sexo
    if (this.filtros.sexo && this.filtros.sexo.trim() !== '') {
      datosFiltrados = datosFiltrados.filter(feligres => feligres.sexo === this.filtros.sexo);
    }

    return datosFiltrados;
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
    // Resetear a la primera página cuando se aplican filtros
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    this.currentPage = 1;
    
    // Si ya tenemos todos los datos cargados, aplicar filtros localmente
    if (this.todosLosDatos.length > 0) {
      // Aplicar filtros sobre todos los datos originales
      let datosFiltrados = this.aplicarFiltrosLocales(this.todosLosDatos);
      
      // Actualizar el dataSource con los datos filtrados
      this.dataSource.data = datosFiltrados;
      this.totalFeligreses = datosFiltrados.length;
      
      // Actualizar datos paginados
      setTimeout(() => {
        this.actualizarDatosPaginados();
      }, 0);
    } else {
      // Si no hay datos cargados, cargar desde el backend
      this.cargarFeligreses();
    }
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

  // Método para actualizar los datos paginados
  actualizarDatosPaginados(): void {
    if (!this.dataSource.paginator) {
      this.datosPaginados = this.dataSource.data;
      return;
    }
    
    const startIndex = this.dataSource.paginator.pageIndex * this.dataSource.paginator.pageSize;
    const endIndex = startIndex + this.dataSource.paginator.pageSize;
    this.datosPaginados = this.dataSource.data.slice(startIndex, endIndex);
  }

  onPageChange(event: any): void {
    // Con paginación del lado del cliente, el paginator del dataSource maneja todo automáticamente
    // Actualizar las variables para referencia
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    
    // Actualizar los datos paginados
    this.actualizarDatosPaginados();
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
    this.feligresAEliminar = feligres;
    this.mostrarModalEliminar = true;
  }

  cerrarModalEliminar(): void {
    this.mostrarModalEliminar = false;
    this.feligresAEliminar = null;
  }

  confirmarEliminacion(): void {
    if (!this.feligresAEliminar) {
      return;
    }

    this.loading = true;
    this.feligresService.eliminarFeligres(this.feligresAEliminar.id_feligres)
      .subscribe({
        next: (response) => {
          if (response.ok) {
            this.snackBar.open('Feligrés eliminado correctamente', 'Cerrar', {
              duration: 3000
            });
            this.cargarFeligreses();
            this.cerrarModalEliminar();
          }
          this.loading = false;
        },
        error: (error) => {
          this.snackBar.open(error.error?.mensaje || 'Error al eliminar feligrés', 'Cerrar', {
            duration: 3000
          });
          this.loading = false;
        }
      });
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

  /**
   * Exportar datos filtrados a Excel
   */
  exportarAExcel(): void {
    // Obtener los datos filtrados actuales (no solo los de la página actual)
    const datosParaExportar = this.dataSource.data;
    
    if (datosParaExportar.length === 0) {
      this.snackBar.open('No hay datos para exportar', 'Cerrar', {
        duration: 3000
      });
      return;
    }

    // Formatear los datos para Excel
    const datosFormateados = datosParaExportar.map(feligres => {
      return {
        'ID': feligres.id_feligres,
        'Nombre Completo': this.getNombreCompleto(feligres),
        'Primer Nombre': feligres.primer_nombre,
        'Segundo Nombre': feligres.segundo_nombre || '',
        'Otros Nombres': feligres.otros_nombres || '',
        'Primer Apellido': feligres.primer_apellido,
        'Segundo Apellido': feligres.segundo_apellido || '',
        'Apellido Casada': feligres.apellido_casada || '',
        'Fecha de Nacimiento': feligres.fecha_nacimiento 
          ? new Date(feligres.fecha_nacimiento).toLocaleDateString('es-ES')
          : '',
        'Sexo': feligres.sexo === 'M' ? 'Masculino' : feligres.sexo === 'F' ? 'Femenino' : feligres.sexo,
        'Teléfono': feligres.telefono || '',
        'Correo': feligres.correo || '',
        'Dirección': feligres.direccion || '',
        'Comunidad': feligres.comunidad_nombre || '',
        'Estado': feligres.activo ? 'Activo' : 'Inactivo',
        'Fecha de Registro': feligres.created_at 
          ? new Date(feligres.created_at).toLocaleDateString('es-ES')
          : ''
      };
    });

    // Crear el libro de trabajo de Excel
    const ws = XLSX.utils.json_to_sheet(datosFormateados);
    
    // Ajustar el ancho de las columnas
    const columnWidths = [
      { wch: 8 },  // ID
      { wch: 30 }, // Nombre Completo
      { wch: 15 }, // Primer Nombre
      { wch: 15 }, // Segundo Nombre
      { wch: 15 }, // Otros Nombres
      { wch: 15 }, // Primer Apellido
      { wch: 15 }, // Segundo Apellido
      { wch: 15 }, // Apellido Casada
      { wch: 18 }, // Fecha de Nacimiento
      { wch: 12 }, // Sexo
      { wch: 15 }, // Teléfono
      { wch: 25 }, // Correo
      { wch: 30 }, // Dirección
      { wch: 20 }, // Comunidad
      { wch: 10 }, // Estado
      { wch: 18 }  // Fecha de Registro
    ];
    ws['!cols'] = columnWidths;

    // Crear el libro de trabajo
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Feligreses');

    // Generar el nombre del archivo con fecha
    const fecha = new Date().toISOString().split('T')[0];
    const nombreArchivo = `Feligreses_${fecha}.xlsx`;

    // Descargar el archivo
    XLSX.writeFile(wb, nombreArchivo);

    // Mostrar mensaje de éxito
    this.snackBar.open(`Se exportaron ${datosParaExportar.length} feligreses a Excel`, 'Cerrar', {
      duration: 3000
    });
  }
}
