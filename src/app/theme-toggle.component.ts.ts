import { Component, computed } from '@angular/core';
import { NgIf } from '@angular/common';
import { ThemeService } from './theme.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [NgIf, MatIconModule, MatButtonModule],
  template: `
    <button
      type="button"
      mat-icon-button
      (click)="toggle()"
      [attr.aria-label]="ariaLabel()"
      class="theme-toggle"
      [class.is-dark]="isDark()"
    >
      <mat-icon *ngIf="isDark(); else sun">dark_mode</mat-icon>
      <ng-template #sun><mat-icon>light_mode</mat-icon></ng-template>
    </button>
  `,
  styles: [
    `
      .theme-toggle {
        position: relative;
        width: 40px;
        height: 40px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
      }
      .theme-toggle:focus-visible {
        box-shadow: var(--focus-ring);
      }
      .theme-toggle mat-icon {
        transition: transform var(--dur-base) var(--ease-out),
          opacity var(--dur-base) var(--ease-out);
      }
      .theme-toggle:hover mat-icon {
        transform: rotate(-15deg) scale(1.05);
      }
      .theme-toggle.is-dark mat-icon {
        color: var(--color-warning);
      }
    `,
  ],
})
export class ThemeToggleComponent {
  isDark = computed(() => this.theme.mode() === 'dark');
  ariaLabel = computed(() =>
    this.isDark() ? 'Switch to light theme' : 'Switch to dark theme'
  );
  constructor(private theme: ThemeService) {}
  toggle() {
    this.theme.toggle();
  }
}
