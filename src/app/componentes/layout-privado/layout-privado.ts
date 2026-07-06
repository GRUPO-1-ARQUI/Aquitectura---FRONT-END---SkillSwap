import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopNavComponent, NavLink } from '../top-nav/top-nav';
import { TourTutorComponent } from '../tour-tutor/tour-tutor';
import { AvisoVerificacionComponent } from '../aviso-verificacion/aviso-verificacion';
import { SesionService } from '../../services/sesion.service';

@Component({
  selector: 'app-layout-privado',
  standalone: true,
  imports: [RouterOutlet, TopNavComponent, TourTutorComponent, AvisoVerificacionComponent],
  templateUrl: './layout-privado.html',
  styleUrl: './layout-privado.css',
})
export class LayoutPrivadoComponent {
  private readonly sesion = inject(SesionService);

  get esTutor(): boolean {
    return this.sesion.esTutor();
  }

  get esEstudiante(): boolean {
    return this.sesion.esEstudiante();
  }

  get links(): NavLink[] {
    const rol = this.sesion.getRol();
    if (rol === 'tutor') {
      return [
        { label: 'Solicitudes', path: '/app/solicitudes' },
        { label: 'Mi Perfil', path: '/app/perfil' },
        { label: 'Editar Perfil', path: '/app/mi-perfil' },
        { label: 'Notificaciones', path: '/app/notificaciones' },
      ];
    }
    if (rol === 'coordinador') {
      return [
        { label: 'Verificaciones', path: '/app/verificaciones' },
        { label: 'Gráficos', path: '/app/graficos' },
        { label: 'Editar Perfil', path: '/app/mi-perfil' },
      ];
    }
    return [
      { label: 'Buscar tutores', path: '/app/buscar' },
      { label: 'Mis solicitudes', path: '/app/mis-solicitudes' },
      { label: 'Mis Favoritos', path: '/app/favoritos' },
      { label: 'Mi Perfil', path: '/app/perfil' },
      { label: 'Editar Perfil', path: '/app/mi-perfil' },
      { label: 'Notificaciones', path: '/app/notificaciones' },
    ];
  }
}
