import { Component } from '@angular/core';
import { FluidModule } from 'primeng/fluid';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
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
    imports: [CommonModule, InputTextModule, FluidModule, ButtonModule, SelectModule, FormsModule, ReactiveFormsModule, TextareaModule, TableModule, DatePickerModule, CheckboxModule, ToastModule, ConfirmDialogModule, InputNumberModule, FileUploadModule],
    template: `<p-fluid>
        <p-toast></p-toast>
        <p-confirmDialog></p-confirmDialog>
        <div class="card">
            <div class="flex items-center justify-between mb-4">
                <div class="font-semibold text-2xl">Lista de PMOCs</div>
                <p-button label="Novo PMOC" class="p-button-sm" (onClick)="goCreate()"></p-button>
            </div>

            <p-table [value]="(pmocs$ | async) || []" class="p-datatable-sm">
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
                        <td>{{ p.dataManutencao | date:'dd/mm/yyyy' }}</td>
                        <td>{{ p.responsavel }}</td>
                        <td>
                            <p-button label="Ver detalhes" (onClick)="viewDetails(p)" class="p-button-text"></p-button>
                            <p-button label="Excluir" (onClick)="deletePmoc(p.id)" class="p-button-text p-button-danger"></p-button>
                        </td>
                    </tr>
                </ng-template>
            </p-table>

            <div *ngIf="selectedPmoc" class="mt-6">
                <div class="card p-4 border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900">
                    <div class="flex items-center justify-between">
                        <div class="font-semibold text-xl">Detalhes — {{ selectedPmoc.id }}</div>
                        <div class="flex gap-2">
                            <p-button label="Exportar (Imprimir)" (onClick)="exportToPrint()" class="p-button-text"></p-button>
                            <p-button label="Download PDF" (onClick)="downloadPdf()" class="p-button-text"></p-button>
                            <p-button label="Editar" (onClick)="toggleEdit()" class="p-button-text"></p-button>
                            <p-button label="Fechar" (onClick)="closeDetails()" class="p-button-text"></p-button>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <ng-container *ngIf="!editMode">
                            <div class="p-4 rounded border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900">
                                <h3 class="font-medium mb-3">Informações Gerais</h3>
                                <div><strong>Cliente:</strong> {{ selectedPmoc.cliente }}</div>
                                <div><strong>Equipamento:</strong> {{ selectedPmoc.equipamento }}</div>
                                <div><strong>Data:</strong> {{ selectedPmoc.dataManutencao | date:'dd/MM/yyyy' }}</div>
                                <div><strong>Próxima Manutenção:</strong> {{ selectedPmoc.proximaManutencao ? (selectedPmoc.proximaManutencao | date:'dd/MM/yyyy') : '-' }}</div>
                                <div><strong>Tipo:</strong> {{ selectedPmoc.tipoManutencao }}</div>
                                <div><strong>Status:</strong> {{ selectedPmoc.statusEquipamento }}</div>
                                <div><strong>Responsável:</strong> {{ selectedPmoc.responsavel }}</div>
                                <div><strong>Periodicidade:</strong> {{ selectedPmoc.periodicidade }}</div>
                            </div>

                            <div class="p-4 rounded border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900">
                                <h3 class="font-medium mb-3">Observações e Custos</h3>
                                <div class="whitespace-pre-wrap">{{ selectedPmoc.observacoes || '-' }}</div>
                                <div class="mt-3"><strong>Custos:</strong> {{ selectedPmoc.custos || '-' }}</div>
                                <div class="mt-3"><strong>Checklist - Outros:</strong> {{ selectedPmoc.checklistOutros || '-' }}</div>

                                <div class="mt-4">
                                    <h4 class="font-medium">Checklist</h4>
                                    <ul class="list-disc ml-6 mt-2">
                                        <ng-container *ngFor="let item of checklist">
                                            <li *ngIf="selectedPmoc?.checklist && selectedPmoc.checklist[item.controlName]">{{ item.label }}</li>
                                        </ng-container>
                                    </ul>
                                </div>
                            </div>
                        </ng-container>

                        <form *ngIf="editMode" [formGroup]="editForm" (ngSubmit)="saveEdit()" class="w-full col-span-1 md:col-span-2">
                            <div class="flex flex-col md:flex-row gap-8 w-full">
                                <div class="flex-1">
                                    <div class="p-4 rounded border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900">
                                        <div class="font-semibold text-xl mb-3">PMOC — Editar</div>

                                        <div class="flex flex-col gap-3">
                                            <label class="mt-2 block">Cliente | Empresa *</label>
                                            <p-select class="w-full" [options]="clienteOptions" formControlName="cliente" placeholder="Selecione"></p-select>
                                        </div>

                                        <div class="flex flex-col gap-3">
                                            <label class="mt-2 block">ID Equipamento | Setor | Capacidade *</label>
                                            <p-select class="w-full" [options]="equipamentoOptions" formControlName="equipamento" placeholder="Selecione o equipamento"></p-select>
                                        </div>

                                        <div class="grid grid-cols-12 gap-3">
                                            <label class="flex items-center col-span-12 mt-2 md:col-span-4 md:mb-0">Data da Manutenção</label>
                                            <div class="col-span-12 md:col-span-8">
                                                <p-date-picker formControlName="dataManutencao" dateFormat="dd/MM/yyyy" placeholder="dd/mm/aaaa"></p-date-picker>
                                            </div>
                                        </div>

                                        <div class="flex flex-col gap-3 mt-3">
                                            <label class="mt-2 block">Tipo de Manutenção *</label>
                                            <p-select class="w-full" [options]="tipoManutencaoOptions" formControlName="tipoManutencao" placeholder="Selecione o tipo"></p-select>
                                        </div>

                                        <div class="flex flex-col gap-3 mt-3">
                                            <label class="mt-2 block">Status do Equipamento *</label>
                                            <p-select class="w-full" [options]="statusOptions" formControlName="statusEquipamento" placeholder="Selecione"></p-select>
                                        </div>
                                    </div>

                                    <div class="p-4 rounded border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 mt-4">
                                        <div class="font-semibold text-xl mb-3">Responsável e Periodicidade</div>
                                        <div class="flex flex-col gap-3">
                                            <label class="mt-2 block">Responsável pelo Atendimento Técnico *</label>
                                            <input pInputText formControlName="responsavel" />
                                        </div>
                                        <div class="flex flex-col gap-3">
                                            <label class="mt-2 block">Periodicidade da Manutenção *</label>
                                            <p-select class="w-full" [options]="periodicidadeOptions" formControlName="periodicidade" placeholder="Selecione a periodicidade"></p-select>
                                        </div>

                                        <div class="grid grid-cols-12 gap-2 mt-2">
                                            <label class="flex items-center col-span-12 mt-2 md:col-span-4 md:mb-0">Previsão Próxima Manutenção</label>
                                            <div class="col-span-12 md:col-span-8">
                                                <p-date-picker formControlName="proximaManutencao" dateFormat="dd/MM/yyyy" placeholder="dd/mm/aaaa"></p-date-picker>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="flex-1">
                                    <div class="p-4 rounded border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900">
                                        <div class="font-semibold text-xl mb-3">Checklist de Inspeção</div>
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div *ngFor="let item of checklist" class="flex items-center gap-2">
                                                <p-checkbox binary="true" [formControlName]="item.controlName"></p-checkbox>
                                                <span class="text-sm">{{ item.label }}</span>
                                            </div>
                                        </div>
                                        <div class="flex flex-col gap-3 mt-3">
                                            <label class="mt-2 block">Outros</label>
                                            <textarea pInputTextarea formControlName="checklistOutros" placeholder="Outros..."></textarea>
                                        </div>
                                    </div>

                                    <div class="p-4 rounded border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 mt-4">
                                        <div class="font-semibold text-xl mb-3">Observações e Evidências</div>
                                        <div class="flex flex-col gap-3">
                                            <label class="mt-2 block">Observações | Problemas Encontrados</label>
                                            <textarea pInputTextarea formControlName="observacoes"></textarea>
                                        </div>

                                        <div class="flex flex-col gap-3 mt-3">
                                            <label class="mt-2 block">Upload de Fotos | Evidências</label>
                                            <p-fileUpload id="fotos" name="fotos" url="URL_DO_BACKEND" [maxFileSize]="10000000" [multiple]="true" [auto]="true" chooseLabel="Selecionar"></p-fileUpload>
                                        </div>

                                        <div class="flex flex-col gap-3 mt-3">
                                            <label class="mt-2 block">Custos | Despesas</label>
                                            <p-inputNumber formControlName="custos" mode="currency" currency="BRL" locale="pt-BR" [min]="0"></p-inputNumber>
                                        </div>

                                        <div class="flex justify-end gap-2 mt-4">
                                            <p-button label="Salvar" (onClick)="saveEdit()" class="p-button-plain"></p-button>
                                            <p-button label="Cancelar" (onClick)="toggleEdit(false)" class="p-button-plain"></p-button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </p-fluid>`,
    styles: [
        `:host ::ng-deep .pmoc-fileupload .p-fileupload-upload, :host ::ng-deep .pmoc-fileupload .p-fileupload-cancel { display: none !important; }`
    ]
})
export class ListarPmocs {
    pmocs$: Observable<Pmoc[]>;
    selectedPmoc: Pmoc | null = null;
    editMode = false;
    editForm!: FormGroup;

    // Options copied from criarPmoc
    statusOptions = [
        { label: 'EM OPERAÇÃO', value: 'em_operacao' },
        { label: 'FORA DE OPERAÇÃO', value: 'fora_de_operacao' }
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

    constructor(private pmocService: PmocService, private fb: FormBuilder, private msg: MessageService, private confirm: ConfirmationService, private router: Router) {
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

    viewDetails(p: Pmoc) {
        this.selectedPmoc = { ...p };
        this.editMode = false;
    }

    closeDetails() {
        this.selectedPmoc = null;
        this.editMode = false;
    }

    checklistKeys(p: Pmoc | null) {
        return p ? Object.keys(p.checklist) : [];
    }

    getChecklistLabel(key: string) {
        return CHECKLIST_LABELS[key] || key;
    }

    getAssinaturaLabel(value: string) {
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
        this.router.navigate(['/pmocs/registrar-pmoc']);
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

        // Ensure date fields are Date objects
        const dataManutencao = formValue.dataManutencao ? new Date(formValue.dataManutencao) : null;
        const proximaManutencao = formValue.proximaManutencao ? new Date(formValue.proximaManutencao) : null;

        const updated: Pmoc = {
            ...this.selectedPmoc,
            cliente: formValue.cliente,
            equipamento: formValue.equipamento,
            dataManutencao: dataManutencao as any,
            proximaManutencao: proximaManutencao as any,
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
        this.selectedPmoc.fotos = this.selectedPmoc.fotos.filter(src => !src.includes(name));
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
        const num = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9-,.]/g, '').replace(',', '.'));
        if (isNaN(num)) return '';
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
    }

    private parseCurrencyToNumber(value: any): number | null {
        if (value === null || value === undefined || value === '') return null;
        if (typeof value === 'number') return value;
        const cleaned = String(value).replace(/\s/g, '').replace(/R\$|\$/g, '').replace(/\./g, '').replace(/,/g, '.');
        const n = parseFloat(cleaned);
        return isNaN(n) ? null : n;
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

                // If year looks duplicated (e.g. '20252025'), take the first 4 digits
                if (year.length > 4) year = year.slice(0, 4);

                const d = parseInt(day, 10);
                const m = parseInt(month, 10);
                const y = parseInt(year, 10);
                if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
                    return new Date(y, m - 1, d);
                }
            }

            // Fallback: try Date constructor
            const dt = new Date(value);
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
                <td style="padding:6px 12px;border:1px solid #e5e7eb;">${this.getChecklistLabel(k)}</td>
                <td style="padding:6px 12px;border:1px solid #e5e7eb;">${p.checklist[k] ? 'OK' : 'NÃO'}</td>
            </tr>
        `
            )
            .join('');

        const html = `
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
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <h1 style="margin:0">PMOC — ${p.id}</h1>
                        <div style="color:#6b7280">Cliente: ${p.cliente}</div>
                    </div>
                    <div style="text-align:right">
                        <div style="font-weight:600">${p.responsavel}</div>
                        <div style="color:#6b7280">${new Intl.DateTimeFormat('pt-BR').format(new Date(p.dataManutencao))}</div>
                    </div>
                </div>

                <div class="card" style="width:100%; max-width:793px;">
                    <table style="width:100%;">
                        <tr><th>Campo</th><th>Valor</th></tr>
                        <tr><td>Equipamento</td><td>${p.equipamento}</td></tr>
                        <tr><td>Tipo</td><td>${p.tipoManutencao}</td></tr>
                        <tr><td>Status</td><td>${p.statusEquipamento}</td></tr>
                        <tr><td>Periodicidade</td><td>${p.periodicidade}</td></tr>
                        <tr><td>Próxima Manutenção</td><td>${p.proximaManutencao ? new Intl.DateTimeFormat('pt-BR').format(new Date(p.proximaManutencao)) : '-'}</td></tr>
                        <tr><td>Custos</td><td>${p.custos || '-'}</td></tr>
                    </table>
                </div>

                <div style="height:12px"></div>

                <div class="card">
                    <h3 style="margin:0 0 8px 0">Observações</h3>
                    <div style="white-space:pre-wrap; color:#111827">${p.observacoes || '-'}</div>
                </div>

                <div style="height:12px"></div>

                <div class="card">
                    <h3 style="margin:0 0 8px 0">Checklist</h3>
                    <table>
                        <tr><th>Item</th><th>Resultado</th></tr>
                        ${checklistHtml}
                    </table>
                </div>

                <div style="height:24px"></div>

                <div style="text-align:right; color:#6b7280; margin-top:18px">Gerado por Prototipo-Portal</div>
            </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;
        printWindow.document.write(html);
        printWindow.document.close();
        // allow styles to load
        setTimeout(() => printWindow.print(), 300);
    }

    async downloadPdf() {
        if (!this.selectedPmoc) return;
        const p = this.selectedPmoc;
        const checklistHtml = this.checklistKeys(p)
            .map(
                (k) => `
            <tr>
                <td style="padding:6px 12px;border:1px solid #e5e7eb;">${this.getChecklistLabel(k)}</td>
                <td style="padding:6px 12px;border:1px solid #e5e7eb;">${p.checklist[k] ? 'OK' : 'NÃO'}</td>
            </tr>
        `
            )
            .join('');

        const html = `
            <div style="font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color:#111827; padding:24px; background:#fff; max-width:842px">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px">
                    <div>
                        <h1 style="margin:0">PMOC — ${p.id}</h1>
                        <div style="color:#6b7280">Cliente: ${p.cliente}</div>
                    </div>
                    <div style="text-align:right">
                        <div style="font-weight:600">${p.responsavel}</div>
                        <div style="color:#6b7280">${new Intl.DateTimeFormat('pt-BR').format(new Date(p.dataManutencao))}</div>
                    </div>
                </div>

                <div style="border:1px solid #e5e7eb; border-radius:8px; padding:12px; margin-bottom:12px">
                    <table style="border-collapse:collapse; width:100%">
                        <tr><th style="text-align:left; padding:8px; background:#f3f4f6">Campo</th><th style="text-align:left; padding:8px; background:#f3f4f6">Valor</th></tr>
                        <tr><td style="padding:8px;border-top:1px solid #e5e7eb">Equipamento</td><td style="padding:8px;border-top:1px solid #e5e7eb">${p.equipamento}</td></tr>
                        <tr><td style="padding:8px;border-top:1px solid #e5e7eb">Tipo</td><td style="padding:8px;border-top:1px solid #e5e7eb">${p.tipoManutencao}</td></tr>
                        <tr><td style="padding:8px;border-top:1px solid #e5e7eb">Status</td><td style="padding:8px;border-top:1px solid #e5e7eb">${p.statusEquipamento}</td></tr>
                        <tr><td style="padding:8px;border-top:1px solid #e5e7eb">Periodicidade</td><td style="padding:8px;border-top:1px solid #e5e7eb">${p.periodicidade}</td></tr>
                        <tr><td style="padding:8px;border-top:1px solid #e5e7eb">Próxima Manutenção</td><td style="padding:8px;border-top:1px solid #e5e7eb">${p.proximaManutencao ? new Intl.DateTimeFormat('pt-BR').format(new Date(p.proximaManutencao)) : '-'}</td></tr>
                        <tr><td style="padding:8px;border-top:1px solid #e5e7eb">Custos</td><td style="padding:8px;border-top:1px solid #e5e7eb">${p.custos || '-'}</td></tr>
                        <tr><td style="padding:8px;border-top:1px solid #e5e7eb">Assinatura</td><td style="padding:8px;border-top:1px solid #e5e7eb">${this.getAssinaturaLabel(p.assinatura)}</td></tr>
                    </table>
                </div>

                <div style="border:1px solid #e5e7eb; border-radius:8px; padding:12px; margin-bottom:12px">
                    <h3 style="margin:0 0 8px 0">Observações</h3>
                    <div style="white-space:pre-wrap; color:#111827">${p.observacoes || '-'}</div>
                </div>

                <div style="border:1px solid #e5e7eb; border-radius:8px; padding:12px">
                    <h3 style="margin:0 0 8px 0">Checklist</h3>
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
