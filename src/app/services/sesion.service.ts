import { Injectable, signal } from '@angular/core';
import { LoginResponse } from '../models/login-response.model';

const STORAGE_KEY = 'skillswap_user';

@Injectable({ providedIn: 'root' })
export class SesionService {
  private readonly _session = signal<LoginResponse | null>(this.loadFromStorage());

  private loadFromStorage(): LoginResponse | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as LoginResponse) : null;
    } catch {
      return null;
    }
  }

  login(loginResponse: LoginResponse): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loginResponse));
    this._session.set(loginResponse);
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    this._session.set(null);
  }

  isLoggedIn(): boolean {
    return this._session() !== null;
  }

  getToken(): string | null {
    return this._session()?.token ?? null;
  }

  getUserId(): number | null {
    return this._session()?.idUsuario ?? null;
  }

  getNombre(): string {
    return this._session()?.nombreCompleto ?? 'Estudiante';
  }

  getRol(): string {
    return this._session()?.rol?.toLowerCase() ?? '';
  }

  esTutor(): boolean {
    return this.getRol().includes('tutor');
  }

  esCoordinador(): boolean {
    return this.getRol().includes('coordinador');
  }

  esEstudiante(): boolean {
    return !this.esTutor() && !this.esCoordinador();
  }
}
