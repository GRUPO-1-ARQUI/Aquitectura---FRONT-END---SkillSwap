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
import { Resena } from '../../models/resena.model';
import { ChatDialogComponent } from '../chat-dialog/chat-dialog';

interface SolicitudVista {
  solicitud: Solicitud;
  aprendizNombre: string;
  aprendizCorreo: string;
  aprendizReputacion?: number;
  habilidadNombre: string;
  procesando: boolean;
  yaCalificado: boolean;
}

@Component({
  selector: 'app-solicitudes-tutor',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatDialogComponent],
  templateUrl: './solicitudes-tutor.html',
  styleUrl: './solicitudes-tutor.css',
})
export class SolicitudesTutorComponent implements OnInit {
  private readonly solicitudSvc = inject(SolicitudService);
  private readonly usuarioSvc = inject(UsuarioService);
  private readonly habilidadSvc = inject(HabilidadService);
  private readonly resenaSvc = inject(ResenaService);
  private readonly sesion = inject(SesionService);

  readonly solicitudes = signal<SolicitudVista[]>([]);
  readonly cargando = signal(true);

  readonly chatAbierto = signal(false);
  solicitudParaChat: SolicitudVista | null = null;

  readonly modalCalificarAbierto = signal(false);
  readonly enviandoCalificacion = signal(false);
  readonly calificarOk = signal(false);
  readonly calificarErr = signal('');
  solicitudParaCalificar: SolicitudVista | null = null;
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
      solicitudes: this.solicitudSvc.getByTutor(uid).pipe(catchError(() => of([] as Solicitud[]))),
      habilidades: this.habilidadSvc.getAll().pipe(catchError(() => of([] as Habilidad[]))),
      // El backend aun no tiene una entidad "Sesion" conectada: por ahora una resena
      // se identifica con idSesion === idSolicitud, igual que en mis-solicitudes.
      resenas: this.resenaSvc.getByEvaluado(uid).pipe(catchError(() => of([] as Resena[]))),
    }).subscribe(({ solicitudes, habilidades, resenas }) => {
      const habMap = new Map((habilidades as Habilidad[]).map((h) => [h.idHabilidad, h.nombre]));
      const sols = solicitudes as Solicitud[];
      const idsCalificados = new Set((resenas as Resena[]).map((r) => r.idSesion));

      if (sols.length === 0) {
        this.solicitudes.set([]);
        this.cargando.set(false);
        return;
      }

      const uniqueIds = [...new Set(sols.map((s) => s.idAprendiz))];
      forkJoin(
        uniqueIds.map((id) => this.usuarioSvc.getById(id).pipe(catchError(() => of(null)))),
      ).subscribe((usuarios) => {
        const aprendizMap = new Map(
          uniqueIds.map((id, i) => [id, usuarios[i] as Usuario | null]),
        );
        this.solicitudes.set(
          sols.map((s) => {
            const a = aprendizMap.get(s.idAprendiz);
            return {
              solicitud: s,
              aprendizNombre: a?.nombreCompleto ?? `Aprendiz #${s.idAprendiz}`,
              aprendizCorreo: a?.correoInstitucional ?? '-',
              aprendizReputacion: a?.reputacionPromedio,
              habilidadNombre: habMap.get(s.idHabilidad) ?? `Habilidad #${s.idHabilidad}`,
              procesando: false,
              yaCalificado: idsCalificados.has(s.idSolicitud ?? -1),
            };
          }),
        );
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

  esPendiente(estado?: string): boolean {
    const e = this.normalizarEstado(estado);
    return e === 'pendiente' || e === 'pending';
  }

  esCompletada(estado?: string): boolean {
    return this.esEstadoAceptado(estado) || this.esEstadoCerrado(estado);
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

  finalizarChatYCalificar(): void {
    const item = this.solicitudParaChat;
    if (!item) return;

    const idSolicitud = item.solicitud.idSolicitud;
    this.cerrarChat();

    if (!idSolicitud) {
      this.abrirModalCalificar(item);
      return;
    }

    this.solicitudSvc.updateEstado(idSolicitud, 'finalizado').subscribe({
      next: () => {
        this.abrirModalCalificar({
          ...item,
          solicitud: { ...item.solicitud, estado: 'finalizado' },
        });
        this.cargar();
      },
      error: (err) => {
        console.error('No se pudo persistir estado finalizado:', JSON.stringify(err?.error ?? err, null, 2));
        this.abrirModalCalificar(item);
      },
    });
  }

  abrirModalCalificar(item: SolicitudVista): void {
    this.solicitudParaCalificar = item;
    this.calificacion = 0;
    this.comentario = '';
    this.calificarOk.set(false);
    this.calificarErr.set('');
    this.modalCalificarAbierto.set(true);
  }

  cerrarModalCalificar(): void {
    this.modalCalificarAbierto.set(false);
  }

  setStar(n: number): void {
    this.calificacion = n;
  }

  enviarCalificacion(): void {
    const uid = this.sesion.getUserId();
    const item = this.solicitudParaCalificar;

    if (!uid || !item || this.calificacion === 0) return;

    this.enviandoCalificacion.set(true);
    this.calificarErr.set('');

    this.resenaSvc
      .create({
        idSesion: item.solicitud.idSolicitud ?? 0,
        idUsuarioEvaluador: uid,
        idUsuarioEvaluado: item.solicitud.idAprendiz,
        calificacion: this.calificacion,
        comentario: this.comentario.trim() || undefined,
      })
      .subscribe({
        next: () => {
          this.enviandoCalificacion.set(false);
          this.calificarOk.set(true);
          this.solicitudes.update((list) =>
            list.map((s) => (s === item ? { ...s, yaCalificado: true } : s)),
          );
          setTimeout(() => this.cerrarModalCalificar(), 2000);
        },
        error: (err) => {
          this.enviandoCalificacion.set(false);
          const detalle = this.formatearErrorBackend(err);
          this.calificarErr.set(`No se pudo enviar la calificacion.${detalle ? ` ${detalle}` : ' Intenta de nuevo.'}`);
          console.error('Error enviando calificacion del aprendiz:', JSON.stringify(err?.error ?? err, null, 2));
        },
      });
  }

  pillClass(estado?: string): string {
    const e = this.normalizarEstado(estado);
    if (this.esEstadoAceptado(estado) || this.esEstadoCerrado(estado)) return 'ss-pill-status-ok';
    if (e === 'rechazado' || e === 'rechazada' || e === 'rejected') return 'ss-pill-status-danger';
    return 'ss-pill-status-pending';
  }

  rating(val?: number): string {
    return (val ?? 0).toFixed(1);
  }

  private setProcessing(item: SolicitudVista, v: boolean): void {
    this.solicitudes.update((list) =>
      list.map((s) => (s === item ? { ...s, procesando: v } : s)),
    );
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
