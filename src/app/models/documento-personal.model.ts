export interface DocumentoPersonal {
  id: number;
  tipoDocumento: 'SOAT' | 'REVISION_TECNICA' | 'LICENCIA' | 'TARJETA_CIRCULACION' | 'DNI';
  valor: string;
  fechaEmision?: string | null;
  fechaVencimiento?: string | null;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  deletedBy?: string | null;
}