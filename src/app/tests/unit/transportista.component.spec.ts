import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { TransportistasComponent } from '../../pages/transportistas/transportistas.component';
import { TransportistaService } from '../../service/transportista.service';
import { DocumentoService } from '../../service/documento.service';

describe('TransportistasComponent', () => {

  beforeEach(async () => {

    const transportistaServiceMock = {
      crear: vi.fn().mockReturnValue(of({})),
      listar: vi.fn().mockReturnValue(of([]))
    };

    const documentoServiceMock = {
      crear: vi.fn().mockReturnValue(of({})),
      listar: vi.fn().mockReturnValue(of([]))
    };

    await TestBed.configureTestingModule({
      imports: [TransportistasComponent],
      providers: [
        {
          provide: TransportistaService,
          useValue: transportistaServiceMock
        },
        {
          provide: DocumentoService,
          useValue: documentoServiceMock
        }
      ]
    }).compileComponents();

  });

  it('should create transportistas component', () => {

    const fixture = TestBed.createComponent(TransportistasComponent);

    const component = fixture.componentInstance;

    expect(component).toBeTruthy();

  });

});
