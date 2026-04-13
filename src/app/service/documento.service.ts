import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import {DocumentoPersonal} from '../models/documento-personal.model';

@Injectable({ providedIn: 'root' })
export class DocumentoService {

  private api = `${environment.apiUrl}/documentos`;

  constructor(private http: HttpClient) {}

  // 🔥 CREAR DOCUMENTO
  crear(transportistaId: number, doc: any) {
    return this.http.post(`${this.api}/${transportistaId}`, doc);
  }

  // 📋 LISTAR DOCUMENTOS POR TRANSPORTISTA
  listar(transportistaId: number) {
    return this.http.get<DocumentoPersonal[]>(
      `${this.api}/transportista/${transportistaId}`
    );
  }
}
