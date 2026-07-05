import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UsuarioService } from '../../services/usuario.service';
import { UsuarioHabilidadService } from '../../services/usuario-habilidad.service';
import { HabilidadService } from '../../services/habilidad.service';
import { InstitucionService } from '../../services/institucion.service';
import { SesionService } from '../../services/sesion.service';
import { FavoritoService } from '../../services/favorito.service';
import { Usuario } from '../../models/usuario.model';
import { Habilidad } from '../../models/habilidad.model';
import { Institucion } from '../../models/institucion.model';
import { Favorito } from '../../models/favorito.model';
import { TIPO_HABILIDAD_ENSENAR } from '../../models/usuario-habilidad.model';

interface FavoritoCard {
  tutor: Usuario;
  habilidadNombres: string[];
  institucionNombre: string;
}

@Component({
  selector: 'app-mis-favoritos',
  standalone: true,
  imports: [],
  templateUrl: './mis-favoritos.html',
  styleUrl: './mis-favoritos.css',
})
export class MisFavoritosComponent implements OnInit {
  private readonly usuarioSvc = inject(UsuarioService);
  private readonly usuarioHabilidadSvc = inject(UsuarioHabilidadService);
  private readonly habilidadSvc = inject(HabilidadService);
  private readonly institucionSvc = inject(InstitucionService);
  private readonly sesion = inject(SesionService);
  private readonly favoritoSvc = inject(FavoritoService);
  private readonly router = inject(Router);

  readonly tutores = signal<FavoritoCard[]>([]);
  readonly cargando = signal(true);

  ngOnInit(): void {
    const uid = this.sesion.getUserId();
    if (!uid) return;

    this.favoritoSvc.cargar(uid);
    this.favoritoSvc.getByUsuario(uid).pipe(
      catchError(() => of([] as Favorito[])),
    ).subscribe(favoritos => {
      if (favoritos.length === 0) {
        this.tutores.set([]);
        this.cargando.set(false);
        return;
      }

      forkJoin({
        usuarios: forkJoin(
          favoritos.map(f => this.usuarioSvc.getById(f.idTutor).pipe(catchError(() => of(null)))),
        ),
        instituciones: this.institucionSvc.getAll().pipe(catchError(() => of([] as Institucion[]))),
        catalogoHabilidades: this.habilidadSvc.getAll().pipe(catchError(() => of([] as Habilidad[]))),
        habilidades: forkJoin(
          favoritos.map(f => this.usuarioHabilidadSvc.getByUsuario(f.idTutor).pipe(catchError(() => of([])))),
        ),
      }).subscribe(({ usuarios, instituciones, catalogoHabilidades, habilidades }) => {
        const instMap = new Map(instituciones.map(i => [i.idInstitucion, i.nombre]));
        const habNombreMap = new Map(catalogoHabilidades.map(h => [h.idHabilidad, h.nombre]));

        this.tutores.set(
          usuarios
            .map((tutor, i) => {
              if (!tutor) return null;
              return {
                tutor,
                habilidadNombres: habilidades[i]
                  .filter(h => h.tipo === TIPO_HABILIDAD_ENSENAR)
                  .map(h => habNombreMap.get(h.idHabilidad) ?? '?'),
                institucionNombre: instMap.get(tutor.idInstitucion ?? 0) ?? 'Sin institución',
              };
            })
            .filter((c): c is FavoritoCard => c !== null),
        );
        this.cargando.set(false);
      });
    });
  }

  irAPerfil(id: number): void {
    this.router.navigate(['/app/tutor', id]);
  }

  quitar(idTutor: number, event: Event): void {
    event.stopPropagation();
    const uid = this.sesion.getUserId();
    if (!uid) return;
    this.favoritoSvc.toggle(uid, idTutor);
    this.tutores.update(list => list.filter(c => c.tutor.idUsuario !== idTutor));
  }

  rating(val?: number): string {
    return (val ?? 0).toFixed(1);
  }
}
