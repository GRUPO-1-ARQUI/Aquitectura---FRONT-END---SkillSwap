import { Component, OnInit, inject, signal } from '@angular/core';
import { NotificacionService } from '../../services/notificacion.service';
import { SesionService } from '../../services/sesion.service';
import { Notificacion } from '../../models/notificacion.model';

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [],
  templateUrl: './notificaciones.html',
  styleUrl: './notificaciones.css',
})
export class NotificacionesComponent implements OnInit {
  private readonly notifSvc = inject(NotificacionService);
  private readonly sesion = inject(SesionService);

  readonly notificaciones = signal<Notificacion[]>([]);
  readonly cargando = signal(true);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    const uid = this.sesion.getUserId();
    if (!uid) return;
    this.cargando.set(true);
    this.notifSvc.getByUsuario(uid).subscribe({
      next: notifs => {
        // No leídas primero
        this.notificaciones.set(
          [...notifs].sort((a, b) => (a.leido ? 1 : 0) - (b.leido ? 1 : 0))
        );
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  marcarLeida(notif: Notificacion): void {
    if (notif.leido || !notif.idNotificacion) return;
    this.notifSvc.marcarLeida(notif.idNotificacion).subscribe({
      next: () => this.cargar(),
    });
  }

  iconoPorTipo(tipo: string): string {
    const t = tipo?.toLowerCase() ?? '';
    if (t.includes('solicitud')) return '📋';
    if (t.includes('acept')) return '✅';
    if (t.includes('rechaz')) return '❌';
    if (t.includes('sesion') || t.includes('sesión')) return '📅';
    return '🔔';
  }
}
