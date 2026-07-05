import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { VerificacionService } from '../../services/verificacion.service';
import { SesionService } from '../../services/sesion.service';

@Component({
  selector: 'app-aviso-verificacion',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './aviso-verificacion.html',
  styleUrls: ['./aviso-verificacion.css'],
})
export class AvisoVerificacionComponent implements OnInit {
  private readonly verificacionService = inject(VerificacionService);
  private readonly sesion = inject(SesionService);

  mostrarBanner = false;

  ngOnInit(): void {
    const idUsuario = this.sesion.getUserId();

    if (!idUsuario) {
      return;
    }

    this.verificacionService.getEstudiante(idUsuario).subscribe({
      next: (estudiante) => {
        this.mostrarBanner =
          !estudiante.verificado && estudiante.estado.toLowerCase() !== 'pendiente';
      },
      error: () => {

        this.mostrarBanner = true;
      },
    });
  }
}
