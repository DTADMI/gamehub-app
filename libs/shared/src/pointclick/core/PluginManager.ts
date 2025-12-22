import {GameEngine} from './Engine';

export interface GamePlugin {
    init?(): Promise<void> | void;

    update?(deltaTime: number): void;

    destroy?(): void;

    [key: string]: any;
}

export interface PluginDefinition {
    id: string;
    plugin: GamePlugin;
    config?: any;
}

export class PluginManager {
    private plugins: Map<string, GamePlugin> = new Map();
    private engine: GameEngine;

    constructor(engine: GameEngine) {
        this.engine = engine;
    }

    register(id: string, plugin: GamePlugin): void {
        if (this.plugins.has(id)) {
            console.warn(`Plugin with id '${id}' is already registered.`);
            return;
        }
        this.plugins.set(id, plugin);
    }

    get<T extends GamePlugin>(id: string): T | undefined {
        return this.plugins.get(id) as T;
    }

    async init(): Promise<void> {
        for (const [id, plugin] of this.plugins.entries()) {
            if (typeof plugin.init === 'function') {
                try {
                    await plugin.init();
                    console.log(`Plugin '${id}' initialized successfully.`);
                } catch (error) {
                    console.error(`Failed to initialize plugin '${id}':`, error);
                }
            }
        }
    }

    update(deltaTime: number): void {
        for (const plugin of this.plugins.values()) {
            if (typeof plugin.update === 'function') {
                plugin.update(deltaTime);
            }
        }
    }

    trigger(event: string, ...args: any[]): void {
        for (const plugin of this.plugins.values()) {
            if (typeof (plugin as any)[event] === 'function') {
                (plugin as any)[event](...args);
            }
        }
    }

    destroy(): void {
        for (const [id, plugin] of this.plugins.entries()) {
            if (typeof plugin.destroy === 'function') {
                try {
                    plugin.destroy();
                    console.log(`Plugin '${id}' destroyed.`);
                } catch (error) {
                    console.error(`Error destroying plugin '${id}':`, error);
                }
            }
        }
        this.plugins.clear();
    }
}