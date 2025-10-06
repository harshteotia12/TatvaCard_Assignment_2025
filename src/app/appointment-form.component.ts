import {
  Component,
  EventEmitter,
  Input,
  Output,
  Signal,
  computed,
  signal,
  effect,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
  FormGroup,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Appointment } from './appointment.model';
import { DoctorService } from './doctor.service';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-appointment-form',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    ReactiveFormsModule,
    DatePipe,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatIconModule,
    MatTooltipModule,
  ],
  animations: [
    trigger('panel', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(6px)' }),
        animate(
          '260ms cubic-bezier(.16,1,.3,1)',
          style({ opacity: 1, transform: 'none' })
        ),
      ]),
    ]),
  ],
  template: `
    <section class="form-shell surface" [@panel]>
      <header class="header-row">
        <h2 class="title" id="form-title">
          {{ editing() ? 'Update Appointment' : 'Book Appointment' }}
        </h2>
        <div class="actions-inline">
          <button
            mat-stroked-button
            type="button"
            (click)="resetForm()"
            aria-label="Reset form to blank state"
          >
            Reset
          </button>
        </div>
      </header>
      <form
        [formGroup]="form"
        (ngSubmit)="submit()"
        novalidate
        aria-describedby="status-msg"
        class="grid-form"
        [attr.aria-busy]="loading()"
      >
        <div class="two-col">
          <mat-form-field appearance="outline">
            <mat-label>Patient</mat-label>
            <input
              #patientInput
              matInput
              formControlName="patientName"
              autocomplete="off"
              required
              aria-required="true"
            />
            <mat-error
              *ngIf="
                f.patientName.touched && f.patientName.hasError('required')
              "
              >Patient name required</mat-error
            >
            <mat-error *ngIf="f.patientName.hasError('minlength')"
              >Minimum 2 characters</mat-error
            >
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Doctor</mat-label>
            <mat-select
              formControlName="doctorName"
              required
              aria-required="true"
              (selectionChange)="clearOverlap()"
            >
              <mat-option *ngFor="let d of doctors" [value]="d">{{
                d
              }}</mat-option>
            </mat-select>
            <mat-error *ngIf="f.doctorName.touched && f.doctorName.invalid"
              >Select a doctor</mat-error
            >
            <mat-hint>Add new below if missing</mat-hint>
          </mat-form-field>
          <div class="add-doc-wrapper" aria-label="Add new doctor inline">
            <input
              #newDoc
              placeholder="New doctor"
              (keyup.enter)="addDoctorInline(newDoc)"
              aria-label="New doctor name"
            />
            <button
              mat-mini-fab
              color="primary"
              type="button"
              (click)="addDoctorInline(newDoc)"
              matTooltip="Add doctor"
              aria-label="Add doctor"
            >
              <mat-icon>add</mat-icon>
            </button>
          </div>
          <mat-form-field appearance="outline">
            <mat-label>Date</mat-label>
            <input
              matInput
              [matDatepicker]="picker"
              formControlName="date"
              [matDatepickerFilter]="dateFilter"
              (dateChange)="clearOverlap()"
              required
              aria-required="true"
            />
            <mat-datepicker-toggle
              matIconSuffix
              [for]="picker"
            ></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
            <mat-error *ngIf="f.date.touched && f.date.hasError('required')"
              >Date required</mat-error
            >
            <mat-error *ngIf="f.date.touched && f.date.hasError('futureDate')"
              >Choose a date starting tomorrow</mat-error
            >
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Start</mat-label>
            <input
              matInput
              type="time"
              formControlName="start"
              (input)="clearOverlap()"
              required
              aria-required="true"
            />
            <mat-error *ngIf="f.start.touched && f.start.invalid"
              >Start time</mat-error
            >
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>End</mat-label>
            <input
              matInput
              type="time"
              formControlName="end"
              (input)="clearOverlap()"
              [attr.min]="f.start.value || null"
              required
              aria-required="true"
            />
            <mat-error *ngIf="f.end.touched && f.end.invalid"
              >End time</mat-error
            >
            <mat-error *ngIf="form.hasError('timeOrder')"
              >End must be after start</mat-error
            >
            <mat-hint *ngIf="durationLabel()"
              >Duration: {{ durationLabel() }}</mat-hint
            >
          </mat-form-field>
        </div>
        <div class="quick-buttons" aria-label="Quick duration buttons">
          <button
            mat-stroked-button
            color="primary"
            type="button"
            (click)="f.end.setValue(addDuration(15))"
            aria-label="Add 15 minutes"
          >
            +15m
          </button>
          <button
            mat-stroked-button
            color="primary"
            type="button"
            (click)="f.end.setValue(addDuration(30))"
            aria-label="Add 30 minutes"
          >
            +30m
          </button>
          <button
            mat-stroked-button
            color="primary"
            type="button"
            (click)="f.end.setValue(addDuration(45))"
            aria-label="Add 45 minutes"
          >
            +45m
          </button>
          <span class="spacer"></span>
          <mat-icon *ngIf="loading()" class="spin" aria-hidden="true"
            >autorenew</mat-icon
          >
        </div>
        <div class="submit-row">
          <button
            mat-raised-button
            color="accent"
            type="submit"
            class="primary-action"
            [disabled]="!canSubmit()"
            [attr.aria-disabled]="!canSubmit()"
          >
            {{ editing() ? 'Save Changes' : 'Book Appointment' }}
          </button>
        </div>
        <div id="status-msg" class="visually-hidden" aria-live="polite">
          {{ editing() ? 'Editing appointment' : 'Creating new appointment' }}
        </div>
        <div
          class="alert error"
          *ngIf="error()"
          role="alert"
          aria-live="assertive"
        >
          {{ error() }}
        </div>
        <div
          class="alert error"
          *ngIf="overlapError()"
          role="alert"
          aria-live="assertive"
        >
          {{ overlapError() }}
        </div>
      </form>
    </section>
  `,
  styles: [
    `
      .form-shell {
        padding: var(--space-6) var(--space-6) var(--space-5);
        display: flex;
        flex-direction: column;
        gap: var(--space-5);
        position: relative;
      }
      .header-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .title {
        margin: 0;
        background: linear-gradient(
          90deg,
          var(--color-accent),
          var(--color-accent-alt)
        );
        -webkit-background-clip: text;
        color: transparent;
      }
      form {
        display: flex;
        flex-direction: column;
        gap: var(--space-5);
      }
      .two-col {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
        gap: var(--space-4);
        align-items: start;
      }
      .add-doc-wrapper {
        display: flex;
        gap: var(--space-2);
        align-items: center;
      }
      .add-doc-wrapper input {
        flex: 1;
        padding: 0.65rem 0.75rem;
        border: 1px solid var(--color-border);
        background: var(--color-surface-muted);
        border-radius: var(--radius-md);
        font-size: var(--font-size-sm);
        color: var(--color-fg);
      }
      html.dark .add-doc-wrapper input {
        background: var(--color-surface);
      }
      .add-doc-wrapper input:focus {
        outline: none;
        box-shadow: var(--focus-ring);
        border-color: var(--color-accent);
      }
      .quick-buttons {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        margin-top: -0.5rem;
      }
      .submit-row {
        display: flex;
        gap: var(--space-3);
      }
      .primary-action {
        font-weight: 600;
        background: linear-gradient(
          90deg,
          var(--color-accent),
          var(--color-accent-alt)
        );
        color: #fff;
        box-shadow: 0 2px 4px rgba(var(--color-accent-rgb) / 0.4);
      }
      .primary-action:hover:not([disabled]) {
        filter: brightness(1.05);
        box-shadow: 0 4px 10px -2px rgba(var(--color-accent-rgb) / 0.55);
      }
      .primary-action:focus-visible {
        box-shadow: 0 0 0 3px #fff,
          0 0 0 5px rgba(var(--color-accent-rgb) / 0.65);
      }
      .alert.error {
        background: linear-gradient(90deg, var(--color-danger), #b91c1c);
        color: #fff;
        padding: 0.6rem 0.8rem;
        border-radius: var(--radius-md);
        font-size: var(--font-size-sm);
        animation: fade-in 0.3s;
        box-shadow: 0 2px 4px rgba(0 0 0 / 0.15);
      }
      .alert.error + .alert.error {
        margin-top: -0.5rem;
      }
      form[aria-busy='true'] {
        opacity: 0.75;
        pointer-events: none;
      }
      button.primary-action[disabled] {
        filter: grayscale(0.3);
        opacity: 0.6;
      }
      .spin {
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
      @media (max-width: 680px) {
        .form-shell {
          padding: var(--space-5);
        }
      }
    `,
  ],
})
export class AppointmentFormComponent {
  @Input() loading!: Signal<boolean>;
  @Input() error!: Signal<string>;
  @Input() appointments: Appointment[] = [];
  private _saveVersion = 0;
  @Input() set saveVersion(v: number | undefined) {
    if (typeof v === 'number' && v > this._saveVersion) {
      this._saveVersion = v;
      queueMicrotask(() => this.resetForm());
    }
  }
  @Input() set editingAppointment(value: Appointment | null) {
    if (value) this.populate(value);
    this._editing.set(value);
  }
  @Output() save = new EventEmitter<Appointment>();
  overlapError = signal('');
  dateFilter = (d: Date | null) => {
    if (!d) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const c = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    return c.getTime() > today.getTime();
  };
  canSubmit(): boolean {
    return !this.loading() && this.form.valid && !this.overlapError();
  }
  private _editing = signal<Appointment | null>(null);
  editing = computed(() => this._editing());
  @ViewChild('patientInput') patientInput!: ElementRef<HTMLInputElement>;
  form: FormGroup;
  durationLabel = computed(() => {
    const start = this.f.start.value;
    const end = this.f.end.value;
    if (!start || !end || start >= end) return '';
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const mins = eh * 60 + em - (sh * 60 + sm);
    return mins > 0 ? `${mins} min` : '';
  });
  constructor(private fb: FormBuilder, private doctorsSvc: DoctorService) {
    this.form = this.fb.group(
      {
        patientName: ['', [Validators.required, Validators.minLength(2)]],
        doctorName: ['', Validators.required],
        date: ['', [Validators.required, futureDateValidator]],
        start: ['', Validators.required],
        end: ['', Validators.required],
      },
      { validators: [timeOrderValidator] }
    );
    effect(() => {
      const doctor = this.f.doctorName.value;
      const date = this.f.date.value;
      const start = this.f.start.value;
      const end = this.f.end.value;
      if (!doctor || !date || !start || !end) {
        this.overlapError.set('');
        return;
      }
      queueMicrotask(() => this.checkOverlap());
    });
  }
  get doctors() {
    return this.doctorsSvc.all();
  }
  get f() {
    return this.form.controls as any;
  }
  private composeDate(date: string | Date, time: string) {
    let d: Date;
    if (date instanceof Date) d = date;
    else d = new Date(date + 'T00:00:00');
    const [h, m] = time.split(':').map(Number);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, m, 0, 0);
  }
  submit() {
    if (this.form.invalid) return;
    if (this.checkOverlap()) return;
    if (this._editing()) {
      const updated = this.buildPayload(this._editing()!.id);
      this.save.emit(updated);
    } else {
      this.save.emit(this.buildPayload(0));
    }
  }
  buildPayload(id: number): Appointment {
    const start = this.composeDate(this.f.date.value!, this.f.start.value!);
    const end = this.composeDate(this.f.date.value!, this.f.end.value!);
    return {
      id,
      patientName: this.f.patientName.value!,
      doctorName: this.f.doctorName.value!,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
    };
  }
  populate(a: Appointment) {
    const s = new Date(a.startTime);
    const e = new Date(a.endTime);
    const pad = (n: number) => n.toString().padStart(2, '0');
    const start = `${pad(s.getHours())}:${pad(s.getMinutes())}`;
    const end = `${pad(e.getHours())}:${pad(e.getMinutes())}`;
    const dateObj = new Date(s.getFullYear(), s.getMonth(), s.getDate());
    this.form.setValue({
      patientName: a.patientName,
      doctorName: a.doctorName,
      date: dateObj,
      start,
      end,
    });
  }
  private checkOverlap(): boolean {
    this.overlapError.set('');
    if (
      !this.f.doctorName.value ||
      !this.f.date.value ||
      !this.f.start.value ||
      !this.f.end.value
    )
      return false;
    const id = this._editing()?.id;
    const start = this.composeDate(this.f.date.value, this.f.start.value);
    const end = this.composeDate(this.f.date.value, this.f.end.value);
    if (end <= start) return false;
    const conflict = this.appointments.some(
      (a) =>
        a.doctorName === this.f.doctorName.value &&
        a.id !== id &&
        start < new Date(a.endTime) &&
        end > new Date(a.startTime)
    );
    if (conflict) {
      this.overlapError.set('Overlapping appointment for this doctor');
      return true;
    }
    return false;
  }
  addDuration(mins: number) {
    if (!this.f.start.value) return '';
    const [h, m] = this.f.start.value.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m + mins, 0, 0);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }
  addDoctorInline(input: HTMLInputElement) {
    const name = input.value.trim();
    if (name) {
      if ((this.doctorsSvc as any).add(name)) {
        this.form.patchValue({ doctorName: name });
        input.value = '';
      }
    }
  }
  resetForm() {
    this.form.reset();
    this._editing.set(null);
    this.overlapError.set('');
    queueMicrotask(() => {
      this.patientInput?.nativeElement.focus();
    });
  }
  clearOverlap() {
    this.overlapError.set('');
  }
}
function timeOrderValidator(group: AbstractControl) {
  const start = group.get('start')?.value;
  const end = group.get('end')?.value;
  if (start && end && start >= end) {
    return { timeOrder: true };
  }
  return null;
}
function futureDateValidator(control: AbstractControl) {
  const v = control.value;
  if (!v) return null;
  if (!(v instanceof Date)) return { futureDate: true };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(v.getFullYear(), v.getMonth(), v.getDate());
  return d.getTime() <= today.getTime() ? { futureDate: true } : null;
}
