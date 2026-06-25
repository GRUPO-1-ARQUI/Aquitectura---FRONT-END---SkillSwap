export interface Solicitud {
  idSolicitud?: number;
  idAprendiz: number;
  idTutor: number;
  idHabilidad: number;
  mensaje: string;
  estado?: string;
  fecha?: string;
}
