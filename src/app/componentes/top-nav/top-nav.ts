import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SesionService } from '../../services/sesion.service';
import { NotificacionService } from '../../services/notificacion.service';
import { SelectorTemaComponent } from '../selector-tema/selector-tema';

export interface NavLink {
  label: string;
  path: string;
}

@Component({
  selector: 'app-top-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, SelectorTemaComponent],
  templateUrl: './top-nav.html',
  styleUrl: './top-nav.css',
})
export class TopNavComponent implements OnInit {
  @Input() links: NavLink[] = [];

  readonly sesion = inject(SesionService);
  private readonly router = inject(Router);
  private readonly notifSvc = inject(NotificacionService);

  readonly cantidadNoLeidas = signal(0);

  constructor() {
    // Recarga el badge en cada navegación mientras el usuario esté autenticado
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      takeUntilDestroyed(),
    ).subscribe(() => {
      if (this.sesion.isLoggedIn()) this.recargarNoLeidas();
    });
  }

  ngOnInit(): void {
    if (this.sesion.isLoggedIn()) this.recargarNoLeidas();
  }

  recargarNoLeidas(): void {
    const uid = this.sesion.getUserId();
    if (!uid) return;
    this.notifSvc.getNoLeidas(uid).pipe(
      catchError(() => of([])),
    ).subscribe(notifs => this.cantidadNoLeidas.set(notifs.length));
  }

  logout(): void {
    this.sesion.logout();
    this.cantidadNoLeidas.set(0);
    this.router.navigate(['/home']);
  }
}
