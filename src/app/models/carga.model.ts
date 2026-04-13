export interface CargaModel {
  id?: number;
  transportistaId: number;
  transportistaNombre?: string;
  tipoMaterial: 'PANDERETA' | 'TECHO';
  cantidadDisponible: number;
}
