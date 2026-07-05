import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class AppComponent {
  private readonly router = inject(Router);
  private readonly tema = inject(ThemeService);
  readonly isPrivateZone = signal(false);

  constructor() {
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe((e) => {
      this.isPrivateZone.set((e as NavigationEnd).urlAfterRedirects.startsWith('/app'));
    });
  }
}
