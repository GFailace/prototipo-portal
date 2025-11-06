import { Component, ElementRef, forwardRef, HostListener, Input, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';

/**
 * Simple reusable datepicker component.
 * - Displays date in dd/MM/yyyy
 * - Uses native <input type="date"> to open the browser picker
 * - Implements ControlValueAccessor so it works with formControlName
 * - Exposes inputId for accessibility
 */
@Component({
    selector: 'app-datepicker',
    standalone: true,
    imports: [CommonModule, InputTextModule],
    template: `
    <div class="datepicker-root" role="group">
        <div class="input-wrapper">
            <input #textInput pInputText [id]="inputId" class="date-input" type="text" autocomplete="off" spellcheck="false" aria-autocomplete="none" [value]="displayValue" (input)="onTextInput($event)" (focus)="openOverlay()" (keydown.enter)="$event.preventDefault(); openOverlay()" aria-haspopup="dialog" />
            <button type="button" class="calendar-button" (click)="toggleOverlay()" aria-label="Open calendar">
                <i class="pi pi-calendar"></i>
            </button>
        </div>

    <div class="calendar-overlay" *ngIf="overlayVisible" [style.minWidth.px]="overlayWidth" [ngStyle]="overlayStyle">
            <div class="cal-header">
                <button type="button" class="nav" (click)="prevMonth()">‹</button>
                <div class="month-year-selects">
                    <div class="select-wrap">
                        <select class="month-select p-inputtext" (change)="$any($event.target).value && onMonthChange($any($event.target).value)">
                            <option *ngFor="let m of monthNames; let i = index" [value]="i" [selected]="viewMonth.getMonth() === i">{{ m }}</option>
                        </select>
                    </div>
                    <div class="select-wrap">
                        <select class="year-select p-inputtext" (change)="$any($event.target).value && onYearChange($any($event.target).value)">
                            <option *ngFor="let y of yearOptions" [value]="y" [selected]="viewMonth.getFullYear() === y">{{ y }}</option>
                        </select>
                    </div>
                </div>
                <button type="button" class="nav" (click)="nextMonth()">›</button>
            </div>
            <div class="cal-body">
                <div class="day-names">
                    <div *ngFor="let dn of dayNames" class="day-name">{{ dn }}</div>
                </div>
                <div class="weeks">
                    <div class="week" *ngFor="let week of weeks">
                            <button type="button" class="day" *ngFor="let day of week"
                                [class.other-month]="day.getMonth() !== viewMonth.getMonth()"
                                [class.today]="isSameDay(day, today)"
                                [class.selected]="selected && isSameDay(day, selected)"
                                (click)="selectDay(day)">
                                {{ day.getDate() }}
                            </button>
                        </div>
                </div>
            </div>
        </div>
    </div>
    `,
    styles: [
        `
    :host { display: block; position: relative; }
    .input-wrapper { position: relative; display: inline-block; width: 100%; }
    .date-input { width: 100%; padding-right: 2.8rem; box-sizing: border-box; background: var(--p-textarea-background, var(--surface-card, transparent)); border: 1px solid var(--p-textarea-border-color, var(--surface-border, transparent)); border-radius: 0.25rem; color: var(--text-color, inherit); }
        .calendar-button {
            position: absolute;
            right: 0.5rem;
            top: 50%;
            transform: translateY(-50%);
            border: none;
            background: transparent;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0.25rem;
            cursor: pointer;
            color: rgba(107,117,128,1);
        }
        .calendar-overlay {
            position: fixed; /* render relative to viewport so it won't be clipped */
            z-index: 1000;
            background: var(--surface-overlay, #fff);
            border: 1px solid var(--p-textarea-border-color);
            box-shadow: 0 10px 15px rgba(0,0,0,0.08);
            padding: 0.5rem;
            border-radius: 0.25rem;
            font-family: inherit; /* match app font */
            font-size: 0.95rem; /* slightly larger to match app */
            color: var(--text-color, #111827);
        }
        .cal-header { display:flex; align-items:center; justify-content:space-between; padding:0 0.25rem 0.5rem 0.25rem; }
        .nav { background:transparent; border:none; cursor:pointer; font-size:1.2rem; color: #ff7a18; width:2.2rem; display:inline-flex; align-items:center; justify-content:center }
    .month-label { font-weight:600; color: #374151 }
            .cal-body { }
    .month-year-selects { display:flex; gap:0.5rem; align-items:center; justify-content:center }
    .select-wrap { position: relative; display: inline-block }
    .month-year-selects .month-select, .month-year-selects .year-select { appearance:none; -webkit-appearance:none; padding:0.35rem 0.7rem; border:1px solid var(--p-textarea-border-color, #d1d5db); border-radius:0.25rem; background: var(--p-textarea-background, #fff); color: var(--text-color, #374151); font-size:0.95rem }
    .month-year-selects .month-select { min-width:9rem }
    .month-year-selects .year-select { width:5.5rem }
    .select-wrap::after { content: '\u203A'; position: absolute; right: 0.45rem; top: 50%; transform: translateY(-50%) rotate(90deg); color: #ff7a18; opacity: 0.5; font-size: 0.95rem; pointer-events: none }
    .select-wrap:focus-within::after { opacity: 1; color: #ff7a18 }
    .month-year-selects select { padding-right: 1.6rem }
    /* make native option backgrounds follow theme where supported */
    .month-year-selects select option {
        background: var(--p-textarea-background, #fff);
        color: var(--text-color, #111827);
    }
    /* caret/arrow color for the pseudo element */
    .select-wrap::after { color: var(--p-primary-color, #ff7a18) }
    .day-names { display:grid; grid-template-columns: repeat(7, 1fr); gap:0; margin-bottom:6px }
    .day-name { text-align:center; font-size:0.85rem; color: var(--text-color-secondary, #6b7280) }
    .weeks { display:flex; flex-direction:column; gap:6px; }
    .week { display:grid; grid-template-columns: repeat(7, 1fr); gap:0; }
    .day { width:100%; height:2.25rem; border-radius:0.25rem; border:none; background:transparent; cursor:pointer; font-size:0.95rem; display:flex; align-items:center; justify-content:center }
    .day:hover { background: var(--surface-hover, #f3f4f6) }
        .other-month { color: var(--text-color-secondary, #9ca3af) }
    .today { box-shadow: inset 0 0 0 1px var(--p-primary-color, #ff7a18); border-radius:0.25rem }
    .selected { background: var(--p-primary-color, #ff7a18); color: var(--p-primary-contrast-color, white); border-radius:0.25rem }
    .nav { color: var(--p-primary-color, #ff7a18); }
    .input-wrapper .date-input { background: var(--p-textarea-background, var(--surface-card, transparent)); color: var(--text-color, #111827); border-color: var(--surface-border, #e5e7eb) }
    /* focus styles to match other inputs (orange primary border) */
    .date-input:focus, .input-wrapper:focus-within .date-input {
        outline: none;
        border-color: var(--p-primary-color, #ff7a18);
    }
    .month-year-selects .month-select:focus, .month-year-selects .year-select:focus, .select-wrap:focus-within .month-select, .select-wrap:focus-within .year-select {
        outline: none;
        border-color: var(--p-primary-color, #ff7a18);
    }
    .month-year-selects .month-select, .month-year-selects .year-select { background: transparent; color: var(--text-color, #111827); border-color: var(--p-textarea-border-color, var(--surface-border, #e5e7eb)) }
    .select-wrap::after { color: var(--p-primary-color, #ff7a18) }
        `
    ],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => DatepickerComponent),
            multi: true
        }
    ]
})
export class DatepickerComponent implements ControlValueAccessor {
    @Input() inputId = '';
    @ViewChild('textInput', { static: true }) textInputRef?: ElementRef<HTMLInputElement>;

    constructor(private host: ElementRef) {}

    ngOnInit() {
        // populate yearOptions: range from today-10 to today+10
        const base = this.today.getFullYear();
        const start = base - 10;
        const end = base + 10;
        for (let y = start; y <= end; y++) this.yearOptions.push(y);
        // ensure calendar is built for initial view
        this.viewMonth = new Date(this.viewMonth.getFullYear(), this.viewMonth.getMonth(), 1);
        this.buildCalendar();
    }

    onMonthChange(value: string | number) {
        const m = Number(value);
        if (!isNaN(m) && m >= 0 && m <= 11) {
            this.viewMonth = new Date(this.viewMonth.getFullYear(), m, 1);
            this.buildCalendar();
            setTimeout(() => this.positionOverlay(), 0);
        }
    }

    onYearChange(value: string | number) {
        const y = Number(value);
        if (!isNaN(y)) {
            this.viewMonth = new Date(y, this.viewMonth.getMonth(), 1);
            this.buildCalendar();
            setTimeout(() => this.positionOverlay(), 0);
        }
    }

    // internal state
    displayValue: string = '';
    public selected: Date | null = null;

    // overlay/calendar state
    overlayVisible = false;
    overlayWidth = 220;
    overlayStyle: { [k: string]: any } = {};
    viewMonth: Date = new Date();
    today: Date = new Date();
    weeks: Date[][] = [];
    dayNames = ['dom','seg','ter','qua','qui','sex','sáb'];
    monthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    // year select options
    yearOptions: number[] = [];

    // ControlValueAccessor callbacks
    private onChange = (v: any) => {};
    public onTouched = () => {};

    writeValue(obj: any): void {
        if (obj instanceof Date) {
            this.selected = new Date(obj.getFullYear(), obj.getMonth(), obj.getDate());
            this.displayValue = this.formatDisplay(this.selected);
            this.viewMonth = new Date(this.selected.getFullYear(), this.selected.getMonth(), 1);
            this.buildCalendar();
        } else if (typeof obj === 'string') {
            const dt = this.parseIsoOrDateString(obj);
            this.selected = dt;
            this.displayValue = dt ? this.formatDisplay(dt) : '';
            if (dt) { this.viewMonth = new Date(dt.getFullYear(), dt.getMonth(), 1); }
            this.buildCalendar();
        } else if (obj == null) {
            this.selected = null;
            this.displayValue = '';
            this.buildCalendar();
        } else {
            const dt = new Date(obj);
            if (!isNaN(dt.getTime())) {
                this.selected = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
                this.displayValue = this.formatDisplay(this.selected);
                this.viewMonth = new Date(this.selected.getFullYear(), this.selected.getMonth(), 1);
                this.buildCalendar();
            }
        }
    }
    registerOnChange(fn: any): void {
        this.onChange = fn;
    }
    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }
    setDisabledState?(isDisabled: boolean): void {
        // not implemented
    }

    // Called when user types into the text input
    onTextInput(evt: Event) {
        const v = (evt.target as HTMLInputElement).value;
        this.displayValue = v;
        const parsed = this.parseDisplay(v);
        if (parsed) {
            this.selected = parsed;
            this.viewMonth = new Date(parsed.getFullYear(), parsed.getMonth(), 1);
            this.buildCalendar();
            this.onChange(parsed);
        } else if (v.trim() === '') {
            this.selected = null;
            this.buildCalendar();
            this.onChange(null);
        }
    }

    // (native hidden input removed) select from custom calendar uses selectDay()
    onNativeChange(_: Event) { /* noop - kept for signature compatibility if needed */ }

    // Overlay controls
    openOverlay() { 
        // ensure viewMonth matches selected or today when opening
        if (this.selected) this.viewMonth = new Date(this.selected.getFullYear(), this.selected.getMonth(), 1);
        else this.viewMonth = new Date(this.today.getFullYear(), this.today.getMonth(), 1);
        this.buildCalendar();
        this.overlayVisible = true; 
        setTimeout(() => this.positionOverlay(), 0); 
    }
    toggleOverlay() { 
        if (!this.overlayVisible) {
            if (this.selected) this.viewMonth = new Date(this.selected.getFullYear(), this.selected.getMonth(), 1);
            else this.viewMonth = new Date(this.today.getFullYear(), this.today.getMonth(), 1);
            this.buildCalendar();
        }
        this.overlayVisible = !this.overlayVisible; 
        if (this.overlayVisible) setTimeout(() => this.positionOverlay(), 0); 
    }
    closeOverlay() { this.overlayVisible = false; }

    prevMonth() { this.viewMonth = new Date(this.viewMonth.getFullYear(), this.viewMonth.getMonth() - 1, 1); this.buildCalendar(); }
    nextMonth() { this.viewMonth = new Date(this.viewMonth.getFullYear(), this.viewMonth.getMonth() + 1, 1); this.buildCalendar(); }

    isSameDay(a: Date, b: Date) {
        return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    }

    selectDay(d: Date) {
        this.selected = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        this.displayValue = this.formatDisplay(this.selected);
        this.onChange(this.selected);
        this.closeOverlay();
    }

    // Build weeks matrix for current viewMonth
    private buildCalendar() {
        const year = this.viewMonth.getFullYear();
        const month = this.viewMonth.getMonth();
        const first = new Date(year, month, 1);
        const startDay = first.getDay(); // 0..6
        const days: Date[] = [];
        // start from previous month's tail
        const prevMonthDays = startDay;
        const startDate = new Date(year, month, 1 - prevMonthDays);
        for (let i = 0; i < 42; i++) {
            const dt = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i);
            dt.setHours(0,0,0,0);
            days.push(dt);
        }
        const weeks: Date[][] = [];
        for (let w = 0; w < 6; w++) {
            weeks.push(days.slice(w*7, w*7+7));
        }
        this.weeks = weeks;
    }

    // position overlay width to input width and decide whether to open above or below
    private positionOverlay() {
        try {
            const el = this.textInputRef?.nativeElement as HTMLElement | undefined;
            const hostEl = (this.host && (this.host as ElementRef).nativeElement) as HTMLElement | undefined;
            if (!el || !hostEl) return;
            this.overlayWidth = el.offsetWidth;

            // find overlay element to measure height
            const overlayEl = hostEl.querySelector('.calendar-overlay') as HTMLElement | null;
            const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
            let overlayHeight = overlayEl ? overlayEl.offsetHeight : 260; // estimate if not rendered
            const rect = el.getBoundingClientRect();
            const spaceBelow = viewportHeight - rect.bottom;
            const spaceAbove = rect.top;
            const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
            const computedLeft = Math.min(Math.max(rect.left, 8), Math.max(8, viewportWidth - this.overlayWidth - 8));
            if (spaceBelow >= overlayHeight + 8) {
                // open below (fixed coords)
                this.overlayStyle = { top: (rect.bottom + 6) + 'px', left: computedLeft + 'px', maxHeight: 'auto' };
            } else if (spaceAbove >= overlayHeight + 8) {
                // open above
                this.overlayStyle = { top: (rect.top - overlayHeight - 6) + 'px', left: computedLeft + 'px', maxHeight: 'auto' };
            } else {
                // default to below with limited height
                this.overlayStyle = { top: (rect.bottom + 6) + 'px', left: computedLeft + 'px', maxHeight: Math.max(spaceBelow - 16, 120) + 'px', overflow: 'auto' };
            }
        } catch (e) { /* ignore */ }
    }

    // close when clicking outside component
    @HostListener('document:click', ['$event'])
    onDocumentClick(event: Event) {
        if (!this.overlayVisible) return;
        try {
            const hostEl = (this.host && (this.host as ElementRef).nativeElement) as HTMLElement | undefined;
            if (!hostEl) { this.closeOverlay(); return; }
            const target = event.target as Node;
            if (!hostEl.contains(target)) {
                this.closeOverlay();
            }
        } catch (e) { this.closeOverlay(); }
    }

    openNative() {
        // kept for backwards compatibility - open our custom overlay
        this.openOverlay();
    }

    // helpers
    private formatDisplay(d: Date): string {
        if (!d) return '';
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    }

    private parseDisplay(s: string): Date | null {
        if (!s) return null;
        const trimmed = String(s).trim();
        const m = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
        if (m) {
            const day = parseInt(m[1], 10);
            const month = parseInt(m[2], 10);
            const year = parseInt(m[3], 10);
            if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                const dt = new Date(year, month - 1, day);
                dt.setHours(0, 0, 0, 0);
                return dt;
            }
        }
        return null;
    }

    private parseIsoOrDateString(s: string): Date | null {
        if (!s) return null;
        const trimmed = String(s).trim();
        // ISO yyyy-MM-dd
        const iso = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (iso) {
            const y = parseInt(iso[1], 10);
            const m = parseInt(iso[2], 10);
            const d = parseInt(iso[3], 10);
            const dt = new Date(y, m - 1, d);
            dt.setHours(0, 0, 0, 0);
            return dt;
        }
        const dt = new Date(trimmed);
        if (!isNaN(dt.getTime())) {
            return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
        }
        return null;
    }

    private setNativeValue(d: Date | null) {
        // no-op: native hidden input removed; kept for API compatibility
    }
}
