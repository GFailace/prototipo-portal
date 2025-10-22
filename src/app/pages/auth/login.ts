import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';
import { AuthService } from './auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule],
    styles: [
        `
            :host {
                --primary-color: #ff7a00;
            }
            /* PrimeNG checkbox custom */
            :host ::ng-deep .p-checkbox .p-checkbox-box {
                border-color: var(--primary-color);
            }
            /* stronger rules to override theme variables */
            :host ::ng-deep .p-checkbox .p-checkbox-box.p-highlight,
            :host ::ng-deep .p-checkbox .p-checkbox-box.p-highlight.p-checked {
                background-color: var(--primary-color) !important;
                border-color: var(--primary-color) !important;
                color: #fff !important;
            }
            :host ::ng-deep .p-checkbox .p-checkbox-box.p-highlight .p-checkbox-icon,
            :host ::ng-deep .p-checkbox .p-checkbox-box.p-checked .p-checkbox-icon {
                color: #fff !important;
                fill: #fff !important;
            }
            :host ::ng-deep .p-checkbox .p-checkbox-box.p-focus {
                box-shadow: 0 0 0 0.2rem rgba(255, 122, 0, 0.18) !important;
            }

            /* Input focus outline */
            :host ::ng-deep .p-inputtext:focus,
            :host ::ng-deep input:focus,
            :host ::ng-deep .p-password .p-inputtext:focus {
                outline: none !important;
                border-color: var(--primary-color) !important;
                box-shadow: 0 0 0 0.2rem rgba(255, 122, 0, 0.12) !important;
            }

            /* Links and buttons using text-primary should use the orange color */
            :host ::ng-deep .text-primary,
            :host ::ng-deep .forgot-link,
            :host ::ng-deep .p-button.p-button-text.forgot-link {
                color: var(--primary-color) !important;
            }
        `
    ],
    template: `
        <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-screen overflow-hidden">
            <div style="--primary-color: #ff7a00" class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-screen overflow-hidden">
                <div class="w-full max-w-md px-6">
                    <div class="bg-white dark:bg-surface-900 rounded-2xl shadow-lg p-8 sm:p-10" style="border: 1px solid var(--surface-border)">
                        <div class="text-center mb-6">
                            <img src="assets/pmoxy_logo_small.png" alt="PMOXY" class="mb-2 w-64 mx-auto" />
                            <div class="text-surface-900 dark:text-surface-0 text-2xl font-semibold">Acesse o PMOXY</div>
                            <div class="text-muted-color text-sm">Faça login para acessar seus PMOCs</div>
                        </div>

                        <div class="space-y-4">
                            <div>
                                <label for="email1" class="block text-surface-900 dark:text-surface-0 text-sm font-semibold mb-1">E-mail</label>
                                <input pInputText id="email1" type="text" placeholder="seu@exemplo.com" class="w-full p-3 border rounded" [(ngModel)]="email" />
                            </div>

                            <div>
                                <label for="password1" class="block text-surface-900 dark:text-surface-0 text-sm font-semibold mb-1">Senha</label>
                                <p-password id="password1" [(ngModel)]="password" placeholder="*********" [toggleMask]="true" [feedback]="false" inputStyleClass="w-full p-3 border rounded" styleClass="p-input-password w-full"></p-password>
                            </div>

                            <div class="flex items-center justify-between">
                                <button class="text-sm text-primary hover:underline">Esqueci minha senha</button>
                            </div>

                            <div>
                                <button class="w-full bg-[var(--primary-color)] hover:bg-[#ff8f33] text-white font-semibold py-3 rounded" (click)="submit()">Entrar</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class Login {
    email: string = '';

    password: string = '';

    checked: boolean = false;

    role: 'admin' | 'consumer' = 'consumer';

    constructor(
        private auth: AuthService,
        private router: Router
    ) {}

    submit() {
        const creds = { email: this.email, password: this.password };
        if (this.role === 'admin') {
            this.auth.loginAdmin(creds).subscribe({
                next: () => this.router.navigateByUrl('/'),
                error: (err) => alert(err?.message || 'Erro ao autenticar')
            });
        } else {
            this.auth.loginConsumer(creds).subscribe({
                next: () => this.router.navigateByUrl('/pages/pmocs'),
                error: (err) => alert(err?.message || 'Erro ao autenticar')
            });
        }
    }
}
