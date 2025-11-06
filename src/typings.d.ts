// Local ambient declarations to satisfy TypeScript when library types are not available.
// This is a minimal shim for PrimeNG modules that may not ship type declarations
// in this workspace setup. Remove if proper types are installed.

declare module 'primeng/dropdown' {
    const DropdownModule: any;
    export { DropdownModule };
}
