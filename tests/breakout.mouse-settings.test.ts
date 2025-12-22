import {beforeEach, describe, expect, it} from "vitest";
import {BREAKOUT_SETTINGS_KEY, getBreakoutSettings, saveBreakoutSettings} from "@games/breakout/src/settings";

// Provide a simple localStorage mock for the test environment
const makeStore = () => {
    let store: Record<string, string> = {};
    return {
        getItem: (k: string) => (k in store ? store[k] : null),
        setItem: (k: string, v: string) => {
            store[k] = String(v);
        },
        removeItem: (k: string) => {
            delete store[k];
        },
        clear: () => {
            store = {};
        },
    } as Storage;
};

describe("Breakout mouse settings persistence", () => {
    beforeEach(() => {
        // @ts-ignore
        globalThis.localStorage = makeStore();
    });

    it("defaults to mouseControl=false when nothing stored", () => {
        const s = getBreakoutSettings();
        expect(s.mouseControl).toBe(false);
    });

    it("saves and loads mouseControl=true", () => {
        saveBreakoutSettings({mouseControl: true});
        const raw = localStorage.getItem(BREAKOUT_SETTINGS_KEY);
        expect(raw).toBeTruthy();
        const s = getBreakoutSettings();
        expect(s.mouseControl).toBe(true);
    });
});
