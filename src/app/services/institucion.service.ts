import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Institucion } from '../models/institucion.model';

@Injectable({ providedIn: 'root' })
export class InstitucionService {
  private base = `${environment.apiUrl}/instituciones`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Institucion[]> {
    return this.http.get<Institucion[]>(this.base);
  }
}
