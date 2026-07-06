import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { UsuarioService } from '../../services/usuario.service';
import { UsuarioHabilidadService } from '../../services/usuario-habilidad.service';
import { HabilidadService } from '../../services/habilidad.service';
import { SesionService } from '../../services/sesion.service';

import { Usuario } from '../../models/usuario.model';
import { Habilidad } from '../../models/habilidad.model';
import {
  UsuarioHabilidad,
  TIPO_HABILIDAD_APRENDER,
  TIPO_HABILIDAD_ENSENAR,
} from '../../models/usuario-habilidad.model';

interface HabilidadVista {
  usuarioHabilidad: UsuarioHabilidad;
  nombre: string;
}

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.css',
})
export class MiPerfilComponent implements OnInit {
  private readonly usuarioSvc = inject(UsuarioService);
  private readonly usuarioHabilidadSvc = inject(UsuarioHabilidadService);
  private readonly habilidadSvc = inject(HabilidadService);
  private readonly sesion = inject(SesionService);

  readonly TIPO_ENSENAR = TIPO_HABILIDAD_ENSENAR;
  readonly TIPO_APRENDER = TIPO_HABILIDAD_APRENDER;

  readonly cargando = signal(true);
  readonly usuario = signal<Usuario | null>(null);
  readonly misHabilidades = signal<HabilidadVista[]>([]);
  readonly todasHabilidades = signal<Habilidad[]>([]);

  // --- Formulario de datos personales ---
  nombreCompleto = '';
  correoInstitucional = '';
  biografia = '';
  passwordNueva = ''; // vacío = no cambiar contraseña

  readonly guardando = signal(false);
  readonly guardadoOk = signal(false);
  readonly errorGuardar = signal('');

  // --- Formulario para agregar curso/habilidad ---
  nuevaHabilidadId: number | null = null;
  nuevoTipo: string = TIPO_HABILIDAD_ENSENAR;
  nuevoNivel: 'basico' | 'intermedio' | 'avanzado' = 'basico';

  readonly agregando = signal(false);
  readonly errorAgregar = signal('');

  get inicial(): string {
    return (this.usuario()?.nombreCompleto ?? '?').charAt(0).toUpperCase();
  }

  // Habilidades que el usuario aún no tiene, para no repetirlas en el select
  get habilidadesDisponibles(): Habilidad[] {
    const yaAgregadas = new Set(this.misHabilidades().map((h) => h.usuarioHabilidad.idHabilidad));
    return this.todasHabilidades().filter((h) => !yaAgregadas.has(h.idHabilidad));
  }

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    const uid = this.sesion.getUserId();
    if (!uid) return;
    this.cargando.set(true);

    forkJoin({
      usuario: this.usuarioSvc.getById(uid).pipe(catchError(() => of(null))),
      misHabs: this.usuarioHabilidadSvc
        .getByUsuario(uid)
        .pipe(catchError(() => of([] as UsuarioHabilidad[]))),
      todas: this.habilidadSvc.getAll().pipe(catchError(() => of([] as Habilidad[]))),
    }).subscribe(({ usuario, misHabs, todas }) => {
      this.usuario.set(usuario as Usuario | null);
      this.todasHabilidades.set(todas as Habilidad[]);

      if (usuario) {
        this.nombreCompleto = (usuario as Usuario).nombreCompleto;
        this.correoInstitucional = (usuario as Usuario).correoInstitucional;
        this.biografia = (usuario as Usuario).biografia ?? '';
      }

      const nombreMap = new Map((todas as Habilidad[]).map((h) => [h.idHabilidad, h.nombre]));
      this.misHabilidades.set(
        (misHabs as UsuarioHabilidad[]).map((uh) => ({
          usuarioHabilidad: uh,
          nombre: nombreMap.get(uh.idHabilidad) ?? `Curso #${uh.idHabilidad}`,
        })),
      );

      this.cargando.set(false);
    });
  }

  guardarPerfil(): void {
    const actual = this.usuario();
    if (!actual) return;

    if (!this.nombreCompleto.trim() || !this.correoInstitucional.trim()) {
      this.errorGuardar.set('El nombre y el correo son obligatorios.');
      return;
    }
    if (this.passwordNueva && this.passwordNueva.length < 6) {
      this.errorGuardar.set('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    this.guardando.set(true);
    this.guardadoOk.set(false);
    this.errorGuardar.set('');

    const body: Usuario = {
      ...actual,
      nombreCompleto: this.nombreCompleto.trim(),
      correoInstitucional: this.correoInstitucional.trim(),
      biografia: this.biografia.trim(),
      // Si no se escribió password nueva, se manda vacío y el backend NO lo toca.
      password: this.passwordNueva ? this.passwordNueva : undefined,
    };

    this.usuarioSvc.update(actual.idUsuario, body).subscribe({
      next: (actualizado) => {
        this.usuario.set(actualizado);
        this.passwordNueva = '';
        this.guardando.set(false);
        this.guardadoOk.set(true);
        setTimeout(() => this.guardadoOk.set(false), 2500);
      },
      error: () => {
        this.guardando.set(false);
        this.errorGuardar.set('No se pudo guardar. Intenta de nuevo.');
      },
    });
  }

  agregarHabilidad(): void {
    const uid = this.sesion.getUserId();
    if (!uid || !this.nuevaHabilidadId) {
      this.errorAgregar.set('Selecciona un curso/habilidad primero.');
      return;
    }

    this.agregando.set(true);
    this.errorAgregar.set('');

    const nueva: UsuarioHabilidad = {
      idUsuario: uid,
      idHabilidad: this.nuevaHabilidadId,
      tipo: this.nuevoTipo,
      nivel: this.nuevoNivel,
    };

    this.usuarioHabilidadSvc.create(nueva).subscribe({
      next: (creada) => {
        const nombre =
          this.todasHabilidades().find((h) => h.idHabilidad === creada.idHabilidad)?.nombre ??
          `Curso #${creada.idHabilidad}`;
        this.misHabilidades.update((list) => [...list, { usuarioHabilidad: creada, nombre }]);
        this.nuevaHabilidadId = null;
        this.agregando.set(false);
      },
      error: () => {
        this.agregando.set(false);
        this.errorAgregar.set('No se pudo agregar el curso. Intenta de nuevo.');
      },
    });
  }

  quitarHabilidad(item: HabilidadVista): void {
    const id = item.usuarioHabilidad.id;
    if (!id) return;

    this.usuarioHabilidadSvc.delete(id).subscribe({
      next: () => {
        this.misHabilidades.update((list) => list.filter((h) => h !== item));
      },
      error: () => {
        this.errorAgregar.set('No se pudo quitar el curso. Intenta de nuevo.');
      },
    });
  }
}
