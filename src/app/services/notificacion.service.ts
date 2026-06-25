import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Notificacion } from '../models/notificacion.model';

@Injectable({ providedIn: 'root' })
export class NotificacionService {
  private base = `${environment.apiUrl}/notificaciones`;

  constructor(private http: HttpClient) {}

  getByUsuario(id: number): Observable<Notificacion[]> {
    return this.http.get<Notificacion[]>(`${this.base}/usuario/${id}`);
  }

  getNoLeidas(id: number): Observable<Notificacion[]> {
    return this.http.get<Notificacion[]>(`${this.base}/usuario/${id}/no-leidas`);
  }

  marcarLeida(id: number): Observable<void> {
    return this.http.put<void>(`${this.base}/${id}/leer`, null);
  }

  create(n: Notificacion): Observable<Notificacion> {
    return this.http.post<Notificacion>(this.base, n);
  }
}
