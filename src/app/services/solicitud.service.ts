import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Solicitud } from '../models/solicitud.model';

@Injectable({ providedIn: 'root' })
export class SolicitudService {
  private base = `${environment.apiUrl}/solicitudes`;

  constructor(private http: HttpClient) {}

  create(s: Solicitud): Observable<Solicitud> {
    return this.http.post<Solicitud>(this.base, s);
  }

  getByTutor(id: number): Observable<Solicitud[]> {
    return this.http.get<Solicitud[]>(`${this.base}/tutor/${id}`);
  }

  getByAprendiz(id: number): Observable<Solicitud[]> {
    return this.http.get<Solicitud[]>(`${this.base}/aprendiz/${id}`);
  }

  getById(id: number): Observable<Solicitud> {
    return this.http.get<Solicitud>(`${this.base}/${id}`);
  }

  updateEstado(id: number, estado: string): Observable<void> {
    return this.http.put<void>(`${this.base}/${id}/estado?estado=${estado}`, null);
  }
}
