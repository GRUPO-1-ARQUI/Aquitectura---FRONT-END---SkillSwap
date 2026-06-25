import { Component, inject, signal } from '@angular/core';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';
import { SesionService } from '../../services/sesion.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './login-component.html',
  styleUrl: './login-component.css',
})
export class LoginComponent {
  correoInstitucional = '';
  password = '';
  readonly error = signal('');
  readonly cargando = signal(false);
  readonly mensajeExito = signal('');

  private readonly usuarioSvc = inject(UsuarioService);
  private readonly sesion = inject(SesionService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  constructor() {
    this.route.queryParamMap.subscribe(params => {
      if (params.get('registro') === 'ok') {
        this.mensajeExito.set('¡Registro exitoso! Ya puedes iniciar sesión.');
      }
    });
  }

  validarLogin(event: Event): void {
    event.preventDefault();
    this.error.set('');
    this.cargando.set(true);

    this.usuarioSvc.login(this.correoInstitucional, this.password).subscribe({
      next: (loginResponse) => {
        this.sesion.login(loginResponse);
        const rol = this.sesion.getRol();
        if (rol.includes('coordinador')) {
          this.router.navigate(['/app/verificaciones']);
        } else if (rol.includes('tutor')) {
          this.router.navigate(['/app/solicitudes']);
        } else {
          this.router.navigate(['/app/buscar']);
        }
      },
      error: () => {
        this.cargando.set(false);
        this.error.set('Correo o contraseña incorrectos.');
      },
    });
  }
}
