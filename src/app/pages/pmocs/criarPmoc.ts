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
                            <input id="equipamento" type="text" pInputText formControlName="equipamento" />
                        </div>

                        <div class="grid grid-cols-12 gap-2">
                            <label for="dataManutencao" class="flex items-center col-span-12 mb-2 md:col-span-4 md:mb-0">Data da Manutenção</label>
                            <div class="col-span-12 md:col-span-8">
                                <p-date-picker id="dataManutencao" formControlName="dataManutencao" dateFormat="dd/mm/yyyy" placeholder="dd/mm/aaaa"></p-date-picker>
                            </div>
                        </div>

                        <div class="flex flex-col gap-2">
                            <label for="tipoManutencao">Tipo de Manutenção *</label>
                            <input id="tipoManutencao" type="text" pInputText formControlName="tipoManutencao" />
                        </div>

                        <div class="flex flex-col gap-2">
                            <label for="statusEquipamento">Status do Equipamento *</label>
                            <p-select id="statusEquipamento" class="w-full" [options]="statusOptions" formControlName="statusEquipamento" placeholder="Selecione"></p-select>
                        </div>
                    </div>

                    <div class="card flex flex-col gap-4 mt-4">
                        <div class="font-semibold text-xl">Responsável & Periodicidade</div>
                        <div class="flex flex-col gap-2">
                            <label for="responsavel">Responsável pelo Atendimento Técnico *</label>
                            <input id="responsavel" type="text" pInputText formControlName="responsavel" />
                        </div>
                        <div class="flex flex-col gap-2">
                            <label for="periodicidade">Periodicidade da Manutenção *</label>
                            <input id="periodicidade" type="text" pInputText formControlName="periodicidade" />
                        </div>
                        <div class="grid grid-cols-12 gap-2">
                            <label for="proximaManutencao" class="flex items-center col-span-12 mb-2 md:col-span-4 md:mb-0">Previsão Próxima Manutenção</label>
                            <div class="col-span-12 md:col-span-8">
                                <p-date-picker id="proximaManutencao" formControlName="proximaManutencao" dateFormat="dd/mm/yy"></p-date-picker>
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
                        <div class="font-semibold text-xl">Observações & Evidências</div>
                        <div class="flex flex-col gap-2">
                            <label for="observacoes">Observações | Problemas Encontrados</label>
                            <textarea id="observacoes" pInputTextarea formControlName="observacoes"></textarea>
                        </div>

                        <div class="flex flex-col gap-2">
                            <label for="fotos">Upload de Fotos | Evidências</label>
                            <p-fileUpload id="fotos" name="fotos" url="URL_DO_BACKEND" [maxFileSize]="10000000" [multiple]="true" [auto]="true"></p-fileUpload>
                        </div>

                        <div class="flex justify-end">
                            <button pButton type="submit" label="Enviar"></button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="flex mt-8">
                <div class="card flex flex-col gap-4 w-full">
                    <div class="font-semibold text-xl">Custos & Assinatura</div>
                    <div class="flex flex-col gap-2">
                        <label for="custos">Custos | Despesas</label>
                        <textarea id="custos" pInputTextarea formControlName="custos"></textarea>
                    </div>
                    <div class="flex flex-col gap-2">
                        <label for="assinatura">Confirmação | Assinatura Digital *</label>
                        <input id="assinatura" type="text" pInputText formControlName="assinatura" />
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
        { label: 'Funcionando', value: 'funcionando' },
        { label: 'Com falhas', value: 'com_falhas' },
        { label: 'Parado', value: 'parado' }
    ];

    clienteOptions = [
        { label: 'BHIO SUPPLY | ESTEIO - RS', value: 'BHIO SUPPLY | ESTEIO - RS' },
        { label: 'BHIO SUPPLY FILIAL | ESTEIO - RS', value: 'BHIO SUPPLY FILIAL | ESTEIO - RS' },
        { label: 'BHIO SUPPLY | CAMPO BOM - RS', value: 'BHIO SUPPLY | CAMPO BOM - RS' }
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
