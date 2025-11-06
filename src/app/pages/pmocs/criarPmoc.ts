import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, FormControl } from '@angular/forms';
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
import { CardModule } from 'primeng/card';
import { RippleModule } from 'primeng/ripple';

@Component({
    selector: 'app-pmocs',
    standalone: true,

    imports: [CommonModule, ReactiveFormsModule, InputTextModule, FluidModule, ButtonModule, SelectModule, MultiSelectModule, CheckboxModule, TextareaModule, FileUploadModule, InputNumberModule, CardModule, RippleModule],
    template: `<div class="form-wrapper">
        <form [formGroup]="formulario" (ngSubmit)="enviar()" class="w-full">
            <div class="flex flex-col gap-6">
                <p-header>Criar PMOC</p-header>

                <div class="card p-fluid client-card">
                    <div class="font-semibold text-xl mb-4">Informações do Cliente</div>
                    <div class="formgrid grid fg-compact">
                        <div class="field col-12">
                            <label for="cliente">Cliente | Empresa *</label>
                            <input id="cliente" pInputText type="text" formControlName="cliente" placeholder="Nome do cliente" />
                        </div>
                    </div>
                </div>

                <!-- Equipamentos -->
                <div class="card p-fluid">
                    <div class="font-semibold text-xl mb-4">Equipamentos</div>
                    <div formArrayName="equipamentos" class="flex flex-col gap-4">
                        <p-card *ngFor="let eqCtrl of equipamentos.controls; let i = index; trackBy: trackByEquipment" [formGroupName]="i" styleClass="equipment-pcard">
                            <!-- delete button pinned to top-right -->
                            <button pButton pRipple type="button" icon="pi pi-trash" class="p-button-danger p-button-text delete-btn" (click)="removeEquipment(i)" aria-label="Remover equipamento" title="Remover equipamento"></button>

                            <div class="equipment-body">
                                <div class="equip-fields">
                                    <div class="formgrid grid fg-compact p-4">
                                        <div class="field col-12 mt-8">
                                            <label for="equipamento-id-{{ i }}">ID do equipamento</label>
                                            <input id="equipamento-id-{{ i }}" pInputText type="text" formControlName="id" placeholder="Ex: AC001" />
                                        </div>
                                        <div class="field col-12">
                                            <label for="identificacao-{{ i }}">Identificação do ambiente</label>
                                            <input id="identificacao-{{ i }}" pInputText type="text" formControlName="identificacao" />
                                        </div>
                                        <div class="field col-12 md:col-2 lg:col-2">
                                            <label for="ocupantes-{{ i }}">Ocupantes</label>
                                            <p-inputNumber inputId="ocupantes-{{ i }}" formControlName="ocupantes" [useGrouping]="false"></p-inputNumber>
                                        </div>
                                        <div class="field col-12 md:col-2 lg:col-2">
                                            <label for="ocupantesTipo-{{ i }}">Tipo de ocupantes</label>
                                            <p-select id="ocupantesTipo-{{ i }}" [options]="ocupantesTipoOptions" formControlName="ocupantesTipo"></p-select>
                                        </div>

                                        <div class="field col-12 md:col-2 lg:col-3">
                                            <label for="areaClimatizada-{{ i }}">Área (m²)</label>
                                            <p-inputNumber inputId="areaClimatizada-{{ i }}" formControlName="areaClimatizada" [useGrouping]="false"></p-inputNumber>
                                        </div>

                                        <div class="field col-12 md:col-4 lg:col-4">
                                            <label for="equipamentoTipo-{{ i }}">Tipo Equipamento</label>
                                            <p-select id="equipamentoTipo-{{ i }}" [options]="equipamentoOptions" formControlName="equipamentoTipo"></p-select>
                                        </div>
                                        <div class="field col-12 md:col-4 lg:col-4">
                                            <label for="capacidadeBtus-{{ i }}">Capacidade (BTUs)</label>
                                            <p-select id="capacidadeBtus-{{ i }}" [options]="btuOptions" formControlName="capacidadeBtus"></p-select>
                                        </div>
                                        <div class="field col-12 md:col-4 lg:col-4">
                                            <label for="tecnologia-{{ i }}">Tecnologia</label>
                                            <p-select id="tecnologia-{{ i }}" [options]="tecnologiaOptions" formControlName="tecnologia"></p-select>
                                        </div>
                                        <div class="field col-12 md:col-4 lg:col-4">
                                            <label for="tipoGas-{{ i }}">Gás Refrigerante</label>
                                            <p-select id="tipoGas-{{ i }}" [options]="gasOptions" formControlName="tipoGas"></p-select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </p-card>

                        <div>
                            <button pButton type="button" icon="pi pi-plus" class="p-button-sm p-button-warning w-full flex-none whitespace-nowrap" (click)="addEquipment()">Adicionar equipamento</button>
                        </div>
                    </div>
                </div>

                <!-- Actions -->
                <div class="flex justify-end mt-2">
                    <button pButton type="submit" class="p-button-warning flex-none whitespace-nowrap">Salvar</button>
                </div>
            </div>
        </form>
    </div>`,
    styleUrls: ['./criarPmoc.scss']
})
export class CriarPmoc {
    formulario: FormGroup;
    // (no header/collapse) keep form flat per equipment
    // debug fields removed

    // month name maps for normalization (english and portuguese)
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

    // pt-BR locale object for PrimeNG datepicker
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

    // Equipment type options (updated per screenshot)
    equipamentoOptions = [
        { label: 'Wi-Hall', value: 'wi-hall' },
        { label: 'Built-in', value: 'built-in' },
        { label: 'Self', value: 'self' },
        { label: 'Cassete', value: 'cassete' },
        { label: 'ACJ', value: 'acj' },
        { label: 'MultiSplit', value: 'multisplit' }
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

    // Equipment-related select options
    ocupantesTipoOptions = [
        { label: 'Fixos', value: 'fixos' },
        { label: 'Variáveis', value: 'variaveis' }
    ];

    tecnologiaOptions = [
        { label: 'Convencional', value: 'convencional' },
        { label: 'Inverter', value: 'inverter' }
    ];

    // Refrigerant gas options updated per screenshot
    gasOptions = [
        { label: 'R22', value: 'R22' },
        { label: 'R32', value: 'R32' },
        { label: 'R410', value: 'R410' }
    ];

    // Common capacity (BTUs) options shown in the UI screenshot
    btuOptions = [
        { label: '9000 Btus', value: 9000 },
        { label: '12000 Btus', value: 12000 },
        { label: '18000 Btus', value: 18000 },
        { label: '24000 Btus', value: 24000 },
        { label: '30000 Btus', value: 30000 },
        { label: '36000 Btus', value: 36000 },
        { label: '42000 Btus', value: 42000 },
        { label: '58000 Btus', value: 58000 },
        { label: '60000 Btus', value: 60000 }
    ];

    constructor(private fb: FormBuilder) {
        const checklistControls = this.checklist.reduce((acc, item) => {
            acc[item.controlName] = [false];
            return acc;
        }, {} as any);

        this.formulario = this.fb.group({
            cliente: ['', Validators.required],
            // equipamentos is a FormArray allowing multiple equipment entries
            equipamentos: this.fb.array([this.createEquipmentGroup()]),
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

        // Normalize date inputs: if user types or an external value is set as string,
        // convert it to a Date so the datepicker shows correctly using the dateFormat.
        const dm = this.formulario.get('dataManutencao');
        const pm = this.formulario.get('proximaManutencao');

        dm?.valueChanges.subscribe((v) => {
            const d = this.normalizeDate(v);
            if (d) {
                // if current value is not a Date, or differs from normalized (different time), set normalized Date
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

    // FormArray helper: accessor for equipamentos
    get equipamentos(): FormArray {
        return this.formulario.get('equipamentos') as FormArray;
    }

    // Create a new equipment FormGroup with the required fields
    private createEquipmentGroup(initial?: any): FormGroup {
        return this.fb.group({
            id: [initial?.id || ''],
            identificacao: [initial?.identificacao || '', Validators.required],
            ocupantes: [initial?.ocupantes || null],
            ocupantesTipo: [initial?.ocupantesTipo || 'fixos'],
            areaClimatizada: [initial?.areaClimatizada || null],
            equipamentoTipo: [initial?.equipamentoTipo || '', Validators.required],
            capacidadeBtus: [initial?.capacidadeBtus || null],
            tecnologia: [initial?.tecnologia || null],
            tipoGas: [initial?.tipoGas || null]
        });
    }

    addEquipment(initial?: any) {
        this.equipamentos.push(this.createEquipmentGroup(initial));
        // small UX nicety: focus the identificacao input of newly added equipment
        setTimeout(() => {
            try {
                const idx = this.equipamentos.length - 1;
                const el = document.getElementById(`identificacao-${idx}`) as HTMLInputElement | null;
                el?.focus();
            } catch (e) {
                // ignore focus errors
            }
        }, 0);
    }

    removeEquipment(index: number) {
        this.equipamentos.removeAt(index);
    }

    // (Collapsed/duplicate helpers removed) equipment forms are rendered inline without collapse or duplication.

    // trackBy to improve rendering performance
    trackByEquipment(index: number, ctrl: any) {
        try {
            return ctrl.get('id')?.value || ctrl.get('identificacao')?.value || index;
        } catch (e) {
            return index;
        }
    }

    // helper to get FormControl inside equipamentos FormArray
    equipControl(i: number, name: string): FormControl | null {
        const g = this.equipamentos.at(i) as FormGroup;
        if (!g) return null;
        return g.get(name) as FormControl;
    }

    enviar() {
        const raw = this.formulario.value;

        const dataMan = this.normalizeDate(raw.dataManutencao);
        const proxima = this.normalizeDate(raw.proximaManutencao);

        const payload = {
            ...raw,
            dataManutencao: dataMan ? this.formatDateToIso(dataMan) : null,
            proximaManutencao: proxima ? this.formatDateToIso(proxima) : null
        };

        // Enviar payload ao backend ou gerar PDF. Datas em yyyy-MM-dd conforme solicitado.
    }

    // Helpers
    private pad(n: number) {
        return n < 10 ? '0' + n : String(n);
    }

    // Pad to 3 digits for equipment IDs (001, 012, 123)
    private pad3(n: number) {
        if (n < 10) return '00' + n;
        if (n < 100) return '0' + n;
        return String(n);
    }

    // Compute equipment ID based on index: AC001, AC002, ...
    getEquipmentId(index: number): string {
        return `AC${this.pad3(index + 1)}`;
    }

    private formatDateToIso(d: Date): string {
        // yyyy-MM-dd
        return `${d.getFullYear()}-${this.pad(d.getMonth() + 1)}-${this.pad(d.getDate())}`;
    }

    private formatDateToDisplay(d: Date): string {
        // dd/MM/yyyy (for reference, DatePicker displays according to dateFormat)
        return `${this.pad(d.getDate())}/${this.pad(d.getMonth() + 1)}/${d.getFullYear()}`;
    }

    private normalizeDate(value: any): Date | null {
        if (!value && value !== 0) return null;
        if (value instanceof Date) return value;
        if (typeof value === 'number') return new Date(value);

        let s = String(value).trim();

        // Try dd/MM/yyyy or dd-MM-yyyy
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

        // Try pattern with month name, e.g. '16 October 2025' or '16/October/20252025'
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

        // Fallback: try Date constructor
        const dt = new Date(s);
        if (isNaN(dt.getTime())) return null;
        dt.setHours(0, 0, 0, 0);
        return dt;
    }

    // Note: manual DOM writes to the datepicker input were removed to avoid conflicts
}
