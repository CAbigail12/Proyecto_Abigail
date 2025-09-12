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
  
  menuItems: MenuItem[] = [
    {
      title: 'Feligreses',
      description: 'Gestión de feligreses de la parroquia',
      icon: 'people_alt',
      route: '/feligreses',
      disponible: true,
      expanded: false
    },
    {
      title: 'Módulo Sacramentos',
      description: 'Gestión de sacramentos (Bautizo, Confirmación, Matrimonio)',
      icon: 'auto_stories',
      route: '/sacramentos',
      disponible: false,
      expanded: false,
      subItems: [
        { title: 'Bautizo', route: '/bautizo', disponible: false, icon: 'water_drop' },
        { title: 'Confirmación', route: '/confirmacion', disponible: false, icon: 'verified' },
        { title: 'Matrimonio', route: '/matrimonio', disponible: false, icon: 'favorite' }
      ]
    },
    {
      title: 'Actividades Religiosas',
      description: 'Gestión de actividades religiosas',
      icon: 'event_note',
      route: '/actividades',
      disponible: false,
      expanded: false
    },
    {
      title: 'Caja Parroquial',
      description: 'Gestión de ingresos, egresos y balance de caja',
      icon: 'account_balance',
      route: '/caja',
      disponible: true,
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
      disponible: false,
      expanded: false
    },
    {
      title: 'Usuario',
      description: 'Gestión completa de usuarios del sistema',
      icon: 'manage_accounts',
      route: '/usuarios',
      disponible: true,
      expanded: false
    },
    {
      title: 'Mantenimiento',
      description: 'Mantenimiento del sistema',
      icon: 'engineering',
      route: '/mantenimiento',
      disponible: true,
      expanded: false
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
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
