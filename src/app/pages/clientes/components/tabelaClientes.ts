import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';

@Component({
    selector: 'app-tabela-clientes',
    imports: [CommonModule, TableModule, ButtonModule],
    standalone: true,
    template: `
        <p-table [value]="clientes" [paginator]="true" [rows]="5" responsiveLayout="scroll">
            <ng-template pTemplate="header">
                <tr>
                    <th>ID</th>
                    <th>Nome do Cliente</th>
                    <th>Status</th>
                    <th>PMOC</th>
                    <th>Gerenciar</th>
                </tr>
            </ng-template>
            <ng-template pTemplate="body" let-cliente>
                <tr>
                    <td>{{ cliente.id }}</td>
                    <td>{{ cliente.nome }}</td>
                    <td>
                        <span
                            [ngClass]="{
                                ativo: cliente.status === 'Ativo',
                                desativado: cliente.status === 'Desativado'
                            }"
                        >
                            {{ cliente.status }}
                        </span>
                    </td>
                    <td>
                        <a [href]="cliente.pmocUrl" target="_blank">Verificar PMOC</a>
                    </td>
                    <td>
                        <div class="flex flex-wrap gap-2 mb-2">
                            <button pButton severity="secondary">
                                <i class="pi pi-user-edit" pButtonIcon></i>
                            </button>
                            <button pButton severity="danger">
                                <i class="pi pi-trash" pButtonIcon></i>
                            </button>
                        </div>
                    </td>
                </tr>
            </ng-template>
        </p-table>
    `,
    styles: [
        `
            .ativo {
                color: green;
                font-weight: bold;
            }

            .desativado {
                color: red;
                font-weight: bold;
            }

            a {
                text-decoration: none;
                color: #007ad9;
            }

            a:hover {
                text-decoration: underline;
            }
        `
    ]
})
export class TabelaClientesComponent {
    clientes = [
        { id: 1, nome: 'Empresa Alpha', status: 'Ativo', pmocUrl: 'https://pmoc.com/alpha' },
        { id: 2, nome: 'Empresa Beta', status: 'Desativado', pmocUrl: 'https://pmoc.com/beta' },
        { id: 3, nome: 'Empresa Gama', status: 'Ativo', pmocUrl: 'https://pmoc.com/gama' }
    ];
}
