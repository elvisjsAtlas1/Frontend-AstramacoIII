import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import {Transportista} from '../models/transportista.model';
import {Observable} from 'rxjs';


export interface TransportistaRequest {
  nombre: string;
  apellidos: string;
  dni: string;
  edad: number;
  tipoTransporte: 'CAMIONERO' | 'VOLQUETERO';
  placa: string;
  vehiculoInfo: string;
  capacidad: number;
  estado: 'ACTIVO' | 'INACTIVO';
}

@Injectable({ providedIn: 'root' })
export class TransportistaService {

  private readonly api = `${environment.apiUrl}/transportistas`;

  constructor(private readonly http: HttpClient) {}

  crear(data: TransportistaRequest): Observable<Transportista> {
    return this.http.post<Transportista>(this.api, data);
  }

  listar(): Observable<Transportista[]> {
    return this.http.get<Transportista[]>(this.api);
  }

  listarPorTipo(tipo: 'CAMIONERO' | 'VOLQUETERO'): Observable<Transportista[]> {
    return this.http.get<Transportista[]>(`${this.api}/tipo/${tipo}`);
  }
}
