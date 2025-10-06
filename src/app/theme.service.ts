import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private storageKey = 'appt.theme';
  private initial =
    (localStorage.getItem(this.storageKey) as 'light' | 'dark' | null) ||
    'light';
  mode = signal<'light' | 'dark'>(this.initial);
  constructor() {
    this.apply(this.mode());
  }
  toggle() {
    const next = this.mode() === 'light' ? 'dark' : 'light';
    this.set(next);
  }
  set(mode: 'light' | 'dark') {
    if (this.mode() === mode) return;
    this.mode.set(mode);
    localStorage.setItem(this.storageKey, mode);
    this.apply(mode);
  }
  private apply(mode: 'light' | 'dark') {
    const root = document.documentElement;
    root.classList.remove(mode === 'light' ? 'dark' : 'light');
    root.classList.add(mode);
  }
}
