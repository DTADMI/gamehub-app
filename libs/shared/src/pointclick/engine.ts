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

// Core runtime context shape used by narrative games
export type EngineCtx = {
    flags: Record<string, boolean>;
    inventory: string[];
    vars: Record<string, any>;
};

export type SaveState = {
    sceneId: string;
    ctx: EngineCtx;
    v: 1; // versioned for future migrations
};

export function detectLang(): Lang {
    if (typeof navigator !== "undefined") {
        const n = navigator.language.toLowerCase();
        if (n.startsWith("fr")) {
            return "fr";
        }
    }
    if (typeof document !== "undefined") {
        const dl = document.documentElement.lang?.toLowerCase();
        if (dl?.startsWith("fr")) {
            return "fr";
        }
    }
    return "en";
}

export function nextScene(
    currentSceneId: string,
    scenes: Record<string, Scene>,
    choiceId: string,
    ctx: Partial<EngineCtx> = {},
): { sceneId: string; ctx: EngineCtx } {
    const scene = scenes[currentSceneId];
    const safeCtx = ensureCtx(ctx);
    if (!scene) {
        return {sceneId: currentSceneId, ctx: safeCtx};
    }
    const choice = scene.choices.find((c) => c.id === choiceId);
    if (!choice) {
        return {sceneId: currentSceneId, ctx: safeCtx};
    }
    if (choice.guard && !choice.guard(safeCtx)) {
        return {sceneId: currentSceneId, ctx: safeCtx};
    }
    const nextCtx = choice.effect ? ensureCtx(choice.effect(safeCtx)) : safeCtx;
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
        if (!raw) {
            return null;
        }
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.sceneId === "string") {
            // Defensive normalize of ctx shape
            const norm: SaveState = {
                sceneId: parsed.sceneId,
                ctx: ensureCtx(parsed.ctx || {}),
                v: parsed.v ?? 1,
            };
            return norm;
        }
    } catch {
    }
    return null;
}

// --- Helpers: context & effects API ---

export function ensureCtx(ctx: Partial<EngineCtx> | undefined): EngineCtx {
    return {
        flags: ctx?.flags ?? {},
        inventory: ctx?.inventory ?? [],
        vars: ctx?.vars ?? {},
    };
}

export const effects = {
    setFlag: (key: string, value = true) => (ctx: EngineCtx) => ({
        ...ctx,
        flags: {...ctx.flags, [key]: value},
    }),
    addItem: (id: string) => (ctx: EngineCtx) =>
        ctx.inventory.includes(id)
            ? ctx
            : {...ctx, inventory: [...ctx.inventory, id]},
    removeItem: (id: string) => (ctx: EngineCtx) => ({
        ...ctx,
        inventory: ctx.inventory.filter((x) => x !== id),
    }),
    setVar: (key: string, value: any) => (ctx: EngineCtx) => ({
        ...ctx,
        vars: {...ctx.vars, [key]: value},
    }),
};

export const guards = {
    hasFlag: (key: string, value = true) => (ctx: EngineCtx) =>
        (ctx.flags?.[key] ?? false) === value,
    hasItem: (id: string) => (ctx: EngineCtx) => ctx.inventory?.includes(id) ?? false,
    varEquals: (key: string, value: any) => (ctx: EngineCtx) => ctx.vars?.[key] === value,
};

// Very small migration hook (kept simple for now)
export type Migrator = (raw: any) => SaveState | null;

export function migrate(raw: any, _migrator?: Migrator): SaveState | null {
    try {
        if (!raw) {
            return null;
        }
        if (raw.v === 1) {
            return {
                sceneId: String(raw.sceneId || "intro"),
                ctx: ensureCtx(raw.ctx || {}),
                v: 1,
            };
        }
        return _migrator ? _migrator(raw) : null;
    } catch {
        return null;
    }
}
