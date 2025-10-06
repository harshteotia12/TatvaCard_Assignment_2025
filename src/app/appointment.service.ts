import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Appointment } from './appointment.model';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  base = 'http://localhost:5000/appointments';
  constructor(private http: HttpClient) {}
  all(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(this.base);
  }
  create(a: Appointment) {
    return this.http.post<Appointment>(this.base, a);
  }
  update(a: Appointment) {
    return this.http.put(this.base + '/' + a.id, a);
  }
  delete(id: number) {
    return this.http.delete(this.base + '/' + id);
  }
}
