import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TransportistaService } from '../../service/transportista.service';
import { DocumentoService } from '../../service/documento.service';
import { TransportistaStateService } from '../../service/transportista-state.service';
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
export class TransportistasComponent implements OnInit {

  // ========== FORMULARIOS ==========
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

  documento: DocumentoRequest = {
    tipoDocumento: 'SOAT',
    valor: '',
    fechaEmision: '',
    fechaVencimiento: ''
  };

  // ========== DATOS ==========
  transportistas: Transportista[] = [];
  transportistasFiltrados: Transportista[] = [];
  documentos: DocumentoPersonal[] = [];

  // ========== ESTADOS ==========
  mostrarFormulario = false;
  mostrarFormularioEdicion = false;
  mostrarDocumentos = false;
  selectedTransportistaId: number | null = null;
  transportistaEnEdicion: Transportista | null = null;
  isLoading = false;

  // ========== FILTROS ==========
  filtroTipo: string = '';
  filtroEstado: string = '';
  filtroBusqueda: string = '';

  // ========== PAGINACIÓN ==========
  paginaActual = 0;
  paginaSize = 10;
  totalElementos = 0;
  

  constructor(
    private readonly service: TransportistaService,
    private readonly documentoService: DocumentoService,
    private readonly transportistaState: TransportistaStateService
  ) {}

  ngOnInit(): void {
    // ✅ Suscribirse al estado compartido
    this.transportistaState.transportistas$.subscribe({
      next: (data: Transportista[]) => {
        this.transportistas = data;
        this.aplicarFiltros();
      }
    });
    this.cargar();
  }

  // ========== CARGAR DATOS ==========
  cargar(): void {
    this.transportistaState.cargarTransportistas();
  }

  mostrarConfirmacion: boolean = false;

  // ========== CRUD PRINCIPAL ==========

  // Este método se ejecuta al hacer clic en el botón "Guardar" del formulario
  crear(): void {
    console.log('Datos a enviar:', JSON.stringify(this.transportista, null, 2));
    
    // 1️⃣ Primero evaluamos las validaciones
    if (!this.validarTransportista()) {
      console.log('❌ Validación fallida');
      return;
    }

    // 2️⃣ Si pasa la validación, abrimos tu nuevo modal de cristal en lugar de usar el confirm nativo
    this.mostrarConfirmacion = true;
  }

  // Este método lo llamará el botón "❌ Cancelar" dentro del modal
  cancelarCreacion(): void {
    this.mostrarConfirmacion = false;
  }

  confirmarYEnviar(): void {
    this.mostrarConfirmacion = false; // Cerramos el modal de confirmación inmediatamente
    
    try {
      const datosEnviar = { ...this.transportista };
      if (datosEnviar.tipoTransporte === 'CAMIONERO') {
        datosEnviar.capacidad = 0;
      }
      
      console.log('📡 Datos listos para enviar:', datosEnviar);

      this.service.crear(datosEnviar).subscribe({
        next: (respuesta: any) => {
          console.log('✅ Servidor respondió con éxito:', respuesta);
          
          // 1️⃣ Lanzamos tu Toast Premium de Éxito inmediatamente
          this.mostrarMensaje('Transportista creado exitosamente', false); 
          
          // 2️⃣ Limpiamos el formulario y lo cerramos
          this.limpiarFormulario();
          this.mostrarFormulario = false;
          
          // 3️⃣ Refrescamos la tabla
          if (this.transportistaState && typeof this.transportistaState.recargar === 'function') {
            this.transportistaState.recargar();
          } else if (typeof this.cargar === 'function') {
            this.cargar(); // Por si tu método de recarga principal se llama cargar()
          }
        },
        error: (error: any) => {
          console.error('❌ El servidor devolvió un error:', error);
          // Si falla el servidor, muestra el Toast en rojo que ya vimos que funciona
          const msg = error.error?.message || 'Error interno del servidor';
          this.mostrarMensaje('No se pudo crear: ' + msg, true);
        }
      });

    } catch (jsError) {
      // Por si hay un error de JavaScript interno antes de enviar la petición
      console.error('❌ Error de código en Angular:', jsError);
      this.mostrarMensaje('Error local en la aplicación', true);
    }
  }

  // ========== ACTUALIZAR ==========

  iniciarEdicion(transportista: Transportista): void {
    this.transportistaEnEdicion = transportista;
    this.transportista = {
      nombre: transportista.nombre,
      apellidos: transportista.apellidos,
      dni: transportista.dni,
      edad: transportista.edad,
      tipoTransporte: transportista.tipoTransporte,
      placa: transportista.placa,
      vehiculoInfo: transportista.vehiculoInfo || '',
      // ✅ Si es CAMIONERO, capacidad se muestra como 0 (no aplica)
      capacidad: transportista.tipoTransporte === 'CAMIONERO' ? 0 : transportista.capacidad,
      estado: transportista.estado,
    };
    this.mostrarFormularioEdicion = true;
  }

  actualizar(): void {
    if (!this.transportistaEnEdicion) return;
    if (!this.validarTransportista()) return;

    if (!confirm('¿Desea actualizar los datos de este transportista?')) return;

    this.isLoading = true;
    this.service.actualizar(this.transportistaEnEdicion.id!, this.transportista).subscribe({
      next: () => {
        this.mostrarMensaje('✅ Transportista actualizado exitosamente');
        this.cancelarEdicion();
        this.cargar();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al actualizar transportista', error);
        this.mostrarMensaje('❌ No se pudo actualizar: ' + error.error?.message);
        this.isLoading = false;
      }
    });
  }

  cancelarEdicion(): void {
    this.transportistaEnEdicion = null;
    this.mostrarFormularioEdicion = false;
    this.limpiarFormulario();
  }

  // ========== CAMBIAR ESTADO ==========

  cambiarEstado(id: number, estadoActual: string): void {
    const nuevoEstado = estadoActual === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    const mensaje = estadoActual === 'ACTIVO' 
      ? '¿Desea desactivar este transportista?' 
      : '¿Desea activar este transportista?';

    if (!confirm(mensaje)) return;

    this.isLoading = true;
    this.service.cambiarEstado(id, nuevoEstado).subscribe({
      next: () => {
        this.mostrarMensaje(`✅ Transportista ${nuevoEstado === 'ACTIVO' ? 'activado' : 'desactivado'} correctamente`);
        this.cargar();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cambiar estado', error);
        this.mostrarMensaje('❌ No se pudo cambiar el estado');
        this.isLoading = false;
      }
    });
  }

  // ========== ELIMINAR (SOFT DELETE) ==========

  eliminar(id: number, nombre: string): void {
    if (!confirm(`¿Desea eliminar al transportista "${nombre}"?`)) return;
    if (!confirm('⚠️ Esta acción es reversible. ¿Desea continuar?')) return;

    this.isLoading = true;
    this.service.eliminar(id).subscribe({
      next: () => {
        this.mostrarMensaje(`✅ Transportista "${nombre}" eliminado correctamente`);
        this.cargar();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al eliminar transportista', error);
        this.mostrarMensaje('❌ No se pudo eliminar el transportista');
        this.isLoading = false;
      }
    });
  }

  // ========== RESTAURAR ==========

  restaurar(id: number, nombre: string): void {
    if (!confirm(`¿Desea restaurar al transportista "${nombre}"?`)) return;

    this.isLoading = true;
    this.service.restaurar(id).subscribe({
      next: () => {
        this.mostrarMensaje(`✅ Transportista "${nombre}" restaurado correctamente`);
        this.cargar();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al restaurar transportista', error);
        this.mostrarMensaje('❌ No se pudo restaurar el transportista');
        this.isLoading = false;
      }
    });
  }

  // ========== ELIMINAR PERMANENTE ==========

  eliminarPermanente(id: number, nombre: string): void {
    if (!confirm(`⚠️ ¿Desea ELIMINAR DEFINITIVAMENTE al transportista "${nombre}"?`)) return;
    if (!confirm('⚠️⚠️ Esta acción NO ES REVERSIBLE. ¿Está seguro?')) return;

    this.isLoading = true;
    this.service.eliminarPermanente(id).subscribe({
      next: () => {
        this.mostrarMensaje(`🗑️ Transportista "${nombre}" eliminado permanentemente`);
        this.cargar();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al eliminar permanentemente', error);
        this.mostrarMensaje('❌ No se pudo eliminar permanentemente');
        this.isLoading = false;
      }
    });
  }

  // ========== DOCUMENTOS ==========

  seleccionarTransportista(id: number): void {
    this.selectedTransportistaId = id;
    this.mostrarDocumentos = true;
    this.cargarDocumentos();
  }

  cerrarDocumentos(): void {
    this.mostrarDocumentos = false;
    this.selectedTransportistaId = null;
    this.documentos = [];
  }

  crearDocumento(): void {
    if (this.selectedTransportistaId === null) {
      this.mostrarMensaje('⚠️ Seleccione un transportista primero');
      return;
    }

    if (!this.validarDocumento()) return;

    if (!confirm('¿Desea agregar este documento?')) return;

    this.isLoading = true;
    this.documentoService.crear(this.selectedTransportistaId, this.documento).subscribe({
      next: () => {
        this.mostrarMensaje('✅ Documento agregado exitosamente');
        this.limpiarDocumento();
        this.cargarDocumentos();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al crear documento', error);
        this.mostrarMensaje('❌ No se pudo agregar el documento: ' + error.error?.message);
        this.isLoading = false;
      }
    });
  }

  private validarDocumento(): boolean {
    if (!this.documento.tipoDocumento) {
      this.mostrarMensaje('⚠️ El tipo de documento es obligatorio');
      return false;
    }
    if (!this.documento.valor || this.documento.valor.trim().length === 0) {
      this.mostrarMensaje('⚠️ El valor del documento es obligatorio');
      return false;
    }
    
    // Validar fechas para SOAT y REVISION_TECNICA
    if (this.documento.tipoDocumento === 'SOAT' || this.documento.tipoDocumento === 'REVISION_TECNICA') {
      if (!this.documento.fechaEmision || !this.documento.fechaVencimiento) {
        this.mostrarMensaje('⚠️ Para SOAT y Revisión Técnica, la fecha de emisión y vencimiento son obligatorias');
        return false;
      }
    }
    
    return true;
  }

  eliminarDocumento(id: number): void {
    if (!confirm('¿Desea eliminar este documento?')) return;

    this.isLoading = true;
    this.documentoService.eliminar(id).subscribe({
      next: () => {
        this.mostrarMensaje('✅ Documento eliminado correctamente');
        this.cargarDocumentos();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al eliminar documento', error);
        this.mostrarMensaje('❌ No se pudo eliminar el documento');
        this.isLoading = false;
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
      error: (error) => {
        console.error('Error al cargar documentos', error);
        this.documentos = [];
      }
    });
  }

  // ========== FILTROS ==========

  aplicarFiltros(): void {
    // ✅ Verificar que sea un array
    if (!this.transportistas || !Array.isArray(this.transportistas)) {
      console.warn('this.transportistas no es un array');
      this.transportistasFiltrados = [];
      return;
    }

    let filtrados = [...this.transportistas];

    if (this.filtroBusqueda) {
      const busqueda = this.filtroBusqueda.toLowerCase();
      filtrados = filtrados.filter(t =>
        t.nombre?.toLowerCase().includes(busqueda) ||
        t.apellidos?.toLowerCase().includes(busqueda) ||
        t.dni?.includes(busqueda)
      );
    }

    if (this.filtroTipo) {
      filtrados = filtrados.filter(t => t.tipoTransporte === this.filtroTipo);
    }

    if (this.filtroEstado) {
      filtrados = filtrados.filter(t => t.estado === this.filtroEstado);
    }

    this.transportistasFiltrados = filtrados;
    this.totalElementos = filtrados.length;
  }

  limpiarFiltros(): void {
    this.filtroBusqueda = '';
    this.filtroTipo = '';
    this.filtroEstado = '';
    this.aplicarFiltros();
  }

  // ========== UTILIDADES ==========

  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) {
      this.limpiarFormulario();
    }
  }

  private validarTransportista(): boolean {
    console.log('Validando transportista:', this.transportista);

    if (!this.transportista.nombre || this.transportista.nombre.trim().length === 0) {
      this.mostrarMensaje('⚠️ El nombre es obligatorio');
      return false;
    }

    if (!this.transportista.apellidos || this.transportista.apellidos.trim().length === 0) {
      this.mostrarMensaje('⚠️ Los apellidos son obligatorios');
      return false;
    }

    if (!this.transportista.dni || this.transportista.dni.trim().length !== 8) {
      this.mostrarMensaje('⚠️ El DNI debe tener 8 dígitos');
      return false;
    }

    const edadNumero = Number(this.transportista.edad);
    if (isNaN(edadNumero) || edadNumero < 18 || edadNumero > 100) {
      this.mostrarMensaje('⚠️ La edad debe ser un número válido entre 18 y 100 años');
      return false;
    }

    if (!this.transportista.placa || this.transportista.placa.trim().length === 0) {
      this.mostrarMensaje('⚠️ La placa es obligatoria');
      return false;
    }

    if (this.transportista.tipoTransporte === 'VOLQUETERO') {
      if (!this.transportista.capacidad || this.transportista.capacidad <= 0) {
        this.mostrarMensaje('⚠️ La capacidad en metros cúbicos (m³) es obligatoria para transportistas volqueteros');
        return false;
      }
    } else {
      console.log('✅ CAMIONERO - Capacidad ignorada');
    }

    return true;
  }

  toast = {
    visible: false,
    message: '',
    isError: false
  };

    // ASEGÚRATE DE QUE ESTÉ EXACTAMENTE ASÍ EN EL .TS
  mostrarMensaje(mensaje: string, esError: boolean = false): void {
    this.toast.message = mensaje;
    this.toast.isError = esError;
    this.toast.visible = true;

    console.log('🔮 Toast activado:', this.toast); // Agrega este log para verificar en consola

    setTimeout(() => {
      this.toast.visible = false;
      console.log('🔮 Toast ocultado');
    }, 4000);
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

  // ========== GETTERS ==========

  get transportistaEncontrado(): Transportista | null {
    if (!this.transportistas.length) return null;
    return this.transportistas.find(t => t.id === this.selectedTransportistaId) || null;
  }

  get nombreTransportistaSeleccionado(): string {
    const t = this.transportistaEncontrado;
    return t ? `${t.nombre} ${t.apellidos}` : 'Seleccionado';
  }
}