import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SolicitudService } from '../../services/solicitud.service';
import { UsuarioService } from '../../services/usuario.service';
import { HabilidadService } from '../../services/habilidad.service';
import { ResenaService } from '../../services/resena.service';
import { SesionService } from '../../services/sesion.service';
import { Solicitud } from '../../models/solicitud.model';
import { Habilidad } from '../../models/habilidad.model';
import { Usuario } from '../../models/usuario.model';
import { ChatDialogComponent } from '../chat-dialog/chat-dialog';

interface SolicitudVista {
  solicitud: Solicitud;
  tutorNombre: string;
  habilidadNombre: string;
  tutorId: number;
  yaCalificado: boolean;
}

@Component({
  selector: 'app-mis-solicitudes',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatDialogComponent],
  templateUrl: './mis-solicitudes.html',
  styleUrl: './mis-solicitudes.css',
})
export class MisSolicitudesComponent implements OnInit {
  private readonly solicitudSvc = inject(SolicitudService);
  private readonly usuarioSvc = inject(UsuarioService);
  private readonly habilidadSvc = inject(HabilidadService);
  private readonly resenaSvc = inject(ResenaService);
  private readonly sesion = inject(SesionService);

  readonly solicitudes = signal<SolicitudVista[]>([]);
  readonly cargando = signal(true);

  readonly modalAbierto = signal(false);
  readonly enviando = signal(false);
  readonly calificarOk = signal(false);
  readonly calificarErr = signal('');

  readonly chatAbierto = signal(false);
  solicitudParaChat: SolicitudVista | null = null;

  solicitudActual: SolicitudVista | null = null;
  calificacion = 0;
  comentario = '';
  readonly starRange = [1, 2, 3, 4, 5];

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    const uid = this.sesion.getUserId();
    if (!uid) {
      this.cargando.set(false);
      return;
    }

    this.cargando.set(true);

    forkJoin({
      solicitudes: this.solicitudSvc.getByAprendiz(uid).pipe(catchError(() => of([] as Solicitud[]))),
      habilidades: this.habilidadSvc.getAll().pipe(catchError(() => of([] as Habilidad[]))),
    }).subscribe(({ solicitudes, habilidades }) => {
      const habMap = new Map((habilidades as Habilidad[]).map((h) => [h.idHabilidad, h.nombre]));
      const sols = solicitudes as Solicitud[];

      if (sols.length === 0) {
        this.solicitudes.set([]);
        this.cargando.set(false);
        return;
      }

      const uniqueTutorIds = [...new Set(sols.map((s) => s.idTutor))];
      forkJoin(
        uniqueTutorIds.map((id) => this.usuarioSvc.getById(id).pipe(catchError(() => of(null)))),
      ).subscribe((tutores) => {
        const tutorMap = new Map(
          uniqueTutorIds.map((id, i) => [
            id,
            (tutores[i] as Usuario | null)?.nombreCompleto ?? `Tutor #${id}`,
          ]),
        );
        this.solicitudes.set(
          sols.map((s) => ({
            solicitud: s,
            tutorNombre: tutorMap.get(s.idTutor) ?? `Tutor #${s.idTutor}`,
            habilidadNombre: habMap.get(s.idHabilidad) ?? `Habilidad #${s.idHabilidad}`,
            tutorId: s.idTutor,
            yaCalificado: false,
          })),
        );
        this.cargando.set(false);
      });
    });
  }

  puedeAbrirChat(estado?: string): boolean {
    return this.esEstadoAceptado(estado);
  }

  puedeCalificar(estado?: string): boolean {
    return this.esEstadoAceptado(estado) || this.esEstadoCerrado(estado);
  }

  abrirChat(item: SolicitudVista): void {
    this.solicitudParaChat = item;
    this.chatAbierto.set(true);
  }

  cerrarChat(): void {
    this.chatAbierto.set(false);
    this.solicitudParaChat = null;
  }

  abrirModalCalificar(item: SolicitudVista): void {
    this.solicitudActual = item;
    this.calificacion = 0;
    this.comentario = '';
    this.calificarOk.set(false);
    this.calificarErr.set('');
    this.modalAbierto.set(true);
  }

  cerrarModal(): void {
    this.modalAbierto.set(false);
  }

  setStar(n: number): void {
    this.calificacion = n;
  }

  enviarCalificacion(): void {
    const uid = this.sesion.getUserId();
    const sol = this.solicitudActual;
    if (!uid || !sol || this.calificacion === 0) return;

    this.enviando.set(true);
    this.calificarErr.set('');

    this.resenaSvc
      .create({
        idSesion: sol.solicitud.idSolicitud ?? 0,
        idUsuarioEvaluador: uid,
        idUsuarioEvaluado: sol.tutorId,
        calificacion: this.calificacion,
        comentario: this.comentario.trim() || undefined,
      })
      .subscribe({
        next: () => {
          this.enviando.set(false);
          this.calificarOk.set(true);
          this.solicitudes.update((list) =>
            list.map((s) => (s === sol ? { ...s, yaCalificado: true } : s)),
          );
          setTimeout(() => this.cerrarModal(), 2000);
        },
        error: (err) => {
          this.enviando.set(false);
          const detalle = this.formatearErrorBackend(err);
          this.calificarErr.set(`No se pudo enviar la calificacion.${detalle ? ` ${detalle}` : ' Intenta de nuevo.'}`);
          console.error('Error enviando calificacion del tutor:', JSON.stringify(err?.error ?? err, null, 2));
        },
      });
  }

  estadoPill(estado?: string): string {
    const e = this.normalizarEstado(estado);
    if (this.esEstadoAceptado(estado) || this.esEstadoCerrado(estado)) return 'ok';
    if (e === 'rechazado' || e === 'rechazada' || e === 'rejected') return 'danger';
    return 'pending';
  }

  private esEstadoAceptado(estado?: string): boolean {
    const e = this.normalizarEstado(estado);
    return e === 'aceptado' || e === 'aceptada' || e === 'aprobado' || e === 'aprobada' || e === 'accepted';
  }

  private esEstadoCerrado(estado?: string): boolean {
    const e = this.normalizarEstado(estado);
    return e === 'finalizado' || e === 'finalizada' || e === 'completado' || e === 'completada' || e === 'completed';
  }

  private normalizarEstado(estado?: string): string {
    return (estado ?? '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  private formatearErrorBackend(err: unknown): string {
    const error = err as { error?: { fieldErrors?: Record<string, unknown> } | Record<string, unknown> };
    const detalle = error?.error && 'fieldErrors' in error.error ? error.error.fieldErrors : error?.error;

    if (!detalle || typeof detalle !== 'object') return '';

    if (Array.isArray(detalle)) {
      return detalle
        .map((item) => {
          if (!item || typeof item !== 'object') return String(item);
          const row = item as Record<string, unknown>;
          const campo = row['field'] ?? row['campo'] ?? row['name'];
          const mensaje = row['message'] ?? row['mensaje'] ?? row['defaultMessage'];
          return campo ? `${String(campo)}: ${String(mensaje ?? item)}` : String(mensaje ?? JSON.stringify(item));
        })
        .join(' | ');
    }

    return Object.entries(detalle as Record<string, unknown>)
      .map(([campo, mensaje]) => `${campo}: ${String(mensaje)}`)
      .join(' | ');
  }
}
