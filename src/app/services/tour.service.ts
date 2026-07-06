import { Injectable, signal } from '@angular/core';

const STORAGE_PREFIX = 'skillswap_tour_tutor_visto_';

export interface TourStep {
  target?: string;
  titulo: string;
  texto: string;
  placement?: 'bottom' | 'top' | 'right' | 'left' | 'center';
}


@Injectable({ providedIn: 'root' })
export class TourService {
  readonly activo = signal(false);
  readonly pasoActual = signal(0);

  private totalPasos = 0;

  yaVisto(idUsuario: number | null): boolean {
    if (!idUsuario) return true;
    try {
      return localStorage.getItem(this.clave(idUsuario)) === '1';
    } catch {
      return true;
    }
  }

  private marcarVisto(idUsuario: number | null): void {
    if (!idUsuario) return;
    try {
      localStorage.setItem(this.clave(idUsuario), '1');
    } catch {
    }
  }

  iniciar(totalPasos: number): void {
    this.totalPasos = totalPasos;
    this.pasoActual.set(0);
    this.activo.set(true);
  }

  siguiente(): void {
    if (this.pasoActual() < this.totalPasos - 1) {
      this.pasoActual.update((v) => v + 1);
    }
  }

  anterior(): void {
    this.pasoActual.update((v) => Math.max(0, v - 1));
  }

  cerrar(idUsuario: number | null): void {
    this.activo.set(false);
    this.marcarVisto(idUsuario);
  }

  private clave(idUsuario: number): string {
    return `${STORAGE_PREFIX}${idUsuario}`;
  }
}
