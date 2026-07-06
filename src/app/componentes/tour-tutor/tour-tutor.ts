import { Component, HostListener, OnDestroy, OnInit, effect, inject, signal } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { SesionService } from '../../services/sesion.service';
import { TourService, TourStep } from '../../services/tour.service';

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface TooltipPos {
  top: number;
  left: number;
}

@Component({
  selector: 'app-tour-tutor',
  standalone: true,
  imports: [],
  templateUrl: './tour-tutor.html',
  styleUrl: './tour-tutor.css',
})
export class TourTutorComponent implements OnInit, OnDestroy {
  private readonly sesion = inject(SesionService);
  readonly tour = inject(TourService);
  private readonly router = inject(Router);
  private navSub?: Subscription;

  readonly pasos: TourStep[] = [
    {
      placement: 'center',
      titulo: '¡Bienvenido a SkillSwap! 👋',
      texto:
        'Te damos un tour rápido por tu panel de tutor para que sepas dónde encontrar todo. Solo toma un minuto.',
    },
    {
      target: 'nav-link-/app/solicitudes',
      placement: 'bottom',
      titulo: 'Solicitudes recibidas',
      texto:
        'Aquí llegan las solicitudes de tutoría que los aprendices te envían. Es tu punto de partida cada vez que ingreses.',
    },
    {
      target: 'solicitudes-panel',
      placement: 'top',
      titulo: 'Acepta o rechaza',
      texto:
        'Cada tarjeta muestra los datos del aprendiz, la habilidad que quiere aprender y su mensaje. Usa los botones ✓ y ✗ para responder.',
    },
    {
      target: 'nav-link-/app/notificaciones',
      placement: 'bottom',
      titulo: 'Notificaciones',
      texto:
        'Aquí te avisaremos de tu actividad como tutor. El número en rojo indica cuántas notificaciones no has leído.',
    },
    {
      placement: 'center',
      titulo: '¡Listo para empezar! 🎉',
      texto:
        'Ya conoces lo esencial. Si quieres volver a repasarlo, usa el botón de ayuda (?) en la esquina inferior derecha.',
    },
  ];

  readonly spotlight = signal<SpotlightRect | null>(null);
  readonly tooltipPos = signal<TooltipPos | null>(null);
  readonly tooltipPlacement = signal<'bottom' | 'top' | 'right' | 'left' | 'center'>('center');

  constructor() {
    // Cada vez que cambia el paso (o el tour se activa/desactiva), recalcula la posición.
    effect(() => {
      if (this.tour.activo()) {
        // Espera un tick para asegurar que el DOM objetivo esté pintado.
        setTimeout(() => this.recalcular(), 0);
      } else {
        this.spotlight.set(null);
        this.tooltipPos.set(null);
      }
    });
  }

  ngOnInit(): void {
    // Autoinicio: solo si el tutor no ha visto el tour aún.
    if (!this.tour.yaVisto(this.sesion.getUserId())) {
      setTimeout(() => this.tour.iniciar(this.pasos.length), 300);
    }

    // Si el usuario navega a otra sección mientras el tour está activo, lo cerramos
    // para no dejar un tooltip apuntando a un elemento que ya no está en pantalla.
    this.navSub = this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => {
        if (this.tour.activo()) this.cerrar();
      });
  }

  ngOnDestroy(): void {
    this.navSub?.unsubscribe();
  }

  @HostListener('window:resize')
  @HostListener('window:scroll')
  onViewportChange(): void {
    if (this.tour.activo()) this.recalcular();
  }

  get pasoActual(): TourStep {
    return this.pasos[this.tour.pasoActual()];
  }

  get esPrimero(): boolean {
    return this.tour.pasoActual() === 0;
  }

  get esUltimo(): boolean {
    return this.tour.pasoActual() === this.pasos.length - 1;
  }

  siguiente(): void {
    if (this.esUltimo) {
      this.cerrar();
    } else {
      this.tour.siguiente();
    }
  }

  anterior(): void {
    this.tour.anterior();
  }

  cerrar(): void {
    this.tour.cerrar(this.sesion.getUserId());
  }

  /** Permite volver a lanzar el tour manualmente (botón de ayuda). */
  reiniciar(): void {
    this.tour.iniciar(this.pasos.length);
  }

  private recalcular(): void {
    const paso = this.pasoActual;
    if (!paso?.target) {
      this.spotlight.set(null);
      this.tooltipPlacement.set('center');
      this.tooltipPos.set(null);
      return;
    }

    const el = document.querySelector(`[data-tour="${paso.target}"]`);
    if (!el) {
      // El elemento objetivo no está en pantalla: mostramos el tooltip centrado como respaldo.
      this.spotlight.set(null);
      this.tooltipPlacement.set('center');
      this.tooltipPos.set(null);
      return;
    }

    const rect = el.getBoundingClientRect();
    const margen = 8;
    this.spotlight.set({
      top: rect.top - margen,
      left: rect.left - margen,
      width: rect.width + margen * 2,
      height: rect.height + margen * 2,
    });

    const placement = paso.placement ?? 'bottom';
    this.tooltipPlacement.set(placement);

    const tooltipAncho = 320;
    let top = rect.bottom + 16;
    let left = rect.left;

    if (placement === 'top') {
      top = rect.top - 16;
    } else if (placement === 'right') {
      top = rect.top;
      left = rect.right + 16;
    } else if (placement === 'left') {
      top = rect.top;
      left = rect.left - tooltipAncho - 16;
    }

    // Evita que el tooltip se salga por el borde derecho de la ventana.
    const maxLeft = window.innerWidth - tooltipAncho - 16;
    left = Math.min(Math.max(16, left), Math.max(16, maxLeft));

    this.tooltipPos.set({ top, left });
  }
}
