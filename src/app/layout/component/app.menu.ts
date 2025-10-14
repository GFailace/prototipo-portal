import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        <ng-container *ngFor="let item of model; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul> `
})
export class AppMenu {
    model: MenuItem[] = [];

    ngOnInit() {
        this.model = [
            {
                label: 'Home',
                items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'] }]
            },
            /* {
                label: 'Clientes',
                items: [
                    { label: 'Listar Clientes', icon: 'pi pi-fw pi-users', routerLink: ['/pages/clientes/listar-clientes'] },
                    { label: 'Registrar Cliente', icon: 'pi pi-fw pi-user-plus', routerLink: ['/pages/pmocs/registrar-pmoc'] }
                ]
            }, */
            {
                label: 'PMOCs',
                items: [
                    { label: 'Listar PMOCs', icon: 'pi pi-fw pi-file-check', routerLink: ['/pages/pmocs/listar-pmocs'] },
                    { label: 'Registrar PMOC', icon: 'pi pi-fw pi-file-plus', routerLink: ['/pages/pmocs/registrar-pmoc'] }
                ]
            },
            /* {
                label: 'Equipamentos',
                items: [
                    { label: 'Listar Equipamentos', icon: 'pi pi-fw pi-cog', routerLink: ['/pages/pmocs/listar-pmocs'] },
                    { label: 'Registrar Equipamento', icon: 'pi pi-fw pi-plus', routerLink: ['/pages/pmocs/registrar-pmoc'] }
                ]
            } */
        ];
    }
}
