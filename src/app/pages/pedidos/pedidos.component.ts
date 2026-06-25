import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PedidoService } from '../../service/pedido.service';
import { PedidoStateService } from '../../service/pedido-state.service';
import { TransportistaStateService } from '../../service/transportista-state.service';
import { Transportista } from '../../models/transportista.model';
import { Pedido, EstadoPedido } from '../../models/pedido.model';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.css'],
})
export class PedidosComponent implements OnInit {

  // ========== FORMULARIO ==========
  pedido: Pedido = {
    clienteNombre: '',
    clienteTelefono: '',
    direccionEnvio: '',
    tipoTransporte: 'CAMIONERO',
    material: 'PANDERETA',
    cantidad: 0,
    montoTotal: 0,
    adelanto: 0,
    piso: 1,
    horaEnvio: '',
    transportistaId: 0
  };

  pedidoEnEdicion: Pedido | null = null;
  mostrarFormulario = false;
  mostrarFormularioEdicion = false;
  isLoading = false;

  // ========== DATOS ==========
  transportistas: Transportista[] = [];
  transportistasFiltrados: Transportista[] = [];
  pedidos: Pedido[] = [];
  pedidosFiltrados: Pedido[] = [];
  materiales: string[] = [];
  estadosPedido = ['EN_ENVIO', 'ENTREGADO', 'CANCELADO'];

  // ========== FILTROS ==========
  filtroEstado: string = '';
  filtroBusqueda: string = '';

  // ========== PAGINACIÓN ==========
  paginaActual = 0;
  paginaSize = 10;
  totalElementos = 0;

  // ========== ESTADOS DE PEDIDO ==========
  EstadoPedido = EstadoPedido;

  // ========== NOTIFICACIÓN TOAST INTEGRADAS ==========
  toast = {
    visible: false,
    message: '',
    isError: false,
    isWarning: false
  };

  constructor(
    private readonly pedidoService: PedidoService,
    private readonly transportistaState: TransportistaStateService,
    private readonly pedidoState: PedidoStateService
  ) {}

  ngOnInit(): void {
    // Suscribirse al estado compartido de transportistas
    this.transportistaState.transportistas$.subscribe({
      next: (data: Transportista[]) => {
        this.transportistas = data.filter(t => t.estado === 'ACTIVO' && !t.deletedAt);
        this.actualizarTransportistas();
      }
    });
    
    // Suscribirse al estado compartido de pedidos
    this.pedidoState.pedidos$.subscribe({
      next: (data: Pedido[]) => {
        this.pedidos = data;
        this.totalElementos = this.pedidoState.totalElements;
        this.aplicarFiltrosLocales();
      }
    });
    
    this.pedidoState.pedidosFiltrados$.subscribe({
      next: (data: Pedido[]) => {
        this.pedidosFiltrados = data;
      }
    });
    
    this.pedidoState.isLoading$.subscribe({
      next: (loading) => {
        this.isLoading = loading;
      }
    });
    
    this.actualizarMateriales();
    this.actualizarTransportistas();
    this.cargarTransportistas();
    this.cargarPedidos();
  }

  // ========== CARGAR DATOS ==========

  cargarTransportistas(): void {
    this.transportistaState.cargarTransportistas();
  }

  cargarPedidos(): void {
    this.pedidoState.cargarPedidos(this.paginaActual, this.paginaSize);
  }

  // ========== ACTUALIZAR MATERIALES ==========
  actualizarMateriales(): void {
    if (this.pedido.tipoTransporte === 'CAMIONERO') {
      this.materiales = ['PANDERETA', 'TECHO'];
    } else {
      this.materiales = [
        'ARENA_GRUESA',
        'ARENA_FINA',
        'ARENA_ASENTAR',
        'PIEDRA',
        'DESMONTE'
      ];
    }

    if (!this.materiales.includes(this.pedido.material)) {
      this.pedido.material = this.materiales[0];
    }
  }

  // ========== ACTUALIZAR TRANSPORTISTAS ==========
  actualizarTransportistas(): void {
    this.transportistasFiltrados = this.transportistas.filter(
      t => t.tipoTransporte === this.pedido.tipoTransporte
    );
    
    if (this.pedido.transportistaId) {
      const existe = this.transportistasFiltrados.some(t => t.id === this.pedido.transportistaId);
      if (!existe) {
        this.pedido.transportistaId = 0;
      }
    }
  }

  // ========== FILTROS LOCALES ==========
  aplicarFiltrosLocales(): void {
    this.pedidoState.filtrar(this.filtroBusqueda, this.filtroEstado);
  }

  // ========== UTILIDADES ==========

  obtenerNombreTransportista(transportistaId: number): string {
    const transportista = this.transportistas.find(t => t.id === transportistaId);
    if (!transportista) {
      return `ID: ${transportistaId}`;
    }
    return `${transportista.nombre} ${transportista.apellidos}`;
  }

  // ========== EVENTO AL CAMBIAR TIPO DE TRANSPORTE ==========
  onTipoTransporteChange(): void {
    this.actualizarMateriales();
    this.actualizarTransportistas();
    this.pedido.transportistaId = 0;
  }

  // ========== GESTIÓN DE FORMULARIO ==========

  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) {
      this.limpiarFormulario();
    }
  }

  // ========== NOTIFICACIONES FLOTANTES PREMIUM ==========
  mostrarMensaje(mensaje: string, tipo: 'success' | 'error' | 'warning' = 'success'): void {
    // Sanitizado de emojis duplicados
    let textoLimpio = mensaje.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF]/g, '').trim();

    this.toast.message = textoLimpio;
    this.toast.isError = tipo === 'error';
    this.toast.isWarning = tipo === 'warning';
    this.toast.visible = true;

    console.log('🔮 Toast activado:', this.toast);

    setTimeout(() => {
      this.toast.visible = false;
    }, 4000);
  }

  private validarPedido(): boolean {
    if (!this.pedido.clienteNombre?.trim()) {
      this.mostrarMensaje('El nombre del cliente es obligatorio', 'warning');
      return false;
    }
    if (!this.pedido.clienteTelefono?.trim()) {
      this.mostrarMensaje('El teléfono del cliente es obligatorio', 'warning');
      return false;
    }
    if (!this.pedido.direccionEnvio?.trim()) {
      this.mostrarMensaje('La dirección de envío es obligatoria', 'warning');
      return false;
    }
    if (!this.pedido.transportistaId || this.pedido.transportistaId === 0) {
      this.mostrarMensaje('Debe seleccionar un transportista', 'warning');
      return false;
    }
    if (!this.pedido.material) {
      this.mostrarMensaje('El material es obligatorio', 'warning');
      return false;
    }
    if (!this.pedido.cantidad || this.pedido.cantidad <= 0) {
      this.mostrarMensaje('La cantidad debe ser mayor a 0', 'warning');
      return false;
    }
    if (!this.pedido.horaEnvio) {
      this.mostrarMensaje('La hora de envío es obligatoria', 'warning');
      return false;
    }
    return true;
  }

  // ========== CRUD PRINCIPAL ==========

  crearPedido(): void {
    if (!this.validarPedido()) return;

    if (this.pedido.horaEnvio?.length === 16) {
      this.pedido.horaEnvio = `${this.pedido.horaEnvio}:00`;
    }

    this.pedidoService.crear(this.pedido).subscribe({
      next: (response: Pedido) => {
        this.mostrarMensaje('Pedido creado exitosamente', 'success');
        this.pedidoState.agregarPedido(response);
        this.limpiarFormulario();
        this.mostrarFormulario = false;
        this.cargarTransportistas();
      },
      error: (error: any) => {
        console.error('Error al crear pedido', error);
        this.mostrarMensaje('No se pudo crear el pedido: ' + (error.error?.message || ''), 'error');
      }
    });
  }

  // ========== ACTUALIZAR ==========

  iniciarEdicion(pedido: Pedido): void {
    this.pedidoEnEdicion = pedido;
    this.pedido = {
      clienteNombre: pedido.clienteNombre,
      clienteTelefono: pedido.clienteTelefono,
      direccionEnvio: pedido.direccionEnvio,
      tipoTransporte: pedido.tipoTransporte,
      material: pedido.material,
      cantidad: pedido.cantidad,
      montoTotal: pedido.montoTotal,
      adelanto: pedido.adelanto,
      piso: pedido.piso,
      horaEnvio: pedido.horaEnvio || '',
      transportistaId: pedido.transportistaId || 0
    };
    this.mostrarFormularioEdicion = true;
    this.actualizarMateriales();
    this.actualizarTransportistas();
  }

  actualizarPedido(): void {
    if (!this.pedidoEnEdicion) return;
    if (!this.validarPedido()) return;

    if (this.pedido.horaEnvio?.length === 16) {
      this.pedido.horaEnvio = `${this.pedido.horaEnvio}:00`;
    }

    this.pedidoService.actualizar(this.pedidoEnEdicion.id!, this.pedido).subscribe({
      next: (response: Pedido) => {
        this.mostrarMensaje('Pedido actualizado exitosamente', 'success');
        this.pedidoState.actualizarPedido(response);
        this.cancelarEdicion();
      },
      error: (error: any) => {
        console.error('Error al actualizar pedido', error);
        this.mostrarMensaje('No se pudo actualizar: ' + (error.error?.message || ''), 'error');
      }
    });
  }

  cancelarEdicion(): void {
    this.pedidoEnEdicion = null;
    this.mostrarFormularioEdicion = false;
    this.limpiarFormulario();
  }

  // ========== CAMBIAR ESTADO ==========

  cambiarEstado(id: number, estadoActual: string | undefined): void {
    const estado = estadoActual || 'EN_ENVIO';
    const nuevoEstado = this.obtenerSiguienteEstado(estado);
    if (!nuevoEstado) {
      this.mostrarMensaje('No se puede cambiar el estado de un pedido cancelado', 'warning');
      return;
    }

    this.pedidoService.cambiarEstado(id, nuevoEstado).subscribe({
      next: (response: Pedido) => {
        this.mostrarMensaje(`Estado del pedido cambiado a ${nuevoEstado}`, 'success');
        this.pedidoState.actualizarPedido(response);
      },
      error: (error: any) => {
        console.error('Error al cambiar estado', error);
        this.mostrarMensaje('No se pudo cambiar el estado', 'error');
      }
    });
  }

  private obtenerSiguienteEstado(estadoActual: string): string | null {
    const estados = ['EN_ENVIO', 'ENTREGADO', 'CANCELADO'];
    const index = estados.indexOf(estadoActual);
    
    if (estadoActual === 'CANCELADO') return null;
    if (index === -1) return 'EN_ENVIO';
    if (index === estados.length - 2) return 'CANCELADO';
    return estados[index + 1];
  }

  // ========== ELIMINAR (SOFT DELETE) ==========

  eliminar(id: number, cliente: string): void {
    this.pedidoService.eliminar(id).subscribe({
      next: () => {
        this.mostrarMensaje(`Pedido de "${cliente}" eliminado correctamente`, 'success');
        this.pedidoState.eliminarPedidoLocal(id);
      },
      error: (error: any) => {
        console.error('Error al eliminar pedido', error);
        this.mostrarMensaje('No se pudo eliminar el pedido', 'error');
      }
    });
  }

  // ========== RESTAURAR ==========

  restaurar(id: number, cliente: string): void {
    this.pedidoService.restaurar(id).subscribe({
      next: (response: Pedido) => {
        this.mostrarMensaje(`Pedido de "${cliente}" restaurado correctamente`, 'success');
        this.pedidoState.restaurarPedidoLocal(response);
      },
      error: (error: any) => {
        console.error('Error al restaurar pedido', error);
        this.mostrarMensaje('No se pudo restaurar el pedido', 'error');
      }
    });
  }

  // ========== ELIMINAR PERMANENTE ==========

  eliminarPermanente(id: number, cliente: string): void {
    this.pedidoService.eliminarPermanente(id).subscribe({
      next: () => {
        this.mostrarMensaje(`Pedido de "${cliente}" eliminado permanentemente`, 'success');
        this.pedidoState.eliminarPedidoLocal(id);
      },
      error: (error: any) => {
        console.error('Error al eliminar permanentemente', error);
        this.mostrarMensaje('No se pudo eliminar permanentemente', 'error');
      }
    });
  }

  // ========== FILTROS ==========

  aplicarFiltros(): void {
    this.pedidoState.filtrar(this.filtroBusqueda, this.filtroEstado);
  }

  limpiarFiltros(): void {
    this.filtroBusqueda = '';
    this.filtroEstado = '';
    this.pedidoState.limpiarFiltros();
  }

  // ========== REFRESCAR ==========
  refrescar(): void {
    this.pedidoState.recargarPedidos();
    this.cargarTransportistas();
  }

  private limpiarFormulario(): void {
    this.pedido = {
      clienteNombre: '',
      clienteTelefono: '',
      direccionEnvio: '',
      tipoTransporte: 'CAMIONERO',
      material: 'PANDERETA',
      cantidad: 0,
      montoTotal: 0,
      adelanto: 0,
      piso: 1,
      horaEnvio: '',
      transportistaId: 0
    };
    this.actualizarMateriales();
    this.actualizarTransportistas();
  }

  // ========== GETTERS ==========

  get tienePedidosFiltrados(): boolean {
    return this.pedidosFiltrados && this.pedidosFiltrados.length > 0;
  }

  get nombreClienteSeleccionado(): string {
    if (!this.pedidoEnEdicion) return '';
    return this.pedidoEnEdicion.clienteNombre || 'Cliente';
  }

  // ========== TRACK BY ==========
  trackById(index: number, item: any): number {
    return item.id || index;
  }
}