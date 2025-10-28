import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Attendance {
    id: string;
    dataAtendimento: string; // ISO date
    proximaManutencao?: string | null;
    status?: string;
    observacoes?: string;
}

export interface Equipment {
    id: string;
    descricao: string;
    capacidadeBtus?: number;
    statusEquipamento?: string;
    atendimentos?: Attendance[];
    // added optional fields used by criarPmoc and listarPmocs templates
    equipamentoTipo?: string;
    tecnologia?: string;
    tipoGas?: string;
    ocupantes?: number;
    areaClimatizada?: number;
}

export interface Pmoc {
    id: string;
    cliente: string;
    // legacy single-equipment field kept for backward compatibility
    equipamento?: string;
    // creation date of the PMOC (used to compute 12-month validity)
    createdAt: string;
    // Optional explicit validity date (if not set, treated as createdAt + 12 months)
    validade?: string;
    // Group of equipments registered under this PMOC (preferred structure)
    equipments?: Equipment[];
    // optional aggregate properties kept for compatibility
    dataManutencao?: string;
    proximaManutencao?: string | null;
    tipoManutencao?: string;
    statusEquipamento?: string;
    responsavel?: string;
    periodicidade?: string;
    observacoes?: string;
    custos?: string;
    assinatura?: string;
    fotos?: string[];
    checklist?: Record<string, boolean>;
    checklistOutros?: string;
}

@Injectable({ providedIn: 'root' })
export class PmocService {
    private pmocsSubject = new BehaviorSubject<Pmoc[]>([
        {
            id: 'PMOC-001',
            cliente: 'BHIO SUPPLY | ESTEIO - RS',
            createdAt: '2024-10-10',
            validade: '2026-10-10',
            equipments: [
                {
                    id: 'AC001',
                    descricao: 'RECEBIMENTO | 12.000 BTUS',
                    capacidadeBtus: 12000,
                    statusEquipamento: 'EM OPERAÇÃO',
                    equipamentoTipo: 'MultiSplit',
                    tecnologia: 'Inverter',
                    tipoGas: 'R410',
                    ocupantes: 2,
                    areaClimatizada: 14,
                    atendimentos: [
                        { id: 'A-100', dataAtendimento: '2025-10-10', proximaManutencao: '2025-11-10', status: 'executado' }
                    ]
                }
            ],
            tipoManutencao: 'PMOC',
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
            createdAt: '2024-09-02',
            validade: '2025-09-02',
            equipments: [
                {
                    id: 'AC005',
                    descricao: 'ARMAZÉM | 36.000 BTUS',
                    capacidadeBtus: 36000,
                    statusEquipamento: 'FORA DE OPERAÇÃO',
                    equipamentoTipo: 'Cassete',
                    tecnologia: 'Convencional',
                    tipoGas: 'R22',
                    ocupantes: 0,
                    areaClimatizada: 180,
                    atendimentos: [
                        { id: 'A-200', dataAtendimento: '2025-09-02', proximaManutencao: '2025-12-02', status: 'executado' }
                    ]
                }
            ],
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
            createdAt: '2024-08-15',
            validade: '2025-08-15',
            equipments: [
                {
                    id: 'AC010',
                    descricao: 'SALA TI | 18.000 BTUS',
                    capacidadeBtus: 18000,
                    statusEquipamento: 'EM OPERAÇÃO',
                    equipamentoTipo: 'Built-in',
                    tecnologia: 'Inverter',
                    tipoGas: 'R32',
                    ocupantes: 3,
                    areaClimatizada: 22,
                    atendimentos: [
                        { id: 'A-300', dataAtendimento: '2025-08-15', proximaManutencao: '2026-02-15', status: 'executado' }
                    ]
                }
            ],
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
        },
        {
            id: 'PMOC-004',
            cliente: 'BHIO SUPPLY | MATRIZ - RS',
            createdAt: '2025-10-01',
            validade: '2026-10-01',
            equipments: [
                {
                    id: 'AC020',
                    descricao: 'CE0 OFFICE | 24.000 BTUS',
                    capacidadeBtus: 24000,
                    statusEquipamento: 'EM OPERAÇÃO',
                    equipamentoTipo: 'Wi-Hall',
                    tecnologia: 'Convencional',
                    tipoGas: 'R410',
                    ocupantes: 4,
                    areaClimatizada: 30,
                    atendimentos: [
                        { id: 'A-400', dataAtendimento: '2025-10-01', proximaManutencao: '2026-04-01', status: 'executado' }
                    ]
                }
            ],
            tipoManutencao: 'PMOC',
            statusEquipamento: 'EM OPERAÇÃO',
            responsavel: 'Mariana Silva',
            periodicidade: 'ANUAL',
            observacoes: 'PMOC da matriz, todos equipamentos em dia.',
            custos: 'R$ 0,00',
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
