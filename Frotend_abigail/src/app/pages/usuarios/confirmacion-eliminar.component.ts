import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-confirmacion-eliminar',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="p-6 max-w-md mx-auto">
      <!-- Icono de advertencia -->
      <div class="flex justify-center mb-4">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <mat-icon class="text-red-600 text-3xl">warning</mat-icon>
        </div>
      </div>

      <!-- Título -->
      <h2 class="text-xl font-bold text-gray-900 text-center mb-2">
        Confirmar Eliminación
      </h2>

      <!-- Mensaje -->
      <p class="text-gray-600 text-center mb-6">
        ¿Está seguro de que desea eliminar al usuario 
        <strong>{{ data.usuario.nombre }} {{ data.usuario.apellido }}</strong>?
      </p>

      <!-- Información adicional -->
      <div class="bg-gray-50 rounded-lg p-4 mb-6">
        <div class="text-sm text-gray-600 space-y-1">
          <div><strong>ID:</strong> {{ data.usuario.id_usuario }}</div>
          <div><strong>Correo:</strong> {{ data.usuario.correo }}</div>
          <div><strong>Rol:</strong> {{ data.usuario.rol_nombre || 'N/A' }}</div>
        </div>
      </div>

      <!-- Advertencia -->
      <div class="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
        <div class="flex items-center">
          <mat-icon class="text-red-600 mr-2">info</mat-icon>
          <span class="text-sm text-red-700">
            Esta acción no se puede deshacer. El usuario será eliminado permanentemente.
          </span>
        </div>
      </div>

      <!-- Botones -->
      <div class="flex justify-end space-x-3">
        <button 
          mat-button 
          (click)="cancelar()"
          class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Cancelar
        </button>
        <button 
          mat-raised-button 
          color="warn"
          (click)="confirmar()"
          class="px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors"
        >
          <mat-icon class="mr-2">delete</mat-icon>
          Eliminar Usuario
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ConfirmacionEliminarComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmacionEliminarComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { usuario: Usuario }
  ) {}

  cancelar(): void {
    this.dialogRef.close(false);
  }

  confirmar(): void {
    this.dialogRef.close(true);
  }
}


