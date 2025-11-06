import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { appRoutes } from './app.routes';

// register Angular locale data for pt-BR
registerLocaleData(localePt, 'pt-BR');

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(appRoutes, withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }), withEnabledBlockingInitialNavigation()),
        provideHttpClient(withFetch()),
        provideAnimationsAsync(),
        providePrimeNG({
            theme: { preset: Aura, options: { darkModeSelector: '.app-dark' } },
            translation: {
                accept: 'Sim',
                reject: 'Não',
                choose: 'Selecionar',
                upload: 'Enviar',
                cancel: 'Cancelar',
                clear: 'Limpar',
                today: 'Hoje',
                weekHeader: 'Sm',
                dayNames: ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'],
                dayNamesShort: ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'],
                dayNamesMin: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
                monthNames: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'],
                monthNamesShort: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
                emptyMessage: 'Nenhum registro encontrado',
                emptyFilterMessage: 'Nenhum registro encontrado',
                selectionMessage: '{0} itens selecionados'
            }
        })
    ]
};
