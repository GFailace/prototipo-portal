import { Routes } from '@angular/router';
import { Documentation } from './documentation/documentation';
import { Crud } from './crud/crud';
import { Empty } from './empty/empty';

export default [
    { path: 'documentation', component: Documentation },
    { path: 'crud', component: Crud },
    { path: 'empty', component: Empty },
    { path: 'clientes/listar-clientes', loadComponent: () => import('./clientes/listarClientes').then((m) => m.ListarClientesComponent) },
    { path: 'pmocs/registrar-pmoc', loadComponent: () => import('./pmocs/criarPmoc').then((m) => m.CriarPmoc) },
    { path: 'pmocs/registrar-atendimento', loadComponent: () => import('./pmocs/registrarAtendimento').then((m) => m.RegistrarAtendimento) },
    { path: 'pmocs/listar-pmocs', loadComponent: () => import('./pmocs/listarPmocs').then((m) => m.ListarPmocs) },
    { path: 'pmocs/editar/:id', loadComponent: () => import('./pmocs/editarPmoc').then((m) => m.EditarPmoc) },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
