import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FluidModule } from 'primeng/fluid';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { CheckboxModule } from 'primeng/checkbox';
import { TextareaModule } from 'primeng/textarea';
import { FileUploadModule } from 'primeng/fileupload';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-pmocs',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, InputTextModule, FluidModule, ButtonModule, SelectModule, DatePickerModule, CheckboxModule, TextareaModule, FileUploadModule],
    template: `<p-fluid>
        <form [formGroup]="formulario" (ngSubmit)="enviar()" enctype="multipart/form-data" class="w-full">
            <div class="flex flex-col md:flex-row gap-8">
                <div class="md:w-1/2">
                    <div class="card flex flex-col gap-4">
                        <div class="font-semibold text-xl">PMOC - Registro de Atendimentos</div>

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
                                <p-date-picker id="dataManutencao" formControlName="dataManutencao" dateFormat="dd/mm/yyyy" placeholder="dd/mm/aaaa"></p-date-picker>
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
                                <p-date-picker id="proximaManutencao" formControlName="proximaManutencao" dateFormat="dd/mm/yyyy" placeholder="dd/mm/aaaa"></p-date-picker>
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
                            <p-fileUpload id="fotos" name="fotos" url="URL_DO_BACKEND" [maxFileSize]="10000000" [multiple]="true" [auto]="true" chooseLabel="Upload"></p-fileUpload>
                        </div>

                        <div class="flex justify-end">
                            <button pButton type="submit" label="Enviar"></button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="flex mt-8">
                <div class="card flex flex-col gap-4 w-full">
                    <div class="font-semibold text-xl">Custos e Assinatura</div>
                    <div class="flex flex-col gap-2">
                        <label for="custos">Custos | Despesas</label>
                        <textarea id="custos" pInputTextarea formControlName="custos"></textarea>
                    </div>
                    <div class="flex flex-col gap-2">
                        <label for="assinatura">Confirmação | Assinatura Digital *</label>
                        <p-select id="assinatura" class="w-full" [options]="assinaturaOptions" formControlName="assinatura" placeholder="Selecione confirmação"></p-select>
                    </div>
                </div>
            </div>
        </form>
    </p-fluid>`,
    styles: [`
        :host ::ng-deep .p-fluid .p-field {
            margin-bottom: 1.5rem;
        }
    `]
})
export class CriarPmoc {
    formulario: FormGroup;

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

    constructor(private fb: FormBuilder) {
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
            custos: [''],
            assinatura: ['', Validators.required]
        });
    }

    enviar() {
        console.log(this.formulario.value);
        // Aqui você pode integrar com backend ou gerar PDF
    }
}
