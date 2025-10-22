import { Injectable } from '@angular/core';

export interface PmocSummary {
    id: string;
    cliente: string;
    equipamento: string;
    dataManutencao?: string; // ISO yyyy-MM-dd
    proximaManutencao?: string;
    tipoManutencao?: string;
    status: 'pending' | 'approved';
    responsavel?: string;
    periodicidade?: string[];
    observacoes?: string;
    custos?: number;
    assinatura?: string;
    checklist?: { label: string; checked: boolean }[];
}

@Injectable({ providedIn: 'root' })
export class PmocClientService {
    // Mock data for now; replace with HTTP calls to backend later
    private items: PmocSummary[] = [
        {
            id: 'PMOC-001',
            cliente: 'BHIO SUPPLY | ESTEIO - RS',
            equipamento: 'AC001',
            dataManutencao: '2025-10-01',
            proximaManutencao: '2026-04-01',
            tipoManutencao: 'PMOC',
            status: 'pending',
            responsavel: 'Técnico A',
            periodicidade: ['MENSAL'],
            observacoes: 'Filtro com acumulo de poeira, recomendado troca.',
            custos: 250.0,
            assinatura: 'Assinado por Fulano',
            checklist: [
                { label: 'Limpeza/substituição de filtros de ar', checked: true },
                { label: 'Lavagem da condensadora', checked: false }
            ]
        },
        {
            id: 'PMOC-002',
            cliente: 'BHIO SUPPLY | CAMPO BOM - RS',
            equipamento: 'AC002',
            dataManutencao: '2025-09-10',
            proximaManutencao: '2026-03-10',
            tipoManutencao: 'PREVENTIVA',
            status: 'approved',
            responsavel: 'Técnico B',
            periodicidade: ['ANUAL'],
            observacoes: 'Sem intercorrências.',
            custos: 0,
            assinatura: 'Assinado por Sicrano',
            checklist: [
                { label: 'Verificação compressor', checked: true }
            ]
        },
        {
            id: 'PMOC-003',
            cliente: 'BHIO SUPPLY FILIAL | ESTEIO - RS',
            equipamento: 'AC010',
            dataManutencao: '2025-11-15',
            proximaManutencao: '2026-05-15',
            tipoManutencao: 'CORRETIVA',
            status: 'pending',
            responsavel: 'Técnico C',
            periodicidade: ['SEMESTRAL'],
            observacoes: '',
            custos: 120.5,
            assinatura: '',
            checklist: []
        }
        ,
        // additional examples for visual testing
        {
            id: 'PMOC-004',
            cliente: 'CLIENTE TESTE | SÃO PAULO - SP',
            equipamento: 'AC100',
            dataManutencao: '2025-09-20',
            // approved and expiring in 10 days
            proximaManutencao: (() => { const d = new Date(); d.setDate(d.getDate() + 10); return d.toISOString().slice(0,10); })(),
            tipoManutencao: 'PREVENTIVA',
            status: 'approved',
            responsavel: 'Técnico D',
            periodicidade: ['ANUAL'],
            observacoes: 'Tudo OK',
            custos: 0,
            assinatura: 'Assinado',
            checklist: []
        },
        {
            id: 'PMOC-005',
            cliente: 'CLIENTE VENCIDO | RIO - RJ',
            equipamento: 'AC200',
            dataManutencao: '2024-08-01',
            // approved but already expired (30+ days ago)
            proximaManutencao: (() => { const d = new Date(); d.setDate(d.getDate() - 5); return d.toISOString().slice(0,10); })(),
            tipoManutencao: 'CORRETIVA',
            status: 'approved',
            responsavel: 'Técnico E',
            periodicidade: ['MENSAL'],
            observacoes: 'Falha detectada',
            custos: 350,
            assinatura: '',
            checklist: []
        },
        {
            id: 'PMOC-006',
            cliente: 'CLIENTE LONGO PRAZO | NATAL - RN',
            equipamento: 'AC300',
            dataManutencao: '2025-01-01',
            // approved and far in the future
            proximaManutencao: (() => { const d = new Date(); d.setMonth(d.getMonth() + 6); return d.toISOString().slice(0,10); })(),
            tipoManutencao: 'PREVENTIVA',
            status: 'approved',
            responsavel: 'Técnico F',
            periodicidade: ['ANUAL'],
            observacoes: '',
            custos: 100,
            assinatura: '',
            checklist: []
        }
    ];

    getPending(): PmocSummary[] {
        return this.items.filter(i => i.status === 'pending');
    }

    getApproved(): PmocSummary[] {
        return this.items.filter(i => i.status === 'approved');
    }

    getById(id: string): PmocSummary | undefined {
        return this.items.find(i => i.id === id);
    }

    // Placeholder for ART content; in a real app this will fetch from server
    getArtFor(id: string): string | null {
        const i = this.getById(id);
        if (!i) return null;
        return `ART para ${i.id} — Cliente: ${i.cliente} — Equipamento: ${i.equipamento}`;
    }
}
