import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {TransportistaService} from '../../service/transportista.service';
import {DocumentoService} from '../../service/documento.service';
import {NgForOf, NgIf} from '@angular/common';
import {DocumentoPersonal} from '../../models/documento-personal.model';
import {Transportista} from '../../models/transportista.model';
import {TransportistaConDocs} from '../../models/transportista-con-docs.model';


@Component({
  selector: 'app-documentos',
  standalone: true,
  imports: [FormsModule, NgForOf, NgIf],
  templateUrl: './documentos.component.html',
  styleUrl: './documentos.component.css'
})
export class DocumentosComponent {

  transportistas: TransportistaConDocs[] = [];
  documentos: DocumentoPersonal[] = [];

  selectedTransportistaId: number | null = null;

  documento = {
    tipoDocumento: 'SOAT',
    valor: '',
    fechaEmision: '',
    fechaVencimiento: '',
    activo: true
  };

  constructor(
    private transportistaService: TransportistaService,
    private documentoService: DocumentoService
  ) {}


  mapearDocumentosPorTipo(docs: DocumentoPersonal[]) {
    const map = {
      SOAT: false,
      REVISION_TECNICA: false,
      LICENCIA: false,
      TARJETA_CIRCULACION: false,
      DNI: false
    };

    docs.forEach(doc => {
      if (doc.activo) {
        map[doc.tipoDocumento as keyof typeof map] = true;
      }
    });

    return map;
  }

  cargarTransportistas() {
    this.transportistaService.listar().subscribe((data) => {

      this.transportistas = [];

      data.forEach(t => {
        this.documentoService.listar(t.id!).subscribe((docs) => {

          const transportistaConDocs: TransportistaConDocs = {
            ...t,
            documentosMap: this.mapearDocumentosPorTipo(docs)
          };

          this.transportistas.push(transportistaConDocs);

        });
      });

    });
  }

  seleccionarTransportista(id: number) {
    this.selectedTransportistaId = id;
    this.cargarDocumentos();
  }

  cargarDocumentos() {
    if (!this.selectedTransportistaId) return;

    this.documentoService.listar(this.selectedTransportistaId)
      .subscribe((data: any) => this.documentos = data);
  }

  esDocumentoConFechas(): boolean {
    return this.documento.tipoDocumento === 'SOAT' ||
      this.documento.tipoDocumento === 'REVISION_TECNICA';
  }

  crearDocumento() {
    if (!this.selectedTransportistaId) {
      alert('Seleccione un transportista');
      return;
    }

    this.documentoService
      .crear(this.selectedTransportistaId, this.documento)
      .subscribe(() => {

        alert('Documento agregado');

        // 🔥 refresca lista de documentos del panel
        this.cargarDocumentos();

        // 🔥 refresca tabla principal (SOAT, LICENCIA, etc.)
        this.cargarTransportistas();

        // 🔥 limpia formulario (opcional pero pro)
        this.documento = {
          tipoDocumento: 'SOAT',
          valor: '',
          fechaEmision: '',
          fechaVencimiento: '',
          activo: true
        };
      });
  }



}
