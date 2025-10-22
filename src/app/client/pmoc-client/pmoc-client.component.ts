import { Component, Input, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PmocClientService, PmocSummary } from './pmoc-client.service';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { BadgeModule } from 'primeng/badge';
import { DrawerModule } from 'primeng/drawer';
import { PanelModule } from 'primeng/panel';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-pmoc-client',
    standalone: true,
    imports: [CommonModule, ButtonModule, CardModule, DividerModule, BadgeModule, DrawerModule, PanelModule, DialogModule, FormsModule],
    styles: [
        `:host { display: block; }
        /* theme-aware variables for next-maintenance highlights set on the component host so they apply with emulated encapsulation */
        :host {
            --pmoc-next-row-bg: rgba(0,0,0,0.02);
            --pmoc-next-row-accent: rgba(0,123,255,0.14);
            --pmoc-next-alert-bg: rgba(255,245,230,0.9);
            --pmoc-next-alert-accent: rgba(255,165,0,0.7);
            --pmoc-next-text-color: inherit;
        }

        .next-maint-row {
            background-color: var(--pmoc-next-row-bg) !important;
            border-left: 4px solid var(--pmoc-next-row-accent) !important;
            color: var(--pmoc-next-text-color) !important;
            padding: 0.5rem;
            border-radius: 0.375rem;
        }
        .next-maint-alert {
            background-color: var(--pmoc-next-alert-bg) !important;
            border-left: 4px solid var(--pmoc-next-alert-accent) !important;
            color: var(--pmoc-next-text-color) !important;
            padding: 0.5rem;
            border-radius: 0.375rem;
        }

        /* dark mode overrides applied to the component host so they take effect with encapsulation */
        @media (prefers-color-scheme: dark) {
            :host {
                --pmoc-next-row-bg: rgba(255,255,255,0.02);
                --pmoc-next-row-accent: rgba(0,123,255,0.18);
                /* subtler amber overlay for dark backgrounds */
                --pmoc-next-alert-bg: rgba(255,165,0,0.10);
                --pmoc-next-alert-accent: rgba(255,165,0,0.36);
                --pmoc-next-text-color: rgba(255,255,255,0.95);
            }
        }
        `
    ],
    template: `
        <div class="p-4">
            <div class="flex items-center justify-between mb-4">
                <h2 class="m-0">PMOCs Pendentes</h2>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div *ngFor="let p of pending" class="p-4 rounded border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 shadow-sm">
                    <div class="flex justify-between items-start">
                        <div>
                            <div class="font-semibold text-lg">{{ p.cliente }}</div>
                            <div class="text-sm text-muted">{{ p.equipamento }}</div>
                            <div class="text-sm mt-2">
                                ID: <strong>{{ p.id }}</strong>
                            </div>
                            <div class="text-sm text-muted">
                                Data Manutenção: <strong>{{ p.dataManutencao | date: 'dd/MM/yyyy' }}</strong>
                            </div>
                            <div *ngIf="p.proximaManutencao" class="text-base mt-1" [ngClass]="isNearExpiry(p.proximaManutencao) ? 'next-maint-alert' : 'next-maint-row'">
                                <strong>Próxima manutenção:</strong>
                                <span class="ml-2 font-medium">{{ p.proximaManutencao | date: 'dd/MM/yyyy' }}</span>
                                <span *ngIf="isNearExpiry(p.proximaManutencao)" class="ml-3 text-sm text-muted">— Próxima do vencimento ({{ daysUntil(p.proximaManutencao) }}d)</span>
                            </div>
                        </div>
                    </div>

                    <p-divider class="my-3"></p-divider>

                    <!-- Responsive: status + Detalhes on same row for small screens; Aprovar on its own row below -->
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div class="flex items-center justify-between w-full sm:w-auto gap-2">
                            <div class="text-sm">
                                Status: <span class="inline-block ml-1"><p-badge value="Pendente" severity="warn"></p-badge></span>
                            </div>
                            <!-- Detalhes sits next to status on small screens; on sm+ it will be on the right due to parent layout -->
                            <div class="ml-2 sm:ml-0">
                                <button pButton type="button" icon="pi pi-eye" label="Detalhes" class="p-button-text" (click)="viewDetails(p)"></button>
                            </div>
                        </div>

                        <!-- Aprovar occupies a separate row on small screens, but on sm+ it will appear inline on the right via parent flex -->
                        <div class="w-full sm:w-auto">
                            <div class="flex justify-start sm:justify-end">
                                <button pButton type="button" icon="pi pi-check" label="Aprovar" class="p-button-success p-button-text" (click)="openApprove(p)"></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="mt-6">
                <h3>PMOCs Aprovadas</h3>
                <div *ngIf="approved.length === 0" class="text-sm text-muted">Nenhuma PMOC aprovada.</div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    <div *ngFor="let p of approved" class="p-4 rounded border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 shadow-sm">
                        <div class="flex justify-between items-start">
                            <div>
                                <div class="font-semibold text-lg">{{ p.cliente }}</div>
                                <div class="text-sm text-muted">{{ p.equipamento }}</div>
                                <div class="text-sm mt-2">
                                    ID: <strong>{{ p.id }}</strong>
                                </div>

                                <div class="text-sm text-muted">
                                    Data Manutenção: <strong>{{ p.dataManutencao | date: 'dd/MM/yyyy' }}</strong>
                                </div>
                                <div *ngIf="p.proximaManutencao" class="text-base mt-1" [ngClass]="isNearExpiry(p.proximaManutencao) ? 'next-maint-alert' : 'next-maint-row'">
                                    <strong>Próxima manutenção:</strong>
                                    <span class="ml-2 font-medium">{{ p.proximaManutencao | date: 'dd/MM/yyyy' }}</span>
                                    <span *ngIf="isNearExpiry(p.proximaManutencao)" class="ml-3 text-sm text-muted">— Próximo ao vencimento ({{ daysUntil(p.proximaManutencao) }}d)</span>
                                </div>
                            </div>
                        </div>

                        <p-divider class="my-3"></p-divider>

                        <!-- Approved card: keep status and Detalhes inline; responsive spacing maintained -->
                        <div class="flex items-center justify-between gap-2">
                            <div class="text-sm">
                                Status: <span class="inline-block ml-1"><p-badge value="Aprovada" severity="success"></p-badge></span>
                            </div>
                            <div class="flex gap-2">
                                <button pButton type="button" icon="pi pi-eye" label="Detalhes" class="p-button-text" (click)="viewDetails(p)"></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <p-drawer [(visible)]="drawerVisible" position="right" [style]="drawerStyle">
                <div class="p-4 flex items-center justify-between">
                    <div class="font-semibold">Detalhes — {{ selected?.id }}</div>
                    <div *ngIf="selected && isPending(selected)" class="ml-2">
                        <button pButton type="button" icon="pi pi-check" label="Aprovar" class="p-button-success" (click)="openApprove(selected)"></button>
                    </div>
                </div>

                <div *ngIf="selected" class="p-4">
                    <p-panel header="Informações gerais" class="mb-3">
                        <div class="text-base"><strong>Cliente:</strong> {{ selected.cliente }}</div>
                        <div class="text-base"><strong>Equipamento:</strong> {{ selected.equipamento }}</div>
                        <div class="text-base" *ngIf="selected.dataManutencao"><strong>Data manutenção:</strong> {{ selected.dataManutencao | date: 'dd/MM/yyyy' }}</div>
                        <div *ngIf="selected.proximaManutencao" class="text-base">
                            <strong>Próxima manutenção:</strong>
                            <span class="ml-2">{{ selected.proximaManutencao | date: 'dd/MM/yyyy' }}</span>
                            <span *ngIf="isNearExpiry(selected.proximaManutencao)" class="ml-3 text-sm text-muted">— Próxima do vencimento ({{ daysUntil(selected.proximaManutencao) }}d)</span>
                        </div>
                        <div class="text-base" *ngIf="selected.tipoManutencao"><strong>Tipo:</strong> {{ selected.tipoManutencao }}</div>
                        <div class="text-base" *ngIf="selected.responsavel"><strong>Responsável:</strong> {{ selected.responsavel }}</div>
                    </p-panel>

                    <p-panel header="Checklist" class="mb-3" *ngIf="selected.checklist && selected.checklist.length">
                        <ul>
                            <li *ngFor="let c of selected.checklist" class="text-base">- {{ c.label }}</li>
                        </ul>
                    </p-panel>

                    <p-panel header="Observações e Custos" class="mb-3">
                        <div *ngIf="selected.observacoes" class="mb-2"><strong>Observações:</strong> {{ selected.observacoes }}</div>
                        <div *ngIf="selected.custos !== undefined" class="text-base"><strong>Custos:</strong> {{ selected.custos | currency: 'BRL' : 'symbol' : '1.2-2' : 'pt-BR' }}</div>
                        <div *ngIf="selected.assinatura" class="mt-2 text-base"><strong>Assinatura:</strong> {{ selected.assinatura }}</div>
                    </p-panel>
                </div>
            </p-drawer>

            <!-- Approve dialog -->
            <p-dialog header="Aprovar PMOC" [(visible)]="approveDialogVisible" [modal]="true" [closable]="false" [style]="{ width: currentViewportWidth <= drawerBreakpointPx ? '90vw' : '30rem' }">
                <div *ngIf="approveSelected">
                    <div class="mb-3">
                        <label class="flex items-center gap-2">
                            <input type="checkbox" [(ngModel)]="approveConfirmed" />
                            <span>Eu {{ approveSelected.cliente }} confirmo a execução da {{ approveSelected.id }}</span>
                        </label>
                    </div>

                    <div class="flex justify-end gap-2">
                        <button pButton type="button" label="Cancelar" class="p-button-text" (click)="cancelApprove()"></button>
                        <button pButton type="button" label="Confirmar" class="p-button-success" [disabled]="!approveConfirmed" (click)="confirmApprove()"></button>
                    </div>
                </div>
            </p-dialog>
        </div>
    `
})
export class PmocClientComponent implements OnInit {
    pending: PmocSummary[] = [];
    approved: PmocSummary[] = [];
    selected: PmocSummary | null = null;
    artSelected: PmocSummary | null = null;
    artContent: string | null = null;
    // controls the visibility of the custom right-side drawer
    drawerVisible = false;
    /**
     * Drawer configuration inputs (configurable by parent if needed)
     * drawerWidthPercent: fraction (0..1) of viewport width to use on wide screens
     * drawerBreakpointPx: viewport width (px) below which the drawer switches to mobile width
     */
    @Input() drawerWidthPercent = 0.4;
    @Input() drawerBreakpointPx = 1024; // default breakpoint (px)

    // track current viewport width for responsive calculations
    currentViewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;

    // computed style object bound to the drawer [style]
    get drawerStyle() {
        const vw = this.currentViewportWidth;
        // if small screen, use a wide viewport percentage (90vw)
        if (vw <= this.drawerBreakpointPx) {
            return { width: '90vw', minWidth: '300px', maxWidth: '100vw' };
        }
        const pct = Math.max(0.15, Math.min(0.9, this.drawerWidthPercent));
        return { width: `${Math.round(pct * 100)}%`, minWidth: '300px', maxWidth: '90vw' };
    }

    @HostListener('window:resize', ['$event'])
    onResize(event: any) {
        this.currentViewportWidth = event?.target?.innerWidth || window.innerWidth;
    }

    constructor(private svc: PmocClientService) {
        this.pending = svc.getPending();
        this.approved = svc.getApproved();
    }

    ngOnInit(): void {
        // sort lists by proximity of next maintenance on init
        this.sortPendingApproved();
    }

    // approval dialog state
    approveSelected: PmocSummary | null = null;
    approveDialogVisible = false;
    approveConfirmed = false;

    openApprove(p: PmocSummary) {
        this.approveSelected = p;
        this.approveConfirmed = false;
        this.approveDialogVisible = true;
    }

    cancelApprove() {
        this.approveSelected = null;
        this.approveConfirmed = false;
        this.approveDialogVisible = false;
    }

    confirmApprove() {
        if (!this.approveSelected) return;
        // naive: move item from pending to approved
        this.pending = this.pending.filter((x) => x.id !== this.approveSelected!.id);
        this.approved = [this.approveSelected, ...this.approved];
        this.sortPendingApproved();
        this.cancelApprove();
    }

    viewDetails(p: PmocSummary) {
        this.selected = p;
        this.drawerVisible = true;
    }

    closeDetails() {
        this.selected = null;
        this.drawerVisible = false;
    }

    viewArt(p: PmocSummary) {
        this.artSelected = p;
        this.artContent = this.svc.getArtFor(p.id);
    }

    closeArt() {
        this.artSelected = null;
        this.artContent = null;
    }

    // helper: return true if the given PMOC is currently pending
    isPending(p: PmocSummary | null): boolean {
        if (!p) return false;
        return this.pending.some((x) => x.id === p.id);
    }

    // helper: produce a human label for the next maintenance date
    nextMaintenanceLabel(dateStr: string | Date): string {
        const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
        const today = new Date();
        // zero time to compare only dates
        const tzOffset = today.getTimezoneOffset();
        const t = new Date(today.getTime() - tzOffset * 60000);
        const nd = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const td = new Date(t.getFullYear(), t.getMonth(), t.getDate());
        const diffMs = nd.getTime() - td.getTime();
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays < 0) return 'Vencida';
        if (diffDays === 0) return 'Hoje';
        if (diffDays <= 7) return `Em ${diffDays}d`;
        return 'Agendado';
    }

    // helper: map label urgency to PrimeNG badge severity
    nextMaintenanceSeverity(dateStr: string | Date): 'danger' | 'warn' | 'success' | 'info' {
        const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
        const today = new Date();
        const nd = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        const td = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
        const diffDays = Math.round((nd - td) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) return 'danger';
        if (diffDays === 0) return 'warn';
        if (diffDays <= 7) return 'info';
        return 'success';
    }

    // returns a soft-color style object for the next-maintenance row based on urgency
    // NOTE: styling for next-maintenance rows/alerts is handled by component CSS classes now.

    // sort pending and approved by proximity to proximaManutencao (earlier dates first)
    sortPendingApproved() {
        const sortFn = (a: PmocSummary, b: PmocSummary) => {
            const ad = a.proximaManutencao ? new Date(a.proximaManutencao).getTime() : Number.MAX_SAFE_INTEGER;
            const bd = b.proximaManutencao ? new Date(b.proximaManutencao).getTime() : Number.MAX_SAFE_INTEGER;
            return ad - bd;
        };
        this.pending = [...this.pending].sort(sortFn);
        this.approved = [...this.approved].sort(sortFn);
    }

    // days from today until the given date (positive if future, negative if past)
    daysUntil(dateStr: string | Date): number {
        const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
        const today = new Date();
        const nd = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        const td = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
        return Math.round((nd - td) / (1000 * 60 * 60 * 24));
    }

    // returns true if date is within the next 30 days (including today)
    isNearExpiry(dateStr: string | Date): boolean {
        const days = this.daysUntil(dateStr);
        return days >= 0 && days <= 30;
    }

    // (removed inline style helpers) CSS classes now control visual styles and respect prefers-color-scheme.
}
