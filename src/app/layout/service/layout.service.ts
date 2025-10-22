import { Injectable, effect, signal, computed } from '@angular/core';
import { Subject } from 'rxjs';

export interface layoutConfig {
    preset?: string;
    primary?: string;
    surface?: string | undefined | null;
    darkTheme?: boolean;
    menuMode?: string;
}

interface LayoutState {
    staticMenuDesktopInactive?: boolean;
    overlayMenuActive?: boolean;
    configSidebarVisible?: boolean;
    staticMenuMobileActive?: boolean;
    menuHoverActive?: boolean;
}

interface MenuChangeEvent {
    key: string;
    routeEvent?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class LayoutService {
    _config: layoutConfig = {
        preset: 'Aura',
        // default primary set to 'orange' on startup
        primary: 'orange',
        surface: null,
        darkTheme: false,
        menuMode: 'static'
    };

    _state: LayoutState = {
        staticMenuDesktopInactive: false,
        overlayMenuActive: false,
        configSidebarVisible: false,
        staticMenuMobileActive: false,
        menuHoverActive: false
    };

    layoutConfig = signal<layoutConfig>(this._config);

    layoutState = signal<LayoutState>(this._state);

    private configUpdate = new Subject<layoutConfig>();

    private overlayOpen = new Subject<any>();

    private menuSource = new Subject<MenuChangeEvent>();

    private resetSource = new Subject();

    menuSource$ = this.menuSource.asObservable();

    resetSource$ = this.resetSource.asObservable();

    configUpdate$ = this.configUpdate.asObservable();

    overlayOpen$ = this.overlayOpen.asObservable();

    theme = computed(() => (this.layoutConfig()?.darkTheme ? 'light' : 'dark'));

    isSidebarActive = computed(() => this.layoutState().overlayMenuActive || this.layoutState().staticMenuMobileActive);

    isDarkTheme = computed(() => this.layoutConfig().darkTheme);

    getPrimary = computed(() => this.layoutConfig().primary);

    getSurface = computed(() => this.layoutConfig().surface);

    isOverlay = computed(() => this.layoutConfig().menuMode === 'overlay');

    transitionComplete = signal<boolean>(false);

    /** Controls whether the configurator panel is visible */
    configuratorVisible = signal<boolean>(false);

    private initialized = false;

    constructor() {
        effect(() => {
            const config = this.layoutConfig();
            if (config) {
                this.onConfigUpdate();
            }
        });

        effect(() => {
            const config = this.layoutConfig();

            if (!this.initialized || !config) {
                this.initialized = true;
                return;
            }

            this.handleDarkModeTransition(config);
        });

        // apply the initial primary override silently at startup
        try {
            this.applyPrimaryByName(this.layoutConfig().primary || '');
        } catch (e) {
            // ignore non-browser environments or early DOM errors
        }
    }

    private handleDarkModeTransition(config: layoutConfig): void {
        if ((document as any).startViewTransition) {
            this.startViewTransition(config);
        } else {
            this.toggleDarkMode(config);
            this.onTransitionEnd();
        }
    }

    private startViewTransition(config: layoutConfig): void {
        const transition = (document as any).startViewTransition(() => {
            this.toggleDarkMode(config);
        });

        transition.ready
            .then(() => {
                this.onTransitionEnd();
            })
            .catch(() => {});
    }

    toggleDarkMode(config?: layoutConfig): void {
        const _config = config || this.layoutConfig();
        if (_config.darkTheme) {
            document.documentElement.classList.add('app-dark');
        } else {
            document.documentElement.classList.remove('app-dark');
        }
    }

    private onTransitionEnd() {
        this.transitionComplete.set(true);
        setTimeout(() => {
            this.transitionComplete.set(false);
        });
    }

    onMenuToggle() {
        if (this.isOverlay()) {
            this.layoutState.update((prev) => ({ ...prev, overlayMenuActive: !this.layoutState().overlayMenuActive }));

            if (this.layoutState().overlayMenuActive) {
                this.overlayOpen.next(null);
            }
        }

        if (this.isDesktop()) {
            this.layoutState.update((prev) => ({ ...prev, staticMenuDesktopInactive: !this.layoutState().staticMenuDesktopInactive }));
        } else {
            this.layoutState.update((prev) => ({ ...prev, staticMenuMobileActive: !this.layoutState().staticMenuMobileActive }));

            if (this.layoutState().staticMenuMobileActive) {
                this.overlayOpen.next(null);
            }
        }
    }

    isDesktop() {
        return window.innerWidth > 991;
    }

    isMobile() {
        return !this.isDesktop();
    }

    onConfigUpdate() {
        this._config = { ...this.layoutConfig() };
        this.configUpdate.next(this.layoutConfig());
    }

    onMenuStateChange(event: MenuChangeEvent) {
        this.menuSource.next(event);
    }

    reset() {
        this.resetSource.next(true);
    }

    showConfigurator() {
        this.configuratorVisible.set(true);
    }

    hideConfigurator() {
        this.configuratorVisible.set(false);
    }

    toggleConfigurator() {
        this.configuratorVisible.update((v) => !v);
    }

    /**
     * Apply a primary color by name. For the special 'noir' value we set
     * CSS variables to make buttons/links use black. For other names we
     * remove the manual override so the theme system controls primary color.
     */
    applyPrimaryByName(name: string) {
        if (name === 'noir') {
            document.documentElement.style.setProperty('--primary-color', '#000000');
            document.documentElement.style.setProperty('--p-primary-color', '#000000');
            document.documentElement.style.setProperty('--p-primary-600', '#000000');
            document.documentElement.style.setProperty('--p-primary-500', '#000000');
            document.documentElement.style.setProperty('--p-primary-hover', '#222222');
            document.documentElement.style.setProperty('--p-primary-contrast-color', '#ffffff');
        } else if (name === 'orange') {
            // orange brand tone
            document.documentElement.style.setProperty('--primary-color', '#ff6a00');
            document.documentElement.style.setProperty('--p-primary-color', '#ff6a00');
            document.documentElement.style.setProperty('--p-primary-600', '#e65a00');
            document.documentElement.style.setProperty('--p-primary-500', '#ff6a00');
            document.documentElement.style.setProperty('--p-primary-hover', '#cc5600');
            document.documentElement.style.setProperty('--p-primary-contrast-color', '#ffffff');
        } else {
            document.documentElement.style.removeProperty('--primary-color');
            document.documentElement.style.removeProperty('--p-primary-color');
            document.documentElement.style.removeProperty('--p-primary-600');
            document.documentElement.style.removeProperty('--p-primary-500');
            document.documentElement.style.removeProperty('--p-primary-hover');
            document.documentElement.style.removeProperty('--p-primary-contrast-color');
        }
    }
}
