import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UsuarioService } from '../../services/usuario.service';
import { VerificacionService } from '../../services/verificacion.service';
import { Usuario } from '../../models/usuario.model';

interface Segmento {
  etiqueta: string;
  valor: number;
  color: string;
  pct: number;
  desde: number;
  hasta: number;
}

@Component({
  selector: 'app-graficos',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './graficos.html',
  styleUrl: './graficos.css',
})
export class GraficosComponent implements OnInit {
  private readonly usuarioSvc = inject(UsuarioService);
  private readonly verificacionSvc = inject(VerificacionService);

  readonly cargando = signal(true);
  readonly usuarios = signal<Usuario[]>([]);
  readonly verificacionesPendientes = signal(0);

  readonly totalUsuarios = computed(() => this.usuarios().length);

  readonly segmentosRol = computed<Segmento[]>(() =>
    this.construirSegmentos([
      { etiqueta: 'Estudiantes', valor: this.contarPorRol('estudiante'), color: 'var(--ss-primary)' },
      { etiqueta: 'Tutores', valor: this.contarPorRol('tutor'), color: 'var(--ss-accent)' },
      { etiqueta: 'Coordinadores', valor: this.contarPorRol('coordinador'), color: '#94a3b8' },
    ]),
  );

  readonly segmentosEstado = computed<Segmento[]>(() =>
    this.construirSegmentos([
      { etiqueta: 'Activos', valor: this.contarPorEstado('activo'), color: '#22c55e' },
      { etiqueta: 'Inactivos', valor: this.contarPorEstado('inactivo'), color: '#ef4444' },
      { etiqueta: 'Otros', valor: this.contarOtrosEstados(), color: '#94a3b8' },
    ]),
  );

  readonly verificados = computed(() => this.usuarios().filter(u => u.verificado).length);
  readonly noVerificados = computed(() => this.totalUsuarios() - this.verificados());

  readonly conicGradientRol = computed(() => this.aConicGradient(this.segmentosRol()));
  readonly conicGradientEstado = computed(() => this.aConicGradient(this.segmentosEstado()));

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.usuarioSvc
      .getAll()
      .pipe(catchError(() => of([] as Usuario[])))
      .subscribe(usuarios => {
        this.usuarios.set(usuarios);
        this.verificacionSvc
          .getPendientes()
          .pipe(catchError(() => of([])))
          .subscribe(pendientes => {
            this.verificacionesPendientes.set(pendientes.length);
            this.cargando.set(false);
          });
      });
  }

  private contarPorRol(rol: string): number {
    return this.usuarios().filter(u => (u.rol ?? '').toLowerCase() === rol).length;
  }

  private contarPorEstado(estado: string): number {
    return this.usuarios().filter(u => (u.estado ?? '').toLowerCase() === estado).length;
  }

  private contarOtrosEstados(): number {
    return this.usuarios().filter(
      u => !['activo', 'inactivo'].includes((u.estado ?? '').toLowerCase()),
    ).length;
  }

  private construirSegmentos(
    datos: { etiqueta: string; valor: number; color: string }[],
  ): Segmento[] {
    const total = this.totalUsuarios() || 1;
    let acumulado = 0;
    return datos
      .filter(d => d.valor > 0)
      .map(d => {
        const pct = (d.valor / total) * 100;
        const desde = acumulado;
        acumulado += pct;
        return { ...d, pct, desde, hasta: acumulado };
      });
  }

  private aConicGradient(segmentos: Segmento[]): string {
    if (segmentos.length === 0) return 'var(--ss-surface)';
    const partes = segmentos.map(s => `${s.color} ${s.desde}% ${s.hasta}%`);
    return `conic-gradient(${partes.join(', ')})`;
  }
}
