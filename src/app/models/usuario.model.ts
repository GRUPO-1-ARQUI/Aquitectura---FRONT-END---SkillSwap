export interface Usuario {
  idUsuario: number;
  nombreCompleto: string;
  correoInstitucional: string;
  password?: string;
  idInstitucion?: number;
  rol: string;
  creditos?: number;
  reputacionPromedio?: number;
  biografia?: string;
  estado?: string;
  verificado?: boolean;
}
