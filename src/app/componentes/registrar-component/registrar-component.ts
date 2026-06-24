import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-registrar',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './registrar-component.html',
  styleUrl: './registrar-component.css'
})
export class RegistrarComponent {
  validarRegistro() {
    // Aquí pones la lógica que tenías en registro.js
    console.log("Registrando usuario...");
  }
}
