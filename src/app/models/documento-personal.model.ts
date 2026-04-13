export interface DocumentoPersonal {
  id: number;
  tipoDocumento: string;
  valor: string;
  fechaEmision?: string;
  fechaVencimiento?: string;
  activo: boolean;
}
