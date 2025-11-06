import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TableModule } from 'primeng/table';
import { TabelaClientesComponent } from './components/tabelaClientes';

@Component({
    selector: 'app-listar-clientes',
    imports: [CommonModule, TabelaClientesComponent],
    standalone: true,
    template: ` <app-tabela-clientes></app-tabela-clientes> `
})
export class ListarClientesComponent {}
