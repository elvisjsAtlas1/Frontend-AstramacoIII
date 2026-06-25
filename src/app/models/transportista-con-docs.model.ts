import { Transportista } from './transportista.model';

export interface DocumentoMap {
  SOAT: boolean;
  REVISION_TECNICA: boolean;
  LICENCIA: boolean;
  TARJETA_CIRCULACION: boolean;
  DNI: boolean;
}

export interface TransportistaConDocs extends Transportista {
  documentosMap: DocumentoMap;
}