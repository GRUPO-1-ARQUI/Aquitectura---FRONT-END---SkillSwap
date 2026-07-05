import { Component, OnInit, inject, signal } from '@angular/core';
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
  imports: [FormsModule],
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

  // Modal calificar
  readonly modalAbierto = signal(false);
  readonly enviando = signal(false);
  readonly calificarOk = signal(false);
  readonly calificarErr = signal('');

  private solicitudActual: SolicitudVista | null = null;
  calificacion = 0;
  comentario = '';
  readonly starRange = [1, 2, 3, 4, 5];

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    const uid = this.sesion.getUserId();
    if (!uid) return;
    this.cargando.set(true);

    forkJoin({
      solicitudes: this.solicitudSvc.getByAprendiz(uid).pipe(catchError(() => of([] as Solicitud[]))),
      habilidades: this.habilidadSvc.getAll().pipe(catchError(() => of([] as Habilidad[]))),
    }).subscribe(({ solicitudes, habilidades }) => {
      const habMap = new Map((habilidades as Habilidad[]).map(h => [h.idHabilidad, h.nombre]));
      const sols = solicitudes as Solicitud[];

      if (sols.length === 0) {
        this.solicitudes.set([]);
        this.cargando.set(false);
        return;
      }

      const uniqueTutorIds = [...new Set(sols.map(s => s.idTutor))];
      forkJoin(
        uniqueTutorIds.map(id => this.usuarioSvc.getById(id).pipe(catchError(() => of(null))))
      ).subscribe(tutores => {
        const tutorMap = new Map(
          uniqueTutorIds.map((id, i) => [id, (tutores[i] as Usuario | null)?.nombreCompleto ?? `Tutor #${id}`])
        );
        this.solicitudes.set(sols.map(s => ({
          solicitud: s,
          tutorNombre: tutorMap.get(s.idTutor) ?? `Tutor #${s.idTutor}`,
          habilidadNombre: habMap.get(s.idHabilidad) ?? `Habilidad #${s.idHabilidad}`,
          tutorId: s.idTutor,
          yaCalificado: false,
        })));
        this.cargando.set(false);
      });
    });
  }

  puedeCalificar(estado?: string): boolean {
    const e = estado?.toLowerCase() ?? '';
    return e === 'aceptado' || e === 'finalizado' || e === 'completado';
  }

  abrirModalCalificar(item: SolicitudVista): void {
    this.solicitudActual = item;
    this.calificacion = 0;
    this.comentario = '';
    this.calificarOk.set(false);
    this.calificarErr.set('');
    this.modalAbierto.set(true);
  }

  cerrarModal(): void { this.modalAbierto.set(false); }

  setStar(n: number): void { this.calificacion = n; }

  enviarCalificacion(): void {
    const uid = this.sesion.getUserId();
    const sol = this.solicitudActual;
    if (!uid || !sol || this.calificacion === 0) return;

    this.enviando.set(true);
    this.calificarErr.set('');

    // TODO: reemplazar idSesion con el id real de la sesión cuando el endpoint esté disponible
    const idSesion = sol.solicitud.idSolicitud ?? 0;

    this.resenaSvc.create({
      idSesion,
      idUsuarioEvaluador: uid,
      idUsuarioEvaluado: sol.tutorId,
      calificacion: this.calificacion,
      comentario: this.comentario.trim() || undefined,
    }).subscribe({
      next: () => {
        this.enviando.set(false);
        this.calificarOk.set(true);
        // Marcar localmente como calificado
        this.solicitudes.update(list =>
          list.map(s => s === sol ? { ...s, yaCalificado: true } : s)
        );
        setTimeout(() => this.cerrarModal(), 2000);
      },
      error: () => {
        this.enviando.set(false);
        this.calificarErr.set('No se pudo enviar la calificación. Intenta de nuevo.');
      },
    });
  }

  estadoPill(estado?: string): string {
    const e = estado?.toLowerCase() ?? '';
    if (e === 'aceptado' || e === 'finalizado' || e === 'completado') return 'ok';
    return 'pending';
  }
}
