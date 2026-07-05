import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { VerificacionService, ReporteVerificaciones } from '../../services/verificacion.service';
import { UsuarioService } from '../../services/usuario.service';
import { SesionService } from '../../services/sesion.service';
import { Verificacion } from '../../models/verificacion.model';
import { EstudianteVerificacion } from '../../models/estudiante-verificacion.model';

interface VerificacionVista {
  verificacion: Verificacion;
  estudiante: EstudianteVerificacion | null;
  procesando: boolean;
  confirmacion: 'aprobado' | 'rechazado' | null;
  error: string;
}

@Component({
  selector: 'app-verificaciones',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './verificaciones.html',
  styleUrl: './verificaciones.css',
})
export class VerificacionesComponent implements OnInit {
  private readonly verificacionSvc = inject(VerificacionService);
  private readonly usuarioSvc = inject(UsuarioService);
  readonly sesionSvc = inject(SesionService);

  // ✅ IMPORTANTE: exponer servicio para el HTML
  readonly sesionSvcRef = this.sesionSvc;

  readonly cargando = signal(true);
  readonly verificaciones = signal<VerificacionVista[]>([]);

  readonly reporte = signal<ReporteVerificaciones | null>(null);
  readonly cargandoReporte = signal(true);

  readonly datosGrafico = computed(() => {
    const r = this.reporte();
    if (!r) return null;

    const total = r.verificados + r.pendientes + r.rechazados;
    const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

    return {
      total,
      verificados: r.verificados,
      pendientes: r.pendientes,
      rechazados: r.rechazados,
      pctVerificados: pct(r.verificados),
      pctPendientes: pct(r.pendientes),
      pctRechazados: pct(r.rechazados),
      totalEstudiantes: r.totalEstudiantes,
    };
  });

  readonly itemARechazar = signal<VerificacionVista | null>(null);

  ngOnInit(): void {
    this.cargar();
    this.cargarReporte();
  }

  cargarReporte(): void {
    this.cargandoReporte.set(true);
    const idUsuario = this.sesionSvc.getUserId();

    if (!idUsuario) {
      this.cargandoReporte.set(false);
      return;
    }

    this.usuarioSvc
      .getById(idUsuario)
      .pipe(catchError(() => of(null)))
      .subscribe((usuario) => {
        const idInstitucion = usuario?.idInstitucion;

        if (!idInstitucion) {
          this.cargandoReporte.set(false);
          return;
        }

        this.verificacionSvc
          .getReportePorInstitucion(idInstitucion)
          .pipe(catchError(() => of(null)))
          .subscribe((rep) => {
            this.reporte.set(rep);
            this.cargandoReporte.set(false);
          });
      });
  }

  cargar(): void {
    this.cargando.set(true);

    this.verificacionSvc
      .getPendientes()
      .pipe(catchError(() => of([] as Verificacion[])))
      .subscribe((lista) => {
        if (lista.length === 0) {
          this.verificaciones.set([]);
          this.cargando.set(false);
          return;
        }

        forkJoin(
          lista.map((v) =>
            this.verificacionSvc
              .getEstudiante(v.idUsuario)
              .pipe(catchError(() => of(null as EstudianteVerificacion | null))),
          ),
        ).subscribe((estudiantes) => {
          this.verificaciones.set(
            lista.map((v, i) => ({
              verificacion: v,
              estudiante: estudiantes[i],
              procesando: false,
              confirmacion: null,
              error: '',
            })),
          );
          this.cargando.set(false);
        });
      });
  }

  aprobar(item: VerificacionVista): void {
    const id = item.verificacion.idVerificacion;
    if (!id) return;

    this.setProcessing(item, true);

    this.verificacionSvc.aprobar(id).subscribe({
      next: () => {
        this.setConfirmacion(item, 'aprobado');
        this.cargarReporte();
        setTimeout(() => this.quitarDeLista(item), 1600);
      },
      error: () => {
        this.setProcessing(item, false);
        this.setError(item, 'No se pudo aprobar. Intenta de nuevo.');
      },
    });
  }

  pedirConfirmacionRechazo(item: VerificacionVista): void {
    this.itemARechazar.set(item);
  }

  cancelarRechazo(): void {
    this.itemARechazar.set(null);
  }

  confirmarRechazo(): void {
    const item = this.itemARechazar();
    this.itemARechazar.set(null);
    if (!item) return;

    const id = item.verificacion.idVerificacion;
    if (!id) return;

    this.setProcessing(item, true);

    this.verificacionSvc.rechazar(id).subscribe({
      next: () => {
        this.setConfirmacion(item, 'rechazado');
        this.cargarReporte();
        setTimeout(() => this.quitarDeLista(item), 1600);
      },
      error: () => {
        this.setProcessing(item, false);
        this.setError(item, 'No se pudo rechazar. Intenta de nuevo.');
      },
    });
  }

  inicial(nombre: string | undefined): string {
    return (nombre ?? '?').charAt(0).toUpperCase();
  }

  private quitarDeLista(item: VerificacionVista): void {
    this.verificaciones.update((list) => list.filter((v) => v !== item));
  }

  private setProcessing(item: VerificacionVista, v: boolean): void {
    this.verificaciones.update((list) =>
      list.map((s) => (s === item ? { ...s, procesando: v, error: '' } : s)),
    );
  }

  private setConfirmacion(item: VerificacionVista, conf: 'aprobado' | 'rechazado'): void {
    this.verificaciones.update((list) =>
      list.map((s) => (s === item ? { ...s, procesando: false, confirmacion: conf } : s)),
    );
  }

  private setError(item: VerificacionVista, error: string): void {
    this.verificaciones.update((list) =>
      list.map((s) => (s === item ? { ...s, procesando: false, error } : s)),
    );
  }
}
