export type Lang = "en" | "fr";

export type Choice = {
    id: string;
    text: Record<Lang, string>;
    target: string; // next scene id
    guard?: (ctx: Record<string, any>) => boolean;
    effect?: (ctx: Record<string, any>) => Record<string, any>;
};

export type Scene = {
    id: string;
    title: Record<Lang, string>;
    body?: Record<Lang, string>;
    choices: Choice[];
};

export type SaveState = {
    sceneId: string;
    ctx: Record<string, any>;
    v: 1;
};

export function detectLang(): Lang {
    if (typeof navigator !== "undefined") {
        const n = navigator.language.toLowerCase();
        if (n.startsWith("fr")) return "fr";
    }
    if (typeof document !== "undefined") {
        const dl = document.documentElement.lang?.toLowerCase();
        if (dl?.startsWith("fr")) return "fr";
    }
    return "en";
}

export function nextScene(
    currentSceneId: string,
    scenes: Record<string, Scene>,
    choiceId: string,
    ctx: Record<string, any> = {},
): { sceneId: string; ctx: Record<string, any> } {
    const scene = scenes[currentSceneId];
    if (!scene) return {sceneId: currentSceneId, ctx};
    const choice = scene.choices.find((c) => c.id === choiceId);
    if (!choice) return {sceneId: currentSceneId, ctx};
    if (choice.guard && !choice.guard(ctx)) return {sceneId: currentSceneId, ctx};
    const nextCtx = choice.effect ? choice.effect(ctx) : ctx;
    return {sceneId: choice.target, ctx: nextCtx};
}

export function save(key: string, state: SaveState) {
    try {
        localStorage.setItem(key, JSON.stringify(state));
    } catch {
    }
}

export function load(key: string): SaveState | null {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.sceneId === "string") return parsed as SaveState;
    } catch {
    }
    return null;
}
