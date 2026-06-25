import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TransportistaStateService } from '../../service/transportista-state.service';
import { DocumentoStateService } from '../../service/documento-state.service';
import { DocumentoService } from '../../service/documento.service';
import { CommonModule } from '@angular/common';
import { DocumentoPersonal } from '../../models/documento-personal.model';
import { TransportistaConDocs } from '../../models/transportista-con-docs.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-documentos',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './documentos.component.html',
  styleUrl: './documentos.component.css'
})
export class DocumentosComponent implements OnInit, OnDestroy {

  // ========== DATOS ==========
  transportistas: TransportistaConDocs[] = [];
  documentos: DocumentoPersonal[] = [];
  isLoading = false;
  
  // ========== CONTROL DE SUSCRIPCIONES ==========
  private transportistasSubscription: Subscription | null = null;
  private isLoadingSubscription: Subscription | null = null;
  private documentosSubscription: Subscription | null = null;

  // ========== ESTADOS ==========
  selectedTransportistaId: number | null = null;
  documentoIdEnEdicion: number | null = null;
  transportistaSeleccionado: string = '';

  // ========== FORMULARIO ==========
  documento = {
    tipoDocumento: 'SOAT',
    valor: '',
    fechaEmision: '',
    fechaVencimiento: '',
    activo: true
  };

  // ========== NOTIFICACIÓN TOAST ==========
  toast = {
    visible: false,
    message: '',
    isError: false,
    isWarning: false
  };

  constructor(
    private readonly documentoService: DocumentoService,
    private readonly transportistaState: TransportistaStateService,
    private readonly documentoState: DocumentoStateService
  ) {}

  ngOnInit(): void {
    this.isLoadingSubscription = this.transportistaState.isLoading$.subscribe({
      next: (loading) => this.isLoading = loading
    });

    // 1. Escuchamos los transportistas
    this.transportistasSubscription = this.transportistaState.transportistas$.subscribe({
      next: (data) => {
        if (!data || data.length === 0) {
          this.transportistas = [];
          return;
        }
        
        // Mapeamos inicialmente e inmediatamente mandamos a pedir sus documentos para evitar las 'X' fijas
        this.transportistas = data.map((t: any) => {
          // Mandar a pedir al backend en segundo plano si el state no los tiene
          if (t.id) {
            this.documentoState.cargarDocumentos(t.id);
          }
          return {
            ...t,
            documentosMap: { SOAT: false, REVISION_TECNICA: false, LICENCIA: false, TARJETA_CIRCULACION: false, DNI: false }
          };
        });
      }
    });
    
    // 2. 🔥 EL OBSERVABLE CLAVE: Cada vez que cambie CUALQUIER documento en el State global
    this.documentosSubscription = this.documentoState.documentos$.subscribe({
      next: (data) => {
        if (!data) return;

        // Actualizamos los mapas de TODOS los transportistas que ya estén cargados en la tabla
        this.transportistas.forEach(t => {
          if (t.id && data[t.id]) {
            t.documentosMap = this.mapearDocumentosPorTipo(data[t.id]);
          }
        });
        // Forzamos el redibujado de la tabla principal
        this.transportistas = [...this.transportistas];

        // Si hay un transportista seleccionado, actualizamos su lista interna del panel inferior
        if (this.selectedTransportistaId && data[this.selectedTransportistaId]) {
          this.documentos = [...data[this.selectedTransportistaId]];
        }
      }
    });
    
    const currentData = this.transportistaState['transportistasSubject']?.value;
    if (!currentData || currentData.length === 0) {
      this.transportistaState.cargarTransportistas();
    }
  }

  ngOnDestroy(): void {
    if (this.transportistasSubscription) this.transportistasSubscription.unsubscribe();
    if (this.isLoadingSubscription) this.isLoadingSubscription.unsubscribe();
    if (this.documentosSubscription) this.documentosSubscription.unsubscribe();
  }

  mostrarMensaje(mensaje: string, tipo: 'success' | 'error' | 'warning' = 'success'): void {
    let textoLimpio = mensaje.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF]/g, '').trim();
    this.toast.message = textoLimpio;
    this.toast.isError = tipo === 'error';
    this.toast.isWarning = tipo === 'warning';
    this.toast.visible = true;
    setTimeout(() => { this.toast.visible = false; }, 4000);
  }

  mapearDocumentosPorTipo(docs: DocumentoPersonal[]): DocumentoMap {
    const map: DocumentoMap = { SOAT: false, REVISION_TECNICA: false, LICENCIA: false, TARJETA_CIRCULACION: false, DNI: false };
    if (docs) {
      docs.forEach((doc: DocumentoPersonal) => {
        // SOLAMENTE si está activo pasará a tener un Check ✔
        if (doc.activo && doc.tipoDocumento) {
          const key = doc.tipoDocumento as keyof DocumentoMap;
          if (key in map) map[key] = true;
        }
      });
    }
    return map;
  }

  refrescar(): void {
    this.transportistaState.recargar();
    if (this.selectedTransportistaId) {
      this.documentoState.recargarDocumentos(this.selectedTransportistaId);
    }
  }

  seleccionarTransportista(id: number): void {
    if (this.selectedTransportistaId === id) {
      this.cerrarFormulario();
      return;
    }
    this.selectedTransportistaId = id;
    this.cancelarEdicionInterna();
    
    // Obtenemos de inmediato los documentos del State
    this.documentos = [...this.documentoState.getDocumentos(id)];
    
    const transportista = this.transportistas.find(t => t.id === id);
    this.transportistaSeleccionado = transportista ? `${transportista.nombre} ${transportista.apellidos}` : 'Transportista';
  }

  esDocumentoConFechas(): boolean {
    return this.documento.tipoDocumento === 'SOAT' || this.documento.tipoDocumento === 'REVISION_TECNICA';
  }

  guardarCambiosDocumento(): void {
    if (!this.selectedTransportistaId) return;
    if (!this.documento.valor.trim()) {
      this.mostrarMensaje('El código o número de documento es obligatorio', 'warning');
      return;
    }

    if (this.documentoIdEnEdicion) {
      // PUT
      this.documentoService.actualizar(this.documentoIdEnEdicion, this.documento).subscribe({
        next: () => {
          this.mostrarMensaje('Documento actualizado correctamente', 'success');
          this.documentoState.recargarDocumentos(this.selectedTransportistaId!);
          this.cancelarEdicionInterna();
        },
        error: (err) => this.mostrarMensaje('Error al actualizar: ' + (err.error?.message || ''), 'error')
      });
    } else {
      // POST
      this.documentoService.crear(this.selectedTransportistaId, this.documento).subscribe({
        next: (response: DocumentoPersonal) => {
          this.mostrarMensaje('Documento guardado exitosamente', 'success');
          this.documentoState.agregarDocumento(this.selectedTransportistaId!, response);
          this.cancelarEdicionInterna();
        },
        error: (err) => this.mostrarMensaje('Error al guardar: ' + (err.error?.message || ''), 'error')
      });
    }
  }

  cargarDocumentoEnFormulario(doc: DocumentoPersonal): void {
    this.documentoIdEnEdicion = doc.id || null;
    this.documento = {
      tipoDocumento: doc.tipoDocumento || 'SOAT',
      valor: doc.valor || '',
      fechaEmision: doc.fechaEmision ? doc.fechaEmision.substring(0, 10) : '',
      fechaVencimiento: doc.fechaVencimiento ? doc.fechaVencimiento.substring(0, 10) : '',
      activo: doc.activo ?? true
    };
  }

  // ========== 🔥 CORRECCIÓN DEL CAMBIO DE ESTADO (PATCH) ==========
  alternarEstadoActivo(doc: DocumentoPersonal): void {
    const nuevoEstado = !doc.activo;
    this.documentoService.cambiarEstado(doc.id!, nuevoEstado).subscribe({
      next: () => {
        this.mostrarMensaje(`Estado cambiado correctamente`, 'success');
        
        // Forzamos al State global a recargar los documentos de este transportista
        this.documentoState.recargarDocumentos(this.selectedTransportistaId!);
        
        // Si justo estábamos editando ese mismo documento en el formulario de arriba, actualizamos su select
        if (this.documentoIdEnEdicion === doc.id) {
          this.documento.activo = nuevoEstado;
        }
      },
      error: () => this.mostrarMensaje('No se pudo modificar el estado del documento', 'error')
    });
  }

  eliminarDocumento(id: number): void {
    if (!confirm('¿Está seguro de eliminar este documento?')) return;
    this.documentoService.eliminar(id).subscribe({
      next: () => {
        this.mostrarMensaje('Documento eliminado correctamente', 'success');
        if (this.selectedTransportistaId) {
          this.documentoState.eliminarDocumentoLocal(this.selectedTransportistaId, id);
          this.documentoState.recargarDocumentos(this.selectedTransportistaId);
        }
        this.cancelarEdicionInterna();
      },
      error: () => this.mostrarMensaje('No se pudo eliminar el documento', 'error')
    });
  }

  get tieneDocumentos(): boolean { return this.documentos && this.documentos.length > 0; }
  get nombreTransportistaSeleccionado(): string { return this.transportistaSeleccionado || 'Seleccionado'; }

  cancelarEdicionInterna(): void {
    this.documentoIdEnEdicion = null;
    this.documento = { tipoDocumento: 'SOAT', valor: '', fechaEmision: '', fechaVencimiento: '', activo: true };
  }

  cerrarFormulario(): void {
    this.selectedTransportistaId = null;
    this.transportistaSeleccionado = '';
    this.documentos = [];
    this.cancelarEdicionInterna();
  }

  trackById(index: number, item: any): number { return item.id || index; }
}

interface DocumentoMap { SOAT: boolean; REVISION_TECNICA: boolean; LICENCIA: boolean; TARJETA_CIRCULACION: boolean; DNI: boolean; }