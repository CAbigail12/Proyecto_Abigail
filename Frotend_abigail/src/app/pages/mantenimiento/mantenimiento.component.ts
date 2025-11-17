import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

interface CatalogoCard {
  id: string;
  titulo: string;
  descripcion: string;
  icono: string;
  color: string;
  ruta: string;
  totalRegistros?: number;
}

@Component({
  selector: 'app-mantenimiento',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './mantenimiento.component.html',
  styleUrls: ['./mantenimiento.component.css'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class MantenimientoComponent implements OnInit {
  
  catalogos: CatalogoCard[] = [
    {
      id: 'sacramentos',
      titulo: 'Sacramentos',
      descripcion: 'Gestiona los sacramentos que administra la parroquia (Bautizo, Primera Comunión, Confirmación, etc.)',
      icono: 'church',
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      ruta: '/mantenimiento/sacramentos'
    },
    {
      id: 'tipos-documento',
      titulo: 'Tipos de Documento',
      descripcion: 'Administra los tipos de documentos aceptados para adjuntar en solicitudes',
      icono: 'description',
      color: 'bg-gradient-to-br from-green-500 to-green-600',
      ruta: '/mantenimiento/tipos-documento'
    },
    {
      id: 'requisitos',
      titulo: 'Requisitos',
      descripcion: 'Gestiona los requisitos generales que podrían exigirse según el sacramento',
      icono: 'assignment',
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      ruta: '/mantenimiento/requisitos'
    },
    {
      id: 'requisitos-por-sacramento',
      titulo: 'Requisitos por Sacramento',
      descripcion: 'Define qué requisitos aplican a cada sacramento y si son obligatorios u opcionales',
      icono: 'link',
      color: 'bg-gradient-to-br from-orange-500 to-orange-600',
      ruta: '/mantenimiento/requisitos-por-sacramento'
    },
    {
      id: 'roles-participante',
      titulo: 'Roles de Participante',
      descripcion: 'Administra los roles posibles dentro de una ceremonia (Padrino, Madrina, Testigo, etc.)',
      icono: 'people',
      color: 'bg-gradient-to-br from-pink-500 to-pink-600',
      ruta: '/mantenimiento/roles-participante'
    },
    {
      id: 'comunidades',
      titulo: 'Comunidades',
      descripcion: 'Gestiona las comunidades/parroquias/zonas atendidas por la parroquia',
      icono: 'location_city',
      color: 'bg-gradient-to-br from-teal-500 to-teal-600',
      ruta: '/mantenimiento/comunidades'
    },
    {
      id: 'tipos-espacio',
      titulo: 'Tipos de Espacio',
      descripcion: 'Administra los tipos genéricos de espacios donde se realizan ceremonias',
      icono: 'home',
      color: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
      ruta: '/mantenimiento/tipos-espacio'
    },
    {
      id: 'parrocos',
      titulo: 'Párrocos',
      descripcion: 'Gestiona el registro de párrocos de la parroquia',
      icono: 'person',
      color: 'bg-gradient-to-br from-amber-500 to-amber-600',
      ruta: '/mantenimiento/parrocos'
    }
  ];

  constructor() { }

  ngOnInit(): void {
    // Aquí se podrían cargar estadísticas de cada catálogo
    this.cargarEstadisticas();
  }

  private cargarEstadisticas(): void {
    // TODO: Implementar carga de estadísticas desde el backend si se necesita en el futuro
    // Por ahora no se cargan estadísticas
  }

  navegarACatalogo(ruta: string): void {
    // La navegación se maneja con el router de Angular
    console.log(`Navegando a: ${ruta}`);
  }

  trackByCatalogoId(index: number, catalogo: CatalogoCard): string {
    return catalogo.id;
  }
}
