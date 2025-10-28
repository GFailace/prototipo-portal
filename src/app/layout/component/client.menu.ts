import { Component } from '@angular/core';
import { Router } from '@angular/router';
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
    </ul>`,
    styles: [
        `
            :host ::ng-deep .layout-sidebar {
                width: 260px;
            }
            :host ::ng-deep .layout-menuitem-icon {
                font-size: 1.05rem;
                width: 2rem;
            }
            :host ::ng-deep .layout-menuitem-text {
                margin-left: 0.5rem;
                font-size: 0.95rem;
            }
            :host ::ng-deep .client-menu .layout-menuitem-root-text {
                font-weight: 600;
                padding: 0.75rem 1rem;
            }
        `
    ]
})
export class ClientMenu {
    model: MenuItem[] = [];
    constructor(private router: Router) {}

    ngOnInit() {
        // try to extract clientId from current URL (pattern /client/:clientId/...)
        const match = this.router.url.match(/^\/client\/([^\/]+)/);
        const clientId = match ? match[1] : null;
        const baseLink = clientId ? ['/client', clientId] : ['/client'];

        this.model = [
            {
                label: 'PMOCs',
                items: [{ label: 'Minhas PMOCs', icon: 'pi pi-fw pi-file', routerLink: [...baseLink, 'pmocs'] }]
            },
            {
                label: 'Equipamentos',
                items: [{ label: 'Meus Equipamentos', icon: 'pi pi-fw pi-cog', routerLink: [...baseLink, 'equipamentos'] }]
            },
            {
                label: 'ART',
                items: [{ label: 'Visualizar ART', icon: 'pi pi-fw pi-file-pdf', routerLink: [...baseLink, 'art'], fragment: 'art' }]
            }
        ];
    }
}
