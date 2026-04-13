import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CargaModel } from '../models/carga.model';

@Injectable({
  providedIn: 'root'
})
export class CargaService {

  private readonly apiUrl = `${environment.apiUrl}/cargas`;

  constructor(private http: HttpClient) {}

  listarTodas(): Observable<CargaModel[]> {
    return this.http.get<CargaModel[]>(this.apiUrl);
  }

  obtenerPorTransportista(transportistaId: number): Observable<CargaModel | null> {
    return this.http.get<CargaModel | null>(`${this.apiUrl}/${transportistaId}`);
  }
}
