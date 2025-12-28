"use client";
import React, {useCallback, useEffect, useMemo, useReducer, useRef} from "react";

export type SceneId = string;
export type Choice = { id: string; label: string; next: SceneId };
export type Scene = {
    id: SceneId;
    title: string;
    onEnter?: (state: GameState) => void;
    render: (ctx: {
        go: (next: SceneId) => void;
        setFlag: (k: string, v: any) => void;
        addItem: (id: string) => void;
        removeItem: (id: string) => void;
        state: GameState
    }) => React.ReactNode;
};

export type GameState = {
    scene: SceneId;
    flags: Record<string, any>;
    inventory: string[];
    version?: number;
};

type Action =
    | { type: "GO"; next: SceneId }
    | { type: "SET_FLAG"; key: string; value: any }
    | { type: "ADD_ITEM"; id: string }
    | { type: "REMOVE_ITEM"; id: string }
    | { type: "LOAD"; payload: GameState };

function reducer(state: GameState, action: Action): GameState {
    switch (action.type) {
        case "GO":
            return {...state, scene: action.next};
        case "SET_FLAG":
            return {...state, flags: {...state.flags, [action.key]: action.value}};
        case "ADD_ITEM": {
            if (state.inventory.includes(action.id)) {
                return state;
            }
            return {...state, inventory: [...state.inventory, action.id]};
        }
        case "REMOVE_ITEM": {
            return {...state, inventory: state.inventory.filter(i => i !== action.id)};
        }
        case "LOAD":
            return action.payload;
        default:
            return state;
    }
}

export function useSaveService(key: string, initial: GameState) {
    const [state, dispatch] = useReducer(reducer, initial);
    const saveRef = useRef(key);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(saveRef.current);
            if (raw) {
                const parsed = JSON.parse(raw) as GameState;
                // Migration guard: ensure version is present
                if (!parsed.version) {
                    parsed.version = 1;
                }
                dispatch({type: "LOAD", payload: parsed});
            }
        } catch {
        }

    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(saveRef.current, JSON.stringify(state));
        } catch {
        }
    }, [state]);

    return {state, dispatch} as const;
}

export function SceneController({scenes, initial, saveKey}: { scenes: Scene[]; initial: GameState; saveKey: string }) {
    const map = useMemo(() => new Map(scenes.map(s => [s.id, s])), [scenes]);
    const {state, dispatch} = useSaveService(saveKey, {...initial, version: 1});

    const go = useCallback((next: SceneId) => dispatch({type: "GO", next}), [dispatch]);
    const setFlag = useCallback((k: string, v: any) => dispatch({type: "SET_FLAG", key: k, value: v}), [dispatch]);
    const addItem = useCallback((id: string) => dispatch({type: "ADD_ITEM", id}), [dispatch]);
    const removeItem = useCallback((id: string) => dispatch({type: "REMOVE_ITEM", id}), [dispatch]);

    const scene = map.get(state.scene);

    useEffect(() => {
        if (scene?.onEnter) {
            scene.onEnter(state);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.scene]);

    if (!scene) {
        return <div className="p-8">Unknown scene: {state.scene}</div>;
    }

    const gentle = Boolean(state.flags["gentle"]);
    const volume = Number(state.flags["volume"] ?? 100);

    return (
        <div className="mx-auto max-w-3xl p-4">
            <div className="flex items-center justify-between gap-4 mb-3">
                <h1 className="text-2xl font-semibold">{scene.title}</h1>
                <label className="inline-flex items-center gap-2 text-sm cursor-pointer select-none">
                    <input
                        aria-label="Gentle Mode"
                        type="checkbox"
                        checked={gentle}
                        onChange={(e) => setFlag("gentle", e.target.checked)}
                        className="h-5 w-5"
                    />
                    <span>Gentle Mode</span>
                </label>
            </div>
            <div className="flex items-center justify-between gap-4 mb-3">
                <div className="text-sm opacity-80">{/* reserved for breadcrumbs */}</div>
                <label className="inline-flex items-center gap-2 text-sm">
                    <span>Volume</span>
                    <select
                        aria-label="Volume"
                        className="border rounded px-2 py-1"
                        value={volume}
                        onChange={(e) => setFlag("volume", Number(e.target.value))}
                    >
                        <option value={0}>Mute</option>
                        <option value={50}>50%</option>
                        <option value={100}>100%</option>
                    </select>
                </label>
            </div>
            {/* Inventory placeholder (global), keyboard/focusable items */}
            <div className="mb-3" aria-label="Inventory" role="region">
                <div className="text-sm font-medium mb-1">Inventory ({state.inventory.length})</div>
                <div className="flex flex-wrap gap-2">
                    {state.inventory.length === 0 ? (
                        <span className="text-sm opacity-70">Empty</span>
                    ) : (
                        state.inventory.map(item => (
                            <button
                                key={item}
                                className="min-h-[32px] px-2 py-1 rounded border text-sm"
                                aria-label={`Inventory item ${item}`}
                                onClick={() => {/* reserved for future inspect/use */
                                }}
                            >{item}</button>
                        ))
                    )}
                </div>
            </div>
            {/* Optional captions/announcements region for SFX or hints */}
            <div
                role="status"
                aria-live="polite"
                className="mb-3 text-sm opacity-80 min-h-[1.5rem]"
                data-testid="captions"
            >
                {typeof state.flags["caption"] === "string" ? state.flags["caption"] : ""}
            </div>
            <div className="space-y-4">{scene.render({go, setFlag, addItem, removeItem, state})}</div>
        </div>
    );
}

export function HotspotButton({onClick, children, testId}: {
    onClick: () => void;
    children: React.ReactNode;
    testId?: string
}) {
    return (
        <button
            data-testid={testId}
            onClick={onClick}
            className="min-h-[44px] px-4 py-2 rounded bg-primary text-primary-foreground hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        >
            {children}
        </button>
    );
}

export function ChoiceList({choices, onPick}: { choices: Choice[]; onPick: (id: string, next: SceneId) => void }) {
    return (
        <div className="grid gap-2">
            {choices.map(c => (
                <HotspotButton key={c.id} onClick={() => onPick(c.id, c.next)} testId={`choice-${c.id}`}>
                    {c.label}
                </HotspotButton>
            ))}
        </div>
    );
}
