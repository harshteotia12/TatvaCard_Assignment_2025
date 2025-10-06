import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { Appointment } from './appointment.model';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  animate,
  query,
  stagger,
  style,
  transition,
  trigger,
} from '@angular/animations';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [NgFor, NgIf, DatePipe, MatButtonModule, MatIconModule],
  animations: [
    trigger('list', [
      transition(':enter', [
        query(
          'li',
          [
            style({ opacity: 0, transform: 'translateY(4px)' }),
            stagger(
              40,
              animate(
                '280ms cubic-bezier(.16,1,.3,1)',
                style({ opacity: 1, transform: 'none' })
              )
            ),
          ],
          { optional: true }
        ),
      ]),
    ]),
  ],
  template: `
    <section class="list-shell surface">
      <header class="header-row"><h2>Appointments</h2></header>
      <div class="empty" *ngIf="!appointments?.length">No appointments yet</div>
      <ul [@list] role="list">
        <li
          *ngFor="let a of appointments"
          [class.active]="activeId === a.id"
          tabindex="0"
          (keydown.enter)="edit.emit(a)"
          (keydown.delete)="remove.emit(a)"
        >
          <div class="info">
            <div class="names">
              <strong>{{ a.patientName }}</strong>
              <span class="muted">with</span>
              <strong>{{ a.doctorName }}</strong>
            </div>
            <div class="time">
              {{ a.startTime | date : 'MMM d, y' }} •
              {{ a.startTime | date : 'shortTime' }} -
              {{ a.endTime | date : 'shortTime' }}
            </div>
          </div>
          <div class="row-actions">
            <button
              mat-stroked-button
              color="primary"
              (click)="edit.emit(a)"
              aria-label="Edit appointment with {{ a.doctorName }} for {{
                a.patientName
              }}"
            >
              Edit
            </button>
            <button
              mat-stroked-button
              color="warn"
              (click)="remove.emit(a)"
              aria-label="Cancel appointment"
            >
              Cancel
            </button>
          </div>
        </li>
      </ul>
    </section>
  `,
  styles: [
    `
      .list-shell {
        padding: var(--space-6);
        display: flex;
        flex-direction: column;
        gap: var(--space-5);
      }
      .header-row h2 {
        margin: 0;
        font-size: var(--font-size-lg);
        letter-spacing: 0.03em;
        text-transform: uppercase;
        color: var(--color-fg-subtle);
      }
      ul {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: var(--space-3);
      }
      li {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-4);
        padding: var(--space-4) var(--space-5);
        background: var(--color-surface-muted);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);
        position: relative;
        outline: none;
      }
      html.dark li {
        background: var(--color-surface);
      }
      li:hover {
        border-color: var(--color-border-strong);
      }
      li.active {
        box-shadow: 0 0 0 2px var(--color-accent) inset;
      }
      li:focus-visible {
        box-shadow: var(--focus-ring);
      }
      .info {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
      }
      .names {
        font-size: var(--font-size-sm);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .muted {
        color: var(--color-fg-subtle);
        font-weight: 400;
      }
      .time {
        font-size: var(--font-size-xs);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--color-fg-subtle);
      }
      .row-actions {
        display: flex;
        gap: var(--space-2);
      }
      .row-actions button {
        position: relative;
        overflow: hidden;
      }
      .row-actions button::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          120deg,
          rgba(var(--color-accent-rgb) / 0.15),
          transparent 60%
        );
        opacity: 0;
        transition: opacity 0.25s var(--ease-out);
      }
      .row-actions button:hover::after,
      .row-actions button:focus-visible::after {
        opacity: 1;
      }
      .empty {
        font-size: var(--font-size-sm);
        color: var(--color-fg-subtle);
      }
      @media (max-width: 760px) {
        li {
          flex-direction: column;
          align-items: stretch;
        }
        .row-actions {
          align-self: flex-end;
        }
      }
    `,
  ],
})
export class AppointmentListComponent {
  @Input() appointments: Appointment[] = [];
  @Input() activeId: number | null = null;
  @Output() edit = new EventEmitter<Appointment>();
  @Output() remove = new EventEmitter<Appointment>();
}
