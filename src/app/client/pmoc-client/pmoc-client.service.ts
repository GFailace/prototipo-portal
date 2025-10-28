import { Injectable } from '@angular/core';

export interface PmocSummary {
    id: string;
    cliente: string;
    equipamento: string;
    // clientId (UUID/hash) to associate PMOCs to a specific cliente record
    clientId?: string;
    dataManutencao?: string; // ISO yyyy-MM-dd
    proximaManutencao?: string;
    tipoManutencao?: string;
    status: 'pending' | 'approved';
    // equipment operational status used in create form: 'em_operacao' | 'fora_de_operacao'
    statusEquipamento?: 'em_operacao' | 'fora_de_operacao' | string;
    responsavel?: string;
    periodicidade?: string[];
    observacoes?: string;
    custos?: number;
    assinatura?: string;
    checklist?: { label: string; checked: boolean }[];
}

export interface Attendance {
    id: string; // attendance id
    pmocId: string; // reference to PMOC id
    cliente: string;
    clientId?: string;
    equipamento: string;
    dataManutencao?: string;
    proximaManutencao?: string;
    tipoManutencao?: string;
    status: 'pending' | 'approved';
    statusEquipamento?: string;
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
            clientId: 'demo-client',
            equipamento: 'AC001',
            dataManutencao: '2025-10-01',
            proximaManutencao: '2026-04-01',
            tipoManutencao: 'PMOC',
            status: 'pending',
            statusEquipamento: 'em_operacao',
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
            statusEquipamento: 'em_operacao',
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
            statusEquipamento: 'fora_de_operacao',
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
            statusEquipamento: 'em_operacao',
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
            statusEquipamento: 'fora_de_operacao',
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
            statusEquipamento: 'em_operacao',
            responsavel: 'Técnico F',
            periodicidade: ['ANUAL'],
            observacoes: '',
            custos: 100,
            assinatura: '',
            checklist: []
        }
    ];

    // ART store: map clientId -> { name, base64 }
    // In production this comes from server storage; here we include one demo entry.
    private artStore: Record<string, { name: string; base64: string }> = {
        'demo-client': {
            name: 'ART-demo-client.pdf',
            // Small single-page PDF (base64) for demo purposes
            base64: 'JVBERi0xLjMKJeLjz9MKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4KZW5kb2JqCjIgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9LaWRzIFsgMyAwIFIgXSAvQ291bnQgMSA+PgplbmRvYmoKMyAwIG9iago8PCAvVHlwZSAvUGFnZSAvUGFyZW50IDIgMCBSIC9NZWRpYUJveCBbMCAwIDU5NSA4NDJdIC9Db250ZW50cyA0IDAgUiAvUmVzb3VyY2VzIDw8IC9Gb250IDw8IC9GMSA1IDAgUiA+PiA+PiA+PgplbmRvYmoKNCAwIG9iago8PCAvTGVuZ3RoIDY1ID4+CnN0cmVhbQpCVAovRiAxMiBUZCAxMCAxMDAgVGQgKEhlbGxvLCBXb3JsZCkhClRkCmVuZHN0cmVhbQplbmRvYmoKNSAwIG9iago8PCAvVHlwZSAvRm9udCAvU3VidHlwZSAvVHlwZTEgL05hbWUgL0YxIC9CYXNlRm9udCAvSGVsdmV0aWNhID4+CmVuZG9iagp4cmVmCjAgNgowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMTkgMDAwMDAgbiAKMDAwMDAwMDA5NSAwMDAwMCBuIAowMDAwMDAwMTk4IDAwMDAwIG4gCjAwMDAwMDAyNjAgMDAwMDAgbiAKdHJhaWxlcgo8PCAvUm9vdCAxIDAgUiAvU2l6ZSA2ID4+CnN0YXJ0eHJlZgozMDYKJSVFT0YK'
        }
    };

    // optionally filter by clientId (if provided)
    getPending(clientId?: string): PmocSummary[] {
        return this.items.filter(i => i.status === 'pending' && (clientId ? i.clientId === clientId : true));
    }
    getApproved(clientId?: string): PmocSummary[] {
        return this.items.filter(i => i.status === 'approved' && (clientId ? i.clientId === clientId : true));
    }

    // Mock attendances (linked to PMOC ids)
    private attendances: Attendance[] = [
        { id: 'A-1001', pmocId: 'PMOC-001', cliente: 'BHIO SUPPLY | ESTEIO - RS', clientId: 'demo-client', equipamento: 'AC001', dataManutencao: '2025-10-01', proximaManutencao: '2026-04-01', tipoManutencao: 'PMOC', status: 'pending', statusEquipamento: 'em_operacao', responsavel: 'Técnico A', periodicidade: ['MENSAL'], observacoes: 'Filtro com acumulo de poeira', custos: 250, assinatura: 'Assinado por Fulano', checklist: [{ label: 'Limpeza', checked: true }] },
        { id: 'A-1002', pmocId: 'PMOC-002', cliente: 'BHIO SUPPLY | CAMPO BOM - RS', equipamento: 'AC002', dataManutencao: '2025-09-10', proximaManutencao: '2026-03-10', tipoManutencao: 'PREVENTIVA', status: 'approved', statusEquipamento: 'em_operacao', responsavel: 'Técnico B', periodicidade: ['ANUAL'], observacoes: '', custos: 0, assinatura: 'Assinado por Sicrano', checklist: [] },
        { id: 'A-1003', pmocId: 'PMOC-003', cliente: 'BHIO SUPPLY FILIAL | ESTEIO - RS', equipamento: 'AC010', dataManutencao: '2025-11-15', proximaManutencao: '2026-05-15', tipoManutencao: 'CORRETIVA', status: 'pending', statusEquipamento: 'fora_de_operacao', responsavel: 'Técnico C', periodicidade: ['SEMESTRAL'], observacoes: '', custos: 120.5, assinatura: '', checklist: [] },
        { id: 'A-1004', pmocId: 'PMOC-004', cliente: 'CLIENTE TESTE | SÃO PAULO - SP', equipamento: 'AC100', dataManutencao: '2025-09-20', proximaManutencao: (() => { const d = new Date(); d.setDate(d.getDate() + 10); return d.toISOString().slice(0,10); })(), tipoManutencao: 'PREVENTIVA', status: 'approved', statusEquipamento: 'em_operacao', responsavel: 'Técnico D', periodicidade: ['ANUAL'], observacoes: '', custos: 0, assinatura: 'Assinado', checklist: [] },
        { id: 'A-1005', pmocId: 'PMOC-005', cliente: 'CLIENTE VENCIDO | RIO - RJ', equipamento: 'AC200', dataManutencao: '2024-08-01', proximaManutencao: (() => { const d = new Date(); d.setDate(d.getDate() - 5); return d.toISOString().slice(0,10); })(), tipoManutencao: 'CORRETIVA', status: 'approved', statusEquipamento: 'fora_de_operacao', responsavel: 'Técnico E', periodicidade: ['MENSAL'], observacoes: '', custos: 350, assinatura: '', checklist: [] },
        { id: 'A-1006', pmocId: 'PMOC-006', cliente: 'CLIENTE LONGO PRAZO | NATAL - RN', equipamento: 'AC300', dataManutencao: '2025-01-01', proximaManutencao: (() => { const d = new Date(); d.setMonth(d.getMonth() + 6); return d.toISOString().slice(0,10); })(), tipoManutencao: 'PREVENTIVA', status: 'approved', statusEquipamento: 'em_operacao', responsavel: 'Técnico F', periodicidade: ['ANUAL'], observacoes: '', custos: 100, assinatura: '', checklist: [] }
    ];

    getAttendances(clientId?: string): Attendance[] {
        return this.attendances.filter(a => (clientId ? a.clientId === clientId : true));
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

    // Return a mock PDF (base64) for a given clientId. In production this will be an HTTP call
    // that returns the PDF bytes stored in a blob or fetched via signed URL.
    getArtBase64ForClient(clientId?: string): { name: string; base64: string } | null {
        if (!clientId) return null;
        // return explicit art if available
        const found = this.artStore[clientId];
        if (found) return found;
        // fallback: return a minimal placeholder PDF so UI can demonstrate the viewer
        const base64 = 'JVBERi0xLjMKJeLjz9MKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4KZW5kb2JqCjIgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9LaWRzIFsgMyAwIFIgXSAvQ291bnQgMSA+PgplbmRvYmoKMyAwIG9iago8PCAvVHlwZSAvUGFnZSAvUGFyZW50IDIgMCBSIC9NZWRpYUJveCBbMCAwIDU5NSA4NDJdIC9Db250ZW50cyA0IDAgUiAvUmVzb3VyY2VzIDw8IC9Gb250IDw8IC9GMSA1IDAgUiA+PiA+PiA+PgplbmRvYmoKNCAwIG9iago8PCAvTGVuZ3RoIDY1ID4+CnN0cmVhbQpCVAovRiAxMiBUZCAxMCAxMDAgVGQgKEhlbGxvLCBXb3JsZCkhClRkCmVuZHN0cmVhbQplbmRvYmoKNSAwIG9iago8PCAvVHlwZSAvRm9udCAvU3VidHlwZSAvVHlwZTEgL05hbWUgL0YxIC9CYXNlRm9udCAvSGVsdmV0aWNhID4+CmVuZG9iagp4cmVmCjAgNgowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMTkgMDAwMDAgbiAKMDAwMDAwMDA5NSAwMDAwMCBuIAowMDAwMDAwMTk4IDAwMDAwIG4gCjAwMDAwMDAyNjAgMDAwMDAgbiAKdHJhaWxlcgo8PCAvUm9vdCAxIDAgUiAvU2l6ZSA2ID4+CnN0YXJ0eHJlZgozMDYKJSVFT0YK';
        return { name: `ART-${clientId}.pdf`, base64 };
    }

    // Convert the base64 placeholder into a Blob for client-side viewing/downloading
    getArtBlobForClient(clientId?: string): Blob | null {
        const entry = this.getArtBase64ForClient(clientId);
        if (!entry) return null;
        try {
            console.debug('getArtBlobForClient: decoding base64 length=', entry.base64.length, 'for', entry.name);
            const byteCharacters = atob(entry.base64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });
            console.debug('getArtBlobForClient: created blob size=', blob.size);
            return blob;
        } catch (err) {
            console.error('getArtBlobForClient: failed to decode base64 for clientId=', clientId, err);
            return null;
        }
    }
}
