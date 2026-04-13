export interface Transportista {
  id: number;
  nombre: string;
  apellidos: string;
  dni: string;
  edad: number;
  tipoTransporte: 'CAMIONERO' | 'VOLQUETERO';
  placa: string;
  vehiculoInfo: string;
  capacidad?: number;
  estado?: 'ACTIVO' | 'INACTIVO';
  usuarioId: number;
}
