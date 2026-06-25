import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PedidoService } from './pedido.service';
import { Pedido } from '../models/pedido.model';

@Injectable({
  providedIn: 'root'
})
export class PedidoStateService {
  
  // ✅ Estado de pedidos
  private pedidosSubject = new BehaviorSubject<Pedido[]>([]);
  public pedidos$ = this.pedidosSubject.asObservable();
  
  // ✅ Estado de pedidos filtrados
  private pedidosFiltradosSubject = new BehaviorSubject<Pedido[]>([]);
  public pedidosFiltrados$ = this.pedidosFiltradosSubject.asObservable();
  
  // ✅ Estado de carga
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$ = this.isLoadingSubject.asObservable();
  
  // ✅ Total de elementos
  private totalElementsSubject = new BehaviorSubject<number>(0);
  public totalElements$ = this.totalElementsSubject.asObservable();

  // ✅ Paginación
  private paginaActual = 0;
  private paginaSize = 10;
  private filtroEstado: string = '';
  private filtroBusqueda: string = '';

  constructor(private pedidoService: PedidoService) {}

  // ========== CARGAR PEDIDOS ==========
  cargarPedidos(page: number = 0, size: number = 10, estado?: string): void {
    this.isLoadingSubject.next(true);
    this.paginaActual = page;
    this.paginaSize = size;
    if (estado !== undefined) this.filtroEstado = estado;
    
    this.pedidoService.listar(page, size, estado).subscribe({
      next: (data: any) => {
        let lista: Pedido[] = [];
        let total = 0;
        
        if (data && data.content) {
          lista = data.content;
          total = data.totalElements || 0;
        } else if (Array.isArray(data)) {
          lista = data;
          total = data.length;
        }
        
        this.pedidosSubject.next(lista);
        this.totalElementsSubject.next(total);
        this.aplicarFiltrosLocales();
        this.isLoadingSubject.next(false);
      },
      error: (error) => {
        console.error('Error al cargar pedidos', error);
        this.pedidosSubject.next([]);
        this.pedidosFiltradosSubject.next([]);
        this.totalElementsSubject.next(0);
        this.isLoadingSubject.next(false);
      }
    });
  }

  // ========== RECARGAR PEDIDOS ==========
  recargarPedidos(): void {
    this.cargarPedidos(this.paginaActual, this.paginaSize, this.filtroEstado);
  }

  // ========== AGREGAR PEDIDO ==========
  agregarPedido(pedido: Pedido): void {
    const current = this.pedidosSubject.value;
    const updated = [pedido, ...current];
    this.pedidosSubject.next(updated);
    this.totalElementsSubject.next(updated.length);
    this.aplicarFiltrosLocales();
  }

  // ========== ACTUALIZAR PEDIDO ==========
  actualizarPedido(pedido: Pedido): void {
    const current = this.pedidosSubject.value;
    const index = current.findIndex(p => p.id === pedido.id);
    if (index !== -1) {
      current[index] = pedido;
      this.pedidosSubject.next([...current]);
      this.aplicarFiltrosLocales();
    }
  }

  // ========== ELIMINAR PEDIDO (local) ==========
  eliminarPedidoLocal(pedidoId: number): void {
    const current = this.pedidosSubject.value;
    const updated = current.filter(p => p.id !== pedidoId);
    this.pedidosSubject.next(updated);
    this.totalElementsSubject.next(updated.length);
    this.aplicarFiltrosLocales();
  }

  // ========== RESTAURAR PEDIDO (local) ==========
  restaurarPedidoLocal(pedido: Pedido): void {
    const current = this.pedidosSubject.value;
    // Verificar si ya existe
    const exists = current.some(p => p.id === pedido.id);
    if (!exists) {
      const updated = [pedido, ...current];
      this.pedidosSubject.next(updated);
      this.totalElementsSubject.next(updated.length);
      this.aplicarFiltrosLocales();
    }
  }

  // ========== OBTENER PEDIDO POR ID ==========
  getPedidoById(id: number): Pedido | undefined {
    return this.pedidosSubject.value.find(p => p.id === id);
  }

  // ========== OBTENER PEDIDOS ==========
  getPedidos(): Pedido[] {
    return this.pedidosSubject.value;
  }

  // ========== OBTENER PEDIDOS FILTRADOS ==========
  getPedidosFiltrados(): Pedido[] {
    return this.pedidosFiltradosSubject.value;
  }

  // ========== APLICAR FILTROS LOCALES ==========
  aplicarFiltrosLocales(): void {
    let filtrados = [...this.pedidosSubject.value];

    if (this.filtroBusqueda) {
      const busqueda = this.filtroBusqueda.toLowerCase();
      filtrados = filtrados.filter(p =>
        p.clienteNombre?.toLowerCase().includes(busqueda) ||
        p.clienteTelefono?.includes(busqueda) ||
        p.direccionEnvio?.toLowerCase().includes(busqueda)
      );
    }

    if (this.filtroEstado) {
      filtrados = filtrados.filter(p => p.estado === this.filtroEstado);
    }

    this.pedidosFiltradosSubject.next(filtrados);
  }

  // ========== FILTRAR ==========
  filtrar(busqueda: string, estado: string): void {
    this.filtroBusqueda = busqueda || '';
    this.filtroEstado = estado || '';
    this.aplicarFiltrosLocales();
  }

  // ========== LIMPIAR FILTROS ==========
  limpiarFiltros(): void {
    this.filtroBusqueda = '';
    this.filtroEstado = '';
    this.aplicarFiltrosLocales();
  }

  // ========== CAMBIAR PÁGINA ==========
  cambiarPagina(page: number): void {
    this.cargarPedidos(page, this.paginaSize, this.filtroEstado);
  }

  // ========== CAMBIAR TAMAÑO DE PÁGINA ==========
  cambiarSize(size: number): void {
    this.paginaSize = size;
    this.cargarPedidos(this.paginaActual, size, this.filtroEstado);
  }

  // ========== LIMPIAR TODO ==========
  limpiarTodo(): void {
    this.pedidosSubject.next([]);
    this.pedidosFiltradosSubject.next([]);
    this.totalElementsSubject.next(0);
    this.isLoadingSubject.next(false);
  }

  // ========== GETTERS ==========
  get isLoading(): boolean {
    return this.isLoadingSubject.value;
  }

  get totalElements(): number {
    return this.totalElementsSubject.value;
  }

  get paginaActualValue(): number {
    return this.paginaActual;
  }

  get paginaSizeValue(): number {
    return this.paginaSize;
  }
}