import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Documentation } from './app/pages/documentation/documentation';
import { Landing } from './app/pages/landing/landing';
import { Notfound } from './app/pages/notfound/notfound';
import { ClientLayout } from './app/layout/component/client.layout';
import { ClientAuthGuard } from './app/layout/service/client-auth.guard';

export const appRoutes: Routes = [
    {
        path: '',
        component: AppLayout,
        children: [
            { path: '', component: Dashboard },
            { path: 'uikit', loadChildren: () => import('./app/pages/uikit/uikit.routes') },
            { path: 'documentation', component: Documentation },
            { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') }
        ]
    },
    { path: 'landing', component: Landing },
    {
        path: 'client',
        component: ClientLayout,
        canActivate: [ClientAuthGuard],
        children: [
            { path: 'pmocs', loadComponent: () => import('./app/client/pmoc-client/pmoc-client.component').then(m => m.PmocClientComponent) },
            { path: '', redirectTo: 'pmocs', pathMatch: 'full' }
        ]
    },
    { path: 'notfound', component: Notfound },
    { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },
    { path: '**', redirectTo: '/notfound' }
];
