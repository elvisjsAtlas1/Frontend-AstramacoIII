import { Component, OnInit } from '@angular/core';
import { CommonModule} from '@angular/common';
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
  mensaje = '';
  error = '';

  constructor(private readonly cargaService: CargaService) {}

  ngOnInit(): void {
    this.cargarCargas();
  }

  cargarCargas(): void {
    this.limpiarMensajes();

    this.cargaService.listarTodas().subscribe({
      next: (data) => {
        this.cargas = data ?? [];
        this.filtrarCargas();
        this.mensaje = this.cargas.length > 0
          ? 'Cargas cargadas correctamente'
          : 'No hay transportistas con carga registrada';
      },
      error: () => {
        this.cargas = [];
        this.cargasFiltradas = [];
        this.error = 'No se pudieron cargar las cargas registradas';
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

  private limpiarMensajes(): void {
    this.mensaje = '';
    this.error = '';
  }
}
