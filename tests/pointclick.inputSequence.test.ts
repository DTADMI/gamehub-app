import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {EventSystem} from '@games/shared/pointclick/utils/EventSystem';
import {InputManager} from '@games/shared/pointclick/core/InputManager';

function createCanvas(width = 320, height = 180): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    // Mock getContext
    // @ts-ignore
    canvas.getContext = vi.fn().mockReturnValue({
        fillStyle: '',
        fillRect: vi.fn(),
        scale: vi.fn(),
        font: '',
        textBaseline: '',
        fillText: vi.fn(),
    });
    // Mock getBoundingClientRect to stable rect
    canvas.getBoundingClientRect = vi.fn().mockReturnValue({
        left: 0,
        top: 0,
        width,
        height,
        right: width,
        bottom: height,
        x: 0,
        y: 0,
        toJSON: () => ({}),
    } as any);
    return canvas;
}

describe('InputSequenceDetector integration', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });
    afterEach(() => {
        vi.useRealTimers();
    });

    it('detects a hold-then-drag macro sequence', () => {
        const canvas = createCanvas();
        const events = new EventSystem();
        const input = new InputManager(canvas, events);

        let matched = false;
        input.registerSequenceMacro('holdThenDrag', ['pointerdown', 'longpress', 'swipe'], () => {
            matched = true;
        });

        // Dispatch mousedown (pointerdown)
        const down = new MouseEvent('mousedown', {clientX: 10, clientY: 10, bubbles: true});
        canvas.dispatchEvent(down);

        // Advance time to trigger longpress (default 800ms)
        vi.advanceTimersByTime(900);

        // Move enough to exceed swipe threshold (10px)
        const move = new MouseEvent('mousemove', {clientX: 40, clientY: 10, bubbles: true});
        canvas.dispatchEvent(move);

        // End pointer
        const up = new MouseEvent('mouseup', {clientX: 40, clientY: 10, bubbles: true});
        canvas.dispatchEvent(up);

        expect(matched).toBe(true);
    });

    it('emits input:macro:{name} event when a macro matches', () => {
        const canvas = createCanvas();
        const events = new EventSystem();
        const input = new InputManager(canvas, events);

        let payload: any = null;
        events.on('input:macro:doubleTap', (p: any) => (payload = p));
        input.registerSequenceMacro('doubleTap', ['doubletap'], undefined);

        // Trigger double tap (two quick clicks close together)
        const firstDown = new MouseEvent('mousedown', {clientX: 10, clientY: 10, bubbles: true});
        const firstUp = new MouseEvent('mouseup', {clientX: 10, clientY: 10, bubbles: true});
        const secondDown = new MouseEvent('mousedown', {clientX: 12, clientY: 11, bubbles: true});
        const secondUp = new MouseEvent('mouseup', {clientX: 12, clientY: 11, bubbles: true});

        canvas.dispatchEvent(firstDown);
        canvas.dispatchEvent(firstUp);
        // Within double tap threshold 300ms
        vi.advanceTimersByTime(100);
        canvas.dispatchEvent(secondDown);
        canvas.dispatchEvent(secondUp);

        expect(payload).not.toBeNull();
        expect(payload.name).toBe('doubleTap');
        expect(payload.sequence).toEqual(['doubletap']);
    });
});
