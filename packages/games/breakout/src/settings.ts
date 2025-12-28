// games/breakout/src/settings.ts
export type BreakoutSettings = {
    mouseControl: boolean;
};

export const BREAKOUT_SETTINGS_KEY = "gamehub:breakout";

export function getBreakoutSettings(): BreakoutSettings {
    if (typeof window === "undefined") {
        return {mouseControl: false};
    }
    try {
        const raw = localStorage.getItem(BREAKOUT_SETTINGS_KEY);
        if (!raw) {
            return {mouseControl: false};
        }
        const parsed = JSON.parse(raw);
        return {mouseControl: !!parsed.mouseControl};
    } catch {
        return {mouseControl: false};
    }
}

export function saveBreakoutSettings(next: BreakoutSettings) {
    try {
        localStorage.setItem(BREAKOUT_SETTINGS_KEY, JSON.stringify(next));
    } catch {
        // ignore persistence errors
    }
}
