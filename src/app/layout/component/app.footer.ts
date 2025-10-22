import { Component } from '@angular/core';

@Component({
    standalone: true,
    selector: 'app-footer',
    template: `<div class="layout-footer">
        PMOXY © 2025 - Developed by
        <a href="https://github.com/GFailace" target="_blank" rel="noopener noreferrer" class="text-primary font-bold hover:underline">Failace</a>
    </div>`
})
export class AppFooter {}
