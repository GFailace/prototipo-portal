import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';

@Component({
    selector: 'app-root',
    standalone: true,
    providers: [MessageService, ConfirmationService],
    imports: [RouterModule],
    template: `<router-outlet></router-outlet>`
})
export class AppComponent {}
