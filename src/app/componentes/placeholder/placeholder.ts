import { Component } from '@angular/core';

@Component({
  selector: 'app-placeholder',
  standalone: true,
  template: `
    <div class="ss-placeholder-wrap">
      <div class="ss-card ss-placeholder-card">
        <h2>En construcción</h2>
        <p>Esta pantalla estará disponible próximamente.</p>
      </div>
    </div>
  `,
  styles: [`
    .ss-placeholder-wrap {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 80px 24px;
    }
    .ss-placeholder-card {
      text-align: center;
      max-width: 420px;
      width: 100%;
    }
    .ss-placeholder-card h2 {
      font-size: 22px;
      font-weight: 700;
      color: var(--ss-primary);
      margin-bottom: 8px;
    }
    .ss-placeholder-card p {
      color: #6c757d;
      font-size: 15px;
    }
  `],
})
export class PlaceholderComponent {}
