import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Usuario } from '../models/usuario.model';
import { LoginResponse } from '../models/login-response.model';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private base = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  login(correoInstitucional: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.base}/login`, { correoInstitucional, password });
  }

  getAll(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.base);
  }

  getById(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.base}/${id}`);
  }

  create(u: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(this.base, u);
  }

  update(id: number, u: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.base}/${id}`, u);
  }

  registrarComoTutor(id: number): Observable<void> {
    return this.http.put<void>(`${this.base}/${id}/tutor`, null);
  }

  actualizarCreditos(id: number, puntos: number): Observable<void> {
    return this.http.put<void>(`${this.base}/${id}/creditos?puntos=${puntos}`, null);
  }
}
