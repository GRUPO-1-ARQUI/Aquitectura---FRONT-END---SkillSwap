import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopNavComponent, NavLink } from '../top-nav/top-nav';
import { SesionService } from '../../services/sesion.service';

@Component({
  selector: 'app-layout-privado',
  standalone: true,
  imports: [RouterOutlet, TopNavComponent],
  templateUrl: './layout-privado.html',
  styleUrl: './layout-privado.css',
})
export class LayoutPrivadoComponent {
  private readonly sesion = inject(SesionService);

  get links(): NavLink[] {
    const rol = this.sesion.getRol();
    if (rol === 'tutor') {
      return [
        { label: 'Solicitudes', path: '/app/solicitudes' },
        { label: 'Notificaciones', path: '/app/notificaciones' },
      ];
    }
    if (rol === 'coordinador') {
      return [
        { label: 'Verificaciones', path: '/app/verificaciones' },
      ];
    }
    return [
      { label: 'Buscar tutores', path: '/app/buscar' },
      { label: 'Mis solicitudes', path: '/app/mis-solicitudes' },
      { label: 'Notificaciones', path: '/app/notificaciones' },
    ];
  }
}
