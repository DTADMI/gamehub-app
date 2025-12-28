import {Asset, AssetDefinition} from '../types';
import {EventSystem} from '../utils/EventSystem';

export class AssetManager {
    private assets: Map<string, Asset> = new Map();
    private eventSystem: EventSystem;

    constructor() {
        this.eventSystem = new EventSystem();
    }

    async load(assets: AssetDefinition[]): Promise<void> {
        const loadPromises = assets.map(asset => this.loadAsset(asset));
        await Promise.all(loadPromises);
    }

    get<T = any>(id: string): T | undefined {
        const asset = this.assets.get(id);
        return asset?.data as T;
    }

    unload(id: string): boolean {
        return this.assets.delete(id);
    }

    unloadAll(): void {
        this.assets.clear();
    }

    on(event: string, handler: (...args: any[]) => void): () => void {
        return this.eventSystem.on(event, handler);
    }

    off(event: string, handler: (...args: any[]) => void): void {
        this.eventSystem.off(event, handler);
    }

    private async loadAsset(assetDef: AssetDefinition): Promise<void> {
        if (this.assets.has(assetDef.id)) {
            console.warn(`Asset with id '${assetDef.id}' is already loaded.`);
            return;
        }

        try {
            let asset: Asset = {
                ...assetDef,
                data: null,
                metadata: assetDef.metadata || {}
            };

            switch (assetDef.type) {
                case 'image':
                    asset.data = await this.loadImage(assetDef.src);
                    break;
                case 'audio':
                    asset.data = await this.loadAudio(assetDef.src);
                    break;
                case 'json':
                    asset.data = await this.loadJson(assetDef.src);
                    break;
                case 'spritesheet':
                    asset.data = await this.loadSpritesheet(assetDef.src, assetDef.metadata);
                    break;
                case 'font':
                    await this.loadFont(assetDef.src, assetDef.id);
                    asset.data = assetDef.id; // Store font family name
                    break;
                default:
                    throw new Error(`Unsupported asset type: ${assetDef.type}`);
            }

            this.assets.set(assetDef.id, asset);
            this.eventSystem.emit('asset:loaded', assetDef.id);
        } catch (error) {
            console.error(`Failed to load asset '${assetDef.id}':`, error);
            throw error;
        }
    }

    private loadImage(src: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
            img.src = src;
        });
    }

    private loadAudio(src: string): Promise<HTMLAudioElement> {
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.preload = 'auto';
            audio.oncanplaythrough = () => resolve(audio);
            audio.onerror = () => reject(new Error(`Failed to load audio: ${src}`));
            audio.src = src;
        });
    }

    private async loadJson(src: string): Promise<any> {
        const response = await fetch(src);
        if (!response.ok) {
            throw new Error(`Failed to load JSON: ${src} (${response.status})`);
        }
        return response.json();
    }

    private async loadSpritesheet(src: string, metadata?: any): Promise<any> {
        const image = await this.loadImage(src);
        return {image, ...metadata};
    }

    private async loadFont(src: string, fontFamily: string): Promise<void> {
        const fontFace = new FontFace(fontFamily, `url(${src})`);
        await fontFace.load();
        document.fonts.add(fontFace);
    }
}