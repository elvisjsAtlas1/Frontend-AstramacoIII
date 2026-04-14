import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TransportistaService } from '../../service/transportista.service';
import { DocumentoService } from '../../service/documento.service';
import { Transportista } from '../../models/transportista.model';
import { DocumentoPersonal } from '../../models/documento-personal.model';

type TransportistaRequest = {
  nombre: string;
  apellidos: string;
  dni: string;
  edad: number;
  tipoTransporte: 'CAMIONERO' | 'VOLQUETERO';
  placa: string;
  vehiculoInfo: string;
  capacidad: number;
  estado: 'ACTIVO' | 'INACTIVO';
};

type DocumentoRequest = {
  tipoDocumento: 'SOAT' | 'REVISION_TECNICA' | 'LICENCIA' | 'TARJETA_CIRCULACION' | 'DNI';
  valor: string;
  fechaEmision: string;
  fechaVencimiento: string;
};

@Component({
  selector: 'app-transportistas',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './transportistas.component.html',
  styleUrls: ['./transportistas.component.css']
})
export class TransportistasComponent {

  transportista: TransportistaRequest = {
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

  transportistas: Transportista[] = [];

  selectedTransportistaId: number | null = null;

  documento: DocumentoRequest = {
    tipoDocumento: 'SOAT',
    valor: '',
    fechaEmision: '',
    fechaVencimiento: ''
  };

  documentos: DocumentoPersonal[] = [];

  mostrarFormulario = false;

  constructor(
    private readonly service: TransportistaService,
    private readonly documentoService: DocumentoService
  ) {}

  crear(): void {
    this.service.crear(this.transportista).subscribe({
      next: () => {
        alert('Transportista creado');
        this.limpiarFormulario();
        this.cargar();
      },
      error: (error: unknown) => {
        console.error('Error al crear transportista', error);
        alert('No se pudo crear el transportista');
      }
    });
  }

  cargar(): void {
    this.service.listar().subscribe({
      next: (data: Transportista[]) => {
        this.transportistas = data ?? [];
      },
      error: (error: unknown) => {
        console.error('Error al cargar transportistas', error);
        this.transportistas = [];
      }
    });
  }

  seleccionarTransportista(id: number): void {
    this.selectedTransportistaId = id;
    this.cargarDocumentos();
  }

  crearDocumento(): void {
    if (this.selectedTransportistaId === null) {
      alert('Seleccione un transportista');
      return;
    }

    this.documentoService.crear(this.selectedTransportistaId, this.documento).subscribe({
      next: () => {
        alert('Documento agregado');
        this.limpiarDocumento();
        this.cargarDocumentos();
      },
      error: (error: unknown) => {
        console.error('Error al crear documento', error);
        alert('No se pudo agregar el documento');
      }
    });
  }

  cargarDocumentos(): void {
    if (this.selectedTransportistaId === null) {
      this.documentos = [];
      return;
    }

    this.documentoService.listar(this.selectedTransportistaId).subscribe({
      next: (data: DocumentoPersonal[]) => {
        this.documentos = data ?? [];
      },
      error: (error: unknown) => {
        console.error('Error al cargar documentos', error);
        this.documentos = [];
      }
    });
  }

  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
  }

  private limpiarFormulario(): void {
    this.transportista = {
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
  }

  private limpiarDocumento(): void {
    this.documento = {
      tipoDocumento: 'SOAT',
      valor: '',
      fechaEmision: '',
      fechaVencimiento: ''
    };
  }
}
