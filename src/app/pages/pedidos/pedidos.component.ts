import { Component, OnInit } from '@angular/core';
import { CommonModule, NgForOf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PedidoService } from '../../service/pedido.service';
import { TransportistaService } from '../../service/transportista.service';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [FormsModule, NgForOf, CommonModule],
  templateUrl: './pedidos.component.html',
  styleUrl: './pedidos.component.css',
})
export class PedidosComponent implements OnInit {

  pedido = {
    clienteNombre: '',
    clienteTelefono: '',
    direccionEnvio: '',
    tipoTransporte: 'CAMIONERO',
    material: '',
    cantidad: 0,
    montoTotal: 0,
    adelanto: 0,
    piso: 1,
    horaEnvio: '',
    transportistaId: 0
  };

  transportistas: any[] = [];
  pedidos: any[] = [];
  materiales: string[] = [];
  mostrarFormulario = false;

  constructor(
    private pedidoService: PedidoService,
    private transportistaService: TransportistaService
  ) {}

  ngOnInit(): void {
    this.actualizarMateriales();
    this.cargarTransportistas();
    this.cargarPedidos();
  }

  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
  }

  cargarTransportistas(): void {
    this.transportistaService
      .listarPorTipo(this.pedido.tipoTransporte)
      .subscribe({
        next: (data: any) => {
          this.transportistas = data ?? [];
        },
        error: (error) => {
          console.error('Error al cargar transportistas', error);
          this.transportistas = [];
        }
      });
  }

  crearPedido(): void {
    if (this.pedido.horaEnvio && this.pedido.horaEnvio.length === 16) {
      this.pedido.horaEnvio += ':00';
    }

    this.pedidoService.crear(this.pedido).subscribe({
      next: () => {
        alert('Pedido creado');
        this.limpiarFormulario();
        this.cargarPedidos();
        this.cargarTransportistas();
        this.mostrarFormulario = false;
      },
      error: (error) => {
        console.error('Error al crear pedido', error);
        alert('No se pudo crear el pedido');
      }
    });
  }

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
      this.pedido.material = '';
    }

    this.pedido.transportistaId = 0;
  }

  cargarPedidos(): void {
    this.pedidoService.listar().subscribe({
      next: (data: any) => {
        this.pedidos = data ?? [];
      },
      error: (error) => {
        console.error('Error al cargar pedidos', error);
        this.pedidos = [];
      }
    });
  }

  obtenerNombreTransportista(transportistaId: number): string {
    const transportista = this.transportistas.find(t => t.id === transportistaId);

    if (!transportista) {
      return `ID: ${transportistaId}`;
    }

    return `${transportista.nombre} ${transportista.apellidos}`;
  }

  private limpiarFormulario(): void {
    this.pedido = {
      clienteNombre: '',
      clienteTelefono: '',
      direccionEnvio: '',
      tipoTransporte: 'CAMIONERO',
      material: '',
      cantidad: 0,
      montoTotal: 0,
      adelanto: 0,
      piso: 1,
      horaEnvio: '',
      transportistaId: 0
    };

    this.actualizarMateriales();
  }
}
