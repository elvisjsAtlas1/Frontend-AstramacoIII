export interface Transportista {
  id?: number;
  nombre: string;
  apellidos: string;
  dni: string;
  edad: number;
  tipoTransporte: 'CAMIONERO' | 'VOLQUETERO';
  placa: string;
  vehiculoInfo?: string;
  capacidad: number;
  estado: 'ACTIVO' | 'INACTIVO';
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  deletedBy?: string | null;
  usuario?: {
    id: number;
    username: string;
    rol: string;
    activo: boolean;
  };
}