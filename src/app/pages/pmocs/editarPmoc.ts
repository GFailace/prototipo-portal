import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, FormControl, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FluidModule } from 'primeng/fluid';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { FileUploadModule } from 'primeng/fileupload';
import { CardModule } from 'primeng/card';
import { RippleModule } from 'primeng/ripple';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CommonModule } from '@angular/common';
import { DatepickerComponent } from '../../shared/datepicker/datepicker.component';
import { PmocService, Pmoc } from './pmoc.service';
import { Subscription } from 'rxjs';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
    selector: 'app-pmoc-edit',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, InputTextModule, FluidModule, ButtonModule, SelectModule, CheckboxModule, TextareaModule, FileUploadModule, InputNumberModule, CardModule, RippleModule, ConfirmDialogModule],
    providers: [ConfirmationService],
    template: `<div class="form-wrapper">
        <p-confirmDialog></p-confirmDialog>
        <form [formGroup]="formulario" (ngSubmit)="enviar()" class="w-full">
            <div class="flex flex-col gap-6">
                <p-header>Editar PMOC</p-header>

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
                            <div class="equipment-header" (click)="toggleEquipment(i)" role="button" tabindex="0">
                                <div>
                                    <div class="equipment-id">{{ eqCtrl.get('id')?.value || getEquipmentId(i) }}</div>
                                    <div class="equipment-summary text-sm" style="color:var(--text-color-secondary)">
                                        {{ eqCtrl.get('identificacao')?.value || '-' }} • {{ eqCtrl.get('capacidadeBtus')?.value ? eqCtrl.get('capacidadeBtus')?.value + ' BTUS' : '—' }}
                                    </div>
                                </div>
                                <div class="header-actions">
                                    <button pButton pRipple type="button" icon="pi pi-trash" class="delete-btn p-button-danger p-button-text icon-only" (click)="$event.stopPropagation(); removeEquipment(i)" title="Excluir equipamento" aria-label="Excluir equipamento"></button>
                                    <button pButton pRipple type="button" [icon]="isExpanded(i) ? 'pi pi-chevron-up' : 'pi pi-chevron-down'" class="p-button-text toggle-btn" (click)="$event.stopPropagation(); toggleEquipment(i)"></button>
                                </div>
                            </div>

                            <div *ngIf="isExpanded(i)" class="equipment-body">
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

                            <div *ngIf="!isExpanded(i)" class="equipment-collapsed p-3" (click)="toggleEquipment(i)">
                                <div class="collapsed-grid">
                                    <div class="collapsed-item"><strong>Ocupantes:</strong> {{ eqCtrl.get('ocupantes')?.value || '—' }}</div>
                                    <div class="collapsed-item"><strong>Área:</strong> {{ eqCtrl.get('areaClimatizada')?.value || '—' }} m²</div>
                                    <div class="collapsed-item"><strong>Tecnologia:</strong> {{ eqCtrl.get('tecnologia')?.value || '—' }}</div>
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
    styleUrls: ['./editarPmoc.scss']
})
export class EditarPmoc implements OnInit {
    formulario: FormGroup;
    pmocId: string | null = null;
    private sub: Subscription | null = null;
    // state for equipment collapse/expand
    expandedEquipments: Set<number> = new Set<number>();
    // (no createdAt/validade fields here to match criarPmoc.ts form shape)

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
        { label: 'Wi-Hall', value: 'wi-hall' },
        { label: 'Built-in', value: 'built-in' },
        { label: 'Self', value: 'self' },
        { label: 'Cassete', value: 'cassete' },
        { label: 'ACJ', value: 'acj' },
        { label: 'MultiSplit', value: 'multisplit' }
    ];

    // Equipment-related select options (copied from criarPmoc)
    ocupantesTipoOptions = [
        { label: 'Fixos', value: 'fixos' },
        { label: 'Variáveis', value: 'variaveis' }
    ];

    tecnologiaOptions = [
        { label: 'Convencional', value: 'convencional' },
        { label: 'Inverter', value: 'inverter' }
    ];

    gasOptions = [
        { label: 'R22', value: 'R22' },
        { label: 'R32', value: 'R32' },
        { label: 'R410', value: 'R410' }
    ];

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
        private msg: MessageService,
        private confirmationService: ConfirmationService
    ) {
        const checklistControls = this.checklist.reduce((acc, item) => {
            acc[item.controlName] = [false];
            return acc;
        }, {} as any);

        this.formulario = this.fb.group({
            cliente: ['', Validators.required],
            // equipamentos is a FormArray allowing multiple equipment entries
            equipamentos: this.fb.array([]),
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

        // no createdAt/validade auto-calc here; editor mirrors the create form
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
            // populate equipamentos FormArray (use Portuguese key to match create screen)
            const fa = this.formulario.get('equipamentos') as FormArray;
            if (fa) {
                while (fa.length) fa.removeAt(0);
                const eqs = (p as any).equipments && Array.isArray((p as any).equipments) ? (p as any).equipments : [];
                for (const eq of eqs) {
                    fa.push(this.createEquipmentGroup(eq));
                }
                // if no equipments exist, ensure at least one empty group like create flow
                if (fa.length === 0) {
                    fa.push(this.createEquipmentGroup());
                }
            }
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

        // include equipments from form array (form key 'equipamentos' maps to service 'equipments')
        const fa = this.formulario.get('equipamentos') as FormArray | null;
        if (fa) {
            const equipments = fa.controls.map((c: AbstractControl, idx: number) => {
                const v: any = c.value;
                return {
                    id: v.id || `AC${String(idx + 1).padStart(3, '0')}`,
                    descricao: v.identificacao || '',
                    capacidadeBtus: v.capacidadeBtus ?? null,
                    statusEquipamento: 'EM OPERAÇÃO',
                    atendimentos: [],
                    equipamentoTipo: v.equipamentoTipo || null,
                    tecnologia: v.tecnologia || null,
                    tipoGas: v.tipoGas || null,
                    ocupantes: v.ocupantes ?? null,
                    areaClimatizada: v.areaClimatizada ?? null
                } as any;
            });
            (patch as any).equipments = equipments;
        }

        this.pmocService.update(this.pmocId, patch);
        this.msg.add({ severity: 'success', summary: 'Salvo', detail: 'PMOC atualizado.' });
        this.router.navigate(['/pages/pmocs/listar-pmocs']);
    }

    // equipment form helpers (match criarPmoc structure)
    private createEquipmentGroup(initial?: any): FormGroup {
        return this.fb.group({
            id: [initial?.id || ''],
            identificacao: [initial?.descricao || initial?.identificacao || '', Validators.required],
            ocupantes: [initial?.ocupantes || null],
            ocupantesTipo: [initial?.ocupantesTipo || 'fixos'],
            areaClimatizada: [initial?.areaClimatizada || null],
            equipamentoTipo: [initial?.equipamentoTipo || '', Validators.required],
            capacidadeBtus: [initial?.capacidadeBtus ?? null],
            tecnologia: [initial?.tecnologia || null],
            tipoGas: [initial?.tipoGas || null]
        });
    }

    // accessor for equipamentos FormArray (same API as criarPmoc)
    get equipamentos(): FormArray {
        return this.formulario.get('equipamentos') as FormArray;
    }

    addEquipment(initial?: any) {
        this.equipamentos.push(this.createEquipmentGroup(initial));
        // expand the newly added equipment and focus its identificacao input
        setTimeout(() => {
            try {
                const idx = this.equipamentos.length - 1;
                this.expandOnly(idx);
                const el = document.getElementById(`identificacao-${idx}`) as HTMLInputElement | null;
                el?.focus();
            } catch (e) {
                // ignore
            }
        }, 0);
    }

    removeEquipment(index: number) {
        this.confirmationService.confirm({
            message: 'Confirma exclusão deste equipamento?',
            header: 'Confirmar exclusão',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.equipamentos.removeAt(index);
                // adjust expanded indexes after removal
                const newSet = new Set<number>();
                this.expandedEquipments.forEach((v) => {
                    if (v < index) newSet.add(v);
                    else if (v > index) newSet.add(v - 1);
                });
                this.expandedEquipments = newSet;
                this.msg.add({ severity: 'info', summary: 'Removido', detail: 'Equipamento excluído.' });
            }
        });
    }

    // collapse/expand helpers
    isExpanded(index: number): boolean {
        return this.expandedEquipments.has(index);
    }

    toggleEquipment(index: number) {
        if (this.expandedEquipments.has(index)) this.expandedEquipments.delete(index);
        else this.expandedEquipments.add(index);
    }

    expandOnly(index: number) {
        this.expandedEquipments.clear();
        this.expandedEquipments.add(index);
    }

    // trackBy to improve rendering performance (same logic as criarPmoc)
    trackByEquipment(index: number, ctrl: any) {
        try {
            return ctrl.get('id')?.value || ctrl.get('identificacao')?.value || index;
        } catch (e) {
            return index;
        }
    }

    private addMonths(d: Date, months: number): Date {
        const nd = new Date(d.getTime());
        nd.setMonth(nd.getMonth() + months);
        nd.setHours(0, 0, 0, 0);
        return nd;
    }

    // helper used by template to iterate equipment controls safely
    get equipmentControls() {
        const fa = this.formulario.get('equipamentos') as FormArray | null;
        return fa ? fa.controls : [];
    }

    private pad(n: number) {
        return n < 10 ? '0' + n : String(n);
    }

    // small helper to generate equipment id like AC001, AC002
    getEquipmentId(index: number): string {
        return `AC${String(index + 1).padStart(3, '0')}`;
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
