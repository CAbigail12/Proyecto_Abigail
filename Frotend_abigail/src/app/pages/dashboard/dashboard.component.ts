import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SacramentoAsignacionService } from '../../services/sacramento-asignacion.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  // Datos de estadísticas
  totalBautizos: number = 0;
  totalConfirmaciones: number = 0;
  totalMatrimonios: number = 0;
  
  // Estado de carga
  loading: boolean = true;

  constructor(
    private sacramentoService: SacramentoAsignacionService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cargarEstadisticas();
  }

  cargarEstadisticas(): void {
    this.loading = true;
    this.sacramentoService.obtenerEstadisticas().subscribe({
      next: (response) => {
        console.log('📊 Respuesta completa del servidor:', response);
        if (response.ok && response.datos) {
          console.log('📊 Datos recibidos:', response.datos);
          // Asegurar que los valores sean números
          this.totalBautizos = Number(response.datos.total_bautizos) || 0;
          this.totalConfirmaciones = Number(response.datos.total_confirmaciones) || 0;
          this.totalMatrimonios = Number(response.datos.total_matrimonios) || 0;
          
          console.log('📊 Contadores actualizados:', {
            bautizos: this.totalBautizos,
            confirmaciones: this.totalConfirmaciones,
            matrimonios: this.totalMatrimonios
          });
        } else {
          console.warn('⚠️ Respuesta sin datos válidos:', response);
          this.totalBautizos = 0;
          this.totalConfirmaciones = 0;
          this.totalMatrimonios = 0;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error al cargar estadísticas:', error);
        console.error('❌ Detalles del error:', {
          message: error.message,
          status: error.status,
          error: error.error
        });
        this.snackBar.open('Error al cargar las estadísticas de sacramentos', 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.loading = false;
        // Valores por defecto en caso de error
        this.totalBautizos = 0;
        this.totalConfirmaciones = 0;
        this.totalMatrimonios = 0;
      }
    });
  }
}
