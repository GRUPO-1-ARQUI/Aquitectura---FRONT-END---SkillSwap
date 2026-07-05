import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Verificacion } from '../models/verificacion.model';
import { EstudianteVerificacion } from '../models/estudiante-verificacion.model';

export interface ReporteVerificaciones {
  verificados: number;
  pendientes: number;
  rechazados: number;
  totalEstudiantes: number;
}

@Injectable({ providedIn: 'root' })
export class VerificacionService {
  private base = `${environment.apiUrl}/api/verificaciones`;

  constructor(private http: HttpClient) {}

  getPendientes(): Observable<Verificacion[]> {
    return this.http.get<Verificacion[]>(`${this.base}/pendientes`);
  }

  create(idUsuario: number): Observable<Verificacion> {
    const body: Verificacion = {
      idUsuario,
      estado: 'pendiente',
      fecha: this.fechaActualIso(),
    };
    return this.http.post<Verificacion>(this.base, body);
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

  getReportePorInstitucion(idInstitucion: number): Observable<ReporteVerificaciones> {
    return this.http.get<ReporteVerificaciones>(`${this.base}/reporte/institucion/${idInstitucion}`);
  }

  private fechaActualIso(): string {
    return new Date().toISOString().slice(0, 19);
  }
}
