import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FluidModule } from 'primeng/fluid';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { CheckboxModule } from 'primeng/checkbox';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { FileUploadModule } from 'primeng/fileupload';
import { CommonModule } from '@angular/common';
import { DatepickerComponent } from '../../shared/datepicker/datepicker.component';
import { PmocScheduleService } from './pmoc-schedule.service';

@Component({
    selector: 'app-registrar-atendimento',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, InputTextModule, DatepickerComponent, FluidModule, ButtonModule, SelectModule, MultiSelectModule, CheckboxModule, TextareaModule, FileUploadModule, InputNumberModule],
    template: `<p-fluid>
        <form [formGroup]="formulario" (ngSubmit)="enviar()" enctype="multipart/form-data" class="w-full">
            <div class="flex flex-col md:flex-row gap-8">
                <div class="md:w-full">
                    <div class="card flex flex-col gap-4">
                        <div class="font-semibold text-xl">Registro de Atendimento</div>

                        <div class="flex flex-col gap-2">
                            <label for="cliente">Cliente | Empresa *</label>
                            <p-select id="cliente" class="w-full" [options]="clienteOptions" formControlName="cliente" placeholder="Selecione"></p-select>
                        </div>

                        <div class="flex flex-col gap-2">
                            <label for="equipamento">ID Equipamento | Setor | Capacidade *</label>
                            <p-select id="equipamento" class="w-full" [options]="equipamentoOptions" formControlName="equipamento" placeholder="Selecione o equipamento"></p-select>
                        </div>

                        <div class="grid grid-cols-12 gap-2">
                            <label for="dataAtendimento" class="flex items-center col-span-12 md:col-span-4 md:mb-0">Data do Atendimento</label>
                            <div class="col-span-12 md:col-span-8">
                                <app-datepicker inputId="dataAtendimento" formControlName="dataManutencao"></app-datepicker>
                            </div>
                        </div>

                        <div class="flex flex-col gap-2">
                            <label for="tipoAtendimento">Tipo de Atendimento *</label>
                            <p-select id="tipoAtendimento" class="w-full" [options]="tipoManutencaoOptions" formControlName="tipoManutencao" placeholder="Selecione o tipo"></p-select>
                        </div>

                        <div class="flex flex-col gap-2">
                            <label for="statusEquipamento">Status do Equipamento *</label>
                            <p-select id="statusEquipamento" class="w-full" [options]="statusOptions" formControlName="statusEquipamento" placeholder="Selecione"></p-select>
                        </div>
                    </div>

                    <div class="card flex flex-col gap-4">
                        <div class="font-semibold text-xl">Checklist de Inspeção</div>
                        <div class="grid gap-2">
                            <div *ngFor="let item of checklist" class="grid grid-cols-1 md:grid-cols-12 items-start md:items-center gap-2 w-full">
                                <div class="col-span-1 md:col-span-9 flex items-start md:items-center gap-2">
                                    <p-checkbox binary="true" [formControlName]="item.controlName"></p-checkbox>
                                    <label class="text-sm">{{ item.label }}</label>
                                </div>
                                <div class="col-span-1 md:col-span-3 mt-2 md:mt-0">
                                    <!-- per-item periodicity: disabled until the checkbox is checked -->
                                    <p-select class="w-full" [options]="periodicidadeOptions" [formControlName]="item.controlName + '_period'" placeholder="Periodicidade" appendTo="self"></p-select>
                                </div>
                            </div>
                        </div>
                        <div class="flex flex-col gap-2">
                            <label for="checklistOutros">Outros</label>
                            <textarea id="checklistOutros" pInputTextarea formControlName="checklistOutros" placeholder="Outros..."></textarea>
                        </div>
                    </div>

                    <div class="card flex flex-col gap-4 mt-4">
                        <div class="font-semibold text-xl">Responsável</div>
                        <div class="flex flex-col gap-2">
                            <label for="responsavel">Responsável pelo Atendimento Técnico *</label>
                            <input id="responsavel" type="text" pInputText formControlName="responsavel" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label for="periodicidade">Periodicidade da Manutenção *</label>
                            <p-multiSelect id="periodicidade" class="w-full" [options]="periodicidadeOptions" formControlName="periodicidade" placeholder="Selecione a(s) periodicidade(s)" display="chip" [filter]="true"></p-multiSelect>
                        </div>
                        <div class="grid grid-cols-12 gap-2">
                            <label for="proximaManutencao" class="flex items-center col-span-12 md:col-span-4 md:mb-0">Previsão Próxima Manutenção</label>
                            <div class="col-span-12 md:col-span-8">
                                <app-datepicker inputId="proximaManutencao" formControlName="proximaManutencao"></app-datepicker>
                            </div>
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
                        <!-- render text as button content to ensure visibility on all breakpoints -->
                        <button pButton type="submit" class="flex-none whitespace-nowrap px-6">Enviar</button>
                    </div>
                </div>
            </div>
        </form>
    </p-fluid>`,
    styles: [
        `
            :host ::ng-deep .p-fluid .p-field {
                margin-bottom: 1.5rem;
            }
        `
    ]
})
export class RegistrarAtendimento implements OnInit {
    formulario: FormGroup;

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

    equipamentoOptions: { label: string; value: string }[] = [];

    tipoManutencaoOptions = [
        { label: 'PMOC', value: 'PMOC' },
        { label: 'PREVENTIVA', value: 'PREVENTIVA' },
        { label: 'CORRETIVA', value: 'CORRETIVA' }
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

    constructor(private fb: FormBuilder, private route: ActivatedRoute, private pmocSchedule: PmocScheduleService) {
        const checklistControls = this.checklist.reduce((acc, item) => {
            // control for the boolean checkbox
            acc[item.controlName] = [false];
            // control for the per-item periodicity (null when not selected) - initialize disabled
            acc[`${item.controlName}_period`] = [{ value: null, disabled: true }];
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
            periodicidade: [[], Validators.required],
            proximaManutencao: [null],
            custos: [null, Validators.min(0)],
            assinatura: ['', Validators.required]
        });

        // Subscribe to each checklist checkbox and enable/disable its periodicity control
        this.checklist.forEach((item) => {
            const chkCtrl = this.formulario.get(item.controlName);
            const periodCtrl = this.formulario.get(`${item.controlName}_period`);
            if (chkCtrl && periodCtrl) {
                // when checkbox changes, toggle enabled state of periodicity control
                chkCtrl.valueChanges.subscribe((checked: boolean) => {
                    if (checked) {
                        periodCtrl.enable({ emitEvent: false });
                    } else {
                        periodCtrl.disable({ emitEvent: false });
                    }
                });
            }
        });
    }

    ngOnInit(): void {
        // Try to read equipment id from route params (path) or query params.
        const paramCandidates = ['id_equipamento', 'equipamentoId', 'equipamento', 'id'];

        let equipamentoId: string | null = null;
        for (const key of paramCandidates) {
            equipamentoId = this.route.snapshot.paramMap.get(key) || equipamentoId;
        }

        if (!equipamentoId) {
            for (const key of paramCandidates) {
                equipamentoId = this.route.snapshot.queryParamMap.get(key) || equipamentoId;
            }
        }

        if (equipamentoId) {
            const eq = this.pmocSchedule.getEquipment(equipamentoId);
            if (eq) {
                const label = `${eq.id} | ${eq.ambiente || ''} | ${eq.capacidadeBtus ? eq.capacidadeBtus + ' BTUS' : ''}`.trim();
                this.equipamentoOptions = [{ label, value: eq.id }];
                this.formulario.patchValue({ equipamento: eq.id, cliente: eq.clientId || eq.cliente || '', statusEquipamento: eq.statusEquipamento || null });
            } else {
                this.equipamentoOptions = this.pmocSchedule.getAllEquipments().map((e) => ({ label: `${e.id} | ${e.ambiente || ''} | ${e.capacidadeBtus ? e.capacidadeBtus + ' BTUS' : ''}`, value: e.id }));
            }
        } else {
            this.equipamentoOptions = this.pmocSchedule.getAllEquipments().map((e) => ({ label: `${e.id} | ${e.ambiente || ''} | ${e.capacidadeBtus ? e.capacidadeBtus + ' BTUS' : ''}`, value: e.id }));
        }
    }

    enviar() {
        const raw = this.formulario.getRawValue(); // include all values consistently
        // periodicities per checklist item will be available as chkX_period in the payload
        // map dates same as CriarPmoc if needed
        // TODO: send payload to backend
    }
}
