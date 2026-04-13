export interface Pedido {

  id?: number;

  clienteNombre: string;
  clienteTelefono: string;
  direccionEnvio: string;

  tipoTransporte: 'CAMIONERO' | 'VOLQUETERO';

  material:
    | 'PANDERETA'
    | 'TECHO'
    | 'ARENA_GRUESA'
    | 'ARENA_FINA'
    | 'ARENA_ASENTAR'
    | 'PIEDRA'
    | 'DESMONTE';

  cantidad: number;
  montoTotal: number;
  adelanto: number;

  piso: number;

  // 🔥 Angular usa string (ISO)
  horaEnvio: string;

  // 🔥 Para envío
  transportistaId?: number;

  // 🔥 Para respuesta del backend
  transportista?: any;

  codigoVerificacion?: string;

  estado?: 'PENDIENTE' | 'EN_ENVIO' | 'EN_DESCARGA' | 'ENTREGADO' | 'CANCELADO';
}
