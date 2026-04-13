import {Transportista} from './transportista.model';

export interface TransportistaConDocs extends Transportista {
  documentosMap: {
    SOAT: boolean;
    REVISION_TECNICA: boolean;
    LICENCIA: boolean;
    TARJETA_CIRCULACION: boolean;
    DNI: boolean;
  };
}
