import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./pages/usuarios/usuarios.component').then(m => m.UsuariosComponent)
      },
      {
        path: 'ventas',
        loadComponent: () => import('./pages/ventas/ventas.component').then(m => m.VentasComponent)
      },
      {
        path: 'productos',
        loadComponent: () => import('./pages/productos/productos.component').then(m => m.ProductosComponent)
      },
      {
        path: 'caja',
        loadComponent: () => import('./pages/caja/caja.component').then(m => m.CajaComponent)
      },
      {
        path: 'clientes',
        loadComponent: () => import('./pages/clientes/clientes.component').then(m => m.ClientesComponent)
      },
      {
        path: 'gestion-pedido',
        loadComponent: () => import('./pages/gestion-pedido/gestion-pedido.component').then(m => m.GestionPedidoComponent)
      },
      {
        path: 'inventario',
        loadComponent: () => import('./pages/inventario/inventario.component').then(m => m.InventarioComponent)
      },
      {
        path: 'reporte',
        loadComponent: () => import('./pages/reporte/reporte.component').then(m => m.ReporteComponent)
      },
      {
        path: 'reportes',
        loadComponent: () => import('./pages/reportes/reportes.component').then(m => m.ReportesComponent)
      },
      {
        path: 'configuracion',
        loadComponent: () => import('./pages/configuracion/configuracion.component').then(m => m.ConfiguracionComponent)
      },
      {
        path: 'mantenimiento',
        loadComponent: () => import('./pages/mantenimiento/mantenimiento.component').then(m => m.MantenimientoComponent)
      },
      {
        path: 'mantenimiento/sacramentos',
        loadComponent: () => import('./pages/mantenimiento/sacramentos/sacramentos.component').then(m => m.SacramentosComponent)
      },
      {
        path: 'mantenimiento/tipos-documento',
        loadComponent: () => import('./pages/mantenimiento/tipos-documento/tipos-documento.component').then(m => m.TiposDocumentoComponent)
      },
      {
        path: 'mantenimiento/requisitos',
        loadComponent: () => import('./pages/mantenimiento/requisitos/requisitos.component').then(m => m.RequisitosComponent)
      },
      {
        path: 'mantenimiento/requisitos-por-sacramento',
        loadComponent: () => import('./pages/mantenimiento/requisitos-por-sacramento/requisitos-por-sacramento.component').then(m => m.RequisitosPorSacramentoComponent)
      },
      {
        path: 'mantenimiento/roles-participante',
        loadComponent: () => import('./pages/mantenimiento/roles-participante/roles-participante.component').then(m => m.RolesParticipanteComponent)
      },
      {
        path: 'mantenimiento/comunidades',
        loadComponent: () => import('./pages/mantenimiento/comunidades/comunidades.component').then(m => m.ComunidadesComponent)
      },
      {
        path: 'mantenimiento/tipos-espacio',
        loadComponent: () => import('./pages/mantenimiento/tipos-espacio/tipos-espacio.component').then(m => m.TiposEspacioComponent)
      },
      {
        path: 'feligreses',
        loadComponent: () => import('./pages/feligreses/feligreses.component').then(m => m.FeligresesComponent)
      },
      {
        path: 'sacramentos-asignacion',
        loadComponent: () => import('./pages/sacramentos-asignacion/sacramentos-asignacion.component').then(m => m.SacramentosAsignacionComponent)
      },
      {
        path: 'actividades-religiosas',
        loadComponent: () => import('./pages/actividades-religiosas/actividades-religiosas.component').then(m => m.ActividadesReligiosasComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
