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
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { UsuarioService } from '../../services/usuario.service';
import { Usuario, UsuarioCreate, UsuarioUpdate } from '../../models/usuario.model';
import { ConfirmacionEliminarComponent } from './confirmacion-eliminar.component';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-usuarios',
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
    MatDialogModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatChipsModule
  ],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['id_usuario', 'usuario', 'correo', 'rol_nombre', 'estado', 'fecha_registro', 'acciones'];
  dataSource = new MatTableDataSource<Usuario>();
  
  loading = false;
  totalUsuarios = 0;
  currentPage = 1;
  pageSize = 10;
  datosPaginados: Usuario[] = [];
  
  // Almacenar todos los datos originales del backend (sin filtros)
  todosLosDatos: Usuario[] = [];
  
  // Vista de tabla
  vistaActual: 'tabla' | 'tarjetas' = 'tabla';
  
  // Usuario seleccionado para ver detalles
  usuarioDetalle: Usuario | null = null;
  mostrarDetalles = false;
  
  // Filtros
  filtros = {
    rol_id: '',
    estado: '',
    busqueda: ''
  };

  // Formulario para crear/editar usuario
  usuarioForm: FormGroup;
  editMode = false;
  selectedUsuario: Usuario | null = null;
  mostrarDialogo = false;
  selectedFile: File | null = null;

  // Roles disponibles (simulado - en un caso real vendría de la API)
  roles = [
    { id: 1, nombre: 'ADMINISTRADOR' },
    { id: 2, nombre: 'PERSONAL' },
    { id: 3, nombre: 'INVITADO' }
  ];

  constructor(
    private usuarioService: UsuarioService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {
    this.usuarioForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
      apellido: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
      correo: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
      telefono: ['', [Validators.maxLength(20)]],
      contrasena: ['', [Validators.required, Validators.minLength(8)]],
      rol_id: ['', Validators.required],
      estado: ['ACTIVO']
    });
  }

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    setTimeout(() => {
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
        this.paginator.pageSize = this.pageSize;
        this.actualizarDatosPaginados();
      }
    }, 0);
  }

  cargarUsuarios(): void {
    this.loading = true;
    
    // Obtener TODOS los usuarios sin filtros del backend
    this.usuarioService.obtenerUsuarios()
      .subscribe({
        next: (response) => {
          if (response.ok) {
            // Obtener todos los datos
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
            this.totalUsuarios = datosFiltrados.length;
            
            // Asegurar que el paginator esté asignado después de cargar los datos
            setTimeout(() => {
              if (this.paginator && !this.dataSource.paginator) {
                this.dataSource.paginator = this.paginator;
              }
              if (this.paginator) {
                this.paginator.pageSize = this.pageSize;
              }
              this.actualizarDatosPaginados();
            }, 0);
            
            this.loading = false;
          }
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open('Error al cargar usuarios', 'Cerrar', {
            duration: 3000
          });
        }
      });
  }

  // Método para aplicar filtros localmente en el frontend
  aplicarFiltrosLocales(datos: Usuario[]): Usuario[] {
    let datosFiltrados = [...datos];

    // Filtro de búsqueda (nombre, apellido, correo)
    if (this.filtros.busqueda && this.filtros.busqueda.trim() !== '') {
      const busqueda = this.filtros.busqueda.toLowerCase().trim();
      datosFiltrados = datosFiltrados.filter(usuario => {
        const nombre = (usuario.nombre || '').toLowerCase();
        const apellido = (usuario.apellido || '').toLowerCase();
        const correo = (usuario.correo || '').toLowerCase();
        return nombre.includes(busqueda) || apellido.includes(busqueda) || correo.includes(busqueda);
      });
    }

    // Filtro de rol
    if (this.filtros.rol_id && this.filtros.rol_id !== '') {
      const rolId = typeof this.filtros.rol_id === 'string' ? parseInt(this.filtros.rol_id) : this.filtros.rol_id;
      datosFiltrados = datosFiltrados.filter(usuario => usuario.rol_id === rolId);
    }

    // Filtro de estado
    if (this.filtros.estado && this.filtros.estado !== '') {
      datosFiltrados = datosFiltrados.filter(usuario => usuario.estado === this.filtros.estado);
    }

    return datosFiltrados;
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
      this.totalUsuarios = datosFiltrados.length;
      
      // Actualizar datos paginados
      setTimeout(() => {
        this.actualizarDatosPaginados();
      }, 0);
    } else {
      // Si no hay datos cargados, cargar desde el backend
    this.cargarUsuarios();
    }
  }

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
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.actualizarDatosPaginados();
    this.cdr.detectChanges();
  }

  limpiarFiltros(): void {
    this.filtros = {
      rol_id: '',
      estado: '',
      busqueda: ''
    };
    this.aplicarFiltros();
  }

  abrirDialogoUsuario(usuario?: Usuario): void {
    this.editMode = !!usuario;
    this.selectedUsuario = usuario || null;
    this.mostrarDialogo = true;
    
    if (usuario) {
      // Modo edición
      this.usuarioForm.patchValue({
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        correo: usuario.correo,
        telefono: usuario.telefono,
        rol_id: usuario.rol_id,
        estado: usuario.estado,
        contrasena: '' // No mostrar contraseña actual
      });
      this.usuarioForm.get('contrasena')?.clearValidators();
    } else {
      // Modo creación
      this.usuarioForm.reset({
        estado: 'ACTIVO'
      });
      this.usuarioForm.get('contrasena')?.setValidators([Validators.required, Validators.minLength(8)]);
    }
    
    this.usuarioForm.get('contrasena')?.updateValueAndValidity();
  }

  guardarUsuario(): void {
    if (this.usuarioForm.valid) {
      const formData = this.usuarioForm.value;
      
      if (this.editMode && this.selectedUsuario) {
        // Actualizar usuario
        const updateData: UsuarioUpdate = {
          nombre: formData.nombre,
          apellido: formData.apellido,
          correo: formData.correo,
          telefono: formData.telefono,
          rol_id: formData.rol_id,
          estado: formData.estado
        };
        
        // Solo incluir contraseña si se proporcionó una nueva
        if (formData.contrasena) {
          updateData.contrasena = formData.contrasena;
        }
        
        this.usuarioService.actualizarUsuario(this.selectedUsuario.id_usuario, updateData, this.selectedFile || undefined)
          .subscribe({
            next: (response) => {
              if (response.ok) {
                this.snackBar.open('Usuario actualizado correctamente', 'Cerrar', {
                  duration: 3000
                });
                this.cargarUsuarios();
                this.cerrarDialogo();
              }
            },
            error: (error) => {
              this.snackBar.open(error.error?.mensaje || 'Error al actualizar usuario', 'Cerrar', {
                duration: 3000
              });
            }
          });
      } else {
        // Crear usuario
        const newUsuario: UsuarioCreate = {
          nombre: formData.nombre,
          apellido: formData.apellido,
          correo: formData.correo,
          telefono: formData.telefono,
          contrasena: formData.contrasena,
          rol_id: formData.rol_id,
          estado: formData.estado
        };
        
        this.usuarioService.crearUsuario(newUsuario, this.selectedFile || undefined)
          .subscribe({
            next: (response) => {
              if (response.ok) {
                this.snackBar.open('Usuario creado correctamente', 'Cerrar', {
                  duration: 3000
                });
                this.cargarUsuarios();
                this.cerrarDialogo();
              }
            },
            error: (error) => {
              this.snackBar.open(error.error?.mensaje || 'Error al crear usuario', 'Cerrar', {
                duration: 3000
              });
            }
          });
      }
    }
  }

  eliminarUsuario(usuario: Usuario): void {
    const dialogRef = this.dialog.open(ConfirmacionEliminarComponent, {
      width: '500px',
      data: { usuario },
      disableClose: true,
      panelClass: 'confirmacion-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        // Usuario confirmó la eliminación
        this.usuarioService.eliminarUsuario(usuario.id_usuario)
          .subscribe({
            next: (response) => {
              if (response.ok) {
                this.snackBar.open('Usuario eliminado correctamente', 'Cerrar', {
                  duration: 3000,
                  panelClass: ['success-snackbar']
                });
                this.cargarUsuarios();
              }
            },
            error: (error) => {
              this.snackBar.open(error.error?.mensaje || 'Error al eliminar usuario', 'Cerrar', {
                duration: 3000,
                panelClass: ['error-snackbar']
              });
            }
          });
      }
    });
  }

  cerrarDialogo(): void {
    this.editMode = false;
    this.selectedUsuario = null;
    this.usuarioForm.reset();
    this.mostrarDialogo = false;
    this.selectedFile = null;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        this.snackBar.open('Por favor seleccione un archivo de imagen', 'Cerrar', {
          duration: 3000
        });
        return;
      }
      
      // Validar tamaño (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        this.snackBar.open('El archivo es demasiado grande. Máximo 5MB', 'Cerrar', {
          duration: 3000
        });
        return;
      }
      
      this.selectedFile = file;
    }
  }

  getRolNombre(rolId: number): string {
    const rol = this.roles.find(r => r.id === rolId);
    if (!rol) return 'N/A';
    
    // Mapear los roles para mostrar nombres más amigables
    switch (rol.nombre) {
      case 'ADMINISTRADOR':
        return 'Administrador';
      case 'PERSONAL':
        return 'Personal';
      case 'INVITADO':
        return 'Invitado';
      default:
        return rol.nombre;
    }
  }

  getEstadoClass(estado: string): string {
    return estado === 'ACTIVO' ? 'estado-activo' : 'estado-inactivo';
  }

  exportarAPDF(): void {
    try {
      // Crear nuevo documento PDF en orientación horizontal
      const doc = new jsPDF('landscape');
      
      // Configurar fuente y tamaño
      doc.setFont('helvetica');
      doc.setFontSize(20);
      
      // Título del documento
      doc.setTextColor(51, 51, 51);
      doc.text('Reporte de Usuarios - Parroquia San Pablo Apóstol', 30, 25);
      
      // Información del reporte
      doc.setFontSize(12);
      doc.setTextColor(102, 102, 102);
      doc.text(`Generado el: ${new Date().toLocaleDateString('es-GT')}`, 30, 35);
      doc.text(`Total de usuarios: ${this.dataSource.data.length}`, 30, 45);
      
      // Preparar datos para la tabla
      const datosTabla = this.dataSource.data.map(usuario => [
        usuario.id_usuario.toString(),
        `${usuario.nombre} ${usuario.apellido}`,
        usuario.correo,
        usuario.telefono || 'N/A',
        this.getRolNombre(usuario.rol_id),
        usuario.estado,
        new Date(usuario.fecha_registro).toLocaleDateString('es-GT')
      ]);
      
      // Configurar y generar la tabla
      autoTable(doc, {
        head: [['ID', 'Usuario', 'Correo', 'Teléfono', 'Rol', 'Estado', 'Fecha Registro']],
        body: datosTabla,
        startY: 55,
        styles: {
          fontSize: 10,
          cellPadding: 4,
          lineColor: [200, 200, 200],
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [51, 51, 51],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [248, 249, 250],
        },
        columnStyles: {
          0: { cellWidth: 21 }, // ID
          1: { cellWidth: 48 }, // Usuario
          2: { cellWidth: 56 }, // Correo
          3: { cellWidth: 37 }, // Teléfono
          4: { cellWidth: 35 }, // Rol
          5: { cellWidth: 27 }, // Estado
          6: { cellWidth: 35 }, // Fecha
        },
        margin: { top: 55, right: 20, bottom: 20, left: 20 },
        tableWidth: 'auto',
      });
      
      // Agregar pie de página
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(128, 128, 128);
        doc.text(`Página ${i} de ${pageCount}`, 30, doc.internal.pageSize.height - 15);
      }
      
      // Crear nombre del archivo con fecha
      const fecha = new Date().toISOString().split('T')[0];
      const nombreArchivo = `Reporte_Usuarios_Parroquia_San_Pablo_Apostol_${fecha}.pdf`;
      
      // Guardar el PDF
      doc.save(nombreArchivo);
      
      // Mostrar mensaje de éxito
      this.snackBar.open(`Se exportaron ${this.dataSource.data.length} usuarios a PDF`, 'Cerrar', {
        duration: 3000
      });
      
    } catch (error) {
      console.error('Error al exportar a PDF:', error);
      this.snackBar.open('Error al exportar a PDF', 'Cerrar', {
        duration: 3000
      });
    }
  }

  verDetallesUsuario(usuario: Usuario): void {
    this.usuarioDetalle = usuario;
    this.mostrarDetalles = true;
  }

  cerrarDetalles(): void {
    this.usuarioDetalle = null;
    this.mostrarDetalles = false;
  }

  getInitials(nombre: string, apellido: string): string {
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
  }

  getRolColor(rolId: number): string {
    switch (rolId) {
      case 1: return 'bg-red-100 text-red-800 border-red-200'; // ADMINISTRADOR
      case 2: return 'bg-blue-100 text-blue-800 border-blue-200'; // PERSONAL
      case 3: return 'bg-gray-100 text-gray-800 border-gray-200'; // INVITADO
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  getRolIcon(rolId: number): string {
    switch (rolId) {
      case 1: return 'admin_panel_settings'; // ADMINISTRADOR
      case 2: return 'work'; // PERSONAL
      case 3: return 'person'; // INVITADO
      default: return 'person';
    }
  }

  // Métodos auxiliares para el nuevo diseño de tabla
  getTotalActivos(): number {
    return this.dataSource.data.filter(usuario => usuario.estado === 'ACTIVO').length;
  }

  getTotalInactivos(): number {
    return this.dataSource.data.filter(usuario => usuario.estado === 'INACTIVO').length;
  }

  trackByUserId(index: number, usuario: Usuario): number {
    return usuario.id_usuario;
  }

  getDiasDesdeRegistro(fechaRegistro: string): number {
    const fecha = new Date(fechaRegistro);
    const hoy = new Date();
    const diferencia = hoy.getTime() - fecha.getTime();
    return Math.floor(diferencia / (1000 * 3600 * 24));
  }

  cambiarVista(vista: 'tabla' | 'tarjetas'): void {
    this.vistaActual = vista;
  }
}
