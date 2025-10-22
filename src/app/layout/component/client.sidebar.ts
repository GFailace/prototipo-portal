import { Component, ElementRef } from '@angular/core';
import { ClientMenu } from './client.menu';

@Component({
    selector: 'client-sidebar',
    standalone: true,
    imports: [ClientMenu],
    template: ` <div class="layout-sidebar">
        <client-menu></client-menu>
    </div>`
})
export class ClientSidebar {
    constructor(public el: ElementRef) {}
}
