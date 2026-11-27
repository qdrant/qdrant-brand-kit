// Types for the hero lab's generated module beside this file (plain JavaScript on three.js).
export type HeroSpaceHandle = { destroy(): void; setBoost(level: number): void; readonly ready: Promise<void> }
export declare const defaults: Record<string, unknown>
export declare function mount(container: HTMLElement, options?: Record<string, unknown>): HeroSpaceHandle
