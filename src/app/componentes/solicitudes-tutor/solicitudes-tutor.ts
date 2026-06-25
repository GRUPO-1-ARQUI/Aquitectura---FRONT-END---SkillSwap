import { Component, OnInit, inject, signal } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SolicitudService } from '../../services/solicitud.service';
import { UsuarioService } from '../../services/usuario.service';
import { HabilidadService } from '../../services/habilidad.service';
import { SesionService } from '../../services/sesion.service';
import { Solicitud } from '../../models/solicitud.model';
import { Habilidad } from '../../models/habilidad.model';
import { Usuario } from '../../models/usuario.model';

interface SolicitudVista {
  solicitud: Solicitud;
  aprendizNombre: string;
  aprendizCorreo: string;
  aprendizReputacion?: number;
  habilidadNombre: string;
  procesando: boolean;
}

@Component({
  selector: 'app-solicitudes-tutor',
  standalone: true,
  imports: [],
  templateUrl: './solicitudes-tutor.html',
  styleUrl: './solicitudes-tutor.css',
})
export class SolicitudesTutorComponent implements OnInit {
  private readonly solicitudSvc = inject(SolicitudService);
  private readonly usuarioSvc = inject(UsuarioService);
  private readonly habilidadSvc = inject(HabilidadService);
  private readonly sesion = inject(SesionService);

  readonly solicitudes = signal<SolicitudVista[]>([]);
  readonly cargando = signal(true);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    const uid = this.sesion.getUserId();
    if (!uid) return;
    this.cargando.set(true);

    forkJoin({
      solicitudes: this.solicitudSvc.getByTutor(uid).pipe(catchError(() => of([] as Solicitud[]))),
      habilidades: this.habilidadSvc.getAll().pipe(catchError(() => of([] as Habilidad[]))),
    }).subscribe(({ solicitudes, habilidades }) => {
      const habMap = new Map((habilidades as Habilidad[]).map(h => [h.idHabilidad, h.nombre]));
      const sols = solicitudes as Solicitud[];

      if (sols.length === 0) {
        this.solicitudes.set([]);
        this.cargando.set(false);
        return;
      }

      const uniqueIds = [...new Set(sols.map(s => s.idAprendiz))];
      forkJoin(
        uniqueIds.map(id => this.usuarioSvc.getById(id).pipe(catchError(() => of(null))))
      ).subscribe(usuarios => {
        const aprendizMap = new Map(
          uniqueIds.map((id, i) => [id, usuarios[i] as Usuario | null])
        );
        this.solicitudes.set(sols.map(s => {
          const a = aprendizMap.get(s.idAprendiz);
          return {
            solicitud: s,
            aprendizNombre: a?.nombreCompleto ?? `Aprendiz #${s.idAprendiz}`,
            aprendizCorreo: a?.correoInstitucional ?? '—',
            aprendizReputacion: a?.reputacionPromedio,
            habilidadNombre: habMap.get(s.idHabilidad) ?? `Habilidad #${s.idHabilidad}`,
            procesando: false,
          };
        }));
        this.cargando.set(false);
      });
    });
  }

  aceptar(item: SolicitudVista): void {
    this.setProcessing(item, true);
    this.solicitudSvc.updateEstado(item.solicitud.idSolicitud!, 'aceptado').subscribe({
      next: () => this.cargar(),
      error: () => this.setProcessing(item, false),
    });
  }

  rechazar(item: SolicitudVista): void {
    this.setProcessing(item, true);
    this.solicitudSvc.updateEstado(item.solicitud.idSolicitud!, 'rechazado').subscribe({
      next: () => this.cargar(),
      error: () => this.setProcessing(item, false),
    });
  }

  private setProcessing(item: SolicitudVista, v: boolean): void {
    this.solicitudes.update(list =>
      list.map(s => s === item ? { ...s, procesando: v } : s)
    );
  }

  esPendiente(estado?: string): boolean {
    return (estado?.toLowerCase() ?? '') === 'pendiente';
  }

  pillClass(estado?: string): string {
    const e = estado?.toLowerCase() ?? '';
    if (e === 'aceptado') return 'ss-pill-status-ok';
    if (e === 'rechazado') return 'ss-pill-status-danger';
    return 'ss-pill-status-pending';
  }

  rating(val?: number): string {
    return (val ?? 0).toFixed(1);
  }
}
