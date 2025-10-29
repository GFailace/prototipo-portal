import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PmocClientService } from './pmoc-client.service';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
    selector: 'pmoc-art-viewer',
    standalone: true,
    imports: [CommonModule, ButtonModule, CardModule, ProgressSpinnerModule],
    template: `
        <div>
            <p-card class="p-4 rounded border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 shadow-sm pmoc-card pmoc-art-card">
                <ng-template pTemplate="header">
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="font-semibold pmoc-title">ART</div>
                            <div *ngIf="clientId" class="text-sm text-muted mt-0.5">Cliente: <span class="font-medium">{{ clientId }}</span></div>
                        </div>
                        <div *ngIf="!hasArt" class="text-sm text-muted">Nenhum ART disponível</div>
                    </div>
                </ng-template>

                <div *ngIf="hasArt">
                    <div class="p-2">
                        <div class="text-sm truncate"><strong>{{ fileName || ('ART-' + (clientId || 'cliente') + '.pdf') }}</strong></div>
                    </div>

                    <div class="pmoc-footer flex items-center justify-start gap-2">
                        <button pButton type="button" icon="pi pi-download" class="p-button-sm flex-none whitespace-nowrap" (click)="downloadArt()" [disabled]="loading">Baixar</button>
                        <button pButton type="button" icon="pi pi-external-link" class="p-button-sm p-button-text ml-2 flex-none whitespace-nowrap" (click)="openInNewTab()" [disabled]="loading">Abrir</button>
                        <div *ngIf="loading" class="ml-3"><p-progressSpinner styleClass="p-small"></p-progressSpinner></div>
                    </div>
                </div>

                <div *ngIf="!hasArt" class="p-3 text-sm text-muted">O ART ainda não foi carregado pelo administrador.</div>
            </p-card>
        </div>
    `,
    styles: [
        `
        :host { display: block }
        /* Match PMOC card appearance */
        .pmoc-card { padding: 1rem !important; }
        .pmoc-title { font-size: 1.05rem; letter-spacing: -0.2px; }
        .pmoc-art-card { max-width: 100%; }
        .pmoc-footer { margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid var(--surface-border, rgba(0,0,0,0.06)); }
        .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        /* dark-mode tweaks similar to parent component */
        :host-context(.app-dark) .pmoc-title, :host-context(.dark) .pmoc-title { color: inherit; }
        `
    ]
})
export class PmocArtViewerComponent implements OnInit, OnChanges, OnDestroy {
    @Input() clientId?: string | null;

    pdfUrl: string | null = null;
    fileName: string | null = null;
    hasArt = false;
    loading = false;

    private objectUrl: string | null = null;

    constructor(
        private route: ActivatedRoute,
        private svc: PmocClientService
    ) {}

    ngOnInit(): void {
        // If a clientId input is provided by parent, prefer that. Otherwise try to resolve from route.
        if (this.clientId) {
            this.loadForClientId(this.clientId);
            return;
        }

        // Try to resolve clientId from this route or any parent route (clientId is defined on a parent route)
        let cid = this.route.snapshot.paramMap.get('clientId');
        if (!cid) {
            // walk up parents to find the param if present
            let parent = this.route.parent;
            while (parent && !cid) {
                cid = parent.snapshot.paramMap.get('clientId');
                parent = parent.parent;
            }
        }

        if (!cid) {
            console.debug('PmocArtViewer: clientId not found on route or parents');
            this.hasArt = false;
            return;
        }

        this.loadForClientId(cid);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['clientId'] && !changes['clientId'].isFirstChange()) {
            const cid = changes['clientId'].currentValue as string | undefined | null;
            this.loadForClientId(cid);
        }
    }

    private loadForClientId(cid?: string | null) {
        if (!cid) {
            this.hasArt = false;
            return;
        }
        this.loading = true;
        try {
            console.debug('PmocArtViewer: loading ART for clientId', cid);
            const blob = this.svc.getArtBlobForClient(cid || undefined);
            if (!blob) {
                this.hasArt = false;
                this.loading = false;
                return;
            }
            // clean previous object URL
            if (this.objectUrl) {
                try { URL.revokeObjectURL(this.objectUrl); } catch {}
                this.objectUrl = null;
            }
            this.objectUrl = URL.createObjectURL(blob);
            this.pdfUrl = this.objectUrl;
            const meta = this.svc.getArtBase64ForClient(cid || undefined);
            this.fileName = meta ? meta.name : `ART-${cid}.pdf`;
            this.hasArt = true;
        } catch (err) {
            console.error('failed to load ART', err);
            this.hasArt = false;
        } finally {
            this.loading = false;
        }
    }

    downloadArt() {
        if (!this.objectUrl) return;
        const a = document.createElement('a');
        a.href = this.objectUrl;
        a.download = this.fileName || 'ART.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
    }

    openInNewTab() {
        if (!this.objectUrl) return;
        window.open(this.objectUrl, '_blank');
    }

    ngOnDestroy(): void {
        if (this.objectUrl) {
            URL.revokeObjectURL(this.objectUrl);
            this.objectUrl = null;
        }
    }
}
