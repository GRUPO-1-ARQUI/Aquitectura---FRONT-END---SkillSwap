import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Resena } from '../models/resena.model';

@Injectable({ providedIn: 'root' })
export class ResenaService {
  private base = `${environment.apiUrl}/api/resenas`;

  constructor(private http: HttpClient) {}

  getByEvaluado(id: number): Observable<Resena[]> {
    return this.http.get<Resena[]>(`${this.base}/usuario/${id}`);
  }

  getPromedio(id: number): Observable<number> {
    return this.http.get<number>(`${this.base}/usuario/${id}/promedio`);
  }

  create(r: Resena): Observable<Resena> {
    return this.http.post<Resena>(this.base, r);
  }
}
