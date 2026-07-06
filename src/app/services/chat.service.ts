import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Mensaje } from '../models/mensaje.model';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly mensajesBase = `${environment.apiUrl}/mensajes`;
  private readonly archivosBase = `${environment.apiUrl}/archivos`;

  constructor(private http: HttpClient) {}

  getMensajesPorSolicitud(idSolicitud: number): Observable<Mensaje[]> {
    return this.http.get<Mensaje[]>(`${this.mensajesBase}/solicitud/${idSolicitud}`);
  }

  enviarMensaje(mensaje: Mensaje): Observable<Mensaje> {
    return this.http.post<Mensaje>(this.mensajesBase, mensaje);
  }

  subirArchivo(file: File): Observable<{ url: string; nombre: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string; nombre: string }>(this.archivosBase, formData);
  }
}
