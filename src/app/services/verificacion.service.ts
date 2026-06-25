import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Verificacion } from '../models/verificacion.model';
import { EstudianteVerificacion } from '../models/estudiante-verificacion.model';

@Injectable({ providedIn: 'root' })
export class VerificacionService {
  private base = `${environment.apiUrl}/verificaciones`;

  constructor(private http: HttpClient) {}

  getPendientes(): Observable<Verificacion[]> {
    return this.http.get<Verificacion[]>(`${this.base}/pendientes`);
  }

  getEstudiante(id: number): Observable<EstudianteVerificacion> {
    return this.http.get<EstudianteVerificacion>(`${this.base}/estudiantes-verificacion/${id}`);
  }

  aprobar(id: number): Observable<void> {
    return this.http.put<void>(`${this.base}/${id}/aprobar`, null);
  }

  rechazar(id: number): Observable<void> {
    return this.http.put<void>(`${this.base}/${id}/rechazar`, null);
  }
}
