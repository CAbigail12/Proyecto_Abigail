import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SacramentoAsignacionService } from '../../services/sacramento-asignacion.service';
import { SacramentoAsignacion } from '../../models/sacramento-asignacion.model';

interface DiaCalendario {
  fecha: Date;
  numero: number;
  esMesActual: boolean;
  esHoy: boolean;
  sacramentos: SacramentoAsignacion[];
}

@Component({
  selector: 'app-calendario-sacramentos',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './calendario-sacramentos.component.html',
  styleUrls: ['./calendario-sacramentos.component.css']
})
export class CalendarioSacramentosComponent implements OnInit {
  loading = false;
  fechaActual = new Date();
  mesActual = this.fechaActual.getMonth();
  anioActual = this.fechaActual.getFullYear();
  diasCalendario: DiaCalendario[] = [];
  asignaciones: SacramentoAsignacion[] = [];
  asignacionesPorFecha: Map<string, SacramentoAsignacion[]> = new Map();
  fechaSeleccionada: Date | null = null;
  sacramentosFechaSeleccionada: SacramentoAsignacion[] = [];
  mostrarDetalles = false;

  nombresMeses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  constructor(
    private sacramentoAsignacionService: SacramentoAsignacionService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cargarAsignaciones();
  }

  cargarAsignaciones(): void {
    this.loading = true;
    this.sacramentoAsignacionService.obtenerAsignaciones({})
      .subscribe({
        next: (response) => {
          if (response.ok) {
            this.asignaciones = response.datos.asignaciones || [];
            this.organizarAsignacionesPorFecha();
            this.generarCalendario();
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar asignaciones:', error);
          this.snackBar.open('Error al cargar los sacramentos', 'Cerrar', { duration: 3000 });
          this.loading = false;
        }
      });
  }

  organizarAsignacionesPorFecha(): void {
    this.asignacionesPorFecha.clear();
    this.asignaciones.forEach(asignacion => {
      // Parsear la fecha de manera segura, ignorando timezone
      const fecha = this.parsearFechaLocal(asignacion.fecha_celebracion);
      const fechaKey = this.obtenerClaveFecha(fecha);
      
      if (!this.asignacionesPorFecha.has(fechaKey)) {
        this.asignacionesPorFecha.set(fechaKey, []);
      }
      this.asignacionesPorFecha.get(fechaKey)!.push(asignacion);
    });
  }

  parsearFechaLocal(fechaString: string | Date): Date {
    // Si ya es un Date, retornarlo
    if (fechaString instanceof Date) {
      return fechaString;
    }
    
    // Si es un string, parsearlo de manera segura
    // Formato esperado: "YYYY-MM-DD" o "YYYY-MM-DDTHH:mm:ss"
    const partes = fechaString.split('T')[0].split('-');
    if (partes.length === 3) {
      const anio = parseInt(partes[0], 10);
      const mes = parseInt(partes[1], 10) - 1; // Los meses en Date son 0-indexed
      const dia = parseInt(partes[2], 10);
      // Crear fecha en hora local, sin considerar timezone
      return new Date(anio, mes, dia, 12, 0, 0); // Usar mediodía para evitar problemas de timezone
    }
    
    // Fallback: intentar parsear normalmente
    return new Date(fechaString);
  }

  obtenerClaveFecha(fecha: Date): string {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }

  generarCalendario(): void {
    this.diasCalendario = [];
    
    // Primer día del mes (usar mediodía para evitar problemas de timezone)
    const primerDia = new Date(this.anioActual, this.mesActual, 1, 12, 0, 0);
    // Último día del mes
    const ultimoDia = new Date(this.anioActual, this.mesActual + 1, 0, 12, 0, 0);
    
    // Día de la semana del primer día (0 = domingo, 6 = sábado)
    const diaSemanaInicio = primerDia.getDay();
    
    // Días del mes anterior para completar la primera semana
    const mesAnterior = new Date(this.anioActual, this.mesActual, 0, 12, 0, 0);
    const diasMesAnterior = mesAnterior.getDate();
    
    // Agregar días del mes anterior
    for (let i = diaSemanaInicio - 1; i >= 0; i--) {
      const fecha = new Date(this.anioActual, this.mesActual - 1, diasMesAnterior - i, 12, 0, 0);
      const dia: DiaCalendario = {
        fecha: fecha,
        numero: fecha.getDate(),
        esMesActual: false,
        esHoy: this.esHoy(fecha),
        sacramentos: this.obtenerSacramentosPorFecha(fecha)
      };
      this.diasCalendario.push(dia);
    }
    
    // Agregar días del mes actual
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      const fecha = new Date(this.anioActual, this.mesActual, dia, 12, 0, 0);
      const diaCal: DiaCalendario = {
        fecha: fecha,
        numero: dia,
        esMesActual: true,
        esHoy: this.esHoy(fecha),
        sacramentos: this.obtenerSacramentosPorFecha(fecha)
      };
      this.diasCalendario.push(diaCal);
    }
    
    // Completar con días del mes siguiente para tener 6 semanas
    const diasRestantes = 42 - this.diasCalendario.length;
    for (let dia = 1; dia <= diasRestantes; dia++) {
      const fecha = new Date(this.anioActual, this.mesActual + 1, dia, 12, 0, 0);
      const diaCal: DiaCalendario = {
        fecha: fecha,
        numero: dia,
        esMesActual: false,
        esHoy: this.esHoy(fecha),
        sacramentos: this.obtenerSacramentosPorFecha(fecha)
      };
      this.diasCalendario.push(diaCal);
    }
  }

  obtenerSacramentosPorFecha(fecha: Date): SacramentoAsignacion[] {
    const clave = this.obtenerClaveFecha(fecha);
    return this.asignacionesPorFecha.get(clave) || [];
  }

  esHoy(fecha: Date): boolean {
    const hoy = new Date();
    // Normalizar ambas fechas a mediodía para comparación precisa
    const hoyNormalizado = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 12, 0, 0);
    const fechaNormalizada = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), 12, 0, 0);
    return fechaNormalizada.getTime() === hoyNormalizado.getTime();
  }

  esPasado(fecha: Date): boolean {
    const hoy = new Date();
    // Normalizar ambas fechas a inicio del día (00:00:00) para comparación precisa
    const hoyNormalizado = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 0, 0, 0, 0);
    const fechaNormalizada = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), 0, 0, 0, 0);
    // Es pasado si la fecha es estrictamente menor que hoy (no incluye hoy)
    return fechaNormalizada.getTime() < hoyNormalizado.getTime();
  }

  esFechaPasada(fechaString: string | Date | null | undefined): boolean {
    if (!fechaString) {
      return false;
    }
    try {
      const fecha = this.parsearFechaLocal(fechaString);
      return this.esPasado(fecha);
    } catch (error) {
      console.error('Error al verificar si fecha es pasada:', error);
      return false;
    }
  }

  mesAnterior(): void {
    if (this.mesActual === 0) {
      this.mesActual = 11;
      this.anioActual--;
    } else {
      this.mesActual--;
    }
    this.generarCalendario();
  }

  mesSiguiente(): void {
    if (this.mesActual === 11) {
      this.mesActual = 0;
      this.anioActual++;
    } else {
      this.mesActual++;
    }
    this.generarCalendario();
  }

  irAHoy(): void {
    this.fechaActual = new Date();
    this.mesActual = this.fechaActual.getMonth();
    this.anioActual = this.fechaActual.getFullYear();
    this.generarCalendario();
  }

  seleccionarFecha(dia: DiaCalendario): void {
    if (dia.sacramentos.length > 0) {
      this.fechaSeleccionada = dia.fecha;
      this.sacramentosFechaSeleccionada = dia.sacramentos;
      this.mostrarDetalles = true;
    }
  }

  cerrarDetalles(): void {
    this.mostrarDetalles = false;
    this.fechaSeleccionada = null;
    this.sacramentosFechaSeleccionada = [];
  }

  obtenerNombreSacramento(idSacramento: number): string {
    const nombres: { [key: number]: string } = {
      1: 'Bautizo',
      2: 'Primera Comunión',
      3: 'Confirmación',
      4: 'Matrimonio'
    };
    return nombres[idSacramento] || 'Sacramento';
  }

  obtenerColorSacramento(idSacramento: number): string {
    const colores: { [key: number]: string } = {
      1: 'bg-blue-500',
      2: 'bg-green-500',
      3: 'bg-purple-500',
      4: 'bg-pink-500'
    };
    return colores[idSacramento] || 'bg-gray-500';
  }

  obtenerNombresParticipantes(asignacion: SacramentoAsignacion): string {
    if (!asignacion.participantes || asignacion.participantes.length === 0) {
      return 'No especificado';
    }
    const nombres = asignacion.participantes
      .filter(p => p && (p.nombre_completo || (p.primer_nombre && p.primer_apellido)))
      .map(p => {
        if (p.nombre_completo && p.nombre_completo.trim()) {
          return p.nombre_completo.trim();
        }
        if (p.primer_nombre && p.primer_apellido) {
          return `${p.primer_nombre.trim()} ${p.primer_apellido.trim()}`;
        }
        return null;
      })
      .filter(nombre => nombre !== null);
    
    return nombres.length > 0 ? nombres.join(', ') : 'No especificado';
  }

  formatearFecha(fecha: Date): string {
    return fecha.toLocaleDateString('es-GT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatearFechaCelebracion(fechaString: string | Date | null | undefined): string {
    if (!fechaString) {
      return 'No especificado';
    }
    try {
      const fecha = this.parsearFechaLocal(fechaString);
      return fecha.toLocaleDateString('es-GT', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return 'No especificado';
    }
  }

  obtenerValorOEspecificado(valor: string | null | undefined): string {
    if (!valor || (typeof valor === 'string' && !valor.trim())) {
      return 'No especificado';
    }
    return valor.trim();
  }

  obtenerMontoPagado(monto: number | null | undefined): string {
    if (!monto || monto === 0) {
      return 'No especificado';
    }
    return `Q ${monto.toFixed(2)}`;
  }
}

