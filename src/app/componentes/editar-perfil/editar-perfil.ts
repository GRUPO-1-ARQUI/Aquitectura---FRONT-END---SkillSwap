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

interface HabilidadChip {
  id: number;
  idHabilidad: number;
  nombre: string;
}

const NIVEL_POR_DEFECTO = 'intermedio';

@Component({
  selector: 'app-editar-perfil',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './editar-perfil.html',
  styleUrl: './editar-perfil.css',
})
export class EditarPerfilComponent implements OnInit {
  private readonly usuarioSvc = inject(UsuarioService);
  private readonly usuarioHabilidadSvc = inject(UsuarioHabilidadService);
  private readonly habilidadSvc = inject(HabilidadService);
  private readonly sesion = inject(SesionService);

  readonly usuario = signal<Usuario | null>(null);
  readonly todasHabilidades = signal<Habilidad[]>([]);
  readonly misAprender = signal<HabilidadChip[]>([]);
  readonly misEnsenar = signal<HabilidadChip[]>([]);
  readonly cargando = signal(true);

  readonly seleccionAprender = signal<number | null>(null);
  readonly seleccionEnsenar = signal<number | null>(null);
  readonly guardandoAprender = signal(false);
  readonly guardandoEnsenar = signal(false);
  readonly errorAprender = signal('');
  readonly errorEnsenar = signal('');

  private get userId(): number {
    return this.sesion.getUserId() ?? 0;
  }

  ngOnInit(): void {
    const uid = this.userId;
    if (!uid) return;

    this.cargando.set(true);
    forkJoin({
      usuario: this.usuarioSvc.getById(uid).pipe(catchError(() => of(null))),
      todasHabs: this.habilidadSvc.getAll().pipe(catchError(() => of([] as Habilidad[]))),
      misHabs: this.usuarioHabilidadSvc.getByUsuario(uid).pipe(catchError(() => of([] as UsuarioHabilidad[]))),
    }).subscribe(({ usuario, todasHabs, misHabs }) => {
      this.usuario.set(usuario as Usuario | null);
      this.todasHabilidades.set(todasHabs as Habilidad[]);
      this.repartir(misHabs as UsuarioHabilidad[], todasHabs as Habilidad[]);
      this.cargando.set(false);
    });
  }

  private repartir(misHabs: UsuarioHabilidad[], catalogo: Habilidad[]): void {
    const nombreMap = new Map(catalogo.map(h => [h.idHabilidad, h.nombre]));
    const aChip = (uh: UsuarioHabilidad): HabilidadChip => ({
      id: uh.id ?? 0,
      idHabilidad: uh.idHabilidad,
      nombre: nombreMap.get(uh.idHabilidad) ?? '?',
    });

    this.misAprender.set(
      misHabs.filter(h => h.tipo === TIPO_HABILIDAD_APRENDER).map(aChip),
    );
    this.misEnsenar.set(
      misHabs.filter(h => h.tipo === TIPO_HABILIDAD_ENSENAR).map(aChip),
    );
  }

  agregarAprender(): void {
    this.agregar(
      this.seleccionAprender(),
      TIPO_HABILIDAD_APRENDER,
      this.misAprender,
      this.guardandoAprender,
      this.errorAprender,
      () => this.seleccionAprender.set(null),
    );
  }

  eliminarAprender(chip: HabilidadChip): void {
    this.eliminar(chip, this.misAprender);
  }

  agregarEnsenar(): void {
    this.agregar(
      this.seleccionEnsenar(),
      TIPO_HABILIDAD_ENSENAR,
      this.misEnsenar,
      this.guardandoEnsenar,
      this.errorEnsenar,
      () => this.seleccionEnsenar.set(null),
    );
  }

  eliminarEnsenar(chip: HabilidadChip): void {
    this.eliminar(chip, this.misEnsenar);
  }

  private agregar(
    idHabilidad: number | null,
    tipo: string,
    lista: ReturnType<typeof signal<HabilidadChip[]>>,
    guardando: ReturnType<typeof signal<boolean>>,
    error: ReturnType<typeof signal<string>>,
    limpiarSeleccion: () => void,
  ): void {
    error.set('');

    if (!idHabilidad) {
      error.set('Selecciona una habilidad antes de agregar.');
      return;
    }
    if (lista().some(c => c.idHabilidad === idHabilidad)) {
      error.set('Esa habilidad ya está en tu lista.');
      return;
    }

    const uid = this.userId;
    if (!uid) return;

    guardando.set(true);
    this.usuarioHabilidadSvc.create({
      idUsuario: uid,
      idHabilidad,
      tipo,
      nivel: NIVEL_POR_DEFECTO,
    }).subscribe({
      next: (creado) => {
        const nombre = this.todasHabilidades().find(h => h.idHabilidad === idHabilidad)?.nombre ?? '?';
        lista.update(l => [...l, { id: creado.id ?? 0, idHabilidad, nombre }]);
        guardando.set(false);
        limpiarSeleccion();
      },
      error: () => {
        guardando.set(false);
        error.set('No se pudo guardar. Intenta de nuevo.');
      },
    });
  }

  private eliminar(chip: HabilidadChip, lista: ReturnType<typeof signal<HabilidadChip[]>>): void {
    lista.update(l => l.filter(c => c !== chip));
    this.usuarioHabilidadSvc.delete(chip.id).subscribe({
      error: () => {
        lista.update(l => [...l, chip]);
      },
    });
  }
}
