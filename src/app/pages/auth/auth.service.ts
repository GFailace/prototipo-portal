import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface AuthResult {
    token: string;
    role: 'admin' | 'consumer';
    id?: string;
    name?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    // NOTE: This is a minimal mock implementation intended for local/dev usage.
    // Assumptions:
    // - Admins are detected when the email contains "admin".
    // - Consumers' id is derived from the email local-part (before @).
    // Replace with real backend calls when available.

    loginAdmin(credentials: { email: string; password: string }): Observable<AuthResult> {
        if (!credentials.email || !credentials.password) {
            return throwError(() => new Error('Credenciais inválidas')).pipe(delay(200));
        }

        // Simple heuristic: if email contains 'admin' accept as admin
        if (credentials.email.toLowerCase().includes('admin')) {
            const res: AuthResult = { token: 'admintoken-' + Date.now(), role: 'admin', name: 'Administrator' };
            // persist token for this demo
            localStorage.setItem('auth_token', res.token);
            localStorage.setItem('auth_role', res.role);
            return of(res).pipe(delay(250));
        }

        return throwError(() => new Error('Usuário admin não encontrado')).pipe(delay(250));
    }

    loginConsumer(credentials: { email: string; password: string }): Observable<AuthResult> {
        if (!credentials.email || !credentials.password) {
            return throwError(() => new Error('Credenciais inválidas')).pipe(delay(200));
        }

        // Derive a consumer id from the email local part (before '@')
        const localPart = credentials.email.split('@')[0];
        const consumerId = localPart || 'consumer-' + Math.floor(Math.random() * 1000);
        const res: AuthResult = { token: 'con-' + consumerId + '-' + Date.now(), role: 'consumer', id: consumerId, name: localPart };
        localStorage.setItem('auth_token', res.token);
        localStorage.setItem('auth_role', res.role);
        localStorage.setItem('auth_id', res.id ?? '');
        return of(res).pipe(delay(250));
    }

    logout() {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_role');
        localStorage.removeItem('auth_id');
    }
}
