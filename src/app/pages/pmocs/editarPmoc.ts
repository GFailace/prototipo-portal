import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FluidModule } from 'primeng/fluid';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { FileUploadModule } from 'primeng/fileupload';
import { CommonModule } from '@angular/common';
import { DatepickerComponent } from '../../shared/datepicker/datepicker.component';
import { PmocService, Pmoc } from './pmoc.service';
import { Subscription } from 'rxjs';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-pmoc-edit',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, InputTextModule, DatepickerComponent, FluidModule, ButtonModule, SelectModule, CheckboxModule, TextareaModule, FileUploadModule, InputNumberModule],
    template: `<p-fluid>
        <div class="card">
            <div class="flex items-center justify-between mb-4">
                <div class="font-semibold text-2xl">Editar PMOC — {{ pmocId }}</div>
                <p-button label="Voltar" class="p-button-sm" (onClick)="goBack()"></p-button>
            </div>

            <form [formGroup]="formulario" (ngSubmit)="enviar()" class="w-full">
                <div class="flex flex-col md:flex-row gap-8">
                    <div class="md:w-1/2">
                        <div class="card flex flex-col gap-4">
                            <div class="font-semibold text-xl">PMOC - Editar</div>

                            <div class="flex flex-col gap-2">
                                <label for="cliente">Cliente | Empresa *</label>
                                <p-select id="cliente" class="w-full" [options]="clienteOptions" formControlName="cliente" placeholder="Selecione"></p-select>
                            </div>

                            <div class="flex flex-col gap-2">
                                <label for="equipamento">ID Equipamento | Setor | Capacidade *</label>
                                <p-select id="equipamento" class="w-full" [options]="equipamentoOptions" formControlName="equipamento" placeholder="Selecione o equipamento"></p-select>
                            </div>

                            <div class="grid grid-cols-12 gap-2">
                                <label for="dataManutencao" class="flex items-center col-span-12 mb-2 md:col-span-4 md:mb-0">Data da Manutenção</label>
                                <div class="col-span-12 md:col-span-8">
                                    <app-datepicker inputId="dataManutencao" formControlName="dataManutencao"></app-datepicker>
                                </div>
                            </div>

                            <div class="flex flex-col gap-2">
                                <label for="tipoManutencao">Tipo de Manutenção *</label>
                                <p-select id="tipoManutencao" class="w-full" [options]="tipoManutencaoOptions" formControlName="tipoManutencao" placeholder="Selecione o tipo"></p-select>
                            </div>

                            <div class="flex flex-col gap-2">
                                <label for="statusEquipamento">Status do Equipamento *</label>
                                <p-select id="statusEquipamento" class="w-full" [options]="statusOptions" formControlName="statusEquipamento" placeholder="Selecione"></p-select>
                            </div>
                        </div>

                        <div class="card flex flex-col gap-4 mt-4">
                            <div class="font-semibold text-xl">Responsável e Periodicidade</div>
                            <div class="flex flex-col gap-2">
                                <label for="responsavel">Responsável pelo Atendimento Técnico *</label>
                                <input id="responsavel" type="text" pInputText formControlName="responsavel" />
                            </div>
                            <div class="flex flex-col gap-2">
                                <label for="periodicidade">Periodicidade da Manutenção *</label>
                                <p-select id="periodicidade" class="w-full" [options]="periodicidadeOptions" formControlName="periodicidade" placeholder="Selecione a periodicidade"></p-select>
                            </div>
                            <div class="grid grid-cols-12 gap-2">
                                <label for="proximaManutencao" class="flex items-center col-span-12 mb-2 md:col-span-4 md:mb-0">Previsão Próxima Manutenção</label>
                                <div class="col-span-12 md:col-span-8">
                                    <app-datepicker inputId="proximaManutencao" formControlName="proximaManutencao"></app-datepicker>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="md:w-1/2">
                        <div class="card flex flex-col gap-4">
                            <div class="font-semibold text-xl">Checklist de Inspeção</div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <div *ngFor="let item of checklist" class="flex items-center gap-2">
                                    <p-checkbox binary="true" [formControlName]="item.controlName"></p-checkbox>
                                    <span class="text-sm">{{ item.label }}</span>
                                </div>
                            </div>
                            <div class="flex flex-col gap-2">
                                <label for="checklistOutros">Outros</label>
                                <textarea id="checklistOutros" pInputTextarea formControlName="checklistOutros" placeholder="Outros..."></textarea>
                            </div>
                        </div>

                        <div class="card flex flex-col gap-4 mt-4">
                            <div class="font-semibold text-xl">Observações e Evidências</div>
                            <div class="flex flex-col gap-2">
                                <label for="observacoes">Observações | Problemas Encontrados</label>
                                <textarea id="observacoes" pInputTextarea formControlName="observacoes"></textarea>
                            </div>
                            <div class="flex flex-col gap-2">
                                <label for="fotos">Upload de Fotos | Evidências</label>
                                <p-fileUpload id="fotos" name="fotos" url="URL_DO_BACKEND" [maxFileSize]="10000000" [multiple]="true" [auto]="true" chooseLabel="Selecionar"></p-fileUpload>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="flex mt-8">
                    <div class="card flex flex-col gap-4 w-full">
                        <div class="font-semibold text-xl">Custos e Assinatura</div>
                        <div class="flex flex-col gap-2">
                            <label for="custos">Custos | Despesas</label>
                            <p-inputNumber id="custos" formControlName="custos" class="w-full" mode="currency" currency="BRL" locale="pt-BR" [min]="0"></p-inputNumber>
                        </div>

                        <div class="flex flex-col gap-2">
                            <label for="assinatura">Confirmação | Assinatura Digital *</label>
                            <p-select id="assinatura" class="w-full" [options]="assinaturaOptions" formControlName="assinatura" placeholder="Selecione confirmação"></p-select>
                        </div>
                        <div class="flex justify-end">
                            <button pButton type="submit" label="Salvar"></button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    </p-fluid>`
})
export class EditarPmoc implements OnInit {
    formulario: FormGroup;
    pmocId: string | null = null;
    private sub: Subscription | null = null;
    // debug fields removed

    // options and checklist — duplicate from criarPmoc for consistency
    private monthNames: Record<string, number> = {
        janeiro: 1,
        fevereiro: 2,
        marco: 3,
        março: 3,
        abril: 4,
        maio: 5,
        junho: 6,
        julho: 7,
        agosto: 8,
        setembro: 9,
        outubro: 10,
        novembro: 11,
        dezembro: 12,
        january: 1,
        february: 2,
        march: 3,
        april: 4,
        may: 5,
        june: 6,
        july: 7,
        august: 8,
        september: 9,
        october: 10,
        november: 11,
        december: 12
    };

    ptBr = {
        firstDayOfWeek: 0,
        dayNames: ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'],
        dayNamesShort: ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'],
        dayNamesMin: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
        monthNames: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'],
        monthNamesShort: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
        today: 'Hoje',
        clear: 'Limpar'
    };

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

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private pmocService: PmocService,
        private msg: MessageService
    ) {
        const checklistControls = this.checklist.reduce((acc, item) => {
            acc[item.controlName] = [false];
            return acc;
        }, {} as any);

        this.formulario = this.fb.group({
            cliente: ['', Validators.required],
            equipamento: ['', Validators.required],
            dataManutencao: [null, Validators.required],
            tipoManutencao: ['', Validators.required],
            statusEquipamento: [null, Validators.required],
            ...checklistControls,
            checklistOutros: [''],
            observacoes: [''],
            responsavel: ['', Validators.required],
            periodicidade: ['', Validators.required],
            proximaManutencao: [null],
            custos: [null, Validators.min(0)],
            assinatura: ['', Validators.required]
        });

        const dm = this.formulario.get('dataManutencao');
        const pm = this.formulario.get('proximaManutencao');

        dm?.valueChanges.subscribe((v) => {
            const d = this.normalizeDate(v);
            if (d) {
                const needSet = !(v instanceof Date) || (v instanceof Date && v.getTime() !== d.getTime());
                if (needSet) {
                    dm.setValue(d);
                }
            }
        });

        pm?.valueChanges.subscribe((v) => {
            const d = this.normalizeDate(v);
            if (d) {
                const needSet = !(v instanceof Date) || (v instanceof Date && v.getTime() !== d.getTime());
                if (needSet) {
                    pm.setValue(d);
                }
            }
        });
    }

    ngOnInit(): void {
        this.pmocId = this.route.snapshot.paramMap.get('id');
        if (!this.pmocId) {
            this.msg.add({ severity: 'error', summary: 'Erro', detail: 'ID não informado.' });
            this.router.navigate(['/pages/pmocs/listar-pmocs']);
            return;
        }

        // subscribe once to get the current PMOC and populate form
        this.sub = this.pmocService.pmocs$.subscribe((list) => {
            const p = list.find((x) => x.id === this.pmocId);
            if (!p) {
                this.msg.add({ severity: 'error', summary: 'Não encontrado', detail: 'PMOC não encontrado.' });
                this.router.navigate(['/pages/pmocs/listar-pmocs']);
                return;
            }

            // patch form values
            const patch: any = {
                cliente: p.cliente || undefined,
                equipamento: p.equipamento || undefined,
                // use iso-safe parser to avoid timezone shifts when converting 'yyyy-MM-dd' strings
                dataManutencao: p.dataManutencao ? this.parseDateFromIso(p.dataManutencao) : undefined,
                proximaManutencao: p.proximaManutencao ? this.parseDateFromIso(p.proximaManutencao) : undefined,
                tipoManutencao: p.tipoManutencao || undefined,
                statusEquipamento: p.statusEquipamento || undefined,
                responsavel: p.responsavel || undefined,
                periodicidade: p.periodicidade || undefined,
                observacoes: p.observacoes || undefined,
                custos: this.parseCurrencyToNumber(p.custos),
                checklistOutros: p.checklistOutros || undefined,
                assinatura: p.assinatura || undefined
            };

            for (const item of this.checklist) {
                patch[item.controlName] = !!(p.checklist && p.checklist[item.controlName]);
            }

            this.formulario.patchValue(patch);
        });
    }

    goBack() {
        this.router.navigate(['/pages/pmocs/listar-pmocs']);
    }

    enviar() {
        if (!this.pmocId) return;
        if (!this.formulario.valid) {
            this.formulario.markAllAsTouched();
            return;
        }

        const raw = this.formulario.value;
        const dataMan = this.normalizeDate(raw.dataManutencao);
        const proxima = this.normalizeDate(raw.proximaManutencao);

        // build checklist
        const checklistObj: Record<string, boolean> = {};
        for (const item of this.checklist) checklistObj[item.controlName] = !!raw[item.controlName];

        const patch: Partial<Pmoc> = {
            cliente: raw.cliente,
            equipamento: raw.equipamento,
            // service expects ISO 'yyyy-MM-dd' strings
            dataManutencao: dataMan ? this.formatDateToIso(dataMan) : undefined,
            proximaManutencao: proxima ? this.formatDateToIso(proxima) : undefined,
            tipoManutencao: raw.tipoManutencao,
            statusEquipamento: raw.statusEquipamento,
            responsavel: raw.responsavel,
            periodicidade: raw.periodicidade,
            observacoes: raw.observacoes,
            custos: this.formatCurrencyBRL(raw.custos),
            checklist: checklistObj,
            checklistOutros: raw.checklistOutros,
            assinatura: raw.assinatura
        };

        this.pmocService.update(this.pmocId, patch);
        this.msg.add({ severity: 'success', summary: 'Salvo', detail: 'PMOC atualizado.' });
        this.router.navigate(['/pages/pmocs/listar-pmocs']);
    }

    private pad(n: number) {
        return n < 10 ? '0' + n : String(n);
    }

    private formatDateToIso(d: Date): string {
        return `${d.getFullYear()}-${this.pad(d.getMonth() + 1)}-${this.pad(d.getDate())}`;
    }

    // Parse strings like 'yyyy-MM-dd' into a local Date (avoid UTC shift from Date(string))
    private parseDateFromIso(value: any): Date {
        if (!value) return new Date(NaN);
        if (value instanceof Date) return new Date(value.getFullYear(), value.getMonth(), value.getDate());
        const s = String(value).trim();
        const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (m) {
            const y = parseInt(m[1], 10);
            const mo = parseInt(m[2], 10);
            const d = parseInt(m[3], 10);
            return new Date(y, mo - 1, d);
        }
        const dt = new Date(s);
        if (isNaN(dt.getTime())) return new Date(NaN);
        return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
    }

    // Note: manual DOM writes to the datepicker input were removed to avoid conflicts

    private formatCurrencyBRL(value: any): string {
        if (value === null || value === undefined || value === '') return '';
        const num =
            typeof value === 'number'
                ? value
                : parseFloat(
                      String(value)
                          .toString()
                          .replace(/[^0-9-,.]/g, '')
                          .replace(',', '.')
                  );
        if (isNaN(num)) return '';
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
    }

    private parseCurrencyToNumber(value: any): number | null {
        if (value === null || value === undefined || value === '') return null;
        if (typeof value === 'number') return value;
        const cleaned = String(value)
            .replace(/\s/g, '')
            .replace(/R\$|\$/g, '')
            .replace(/\./g, '')
            .replace(/,/g, '.');
        const n = parseFloat(cleaned);
        return isNaN(n) ? null : n;
    }

    private normalizeDate(value: any): Date | null {
        if (!value && value !== 0) return null;
        if (value instanceof Date) return value;
        if (typeof value === 'number') return new Date(value);

        let s = String(value).trim();
        const parts = s.split(/[\/\-]/);
        if (parts.length >= 3) {
            const day = parseInt(parts[0].replace(/\D/g, ''), 10);
            const month = parseInt(parts[1].replace(/\D/g, ''), 10);
            const year = parseInt(parts[2].replace(/\D/g, '').slice(0, 4), 10);
            if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                const dt = new Date(year, month - 1, day);
                dt.setHours(0, 0, 0, 0);
                return dt;
            }
        }

        const m = s.match(/(\d{1,2})[^\dA-Za-z]*([A-Za-zÀ-ÿ]+)[^\dA-Za-z]*(\d{4})/);
        if (m) {
            const day = parseInt(m[1], 10);
            const monthName = m[2].toLowerCase();
            const year = parseInt(m[3], 10);
            const monthNum = this.monthNames[monthName];
            if (!isNaN(day) && monthNum && !isNaN(year)) {
                const dt = new Date(year, monthNum - 1, day);
                dt.setHours(0, 0, 0, 0);
                return dt;
            }
        }

        const dt = new Date(s);
        if (isNaN(dt.getTime())) return null;
        dt.setHours(0, 0, 0, 0);
        return dt;
    }
}
