export interface Mensaje {
  idMensaje?: number;
  idSolicitud: number;
  idEmisor: number;
  idReceptor: number;
  contenido: string;
  fecha: string;
  archivoUrl?: string;
  archivoNombre?: string;
}
