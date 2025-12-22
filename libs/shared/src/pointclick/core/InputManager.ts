import {InputEvent, Vector2} from '../types';
import {EventSystem} from '../utils/EventSystem';

export class InputManager {
    private canvas: HTMLCanvasElement;
    private eventSystem: EventSystem;
    private pointerPosition: Vector2 = {x: 0, y: 0};
    private keys: Set<string> = new Set();
    private isPointerDown: boolean = false;
    private touchIds: Map<number, Vector2> = new Map();

    // New properties for gesture detection
    private gestureStartTime: number = 0;
    private gestureStartPos: Vector2 = {x: 0, y: 0};
    private gestureThreshold: number = 10; // pixels
    private longPressTimeout: number | null = null;
    private longPressDuration: number = 800; // ms
    private lastTapTime: number = 0;
    private doubleTapThreshold: number = 300; // ms
    private lastTapPos: Vector2 = {x: 0, y: 0};
    private doubleTapDistanceThreshold: number = 10; // pixels

    constructor(canvas: HTMLCanvasElement, eventSystem: EventSystem) {
        this.canvas = canvas;
        this.eventSystem = eventSystem;
        this.setupEventListeners();
    }

    isKeyDown(key: string): boolean {
        return this.keys.has(key);
    }

    getPointerPosition(): Vector2 {
        return {...this.pointerPosition};
    }

    isPointerPressed(): boolean {
        return this.isPointerDown;
    }

    update(): void {
        // Update any input-related logic that needs to run every frame
        // For example, you might want to track how long keys have been pressed
        // or handle input cooldowns here

        // Check for any keys that are currently down
        if (this.keys.size > 0) {
            this.eventSystem.emit('input:keysdown', {
                keys: Array.from(this.keys),
                position: this.getPointerPosition()
            });
        }

        // Emit continuous move events if pointer is down
        if (this.isPointerDown) {
            this.eventSystem.emit('input:pointerdrag', {
                position: this.getPointerPosition(),
                isDown: true
            });
        }

        // Update touch positions
        this.touchIds.forEach((position, id) => {
            this.eventSystem.emit('input:touchmove', {
                touchId: id,
                position,
                isDown: true
            });
        });
    }

    cleanup(): void {
        // Remove all event listeners
        this.canvas.removeEventListener('mousedown', this.handlePointerDown);
        this.canvas.removeEventListener('mousemove', this.handlePointerMove);
        this.canvas.removeEventListener('mouseup', this.handlePointerUp);
        this.canvas.removeEventListener('mouseleave', this.handlePointerUp);
        this.canvas.removeEventListener('touchstart', this.handleTouchStart);
        this.canvas.removeEventListener('touchmove', this.handleTouchMove);
        this.canvas.removeEventListener('touchend', this.handleTouchEnd);
        this.canvas.removeEventListener('touchcancel', this.handleTouchEnd);
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
    }

    private setupEventListeners(): void {
        // Mouse events
        this.canvas.addEventListener('mousedown', this.handlePointerDown);
        this.canvas.addEventListener('mousemove', this.handlePointerMove);
        this.canvas.addEventListener('mouseup', this.handlePointerUp);
        this.canvas.addEventListener('mouseleave', this.handlePointerUp);

        // Touch events
        this.canvas.addEventListener('touchstart', this.handleTouchStart, {passive: false});
        this.canvas.addEventListener('touchmove', this.handleTouchMove, {passive: false});
        this.canvas.addEventListener('touchend', this.handleTouchEnd);
        this.canvas.addEventListener('touchcancel', this.handleTouchEnd);

        // Keyboard events
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
    }

    private getCanvasPosition(clientX: number, clientY: number): Vector2 {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    }

    private getSwipeDirection(dx: number, dy: number): string {
        if (Math.abs(dx) > Math.abs(dy)) {
            return dx > 0 ? 'right' : 'left';
        } else {
            return dy > 0 ? 'down' : 'up';
        }
    }

    private handlePointerDown = (e: MouseEvent): void => {
        e.preventDefault();
        this.isPointerDown = true;
        this.pointerPosition = this.getCanvasPosition(e.clientX, e.clientY);

        // Gesture tracking
        this.gestureStartTime = Date.now();
        this.gestureStartPos = {...this.pointerPosition};

        // Setup long press detection
        this.longPressTimeout = window.setTimeout(() => {
            this.eventSystem.emit('input:longpress', {
                position: this.pointerPosition,
                duration: Date.now() - this.gestureStartTime
            });
        }, this.longPressDuration);

        this.emitInputEvent('pointerdown', this.pointerPosition, e);
    };

    private handlePointerMove = (e: MouseEvent): void => {
        e.preventDefault();
        const lastPos = {...this.pointerPosition};
        this.pointerPosition = this.getCanvasPosition(e.clientX, e.clientY);

        // Emit the move event first
        this.emitInputEvent('pointermove', this.pointerPosition, e);

        // Detect swipe
        if (this.isPointerDown) {
            const dx = this.pointerPosition.x - this.gestureStartPos.x;
            const dy = this.pointerPosition.y - this.gestureStartPos.y;
            const distance = Math.hypot(dx, dy);

            if (distance > this.gestureThreshold) {
                // Cancel long press if we're moving
                if (this.longPressTimeout) {
                    clearTimeout(this.longPressTimeout);
                    this.longPressTimeout = null;
                }

                // Emit swipe event
                this.eventSystem.emit('input:swipe', {
                    start: {...this.gestureStartPos},
                    end: {...this.pointerPosition},
                    delta: {x: dx, y: dy},
                    direction: this.getSwipeDirection(dx, dy),
                    distance: distance,
                    duration: Date.now() - this.gestureStartTime
                });
            }
        }
    };

    private handlePointerUp = (e: MouseEvent): void => {
        e.preventDefault();
        this.isPointerDown = false;
        this.pointerPosition = this.getCanvasPosition(e.clientX, e.clientY);

        // Clear long press timeout
        if (this.longPressTimeout) {
            clearTimeout(this.longPressTimeout);
            this.longPressTimeout = null;
        }

        // Check for tap/click
        const now = Date.now();
        const timeSinceLastTap = now - this.lastTapTime;
        const distance = Math.hypot(
            this.pointerPosition.x - this.lastTapPos.x,
            this.pointerPosition.y - this.lastTapPos.y
        );

        if (timeSinceLastTap < this.doubleTapThreshold &&
            distance < this.doubleTapDistanceThreshold) {
            // Double tap detected
            this.eventSystem.emit('input:doubletap', {
                position: this.pointerPosition
            });
        } else {
            // Single tap
            this.eventSystem.emit('input:singletap', {
                position: this.pointerPosition
            });
        }

        this.lastTapTime = now;
        this.lastTapPos = {...this.pointerPosition};

        this.emitInputEvent('pointerup', this.pointerPosition, e);
    };

    private handleTouchStart = (e: TouchEvent): void => {
        e.preventDefault();
        Array.from(e.changedTouches).forEach(touch => {
            const position = this.getCanvasPosition(touch.clientX, touch.clientY);
            this.touchIds.set(touch.identifier, position);
            this.emitInputEvent('pointerdown', position, e, touch.identifier);
        });
    };

    private handleTouchMove = (e: TouchEvent): void => {
        e.preventDefault();
        Array.from(e.changedTouches).forEach(touch => {
            const position = this.getCanvasPosition(touch.clientX, touch.clientY);
            this.touchIds.set(touch.identifier, position);
            this.emitInputEvent('pointermove', position, e, touch.identifier);
        });
    };

    private handleTouchEnd = (e: TouchEvent): void => {
        e.preventDefault();
        Array.from(e.changedTouches).forEach(touch => {
            const position = this.getCanvasPosition(touch.clientX, touch.clientY);
            this.touchIds.delete(touch.identifier);
            this.emitInputEvent('pointerup', position, e, touch.identifier);
        });
    };

    private handleKeyDown = (e: KeyboardEvent): void => {
        if (this.keys.has(e.code)) return;
        this.keys.add(e.code);
        this.emitInputEvent('keydown', undefined, e, undefined, e.code);
    };

    private handleKeyUp = (e: KeyboardEvent): void => {
        this.keys.delete(e.code);
        this.emitInputEvent('keyup', undefined, e, undefined, e.code);
    };

    private emitInputEvent(
        type: string,
        position: Vector2 | undefined,
        originalEvent: Event,
        touchId?: number,
        key?: string
    ): void {
        const event: InputEvent = {
            type: type as any,
            position,
            originalEvent,
            key
        };
        this.eventSystem.emit('input', event);
        this.eventSystem.emit(`input:${type}`, event);
    }
}