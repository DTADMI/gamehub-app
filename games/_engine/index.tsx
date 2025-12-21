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
        state: GameState
    }) => React.ReactNode;
};

export type GameState = {
    scene: SceneId;
    flags: Record<string, any>;
    inventory: string[];
};

type Action =
    | { type: "GO"; next: SceneId }
    | { type: "SET_FLAG"; key: string; value: any }
    | { type: "LOAD"; payload: GameState };

function reducer(state: GameState, action: Action): GameState {
    switch (action.type) {
        case "GO":
            return {...state, scene: action.next};
        case "SET_FLAG":
            return {...state, flags: {...state.flags, [action.key]: action.value}};
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
                dispatch({type: "LOAD", payload: parsed});
            }
        } catch {
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const {state, dispatch} = useSaveService(saveKey, initial);

    const go = useCallback((next: SceneId) => dispatch({type: "GO", next}), [dispatch]);
    const setFlag = useCallback((k: string, v: any) => dispatch({type: "SET_FLAG", key: k, value: v}), [dispatch]);

    const scene = map.get(state.scene);

    useEffect(() => {
        if (scene?.onEnter) scene.onEnter(state);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.scene]);

    if (!scene) return <div className="p-8">Unknown scene: {state.scene}</div>;

    return (
        <div className="mx-auto max-w-3xl p-4">
            <h1 className="text-2xl font-semibold mb-4">{scene.title}</h1>
            <div className="space-y-4">{scene.render({go, setFlag, state})}</div>
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
