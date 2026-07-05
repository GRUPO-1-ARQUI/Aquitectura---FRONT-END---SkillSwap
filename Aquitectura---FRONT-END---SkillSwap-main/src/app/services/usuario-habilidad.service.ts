import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { UsuarioHabilidad } from '../models/usuario-habilidad.model';

@Injectable({ providedIn: 'root' })
export class UsuarioHabilidadService {
  private base = `${environment.apiUrl}/api/usuario-habilidades`;

  constructor(private http: HttpClient) {}

  getByUsuario(id: number): Observable<UsuarioHabilidad[]> {
    return this.http.get<UsuarioHabilidad[]>(`${this.base}/usuario/${id}`);
  }
}
