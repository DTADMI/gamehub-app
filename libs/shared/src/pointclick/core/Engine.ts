import {SceneManager} from './SceneManager';
import {AssetManager} from './AssetManager';
import {InputManager} from './InputManager';
import {StateManager} from './StateManager';
import {AnimationManager} from './AnimationManager';
import {EventSystem} from '../utils/EventSystem';
import {PluginDefinition, PluginManager} from './PluginManager';
import {DialoguePlugin} from "../plugins/DialoguePlugin";
import {InventoryPlugin} from "../plugins/InventoryPlugin";
import {AchievementPlugin} from "../plugins/AchievementPlugin";
import {AssetDefinition} from '../types';

export class GameEngine {
    // Core systems
    public scenes: SceneManager;
    public assets: AssetManager;
    public input: InputManager;
    public state: StateManager;
    public animations: AnimationManager;
    public events: EventSystem;
    public plugins: PluginManager;

    // Configuration
    private config: GameConfig;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private lastTime: number = 0;
    private isRunning: boolean = false;

    constructor(config: GameConfig) {
        this.config = {
            width: 1280,
            height: 720,
            pixelRatio: window.devicePixelRatio || 1,
            backgroundColor: '#000000',
            debug: false,
            ...config
        };

        // Setup canvas
        this.canvas = this.config.canvas;
        this.ctx = this.canvas.getContext('2d', {alpha: false})!;

        // Initialize core systems
        this.events = new EventSystem();
        this.assets = new AssetManager();
        this.state = new StateManager();
        this.animations = new AnimationManager();
        this.input = new InputManager(this.canvas, this.events);
        this.scenes = new SceneManager(this);
        this.plugins = new PluginManager(this);

        // Set canvas size
        this.resize(this.config.width || 1280, this.config.height || 720);

        // Register core plugins
        this.registerCorePlugins();
    }

    async start(initialScene: string) {
        // Load any required assets
        if (this.config.assets) {
            await this.assets.load(this.config.assets);
        }

        // Initialize plugins
        await this.plugins.init();

        // Start the game loop
        await this.scenes.switchTo(initialScene);
        this.isRunning = true;
        this.lastTime = performance.now();
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    resize(width: number, height: number) {
        // Apply pixel ratio scaling
        const scale = this.config.pixelRatio!;
        this.canvas.width = width * scale;
        this.canvas.height = height * scale;
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;
        this.ctx.scale(scale, scale);

        // Notify systems of resize
        const currentScene = this.scenes.current;
        currentScene?.onResize?.(width, height);
        this.plugins.trigger('resize', {width, height});
    }

    destroy() {
        this.isRunning = false;
        this.input.cleanup();
        this.scenes.destroy();
        this.plugins.destroy();
        this.events.clear();
    }

    private registerCorePlugins() {
        // Register core plugins that provide common functionality
        this.plugins.register('dialogue', new DialoguePlugin());
        this.plugins.register('inventory', new InventoryPlugin());
        this.plugins.register('achievements', new AchievementPlugin());
    }

    private gameLoop(timestamp: number) {
        if (!this.isRunning) return;

        const deltaTime = Math.min((timestamp - this.lastTime) / 1000, 0.1); // Cap delta time
        this.lastTime = timestamp;

        // Update game state
        this.update(deltaTime);

        // Render frame
        this.render();

        requestAnimationFrame(this.gameLoop.bind(this));
    }

    private update(deltaTime: number) {
        this.input.update();
        this.plugins.update(deltaTime);
        const currentScene = this.scenes.current;
        currentScene?.update?.(deltaTime);
        this.animations.update(deltaTime);
    }

    private render() {
        // Clear canvas with background color
        this.ctx.fillStyle = this.config.backgroundColor!;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Render current scene
        const currentScene = this.scenes.current;
        currentScene?.render?.(this.ctx);

        // Render debug info if enabled
        if (this.config.debug) {
            this.renderDebugInfo();
        }
    }

    private renderDebugInfo() {
        const fps = Math.round(1000 / (performance.now() - this.lastTime));
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = '12px monospace';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(`FPS: ${fps}`, 10, 10);
        this.ctx.fillText(`Scene: ${this.scenes.current?.id || 'none'}`, 10, 25);
    }
}

// Configuration interface
export interface GameConfig {
    canvas: HTMLCanvasElement;
    width?: number;
    height?: number;
    pixelRatio?: number;
    backgroundColor?: string;
    debug?: boolean;
    assets?: AssetDefinition[];
    plugins?: PluginDefinition[];
}
