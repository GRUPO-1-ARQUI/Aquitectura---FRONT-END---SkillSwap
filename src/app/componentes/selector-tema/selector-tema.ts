import { Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-selector-tema',
  standalone: true,
  imports: [],
  templateUrl: './selector-tema.html',
  styleUrl: './selector-tema.css',
})
export class SelectorTemaComponent {
  readonly tema = inject(ThemeService);
  private readonly elRef = inject(ElementRef<HTMLElement>);

  readonly abierto = signal(false);

  toggle(): void {
    this.abierto.update((v) => !v);
  }

  seleccionarModo(modo: 'claro' | 'oscuro'): void {
    this.tema.cambiarModo(modo);
  }

  seleccionarColor(color: 'azul' | 'rojo' | 'amarillo' | 'celeste'): void {
    this.tema.cambiarColor(color);
  }

  // Cierra el panel si el usuario hace clic fuera del componente.
  @HostListener('document:click', ['$event'])
  onClickFuera(event: MouseEvent): void {
    if (this.abierto() && !this.elRef.nativeElement.contains(event.target as Node)) {
      this.abierto.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.abierto.set(false);
  }
}
