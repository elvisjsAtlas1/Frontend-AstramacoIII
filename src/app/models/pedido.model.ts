// pedido.model.ts
export interface Pedido {
  id?: number;
  clienteNombre: string;
  clienteTelefono: string;
  direccionEnvio: string;
  tipoTransporte: 'CAMIONERO' | 'VOLQUETERO';
  material: string;
  cantidad: number;
  montoTotal: number;
  adelanto: number;
  piso: number;
  horaEnvio: string;
  transportistaId: number;
  transportista?: {
    id: number;
    nombre: string;
    apellidos: string;
  };
  estado?: 'EN_ENVIO' | 'ENTREGADO' | 'CANCELADO';
  codigoVerificacion?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  deletedBy?: string | null;
}

export enum EstadoPedido {
  EN_ENVIO = 'EN_ENVIO',
  ENTREGADO = 'ENTREGADO',
  CANCELADO = 'CANCELADO'
}