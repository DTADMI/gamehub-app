import "@testing-library/jest-dom/vitest";

import {cleanup} from "@testing-library/react";
import {afterEach, beforeAll} from "vitest";

// Run cleanup after each test case
afterEach(() => {
    cleanup();
});

// Mock localStorage
class LocalStorageMock {
    private store: Record<string, string> = {};

    get length(): number {
        return Object.keys(this.store).length;
    }

    clear() {
        this.store = {};
    }

    getItem(key: string): string | null {
        return this.store[key] || null;
    }

    setItem(key: string, value: string) {
        this.store[key] = String(value);
    }

    removeItem(key: string) {
        delete this.store[key];
    }

    key(index: number): string | null {
        return Object.keys(this.store)[index] || null;
    }
}

// Set up mocks before all tests
beforeAll(() => {
    // Mock matchMedia for libraries like next-themes
    if (typeof window !== "undefined" && !window.matchMedia) {
        // @ts-ignore
        window.matchMedia = (query: string) => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: () => {
            },
            removeListener: () => {
            },
            addEventListener: () => {
            },
            removeEventListener: () => {
            },
            dispatchEvent: () => true,
        });
    }

    // Mock localStorage
    if (typeof globalThis !== "undefined") {
        // Use Object.defineProperty to set the mock
        Object.defineProperty(globalThis, 'localStorage', {
            value: new LocalStorageMock(),
            writable: true,
            configurable: true
        });
    }
});
