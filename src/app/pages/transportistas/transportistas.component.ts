import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {TransportistaService} from '../../service/transportista.service';
import {DocumentoService} from '../../service/documento.service';

@Component({
  selector: 'app-transportistas',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './transportistas.component.html',
  styleUrl: './transportistas.component.css'
})
export class TransportistasComponent {

  // 🔵 TRANSPORTISTA (QUITAMOS usuarioId)
  transportista = {
    nombre: '',
    apellidos: '',
    dni: '',
    edad: 0,
    tipoTransporte: 'CAMIONERO',
    placa: '',
    vehiculoInfo: '',
    capacidad: 0,
    estado: 'ACTIVO'
  };

  // 🔵 LISTA
  transportistas: any[] = [];

  // 🔥 DOCUMENTOS
  selectedTransportistaId: number | null = null;

  documento = {
    tipoDocumento: 'SOAT',
    valor: '',
    fechaEmision: '',
    fechaVencimiento: ''
  };

  documentos: any[] = [];

  constructor(
    private service: TransportistaService,
    private documentoService: DocumentoService
  ) {}

  // 🔥 CREAR TRANSPORTISTA
  crear() {
    this.service.crear(this.transportista)
      .subscribe(() => {
        alert('Transportista creado');
        this.cargar(); // recarga lista
      });
  }


  cargar() {
    this.service.listar()
      .subscribe((data: any) => this.transportistas = data);
  }

  // 🔥 SELECCIONAR TRANSPORTISTA
  seleccionarTransportista(id: number) {
    this.selectedTransportistaId = id;
    this.cargarDocumentos();
  }

  // 🔥 CREAR DOCUMENTO
  crearDocumento() {
    if (!this.selectedTransportistaId) {
      alert('Seleccione un transportista');
      return;
    }



    this.documentoService.crear(this.selectedTransportistaId, this.documento)
      .subscribe(() => {
        alert('Documento agregado');
        this.cargarDocumentos();
      });
  }

  // 🔥 LISTAR DOCUMENTOS
  cargarDocumentos() {
    if (!this.selectedTransportistaId) return;

    this.documentoService.listar(this.selectedTransportistaId)
      .subscribe((data: any) => this.documentos = data);
  }

  mostrarFormulario: boolean = false;

  toggleFormulario() {
    this.mostrarFormulario = !this.mostrarFormulario;
  }

}
