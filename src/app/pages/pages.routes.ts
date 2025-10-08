import { Routes } from '@angular/router';
import { Documentation } from './documentation/documentation';
import { Crud } from './crud/crud';
import { Empty } from './empty/empty';
import { Pmocs } from './pmocs/pmocs';

export default [
    { path: 'documentation', component: Documentation },
    { path: 'crud', component: Crud },
    { path: 'empty', component: Empty },
    { path: 'pmocs', component: Pmocs },
    { path: 'pmocs/registrar-pmoc', loadComponent: () => import('./pmocs/criarPmoc').then((m) => m.CriarPmoc) },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
