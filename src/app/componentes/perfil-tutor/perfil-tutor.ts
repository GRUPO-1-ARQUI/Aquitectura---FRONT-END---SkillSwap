import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UsuarioService } from '../../services/usuario.service';
import { UsuarioHabilidadService } from '../../services/usuario-habilidad.service';
import { HabilidadService } from '../../services/habilidad.service';
import { ResenaService } from '../../services/resena.service';
import { SolicitudService } from '../../services/solicitud.service';
import { InstitucionService } from '../../services/institucion.service';
import { SesionService } from '../../services/sesion.service';
import { Usuario } from '../../models/usuario.model';
import { Habilidad } from '../../models/habilidad.model';
import { Institucion } from '../../models/institucion.model';
import { UsuarioHabilidad } from '../../models/usuario-habilidad.model';
import { Resena } from '../../models/resena.model';

interface HabilidadOpcion { id: number; nombre: string; }
interface ResenaVista { resena: Resena; evaluadorNombre: string; }

@Component({
  selector: 'app-perfil-tutor',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './perfil-tutor.html',
  styleUrl: './perfil-tutor.css',
})
export class PerfilTutorComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly usuarioSvc = inject(UsuarioService);
  private readonly usuarioHabilidadSvc = inject(UsuarioHabilidadService);
  private readonly habilidadSvc = inject(HabilidadService);
  private readonly resenaSvc = inject(ResenaService);
  private readonly solicitudSvc = inject(SolicitudService);
  private readonly institucionSvc = inject(InstitucionService);
  private readonly sesion = inject(SesionService);

  readonly tutor = signal<Usuario | null>(null);
  readonly promedio = signal<number | null>(null);
  readonly habilidades = signal<HabilidadOpcion[]>([]);
  readonly todasHabilidades = signal<Habilidad[]>([]);
  readonly institucionNombre = signal('Sin institución');
  readonly resenas = signal<ResenaVista[]>([]);
  readonly cargando = signal(true);
  readonly esFavorito = signal(false);

  readonly promedioStr = computed(() => {
    const p = this.promedio();
    return (!p || p === 0) ? null : p.toFixed(1);
  });

  readonly inicial = computed(() =>
    this.tutor()?.nombreCompleto?.charAt(0).toUpperCase() ?? '?'
  );

  // Modal state
  readonly modalAbierto = signal(false);
  readonly enviando = signal(false);
  readonly solicitudOk = signal(false);
  readonly solicitudErr = signal('');

  // Modal form — getter/setter so ngModel can write to signals
  mensajeSolicitud = '';
  private readonly _habilidadSeleccionada = signal<number | null>(null);
  get habilidadSeleccionada(): number | null { return this._habilidadSeleccionada(); }
  set habilidadSeleccionada(v: number | null) { this._habilidadSeleccionada.set(v); }

  private get tutorId(): number {
    return +(this.route.snapshot.paramMap.get('id') ?? 0);
  }

  ngOnInit(): void {
    const id = this.tutorId;
    if (!id) return;

    forkJoin({
      tutor: this.usuarioSvc.getById(id).pipe(catchError(() => of(null))),
      promedio: this.resenaSvc.getPromedio(id).pipe(catchError(() => of(null))),
      todasHabs: this.habilidadSvc.getAll().pipe(catchError(() => of([] as Habilidad[]))),
      tutorHabs: this.usuarioHabilidadSvc.getByUsuario(id).pipe(catchError(() => of([] as UsuarioHabilidad[]))),
      resenas: this.resenaSvc.getByEvaluado(id).pipe(catchError(() => of([] as Resena[]))),
      instituciones: this.institucionSvc.getAll().pipe(catchError(() => of([] as Institucion[]))),
    }).subscribe(({ tutor, promedio, todasHabs, tutorHabs, resenas, instituciones }) => {
      this.tutor.set(tutor as Usuario | null);
      this.promedio.set(typeof promedio === 'number' ? promedio : null);

      // Nombre real de la institución
      const instMap = new Map((instituciones as Institucion[]).map(i => [i.idInstitucion, i.nombre]));
      const tutorObj = tutor as Usuario | null;
      this.institucionNombre.set(
        instMap.get(tutorObj?.idInstitucion ?? 0) ?? 'Sin institución'
      );

      // Todas las habilidades del sistema → para el select del modal
      this.todasHabilidades.set(todasHabs as Habilidad[]);

      // Solo las habilidades que domina el tutor → chips del perfil
      const habMap = new Map((todasHabs as Habilidad[]).map(h => [h.idHabilidad, h.nombre]));
      this.habilidades.set(
        (tutorHabs as UsuarioHabilidad[]).map(h => ({
          id: h.idHabilidad,
          nombre: habMap.get(h.idHabilidad) ?? '?',
        }))
      );

      const resenasList = resenas as Resena[];
      if (resenasList.length === 0) {
        this.resenas.set([]);
        this.cargando.set(false);
        return;
      }

      const uniqueIds = [...new Set(resenasList.map(r => r.idUsuarioEvaluador))];
      forkJoin(
        uniqueIds.map(uid => this.usuarioSvc.getById(uid).pipe(catchError(() => of(null))))
      ).subscribe(usuarios => {
        const nameMap = new Map(
          uniqueIds.map((uid, i) => [uid, (usuarios[i] as Usuario | null)?.nombreCompleto ?? `Estudiante #${uid}`])
        );
        this.resenas.set(resenasList.map(r => ({
          resena: r,
          evaluadorNombre: nameMap.get(r.idUsuarioEvaluador) ?? `Estudiante #${r.idUsuarioEvaluador}`,
        })));
        this.cargando.set(false);
      });
    });
  }

  abrirModal(): void {
    this.mensajeSolicitud = '';
    this._habilidadSeleccionada.set(null);
    this.solicitudOk.set(false);
    this.solicitudErr.set('');
    this.modalAbierto.set(true);
  }

  cerrarModal(): void { this.modalAbierto.set(false); }

  enviar(): void {
    const habId = this._habilidadSeleccionada();
    const mensaje = this.mensajeSolicitud.trim();

    if (!habId) {
      this.solicitudErr.set('Selecciona una habilidad antes de enviar.');
      return;
    }
    if (!mensaje) {
      this.solicitudErr.set('Escribe un mensaje para el tutor.');
      return;
    }

    const aprendizId = this.sesion.getUserId();
    if (!aprendizId) {
      this.solicitudErr.set('Debes iniciar sesión para enviar una solicitud.');
      return;
    }

    this.enviando.set(true);
    this.solicitudErr.set('');

    this.solicitudSvc.create({
      idAprendiz: aprendizId,
      idTutor: this.tutorId,
      idHabilidad: habId,
      mensaje,
      estado: 'pendiente',
    }).subscribe({
      next: () => {
        this.enviando.set(false);
        this.solicitudOk.set(true);
        setTimeout(() => this.cerrarModal(), 2000);
      },
      error: (err) => {
        console.error('[PerfilTutor] Error al crear solicitud:', err);
        this.enviando.set(false);
        this.solicitudErr.set('No se pudo enviar la solicitud. Intenta de nuevo.');
      },
    });
  }

  stars(n: number): boolean[] {
    const p = this.promedio() ?? 0;
    return [1, 2, 3, 4, 5].map(i => i <= Math.round(p));
  }

  starRange = [1, 2, 3, 4, 5];
}
