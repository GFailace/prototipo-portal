import { Component, OnInit } from '@angular/core';
import { FluidModule } from 'primeng/fluid';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
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
    imports: [
        CommonModule,
        InputTextModule,
        FluidModule,
        ButtonModule,
        CardModule,
        SelectModule,
        DialogModule,
        FormsModule,
        ReactiveFormsModule,
        TextareaModule,
        TableModule,
        CheckboxModule,
        ToastModule,
        ConfirmDialogModule,
        InputNumberModule,
        FileUploadModule
    ],
    template: `<div>
        <p-toast></p-toast>
        <p-confirmDialog></p-confirmDialog>

        <div class="page-wrap">
            <div class="page-header">
                <p-header>PMOCs</p-header>
            </div>

            <!-- Equipment edit modal -->
            <p-dialog header="Editar equipamento" [(visible)]="equipmentModalVisible" [modal]="true" [style]="{ width: '680px' }" appendTo="body">
                <!-- Only render the form when the FormGroup instance exists to avoid Angular runtime errors -->
                <form *ngIf="modalEquipmentForm" [formGroup]="modalEquipmentForm" class="p-fluid">
                    <div class="formgrid grid fg-compact">
                        <div class="field col-12 md:col-3">
                            <label for="modal-eq-id">ID </label>
                            <input id="modal-eq-id" pInputText type="text" formControlName="id" />
                        </div>
                        <div class="field col-12 md:col-9">
                            <label for="modal-eq-ident">Identificação do ambiente </label>
                            <input id="modal-eq-ident" pInputText type="text" formControlName="identificacao" />
                        </div>

                        <div class="field col-12 md:col-3">
                            <label for="modal-eq-tipo">Tipo de equipamento </label>
                            <p-select id="modal-eq-tipo" [options]="equipamentoTypeOptions" formControlName="equipamentoTipo"></p-select>
                        </div>
                        <div class="field col-12 md:col-3">
                            <label for="modal-eq-btu">Capacidade (BTUs) </label>
                            <p-select id="modal-eq-btu" [options]="btuOptions" formControlName="capacidadeBtus"></p-select>
                        </div>
                        <div class="field col-12 md:col-3">
                            <label for="modal-eq-tec">Tecnologia </label>
                            <p-select id="modal-eq-tec" [options]="tecnologiaOptions" formControlName="tecnologia"></p-select>
                        </div>
                        <div class="field col-12 md:col-3">
                            <label for="modal-eq-gas">Gás </label>
                            <p-select id="modal-eq-gas" [options]="gasOptions" formControlName="tipoGas"></p-select>
                        </div>

                        <div class="field col-12 md:col-3">
                            <label for="modal-eq-ocup">Ocupantes </label>
                            <p-inputNumber inputId="modal-eq-ocup" formControlName="ocupantes" [useGrouping]="false"></p-inputNumber>
                        </div>
                        <div class="field col-12 md:col-3">
                            <label for="modal-eq-area">Área (m²) </label>
                            <p-inputNumber inputId="modal-eq-area" formControlName="areaClimatizada" [useGrouping]="false"></p-inputNumber>
                        </div>
                    </div>
                </form>

                <ng-template pTemplate="footer">
                    <div class="flex justify-end gap-2">
                        <button pButton type="button" class="p-button-sm p-button-primary flex-none whitespace-nowrap" (click)="saveEquipmentEdit(modalPmoc!, modalIndex!, $event)">Salvar</button>
                        <button pButton type="button" class="p-button-sm p-button-text flex-none whitespace-nowrap" (click)="equipmentModalVisible = false">Cancelar</button>
                    </div>
                </ng-template>
            </p-dialog>

            <!-- Search toolbar (reuses shared .search-bar styles) -->
            <div class="search-bar my-4">
                <span class="p-input-icon-left search-input">
                    <i class="pi pi-search"></i>
                    <input pInputText type="text" placeholder="Pesquisar por ID do PMOC ou cliente" [(ngModel)]="searchTerm" (input)="applyFilters()" />
                </span>
                <div class="select-wrap">
                    <select class="p-inputtext" [(ngModel)]="selectedStatus" (change)="applyFilters()">
                        <option [ngValue]="null">Todos</option>
                        <option *ngFor="let o of statusOptions" [ngValue]="o.value">{{ o.label }}</option>
                    </select>
                </div>
                <button pButton type="button" icon="pi pi-times" class="p-button-text clear-button" (click)="clearFilters()" aria-label="Limpar filtros">Limpar pesquisa</button>
            </div>

            <div class="card">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
                    <!-- Button: appears below on mobile and on the right on larger screens -->
                    <div class="button-wrap">
                        <p-button label="Novo PMOC" icon="pi pi-plus" iconPos="left" class="p-button-sm" (onClick)="goCreate()"></p-button>
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

                                    <div class="text-sm text-muted mt-1">
                                        Criação: <strong>{{ getCreatedAt(p) | date: 'dd/MM/yyyy' }}</strong> &middot; Validade: <strong>{{ getValidityDate(p) | date: 'dd/MM/yyyy' }}</strong>
                                    </div>

                                    <div class="mt-1">
                                        <span class="text-sm">Status:</span>
                                        <span class="ml-2 text-sm font-medium">{{ getPmocStatus(p) }}</span>
                                    </div>
                                    <div class="mt-1 text-sm">
                                        <span class="text-sm"
                                            >Responsável: <strong class="ml-1">{{ p.responsavel }}</strong></span
                                        >
                                    </div>
                                </div>

                                <div class="text-sm sm:text-xs text-muted-color mt-2 sm:mt-0">{{ p.dataManutencao | date: 'dd/MM/yyyy' }}</div>
                            </div>

                            <!-- Equipamentos accordion (collapsed by default). Placed as the last visible section inside the card. -->
                            <div class="equip-accordion mt-3">
                                <!-- Summary / toggle line -->
                                <div class="text-sm text-muted">
                                    Equipamentos: <strong>{{ p.equipments?.length || (p.equipamento ? 1 : 0) }}</strong>
                                    <a class="p-button-text p-button-sm ml-2 u-cursor-pointer" (click)="toggleExpand(p, $event)" role="button" [attr.aria-expanded]="expandedPmocId === p.id">{{
                                        expandedPmocId === p.id ? 'Ocultar equipamentos' : 'Ver equipamentos'
                                    }}</a>
                                </div>

                                <div class="expand-panel mt-3 overflow-hidden" [class.open]="expandedPmocId === p.id">
                                    <div class="flex flex-col gap-2">
                                        <ng-container *ngIf="p.equipments && p.equipments.length; else legacyEquipCompact">
                                            <div *ngFor="let eq of p.equipments; let i = index" class="equip-compact-item">
                                                <!-- read-only view -->
                                                <div *ngIf="!(editingEquipment.pmocId === p.id && editingEquipment.index === i)">
                                                    <div class="equip-compact-left">
                                                        <div class="font-semibold">{{ eq.id }} — {{ eq.descricao || '-' }}</div>

                                                        <div class="text-sm text-muted mt-1">
                                                            <span
                                                                >Tipo: <strong>{{ eq.equipamentoTipo || '-' }}</strong></span
                                                            >
                                                            <span class="mx-2">·</span>
                                                            <span
                                                                >Capacidade: <strong>{{ eq.capacidadeBtus ? eq.capacidadeBtus + ' BTUs' : '-' }}</strong></span
                                                            >
                                                        </div>

                                                        <div class="text-sm text-muted mt-1">
                                                            <span
                                                                >Tecnologia: <strong>{{ eq.tecnologia || '-' }}</strong></span
                                                            >
                                                            <span class="mx-2">·</span>
                                                            <span
                                                                >Gás: <strong>{{ eq.tipoGas || '-' }}</strong></span
                                                            >
                                                        </div>

                                                        <div class="text-sm text-muted mt-1">
                                                            <span
                                                                >Ocupantes: <strong>{{ eq.ocupantes !== undefined && eq.ocupantes !== null ? eq.ocupantes : '-' }}</strong></span
                                                            >
                                                            <span class="mx-2">·</span>
                                                            <span
                                                                >Área: <strong>{{ eq.areaClimatizada ? eq.areaClimatizada + ' m²' : '-' }}</strong></span
                                                            >
                                                        </div>

                                                        <div *ngIf="eq.atendimentos && eq.atendimentos.length" class="text-sm mt-1">
                                                            Último atendimento: <strong>{{ eq.atendimentos[eq.atendimentos.length - 1].dataAtendimento | date: 'dd/MM/yyyy' }}</strong>
                                                        </div>
                                                    </div>
                                                    <div class="mt-4">
                                                        <button pButton type="button" class="p-button-sm p-button-outlined mr-2 flex-none whitespace-nowrap" (click)="startEditEquipment(p, i, $event)">Editar</button>
                                                                            <button pButton type="button" class="p-button-sm p-button-outlined flex-none whitespace-nowrap" (click)="registerAttendance(p.id, eq.id)">Registrar atendimento</button>
                                                    </div>
                                                </div>

                                                <!-- edit mode is handled in a modal dialog now -->
                                            </div>
                                        </ng-container>
                                        <ng-template #legacyEquipCompact>
                                            <div class="equip-compact-item">
                                                <div class="equip-compact-left">
                                                    <div class="font-semibold">{{ p.equipamento || '-' }}</div>
                                                </div>
                                                <div class="equip-compact-actions">
                                                        <button pButton type="button" class="p-button-sm p-button-outlined flex-none whitespace-nowrap" (click)="registerAttendance(p.id, p.equipamento)">Registrar atendimento</button>
                                                </div>
                                            </div>
                                        </ng-template>
                                    </div>
                                </div>
                            </div>

                            <!-- Responsive footer: status badge + actions -->
                            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pmoc-footer">
                                <div class="flex gap-2">
                                    <button pButton type="button" icon="pi pi-trash" iconPos="left" class="p-button-text p-button-danger p-button-sm flex-none whitespace-nowrap" (click)="deletePmoc(p.id)">Excluir</button>
                                </div>
                            </div>

                            <!-- Details panel removed: equipment accordion above replaces the previous detailed expand panel. Keep other actions available on the card footer. -->
                        </div>
                    </div>
                </div>
                <ng-template #noPmocs>
                    <div class="text-sm text-muted">Nenhum PMOC encontrado.</div>
                </ng-template>
            </div>
        </div>
    </div>`,
    styles: [
        `
            /* Search bar styles have been centralized in src/app/shared/_searchbar.scss
               and imported globally in src/assets/styles.scss. Keep that single source of truth
               to avoid duplication. Small component-specific overrides remain below. */

            /* Ensure the 'Novo PMOC' button remains full-width on small screens */
            .button-wrap .p-button {
                display: inline-flex;
            }
            @media (max-width: 640px) {
                .button-wrap .p-button {
                    width: 100%;
                }
            }

            .page-wrap {
                max-width: 980px;
                margin: 0 auto;
            }

            p-header {
                display: block;
                font-size: 1.5rem;
                font-weight: 600;
                color: var(--text-color, inherit);
                margin-bottom: 0.5rem;
                line-height: 1.2;
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

            /* Equipment list item styling to match app cards */
            .equip-list-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
                padding: 0.6rem;
                border-radius: 0.375rem;
                border: 1px solid var(--surface-border, rgba(0, 0, 0, 0.06));
                background: var(--surface-card, var(--surface-ground, #fff));
            }
            .equip-left .font-semibold {
                font-size: 0.98rem;
            }
            .equip-left .text-sm {
                margin-top: 4px;
                color: var(--text-color-secondary);
            }
            .equip-actions {
                min-width: 160px;
                display: flex;
                justify-content: flex-end;
            }

            /* p-card adjustments for equipment items */
            .equip-card ::ng-deep .p-card-title {
                font-weight: 600;
                font-size: 1rem;
            }
            .equip-card {
                border-radius: 0.5rem;
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

            /* Compact equipment list (always visible within the PMOC card) */
            .equip-compact-list {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }
            .equip-compact-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
                padding: 0.55rem;
                border-radius: 0.375rem;
                border: 1px solid var(--surface-border, rgba(0, 0, 0, 0.06));
                background: var(--surface-card, var(--surface-ground, #fff));
            }
            .equip-compact-left .font-semibold {
                font-size: 0.98rem;
            }
            .equip-compact-left .text-sm {
                margin-top: 4px;
                color: var(--text-color-secondary);
            }
            .equip-compact-actions {
                display: flex;
                gap: 0.5rem;
                flex: 0 0 260px; /* reserve a block for action buttons */
                justify-content: flex-end;
                align-items: center;
            }

            @media (max-width: 640px) {
                .equip-compact-item {
                    flex-direction: column;
                    align-items: flex-start;
                }
                .equip-compact-actions {
                    width: 100%;
                    display: flex;
                    justify-content: flex-start;
                    margin-top: 0.5rem;
                    gap: 0.5rem;
                }
                .equip-compact-actions .p-button {
                    width: 100%;
                }
            }

            /* Modal form styles moved to global SCSS: src/assets/pmocs/_pmoc-modal.scss */
        `
    ]
})
export class ListarPmocs {
    // equipment edit state: map pmocId -> array of FormGroups for each equipment
    equipmentEditForms: Record<string, any[]> = {};
    // currently editing equipment (pmoc id and equipment index) - kept for legacy inline but now we use modal
    editingEquipment: { pmocId?: string; index?: number } = {};

    // modal editor state
    equipmentModalVisible: boolean = false;
    modalEquipmentForm!: FormGroup;
    modalPmoc?: Pmoc | null = null;
    modalIndex?: number | null = null;

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

    // equipment type & select options mirrored from criarPmoc
    equipamentoTypeOptions = [
        { label: 'Wi-Hall', value: 'wi-hall' },
        { label: 'Built-in', value: 'built-in' },
        { label: 'Self', value: 'self' },
        { label: 'Cassete', value: 'cassete' },
        { label: 'ACJ', value: 'acj' },
        { label: 'MultiSplit', value: 'multisplit' }
    ];

    tecnologiaOptions = [
        { label: 'Convencional', value: 'convencional' },
        { label: 'Inverter', value: 'inverter' }
    ];

    gasOptions = [
        { label: 'R22', value: 'R22' },
        { label: 'R32', value: 'R32' },
        { label: 'R410', value: 'R410' }
    ];

    btuOptions = [
        { label: '9000 Btus', value: 9000 },
        { label: '12000 Btus', value: 12000 },
        { label: '18000 Btus', value: 18000 },
        { label: '24000 Btus', value: 24000 },
        { label: '30000 Btus', value: 30000 },
        { label: '36000 Btus', value: 36000 },
        { label: '42000 Btus', value: 42000 },
        { label: '58000 Btus', value: 58000 },
        { label: '60000 Btus', value: 60000 }
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

    // create a FormGroup for editing/creating an equipment (mirrors criarPmoc.createEquipmentGroup)
    private createEquipmentGroup(initial?: any) {
        return this.fb.group({
            // id should not be editable by the user - keep the control disabled
            id: [{ value: initial?.id || '', disabled: true }],
            identificacao: [initial?.identificacao || '', Validators.required],
            ocupantes: [initial?.ocupantes || null],
            ocupantesTipo: [initial?.ocupantesTipo || 'fixos'],
            areaClimatizada: [initial?.areaClimatizada || null],
            equipamentoTipo: [initial?.equipamentoTipo || '', Validators.required],
            capacidadeBtus: [initial?.capacidadeBtus || null],
            tecnologia: [initial?.tecnologia || null],
            tipoGas: [initial?.tipoGas || null]
        });
    }

    // initialize edit forms for a PMOC (called when expanding or when starting an edit)
    private ensureEquipmentEditForms(pmoc: Pmoc) {
        if (!pmoc || !pmoc.id) return;
        if (this.equipmentEditForms[pmoc.id]) return;
        const arr: any[] = [];
        const eqs = pmoc.equipments && Array.isArray(pmoc.equipments) ? pmoc.equipments : [];
        for (const eq of eqs) {
            arr.push(this.createEquipmentGroup(eq));
        }
        this.equipmentEditForms[pmoc.id] = arr;
    }

    // return the FormGroup for a given pmoc/equipment index (creates if missing)
    getEquipmentEditForm(pmocId: string, index: number) {
        const arr = this.equipmentEditForms[pmocId] || [];
        if (!arr[index]) {
            arr[index] = this.createEquipmentGroup();
            this.equipmentEditForms[pmocId] = arr;
        }
        return arr[index];
    }

    startEditEquipment(pmoc: Pmoc, index: number, evt?: Event) {
        if (evt && typeof evt.stopPropagation === 'function') evt.stopPropagation();
        if (!pmoc || !pmoc.id) return;
        // open modal editor for this equipment
        this.ensureEquipmentEditForms(pmoc);
        const eq = pmoc.equipments && pmoc.equipments[index] ? pmoc.equipments[index] : null;
        const fg = this.getEquipmentEditForm(pmoc.id, index);
        if (eq) {
            fg.patchValue({
                id: eq.id || '',
                identificacao: eq.descricao || '',
                ocupantes: eq.ocupantes ?? null,
                ocupantesTipo: (eq as any).ocupantesTipo || 'fixos',
                areaClimatizada: eq.areaClimatizada ?? null,
                equipamentoTipo: eq.equipamentoTipo || '',
                capacidadeBtus: eq.capacidadeBtus ?? null,
                tecnologia: eq.tecnologia || null,
                tipoGas: eq.tipoGas || null
            });
        }

        this.modalEquipmentForm = fg;
        this.modalPmoc = pmoc;
        this.modalIndex = index;
        this.equipmentModalVisible = true;
    }

    cancelEditEquipment(evt?: Event) {
        if (evt && typeof evt.stopPropagation === 'function') evt.stopPropagation();
        this.editingEquipment = {};
    }

    saveEquipmentEdit(pmoc: Pmoc, index: number, evt?: Event) {
        if (evt && typeof evt.stopPropagation === 'function') evt.stopPropagation();
        if (!pmoc || !pmoc.id) return;
        const fg = this.getEquipmentEditForm(pmoc.id, index);
        if (!fg || !fg.valid) {
            fg.markAllAsTouched?.();
            this.msg.add({ severity: 'warn', summary: 'Validação', detail: 'Preencha os campos obrigatórios do equipamento.' });
            return;
        }
    // include disabled controls (id is disabled) when reading values
    const val = fg.getRawValue();
        // clone pmoc and its equipments array
        const updatedPmoc: Pmoc = { ...pmoc };
        const equipments = updatedPmoc.equipments && Array.isArray(updatedPmoc.equipments) ? updatedPmoc.equipments.slice() : [];
        equipments[index] = {
            id: val.id || equipments[index]?.id || `AC${String(index + 1).padStart(3, '0')}`,
            descricao: val.identificacao || equipments[index]?.descricao || '',
            capacidadeBtus: val.capacidadeBtus ?? equipments[index]?.capacidadeBtus,
            statusEquipamento: equipments[index]?.statusEquipamento || 'EM OPERAÇÃO',
            atendimentos: equipments[index]?.atendimentos || [],
            equipamentoTipo: val.equipamentoTipo || equipments[index]?.equipamentoTipo,
            tecnologia: val.tecnologia || equipments[index]?.tecnologia,
            tipoGas: val.tipoGas || equipments[index]?.tipoGas,
            ocupantes: val.ocupantes ?? equipments[index]?.ocupantes,
            areaClimatizada: val.areaClimatizada ?? equipments[index]?.areaClimatizada
        } as any;
        updatedPmoc.equipments = equipments;
        this.pmocService.update(updatedPmoc.id, { equipments: updatedPmoc.equipments });
        this.selectedPmoc = { ...updatedPmoc };
        this.msg.add({ severity: 'success', summary: 'Salvo', detail: 'Equipamento atualizado.' });
        // close modal and reset modal-related state
        this.editingEquipment = {};
        this.equipmentModalVisible = false;
        this.modalPmoc = null;
        this.modalIndex = null;
        // clear modal form reference so template *ngIf hides it
        this.modalEquipmentForm = null as any;
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
                const cl = (item.cliente || '').toString().toLowerCase();
                // only match by PMOC id or cliente as requested
                if (!id.includes(term) && !cl.includes(term)) return false;
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

    // --- PMOC helpers: creation, validity and next maintenance ---
    getCreatedAt(p: Pmoc): Date {
        const v = (p as any).createdAt || p.dataManutencao || new Date().toISOString();
        return this.parseDateFromIso(v);
    }

    getValidityDate(p: Pmoc): Date {
        // If explicit validade set, use it; otherwise createdAt + 12 months
        if ((p as any).validade) return this.parseDateFromIso((p as any).validade);
        const created = this.getCreatedAt(p);
        if (isNaN(created.getTime())) return new Date(NaN);
        const d = new Date(created.getTime());
        d.setFullYear(d.getFullYear() + 1);
        return d;
    }

    getPmocStatus(p: Pmoc): string {
        const val = this.getValidityDate(p);
        if (isNaN(val.getTime())) return '-';
        return this.isExpired(val) ? 'CONCLUÍDO' : 'EM DIA';
    }

    getNextMaintenance(p: Pmoc): string | null {
        const candidates: Date[] = [];

        // pmoc-level proximaManutencao
        if (p.proximaManutencao) {
            const d = this.parseDateFromIso(p.proximaManutencao);
            if (!isNaN(d.getTime())) candidates.push(d);
        }

        // equipments' attendimentos
        if ((p as any).equipments && Array.isArray((p as any).equipments)) {
            for (const eq of (p as any).equipments as any[]) {
                if (eq.atendimentos && Array.isArray(eq.atendimentos)) {
                    for (const a of eq.atendimentos) {
                        if (a.proximaManutencao) {
                            const d = this.parseDateFromIso(a.proximaManutencao);
                            if (!isNaN(d.getTime())) candidates.push(d);
                        }
                    }
                }
            }
        }

        if (!candidates.length) return null;

        // return the earliest date (nearest in time) among candidates
        candidates.sort((a, b) => a.getTime() - b.getTime());
        return this.formatDateToIso(candidates[0]);
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
        return p && p.checklist ? Object.keys(p.checklist) : [];
    }

    getChecklistLabel(key: string) {
        return CHECKLIST_LABELS[key] || key;
    }

    isChecklistChecked(p: Pmoc | null, key: string) {
        return !!(p && p.checklist && p.checklist[key]);
    }

    registerAttendance(pmocId: string, equipamentoId?: string) {
        // Prefer param-based route: /pages/:id_cliente/pmocs/:id_pmoc/equipamentos/:id_equipamento/registrar-atendimento
    const pmoc = this.allPmocs.find((p) => p.id === pmocId) || null;
    // prefer clientId (UUID) in routes; fall back to encoded client name only if clientId is missing
    const clientParam = (pmoc && pmoc.clientId) ? encodeURIComponent(pmoc.clientId) : (pmoc && pmoc.cliente ? encodeURIComponent(pmoc.cliente) : 'unknown-client');

        try {
            if (equipamentoId) {
                this.router
                    .navigate([`/pages/cliente/${clientParam}/pmocs/${pmocId}/equipamentos/${encodeURIComponent(equipamentoId)}/registrar-atendimento`])
                    .catch((err) => console.error('Navigation to registrar-atendimento failed', err));
            } else {
                this.router
                    .navigate([`/pages/cliente/${clientParam}/pmocs/${pmocId}/registrar-atendimento`])
                    .catch((err) => console.error('Navigation to registrar-atendimento failed', err));
            }
        } catch (err) {
            // fallback to previous query param behavior
            const params: any = { pmocId };
            if (equipamentoId) params.equipamentoId = equipamentoId;
            this.router.navigate(['/pages/pmocs/registrar-atendimento'], { queryParams: params }).catch((e) => console.error('Navigation fallback failed', e));
        }
    }

    getAssinaturaLabel(value?: string) {
        if (!value) return '-';
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
                <td class="table-cell-pad">${this.getChecklistLabel(k)}</td>
                <td class="table-cell-pad">${p.checklist && p.checklist[k] ? 'OK' : 'NÃO'}</td>
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
                <td class="table-cell-pad">${this.getChecklistLabel(k)}</td>
                <td class="table-cell-pad">${p.checklist && p.checklist[k] ? 'OK' : 'NÃO'}</td>
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
                    /* helper classes mirrored from global styles to keep generated HTML self-contained */
                    .header-title { margin: 0 }
                    .text-muted-accent { color: #6b7280 }
                    .text-right { text-align: right }
                    .font-600 { font-weight: 600 }
                    .export-card { width: 100%; max-width: 793px }
                    .t-full { width: 100% }
                    .spacer-12 { height: 12px }
                    .spacer-24 { height: 24px }
                    .section-title { margin: 0 0 8px 0 }
                    .pre-wrap { white-space: pre-wrap; color: #111827 }
                    .table-cell-pad { padding:6px 12px; border:1px solid #e5e7eb }
                    .mt-18 { margin-top: 18px }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <h1 class="header-title">PMOC — ${p.id}</h1>
                        <div class="text-muted-accent">Cliente: ${p.cliente}</div>
                    </div>
                    <div class="text-right">
                        <div class="font-600">Responsável Técnico: ${p.responsavel}</div>
                        <div class="text-muted-accent">${new Intl.DateTimeFormat('pt-BR').format(this.parseDateFromIso(p.dataManutencao))}</div>
                    </div>
                </div>

                <div class="card export-card">
                    <table class="t-full">
                        <tr><th>Campo</th><th>Valor</th></tr>
                        <tr><td>Equipamento</td><td>${p.equipamento}</td></tr>
                        <tr><td>Tipo</td><td>${p.tipoManutencao}</td></tr>
                        <tr><td>Status</td><td>${p.statusEquipamento}</td></tr>
                        <tr><td>Periodicidade</td><td>${p.periodicidade}</td></tr>
                        <tr><td>Próxima Manutenção</td><td>${p.proximaManutencao ? new Intl.DateTimeFormat('pt-BR').format(this.parseDateFromIso(p.proximaManutencao)) : '-'}</td></tr>
                        <tr><td>Custos</td><td>${p.custos || '-'}</td></tr>
                    </table>
                </div>

                <div class="spacer-12"></div>

                <div class="card">
                    <h3 class="section-title">Observações</h3>
                    <div class="pre-wrap">${p.observacoes || '-'}</div>
                </div>

                <div class="spacer-12"></div>

                <div class="card">
                    <h3 class="section-title">Checklist</h3>
                    <table>
                        <tr><th>Item</th><th>Resultado</th></tr>
                        ${checklist}
                    </table>
                </div>

                <div class="spacer-24"></div>

                <div class="text-right text-muted-accent mt-18">Gerado por Prototipo-Portal</div>
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
                <td class="table-cell-pad">${this.getChecklistLabel(k)}</td>
                <td class="table-cell-pad">${p.checklist && p.checklist[k] ? 'OK' : 'NÃO'}</td>
            </tr>
        `
            )
            .join('');

        const html = `
            <div class="export-card" style="font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color:#111827; padding:24px; background:#fff; max-width:842px">
                <div class="header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px">
                    <div>
                        <h1 class="header-title">PMOC — ${p.id}</h1>
                        <div class="text-muted-accent">Cliente: ${p.cliente}</div>
                    </div>
                    <div class="text-right">
                        <div class="font-600">Responsável Técnico: ${p.responsavel}</div>
                        <div class="text-muted-accent">${new Intl.DateTimeFormat('pt-BR').format(this.parseDateFromIso(p.dataManutencao))}</div>
                    </div>
                </div>

                <div class="card" style="margin-bottom:12px">
                    <table style="border-collapse:collapse; width:100%">
                        <tr><th class="table-th">Campo</th><th class="table-th">Valor</th></tr>
                        <tr><td class="table-td">Equipamento</td><td class="table-td">${p.equipamento}</td></tr>
                        <tr><td class="table-td">Tipo</td><td class="table-td">${p.tipoManutencao}</td></tr>
                        <tr><td class="table-td">Status</td><td class="table-td">${p.statusEquipamento}</td></tr>
                        <tr><td class="table-td">Periodicidade</td><td class="table-td">${p.periodicidade}</td></tr>
                        <tr><td class="table-td">Próxima Manutenção</td><td class="table-td">${p.proximaManutencao ? new Intl.DateTimeFormat('pt-BR').format(this.parseDateFromIso(p.proximaManutencao)) : '-'}</td></tr>
                        <tr><td class="table-td">Custos</td><td class="table-td">${p.custos || '-'}</td></tr>
                        <tr><td class="table-td">Assinatura</td><td class="table-td">${this.getAssinaturaLabel(p.assinatura)}</td></tr>
                    </table>
                </div>

                <div class="card" style="margin-bottom:12px">
                    <h3 class="section-title">Observações</h3>
                    <div class="pre-wrap">${p.observacoes || '-'}</div>
                </div>

                <div class="card">
                    <h3 class="section-title">Checklist</h3>
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
