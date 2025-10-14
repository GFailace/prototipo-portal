import { Component } from '@angular/core';
import { FluidModule } from 'primeng/fluid';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { TextareaModule } from 'primeng/textarea';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';

@Component({
    selector: 'app-pmocs-list',
    standalone: true,
    imports: [CommonModule, InputTextModule, FluidModule, ButtonModule, SelectModule, FormsModule, TextareaModule, TableModule],
    template: `<p-fluid>
        <div class="card">
            <div class="flex items-center justify-between mb-4">
                <div class="font-semibold text-2xl">Lista de PMOCs</div>
                <p-button label="Novo PMOC" class="p-button-sm"></p-button>
            </div>

            <p-table [value]="pmocs" class="p-datatable-sm">
                <ng-template pTemplate="header">
                    <tr>
                        <th>ID</th>
                        <th>Cliente</th>
                        <th>Equipamento</th>
                        <th>Data</th>
                        <th>Responsável</th>
                        <th>Ações</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-p>
                    <tr>
                        <td>{{ p.id }}</td>
                        <td>{{ p.cliente }}</td>
                        <td>{{ p.equipamento }}</td>
                        <td>{{ p.dataManutencao }}</td>
                        <td>{{ p.responsavel }}</td>
                        <td>
                            <p-button label="Ver detalhes" (onClick)="viewDetails(p)" class="p-button-text"></p-button>
                        </td>
                    </tr>
                </ng-template>
            </p-table>

            <div *ngIf="selectedPmoc" class="mt-6 card">
                <div class="flex items-center justify-between">
                    <div class="font-semibold text-xl">Detalhes — {{ selectedPmoc.id }}</div>
                    <p-button label="Fechar" (onClick)="closeDetails()" class="p-button-text"></p-button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                        <div><strong>Cliente:</strong> {{ selectedPmoc.cliente }}</div>
                        <div><strong>Equipamento:</strong> {{ selectedPmoc.equipamento }}</div>
                        <div><strong>Data:</strong> {{ selectedPmoc.dataManutencao }}</div>
                        <div><strong>Próxima Manutenção:</strong> {{ selectedPmoc.proximaManutencao || '-' }}</div>
                        <div><strong>Tipo:</strong> {{ selectedPmoc.tipoManutencao }}</div>
                        <div><strong>Status:</strong> {{ selectedPmoc.statusEquipamento }}</div>
                        <div><strong>Responsável:</strong> {{ selectedPmoc.responsavel }}</div>
                        <div><strong>Periodicidade:</strong> {{ selectedPmoc.periodicidade }}</div>
                    </div>
                    <div>
                        <div><strong>Observações:</strong></div>
                        <div class="whitespace-pre-wrap">{{ selectedPmoc.observacoes }}</div>
                        <div class="mt-3"><strong>Custos:</strong> {{ selectedPmoc.custos }}</div>
                        <div class="mt-3"><strong>Assinatura:</strong> {{ getAssinaturaLabel(selectedPmoc.assinatura) }}</div>
                        <div class="mt-3"><strong>Checklist - Outros:</strong> {{ selectedPmoc.checklistOutros || '-' }}</div>
                        <div class="mt-3">
                            <strong>Checklist:</strong>
                            <ul class="list-disc ml-6 mt-2">
                                <li *ngFor="let k of checklistKeys(selectedPmoc)">{{ k }}: {{ selectedPmoc.checklist[k] ? 'OK' : 'NÃO' }}</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </p-fluid>`
})
export class ListarPmocs {
    pmocs = [
        {
            id: 'PMOC-001',
            cliente: 'BHIO SUPPLY | ESTEIO - RS',
            equipamento: 'AC001 | RECEBIMENTO | 12.000 BTUS',
            dataManutencao: '10/10/2025',
            tipoManutencao: 'PMOC',
            statusEquipamento: 'EM OPERAÇÃO',
            responsavel: 'Pablo Pereira',
            periodicidade: 'MENSAL',
            proximaManutencao: '10/11/2025',
            observacoes: 'Inspeção rotineira sem anomalias.',
            custos: 'R$ 120,00',
            assinatura: 'sem_restricoes',
            checklist: { chk1: true, chk2: true, chk3: false },
            checklistOutros: ''
        },
        {
            id: 'PMOC-002',
            cliente: 'BHIO SUPPLY FILIAL | ESTEIO - RS',
            equipamento: 'AC005 | ARMAZÉM | 36.000 BTUS',
            dataManutencao: '02/09/2025',
            tipoManutencao: 'PREVENTIVA',
            statusEquipamento: 'FORA DE OPERAÇÃO',
            responsavel: 'Pablo Pereira',
            periodicidade: 'TRIMESTRAL',
            proximaManutencao: '02/12/2025',
            observacoes: 'Compresssor com vazamento, encaminhado para reparo.',
            custos: 'R$ 850,00',
            assinatura: 'com_restricoes_item_7',
            checklist: { chk1: false, chk2: false, chk3: false },
            checklistOutros: 'Vazamento visível no corpo do compressor'
        },
        {
            id: 'PMOC-003',
            cliente: 'BHIO SUPPLY | CAMPO BOM - RS',
            equipamento: 'AC010 | SALA TI | 18.000 BTUS',
            dataManutencao: '15/08/2025',
            tipoManutencao: 'CORRETIVA',
            statusEquipamento: 'EM OPERAÇÃO',
            responsavel: 'Pablo Pereira',
            periodicidade: 'SEMESTRAL',
            proximaManutencao: '15/02/2026',
            observacoes: 'Trocado motor do ventilador.',
            custos: 'R$ 420,00',
            assinatura: 'sem_restricoes',
            checklist: { chk1: true, chk2: true, chk3: true },
            checklistOutros: ''
        }
    ];

    selectedPmoc: any = null;

    viewDetails(p: any) {
        this.selectedPmoc = p;
    }

    closeDetails() {
        this.selectedPmoc = null;
    }

    checklistKeys(p: any) {
        return p ? Object.keys(p.checklist) : [];
    }

    getAssinaturaLabel(value: string) {
        if (value === 'sem_restricoes') return 'Confirmo que a manutenção foi realizada SEM RESTRIÇÕES';
        if (value === 'com_restricoes_item_7') return 'Confirmo que a manutenção foi realizada COM RESTRIÇÕES, conforme item 7';
        return value;
    }
}
