export interface Notificacion {
  idNotificacion?: number;
  idUsuario: number;
  tipo: string;
  contenido: string;
  leido?: boolean;
}
