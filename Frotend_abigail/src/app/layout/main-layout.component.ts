import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';

interface MenuItem {
  title: string;
  description: string;
  icon: string;
  route: string;
  disponible: boolean;
  expanded?: boolean;
  subItems?: SubMenuItem[];
}

interface SubMenuItem {
  title: string;
  route: string;
  disponible: boolean;
  icon?: string;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent implements OnInit {
  currentUser: any = null;
  menuAbierto = false;
  
  menuItems: MenuItem[] = [];

  // Mapeo de rutas a claves de permisos
  private permisosMap: { [key: string]: string } = {
    '/feligreses': 'feligreses',
    '/sacramentos-asignacion': 'sacramentos_asignacion',
    '/calendario-sacramentos': 'calendario_sacramentos',
    '/actividades-religiosas': 'actividades_religiosas',
    '/caja': 'caja_parroquial',
    '/reportes': 'reportes',
    '/usuarios': 'usuarios',
    '/mantenimiento': 'mantenimiento'
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.construirMenu();
    
    // Suscribirse a cambios en el usuario para reconstruir el menú
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.construirMenu();
    });
  }

  construirMenu(): void {
    const permisos = this.authService.getPermisosMenu();
    const esAdmin = this.authService.isAdmin();
    
    // Verificar si hay permisos configurados
    const tienePermisosConfigurados = permisos && Object.keys(permisos).length > 0;
    
    // Si no es admin y no tiene permisos configurados, solo mostrar dashboard
    // El dashboard siempre está disponible (se muestra fuera de este array)
    if (!esAdmin && !tienePermisosConfigurados) {
      this.menuItems = [];
      return;
    }
    
    // Definir todos los items del menú
    // IMPORTANTE: Si hay permisos configurados, respetarlos incluso para administradores
    const todosLosItems: MenuItem[] = [
      {
        title: 'Feligreses',
        description: 'Gestión de feligreses de la parroquia',
        icon: 'people_alt',
        route: '/feligreses',
        disponible: tienePermisosConfigurados 
          ? permisos['feligreses'] === true 
          : esAdmin, // Solo si no hay permisos configurados, usar esAdmin
        expanded: false
      },
      {
        title: 'Asignación de Sacramentos',
        description: 'Gestión de sacramentos (Bautizo, Confirmación, Matrimonio)',
        icon: 'auto_stories',
        route: '/sacramentos-asignacion',
        disponible: tienePermisosConfigurados 
          ? permisos['sacramentos_asignacion'] === true 
          : esAdmin,
        expanded: false
      },
      {
        title: 'Calendario de Sacramentos',
        description: 'Visualización de sacramentos en calendario',
        icon: 'calendar_month',
        route: '/calendario-sacramentos',
        disponible: tienePermisosConfigurados 
          ? permisos['calendario_sacramentos'] === true 
          : esAdmin,
        expanded: false
      },
      {
        title: 'Actividades Religiosas',
        description: 'Gestión de actividades religiosas',
        icon: 'event_note',
        route: '/actividades-religiosas',
        disponible: tienePermisosConfigurados 
          ? permisos['actividades_religiosas'] === true 
          : esAdmin,
        expanded: false
      },
      {
        title: 'Caja Parroquial',
        description: 'Gestión de ingresos, egresos y balance de caja',
        icon: 'account_balance',
        route: '/caja',
        disponible: tienePermisosConfigurados 
          ? permisos['caja_parroquial'] === true 
          : esAdmin,
        expanded: false,
        subItems: [
          { title: 'Agregar Ingresos', route: '/ingresos', disponible: false, icon: 'add_circle' },
          { title: 'Agregar Egresos', route: '/egresos', disponible: false, icon: 'remove_circle' },
          { title: 'Balance de Caja', route: '/balance', disponible: false, icon: 'account_balance' }
        ]
      },
      {
        title: 'Reportes',
        description: 'Reportes y estadísticas de la parroquia',
        icon: 'analytics',
        route: '/reportes',
        disponible: tienePermisosConfigurados 
          ? permisos['reportes'] === true 
          : esAdmin,
        expanded: false
      },
      {
        title: 'Usuario',
        description: 'Gestión completa de usuarios del sistema',
        icon: 'manage_accounts',
        route: '/usuarios',
        disponible: tienePermisosConfigurados 
          ? permisos['usuarios'] === true 
          : esAdmin,
        expanded: false
      },
      {
        title: 'Mantenimiento',
        description: 'Mantenimiento del sistema',
        icon: 'engineering',
        route: '/mantenimiento',
        disponible: tienePermisosConfigurados 
          ? permisos['mantenimiento'] === true 
          : esAdmin,
        expanded: false
      }
    ];
    
    // Filtrar solo los items disponibles
    this.menuItems = todosLosItems.filter(item => item.disponible);
  }

  toggleMenu(): void {
    this.menuAbierto = !this.menuAbierto;
  }

  toggleMenuExpansion(item: MenuItem): void {
    if (item.subItems && item.subItems.length > 0) {
      item.expanded = !item.expanded;
    }
  }

  onMenuClick(item: MenuItem): void {
    if (item.disponible) {
      this.router.navigate([item.route]);
      // Cerrar menú en móvil después de navegar
      if (window.innerWidth < 768) {
        this.menuAbierto = false;
      }
    } else {
      this.snackBar.open(`🚧 ${item.title} - Próximamente disponible 🚧`, '', {
        duration: 3000,
        panelClass: ['info-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
    }
  }

  onSubMenuClick(subItem: any): void {
    console.log('🎯 onSubMenuClick llamado con:', subItem);
    if (subItem.disponible) {
      console.log('🎯 Navegando a:', subItem.route);
      this.router.navigate([subItem.route]);
      // Cerrar menú en móvil después de navegar
      if (window.innerWidth < 768) {
        this.menuAbierto = false;
      }
    } else {
      this.snackBar.open(`🚧 ${subItem.title} - Próximamente disponible 🚧`, '', {
        duration: 3000,
        panelClass: ['info-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
    }
  }

  logout(): void {
    this.authService.logout();
    this.snackBar.open('Sesión cerrada correctamente', 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
    // Usar setTimeout para asegurar que el logout se complete antes de navegar
    setTimeout(() => {
      this.router.navigate(['/login']).then(() => {
        // Forzar recarga de la página para limpiar cualquier estado residual
        window.location.reload();
      });
    }, 100);
  }

  navigateToHome(): void {
    this.router.navigate(['/dashboard']);
    // Cerrar menú en móvil después de navegar
    if (window.innerWidth < 768) {
      this.menuAbierto = false;
    }
  }

  isActiveRoute(route: string): boolean {
    return this.router.url === route;
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('es-GT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
