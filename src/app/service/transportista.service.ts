import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Transportista } from '../models/transportista.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TransportistaService {

  private readonly api = `${environment.apiUrl}/transportistas`;

  constructor(private readonly http: HttpClient) {}

  // ========== CRUD PRINCIPAL ==========

  // 🔥 CREAR TRANSPORTISTA
  crear(transportista: any): Observable<Transportista> {
    return this.http.post<Transportista>(this.api, transportista);
  }

  // 📋 LISTAR TODOS (con paginación y filtros)
  listar(page: number = 0, size: number = 10, tipoTransporte?: string, estado?: string): Observable<any> {
    let url = `${this.api}?page=${page}&size=${size}`;
    if (tipoTransporte) url += `&tipoTransporte=${tipoTransporte}`;
    if (estado) url += `&estado=${estado}`;
    return this.http.get<any>(url);
  }

  // 📋 LISTAR TODOS (versión simple sin paginación)
  listarTodos(): Observable<Transportista[]> {
    return this.http.get<Transportista[]>(this.api);
  }

  // 📋 LISTAR TODOS (incluyendo eliminados)
  listarTodosIncluyendoEliminados(page: number = 0, size: number = 10): Observable<any> {
    return this.http.get<any>(`${this.api}/todos?page=${page}&size=${size}`);
  }

  // 📋 LISTAR SOLO ELIMINADOS
  listarEliminados(page: number = 0, size: number = 10): Observable<any> {
    return this.http.get<any>(`${this.api}/eliminados?page=${page}&size=${size}`);
  }

  // 🔍 OBTENER POR ID
  obtener(id: number): Observable<Transportista> {
    return this.http.get<Transportista>(`${this.api}/${id}`);
  }

  // 🔍 OBTENER POR DNI
  obtenerPorDni(dni: string): Observable<Transportista> {
    return this.http.get<Transportista>(`${this.api}/dni/${dni}`);
  }

  // 🔍 OBTENER POR USUARIO
  obtenerPorUsuario(usuarioId: number): Observable<Transportista> {
    return this.http.get<Transportista>(`${this.api}/usuario/${usuarioId}`);
  }

  // 🔍 OBTENER POR TIPO
  listarPorTipo(tipo: string): Observable<Transportista[]> {
    return this.http.get<Transportista[]>(`${this.api}/tipo/${tipo}`);
  }

  // 👤 MI PERFIL
  obtenerMiPerfil(): Observable<Transportista> {
    return this.http.get<Transportista>(`${this.api}/me`);
  }

  // ✏️ ACTUALIZAR
  actualizar(id: number, transportista: any): Observable<Transportista> {
    return this.http.put<Transportista>(`${this.api}/${id}`, transportista);
  }

  // 🔄 CAMBIAR ESTADO
  cambiarEstado(id: number, estado: string): Observable<void> {
    return this.http.patch<void>(`${this.api}/${id}/estado?estado=${estado}`, {});
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