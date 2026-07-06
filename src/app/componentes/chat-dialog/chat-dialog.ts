import { AfterViewChecked, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ChatService } from '../../services/chat.service';
import { SesionService } from '../../services/sesion.service';
import { Mensaje } from '../../models/mensaje.model';

@Component({
  selector: 'app-chat-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-dialog.html',
  styleUrl: './chat-dialog.css',
})
export class ChatDialogComponent implements OnInit, AfterViewChecked, OnDestroy {
  @Input({ required: true }) idSolicitud!: number;
  @Input({ required: true }) idReceptor!: number;
  @Input() tituloChat = 'Chat de Solicitud';

  private readonly chatSvc = inject(ChatService);
  private readonly sesion = inject(SesionService);
  private pollingId: ReturnType<typeof setInterval> | null = null;

  readonly mensajes = signal<Mensaje[]>([]);
  readonly archivoAdjunto = signal<File | null>(null);
  readonly cargando = signal(false);
  readonly errorEnvio = signal('');
  nuevoMensaje = '';

  @ViewChild('scrollContainer') private scrollContainer?: ElementRef<HTMLElement>;

  ngOnInit(): void {
    this.cargarMensajes();
    this.pollingId = setInterval(() => this.cargarMensajes(), 5000);
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  ngOnDestroy(): void {
    if (this.pollingId) {
      clearInterval(this.pollingId);
      this.pollingId = null;
    }
  }

  cargarMensajes(): void {
    const idSolicitud = Number(this.idSolicitud);
    if (!Number.isFinite(idSolicitud) || idSolicitud <= 0) return;

    this.chatSvc.getMensajesPorSolicitud(idSolicitud).subscribe({
      next: (msgs) => this.mensajes.set(msgs),
      error: (err) => console.error('Error cargando mensajes', err),
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      this.archivoAdjunto.set(file);
    }
  }

  async enviar(): Promise<void> {
    const texto = this.nuevoMensaje.trim();
    const file = this.archivoAdjunto();

    if (!texto && !file) return;

    const idEmisor = this.sesion.getUserId();
    const idSolicitud = Number(this.idSolicitud);
    const idReceptor = Number(this.idReceptor);
    const idEmisorNum = Number(idEmisor);

    if (![idSolicitud, idReceptor, idEmisorNum].every((id) => Number.isFinite(id) && id > 0)) {
      this.errorEnvio.set('No se pudo enviar: faltan datos validos del chat.');
      console.error('Datos invalidos para enviar mensaje', {
        idSolicitud: this.idSolicitud,
        idEmisor,
        idReceptor: this.idReceptor,
      });
      return;
    }

    this.errorEnvio.set('');
    this.cargando.set(true);

    let archivoUrl: string | undefined;
    let archivoNombre: string | undefined;

    if (file) {
      try {
        const res = await firstValueFrom(this.chatSvc.subirArchivo(file));
        archivoUrl = res?.url;
        archivoNombre = res?.nombre;
      } catch (err) {
        this.cargando.set(false);
        this.errorEnvio.set('No se pudo subir el archivo adjunto.');
        console.error('Error subiendo archivo', err);
        return;
      }
    }

    const mensaje: Mensaje = {
      idSolicitud,
      idEmisor: idEmisorNum,
      idReceptor,
      contenido: texto,
      fecha: this.fechaActualParaBackend(),
      archivoUrl,
      archivoNombre,
    };

    this.chatSvc.enviarMensaje(mensaje).subscribe({
      next: () => {
        this.nuevoMensaje = '';
        this.archivoAdjunto.set(null);
        this.cargando.set(false);
        this.cargarMensajes();
      },
      error: (err) => {
        const detalle = err?.error?.fieldErrors ?? err?.error ?? err;
        const detalleTexto = this.formatearDetalleError(detalle);
        this.errorEnvio.set(`No se pudo enviar el mensaje.${detalleTexto ? ` ${detalleTexto}` : ''}`);
        console.error('Error enviando mensaje. Detalle de validacion:', detalleTexto || detalle);
        console.error(JSON.stringify(detalle, null, 2));
        this.cargando.set(false);
      },
    });
  }

  esMio(m: Mensaje): boolean {
    return Number(m.idEmisor) === Number(this.sesion.getUserId());
  }

  private scrollToBottom(): void {
    const el = this.scrollContainer?.nativeElement;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }

  private formatearDetalleError(detalle: unknown): string {
    if (!detalle || typeof detalle !== 'object') return '';

    if (Array.isArray(detalle)) {
      return detalle
        .map((item) => {
          if (!item || typeof item !== 'object') return String(item);
          const row = item as Record<string, unknown>;
          const campo = row['field'] ?? row['campo'] ?? row['name'];
          const mensaje = row['message'] ?? row['mensaje'] ?? row['defaultMessage'];
          return campo ? `${String(campo)}: ${String(mensaje ?? item)}` : String(mensaje ?? JSON.stringify(item));
        })
        .join(' | ');
    }

    return Object.entries(detalle as Record<string, unknown>)
      .map(([campo, mensaje]) => `${campo}: ${String(mensaje)}`)
      .join(' | ');
  }

  private fechaActualParaBackend(): string {
    const fecha = new Date();
    const pad = (valor: number, size = 2) => String(valor).padStart(size, '0');
    const dia = [
      fecha.getFullYear(),
      pad(fecha.getMonth() + 1),
      pad(fecha.getDate()),
    ].join('-');
    const hora = [
      pad(fecha.getHours()),
      pad(fecha.getMinutes()),
      pad(fecha.getSeconds()),
    ].join(':');

    return `${dia}T${hora}.${pad(fecha.getMilliseconds(), 3)}`;
  }
}
