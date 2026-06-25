// documento-state.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DocumentoService } from './documento.service';
import { DocumentoPersonal } from '../models/documento-personal.model';

@Injectable({
  providedIn: 'root'
})
export class DocumentoStateService {
  
  // ✅ Estado de documentos por transportista
  private documentosSubject = new BehaviorSubject<{ [key: number]: DocumentoPersonal[] }>({});
  public documentos$ = this.documentosSubject.asObservable();
  
  // ✅ Estado de carga
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$ = this.isLoadingSubject.asObservable();

  constructor(private documentoService: DocumentoService) {}

  // ========== CARGAR DOCUMENTOS DE UN TRANSPORTISTA ==========
  cargarDocumentos(transportistaId: number): void {
    if (!transportistaId) return;
    
    this.isLoadingSubject.next(true);
    this.documentoService.listar(transportistaId).subscribe({
      next: (data: DocumentoPersonal[]) => {
        const current = this.documentosSubject.value;
        current[transportistaId] = data ?? [];
        this.documentosSubject.next({ ...current });
        this.isLoadingSubject.next(false);
      },
      error: (error) => {
        console.error(`Error al cargar documentos del transportista ${transportistaId}`, error);
        const current = this.documentosSubject.value;
        current[transportistaId] = [];
        this.documentosSubject.next({ ...current });
        this.isLoadingSubject.next(false);
      }
    });
  }

  // ========== OBTENER DOCUMENTOS DE UN TRANSPORTISTA ==========
  getDocumentos(transportistaId: number): DocumentoPersonal[] {
    return this.documentosSubject.value[transportistaId] || [];
  }

  // ========== AGREGAR DOCUMENTO ==========
  agregarDocumento(transportistaId: number, documento: DocumentoPersonal): void {
    const current = this.documentosSubject.value;
    if (!current[transportistaId]) {
      current[transportistaId] = [];
    }
    current[transportistaId] = [...current[transportistaId], documento];
    this.documentosSubject.next({ ...current });
  }

  // ========== ACTUALIZAR DOCUMENTO ==========
  actualizarDocumento(transportistaId: number, documento: DocumentoPersonal): void {
    const current = this.documentosSubject.value;
    if (current[transportistaId]) {
      const index = current[transportistaId].findIndex(d => d.id === documento.id);
      if (index !== -1) {
        current[transportistaId][index] = documento;
        this.documentosSubject.next({ ...current });
      }
    }
  }

  // ========== ELIMINAR DOCUMENTO (local) ==========
  eliminarDocumentoLocal(transportistaId: number, documentoId: number): void {
    const current = this.documentosSubject.value;
    if (current[transportistaId]) {
      current[transportistaId] = current[transportistaId].filter(d => d.id !== documentoId);
      this.documentosSubject.next({ ...current });
    }
  }

  // ========== RECARGAR DOCUMENTOS ==========
  recargarDocumentos(transportistaId: number): void {
    this.cargarDocumentos(transportistaId);
  }

  // ========== LIMPIAR DOCUMENTOS DE UN TRANSPORTISTA ==========
  limpiarDocumentos(transportistaId: number): void {
    const current = this.documentosSubject.value;
    delete current[transportistaId];
    this.documentosSubject.next({ ...current });
  }

  // ========== LIMPIAR TODO ==========
  limpiarTodo(): void {
    this.documentosSubject.next({});
  }

  // ========== OBTENER DOCUMENTO POR ID ==========
  getDocumentoById(transportistaId: number, documentoId: number): DocumentoPersonal | undefined {
    const documentos = this.getDocumentos(transportistaId);
    return documentos.find(d => d.id === documentoId);
  }

  // ========== CONTAR DOCUMENTOS ==========
  contarDocumentos(transportistaId: number): number {
    return this.getDocumentos(transportistaId).length;
  }
}