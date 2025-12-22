import {Bounds, Vector2} from '../types';

export class Helpers {
    static clamp(value: number, min: number, max: number): number {
        return Math.min(Math.max(value, min), max);
    }

    static lerp(start: number, end: number, t: number): number {
        return start + (end - start) * t;
    }

    static distance(p1: Vector2, p2: Vector2): number {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    static randomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static randomFloat(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }

    static randomChoice<T>(items: T[]): T {
        return items[Math.floor(Math.random() * items.length)];
    }

    static shuffle<T>(array: T[]): T[] {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }

    static formatTime(seconds: number): string {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    static pointInRect(point: Vector2, rect: Bounds): boolean {
        return (
            point.x >= rect.x &&
            point.x <= rect.x + rect.width &&
            point.y >= rect.y &&
            point.y <= rect.y + rect.height
        );
    }

    static rectsOverlap(a: Bounds, b: Bounds): boolean {
        return (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y
        );
    }

    static deepClone<T>(obj: T): T {
        return JSON.parse(JSON.stringify(obj));
    }

    static debounce<F extends (...args: any[]) => void>(
        func: F,
        wait: number
    ): (...args: Parameters<F>) => void {
        let timeout: ReturnType<typeof setTimeout> | null = null;
        return function (this: any, ...args: Parameters<F>) {
            const later = () => {
                timeout = null;
                func.apply(this, args);
            };
            if (timeout !== null) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(later, wait);
        };
    }

    static throttle<F extends (...args: any[]) => void>(
        func: F,
        limit: number
    ): (...args: Parameters<F>) => void {
        let inThrottle = false;
        return function (this: any, ...args: Parameters<F>) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => (inThrottle = false), limit);
            }
        };
    }

    static formatNumber(num: number): string {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    static async loadImage(src: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }

    static async loadJSON<T = any>(url: string): Promise<T> {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to load JSON: ${response.statusText}`);
        }
        return response.json();
    }

    static async loadScript(url: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.onload = () => resolve();
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
}

// Global helper functions
export const {
    clamp,
    lerp,
    distance,
    randomInt,
    randomFloat,
    randomChoice,
    shuffle,
    formatTime,
    pointInRect,
    rectsOverlap,
    deepClone,
    debounce,
    throttle,
    formatNumber,
    loadImage,
    loadJSON,
    loadScript
} = Helpers;