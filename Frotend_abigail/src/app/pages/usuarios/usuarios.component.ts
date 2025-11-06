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
import { RolPermisosService, PermisosMenu } from '../../services/rol-permisos.service';
import { RolService, Rol, RolCreate } from '../../services/rol.service';
import { AuthService } from '../../services/auth.service';
import { Usuario, UsuarioCreate, UsuarioUpdate } from '../../models/usuario.model';
import { environment } from '../../../environments/environment';
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

  // Roles disponibles (se cargan desde el backend)
  roles: Rol[] = [];

  // Modal de permisos
  mostrarModalPermisos = false;
  rolSeleccionadoParaPermisos: any = null;
  permisosForm: FormGroup;
  opcionesMenu = [
    { clave: 'dashboard', nombre: 'Dashboard', descripcion: 'Panel principal' },
    { clave: 'feligreses', nombre: 'Feligreses', descripcion: 'Gestión de feligreses' },
    { clave: 'sacramentos_asignacion', nombre: 'Asignación de Sacramentos', descripcion: 'Gestión de sacramentos' },
    { clave: 'calendario_sacramentos', nombre: 'Calendario de Sacramentos', descripcion: 'Calendario de eventos' },
    { clave: 'actividades_religiosas', nombre: 'Actividades Religiosas', descripcion: 'Gestión de actividades' },
    { clave: 'caja_parroquial', nombre: 'Caja Parroquial', descripcion: 'Gestión financiera' },
    { clave: 'reportes', nombre: 'Reportes', descripcion: 'Reportes y estadísticas' },
    { clave: 'usuarios', nombre: 'Usuarios', descripcion: 'Gestión de usuarios' },
    { clave: 'mantenimiento', nombre: 'Mantenimiento', descripcion: 'Mantenimiento del sistema' }
  ];

  // Modal de crear nuevo rol
  mostrarModalCrearRol = false;
  rolForm: FormGroup;

  constructor(
    private usuarioService: UsuarioService,
    private rolPermisosService: RolPermisosService,
    private rolService: RolService,
    private authService: AuthService,
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
      contrasena: [''], // Opcional - se validará condicionalmente
      rol_id: ['', Validators.required],
      estado: ['ACTIVO']
    });

    // Formulario de permisos
    const permisosControls: any = {};
    this.opcionesMenu.forEach(opcion => {
      permisosControls[opcion.clave] = [false];
    });
    this.permisosForm = this.fb.group(permisosControls);

    // Formulario de crear rol
    this.rolForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      descripcion: ['']
    });
  }

  ngOnInit(): void {
    this.cargarUsuarios();
    this.cargarRoles();
  }

  cargarRoles(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('🔄 Cargando roles desde:', `${environment.apiUrl}/roles`);
      this.rolService.obtenerTodos().subscribe({
        next: (response) => {
          console.log('✅ Respuesta completa de roles:', JSON.stringify(response, null, 2));
          if (response && response.ok) {
            if (response.datos) {
              this.roles = Array.isArray(response.datos) ? response.datos : [];
              console.log('📋 Roles cargados exitosamente:', this.roles.length, 'roles');
              console.log('📋 Detalle de roles:', this.roles);
            } else {
              console.warn('⚠️ Respuesta OK pero sin datos:', response);
              this.roles = [];
            }
          } else {
            console.warn('⚠️ Respuesta no OK:', response);
            this.roles = [];
          }
          resolve();
        },
        error: (error) => {
          console.error('❌ Error completo al cargar roles:', error);
          console.error('❌ Status:', error.status);
          console.error('❌ Error message:', error.message);
          console.error('❌ Error body:', error.error);
          
          // Mostrar error si no es un error de red común o 404
          if (error.status === 403) {
            console.error('❌ Error 403: No tienes permisos para ver roles');
            this.snackBar.open('No tienes permisos para ver los roles', 'Cerrar', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          } else if (error.status !== 0 && error.status !== 404) {
            const mensaje = error.error?.mensaje || error.message || 'Error al cargar los roles';
            this.snackBar.open(mensaje, 'Cerrar', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
          this.roles = [];
          resolve(); // Resolver incluso en error para no bloquear
        }
      });
    });
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

  async abrirDialogoUsuario(usuario?: Usuario): Promise<void> {
    console.log('🔧 Abriendo diálogo de usuario:', usuario);
    this.editMode = !!usuario;
    this.selectedUsuario = usuario || null;
    
    // SIEMPRE recargar roles para asegurar que estén actualizados
    console.log('📊 Roles actuales antes de cargar:', this.roles.length);
    await this.cargarRoles();
    console.log('📊 Roles después de cargar:', this.roles.length);
    
    // Abrir el diálogo después de asegurar que los roles están cargados
    this.abrirDialogoConDatos(usuario);
  }

  private abrirDialogoConDatos(usuario?: Usuario): void {
    this.mostrarDialogo = true;
    
    if (usuario) {
      console.log('✏️ Modo edición - Usuario:', usuario);
      console.log('📋 Rol ID del usuario:', usuario.rol_id);
      console.log('📋 Roles disponibles:', this.roles);
      
      // Modo edición - usar setTimeout para asegurar que el formulario se actualice después de que Angular renderice
      setTimeout(() => {
        const rolId = usuario.rol_id ? Number(usuario.rol_id) : null;
        console.log('🔢 Rol ID convertido a número:', rolId);
        
        // Verificar que el rol existe en la lista de roles disponibles
        const rolExiste = this.roles.some(r => r.id_rol === rolId);
        console.log('✅ Rol existe en la lista:', rolExiste);
        
        if (rolExiste) {
          const rolEncontrado = this.roles.find(r => r.id_rol === rolId);
          console.log('🎯 Rol encontrado:', rolEncontrado);
        }
        
        this.usuarioForm.patchValue({
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          correo: usuario.correo,
          telefono: usuario.telefono || '',
          rol_id: rolExiste ? rolId : null,
          estado: usuario.estado,
          contrasena: '' // No mostrar contraseña actual
        });
        
        console.log('📝 Valor establecido en formulario:', this.usuarioForm.get('rol_id')?.value);
        
        this.usuarioForm.get('contrasena')?.clearValidators();
        this.usuarioForm.get('contrasena')?.updateValueAndValidity();
        
        // Forzar detección de cambios
        this.cdr.detectChanges();
        
        // Segundo setTimeout para asegurar que el mat-select se actualice
        setTimeout(() => {
          if (rolExiste && rolId !== null) {
            console.log('🔄 Estableciendo valor del rol nuevamente:', rolId);
            this.usuarioForm.get('rol_id')?.setValue(rolId, { emitEvent: false });
            this.cdr.detectChanges();
            console.log('✅ Valor final del rol:', this.usuarioForm.get('rol_id')?.value);
          } else {
            console.warn('⚠️ No se pudo establecer el rol - Rol no existe o es null');
          }
        }, 200);
      }, 150);
    } else {
      // Modo creación
      this.usuarioForm.reset({
        estado: 'ACTIVO',
        rol_id: ''
      });
      this.usuarioForm.get('contrasena')?.setValidators([Validators.required, Validators.minLength(8)]);
      this.usuarioForm.get('contrasena')?.updateValueAndValidity();
    }
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
        
        // Solo incluir contraseña si se proporcionó una nueva (no vacía ni solo espacios)
        if (formData.contrasena && formData.contrasena.trim().length > 0) {
          updateData.contrasena = formData.contrasena.trim();
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

  compareRoles(rol1: number, rol2: number): boolean {
    return rol1 === rol2;
  }

  getRolNombre(rolId: number): string {
    const rol = this.roles.find(r => r.id_rol === rolId);
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
        usuario.rol_nombre || this.getRolNombre(usuario.rol_id),
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
      
    } catch (error: any) {
      const mensaje = error?.message || 'Error al exportar a PDF';
      this.snackBar.open(mensaje, 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
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

  // Métodos para gestión de permisos
  abrirModalGenerarRol(): void {
    // Cargar roles antes de abrir el modal
    this.cargarRoles();
    // Abrir modal para seleccionar rol
    this.mostrarModalSeleccionRol = true;
    // Forzar detección de cambios
    this.cdr.detectChanges();
  }

  mostrarModalSeleccionRol = false;

  seleccionarRolParaPermisos(rol: any): void {
    this.mostrarModalSeleccionRol = false;
    this.abrirModalPermisos(rol);
  }

  cerrarModalYabrirCrearRol(): void {
    this.mostrarModalSeleccionRol = false;
    setTimeout(() => {
      this.abrirModalCrearRol();
    }, 100);
  }

  abrirModalCrearRol(): void {
    console.log('🔧 Abriendo modal crear rol');
    this.rolForm.reset({
      nombre: '',
      descripcion: ''
    });
    this.mostrarModalCrearRol = true;
    console.log('✅ mostrarModalCrearRol establecido a:', this.mostrarModalCrearRol);
    // Forzar detección de cambios
    this.cdr.detectChanges();
    // Segundo setTimeout para asegurar que el modal se renderice
    setTimeout(() => {
      this.cdr.detectChanges();
      console.log('✅ Detección de cambios forzada nuevamente');
    }, 50);
  }

  cerrarModalCrearRol(): void {
    this.mostrarModalCrearRol = false;
    this.rolForm.reset();
  }

  crearRol(): void {
    if (this.rolForm.invalid) {
      this.snackBar.open('Por favor completa todos los campos requeridos', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    const nuevoRol: RolCreate = {
      nombre: this.rolForm.get('nombre')?.value?.trim() || '',
      descripcion: this.rolForm.get('descripcion')?.value?.trim() || undefined
    };

    if (!nuevoRol.nombre) {
      this.snackBar.open('El nombre del rol es requerido', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.loading = true;
    this.rolService.crear(nuevoRol).subscribe({
      next: (response) => {
        this.loading = false;
        if (response && response.ok) {
          this.snackBar.open('Rol creado correctamente. Ahora configura sus permisos.', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.cerrarModalCrearRol();
          this.cargarRoles(); // Recargar lista de roles
          
          // Abrir modal de permisos para el nuevo rol
          setTimeout(() => {
            const rolCreado = response.datos;
            if (rolCreado) {
              this.abrirModalPermisos(rolCreado);
            }
          }, 500);
        } else {
          this.snackBar.open('Error al crear el rol', 'Cerrar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      },
      error: (error) => {
        this.loading = false;
        const mensaje = error?.error?.mensaje || error?.message || 'Error al crear el rol';
        this.snackBar.open(mensaje, 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  abrirModalPermisos(rol: any): void {
    if (!rol) {
      this.snackBar.open('Rol inválido', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.rolSeleccionadoParaPermisos = rol;
    this.mostrarModalPermisos = true;
    
    // Resetear formulario primero
    this.opcionesMenu.forEach(opcion => {
      this.permisosForm.get(opcion.clave)?.setValue(false);
    });
    
    // Obtener el ID del rol (puede venir como id_rol o id)
    const rolId = rol.id_rol || rol.id;
    
    if (!rolId) {
      this.snackBar.open('ID de rol inválido', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }
    
    // Cargar permisos existentes si existen
    this.rolPermisosService.obtenerPorRolId(rolId).subscribe({
      next: (response) => {
        if (response && response.ok && response.datos) {
          let permisos: PermisosMenu = {};
          
          // Manejar diferentes formatos de respuesta
          if (response.datos.permisos_menu) {
            if (typeof response.datos.permisos_menu === 'string') {
              try {
                permisos = JSON.parse(response.datos.permisos_menu) as PermisosMenu;
              } catch (e) {
                console.error('Error al parsear permisos_menu:', e);
                permisos = {};
              }
            } else {
              permisos = response.datos.permisos_menu as PermisosMenu;
            }
          }
          
          // Actualizar formulario con permisos existentes
          this.opcionesMenu.forEach(opcion => {
            const tienePermiso = permisos[opcion.clave as keyof PermisosMenu] === true;
            this.permisosForm.get(opcion.clave)?.setValue(tienePermiso);
          });
          
          // Forzar detección de cambios
          this.cdr.detectChanges();
        } else {
          // Si no hay respuesta válida, dejar todos en false
          this.opcionesMenu.forEach(opcion => {
            this.permisosForm.get(opcion.clave)?.setValue(false);
          });
        }
      },
      error: (error) => {
        // Solo loguear errores que no sean 404 (permisos no encontrados es válido)
        if (error.status !== 404) {
          console.error('Error al cargar permisos:', error);
        }
        // Si no hay permisos, se dejan todos en false (comportamiento esperado)
        this.opcionesMenu.forEach(opcion => {
          this.permisosForm.get(opcion.clave)?.setValue(false);
        });
      }
    });
  }

  cerrarModalPermisos(): void {
    this.mostrarModalPermisos = false;
    this.rolSeleccionadoParaPermisos = null;
    // Resetear formulario
    this.opcionesMenu.forEach(opcion => {
      this.permisosForm.get(opcion.clave)?.setValue(false);
    });
  }

  guardarPermisos(): void {
    if (!this.rolSeleccionadoParaPermisos) {
      this.snackBar.open('No hay rol seleccionado', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    const permisosMenu: PermisosMenu = {};
    this.opcionesMenu.forEach(opcion => {
      permisosMenu[opcion.clave as keyof PermisosMenu] = this.permisosForm.get(opcion.clave)?.value || false;
    });

    const rolId = this.rolSeleccionadoParaPermisos.id_rol || this.rolSeleccionadoParaPermisos.id;
    
    if (!rolId) {
      this.snackBar.open('ID de rol inválido', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.loading = true;
    this.rolPermisosService.crearOActualizar(rolId, permisosMenu).subscribe({
      next: (response) => {
        if (response && response.ok) {
          // Verificar si el usuario actual tiene este rol
          const usuarioActual = this.authService.getCurrentUser();
          const rolIdUsuarioActual = usuarioActual?.rol_id;
          
          // Si el usuario actual tiene el rol que se está actualizando, recargar sus permisos
          if (usuarioActual && rolIdUsuarioActual === rolId) {
            this.authService.recargarPermisos().subscribe({
              next: () => {
                this.loading = false;
                this.snackBar.open('Permisos guardados correctamente. El menú se ha actualizado.', 'Cerrar', {
                  duration: 4000,
                  panelClass: ['success-snackbar']
                });
                this.cerrarModalPermisos();
              },
              error: (error) => {
                console.error('Error al recargar permisos:', error);
                this.loading = false;
                this.snackBar.open('Permisos guardados correctamente. Por favor, recarga la página para ver los cambios.', 'Cerrar', {
                  duration: 4000,
                  panelClass: ['success-snackbar']
                });
                this.cerrarModalPermisos();
              }
            });
          } else {
            this.loading = false;
            this.snackBar.open('Permisos guardados correctamente', 'Cerrar', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.cerrarModalPermisos();
          }
        } else {
          this.loading = false;
          this.snackBar.open('Error al guardar permisos', 'Cerrar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      },
      error: (error) => {
        this.loading = false;
        const mensaje = error?.error?.mensaje || error?.message || 'Error al guardar permisos';
        this.snackBar.open(mensaje, 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  seleccionarTodosPermisos(): void {
    this.opcionesMenu.forEach(opcion => {
      this.permisosForm.get(opcion.clave)?.setValue(true);
    });
  }

  deseleccionarTodosPermisos(): void {
    this.opcionesMenu.forEach(opcion => {
      this.permisosForm.get(opcion.clave)?.setValue(false);
    });
  }
}
