import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Pmoc {
    id: string;
    cliente: string;
    equipamento: string;
    dataManutencao: Date;
    proximaManutencao?: Date | null;
    tipoManutencao: string;
    statusEquipamento: string;
    responsavel: string;
    periodicidade: string;
    observacoes: string;
    custos: string;
    assinatura: string;
    fotos?: string[];
    checklist: Record<string, boolean>;
    checklistOutros?: string;
}

@Injectable({ providedIn: 'root' })
export class PmocService {
    private pmocsSubject = new BehaviorSubject<Pmoc[]>([
        {
            id: 'PMOC-001',
            cliente: 'BHIO SUPPLY | ESTEIO - RS',
            equipamento: 'AC001 | RECEBIMENTO | 12.000 BTUS',
            dataManutencao: new Date(2025, 9, 10), // month 9 = October
            proximaManutencao: new Date(2025, 10, 10),
            tipoManutencao: 'PMOC',
            statusEquipamento: 'EM OPERAÇÃO',
            responsavel: 'Pablo Pereira',
            periodicidade: 'MENSAL',
            observacoes: 'Inspeção rotineira sem anomalias.',
            custos: 'R$ 120,00',
            assinatura: 'sem_restricoes',
            fotos: [],
            checklist: { chk1: true, chk2: true, chk3: false },
            checklistOutros: ''
        },
        {
            id: 'PMOC-002',
            cliente: 'BHIO SUPPLY FILIAL | ESTEIO - RS',
            equipamento: 'AC005 | ARMAZÉM | 36.000 BTUS',
            dataManutencao: new Date(2025, 8, 2),
            proximaManutencao: new Date(2025, 11, 2),
            tipoManutencao: 'PREVENTIVA',
            statusEquipamento: 'FORA DE OPERAÇÃO',
            responsavel: 'Pablo Pereira',
            periodicidade: 'TRIMESTRAL',
            observacoes: 'Compresssor com vazamento, encaminhado para reparo.',
            custos: 'R$ 850,00',
            assinatura: 'com_restricoes_item_7',
            fotos: [],
            checklist: { chk1: false, chk2: false, chk3: false },
            checklistOutros: 'Vazamento visível no corpo do compressor'
        },
        {
            id: 'PMOC-003',
            cliente: 'BHIO SUPPLY | CAMPO BOM - RS',
            equipamento: 'AC010 | SALA TI | 18.000 BTUS',
            dataManutencao: new Date(2025, 7, 15),
            proximaManutencao: new Date(2026, 1, 15),
            tipoManutencao: 'CORRETIVA',
            statusEquipamento: 'EM OPERAÇÃO',
            responsavel: 'Pablo Pereira',
            periodicidade: 'SEMESTRAL',
            observacoes: 'Trocado motor do ventilador.',
            custos: 'R$ 420,00',
            assinatura: 'sem_restricoes',
            fotos: [],
            checklist: { chk1: true, chk2: true, chk3: true },
            checklistOutros: ''
        }
    ]);

    get pmocs$(): Observable<Pmoc[]> {
        return this.pmocsSubject.asObservable();
    }

    add(pmoc: Pmoc) {
        const current = this.pmocsSubject.value.slice();
        current.unshift(pmoc);
        this.pmocsSubject.next(current);
    }

    update(id: string, patch: Partial<Pmoc>) {
        const current = this.pmocsSubject.value.map(p => p.id === id ? { ...p, ...patch } : p);
        this.pmocsSubject.next(current);
    }

    remove(id: string) {
        const current = this.pmocsSubject.value.filter(p => p.id !== id);
        this.pmocsSubject.next(current);
    }
}
