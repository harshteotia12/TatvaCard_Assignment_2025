import { Component, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { Appointment } from './appointment.model';
import { AppointmentService } from './appointment.service';
import { AppointmentFormComponent } from './appointment-form.component';
import { AppointmentListComponent } from './appointment-list.component';
import { MatIconModule } from '@angular/material/icon';
import { ThemeToggleComponent } from './theme-toggle.component.ts';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    NgIf,
    AppointmentFormComponent,
    AppointmentListComponent,
    ThemeToggleComponent,
    MatIconModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'Clinic Appointments';
  loading = signal(false);
  error = signal('');
  editing = signal<Appointment | null>(null);
  appointments = signal<Appointment[]>([]);
  saveVersion = signal(0);
  year = new Date().getFullYear();

  constructor(private api: AppointmentService) {
    this.refresh();
  }
  refresh() {
    this.api
      .all()
      .subscribe({
        next: (list) => this.appointments.set(list),
        error: () => this.error.set('Load error'),
      });
  }
  onSave(payload: Appointment) {
    this.loading.set(true);
    this.error.set('');
    const done = () => {
      this.loading.set(false);
      this.editing.set(null);
      this.refresh();
      this.saveVersion.update((v) => v + 1);
    };
    if (payload.id) {
      this.api.update(payload).subscribe({
        next: done,
        error: (e) => {
          this.loading.set(false);
          this.error.set(e.error?.error || 'Error');
        },
      });
    } else {
      this.api.create(payload).subscribe({
        next: done,
        error: (e) => {
          this.loading.set(false);
          this.error.set(e.error?.error || 'Error');
        },
      });
    }
  }
  onEdit(a: Appointment) {
    this.editing.set(a);
  }
  onCancelEdit() {
    this.editing.set(null);
  }
  onDelete(a: Appointment) {
    if (!confirm('Cancel this appointment?')) return;
    this.loading.set(true);
    this.api.delete(a.id).subscribe({
      next: () => {
        this.loading.set(false);
        this.refresh();
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Error');
      },
    });
  }
}
