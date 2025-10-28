import { Injectable } from '@angular/core';

export type ChecklistItem = { controlName: string; itemNumber?: number; unit?: 'EVAPORADORA' | 'CONDENSADORA'; label: string; periodicity?: 'MENSAL' | 'TRIMESTRAL' | 'SEMESTRAL' | 'ANUAL' };
export type Attendance = { id: string; equipamentoId: string; procedimentoKey: string; date: string; result: string; tecnico?: string; notas?: string };
export type Equipment = { id: string; cliente: string; clientId?: string; ambiente?: string; areaM2?: string; capacidadeBtus?: number; tecnologia?: string; gas?: string; ocupantes?: number; contractMonth?: number; statusEquipamento?: 'em_operacao' | 'fora_de_operacao' | string };

@Injectable({ providedIn: 'root' })
export class PmocScheduleService {
    // mock equipment
    private equipments: Equipment[] = [
        { id: 'AC001', clientId: 'demo-client', cliente: 'BHIO SUPPLY | ESTEIO - RS', ambiente: 'Sala de Reuniões', capacidadeBtus: 18000, tecnologia: 'Inverter', gas: 'R410', ocupantes: 6, contractMonth: 10, statusEquipamento: 'em_operacao' },
        { id: 'AC002', cliente: 'BHIO SUPPLY | CAMPO BOM - RS', ambiente: 'Armazém', capacidadeBtus: 36000, tecnologia: 'Convencional', gas: 'R22', ocupantes: 2, contractMonth: 3, statusEquipamento: 'em_operacao' },
        { id: 'AC010', cliente: 'BHIO SUPPLY FILIAL | ESTEIO - RS', ambiente: 'Recepção', capacidadeBtus: 12000, tecnologia: 'Inverter', gas: 'R410', ocupantes: 4, contractMonth: 11, statusEquipamento: 'fora_de_operacao' },
        { id: 'AC014', cliente: 'BHIO MATRIZ', ambiente: 'Diretoria', areaM2: '35 m²', capacidadeBtus: 24000, tecnologia: 'Convencional', gas: 'R410', ocupantes: 8, contractMonth: 9, statusEquipamento: 'em_operacao' },
        { id: 'AC100', cliente: 'CLIENTE TESTE | SÃO PAULO - SP', ambiente: 'Loja', capacidadeBtus: 30000, tecnologia: 'Inverter', gas: 'R410', ocupantes: 12, contractMonth: 9, statusEquipamento: 'em_operacao' },
        { id: 'AC200', cliente: 'CLIENTE VENCIDO | RIO - RJ', ambiente: 'Escritório', capacidadeBtus: 24000, tecnologia: 'Convencional', gas: 'R410', ocupantes: 10, contractMonth: 8, statusEquipamento: 'fora_de_operacao' },
        { id: 'AC300', cliente: 'CLIENTE LONGO PRAZO | NATAL - RN', ambiente: 'Fabrica', capacidadeBtus: 48000, tecnologia: 'Central', gas: 'R134a', ocupantes: 20, contractMonth: 4, statusEquipamento: 'em_operacao' }
    ];

    // mock attendances: multiple procedures across months
    private attendances: Attendance[] = [
        { id: 'a1', equipamentoId: 'AC014', procedimentoKey: 'chk1', date: '2025-09-08', result: 'EXECUTADO', tecnico: 'Técnico A' },
        { id: 'a2', equipamentoId: 'AC014', procedimentoKey: 'chk1', date: '2025-10-08', result: 'EXECUTADO', tecnico: 'Técnico A' },
        { id: 'a3', equipamentoId: 'AC014', procedimentoKey: 'chk2', date: '2025-09-08', result: 'EXECUTADO', tecnico: 'Técnico B' },
        { id: 'a4', equipamentoId: 'AC014', procedimentoKey: 'chk4', date: '2025-09-08', result: 'EXECUTADO', tecnico: 'Técnico C' },
    { id: 'a5', equipamentoId: 'AC014', procedimentoKey: 'chk4', date: '2025-10-08', result: 'OK_CONFORME', tecnico: 'Técnico C' },
        {
            id: 'a6',
            equipamentoId: 'AC014',
            procedimentoKey: 'chk2',
            date: new Date(new Date().getFullYear(), new Date().getMonth() + 2, 12).toISOString(),
            tecnico: 'Rafael',
            result: 'PROGRAMADO'
        }
    ];

    // checklist master split by unit (Evaporadora / Condensadora) — expanded from protótipo
    checklist: ChecklistItem[] = [
        // UNIDADE EVAPORADORA
        { controlName: 'chk1', itemNumber: 1, unit: 'EVAPORADORA', label: 'Limpeza de filtros ou substituição', periodicity: 'MENSAL' },
        { controlName: 'chk2', itemNumber: 2, unit: 'EVAPORADORA', label: 'Limpeza de carenagens plásticas', periodicity: 'MENSAL' },
        { controlName: 'chk3', itemNumber: 3, unit: 'EVAPORADORA', label: 'Limpeza da turbina do motoventilador', periodicity: 'MENSAL' },
        { controlName: 'chk4', itemNumber: 4, unit: 'EVAPORADORA', label: 'Aplicação bactericida na serpentina', periodicity: 'TRIMESTRAL' },
        { controlName: 'chk5', itemNumber: 5, unit: 'EVAPORADORA', label: 'Inspecionar sistema de drenagem', periodicity: 'MENSAL' },
        { controlName: 'chk6', itemNumber: 6, unit: 'EVAPORADORA', label: 'Inspeção de conexões elétricas', periodicity: 'MENSAL' },
        { controlName: 'chk7', itemNumber: 7, unit: 'EVAPORADORA', label: 'Inspeção/Limpeza da bandeja de condensados', periodicity: 'MENSAL' },

        // UNIDADE CONDENSADORA
        { controlName: 'chk8', itemNumber: 8, unit: 'CONDENSADORA', label: 'Inspecionar tubulações e isolamentos', periodicity: 'TRIMESTRAL' },
        { controlName: 'chk9', itemNumber: 9, unit: 'CONDENSADORA', label: 'Inspecionar coxins e suportes', periodicity: 'SEMESTRAL' },
        { controlName: 'chk10', itemNumber: 10, unit: 'CONDENSADORA', label: 'Inspeção de conexões elétricas', periodicity: 'TRIMESTRAL' },
        { controlName: 'chk11', itemNumber: 11, unit: 'CONDENSADORA', label: 'Limpeza da serpentina', periodicity: 'SEMESTRAL' }
    ];

    getEquipment(id: string): Equipment | undefined {
        return this.equipments.find((e) => e.id === id);
    }

    getAttendancesForEquipment(id: string): Attendance[] {
        return this.attendances.filter((a) => a.equipamentoId === id);
    }

    // helper to return all equipments (used by client equipment list)
    getAllEquipments(): Equipment[] {
        return [...this.equipments];
    }
}
