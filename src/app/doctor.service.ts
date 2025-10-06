import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DoctorService {
  private list = signal<string[]>([
    'Dr. Smith',
    'Dr. Johnson',
    'Dr. Lee',
    'Dr. Patel',
    'Dr. Garcia',
  ]);
  all() {
    return this.list();
  }
  add(name: string) {
    name = name.trim();
    if (!name || this.list().includes(name)) return false;
    this.list.update((l) => [...l, name]);
    return true;
  }
}