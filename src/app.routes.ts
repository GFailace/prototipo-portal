import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Documentation } from './app/pages/documentation/documentation';
import { Landing } from './app/pages/landing/landing';
import { Notfound } from './app/pages/notfound/notfound';
import { ClientLayout } from './app/layout/component/client.layout';
import { ClientAuthGuard } from './app/layout/service/client-auth.guard';
import { ListarPmocs } from '@/pages/pmocs/listarPmocs';

export const appRoutes: Routes = [
    {
        path: '',
        component: AppLayout,
        children: [
            { path: '', component: ListarPmocs },
            { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') }
        ]
    },
    { path: 'landing', component: Landing },
    {
        // Accept a cliente identifier (UUID/hash) in the path so routes load per-cliente
            path: 'cliente/:cliente_id',
        component: ClientLayout,
        canActivate: [ClientAuthGuard],
        children: [
            { path: 'atendimentos', loadComponent: () => import('./app/client/pmoc-client/pmoc-client.component').then((m) => m.PmocClientComponent) },
            { path: 'art', loadComponent: () => import('./app/client/pmoc-client/pmoc-art-viewer.component').then((m) => m.PmocArtViewerComponent) },
            { path: 'equipamentos', loadComponent: () => import('./app/pages/clientes/client-equipments').then((m) => m.ClientEquipmentsComponent) },
            { path: 'equipamentos/:id/pmoc', loadComponent: () => import('./app/pages/clientes/equipamento-schedule.component').then((m) => m.EquipamentoScheduleComponent) },
            { path: '', redirectTo: 'pmocs', pathMatch: 'full' }
        ]
    },
    { path: 'notfound', component: Notfound },
    { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },
    { path: '**', redirectTo: '/notfound' }
];
