import { Component, OnInit, inject, signal } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { VerificacionService } from '../../services/verificacion.service';
import { Verificacion } from '../../models/verificacion.model';
import { EstudianteVerificacion } from '../../models/estudiante-verificacion.model';

interface VerificacionVista {
  verificacion: Verificacion;
  estudiante: EstudianteVerificacion | null;
  procesando: boolean;
  confirmacion: 'aprobado' | 'rechazado' | null;
  error: string;
}

@Component({
  selector: 'app-verificaciones',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './verificaciones.html',
  styleUrl: './verificaciones.css',
})
export class VerificacionesComponent implements OnInit {
  private readonly verificacionSvc = inject(VerificacionService);

  readonly cargando = signal(true);
  readonly verificaciones = signal<VerificacionVista[]>([]);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.verificacionSvc
      .getPendientes()
      .pipe(catchError(() => of([] as Verificacion[])))
      .subscribe(lista => {
        if (lista.length === 0) {
          this.verificaciones.set([]);
          this.cargando.set(false);
          return;
        }
        forkJoin(
          lista.map(v =>
            this.verificacionSvc.getEstudiante(v.idUsuario).pipe(
              catchError(() => of(null as EstudianteVerificacion | null)),
            ),
          ),
        ).subscribe(estudiantes => {
          this.verificaciones.set(
            lista.map((v, i) => ({
              verificacion: v,
              estudiante: estudiantes[i],
              procesando: false,
              confirmacion: null,
              error: '',
            })),
          );
          this.cargando.set(false);
        });
      });
  }

  aprobar(item: VerificacionVista): void {
    const id = item.verificacion.idVerificacion;
    if (!id) return;
    this.setProcessing(item, true);
    this.verificacionSvc.aprobar(id).subscribe({
      next: () => {
        this.setConfirmacion(item, 'aprobado');
        setTimeout(() => this.quitarDeLista(item), 1600);
      },
      error: () => {
        this.setProcessing(item, false);
        this.setError(item, 'No se pudo aprobar. Intenta de nuevo.');
      },
    });
  }

  rechazar(item: VerificacionVista): void {
    const id = item.verificacion.idVerificacion;
    if (!id) return;
    this.setProcessing(item, true);
    this.verificacionSvc.rechazar(id).subscribe({
      next: () => {
        this.setConfirmacion(item, 'rechazado');
        setTimeout(() => this.quitarDeLista(item), 1600);
      },
      error: () => {
        this.setProcessing(item, false);
        this.setError(item, 'No se pudo rechazar. Intenta de nuevo.');
      },
    });
  }

  inicial(nombre: string | undefined): string {
    return (nombre ?? '?').charAt(0).toUpperCase();
  }

  private quitarDeLista(item: VerificacionVista): void {
    this.verificaciones.update(list => list.filter(v => v !== item));
  }

  private setProcessing(item: VerificacionVista, v: boolean): void {
    this.verificaciones.update(list =>
      list.map(s => (s === item ? { ...s, procesando: v, error: '' } : s)),
    );
  }

  private setConfirmacion(
    item: VerificacionVista,
    conf: 'aprobado' | 'rechazado',
  ): void {
    this.verificaciones.update(list =>
      list.map(s =>
        s === item ? { ...s, procesando: false, confirmacion: conf } : s,
      ),
    );
  }

  private setError(item: VerificacionVista, error: string): void {
    this.verificaciones.update(list =>
      list.map(s => (s === item ? { ...s, procesando: false, error } : s)),
    );
  }
}
