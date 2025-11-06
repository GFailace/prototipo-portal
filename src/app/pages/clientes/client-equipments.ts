import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PmocScheduleService, Equipment } from '../pmocs/pmoc-schedule.service';

@Component({
    selector: 'app-client-equipments',
    standalone: true,
    imports: [CommonModule, RouterModule, ButtonModule, CardModule, FormsModule, InputTextModule],
    template: `
        <div class="equipments-wrap">
            <div class="equipments-header">
                <p-header>Meus equipamentos</p-header>
            </div>

            <!-- Search toolbar (matches style used in pmoc-client) -->
            <div class="search-bar my-4">
                <span class="p-input-icon-left search-input">
                    <i class="pi pi-search"></i>
                    <input pInputText type="text" placeholder="Pesquisar por ID, cliente ou equipamento" [(ngModel)]="searchTerm" (input)="applyFilters()" />
                </span>
                <div class="select-wrap">
                    <select class="p-inputtext" [(ngModel)]="selectedStatus" (change)="applyFilters()">
                        <option [ngValue]="null">Todos</option>
                        <option *ngFor="let o of statusOptions" [value]="o.value">{{ o.label }}</option>
                    </select>
                </div>
                <button pButton type="button" icon="pi pi-times" class="p-button-text clear-button" (click)="clearFilters()" aria-label="Limpar filtros">Limpar pesquisa</button>
            </div>

            <div *ngIf="!equipments?.length" class="empty">Nenhum equipamento encontrado.</div>

            <div class="list" *ngIf="equipments?.length">
                <div *ngFor="let e of equipments" class="equip-row">
                    <p-card class="equip-pcard">
                        <div class="equip-row-inner">
                            <div class="equip-left">
                                <div class="equip-id">{{ e.id }}</div>
                                <div class="equip-client">{{ e.cliente }}</div>
                                <div class="equip-meta">{{ e.ambiente || '-' }} &middot; {{ e.capacidadeBtus ? e.capacidadeBtus + ' BTUs' : '-' }}</div>
                            </div>
                            <div class="equip-right">
                                <div class="equip-status">Status do equipamento</div>
                                <div class="equip-status-value">{{ e.statusEquipamento === 'fora_de_operacao' ? 'Fora de operação' : 'Em operação' }}</div>
                                <div class="equip-actions">
                                    <a [routerLink]="[e.id, 'pmoc']" pButton type="button" label="Ver PMOC" class="p-button-sm p-button-text"></a>
                                </div>
                            </div>
                        </div>
                    </p-card>
                </div>
            </div>
        </div>
    `,
    styles: [
        `
            .equipments-wrap {
                max-width: 980px;
                margin: 0 auto;
                padding: 0 1rem;
            }

            /* On large screens expand the content area to use available space (leave room for sidebar) */
            @media (min-width: 1200px) {
                .equipments-wrap {
                    max-width: calc(100% - 60px);
                    margin: 0 24px;
                    padding-left: 24px;
                    padding-right: 24px;
                }
            }
            p-header {
                display: block;
                font-size: 1.5rem; /* larger heading to match pmoc-client */
                font-weight: 600;
                color: var(--text-color, inherit);
                margin-bottom: 0.5rem;
                line-height: 1.2;
            }
            p-header.section-header {
                display: block;
                font-size: 1.125rem;
                font-weight: 600;
                color: var(--text-color-secondary, var(--text-color, inherit));
                margin-bottom: 0.25rem;
                line-height: 1.25;
            }
            .empty { color: var(--text-color-secondary); }
            .list { display: flex; flex-direction: column; gap: 1rem; }
            .equip-row { width: 100%; }
            .equip-pcard { padding: 0.5rem; }
            .equip-row-inner { display:flex; align-items:center; justify-content:space-between; gap: 12px; }
            .equip-left { flex: 1 1 auto; }
            .equip-id { font-weight: 700; font-size: 1.05rem; }
            .equip-client { font-size: 0.92rem; color: var(--text-color-secondary); margin-top: 4px; }
            .equip-meta { font-size: 0.86rem; color: var(--text-color-tertiary); margin-top: 6px; }
            .equip-right { display:flex; flex-direction:column; align-items:flex-end; gap:8px; min-width: 150px }
            .equip-status { font-size: 0.82rem; color: var(--text-color-secondary); }
            .equip-status-value { font-weight: 600; }
            .equip-actions { margin-top: 6px; }
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
            .clear-button {
                border-radius: 9999px;
            }
            /* Dark mode adjustments to align with app theme tokens */
            :host-context(.app-dark) .equip-pcard {
                background: var(--surface-card, #0b1220);
                color: var(--text-color, #f3f4f6);
                border: 1px solid var(--surface-border, rgba(255,255,255,0.06));
            }
            :host-context(.app-dark) .equip-client,
            :host-context(.app-dark) .equip-meta {
                color: var(--text-color-secondary, rgba(255,255,255,0.75));
            }
            :host-context(.app-dark) .equip-status { color: var(--text-color-secondary, rgba(255,255,255,0.65)); }
            :host-context(.app-dark) .equip-status-value { color: var(--text-color, #f3f4f6); }
            :host-context(.app-dark) .p-inputtext {
                background: var(--surface-card, #0b1220);
                color: var(--text-color, #f3f4f6);
                border-color: var(--surface-border, rgba(255,255,255,0.06));
            }
            :host-context(.app-dark) .select-wrap select {
                background: var(--surface-card, #0b1220);
                color: var(--text-color, #f3f4f6);
                border-color: var(--surface-border, rgba(255,255,255,0.06));
            }
            :host-context(.app-dark) .select-wrap::after {
                color: var(--p-primary-color, #ff7a18);
                opacity: 0.85;
            }
            @media (max-width: 720px) { .equip-row-inner { flex-direction: column; align-items: stretch; } .equip-right { align-items:flex-start; } }

            /* Mobile-specific adjustments for the search toolbar */
            @media (max-width: 640px) {
                .search-bar {
                    flex-direction: column;
                    align-items: stretch;
                    width: 100%;
                    max-width: none;
                    gap: 0.5rem;
                }
                .p-input-icon-left.search-input {
                    max-width: none;
                    width: 100%;
                }
                .select-wrap {
                    width: 100%;
                }
                .select-wrap select {
                    width: 100%;
                }
                .clear-button {
                    align-self: flex-end;
                    margin-top: 0.25rem;
                }
                /* hide only the clear-button label on very small screens to keep toolbar compact */
                .search-bar .clear-button .p-button-label { display: none; }
            }
        `
    ]
})
export class ClientEquipmentsComponent implements OnInit {
    equipments: Equipment[] = [];
    // master list so filters can be reapplied
    private allEquipments: Equipment[] = [];

    // search / filter controls
    searchTerm: string = '';
    selectedStatus: string | null = null;
    statusOptions: Array<{ label: string; value: string }> = [
        { label: 'Em operação', value: 'em_operacao' },
        { label: 'Fora de operação', value: 'fora_de_operacao' }
    ];
    constructor(private svc: PmocScheduleService) {}

    ngOnInit(): void {
        // For now return all equipments from mock service; in a real app filter by clientId
        this.allEquipments = [...(this.svc.getAllEquipments ? this.svc.getAllEquipments() : [])];
        this.applyFilters();
    }

    applyFilters() {
        const term = (this.searchTerm || '').toString().trim().toLowerCase();
        const matches = (e: Equipment) => {
            if (term) {
                const id = (e.id || '').toString().toLowerCase();
                const cliente = (e.cliente || '').toString().toLowerCase();
                const eq = (e.ambiente || '').toString().toLowerCase();
                const cap = e.capacidadeBtus ? e.capacidadeBtus.toString().toLowerCase() : '';
                if (!id.includes(term) && !cliente.includes(term) && !eq.includes(term) && !cap.includes(term)) return false;
            }
            if (this.selectedStatus) {
                if ((e.statusEquipamento || '') !== this.selectedStatus) return false;
            }
            return true;
        };

        this.equipments = this.allEquipments.filter(matches);
    }

    clearFilters() {
        this.searchTerm = '';
        this.selectedStatus = null;
        this.applyFilters();
    }
}
