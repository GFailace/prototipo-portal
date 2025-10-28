import { Component, Input, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PmocClientService, PmocSummary, Attendance } from './pmoc-client.service';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { BadgeModule } from 'primeng/badge';
import { DrawerModule } from 'primeng/drawer';
import { PanelModule } from 'primeng/panel';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';

@Component({
    selector: 'app-pmoc-client',
    standalone: true,
    imports: [CommonModule, ButtonModule, CardModule, DividerModule, BadgeModule, DrawerModule, PanelModule, DialogModule, FormsModule, InputTextModule],
    styles: [
        `
            :host {
                display: block;
            }

            /* Increase the visual size of p-header used in this component so titles are more prominent */
            p-header {
                display: block;
                font-size: 1.5rem; /* larger heading */
                font-weight: 600;
                color: var(--text-color, inherit);
                margin-bottom: 0.5rem;
                line-height: 1.2;
            }

            /* Slightly smaller sub-headers used for sections like "Pendentes de aprovação" / "Aprovadas" */
            p-header.section-header {
                display: block;
                font-size: 1.125rem; /* smaller than the main title but still prominent */
                font-weight: 600;
                color: var(--text-color-secondary, var(--text-color, inherit));
                margin-bottom: 0.25rem;
                line-height: 1.25;
            }

            /* PMOC card typography and spacing tweaks */
            .pmoc-card {
                padding: 1rem !important;
            }
            .pmoc-title {
                font-size: 1.05rem;
                letter-spacing: -0.2px;
            }
            .pmoc-id {
                margin-top: 0.35rem;
                color: rgba(0, 0, 0, 0.65);
                display: block;
            }
            .pmoc-equip {
                margin-top: 0.25rem;
            }
            .pmoc-footer {
                margin-top: 0.5rem;
                padding-top: 0.5rem;
                border-top: 1px solid var(--surface-border, rgba(0, 0, 0, 0.06));
            }

            /* dark-mode tweaks: ensure ID text is legible on dark surfaces */
            :host-context(.app-dark) .pmoc-id,
            :host-context(.dark) .pmoc-id {
                color: rgba(255, 255, 255, 1) !important;
            }

            /* Use global theme variables for next-maintenance highlights so alerts respect the app theme (light/dark).
           Provide sensible fallbacks to preserve current appearance when variables are not present. */

            .next-maint-row {
                /* follow the app surface tokens so the row matches cards/containers */
                background-color: var(--surface-card, var(--surface-ground, rgba(0, 0, 0, 0.02))) !important;
                border-left: 4px solid var(--surface-border, rgba(0, 0, 0, 0.06)) !important;
                color: var(--text-color, inherit) !important;
                padding: 0.5rem;
                border-radius: 0.375rem;
            }
            .next-maint-alert {
                /* use surface hover/overlay token so alerts visually follow other highlighted surfaces */
                background-color: var(--surface-hover, var(--surface-overlay, rgba(255, 245, 230, 0.9))) !important;
                /* accent fallsback to pmoc-specific or primary color if available */
                border-left: 4px solid var(--pmoc-next-alert-accent, var(--p-primary-color, rgba(255, 165, 0, 0.7))) !important;
                color: var(--text-color, inherit) !important;
                padding: 0.5rem;
                border-radius: 0.375rem;
                /* subtle elevated appearance to match other components */
                box-shadow: var(--pmoc-next-alert-shadow, 0 1px 2px rgba(0, 0, 0, 0.04));
                backdrop-filter: var(--pmoc-next-alert-backdrop, none);
            }
            .next-maint-expired {
                /* Follow app surface tokens so expired alert matches other card highlights in both themes */
                background-color: var(--surface-hover, var(--surface-overlay, var(--pmoc-next-expired-bg, rgba(253, 236, 234, 0.98)))) !important;
                /* strong red accent for expired state with fallback */
                border-left: 4px solid var(--pmoc-next-expired-accent, rgba(220, 53, 69, 0.9)) !important;
                color: var(--text-color, var(--pmoc-next-expired-text, inherit)) !important;
                padding: 0.5rem;
                border-radius: 0.375rem;
                box-shadow: var(--pmoc-next-alert-shadow, 0 1px 2px rgba(0, 0, 0, 0.04));
            }
            /* Search bar: place icon inside input and style select like the datepicker */
            .search-bar {
                display: flex;
                gap: 0.75rem;
                align-items: center;
                max-width: 900px; /* keep the search area from growing too wide on large screens */
            }
            .p-input-icon-left.search-input {
                flex: 1 1 auto;
                min-width: 0;
                position: relative;
                max-width: calc(100% - 220px); /* reserve space for select + clear button */
            }
            .p-input-icon-left.search-input .pi {
                position: absolute;
                left: 0.75rem;
                top: 50%;
                transform: translateY(-50%);
                color: var(--text-color-secondary, #6b7280);
            }
            .p-input-icon-left.search-input input.p-inputtext {
                padding-left: 2.4rem;
                width: 100%;
            }
            .select-wrap {
                position: relative;
                display: inline-block;
                width: 12rem;
            }
            .select-wrap select {
                appearance: none;
                -webkit-appearance: none;
                -moz-appearance: none;
                padding: 0.35rem 1.6rem 0.35rem 0.7rem;
                border: 1px solid var(--p-textarea-border-color, var(--surface-border, #d1d5db));
                border-radius: 0.25rem;
                background: var(--p-textarea-background, #fff);
                color: var(--text-color, #374151);
                font-size: 0.95rem;
                width: 100%;
                box-sizing: border-box;
            }
            .select-wrap::after {
                content: '\u203A';
                position: absolute;
                right: 0.6rem;
                top: 50%;
                transform: translateY(-50%) rotate(90deg);
                color: var(--p-primary-color, #ff7a18);
                opacity: 0.65;
                pointer-events: none;
            }

            /* Dark mode adjustments for the native select to match PrimeNG theme tokens */
            :host-context(.app-dark) .select-wrap select,
            :host-context(.dark) .select-wrap select {
                background: var(--surface-card, var(--surface-0, #111827));
                color: var(--text-color, #f3f4f6);
                border-color: var(--surface-border, rgba(255, 255, 255, 0.06));
            }
            :host-context(.app-dark) .select-wrap::after,
            :host-context(.dark) .select-wrap::after {
                color: var(--p-primary-color, #ff7a18);
                opacity: 0.85;
            }
            .clear-button {
                border-radius: 9999px;
            }

            @media (max-width: 640px) {
                .search-bar {
                    flex-direction: column;
                    align-items: stretch;
                    /* allow the search toolbar to expand to the full available width on small devices */
                    width: 100%;
                    max-width: none;
                }
                .select-wrap {
                    width: 100%;
                }
                .p-input-icon-left.search-input {
                    /* let the text input grow to full width when stacked */
                    max-width: none;
                    width: 100%;
                }
                .p-input-icon-left.search-input input.p-inputtext {
                    width: 100%;
                }
                .p-button .p-button-label {
                    display: none;
                }
            }
        `
    ],
    template: `
        <div class="p-2">
            <p-header>Atendimentos</p-header>
            <!-- Search toolbar -->
            <div class="search-bar my-4">
                <span class="p-input-icon-left search-input">
                    <i class="pi pi-search"></i>
                    <input pInputText type="text" placeholder="Pesquisar por ID ou equipamento" [(ngModel)]="searchTerm" (input)="applyFilters()" />
                </span>
                <div class="select-wrap">
                    <select class="p-inputtext" [(ngModel)]="selectedStatus" (change)="applyFilters()">
                        <option [ngValue]="null">Todos</option>
                        <option *ngFor="let o of statusOptions" [value]="o.value">{{ o.label }}</option>
                    </select>
                </div>
                <button pButton type="button" icon="pi pi-times" class="p-button-text clear-button" (click)="clearFilters()" aria-label="Limpar filtros">Limpar pesquisa</button>
            </div>

            <div class="mb-6">
                <p-header class="section-header">Pendentes de aprovação</p-header>
                <div *ngIf="pending.length === 0" class="text-sm text-muted mt-3">Nenhuma PMOC pendente.</div>
            </div>

            <div class="grid grid-cols-1 gap-4">
                <div *ngFor="let p of pending" class="p-4 rounded border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 shadow-sm pmoc-card">
                    <div class="flex justify-between items-start">
                        <div>
                            <!-- emphasize equipamento as primary title -->
                            <div class="font-semibold text-xl pmoc-title">{{ p.equipamento }}</div>
                            <div class="text-sm mt-1 pmoc-id">
                                Cliente: <strong>{{ p.cliente }}</strong>
                            </div>
                            <div class="text-sm mt-1 pmoc-id">
                                ID do atendimento: <strong>{{ p.id }}</strong>
                            </div>
                            <div class="text-sm mt-1 pmoc-id">
                                ID do PMOC: <strong>{{ p.pmocId }}</strong>
                            </div>

                            <div class="mt-3">
                                <div class="text-sm text-muted">Data da manutenção realizada</div>
                                <div class="font-semibold text-lg">{{ p.dataManutencao | date: 'dd/MM/yyyy' }}</div>
                            </div>

                            <div class="mt-3">
                                <div class="text-sm text-muted">Próxima manutenção</div>
                                <div class="mt-1" [ngClass]="getNextMaintClass(p)">
                                    <span class="font-semibold">{{ getEffectiveNextMaintenanceLabel(p) }}</span>
                                    <span class="ml-3 text-sm text-muted">{{ getEffectiveNextMaintenance(p) | date: 'dd/MM/yyyy' }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="text-sm">Status do equipamento</div>
                            <div class="font-semibold mt-1">{{ getEquipStatusLabel(p) }}</div>
                        </div>
                    </div>

                    <!-- Responsive: status + Detalhes on same row for small screens; Aprovar on its own row below -->
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pmoc-footer">
                        <div class="flex items-center justify-between w-full sm:w-auto gap-2">
                            <div class="text-sm">
                                Status:
                                <span *ngIf="isExpiredSafe(p); else statusPending" class="inline-block ml-1"><p-badge value="Vencido" severity="danger"></p-badge></span>
                                <ng-template #statusPending
                                    ><span class="inline-block ml-1"><p-badge [value]="getStatusLabel(p)" [severity]="getStatusSeverity(p)"></p-badge></span
                                ></ng-template>
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
                <p-header class="section-header">Aprovados</p-header>
                <div *ngIf="approved.length === 0" class="text-sm text-muted">Nenhum atendimento correspondente.</div>
                <div class="grid grid-cols-1 gap-4 mt-3">
                    <div *ngFor="let p of approved" class="p-4 rounded border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 shadow-sm pmoc-card">
                        <div class="flex justify-between items-start">
                            <div>
                                <div class="font-semibold text-xl pmoc-title">{{ p.equipamento }}</div>
                                <div class="text-sm mt-1 pmoc-id">
                                    Cliente: <strong>{{ p.cliente }}</strong>
                                </div>
                                <div class="text-sm mt-1 pmoc-id">
                                    ID do atendimento: <strong>{{ p.id }}</strong>
                                </div>
                                <div class="text-sm mt-1 pmoc-id">
                                    ID do PMOC: <strong>{{ p.pmocId }}</strong>
                                </div>

                                <div class="mt-3">
                                    <div class="text-sm text-muted">Data da manutenção realizada</div>
                                    <div class="font-semibold text-lg">{{ p.dataManutencao | date: 'dd/MM/yyyy' }}</div>
                                </div>

                                <div class="mt-3">
                                    <div class="text-sm text-muted">Próxima manutenção</div>
                                    <div class="mt-1" [ngClass]="getNextMaintClass(p)">
                                        <span class="font-semibold">{{ getEffectiveNextMaintenanceLabel(p) }}</span>
                                        <span class="ml-3 text-sm text-muted">{{ getEffectiveNextMaintenance(p) | date: 'dd/MM/yyyy' }}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="text-right">
                                <div class="text-sm">Status do equipamento</div>
                                <div class="font-semibold mt-1">{{ getEquipStatusLabel(p) }}</div>
                            </div>
                        </div>

                        <!-- Approved card: keep status and Detalhes inline; responsive spacing maintained -->
                        <div class="flex items-center justify-between gap-2 pmoc-footer">
                            <div class="text-sm">
                                Status:
                                <span *ngIf="isExpiredSafe(p); else statusApproved" class="inline-block ml-1"><p-badge value="Vencido" severity="danger"></p-badge></span>
                                <ng-template #statusApproved
                                    ><span class="inline-block ml-1"><p-badge [value]="getStatusLabel(p)" [severity]="getStatusSeverity(p)"></p-badge></span
                                ></ng-template>
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
                    <div class="font-semibold">
                        Detalhes — Atendimento {{ selected?.id }} <span style="font-weight:500; color:var(--text-color-secondary)">(PMOC: {{ selected?.pmocId }})</span>
                    </div>
                    <div *ngIf="selected && isPending(selected)" class="ml-2">
                        <button pButton type="button" icon="pi pi-check" label="Aprovar" class="p-button-success" (click)="openApprove(selected)"></button>
                    </div>
                </div>

                <div *ngIf="selected" class="p-4">
                    <p-panel header="Informações gerais" class="mb-3">
                        <div class="text-base"><strong>Cliente:</strong> {{ selected.cliente }}</div>
                        <div class="text-base"><strong>ID do atendimento:</strong> {{ selected.id }}</div>
                        <div class="text-base"><strong>ID do PMOC:</strong> {{ selected.pmocId }}</div>
                        <div class="text-base"><strong>Equipamento:</strong> {{ selected.equipamento }}</div>
                        <div class="text-base" *ngIf="selected.dataManutencao"><strong>Data manutenção:</strong> {{ selected.dataManutencao | date: 'dd/MM/yyyy' }}</div>
                        <div *ngIf="selected.proximaManutencao" class="text-base">
                            <strong>Próxima manutenção:</strong>
                            <span class="ml-2">{{ selected.proximaManutencao | date: 'dd/MM/yyyy' }}</span>
                            <span *ngIf="isExpired(selected.proximaManutencao)" class="ml-3 text-sm font-semibold">— Vencido ({{ daysOverdue(selected.proximaManutencao) }}d)</span>
                            <span *ngIf="!isExpired(selected.proximaManutencao) && isNearExpiry(selected.proximaManutencao)" class="ml-3 text-sm text-muted">— Próxima do vencimento ({{ daysUntil(selected.proximaManutencao) }}d)</span>
                        </div>
                        <div class="text-base" *ngIf="selected.tipoManutencao"><strong>Tipo de manutenção:</strong> {{ selected.tipoManutencao }}</div>
                        <div class="text-base" *ngIf="selected.status"><strong>Status do equipamento:</strong> {{ getStatusLabel(selected) }}</div>
                        <div class="text-base" *ngIf="selected.responsavel"><strong>Responsável:</strong> {{ selected.responsavel }}</div>
                        <div class="text-base" *ngIf="selected.periodicidade && selected.periodicidade.length"><strong>Periodicidade:</strong> {{ formatPeriodicidade(selected.periodicidade) }}</div>
                    </p-panel>

                    <p-panel header="Checklist" class="mb-3" *ngIf="selected.checklist && selected.checklist.length">
                        <ul>
                            <li *ngFor="let c of selected.checklist" class="text-base">- {{ c.label }} <span *ngIf="c.checked" class="text-sm text-success">(ok)</span></li>
                        </ul>
                    </p-panel>

                    <p-panel header="Observações e Custos" class="mb-3">
                        <div *ngIf="selected.observacoes" class="mb-2"><strong>Observações:</strong> {{ selected.observacoes }}</div>
                        <div *ngIf="selected.custos !== undefined" class="text-base"><strong>Custos:</strong> {{ selected.custos | currency: 'BRL' : 'symbol' : '1.2-2' : 'pt-BR' }}</div>
                        <div *ngIf="selected.assinatura" class="mt-2 text-base"><strong>Assinatura:</strong> {{ selected.assinatura }}</div>
                    </p-panel>

                    <p-panel header="Evidências / Fotos" class="mb-3">
                        <div class="text-sm text-muted">Upload de fotos não está disponível no mock; em produção exibirá miniaturas.</div>
                    </p-panel>

                    <!-- PMOC status displayed at bottom of details drawer - styled like PMOC cards -->
                    <div class="mt-3">
                        <div class="p-3 rounded border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 shadow-sm">
                            <div class="flex items-center justify-between">
                                <div class="text-sm"><strong>Status:</strong></div>
                                <div class="text-sm">
                                    <span *ngIf="isExpiredSafe(selected); else statusDrawer" class="inline-block ml-2"><p-badge value="Vencido" severity="danger"></p-badge></span>
                                    <ng-template #statusDrawer
                                        ><span class="inline-block ml-2"><p-badge [value]="getStatusLabel(selected)" [severity]="getStatusSeverity(selected)"></p-badge></span
                                    ></ng-template>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </p-drawer>

            <!-- Approve dialog -->
            <p-dialog header="Aprovar Atendimento" [(visible)]="approveDialogVisible" [modal]="true" [closable]="false" [style]="{ width: currentViewportWidth <= drawerBreakpointPx ? '90vw' : '30rem' }">
                <div *ngIf="approveSelected">
                    <div class="mb-3">
                        <label class="flex items-center gap-2">
                            <input type="checkbox" [(ngModel)]="approveConfirmed" />
                            <span>Eu {{ approveSelected.cliente }} confirmo a execução do atendimento {{ approveSelected.id }} (PMOC: {{ approveSelected.pmocId }})</span>
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
    // now showing attendance-level cards (each attendance references a PMOC via pmocId)
    pending: Attendance[] = [];
    approved: Attendance[] = [];
    selected: Attendance | null = null;
    artSelected: any | null = null;
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

    // current clientId from route (if present)
    clientId: string | null = null;

    // search / filter controls
    searchTerm: string = '';
    selectedStatus: string | null = null;
    statusOptions: Array<{ label: string; value: string }> = [
        { label: 'Pendente', value: 'Pendente' },
        { label: 'Aprovado', value: 'Aprovado' },
        { label: 'Vencido', value: 'Vencido' }
    ];

    // keep master copies so filters can be reapplied without losing original lists (attendance-level)
    private allPending: Attendance[] = [];
    private allApproved: Attendance[] = [];

    constructor(
        private svc: PmocClientService,
        private route: ActivatedRoute
    ) {
        // initial empty lists; we'll populate once route params are available
        this.pending = [];
        this.approved = [];
    }

    ngOnInit(): void {
        // sort lists by proximity of next maintenance on init
        // read clientId from route params and load lists filtered by it
        this.route.paramMap.subscribe((pm) => {
            const cid = pm.get('clientId');
            this.clientId = cid;
            // load attendance-level lists for this client and split pending/approved
            const attendances = this.svc.getAttendances(cid || undefined);
            this.allPending = attendances.filter((a) => a.status === 'pending');
            this.allApproved = attendances.filter((a) => a.status === 'approved');
            this.applyFilters();
        });
    }

    // approval dialog state (attendance-level)
    approveSelected: Attendance | null = null;
    approveDialogVisible = false;
    approveConfirmed = false;

    openApprove(p: Attendance) {
        this.approveSelected = p as any;
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
        // Move attendance from pending to approved (local mock update)
        const aid = (this.approveSelected as any).id;
        this.allPending = this.allPending.filter((x) => x.id !== aid);
        // ensure approved has up-to-date object
        const approvedItem = this.approveSelected as any;
        approvedItem.status = 'approved';
        this.allApproved = [approvedItem, ...this.allApproved];
        this.applyFilters();
        this.cancelApprove();
    }

    applyFilters() {
        const term = (this.searchTerm || '').toString().trim().toLowerCase();

        const matches = (item: Attendance) => {
            // search by attendance id, pmoc id or equipamento
            if (term) {
                const id = (item.id || '').toString().toLowerCase();
                const pmocId = (item.pmocId || '').toString().toLowerCase();
                const eq = (item.equipamento || '').toString().toLowerCase();
                if (!id.includes(term) && !pmocId.includes(term) && !eq.includes(term)) return false;
            }
            // status filter
            if (this.selectedStatus) {
                if (this.selectedStatus === 'Vencido') {
                    if (!this.isExpiredSafe(item as any)) return false;
                } else {
                    const label = this.getStatusLabel(item as any);
                    if (label !== this.selectedStatus) return false;
                }
            }
            return true;
        };

        this.pending = this.allPending.filter(matches);
        this.approved = this.allApproved.filter(matches);
        this.sortPendingApproved();
    }

    clearFilters() {
        this.searchTerm = '';
        this.selectedStatus = null;
        this.applyFilters();
    }

    viewDetails(p: Attendance) {
        this.selected = p;
        this.drawerVisible = true;
    }

    closeDetails() {
        this.selected = null;
        this.drawerVisible = false;
    }

    viewArt(p: any) {
        // Attendance links to a PMOC via pmocId; show ART for that PMOC
        this.artSelected = p;
        this.artContent = this.svc.getArtFor(p.pmocId || p.id);
    }

    closeArt() {
        this.artSelected = null;
        this.artContent = null;
    }

    // helper: return true if the given PMOC is currently pending
    isPending(p: any | null): boolean {
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
        if (diffDays < 0) return 'Vencido';
        if (diffDays === 0) return 'Hoje';
        if (diffDays <= 7) return `Em ${diffDays}d`;
        return 'Agendado';
    }

    // Compute effective next maintenance date: prefer explicit proximaManutencao, otherwise compute from dataManutencao + periodicidade
    getEffectiveNextMaintenance(p: PmocSummary): Date | null {
        if (!p) return null;
        if (p.proximaManutencao) return new Date(p.proximaManutencao);
        if (!p.dataManutencao) return null;
        // if periodicidade provided, take the first entry as primary
        const months = this.periodsToMonths(p.periodicidade);
        const base = new Date(p.dataManutencao);
        if (isNaN(base.getTime())) return null;
        const d = new Date(base.getFullYear(), base.getMonth(), base.getDate());
        d.setMonth(d.getMonth() + months);
        return d;
    }

    getEffectiveNextMaintenanceLabel(p: PmocSummary): string {
        const d = this.getEffectiveNextMaintenance(p);
        if (!d) return '—';
        return this.nextMaintenanceLabel(d);
    }

    // CSS class selector for the next-maint row based on urgency
    getNextMaintClass(p: PmocSummary) {
        const d = this.getEffectiveNextMaintenance(p);
        if (!d) return 'next-maint-row';
        if (this.isExpired(d)) return 'next-maint-expired';
        if (this.isNearExpiry(d)) return 'next-maint-alert';
        return 'next-maint-row';
    }

    // convert periodicidade array to months (use first entry or default to 1 month)
    periodsToMonths(periods?: string[] | null): number {
        if (!periods || !periods.length) return 1;
        const p = (periods[0] || '').toString().toUpperCase();
        if (p.includes('TRIM')) return 3;
        if (p.includes('SEM')) return 6;
        if (p.includes('AN') || p.includes('ANO')) return 12;
        return 1;
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

    // returns true if the given date is strictly before today (expired)
    isExpired(dateStr: string | Date): boolean {
        const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
        const today = new Date();
        const nd = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        const td = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
        return nd < td;
    }

    // returns number of days overdue (positive integer) if expired, else 0
    daysOverdue(dateStr: string | Date): number {
        if (!this.isExpired(dateStr)) return 0;
        return Math.abs(this.daysUntil(dateStr));
    }

    // safe wrapper for templates: returns true only if p has proximaManutencao and it's expired
    isExpiredSafe(p: PmocSummary | null): boolean {
        if (!p || !p.proximaManutencao) return false;
        return this.isExpired(p.proximaManutencao as string | Date);
    }

    // (removed inline style helpers) CSS classes now control visual styles and respect prefers-color-scheme.

    // return a human label for the status field of a PMOC
    getStatusLabel(p: PmocSummary | null): string {
        if (!p) return '';
        // assume PMOC has a status property; normalize common English/Portuguese values
        const raw = (p as any).status;
        if (!raw) return this.pending.some((x) => x.id === p.id) ? 'Pendente' : 'Aprovado';
        const s = raw.toString().trim().toLowerCase();
        if (s.includes('aprov') || s.includes('approved')) return 'Aprovado';
        if (s.includes('pend') || s.includes('pending')) return 'Pendente';
        if (s.includes('venc') || s.includes('overdue') || s.includes('expired')) return 'Vencido';
        // fallback: capitalize the raw status
        return raw.toString().charAt(0).toUpperCase() + raw.toString().slice(1);
    }

    // map PMOC status to PrimeNG badge severity
    getStatusSeverity(p: PmocSummary | null): 'success' | 'warn' | 'danger' | 'info' {
        if (!p) return 'info';
        const raw = (p as any).status;
        const status = (raw ? raw.toString() : this.pending.some((x) => x.id === p.id) ? 'Pendente' : 'Aprovado').toLowerCase();
        if (status.includes('aprov') || status.includes('approved')) return 'success';
        if (status.includes('pend') || status.includes('pending')) return 'warn';
        if (status.includes('venc') || status.includes('overdue') || status.includes('expired')) return 'danger';
        return 'info';
    }

    // format periodicidade array into a readable string
    formatPeriodicidade(periods: string[] | undefined | null): string {
        if (!periods || !periods.length) return '';
        return periods.join(', ');
    }

    // equipment status label mapping (matches criarPmoc form options)
    getEquipStatusLabel(p: PmocSummary | null): string {
        if (!p) return '';
        const raw = (p as any).statusEquipamento;
        if (!raw) return '';
        const s = raw.toString().toLowerCase();
        if (s === 'em_operacao' || s.includes('em')) return 'Em operação';
        if (s === 'fora_de_operacao' || s.includes('fora')) return 'Fora de operação';
        return raw.toString();
    }

    getEquipStatusSeverity(p: PmocSummary | null): 'success' | 'warn' | 'danger' | 'info' {
        if (!p) return 'info';
        const raw = (p as any).statusEquipamento;
        const s = raw ? raw.toString().toLowerCase() : '';
        if (s === 'em_operacao' || s.includes('em')) return 'success';
        if (s === 'fora_de_operacao' || s.includes('fora')) return 'danger';
        return 'info';
    }
}
