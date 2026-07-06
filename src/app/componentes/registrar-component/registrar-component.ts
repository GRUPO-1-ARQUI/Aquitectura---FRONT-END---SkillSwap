import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';
import { InstitucionService } from '../../services/institucion.service';
import { Usuario } from '../../models/usuario.model';
import { Institucion } from '../../models/institucion.model';

@Component({
  selector: 'app-registrar',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './registrar-component.html',
  styleUrl: './registrar-component.css',
})
export class RegistrarComponent implements OnInit {
  nombre = '';
  apellidos = '';
  correoInstitucional = '';
  codigoEstudiante = '';
  password = '';
  confirmarPassword = '';
  idInstitucion: number | null = null;

  // Rol elegido en el primer paso. null = todavía no eligió.
  readonly rolSeleccionado = signal<'estudiante' | 'tutor' | null>(null);

  readonly instituciones = signal<Institucion[]>([]);
  readonly error = signal('');
  readonly cargando = signal(false);

  private readonly usuarioSvc = inject(UsuarioService);
  private readonly institucionSvc = inject(InstitucionService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.institucionSvc.getAll().subscribe({
      next: (lista) => this.instituciones.set(lista),
      error: () => this.instituciones.set([]),
    });
  }

  elegirRol(rol: 'estudiante' | 'tutor'): void {
    this.rolSeleccionado.set(rol);
    this.error.set('');
  }

  volverAElegirRol(): void {
    this.rolSeleccionado.set(null);
    this.error.set('');
  }

  validarRegistro(): void {
    this.error.set('');

    if (this.password !== this.confirmarPassword) {
      this.error.set('Las contraseñas no coinciden.');
      return;
    }

    const rol = this.rolSeleccionado();
    if (!rol) {
      this.error.set('Selecciona si te registras como estudiante o tutor.');
      return;
    }

    if (!this.idInstitucion) {
      this.error.set('Selecciona tu universidad.');
      return;
    }

    // El backend exige codigoEstudiante para todos los usuarios.
    // Para tutores (que no tienen código de estudiante propio) generamos uno interno.
    const codigo =
      rol === 'tutor'
        ? `TUTOR-${Date.now()}`
        : this.codigoEstudiante;

    const nuevoUsuario: Usuario = {
      idUsuario: 0,
      nombreCompleto: `${this.nombre} ${this.apellidos}`.trim(),
      correoInstitucional: this.correoInstitucional,
      codigoEstudiante: codigo,
      password: this.password,
      idInstitucion: this.idInstitucion,
      rol,
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
