import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private api = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  // 🔐 LOGIN
  login(data: any) {
    return this.http.post<any>(`${this.api}/login`, data);
  }

  // 💾 GUARDAR TOKEN
  guardarToken(token: string) {
    localStorage.setItem('token', token);
  }

  // 📥 OBTENER TOKEN
  obtenerToken(): string | null {
    return localStorage.getItem('token');
  }

  // ✅ VALIDAR SI ESTÁ LOGUEADO
  estaLogueado(): boolean {
    return !!this.obtenerToken();
  }

  // 🚪 LOGOUT
  logout() {
    localStorage.removeItem('token');
  }
}
