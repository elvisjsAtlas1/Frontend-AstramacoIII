// transportista-state.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TransportistaService } from './transportista.service';
import { Transportista } from '../models/transportista.model';

@Injectable({
  providedIn: 'root'
})
export class TransportistaStateService {
  
  private transportistasSubject = new BehaviorSubject<Transportista[]>([]);
  public transportistas$ = this.transportistasSubject.asObservable();
  
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$ = this.isLoadingSubject.asObservable();

  constructor(private transportistaService: TransportistaService) {}

  cargarTransportistas(): void {
    // ✅ Si ya está cargando, no hacer nada
    if (this.isLoadingSubject.value) return;
    
    this.isLoadingSubject.next(true);
    this.transportistaService.listar().subscribe({
      next: (data: any) => {
        let lista: Transportista[] = [];
        if (data && data.content) {
          lista = data.content;
        } else if (Array.isArray(data)) {
          lista = data;
        }
        this.transportistasSubject.next(lista);
        this.isLoadingSubject.next(false);
      },
      error: (error) => {
        console.error('Error al cargar transportistas', error);
        this.isLoadingSubject.next(false);
      }
    });
  }

  getTransportistasActivos(): Transportista[] {
    return this.transportistasSubject.value.filter(t => t.estado === 'ACTIVO' && !t.deletedAt);
  }

  recargar(): void {
    // ✅ Forzar recarga
    this.isLoadingSubject.next(true);
    this.transportistaService.listar().subscribe({
      next: (data: any) => {
        let lista: Transportista[] = [];
        if (data && data.content) {
          lista = data.content;
        } else if (Array.isArray(data)) {
          lista = data;
        }
        this.transportistasSubject.next(lista);
        this.isLoadingSubject.next(false);
      },
      error: (error) => {
        console.error('Error al recargar transportistas', error);
        this.isLoadingSubject.next(false);
      }
    });
  }

  getTransportistaById(id: number): Transportista | undefined {
    return this.transportistasSubject.value.find(t => t.id === id);
  }

  limpiar(): void {
    this.transportistasSubject.next([]);
    this.isLoadingSubject.next(false);
  }
}