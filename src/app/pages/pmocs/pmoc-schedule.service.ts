import { Injectable } from '@angular/core';

export type ChecklistItem = { controlName: string; itemNumber?: number; unit?: 'EVAPORADORA' | 'CONDENSADORA'; label: string; periodicity?: 'MENSAL' | 'TRIMESTRAL' | 'SEMESTRAL' | 'ANUAL' };
export type Attendance = { id: string; equipamentoId: string; procedimentoKey: string; date: string; result: string; tecnico?: string; notas?: string };
export type Equipment = { id: string; cliente: string; ambiente?: string; areaM2?: string; capacidadeBtus?: number; tecnologia?: string; gas?: string; ocupantes?: number; contractMonth?: number };

@Injectable({ providedIn: 'root' })
export class PmocScheduleService {
    // mock equipment
    private equipments: Equipment[] = [
        {
            id: 'AC014',
            cliente: 'BHIO MATRIZ',
            ambiente: 'Diretoria',
            areaM2: '35 m²',
            capacidadeBtus: 24000,
            tecnologia: 'Convencional',
            gas: 'R410',
            ocupantes: 8,
            contractMonth: 9 // September
        }
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
