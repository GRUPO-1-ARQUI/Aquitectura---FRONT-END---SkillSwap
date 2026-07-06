import { Injectable, signal } from '@angular/core';

export type ModoTema = 'claro' | 'oscuro';
export type ColorTema = 'azul' | 'rojo' | 'amarillo' | 'celeste';

interface PreferenciaTema {
  modo: ModoTema;
  color: ColorTema;
}

export interface OpcionColor {
  valor: ColorTema;
  nombre: string;
  muestra: string;
}

const STORAGE_KEY = 'skillswap_tema';

const PREFERENCIA_POR_DEFECTO: PreferenciaTema = { modo: 'claro', color: 'azul' };

export const COLORES_DISPONIBLES: OpcionColor[] = [
  { valor: 'azul', nombre: 'Azul', muestra: '#005A9C' },
  { valor: 'rojo', nombre: 'Rojo', muestra: '#DC3545' },
  { valor: 'amarillo', nombre: 'Amarillo', muestra: '#D97706' },
  { valor: 'celeste', nombre: 'Celeste', muestra: '#0EA5E9' },
];


@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly preferencia = this.cargar();

  readonly modo = signal<ModoTema>(this.preferencia.modo);
  readonly color = signal<ColorTema>(this.preferencia.color);

  readonly coloresDisponibles = COLORES_DISPONIBLES;

  constructor() {
    // Aplica el tema guardado apenas se instancia el servicio (arranque de la app),
    // así se evita el "parpadeo" del tema por defecto antes de pintar la UI.
    this.aplicarAlDocumento(this.preferencia);
  }

  esOscuro(): boolean {
    return this.modo() === 'oscuro';
  }

  alternarModo(): void {
    this.cambiarModo(this.esOscuro() ? 'claro' : 'oscuro');
  }

  cambiarModo(modo: ModoTema): void {
    this.modo.set(modo);
    this.guardarYAplicar();
  }

  cambiarColor(color: ColorTema): void {
    this.color.set(color);
    this.guardarYAplicar();
  }

  private guardarYAplicar(): void {
    const pref: PreferenciaTema = { modo: this.modo(), color: this.color() };
    this.aplicarAlDocumento(pref);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pref));
    } catch {
      /* localStorage no disponible: la preferencia solo dura la sesión actual */
    }
  }

  private aplicarAlDocumento(pref: PreferenciaTema): void {
    const root = document.documentElement;
    root.setAttribute('data-theme', pref.modo);
    root.setAttribute('data-color', pref.color);
  }

  private cargar(): PreferenciaTema {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...PREFERENCIA_POR_DEFECTO };
      const parsed = JSON.parse(raw) as Partial<PreferenciaTema>;
      const modo: ModoTema = parsed.modo === 'oscuro' ? 'oscuro' : 'claro';
      const color: ColorTema = COLORES_DISPONIBLES.some((c) => c.valor === parsed.color)
        ? (parsed.color as ColorTema)
        : PREFERENCIA_POR_DEFECTO.color;
      return { modo, color };
    } catch {
      return { ...PREFERENCIA_POR_DEFECTO };
    }
  }
}
