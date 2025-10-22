import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class ClientAuthGuard implements CanActivate {
    constructor(private router: Router) {}

    canActivate(): boolean | UrlTree {
        // Simple check: presence of auth token in localStorage. Replace with real auth check.
        const token = localStorage.getItem('authToken');
        if (token) return true;
        return this.router.parseUrl('/auth/login');
    }
}
