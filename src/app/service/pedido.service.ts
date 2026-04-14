import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {Pedido} from '../models/pedido.model';
import {Observable} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PedidoService {

  private readonly api = `${environment.apiUrl}/pedidos`;

  constructor(private readonly http: HttpClient) {}

  crear(pedido: Pedido): Observable<any> {
    return this.http.post(this.api, pedido);
  }

  listar(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(this.api);
  }
}
