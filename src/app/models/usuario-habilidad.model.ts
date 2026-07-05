export interface UsuarioHabilidad {
  id?: number;
  idUsuario: number;
  idHabilidad: number;
  tipo: string;
  nivel: string;
}

export const TIPO_HABILIDAD_APRENDER = 'aprender';
export const TIPO_HABILIDAD_ENSENAR = 'enseñar';
