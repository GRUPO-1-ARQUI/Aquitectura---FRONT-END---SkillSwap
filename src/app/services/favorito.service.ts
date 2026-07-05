import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Favorito } from '../models/favorito.model';

@Injectable({ providedIn: 'root' })
export class FavoritoService {
  private base = `${environment.apiUrl}/favoritos`;

  private readonly _idsTutor = signal<Set<number>>(new Set());
  private readonly favoritoIdPorTutor = new Map<number, number>();
  private cargadoParaUsuario: number | null = null;

  readonly idsTutor = this._idsTutor.asReadonly();

  constructor(private http: HttpClient) {}

  cargar(idUsuario: number): void {
    if (this.cargadoParaUsuario === idUsuario) return;
    this.getByUsuario(idUsuario).subscribe(favoritos => {
      this.favoritoIdPorTutor.clear();
      favoritos.forEach(f => this.favoritoIdPorTutor.set(f.idTutor, f.id!));
      this._idsTutor.set(new Set(favoritos.map(f => f.idTutor)));
      this.cargadoParaUsuario = idUsuario;
    });
  }

  esFavorito(idTutor: number): boolean {
    return this._idsTutor().has(idTutor);
  }

  toggle(idUsuario: number, idTutor: number): void {
    if (this.esFavorito(idTutor)) {
      this.quitar(idTutor);
    } else {
      this.agregar(idUsuario, idTutor);
    }
  }

  private agregar(idUsuario: number, idTutor: number): void {
    this._idsTutor.update(s => new Set(s).add(idTutor));
    this.create({ idUsuario, idTutor }).subscribe({
      next: creado => this.favoritoIdPorTutor.set(idTutor, creado.id!),
      error: () => this._idsTutor.update(s => {
        const next = new Set(s);
        next.delete(idTutor);
        return next;
      }),
    });
  }

  private quitar(idTutor: number): void {
    const favoritoId = this.favoritoIdPorTutor.get(idTutor);
    this._idsTutor.update(s => {
      const next = new Set(s);
      next.delete(idTutor);
      return next;
    });
    if (favoritoId == null) return;

    this.delete(favoritoId).subscribe({
      error: () => this._idsTutor.update(s => new Set(s).add(idTutor)),
    });
  }

  getByUsuario(id: number): Observable<Favorito[]> {
    return this.http.get<Favorito[]>(`${this.base}/usuario/${id}`);
  }

  create(f: Favorito): Observable<Favorito> {
    return this.http.post<Favorito>(this.base, f);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
