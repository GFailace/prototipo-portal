import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TableModule } from 'primeng/table';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { PmocScheduleService, ChecklistItem, Attendance, Equipment } from '../pmocs/pmoc-schedule.service';

type Cell = { status: string; date?: string; attendanceId?: string };

@Component({
    selector: 'app-equipamento-schedule',
    standalone: true,
    imports: [CommonModule, TableModule, BadgeModule, ButtonModule, DialogModule, TooltipModule],
    template: `
        <div class="card">
            <div class="equip-header">
                <div class="equip-left">
                    <div class="equip-id">{{ equipment?.id }}</div>
                    <div class="equip-client">{{ equipment?.cliente }}</div>
                    <div class="equip-attrs">
                        <div class="attr-row">
                            <div class="attr-label">Identificação do ambiente</div>
                            <div class="attr-value">{{ equipment?.ambiente || '-' }}</div>
                        </div>
                        <div class="attr-row">
                            <div class="attr-label">Ocupantes</div>
                            <div class="attr-value">{{ equipment?.ocupantes ?? '-' }}</div>
                        </div>
                        <div class="attr-row">
                            <div class="attr-label">Área climatizada (m²)</div>
                            <div class="attr-value">{{ equipment?.areaM2 || '-' }}</div>
                        </div>
                        <div class="attr-row">
                            <div class="attr-label">Equipamento tipo</div>
                            <div class="attr-value">{{ equipment?.tecnologia || '-' }}</div>
                        </div>
                        <div class="attr-row">
                            <div class="attr-label">Capacidade</div>
                            <div class="attr-value">{{ equipment?.capacidadeBtus ? equipment?.capacidadeBtus + ' BTU' : '-' }}</div>
                        </div>
                        <div class="attr-row">
                            <div class="attr-label">Tecnologia</div>
                            <div class="attr-value">{{ equipment?.tecnologia || '-' }}</div>
                        </div>
                        <div class="attr-row">
                            <div class="attr-label">Tipo de gás refrigerante</div>
                            <div class="attr-value">{{ equipment?.gas || '-' }}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div style="margin-top:1rem;">
                <!-- Desktop / tablet: render one table per unit (Evaporadora / Condensadora) -->
                <ng-container *ngIf="!isMobile">
                    <ng-container *ngFor="let group of groupedChecklist">
                        <div style="margin: 8px 0; font-weight:700; color:var(--text-color-secondary)">SERVIÇOS DE MANUTENÇÃO - UNIDADE {{ group.unit }}</div>
                        <p-table [value]="group.items" [responsiveLayout]="'stack'" [scrollable]="true" [style]="{ minWidth: '720px', marginBottom: '12px' }">
                            <ng-template pTemplate="header">
                                <tr>
                                    <th style="min-width:120px;">Item</th>
                                    <th style="min-width:120px;">Período</th>
                                    <th style="min-width:240px;">Descrição de Procedimentos</th>
                                    <th *ngFor="let m of months" class="month-cell" style="min-width:110px; text-align:center">{{ getMonthLabelWithYear(m) }}</th>
                                </tr>
                            </ng-template>

                            <ng-template pTemplate="body" let-row let-rowIndex="rowIndex">
                                <tr>
                                    <td>{{ row.itemNumber || (row.controlName) }}</td>
                                    <td>
                                        <div class="period-chip">{{ formatPeriod(row.periodicity) }}</div>
                                    </td>
                                    <td>
                                        <div class="proc-label">{{ row.label }}</div>
                                    </td>
                                    <td *ngFor="let m of months" class="month-cell" style="text-align:center; padding:6px 8px; border-bottom:1px solid var(--surface-border)">
                                        <ng-container *ngIf="matrix[row.controlName] && matrix[row.controlName][m] as cell">
                                            <button pButton type="button" class="p-button-text p-button-plain" (click)="openDetail(row, m)">
                                                <span [ngClass]="badgeClass(cell.status)" class="status-pill" pTooltip="{{ tooltipText(cell) }}" tooltipPosition="top">
                                                    {{ shortText(cell) }}
                                                    <i class="pi pi-info-circle status-info-icon" aria-hidden="true"></i>
                                                </span>
                                            </button>
                                            <div class="small" style="font-size:11px; color:var(--text-color-secondary)">{{ cell.date ? (cell.date | date: 'dd/MM/yyyy') : '' }}</div>
                                        </ng-container>
                                        <span *ngIf="!(matrix[row.controlName] && matrix[row.controlName][m])">-</span>
                                    </td>
                                </tr>
                            </ng-template>
                        </p-table>
                    </ng-container>
                </ng-container>

                <!-- Mobile: card list grouped by unit -->
                <ng-container *ngIf="isMobile">
                    <div *ngFor="let group of groupedChecklist">
                        <div style="margin: 8px 0; font-weight:700; color:var(--text-color-secondary)">SERVIÇOS DE MANUTENÇÃO - UNIDADE {{ group.unit }}</div>
                        <div class="mobile-list">
                            <div *ngFor="let row of group.items" class="mobile-card">
                                <div class="mobile-card-header">
                                    <div class="period-chip">{{ formatPeriod(row.periodicity) }}</div>
                                    <div class="proc-label">{{ row.label }}</div>
                                </div>
                                <div class="month-strip" role="list" aria-label="Meses">
                                    <div *ngFor="let m of months" class="month-item" role="listitem">
                                        <button pButton type="button" class="p-button-text p-button-plain" (click)="openDetail(row, m)">
                                            <span [ngClass]="badgeClass(matrix[row.controlName]?.[m]?.status)" class="status-pill">
                                                {{ matrix[row.controlName]?.[m] ? shortText(matrix[row.controlName][m]) : '-' }}
                                                <i *ngIf="matrix[row.controlName]?.[m]" class="pi pi-info-circle status-info-icon" aria-hidden="true"></i>
                                            </span>
                                        </button>
                                        <div class="small month-meta">{{ matrix[row.controlName]?.[m]?.date ? (matrix[row.controlName][m].date | date: 'MM/yyyy') : '' }}</div>
                                        <div class="month-label">{{ getMonthLabelWithYear(m) }}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </ng-container>
            </div>

            <p-dialog header="Detalhe do Atendimento" [(visible)]="dialogVisible" [modal]="true" [style]="{ width: '520px' }">
                <div *ngIf="selectedCell">
                    <div><strong>Procedimento:</strong> {{ selectedRow?.label }}</div>
                    <div><strong>Data:</strong> {{ selectedCell.date | date: 'dd/MM/yyyy' }}</div>
                    <div><strong>Status:</strong> {{ selectedCell.status }}</div>
                    <div *ngIf="selectedAttendance"><strong>Técnico:</strong> {{ selectedAttendance.tecnico }}</div>
                    <div *ngIf="selectedAttendance"><strong>Notas:</strong> {{ selectedAttendance.notas || '-' }}</div>
                </div>
            </p-dialog>
        </div>
    `,
    styles: [
        `
            .status-pill {
                display: inline-flex;
                align-items: center;
                padding: 0.18rem 0.5rem;
                border-radius: 9999px;
                font-weight: 600;
                font-size: 0.78rem;
                white-space: nowrap;
                gap: 0.35rem;
            }
            .status-executado {
                background: #16a34a;
                color: #fff;
            }
            .status-nao-executado {
                background: #dc2626;
                color: #fff;
            }
            .status-programado {
                background: #1e88e5;
                color: #fff;
            }
            .status-okconforme {
                background: #f59e0b;
                color: #0b1320;
            }
            .status-default {
                background: #6b7280;
                color: #fff;
            }
            /* status pills show a small info marker using PrimeIcons */
            .status-pill {
                position: relative;
            }
            .status-info-icon {
                margin-left: 0.25rem;
                font-size: 0.82rem;
                opacity: 0.95;
            }
            .schedule-table th,
            .schedule-table td {
                padding: 4px 8px;
                border-color: var(--surface-border);
            }
            .period-chip {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                background: var(--surface-card);
                border-radius: 16px;
                padding: 6px 10px;
                font-size: 0.82rem;
                color: var(--text-color-secondary);
                border: 1px solid rgba(0, 0, 0, 0.06);
                min-width: 74px;
            }
            /* PrimeNG table tweaks */
            :host ::ng-deep .p-table {
                border-radius: 6px;
                overflow: hidden;
                background: var(--surface-card);
            }
            :host ::ng-deep .p-table .p-datatable-thead > tr > th {
                background: transparent; /* keep app surface look */
                border-bottom: 1px solid var(--surface-border);
                text-align: left;
                padding: 8px 12px;
            }
            :host ::ng-deep .p-table .p-datatable-tbody > tr > td {
                padding: 8px 12px;
                vertical-align: middle;
                border-bottom: 1px solid var(--surface-border);
            }
            .proc-label {
                font-weight: 600;
            }

            /* smaller pills for month cells */
            .status-pill {
                padding: 0.22rem 0.5rem;
                font-size: 0.78rem;
            }

            /* mobile: stacked cards look using PrimeNG stack responsive layout; improve spacing */
            @media (max-width: 767px) {
                :host ::ng-deep .p-datatable-responsive-stack .p-datatable-tbody > tr > td {
                    padding: 10px 12px;
                }
                :host ::ng-deep .p-datatable-responsive-stack .p-datatable-tbody > tr {
                    margin-bottom: 8px;
                    box-shadow: 0 1px 0 rgba(0, 0, 0, 0.04);
                }
                .period-chip {
                    min-width: 60px;
                    padding: 4px 8px;
                }
            }
            /* Mobile card layout styles */
            .mobile-list {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            .mobile-card {
                background: var(--surface-card);
                border-radius: 8px;
                padding: 10px;
                box-shadow: 0 1px 2px rgba(16, 24, 40, 0.03);
                border: 1px solid var(--surface-border);
            }
            .mobile-card-header {
                display: flex;
                gap: 12px;
                align-items: center;
                margin-bottom: 8px;
            }
            .month-strip {
                display: flex;
                gap: 10px;
                overflow-x: auto;
                padding-bottom: 6px;
            }
            .month-item {
                min-width: 120px;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 6px;
            }
            .month-meta {
                font-size: 11px;
                color: var(--text-color-secondary);
            }
            .month-label {
                font-size: 11px;
                color: var(--text-color-secondary);
            }
            .month-item .status-pill {
                white-space: nowrap;
            }

            /* equipment header layout */
            .equip-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                gap: 24px;
                padding: 8px 0;
            }
            .equip-left {
                display: flex;
                flex-direction: column;
                gap: 6px;
            }
            .equip-id {
                font-size: 2.2rem;
                font-weight: 800;
                letter-spacing: 0.6px;
            }
            .equip-client {
                font-size: 0.82rem;
                color: var(--text-color-secondary);
                font-weight: 600;
            }
            .equip-right {
                min-width: 320px;
            }
            .equip-title {
                font-size: 0.95rem;
                color: var(--text-color-secondary);
                margin-bottom: 6px;
            }
            .equip-attrs {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 6px 12px;
                align-items: center;
            }
            .attr-row {
                display: flex;
                gap: 8px;
                align-items: center;
            }
            .attr-label {
                font-size: 0.78rem;
                color: var(--text-color-secondary);
                min-width: 160px;
            }
            .attr-value {
                font-weight: 600;
            }

            @media (max-width: 767px) {
                .equip-header {
                    flex-direction: column;
                    gap: 12px;
                }
                .equip-right {
                    width: 100%;
                }
                .equip-attrs {
                    grid-template-columns: 1fr;
                }
                .equip-id {
                    font-size: 1.6rem;
                }
            }

            /* signatures section */
            .signatures-section {
                margin-top: 1rem;
            }
            .signatures-title {
                font-weight: 700;
                color: var(--text-color-secondary);
                margin-bottom: 8px;
            }
            .signatures-wrapper {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            .sign-row {
                display: flex;
                align-items: center;
            }
            .label-cell {
                min-width: 220px;
                padding: 6px 8px;
                color: var(--text-color-secondary);
                font-weight: 600;
                position: sticky;
                left: 0;
                background: var(--surface-card);
                z-index: 3;
            }
            .months-scroll {
                overflow-x: auto;
                flex: 1;
            }
            .months-inner {
                display: flex;
                gap: 10px;
                padding: 6px;
            }
            .month-cell-sign {
                min-width: 110px;
                padding: 6px 8px;
                border-bottom: 1px solid var(--surface-border);
                text-align: center;
                font-weight: 600;
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            .sig-line {
                height: 34px;
                border-bottom: 1px solid rgba(0, 0, 0, 0.18);
                width: 100%;
                margin-top: 14px;
            }
            .signed-mark {
                color: var(--text-color);
                font-weight: 700;
            }
            .signed-date {
                color: var(--text-color-secondary);
                font-size: 0.82rem;
            }
            .contract-month {
                background: rgba(14, 165, 233, 0.06);
                border-radius: 6px;
            }

            @media (max-width: 767px) {
                .label-cell {
                    min-width: 120px;
                    font-size: 0.9rem;
                }
                .month-cell-sign {
                    min-width: 92px;
                    font-size: 0.82rem;
                }
                .sig-line {
                    height: 28px;
                }
            }
        `
    ]
})
export class EquipamentoScheduleComponent implements OnInit {
    isMobile = false;
    private mq?: MediaQueryList;
    private mqListener = (e: MediaQueryListEvent) => {
        this.isMobile = e.matches;
    };
    equipment?: Equipment;
    attendancesList: Attendance[] = [];
    checklist: ChecklistItem[] = [];
    groupedChecklist: { unit: string; items: ChecklistItem[] }[] = [];
    months: string[] = [];
    matrix: Record<string, Record<string, Cell>> = {};
    signatureRows = [{ label: 'Assinaturas Responsáveis' }, { label: 'Técnico' }, { label: 'Contratante' }];
    selectedCell?: Cell | null;
    selectedRow?: ChecklistItem | null;
    selectedAttendance?: Attendance | null;
    dialogVisible = false;

    constructor(
        private route: ActivatedRoute,
        private svc: PmocScheduleService
    ) {}

    ngOnInit(): void {
        // detect small screens to switch to mobile card layout
        try {
            this.isMobile = window.matchMedia('(max-width: 767px)').matches;
            this.mq = window.matchMedia('(max-width: 767px)');
            this.mq.addEventListener('change', this.mqListener);
        } catch (e) {
            // matchMedia may not be available in some test environments; default to false
            this.isMobile = false;
        }

        const id = this.route.snapshot.paramMap.get('id') || 'AC014';
        this.equipment = this.svc.getEquipment(id);
    this.checklist = this.svc.checklist;
    this.groupedChecklist = this.groupByUnit(this.checklist);
        const attendances = this.svc.getAttendancesForEquipment(id);
        this.attendancesList = attendances;

        const startMonth = this.equipment && this.equipment.contractMonth ? new Date(new Date().getFullYear(), (this.equipment.contractMonth - 1 + 0) % 12, 1) : new Date();
        const built = this.buildScheduleMatrix(this.checklist, attendances, startMonth, 12);
        this.months = built.months;
        this.matrix = built.matrix;
    }

    private groupByUnit(list: ChecklistItem[]) {
        const groups: Record<string, ChecklistItem[]> = {};
        for (const it of list) {
            const u = it.unit || 'EVAPORADORA';
            if (!groups[u]) groups[u] = [];
            groups[u].push(it);
        }
        // order groups consistently: EVAPORADORA then CONDENSADORA
        const ordered: { unit: string; items: ChecklistItem[] }[] = [];
        if (groups['EVAPORADORA']) ordered.push({ unit: 'EVAPORADORA', items: groups['EVAPORADORA'] });
        if (groups['CONDENSADORA']) ordered.push({ unit: 'CONDENSADORA', items: groups['CONDENSADORA'] });
        // include any other groups
        Object.keys(groups).forEach((k) => {
            if (k !== 'EVAPORADORA' && k !== 'CONDENSADORA') ordered.push({ unit: k, items: groups[k] });
        });
        return ordered;
    }

    ngOnDestroy(): void {
        try {
            this.mq?.removeEventListener('change', this.mqListener);
        } catch (e) {
            // ignore
        }
    }

    buildScheduleMatrix(checklist: ChecklistItem[], attendances: Attendance[], startMonth: Date, months = 12) {
        // Determine PMOC start date: earliest attendance date (first maintenance) or provided startMonth
        const allDates = attendances
            .map((a) => new Date(a.date))
            .filter((d) => !isNaN(d.getTime()))
            .sort((a, b) => +a - +b);
        const pmocStart = allDates.length ? new Date(allDates[0].getFullYear(), allDates[0].getMonth(), 1) : new Date(startMonth.getFullYear(), startMonth.getMonth(), 1);

        const monthsArr: string[] = [];
        for (let i = 0; i < months; i++) {
            const m = new Date(pmocStart.getFullYear(), pmocStart.getMonth() + i, 1);
            monthsArr.push(`${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, '0')}`);
        }

        const matrix: Record<string, Record<string, Cell>> = {};

        // initialize matrix with empty cells
        for (const item of checklist) {
            matrix[item.controlName] = {};
            for (const monthKey of monthsArr) {
                matrix[item.controlName][monthKey] = { status: '' } as Cell;
            }
        }

        // helper: map attendances by procedimentoKey and monthKey
        const attendMap = new Map<string, Attendance[]>();
        for (const a of attendances) {
            const d = new Date(a.date);
            if (isNaN(d.getTime())) continue;
            const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const key = `${a.procedimentoKey}::${monthKey}`;
            if (!attendMap.has(key)) attendMap.set(key, []);
            attendMap.get(key)!.push(a);
        }

        const endMonth = new Date(pmocStart.getFullYear(), pmocStart.getMonth() + months - 1, 1);

        const periodToMonths = (p?: string) => {
            if (!p) return 1;
            const up = p.toUpperCase();
            if (up.includes('TRIM')) return 3;
            if (up.includes('SEM')) return 6;
            if (up.includes('AN') || up.includes('ANO')) return 12;
            return 1; // default mensal
        };

        // schedule each checklist item according to its periodicity and last performed date
        for (const item of checklist) {
            const period = periodToMonths(item.periodicity);

            // find last performed attendance for this procedure (latest date)
            const itemAttendances = attendances
                .filter((a) => a.procedimentoKey === item.controlName)
                .map((a) => new Date(a.date))
                .filter((d) => !isNaN(d.getTime()))
                .sort((a, b) => +a - +b);
            let anchor = itemAttendances.length ? new Date(itemAttendances[itemAttendances.length - 1].getFullYear(), itemAttendances[itemAttendances.length - 1].getMonth(), 1) : new Date(pmocStart.getFullYear(), pmocStart.getMonth(), 1);

            // if the anchor is before pmocStart, shift it forward to pmocStart
            if (anchor < pmocStart) anchor = new Date(pmocStart.getFullYear(), pmocStart.getMonth(), 1);

            // walk forward from anchor up to endMonth, marking scheduled occurrences
            const iter = new Date(anchor);
            while (iter <= endMonth) {
                const monthKey = `${iter.getFullYear()}-${String(iter.getMonth() + 1).padStart(2, '0')}`;
                // if there is an attendance recorded for this procedure in this month, prefer that
                const attKey = `${item.controlName}::${monthKey}`;
                if (attendMap.has(attKey)) {
                    const atts = attendMap.get(attKey)!;
                    // pick the latest attendance for that month
                    const a = atts.sort((x, y) => +new Date(x.date) - +new Date(y.date)).pop()!;
                    matrix[item.controlName][monthKey] = { status: a.result || 'EXECUTADO', date: a.date, attendanceId: a.id };
                } else {
                    matrix[item.controlName][monthKey] = { status: 'PROGRAMADO' };
                }
                iter.setMonth(iter.getMonth() + period);
            }
        }

        // propagate PROGRAMADO backwards: for each scheduled occurrence, mark months between previous execution and that occurrence as PROGRAMADO
        for (const item of checklist) {
            const idxMap = new Map<string, number>();
            monthsArr.forEach((m, i) => idxMap.set(m, i));

            // find all months that currently have EXECUTADO or OK_CONFORME (performed)
            const performedIdxs: number[] = [];
            for (let i = 0; i < monthsArr.length; i++) {
                const st = (matrix[item.controlName] && matrix[item.controlName][monthsArr[i]] && matrix[item.controlName][monthsArr[i]].status) || '';
                const up = (st || '').toString().toUpperCase();
                if (up.includes('EXECUTADO') || up.includes('OK')) performedIdxs.push(i);
            }

            // for each month that is PROGRAMADO, ensure months between last performed and that month are PROGRAMADO
            for (let i = 0; i < monthsArr.length; i++) {
                const st = (matrix[item.controlName] && matrix[item.controlName][monthsArr[i]] && matrix[item.controlName][monthsArr[i]].status) || '';
                if (!st || !st.toString().toUpperCase().includes('PROGRAMADO')) continue;

                // find previous performed index < i
                const prev = performedIdxs.filter((x) => x < i).pop();
                const start = typeof prev === 'number' ? prev + 1 : 0; // if none performed, start from beginning of view
                for (let j = start; j <= i; j++) {
                    const mKey = monthsArr[j];
                    if (!matrix[item.controlName][mKey] || !matrix[item.controlName][mKey].status) {
                        matrix[item.controlName][mKey] = { status: 'PROGRAMADO' };
                    }
                }
            }
        }

        // ensure any attendances that fell outside scheduled slots are still shown
        for (const a of attendances) {
            const d = new Date(a.date);
            if (isNaN(d.getTime())) continue;
            const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            if (!matrix[a.procedimentoKey]) continue;
            matrix[a.procedimentoKey][monthKey] = { status: a.result || 'EXECUTADO', date: a.date, attendanceId: a.id };
        }

        return { months: monthsArr, matrix };
    }

    badgeClass(status?: string | null) {
        if (!status) return 'status-default';
        const s = status.toString().toLowerCase();
        if (s.includes('execut')) return 'status-executado';
        if (s.includes('nao') || s.includes('não') || s.includes('not')) return 'status-nao-executado';
        if (s.includes('ok') || s.includes('conforme')) return 'status-okconforme';
        if (s.includes('program')) return 'status-programado';
        return 'status-default';
    }

    shortText(cell: Cell) {
        if (!cell) return '-';
        const s = (cell.status || '').toString().toUpperCase();
        if (s.includes('EXECUTADO')) return 'EXECUTADO';
        if (s.includes('OK_CONFORME') || s.includes('OK CONFORME') || s.includes('CONFORME')) return 'OK_CONFORME';
        if (s.includes('PROGRAMADO')) return 'PROGRAMADO';
        if (s.includes('NAO') || s.includes('NÃO') || s.includes('NOT') || s.includes('NÃO_EXECUTADO') || s.includes('NAO_EXECUTADO')) return 'NÃO EXECUTADO';
        return cell.status;
    }

    tooltipText(cell: Cell) {
        if (!cell) return '';
        return `${cell.status}${cell.date ? ' — ' + new Date(cell.date).toLocaleDateString() : ''}`;
    }

    formatPeriod(p?: string) {
        if (!p) return '';
        const up = p.toString().toUpperCase();
        if (up.includes('MENS')) return 'Mensal';
        if (up.includes('TRIM')) return 'Trimestral';
        if (up.includes('SEM')) return 'Semestral';
        if (up.includes('AN') || up.includes('ANO')) return 'Anual';
        return p;
    }

    // Return a Portuguese month label for a 'YYYY-MM' key
    getMonthLabel(key: string) {
        if (!key) return '';
        const parts = key.split('-');
        if (parts.length < 2) return key;
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const names = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        const label = names[m] || parts[1];
        return label;
    }

    // Return Portuguese month name with year for a 'YYYY-MM' key (e.g., 'Setembro 2025')
    getMonthLabelWithYear(key: string) {
        if (!key) return '';
        const parts = key.split('-');
        if (parts.length < 2) return key;
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const names = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        const label = names[m] || parts[1];
        return `${label} ${y}`;
    }

    // Return whether this month is the equipment's contract month
    isContractMonth(key: string) {
        if (!this.equipment || !this.equipment.contractMonth) return false;
        const parts = key.split('-');
        if (parts.length < 2) return false;
        const m = parseInt(parts[1], 10);
        return m === this.equipment.contractMonth;
    }

    // Determine whether the month should be marked as signed (EXECUTADO or OK_CONFORME)
    isMonthSigned(key: string) {
        // check matrix for any procedure with EXECUTADO or OK_CONFORME in this month
        for (const proc of Object.keys(this.matrix || {})) {
            const cell = this.matrix[proc] && this.matrix[proc][key];
            if (!cell || !cell.status) continue;
            const s = (cell.status || '').toString().toUpperCase();
            if (s.includes('EXECUTADO') || s.includes('OK_CONFORME') || s.includes('CONFORME')) return true;
            if (s.includes('NAO') || s.includes('NÃO') || s.includes('NÃO EXECUTADO') || s.includes('NAO_EXECUTADO')) {
                // if equipment is out of operation, treat as signed
                if ((this.equipment as any)?.outOfOperation) return true;
            }
        }
        return false;
    }

    // Return a display date for signatures (latest attendance date in that month) or empty
    getSignedDate(key: string) {
        const matches = this.attendancesList.filter((a) => {
            const d = new Date(a.date);
            if (isNaN(d.getTime())) return false;
            const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            return monthKey === key;
        });
        if (!matches.length) return '';
        const latest = matches.sort((a, b) => +new Date(b.date) - +new Date(a.date))[0];
        return new Date(latest.date).toLocaleDateString();
    }

    // Determine signature type for a month: prefer EXECUTADO, then OK_CONFORME, then NAO_EXECUTADO (if outOfOperation)
    getSignatureType(key: string): string | null {
        let hasOk = false;
        let hasExec = false;
        let hasNao = false;
        for (const proc of Object.keys(this.matrix || {})) {
            const cell = this.matrix[proc] && this.matrix[proc][key];
            if (!cell || !cell.status) continue;
            const s = (cell.status || '').toString().toUpperCase();
            if (s.includes('EXECUTADO')) hasExec = true;
            if (s.includes('OK') || s.includes('CONFORME')) hasOk = true;
            if (s.includes('NAO') || s.includes('NÃO') || s.includes('NÃO_EXECUTADO') || s.includes('NAO_EXECUTADO')) hasNao = true;
        }
        if (hasExec) return 'EXECUTADO';
        if (hasOk) return 'OK_CONFORME';
        if (hasNao && (this.equipment as any)?.outOfOperation) return 'NAO_EXECUTADO';
        return null;
    }

    openDetail(row: ChecklistItem, monthKey: string) {
        const cell = this.matrix[row.controlName][monthKey];
        if (!cell) return;
        this.selectedCell = cell;
        this.selectedRow = row;
        if (cell.attendanceId) {
            const att = this.svc.getAttendancesForEquipment(this.equipment?.id || '').find((a) => a.id === cell.attendanceId);
            this.selectedAttendance = att || null;
        } else {
            this.selectedAttendance = null;
        }
        this.dialogVisible = true;
    }
}
