import {Vector2} from '../types';

export abstract class GameObject {
    public position: Vector2;
    public size: Vector2;
    public visible: boolean = true;
    public interactive: boolean = true;

    constructor(config: GameObjectConfig) {
        this.position = config.position || {x: 0, y: 0};
        this.size = config.size || {x: 32, y: 32};
        this.visible = config.visible ?? true;
        this.interactive = config.interactive ?? true;
    }

    abstract update(deltaTime: number): void;

    abstract render(ctx: CanvasRenderingContext2D): void;

    containsPoint(point: Vector2): boolean {
        return (
            point.x >= this.position.x &&
            point.x <= this.position.x + this.size.x &&
            point.y >= this.position.y &&
            point.y <= this.position.y + this.size.y
        );
    }

    onPointerDown(e: PointerEvent): void {
    }

    onPointerUp(e: PointerEvent): void {
    }

    onPointerMove(e: PointerEvent): void {
    }

    onPointerOver(e: PointerEvent): void {
    }

    onPointerOut(e: PointerEvent): void {
    }
}

export interface GameObjectConfig {
    position?: Vector2;
    size?: Vector2;
    visible?: boolean;
    interactive?: boolean;
}