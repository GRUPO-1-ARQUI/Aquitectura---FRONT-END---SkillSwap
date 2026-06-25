export interface Resena {
  idResena?: number;
  idSesion: number;
  idUsuarioEvaluador: number;
  idUsuarioEvaluado: number;
  calificacion: number;
  comentario?: string;
}
