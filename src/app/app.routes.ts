import { Routes } from '@angular/router';
import { PedidosComponent } from './pages/pedidos/pedidos.component';
import { TransportistasComponent } from './pages/transportistas/transportistas.component';
import { LoginComponent } from './pages/login/login.component';
import {authGuard} from './config/authGuard';
import {DocumentosComponent} from './pages/documentos/documentos.component';
import {CargasComponent} from './pages/cargas/cargas.component';

export const routes: Routes = [

  { path: 'login', component: LoginComponent },

  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'pedidos', component: PedidosComponent, canActivate: [authGuard] },
  { path: 'transportistas', component: TransportistasComponent, canActivate: [authGuard] },
  { path: 'documentos', component: DocumentosComponent },
  { path: 'cargas', component: CargasComponent }

];
