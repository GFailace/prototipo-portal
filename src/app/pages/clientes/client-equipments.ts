import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { PmocScheduleService, Equipment } from '../pmocs/pmoc-schedule.service';

@Component({
    selector: 'app-client-equipments',
    standalone: true,
    imports: [CommonModule, RouterModule, ButtonModule, CardModule],
    template: `
        <div class="card">
            <h2>Meus Equipamentos</h2>
            <div *ngIf="!equipments?.length">Nenhum equipamento encontrado.</div>
            <div class="grid" *ngIf="equipments?.length">
                <div *ngFor="let e of equipments" class="equip-card">
                    <p-card>
                        <div class="card-content">
                            <div class="title">{{ e.id }}</div>
                            <div class="subtitle">{{ e.cliente }}</div>
                            <div class="meta">{{ e.ambiente }} • {{ e.capacidadeBtus }} BTU</div>
                            <div class="actions">
                                <a [routerLink]="[e.id, 'schedule']" pButton type="button" label="Ver PMOC" class="p-button-sm"></a>
                            </div>
                        </div>
                    </p-card>
                </div>
            </div>
        </div>
    `,
    styles: [
        `
            .grid {
                display: flex;
                flex-wrap: wrap;
                gap: 1rem;
            }
            .equip-card {
                width: 320px;
            }
            .card-content {
                padding: 0.5rem;
            }
            .title {
                font-weight: 700;
                font-size: 1.1rem;
            }
            .subtitle {
                color: var(--text-color-secondary);
                font-size: 0.95rem;
            }
            .meta {
                margin-top: 0.25rem;
                font-size: 0.85rem;
                color: var(--text-color-tertiary);
            }
            .actions {
                margin-top: 0.5rem;
            }
        `
    ]
})
export class ClientEquipmentsComponent implements OnInit {
    equipments: Equipment[] = [];
    constructor(private svc: PmocScheduleService) {}

    ngOnInit(): void {
        // For now return all equipments from mock service; in a real app filter by clientId
        this.equipments = [...(this.svc.getAllEquipments ? this.svc.getAllEquipments() : [])];
    }
}
