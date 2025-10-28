import { Component, OnInit } from '@angular/core';
import { FluidModule } from 'primeng/fluid';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
// DatePicker removed
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TextareaModule } from 'primeng/textarea';
import { FileUploadModule } from 'primeng/fileupload';
import { InputNumberModule } from 'primeng/inputnumber';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { Router } from '@angular/router';
import { PmocService, Pmoc } from './pmoc.service';
import { Observable } from 'rxjs';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// Friendly labels for checklist keys (matches keys defined in pmoc.service)
const CHECKLIST_LABELS: Record<string, string> = {
    chk1: 'Filtro limpo e sem obstruções',
    chk2: 'Níveis de óleo/fluído dentro do esperado',
    chk3: 'Funcionamento do ventilador e motores'
};

@Component({
    selector: 'app-pmocs-list',
    standalone: true,
    imports: [CommonModule, InputTextModule, FluidModule, ButtonModule, SelectModule, FormsModule, ReactiveFormsModule, TextareaModule, TableModule, CheckboxModule, ToastModule, ConfirmDialogModule, InputNumberModule, FileUploadModule],
    template: `<p-fluid>
        <p-toast></p-toast>
        <p-confirmDialog></p-confirmDialog>
        <div class="card">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
                <!-- Search toolbar: searches by ID, equipamento, cliente and filters by status -->
                <div class="search-bar w-full sm:flex-1">
                    <span class="p-input-icon-left search-input">
                        <i class="pi pi-search"></i>
                        <input pInputText type="text" placeholder="Pesquisar por ID, equipamento ou cliente" [(ngModel)]="searchTerm" (input)="applyFilters()" />
                    </span>
                    <div class="controls">
                        <div class="select-wrap">
                            <select class="p-inputtext" [(ngModel)]="selectedStatus" (change)="applyFilters()">
                                <option [ngValue]="null">Todos</option>
                                <option *ngFor="let o of statusOptions" [ngValue]="o.value">{{ o.label }}</option>
                            </select>
                        </div>
                        <button pButton type="button" icon="pi pi-times" class="p-button-text clear-button" (click)="clearFilters()" aria-label="Limpar filtros">Limpar pesquisa</button>
                    </div>
                </div>
                <div class="mt-2 sm:mt-0">
                    <p-button label="Novo PMOC" icon="pi pi-plus" iconPos="left" class="p-button-sm w-full sm:w-auto" (onClick)="goCreate()"></p-button>
                </div>
            </div>

            <div *ngIf="visiblePmocs && visiblePmocs.length > 0; else noPmocs">
                <div class="flex flex-col gap-3">
                    <div *ngFor="let p of visiblePmocs" class="p-4 sm:p-4 rounded border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 shadow-sm sm:shadow-none pmoc-card">
                        <div class="flex justify-between items-start">
                            <div>
                                <div class="font-semibold text-lg pmoc-title">{{ p.cliente }}</div>
                                <div class="text-sm mt-2 pmoc-id">
                                    ID: <strong>{{ p.id }}</strong>
                                </div>
                                <div class="text-sm text-muted pmoc-equip">
                                    Equipamento: <strong>{{ p.equipamento }}</strong>
                                </div>
                                <div class="mt-1">
                                    <span class="text-sm">Status do equipamento:</span>
                                    <span class="ml-2 text-sm font-medium">{{ p.statusEquipamento || '-' }}</span>
                                </div>

                                <div class="text-sm text-muted">
                                    Data Manutenção: <strong>{{ p.dataManutencao | date: 'dd/MM/yyyy' }}</strong>
                                </div>

                                <div *ngIf="p.proximaManutencao" class="text-base mt-1" [ngClass]="isExpired(p.proximaManutencao) ? 'next-maint-expired' : isNearExpiry(p.proximaManutencao) ? 'next-maint-alert' : 'next-maint-row'">
                                    <span class="font-semibold">Próxima manutenção:</span>
                                    <span class="ml-2 font-medium">{{ p.proximaManutencao | date: 'dd/MM/yyyy' }}</span>
                                    <span *ngIf="isExpired(p.proximaManutencao)" class="ml-3 text-sm font-semibold">— Vencido ({{ daysOverdue(p.proximaManutencao) }}d)</span>
                                    <span *ngIf="!isExpired(p.proximaManutencao) && isNearExpiry(p.proximaManutencao)" class="ml-3 text-sm text-muted">— Próxima do vencimento ({{ daysUntil(p.proximaManutencao) }}d)</span>
                                </div>
                            </div>

                            <div class="text-sm sm:text-xs text-muted-color mt-2 sm:mt-0">{{ p.dataManutencao | date: 'dd/MM/yyyy' }}</div>
                        </div>

                        <!-- Responsive footer: status badge + actions -->
                        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pmoc-footer">
                            <div class="text-sm">
                                Responsável: <strong class="ml-1">{{ p.responsavel }}</strong>
                            </div>
                            <div class="flex gap-2">
                                <button pButton type="button" label="Detalhes" class="p-button-text p-button-sm" (click)="toggleExpand(p, $event)"></button>
                                <button pButton type="button" label="Excluir" class="p-button-text p-button-danger p-button-sm" (click)="deletePmoc(p.id)"></button>
                            </div>
                        </div>

                        <div class="expand-panel mt-4 overflow-hidden" [class.open]="expandedPmocId === p.id">
                            <div class="pt-4">
                                <div class="flex items-center justify-between">
                                    <div class="font-semibold text-xl">Detalhes — {{ p.id }}</div>
                                </div>

                                <div class="p-4 rounded border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 mt-4">
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h3 class="font-medium mb-3">Informações Gerais</h3>
                                            <div class="mb-2"><strong>Cliente:</strong> {{ p.cliente }}</div>
                                            <div class="mb-2"><strong>Equipamento:</strong> {{ p.equipamento }}</div>
                                            <div class="mb-2"><strong>Data:</strong> {{ p.dataManutencao | date: 'dd/MM/yyyy' }}</div>
                                            <div class="mb-2"><strong>Próxima Manutenção:</strong> {{ p.proximaManutencao ? (p.proximaManutencao | date: 'dd/MM/yyyy') : '-' }}</div>
                                            <div class="mb-2"><strong>Tipo:</strong> {{ p.tipoManutencao }}</div>
                                            <div class="mb-2"><strong>Status:</strong> {{ p.statusEquipamento }}</div>
                                            <div class="mb-2"><strong>Responsável:</strong> {{ p.responsavel }}</div>
                                            <div class="mb-2"><strong>Periodicidade:</strong> {{ p.periodicidade }}</div>
                                            <div class="whitespace-pre-wrap mb-3"><strong>Observações:</strong> {{ p.observacoes || '-' }}</div>
                                            <div class="mb-3"><strong>Custos:</strong> {{ p.custos || '-' }}</div>
                                            <div class="mb-3"><strong>Checklist - Outros:</strong> {{ p.checklistOutros || '-' }}</div>
                                        </div>

                                        <div>
                                            <div class="mt-2">
                                                <h4 class="font-medium mb-2">Checklist</h4>
                                                <ul class="list-disc ml-6 mt-2">
                                                    <ng-container *ngFor="let item of checklist">
                                                        <li *ngIf="p?.checklist && p.checklist[item.controlName]" class="text-base leading-6 mb-1">{{ item.label }}</li>
                                                    </ng-container>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="flex action-row justify-start gap-2 mt-4">
                                    <p-button label="Exportar" icon="pi pi-print" iconPos="left" (onClick)="exportToPrintFor(p)" styleClass="p-button-sm p-button-outlined action-btn"></p-button>
                                    <p-button label="Download" icon="pi pi-download" iconPos="left" (onClick)="downloadPdfFor(p)" styleClass="p-button-sm p-button-outlined action-btn"></p-button>
                                    <p-button label="Editar" icon="pi pi-pencil" iconPos="left" (onClick)="goEdit(p.id, $event)" styleClass="p-button-sm p-button-outlined action-btn"></p-button>
                                    <p-button label="Fechar" icon="pi pi-times" iconPos="left" (onClick)="closeExpand()" styleClass="p-button-sm p-button-text action-btn"></p-button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ng-template #noPmocs>
                <div class="text-sm text-muted">Nenhum PMOC encontrado.</div>
            </ng-template>
        </div>
    </p-fluid>`,
    styles: [
        `
            /* PMOC list local styles: search bar (same format as pmoc-client) */
            .search-bar {
                display: flex;
                gap: 0.75rem;
                align-items: center;
                max-width: 900px; /* keep the search area from growing too wide on large screens */
                flex-wrap: nowrap; /* avoid wrapping controls on wide screens */
            }
            .p-input-icon-left.search-input {
                flex: 1 1 auto;
                min-width: 0;
                position: relative;
                /* reserve a smaller space for select + clear so the input can grow more on medium/large screens */
                max-width: calc(100% - 160px);
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
                width: 11rem;
                flex: 0 0 auto;
                margin-left: 0.5rem;
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
            .controls {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                flex-shrink: 0;
            }

            .clear-button {
                border-radius: 9999px;
                background: transparent;
                color: var(--p-primary-color, #ff7a18);
                padding: 0.25rem 0.5rem;
                white-space: nowrap; /* keep icon + text on single line */
                margin-left: 0.25rem;
            }
            @media (max-width: 640px) {
                .search-bar {
                    flex-direction: column;
                    align-items: stretch;
                    width: 100%;
                    max-width: none;
                    flex-wrap: wrap; /* allow stack on small screens */
                }
                .select-wrap {
                    width: 100%;
                    margin-left: 0; /* remove left margin when stacked */
                }
                .p-input-icon-left.search-input {
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
            .pmoc-card {
                padding: 0.95rem 1rem;
                margin-top: 0.25rem;
                margin-bottom: 0.25rem;
            }
            .pmoc-title {
                font-size: 1.05rem;
                letter-spacing: -0.2px;
                font-weight: 600;
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

            /* next maintenance visual variants */
            .next-maint-row {
                background-color: var(--surface-card, var(--surface-ground, rgba(0, 0, 0, 0.02))) !important;
                border-left: 4px solid var(--surface-border, rgba(0, 0, 0, 0.06)) !important;
                color: var(--text-color, inherit) !important;
                padding: 0.5rem;
                border-radius: 0.375rem;
            }
            .next-maint-alert {
                background-color: var(--surface-hover, var(--surface-overlay, rgba(255, 245, 230, 0.9))) !important;
                border-left: 4px solid var(--pmoc-next-alert-accent, var(--p-primary-color, rgba(255, 165, 0, 0.7))) !important;
                color: var(--text-color, inherit) !important;
                padding: 0.5rem;
                border-radius: 0.375rem;
                box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
            }
            .next-maint-expired {
                background-color: var(--surface-hover, var(--surface-overlay, rgba(253, 236, 234, 0.98))) !important;
                border-left: 4px solid var(--pmoc-next-expired-accent, rgba(220, 53, 69, 0.9)) !important;
                color: var(--text-color, inherit) !important;
                padding: 0.5rem;
                border-radius: 0.375rem;
                box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
            }

            :host ::ng-deep .pmoc-fileupload .p-fileupload-upload,
            :host ::ng-deep .pmoc-fileupload .p-fileupload-cancel {
                display: none !important;
            }
            :host ::ng-deep .expand-panel {
                transition:
                    max-height 300ms ease,
                    opacity 200ms ease;
                max-height: 0;
                opacity: 0;
            }
            :host ::ng-deep .expand-panel.open {
                max-height: 1200px;
                opacity: 1;
            }
            :host ::ng-deep .expand-panel .p-button {
                margin-left: 6px;
            }
            /* Action row responsive behaviour */
            :host ::ng-deep .action-row {
                display: flex;
                gap: 0.5rem;
                flex-wrap: wrap;
                align-items: center;
            }
            :host ::ng-deep .action-row .p-button {
                min-width: 2.75rem;
                border-radius: 0.375rem;
            }
            :host ::ng-deep .action-row .action-btn.p-button-outlined {
                border-color: rgba(0, 0, 0, 0.08);
            }
            :host ::ng-deep .action-row .action-btn.p-button-primary {
                background: var(--primary-color);
                border-color: var(--primary-color);
                color: #fff;
            }
            /* Responsive: on small screens hide labels and show only icons */
            @media (max-width: 640px) {
                /* keep labels visible on small screens, adjust spacing and wrap */
                :host ::ng-deep .expand-panel .p-button .p-button-label,
                :host ::ng-deep .card .p-button .p-button-label {
                    display: inline-block !important;
                }
                :host ::ng-deep .expand-panel .p-button,
                :host ::ng-deep .card .p-button {
                    padding: 0.4rem 0.6rem !important;
                    font-size: 0.85rem !important;
                }
                :host ::ng-deep .expand-panel.open {
                    max-height: 1600px;
                }
                /* On very small screens wrap action buttons into two columns */
                :host ::ng-deep .action-row {
                    display: grid !important;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 0.5rem !important;
                }
                :host ::ng-deep .action-row .p-button {
                    width: 100% !important;
                    justify-content: flex-start;
                }
                /* Very small screens: stack vertically */
                @media (max-width: 380px) {
                    :host ::ng-deep .action-row {
                        grid-template-columns: 1fr !important;
                    }
                }
            }
        `
    ]
})
export class ListarPmocs {
    pmocs$: Observable<Pmoc[]>;
    selectedPmoc: Pmoc | null = null;
    expandedPmocId: string | null = null;
    editMode = false;
    editForm!: FormGroup;

    // local filtered list and search controls
    allPmocs: Pmoc[] = [];
    visiblePmocs: Pmoc[] = [];
    searchTerm: string = '';
    selectedStatus: string | null = null;
    // reusing existing statusOptions defined further down in the file

    // Options copied from criarPmoc
    // Use the actual status label as the value so filtering compares the same strings
    statusOptions = [
        { label: 'EM OPERAÇÃO', value: 'EM OPERAÇÃO' },
        { label: 'FORA DE OPERAÇÃO', value: 'FORA DE OPERAÇÃO' }
    ];

    clienteOptions = [
        { label: 'BHIO SUPPLY | ESTEIO - RS', value: 'BHIO SUPPLY | ESTEIO - RS' },
        { label: 'BHIO SUPPLY FILIAL | ESTEIO - RS', value: 'BHIO SUPPLY FILIAL | ESTEIO - RS' },
        { label: 'BHIO SUPPLY | CAMPO BOM - RS', value: 'BHIO SUPPLY | CAMPO BOM - RS' }
    ];

    equipamentoOptions = [
        { label: 'AC001 | RECEBIMENTO | 12.000 BTUS', value: 'AC001' },
        { label: 'AC002 | RECEBIMENTO | 18.000 BTUS', value: 'AC002' },
        { label: 'AC003 | ESCRITÓRIO | 9.000 BTUS', value: 'AC003' },
        { label: 'AC004 | SALA REUNIÃO | 24.000 BTUS', value: 'AC004' },
        { label: 'AC005 | ARMAZÉM | 36.000 BTUS', value: 'AC005' },
        { label: 'AC006 | COPA | 7.000 BTUS', value: 'AC006' },
        { label: 'AC007 | LABORATÓRIO | 12.000 BTUS', value: 'AC007' },
        { label: 'AC008 | AUDITÓRIO | 30.000 BTUS', value: 'AC008' },
        { label: 'AC009 | RECEPÇÃO | 9.000 BTUS', value: 'AC009' },
        { label: 'AC010 | SALA TI | 18.000 BTUS', value: 'AC010' },
        { label: 'AC011 | DEPÓSITO | 24.000 BTUS', value: 'AC011' },
        { label: 'AC012 | PRODUÇÃO | 48.000 BTUS', value: 'AC012' },
        { label: 'AC013 | SHOWROOM | 12.000 BTUS', value: 'AC013' },
        { label: 'AC014 | DIRETORIA | 9.000 BTUS', value: 'AC014' },
        { label: 'AC015 | ESTOQUE | 36.000 BTUS', value: 'AC015' },
        { label: 'AC016 | BIBLIOTECA | 9.000 BTUS', value: 'AC016' },
        { label: 'AC017 | LOJA | 18.000 BTUS', value: 'AC017' },
        { label: 'AC018 | CORREDOR | 7.000 BTUS', value: 'AC018' },
        { label: 'AC019 | ENTRADA | 12.000 BTUS', value: 'AC019' },
        { label: 'AC020 | CEO OFFICE | 24.000 BTUS', value: 'AC020' }
    ];

    tipoManutencaoOptions = [
        { label: 'PMOC', value: 'PMOC' },
        { label: 'PREVENTIVA', value: 'PREVENTIVA' },
        { label: 'CORRETIVA', value: 'CORRETIVA' },
        { label: 'PREDITIVA', value: 'PREDITIVA' },
        { label: 'INSTALAÇÃO', value: 'INSTALACAO' },
        { label: 'DESINSTALAÇÃO', value: 'DESINSTALACAO' }
    ];

    periodicidadeOptions = [
        { label: 'MENSAL', value: 'MENSAL' },
        { label: 'TRIMESTRAL', value: 'TRIMESTRAL' },
        { label: 'SEMESTRAL', value: 'SEMESTRAL' },
        { label: 'ANUAL', value: 'ANUAL' }
    ];

    assinaturaOptions = [
        { label: 'Confirmo que a manutenção foi realizada SEM RESTRIÇÕES', value: 'sem_restricoes' },
        { label: 'Confirmo que a manutenção foi realizada COM RESTRIÇÕES, conforme item 7', value: 'com_restricoes' }
    ];

    checklist = [
        { label: 'Limpeza/substituição de filtros de ar', controlName: 'chk1' },
        { label: 'Limpeza das carenagens plásticas da evaporadora', controlName: 'chk2' },
        { label: 'Aplicação de bactericida na serpentina da evaporadora', controlName: 'chk3' },
        { label: 'Verificação de níveis de gás refrigerante', controlName: 'chk4' },
        { label: 'Verificação de componentes da placa/painel elétrico', controlName: 'chk5' },
        { label: 'Verificação de corrente elétrica do equipamento', controlName: 'chk6' },
        { label: 'Verificação de cabeamento elétrico entre as unidades', controlName: 'chk7' },
        { label: 'Verificação/limpeza bandeja de condensados', controlName: 'chk8' },
        { label: 'Verificação infra de drenagem de condensados', controlName: 'chk9' },
        { label: 'Verificação do motor do ventilador da evaporadora', controlName: 'chk10' },
        { label: 'Verificação do motor do ventilador da condensadora', controlName: 'chk11' },
        { label: 'Verificação de ruídos ou vibrações no equipamento', controlName: 'chk12' },
        { label: 'Lavagem da condensadora / escovar / bater ar comprimido', controlName: 'chk13' },
        { label: 'Verificação compressor', controlName: 'chk14' },
        { label: 'Verificação da fixação dos suportes da condensadora', controlName: 'chk15' },
        { label: 'Verificação dos isolamentos térmicos das tubulações', controlName: 'chk16' },
        { label: 'Verificação da bomba de condensados', controlName: 'chk17' }
    ];

    constructor(
        private pmocService: PmocService,
        private fb: FormBuilder,
        private msg: MessageService,
        private confirm: ConfirmationService,
        private router: Router
    ) {
        this.pmocs$ = this.pmocService.pmocs$;

        // build edit form with checklist controls
        const checklistControls = this.checklist.reduce((acc, item) => {
            acc[item.controlName] = [false];
            return acc;
        }, {} as any);

        this.editForm = this.fb.group({
            cliente: [null, Validators.required],
            equipamento: [null, Validators.required],
            dataManutencao: [null, Validators.required],
            tipoManutencao: [null, Validators.required],
            statusEquipamento: [null, Validators.required],
            ...checklistControls,
            checklistOutros: [''],
            observacoes: [''],
            responsavel: [null, Validators.required],
            periodicidade: [null, Validators.required],
            proximaManutencao: [null],
            custos: [null, Validators.min(0)]
        });
    }

    ngOnInit(): void {
        // subscribe to the source observable and keep a local copy for filtering
        this.pmocService.pmocs$.subscribe((list) => {
            this.allPmocs = list || [];
            this.applyFilters();
        });
    }

    applyFilters() {
        const term = (this.searchTerm || '').toString().trim().toLowerCase();
        const matches = (item: Pmoc) => {
            if (term) {
                const id = (item.id || '').toString().toLowerCase();
                const eq = (item.equipamento || '').toString().toLowerCase();
                const cl = (item.cliente || '').toString().toLowerCase();
                if (!id.includes(term) && !eq.includes(term) && !cl.includes(term)) return false;
            }
            if (this.selectedStatus && this.selectedStatus !== null) {
                if ((item.statusEquipamento || '').toLowerCase() !== String(this.selectedStatus).toLowerCase()) return false;
            }
            return true;
        };

        this.visiblePmocs = this.allPmocs.filter(matches);
    }

    clearFilters() {
        this.searchTerm = '';
        this.selectedStatus = null;
        this.applyFilters();
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

    goEdit(id?: string | null, evt?: Event) {
        if (evt && typeof evt.stopPropagation === 'function') evt.stopPropagation();
        if (!id) return;
        this.router.navigateByUrl(`/pages/pmocs/editar/${id}`).catch((err) => console.error('Navigation failed', err));
    }

    viewDetails(p: Pmoc) {
        this.selectedPmoc = { ...p };
        this.editMode = false;
    }

    toggleExpand(p: Pmoc, evt?: Event) {
        if (evt && typeof (evt as any).stopPropagation === 'function') (evt as any).stopPropagation();
        if (!p) return;
        if (this.expandedPmocId === p.id) {
            this.expandedPmocId = null;
            this.selectedPmoc = null;
        } else {
            this.expandedPmocId = p.id;
            this.selectedPmoc = { ...p };
        }
    }

    closeExpand() {
        this.expandedPmocId = null;
        this.selectedPmoc = null;
    }

    closeDetails() {
        this.selectedPmoc = null;
        this.editMode = false;
    }

    checklistKeys(p: Pmoc | null) {
        return p ? Object.keys(p.checklist) : [];
    }

    getChecklistLabel(key: string) {
        return CHECKLIST_LABELS[key] || key;
    }

    getAssinaturaLabel(value: string) {
        if (value === 'sem_restricoes') return 'Confirmo que a manutenção foi realizada SEM RESTRIÇÕES';
        if (value === 'com_restricoes_item_7') return 'Confirmo que a manutenção foi realizada COM RESTRIÇÕES, conforme item 7';
        return value;
    }

    deletePmoc(id: string) {
        this.confirm.confirm({
            message: 'Confirma exclusão deste PMOC?',
            header: 'Confirmação',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.pmocService.remove(id);
                if (this.selectedPmoc?.id === id) this.closeDetails();
                this.msg.add({ severity: 'success', summary: 'Excluído', detail: 'PMOC excluído com sucesso.' });
            }
        });
    }

    goCreate() {
        // navigate to the registrar route
        this.router.navigate(['/pages/pmocs/registrar-pmoc']);
    }

    toggleEdit(force?: boolean) {
        const newMode = typeof force === 'boolean' ? force : !this.editMode;
        // if we're cancelling edit (going from true -> false), show cancel toast
        if (!newMode && this.editMode) {
            this.msg.add({ severity: 'info', summary: 'Cancelado', detail: 'Edição cancelada.' });
        }
        this.editMode = newMode;
        // when entering edit mode, populate the reactive form from selectedPmoc
        if (this.editMode && this.selectedPmoc) {
            this.populateEditForm();
            // ensure fotos array exists so upload thumbnails render
            if (!this.selectedPmoc.fotos) this.selectedPmoc.fotos = [];
        }
    }

    onToggleChecklist(key: string, value: boolean) {
        if (!this.selectedPmoc) return;
        this.selectedPmoc = { ...this.selectedPmoc, checklist: { ...this.selectedPmoc.checklist, [key]: value } };
    }

    saveEdit() {
        if (!this.selectedPmoc) return;
        if (!this.editForm.valid) {
            this.editForm.markAllAsTouched();
            return;
        }

        const formValue = this.editForm.value;

        // Build checklist object from checklist keys
        const checklistObj: Record<string, boolean> = {};
        for (const item of this.checklist) {
            checklistObj[item.controlName] = !!formValue[item.controlName];
        }

        // Ensure date fields are Date objects and convert to ISO strings for the service (use iso-safe parser)
        const dataManutencao = formValue.dataManutencao ? this.parseDateFromIso(formValue.dataManutencao) : null;
        const proximaManutencao = formValue.proximaManutencao ? this.parseDateFromIso(formValue.proximaManutencao) : null;

        const updated: Pmoc = {
            ...this.selectedPmoc,
            cliente: formValue.cliente,
            equipamento: formValue.equipamento,
            dataManutencao: dataManutencao ? (this.formatDateToIso(dataManutencao) as any) : undefined,
            proximaManutencao: proximaManutencao ? (this.formatDateToIso(proximaManutencao) as any) : undefined,
            tipoManutencao: formValue.tipoManutencao,
            statusEquipamento: formValue.statusEquipamento,
            responsavel: formValue.responsavel,
            periodicidade: formValue.periodicidade,
            observacoes: formValue.observacoes,
            custos: this.formatCurrencyBRL(formValue.custos),
            checklist: checklistObj,
            checklistOutros: formValue.checklistOutros || this.selectedPmoc.checklistOutros,
            assinatura: formValue.assinatura || this.selectedPmoc.assinatura,
            fotos: this.selectedPmoc.fotos || []
        };

        this.pmocService.update(this.selectedPmoc.id, updated);
        this.selectedPmoc = { ...updated };
        this.msg.add({ severity: 'success', summary: 'Salvo', detail: 'PMOC salvo com sucesso.' });
        this.editMode = false;
    }

    // File upload helpers (store images as base64 data URLs in selectedPmoc.fotos)
    async onPhotoSelect(event: any) {
        if (!this.selectedPmoc) return;
        const files: File[] = event.currentFiles || event.files || [];
        for (const f of files) {
            try {
                const data = await this.readFileAsDataUrl(f);
                if (!this.selectedPmoc!.fotos) this.selectedPmoc!.fotos = [];
                this.selectedPmoc!.fotos.push(data as string);
            } catch (e) {
                console.warn('Falha ao ler arquivo', e);
            }
        }
    }

    onPhotoRemove(event: any) {
        if (!this.selectedPmoc || !event || !event.file) return;
        const name = event.file.name;
        // remove by matching filename or data URL substring if present
        if (!this.selectedPmoc.fotos) return;
        this.selectedPmoc.fotos = this.selectedPmoc.fotos.filter((src) => !src.includes(name));
    }

    private readFileAsDataUrl(file: File): Promise<string | ArrayBuffer | null> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = (err) => reject(err);
            reader.readAsDataURL(file);
        });
    }

    private populateEditForm() {
        if (!this.selectedPmoc) return;
        const p = this.selectedPmoc;

        const patch: any = {
            cliente: p.cliente || null,
            equipamento: p.equipamento || null,
            dataManutencao: this.normalizeDateValue(p.dataManutencao),
            proximaManutencao: this.normalizeDateValue(p.proximaManutencao),
            tipoManutencao: p.tipoManutencao || null,
            statusEquipamento: p.statusEquipamento || null,
            responsavel: p.responsavel || null,
            periodicidade: p.periodicidade || null,
            observacoes: p.observacoes || null,
            custos: this.parseCurrencyToNumber(p.custos),
            checklistOutros: p.checklistOutros || null,
            assinatura: p.assinatura || null
        };

        // add checklist values
        for (const item of this.checklist) {
            patch[item.controlName] = !!(p.checklist && p.checklist[item.controlName]);
        }

        this.editForm.patchValue(patch);
    }

    private formatCurrencyBRL(value: any): string {
        if (value === null || value === undefined || value === '') return '';
        const num =
            typeof value === 'number'
                ? value
                : parseFloat(
                      String(value)
                          .replace(/[^0-9-,.]/g, '')
                          .replace(',', '.')
                  );
        if (isNaN(num)) return '';
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
    }

    private parseCurrencyToNumber(value: any): number | null {
        if (value === null || value === undefined || value === '') return null;
        if (typeof value === 'number') return value;
        const cleaned = String(value)
            .replace(/\s/g, '')
            .replace(/R\$|\$/g, '')
            .replace(/\./g, '')
            .replace(/,/g, '.');
        const n = parseFloat(cleaned);
        return isNaN(n) ? null : n;
    }

    private pad(n: number) {
        return n < 10 ? '0' + n : String(n);
    }

    private formatDateToIso(d: Date): string {
        return `${d.getFullYear()}-${this.pad(d.getMonth() + 1)}-${this.pad(d.getDate())}`;
    }

    private parseDateFromIso(value: any): Date {
        if (!value) return new Date(NaN);
        if (value instanceof Date) return new Date(value.getFullYear(), value.getMonth(), value.getDate());
        const s = String(value).trim();
        const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (m) {
            const y = parseInt(m[1], 10);
            const mo = parseInt(m[2], 10);
            const d = parseInt(m[3], 10);
            return new Date(y, mo - 1, d);
        }
        const dt = new Date(s);
        if (isNaN(dt.getTime())) return new Date(NaN);
        return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
    }

    private normalizeDateValue(value: any): Date | null {
        // If already a Date, return as-is
        if (value instanceof Date) return value;
        if (!value) return null;

        // If it's a number (timestamp), build Date
        if (typeof value === 'number') return new Date(value);

        // If it's a string, try to parse formats like 'dd/mm/yyyy' or malformed 'dd/mm/yyyyyyyy'
        if (typeof value === 'string') {
            // Attempt to extract dd,MM,yyyy from the string by matching digits separated by '/'
            const parts = value.split('/');
            if (parts.length >= 3) {
                let day = parts[0].replace(/\D/g, '');
                let month = parts[1].replace(/\D/g, '');
                let year = parts[2].replace(/\D/g, '');

                // If year looks duplicated (e.g. '20252025' or '202520252025'), take the first 4 digits
                if (year.length > 4) year = year.slice(0, 4);

                const d = parseInt(day, 10);
                const m = parseInt(month, 10);
                const y = parseInt(year, 10);
                if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
                    return new Date(y, m - 1, d);
                }
            }

            // Fallback: try Date constructor
            // Fallback: try parsing flexible ISO or other formats using parseDateFromIso
            const dt = this.parseDateFromIso(value);
            if (!isNaN(dt.getTime())) return dt;
        }

        return null;
    }

    exportToPrint() {
        if (!this.selectedPmoc) return;
        const p = this.selectedPmoc;
        const checklistHtml = this.checklistKeys(p)
            .map(
                (k) => `
            <tr>
                <td style="padding:6px 12px;border:1px solid #e5e7eb;">${this.getChecklistLabel(k)}</td>
                <td style="padding:6px 12px;border:1px solid #e5e7eb;">${p.checklist[k] ? 'OK' : 'NÃO'}</td>
            </tr>
        `
            )
            .join('');

        const html = this.buildExportHtml(p, checklistHtml);

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;
        printWindow.document.write(html);
        printWindow.document.close();
        // allow styles to load
        setTimeout(() => printWindow.print(), 300);
    }

    // Wrapper that sets selectedPmoc and delegates to exportToPrint
    exportToPrintFor(p: Pmoc) {
        this.selectedPmoc = { ...p };
        this.expandedPmocId = p.id;
        this.exportToPrint();
    }

    // Wrapper that sets selectedPmoc and delegates to downloadPdf
    downloadPdfFor(p: Pmoc) {
        this.selectedPmoc = { ...p };
        this.expandedPmocId = p.id;
        // call async method but don't await here (UI action)
        void this.downloadPdf();
    }

    private buildExportHtml(p: Pmoc, checklistHtml?: string) {
        const checklist =
            checklistHtml ??
            this.checklistKeys(p)
                .map(
                    (k) => `
            <tr>
                <td style="padding:6px 12px;border:1px solid #e5e7eb;">${this.getChecklistLabel(k)}</td>
                <td style="padding:6px 12px;border:1px solid #e5e7eb;">${p.checklist[k] ? 'OK' : 'NÃO'}</td>
            </tr>
        `
                )
                .join('');

        return `
            <html>
            <head>
                <title>PMOC - ${p.id}</title>
                <style>
                    body { font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color:#111827; padding:24px }
                    .header { display:flex; justify-content:space-between; align-items:center; margin-bottom:18px }
                    .card { border:1px solid #e5e7eb; border-radius:8px; padding:12px; background:#fff }
                    table { border-collapse:collapse; width:100%; margin-top:8px }
                    th { text-align:left; padding:8px; background:#f3f4f6 }
                    td { padding:8px; border-top:1px solid #e5e7eb }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <h1 style="margin:0">PMOC — ${p.id}</h1>
                        <div style="color:#6b7280">Cliente: ${p.cliente}</div>
                    </div>
                    <div style="text-align:right">
                        <div style="font-weight:600">Responsável Técnico: ${p.responsavel}</div>
                        <div style="color:#6b7280">${new Intl.DateTimeFormat('pt-BR').format(this.parseDateFromIso(p.dataManutencao))}</div>
                    </div>
                </div>

                <div class="card" style="width:100%; max-width:793px;">
                    <table style="width:100%;">
                        <tr><th>Campo</th><th>Valor</th></tr>
                        <tr><td>Equipamento</td><td>${p.equipamento}</td></tr>
                        <tr><td>Tipo</td><td>${p.tipoManutencao}</td></tr>
                        <tr><td>Status</td><td>${p.statusEquipamento}</td></tr>
                        <tr><td>Periodicidade</td><td>${p.periodicidade}</td></tr>
                        <tr><td>Próxima Manutenção</td><td>${p.proximaManutencao ? new Intl.DateTimeFormat('pt-BR').format(this.parseDateFromIso(p.proximaManutencao)) : '-'}</td></tr>
                        <tr><td>Custos</td><td>${p.custos || '-'}</td></tr>
                    </table>
                </div>

                <div style="height:12px"></div>

                <div class="card">
                    <h3 style="margin:0 0 8px 0">Observações</h3>
                    <div style="white-space:pre-wrap; color:#111827">${p.observacoes || '-'}</div>
                </div>

                <div style="height:12px"></div>

                <div class="card">
                    <h3 style="margin:0 0 8px 0">Checklist</h3>
                    <table>
                        <tr><th>Item</th><th>Resultado</th></tr>
                        ${checklist}
                    </table>
                </div>

                <div style="height:24px"></div>

                <div style="text-align:right; color:#6b7280; margin-top:18px">Gerado por Prototipo-Portal</div>
            </body>
            </html>
        `;
    }

    async downloadPdf() {
        if (!this.selectedPmoc) return;
        const p = this.selectedPmoc;
        const checklistHtml = this.checklistKeys(p)
            .map(
                (k) => `
            <tr>
                <td style="padding:6px 12px;border:1px solid #e5e7eb;">${this.getChecklistLabel(k)}</td>
                <td style="padding:6px 12px;border:1px solid #e5e7eb;">${p.checklist[k] ? 'OK' : 'NÃO'}</td>
            </tr>
        `
            )
            .join('');

        const html = `
            <div style="font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color:#111827; padding:24px; background:#fff; max-width:842px">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px">
                    <div>
                        <h1 style="margin:0">PMOC — ${p.id}</h1>
                        <div style="color:#6b7280">Cliente: ${p.cliente}</div>
                    </div>
                    <div style="text-align:right">
                        <div style="font-weight:600">Responsável Técnico: ${p.responsavel}</div>
                        <div style="color:#6b7280">${new Intl.DateTimeFormat('pt-BR').format(this.parseDateFromIso(p.dataManutencao))}</div>
                    </div>
                </div>

                <div style="border:1px solid #e5e7eb; border-radius:8px; padding:12px; margin-bottom:12px">
                    <table style="border-collapse:collapse; width:100%">
                        <tr><th style="text-align:left; padding:8px; background:#f3f4f6">Campo</th><th style="text-align:left; padding:8px; background:#f3f4f6">Valor</th></tr>
                        <tr><td style="padding:8px;border-top:1px solid #e5e7eb">Equipamento</td><td style="padding:8px;border-top:1px solid #e5e7eb">${p.equipamento}</td></tr>
                        <tr><td style="padding:8px;border-top:1px solid #e5e7eb">Tipo</td><td style="padding:8px;border-top:1px solid #e5e7eb">${p.tipoManutencao}</td></tr>
                        <tr><td style="padding:8px;border-top:1px solid #e5e7eb">Status</td><td style="padding:8px;border-top:1px solid #e5e7eb">${p.statusEquipamento}</td></tr>
                        <tr><td style="padding:8px;border-top:1px solid #e5e7eb">Periodicidade</td><td style="padding:8px;border-top:1px solid #e5e7eb">${p.periodicidade}</td></tr>
                        <tr><td style="padding:8px;border-top:1px solid #e5e7eb">Próxima Manutenção</td><td style="padding:8px;border-top:1px solid #e5e7eb">${p.proximaManutencao ? new Intl.DateTimeFormat('pt-BR').format(this.parseDateFromIso(p.proximaManutencao)) : '-'}</td></tr>
                        <tr><td style="padding:8px;border-top:1px solid #e5e7eb">Custos</td><td style="padding:8px;border-top:1px solid #e5e7eb">${p.custos || '-'}</td></tr>
                        <tr><td style="padding:8px;border-top:1px solid #e5e7eb">Assinatura</td><td style="padding:8px;border-top:1px solid #e5e7eb">${this.getAssinaturaLabel(p.assinatura)}</td></tr>
                    </table>
                </div>

                <div style="border:1px solid #e5e7eb; border-radius:8px; padding:12px; margin-bottom:12px">
                    <h3 style="margin:0 0 8px 0">Observações</h3>
                    <div style="white-space:pre-wrap; color:#111827">${p.observacoes || '-'}</div>
                </div>

                <div style="border:1px solid #e5e7eb; border-radius:8px; padding:12px">
                    <h3 style="margin:0 0 8px 0">Checklist</h3>
                    <table style="border-collapse:collapse; width:100%">
                        <tr><th style="text-align:left; padding:8px; background:#f3f4f6">Item</th><th style="text-align:left; padding:8px; background:#f3f4f6">Resultado</th></tr>
                        ${checklistHtml}
                    </table>
                </div>
            </div>
        `;

        const container = document.createElement('div');
        container.innerHTML = html;
        container.style.background = '#fff';
        container.style.padding = '12px';
        document.body.appendChild(container);

        try {
            // Render container to canvas at high resolution
            const canvas = await html2canvas(container, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });

            // PDF size in pt
            const pdf = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait' });
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            // Canvas size in px
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;

            // Ratio to fit canvas width into PDF page width
            const ratio = pageWidth / canvasWidth;
            const scaledHeight = canvasHeight * ratio;

            const imgData = canvas.toDataURL('image/jpeg', 0.95);

            if (scaledHeight <= pageHeight) {
                // Single page
                pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, scaledHeight);
                this.addPdfFooter(pdf, 1, 1);
            } else {
                // Multiple pages: slice the canvas vertically
                const sliceHeightPx = Math.floor(pageHeight / ratio); // height in canvas px that fits one PDF page
                let y = 0;
                let page = 1;
                const totalPages = Math.ceil(canvasHeight / sliceHeightPx);

                while (y < canvasHeight) {
                    const canvasSlice = document.createElement('canvas');
                    canvasSlice.width = canvasWidth;
                    canvasSlice.height = Math.min(sliceHeightPx, canvasHeight - y);
                    const ctx = canvasSlice.getContext('2d');
                    ctx!.drawImage(canvas, 0, y, canvasWidth, canvasSlice.height, 0, 0, canvasWidth, canvasSlice.height);
                    const sliceData = canvasSlice.toDataURL('image/jpeg', 0.95);

                    const sliceScaledHeight = canvasSlice.height * ratio;
                    if (page > 1) pdf.addPage();
                    pdf.addImage(sliceData, 'JPEG', 0, 0, pageWidth, sliceScaledHeight);
                    this.addPdfFooter(pdf, page, totalPages);
                    y += sliceHeightPx;
                    page++;
                }
            }

            pdf.save(`${p.id}.pdf`);
        } catch (e) {
            console.warn('html2canvas/jsPDF failed, falling back to print', e);
            this.exportToPrint();
        } finally {
            document.body.removeChild(container);
        }
    }

    private addPdfFooter(pdf: any, page: number, totalPages: number) {
        const pageWidth = pdf.internal.pageSize.getWidth();
        const footerText = `Página ${page} / ${totalPages}`;
        pdf.setFontSize(10);
        pdf.setTextColor('#6b7280');
        const textWidth = (pdf as any).getTextWidth(footerText);
        pdf.text(footerText, pageWidth - textWidth - 40, pdf.internal.pageSize.getHeight() - 20);
    }

    getEditControlValue(key: string): boolean {
        if (!this.editForm) return false;
        const c = this.editForm.get(key);
        return !!(c && c.value);
    }
}
