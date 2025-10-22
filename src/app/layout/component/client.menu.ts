import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';

@Component({
    selector: 'client-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu client-menu">
        <ng-container *ngFor="let item of model; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul>`
    ,
    styles: [
        `:host ::ng-deep .layout-sidebar { width: 260px; }
         :host ::ng-deep .layout-menuitem-icon { font-size: 1.05rem; width: 2rem; }
         :host ::ng-deep .layout-menuitem-text { margin-left: 0.5rem; font-size: 0.95rem; }
         :host ::ng-deep .client-menu .layout-menuitem-root-text { font-weight: 600; padding: 0.75rem 1rem; }
        `
    ]
})
export class ClientMenu {
    model: MenuItem[] = [];

    ngOnInit() {
        this.model = [
            {
                label: 'Home',
                items: [{ label: 'Início', icon: 'pi pi-fw pi-home', routerLink: ['/client'] }]
            },
            {
                label: 'PMOCs',
                items: [
                    { label: 'Minhas PMOCs', icon: 'pi pi-fw pi-file', routerLink: ['/client/pmocs'] }
                ]
            },
            {
                label: 'ART',
                items: [
                    { label: 'Visualizar ART', icon: 'pi pi-fw pi-file-pdf', routerLink: ['/client/pmocs'], fragment: 'art' }
                ]
            }
        ];
    }
}
