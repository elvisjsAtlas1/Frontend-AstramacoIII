import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Pedido } from '../models/pedido.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PedidoService {

  private readonly api = `${environment.apiUrl}/pedidos`;

  constructor(private readonly http: HttpClient) {}

  // ========== CRUD PRINCIPAL ==========

  // 🔥 CREAR
  crear(pedido: Pedido): Observable<any> {
    return this.http.post(this.api, pedido);
  }

  // 📋 LISTAR (con paginación y filtros)
  listar(page: number = 0, size: number = 10, estado?: string): Observable<any> {
    let url = `${this.api}?page=${page}&size=${size}`;
    if (estado) url += `&estado=${estado}`;
    return this.http.get<any>(url);
  }

  // 📋 LISTAR TODOS (versión simple)
  listarTodos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(this.api);
  }

  // 📋 LISTAR MIS PEDIDOS
  listarMisPedidos(page: number = 0, size: number = 10, estado?: string): Observable<any> {
    let url = `${this.api}/me?page=${page}&size=${size}`;
    if (estado) url += `&estado=${estado}`;
    return this.http.get<any>(url);
  }

  // 🔍 OBTENER POR ID
  obtener(id: number): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.api}/${id}`);
  }

  // ✏️ ACTUALIZAR
  actualizar(id: number, pedido: Pedido): Observable<any> {
    return this.http.put(`${this.api}/${id}`, pedido);
  }

  // 🔄 CAMBIAR ESTADO
  cambiarEstado(id: number, estado: string): Observable<any> {
    return this.http.patch(`${this.api}/${id}/estado?estado=${estado}`, {});
  }

  // 🗑️ ELIMINAR (SOFT DELETE)
  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.api}/${id}`);
  }

  // ♻️ RESTAURAR
  restaurar(id: number): Observable<any> {
    return this.http.patch(`${this.api}/${id}/restaurar`, {});
  }

  // ⚠️ ELIMINAR PERMANENTE
  eliminarPermanente(id: number): Observable<any> {
    return this.http.delete(`${this.api}/${id}/permanente`);
  }
}