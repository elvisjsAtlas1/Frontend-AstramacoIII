import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PedidoService {

  private api = `${environment.apiUrl}/pedidos`;

  constructor(private http: HttpClient) {}

  crear(pedido: any) {
    return this.http.post(this.api, pedido);
  }
  listar() {
    return this.http.get(`${this.api}`);
  }
}

