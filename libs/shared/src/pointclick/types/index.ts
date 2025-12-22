// Core types
export interface Vector2 {
    x: number;
    y: number;
}

export interface Bounds {
    x: number;
    y: number;
    width: number;
    height: number;
}

// Scene types
export interface Scene {
    id: string;
    interactionZones?: Map<string, InteractionZone>;

    init?(): Promise<void> | void;

    onEnter?(previousScene?: string, data?: any): Promise<void> | void;

    onExit?(nextScene?: string): Promise<void> | void;

    update?(deltaTime: number): void;

    render(ctx: CanvasRenderingContext2D): void;

    onResize?(width: number, height: number): void;

    destroy?(): void;

    addInteractionZone(zone: InteractionZone): void;

    removeInteractionZone(zoneId: string): void;

    findZoneAt(position: Vector2): InteractionZone | null;
}

// Game object types
export interface GameObjectConfig {
    id?: string;
    position?: Vector2;
    size?: Vector2;
    visible?: boolean;
    interactive?: boolean;
    zIndex?: number;
    tags?: string[];

    [key: string]: any;
}

// Input types
export interface InputEvent {
    type: 'pointerdown' | 'pointerup' | 'pointermove' | 'pointerover' | 'pointerout' | 'keydown' | 'keyup';
    position?: Vector2;
    key?: string;
    originalEvent: Event;
}

// Asset types
export interface Asset {
    id: string;
    src: string;
    type: 'image' | 'audio' | 'json' | 'spritesheet' | 'font';
    data?: any;
    metadata?: any;
}

// Animation types
export interface AnimationConfig {
    name: string;
    frames: string[];
    frameRate: number;
    loop?: boolean;
    flipX?: boolean;
    flipY?: boolean;
    onComplete: () => void;
    onFrame: (frame: number) => void;
}

// Dialogue system types
export interface DialogueOption {
    text: string;
    condition?: () => boolean;
    onSelect: () => void;
}

export interface DialogueConfig {
    id?: string;
    speaker?: string;
    text: string;
    options?: DialogueOption[];
    onComplete?: () => void;
    autoAdvance?: boolean;
    advanceTime?: number;
}

// Save data types
export interface SaveData {
    version: string;
    timestamp: number;
    scene: string;
    state: Record<string, any>;
    flags: Record<string, any>;
    inventory: string[];
}

// Plugin types
export interface PluginConfig {
    id: string;
    enabled?: boolean;

    [key: string]: any;
}

// Animation types
export interface Animation extends AnimationConfig {
    currentFrame: number;
    frameTime: number;
    isPlaying: boolean;
}

// Plugin types
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


// Input types
export interface InputManager {
    isKeyDown(key: string): boolean;

    getPointerPosition(): Vector2;

    isPointerPressed(): boolean;

    update(): void;

    cleanup(): void;
}

// State types
export interface StateChangeEvent<T = any> {
    key: string;
    previousValue: T | undefined;
    newValue: T;
}

// Scene transition types
export interface SceneTransition {
    type: 'fade' | 'slide' | 'zoom' | 'custom';
    duration: number;
    easing?: (t: number) => number;
    direction?: 'left' | 'right' | 'up' | 'down';
}

export interface AssetDefinition {
    id: string;
    type: 'image' | 'audio' | 'json' | 'spritesheet' | 'font';
    src: string;
    metadata?: Record<string, any>;
}

export interface InteractionZone {
    id: string;
    bounds: Bounds;
    priority: number;
    onHover?: (position: Vector2) => void;
    onClick?: (position: Vector2) => void;
    onDragStart?: (position: Vector2) => void;
    onDragMove?: (position: Vector2, delta: Vector2) => void;
    onDragEnd?: (position: Vector2) => void;
    onLongPress?: (position: Vector2) => void;
    onDoubleClick?: (position: Vector2) => void;
}