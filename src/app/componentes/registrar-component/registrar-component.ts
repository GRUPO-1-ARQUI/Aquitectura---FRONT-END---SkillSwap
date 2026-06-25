import { Component, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-registrar',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './registrar-component.html',
  styleUrl: './registrar-component.css',
})
export class RegistrarComponent {
  nombre = '';
  apellidos = '';
  correoInstitucional = '';
  password = '';
  confirmarPassword = '';

  readonly error = signal('');
  readonly cargando = signal(false);

  private readonly usuarioSvc = inject(UsuarioService);
  private readonly router = inject(Router);

  validarRegistro(): void {
    this.error.set('');

    if (this.password !== this.confirmarPassword) {
      this.error.set('Las contraseñas no coinciden.');
      return;
    }

    const nuevoUsuario: Usuario = {
      idUsuario: 0,
      nombreCompleto: `${this.nombre} ${this.apellidos}`.trim(),
      correoInstitucional: this.correoInstitucional,
      password: this.password,
      idInstitucion: 1,
      rol: 'estudiante',
      creditos: 0,
      estado: 'activo',
      verificado: false,
    };

    this.cargando.set(true);
    this.usuarioSvc.create(nuevoUsuario).subscribe({
      next: () => {
        this.cargando.set(false);
        this.router.navigate(['/login'], { queryParams: { registro: 'ok' } });
      },
      error: () => {
        this.cargando.set(false);
        this.error.set('No se pudo completar el registro. Intenta de nuevo.');
      },
    });
  }
}
