import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HabilidadService } from '../../services/habilidad.service';
import { UsuarioService } from '../../services/usuario.service';
import { UsuarioHabilidadService } from '../../services/usuario-habilidad.service';
import { InstitucionService } from '../../services/institucion.service';
import { SesionService } from '../../services/sesion.service';
import { Habilidad } from '../../models/habilidad.model';
import { Usuario } from '../../models/usuario.model';
import { Institucion } from '../../models/institucion.model';
import { UsuarioHabilidad } from '../../models/usuario-habilidad.model';

interface TutorCard {
  tutor: Usuario;
  habilidadNombres: string[];
  habilidadIds: number[];
  institucionNombre: string;
}

@Component({
  selector: 'app-buscar-tutores',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './buscar-tutores.html',
  styleUrl: './buscar-tutores.css',
})
export class BuscarTutoresComponent implements OnInit {
  private readonly habilidadSvc = inject(HabilidadService);
  private readonly usuarioSvc = inject(UsuarioService);
  private readonly usuarioHabilidadSvc = inject(UsuarioHabilidadService);
  private readonly institucionSvc = inject(InstitucionService);
  private readonly sesion = inject(SesionService);
  private readonly router = inject(Router);

  readonly habilidades = signal<Habilidad[]>([]);
  private readonly tutoresList = signal<TutorCard[]>([]);
  readonly cargando = signal(true);
  readonly chipSeleccionado = signal<number | null>(null);
  readonly favoritos = signal(new Set<number>());

  // getter/setter pattern so ngModel writes to the signal and computed() reacts
  private readonly _busqueda = signal('');
  get busqueda(): string { return this._busqueda(); }
  set busqueda(v: string) { this._busqueda.set(v); }

  readonly nombreUsuario = computed(() =>
    this.sesion.getNombre().split(' ')[0]
  );

  readonly tutoresFiltrados = computed(() => {
    const q = this._busqueda().toLowerCase().trim();
    const chipId = this.chipSeleccionado();
    return this.tutoresList().filter(item => {
      const matchQ = !q ||
        item.tutor.nombreCompleto.toLowerCase().includes(q) ||
        (item.tutor.biografia ?? '').toLowerCase().includes(q);
      const matchChip = chipId === null || item.habilidadIds.includes(chipId);
      return matchQ && matchChip;
    });
  });

  ngOnInit(): void {
    forkJoin({
      habilidades: this.habilidadSvc.getAll().pipe(catchError(() => of([] as Habilidad[]))),
      usuarios: this.usuarioSvc.getAll().pipe(catchError(() => of([] as Usuario[]))),
      instituciones: this.institucionSvc.getAll().pipe(catchError(() => of([] as Institucion[]))),
    }).subscribe(({ habilidades, usuarios, instituciones }) => {
      this.habilidades.set(habilidades);
      const habilidadesMap = new Map(habilidades.map(h => [h.idHabilidad, h.nombre]));
      const instMap = new Map(instituciones.map(i => [i.idInstitucion, i.nombre]));

      const tutores = usuarios.filter(u =>
        u.rol?.toLowerCase().includes('tutor') && u.estado === 'activo'
      );

      if (tutores.length === 0) {
        this.tutoresList.set([]);
        this.cargando.set(false);
        return;
      }

      forkJoin(
        tutores.map(t =>
          this.usuarioHabilidadSvc.getByUsuario(t.idUsuario)
            .pipe(catchError(() => of([] as UsuarioHabilidad[])))
        )
      ).subscribe(skillsLists => {
        this.tutoresList.set(tutores.map((t, i) => ({
          tutor: t,
          habilidadNombres: skillsLists[i].map(s => habilidadesMap.get(s.idHabilidad) ?? '?'),
          habilidadIds: skillsLists[i].map(s => s.idHabilidad),
          institucionNombre: instMap.get(t.idInstitucion ?? 0) ?? 'Sin institución',
        })));
        this.cargando.set(false);
      });
    });
  }

  toggleChip(id: number): void {
    if (id === -1) { this.chipSeleccionado.set(null); return; }
    this.chipSeleccionado.update(c => c === id ? null : id);
  }

  toggleFavorito(id: number, event: Event): void {
    event.stopPropagation();
    this.favoritos.update(set => {
      const next = new Set(set);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  irAPerfil(id: number): void {
    this.router.navigate(['/app/tutor', id]);
  }

  rating(val?: number): string {
    return (val ?? 0).toFixed(1);
  }
}
