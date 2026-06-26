import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CargaService } from '../../service/carga.service';
import { CargaModel } from '../../models/carga.model';

@Component({
  selector: 'app-cargas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cargas.component.html',
  styleUrl: './cargas.component.css'
})
export class CargasComponent implements OnInit {

  cargas: CargaModel[] = [];
  cargasFiltradas: CargaModel[] = [];
  textoBusqueda = '';

  // ========== ESTADO REACTIVO DEL TOAST ==========
  toast = {
    visible: false,
    message: '',
    isError: false
  };

  constructor(private readonly cargaService: CargaService) {}

  ngOnInit(): void {
    this.cargarCargas();
  }

  // ========== DESPLEGAR NOTIFICACIÓN TOAST ==========
  mostrarMensaje(mensaje: string, esError: boolean = false): void {
    // Sanitizado rápido de strings
    let textoLimpio = mensaje.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF]/g, '').trim();

    this.toast.message = textoLimpio;
    this.toast.isError = esError;
    this.toast.visible = true;

    console.log('🔮 Toast Cargas activado:', this.toast);

    setTimeout(() => {
      this.toast.visible = false;
    }, 4000);
  }

  cargarCargas(): void {
    this.cargaService.listarTodas().subscribe({
      next: (data: any) => {
        this.cargas = data.content ?? [];
        this.filtrarCargas();
        
        if (this.cargas.length > 0) {
          this.mostrarMensaje('Cargas cargadas correctamente', false);
        } else {
          this.mostrarMensaje('No hay transportistas con carga registrada', false);
        }
      },
      error: (err) => {
        this.cargas = [];
        this.cargasFiltradas = [];
        console.error('Error al mapear cargas:', err);
        this.mostrarMensaje('No se pudieron cargar las cargas registradas', true);
      }
    });
  }

  filtrarCargas(): void {
    const texto = this.textoBusqueda.trim().toLowerCase();

    if (!texto) {
      this.cargasFiltradas = [...this.cargas];
      return;
    }

    this.cargasFiltradas = this.cargas.filter(carga =>
      (carga.transportistaNombre ?? '').toLowerCase().includes(texto)
    );
  }
}