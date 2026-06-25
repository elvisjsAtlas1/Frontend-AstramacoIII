import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { DocumentoPersonal } from '../models/documento-personal.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DocumentoService {

  private readonly api = `${environment.apiUrl}/documentos`;

  constructor(private readonly http: HttpClient) {}

  // ========== CRUD PRINCIPAL ==========

  // 🔥 CREAR DOCUMENTO
  crear(transportistaId: number, doc: any): Observable<DocumentoPersonal> {
    return this.http.post<DocumentoPersonal>(`${this.api}/${transportistaId}`, doc);
  }

  // 📋 LISTAR DOCUMENTOS POR TRANSPORTISTA
  listar(transportistaId: number): Observable<DocumentoPersonal[]> {
    return this.http.get<DocumentoPersonal[]>(
      `${this.api}/transportista/${transportistaId}`
    );
  }

  // 🔍 OBTENER DOCUMENTO POR ID
  obtener(id: number): Observable<DocumentoPersonal> {
    return this.http.get<DocumentoPersonal>(`${this.api}/${id}`);
  }

  // 📋 LISTAR DOCUMENTOS CON PAGINACIÓN
  listarPaginado(transportistaId: number, page: number = 0, size: number = 10): Observable<any> {
    return this.http.get<any>(
      `${this.api}/transportista/${transportistaId}/paginado?page=${page}&size=${size}`
    );
  }

  // 📋 LISTAR SOLO ACTIVOS
  listarActivos(transportistaId: number): Observable<DocumentoPersonal[]> {
    return this.http.get<DocumentoPersonal[]>(
      `${this.api}/transportista/${transportistaId}/activos`
    );
  }

  // 👤 MIS DOCUMENTOS
  obtenerMisDocumentos(): Observable<DocumentoPersonal[]> {
    return this.http.get<DocumentoPersonal[]>(`${this.api}/me`);
  }

  // ✏️ ACTUALIZAR DOCUMENTO
  actualizar(id: number, doc: any): Observable<DocumentoPersonal> {
    return this.http.put<DocumentoPersonal>(`${this.api}/${id}`, doc);
  }

  // 🔄 CAMBIAR ESTADO
  cambiarEstado(id: number, activo: boolean): Observable<void> {
    return this.http.patch<void>(`${this.api}/${id}/estado?activo=${activo}`, {});
  }

  // 🗑️ ELIMINAR (SOFT DELETE)
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  // ♻️ RESTAURAR
  restaurar(id: number): Observable<void> {
    return this.http.patch<void>(`${this.api}/${id}/restaurar`, {});
  }

  // ⚠️ ELIMINAR PERMANENTE
  eliminarPermanente(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}/permanente`);
  }
}