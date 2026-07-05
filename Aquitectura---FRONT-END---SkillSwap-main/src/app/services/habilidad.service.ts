import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Habilidad } from '../models/habilidad.model';

@Injectable({ providedIn: 'root' })
export class HabilidadService {
  private base = `${environment.apiUrl}/api/habilidades`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Habilidad[]> {
    return this.http.get<Habilidad[]>(this.base);
  }

  getById(id: number): Observable<Habilidad> {
    return this.http.get<Habilidad>(`${this.base}/${id}`);
  }
}
