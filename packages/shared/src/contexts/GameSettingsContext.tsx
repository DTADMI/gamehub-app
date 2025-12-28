"use client";

// libs/shared/src/contexts/GameSettingsContext.tsx
import React, {createContext, useContext, useEffect, useMemo, useState,} from "react";

export type GameSettings = {
    enableParticles: boolean;
    setEnableParticles: (v: boolean) => void;
    particleEffect: "sparks" | "puff";
    setParticleEffect: (t: "sparks" | "puff") => void;
    // Gameplay mode and entitlements used for gating
    mode: "classic" | "hard" | "chaos";
    setMode: (m: "classic" | "hard" | "chaos") => void;
    isAuthenticated: boolean;
    isSubscriber: boolean;
    setAuthState: (auth: boolean, sub: boolean) => void;
};

const GameSettingsContext = createContext<GameSettings | null>(null);

const STORAGE_KEY = "gamehub:settings";

function loadInitial(): Pick<
    GameSettings,
    "enableParticles" | "particleEffect" | "mode"
> & {
    isAuthenticated: boolean;
    isSubscriber: boolean;
} {
    if (typeof window === "undefined") {
        return {
            enableParticles: false,
            particleEffect: "sparks",
            mode: "classic",
            isAuthenticated: false,
            isSubscriber: false,
        };
    }
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return {
                enableParticles: false,
                particleEffect: "sparks",
                mode: "classic",
                isAuthenticated: false,
                isSubscriber: false,
            };
        }
        const parsed = JSON.parse(raw);
        return {
            enableParticles: !!parsed.enableParticles,
            particleEffect: parsed.particleEffect === "puff" ? "puff" : "sparks",
            mode:
                parsed.mode === "hard" || parsed.mode === "chaos"
                    ? parsed.mode
                    : "classic",
            isAuthenticated: !!parsed.isAuthenticated,
            isSubscriber: !!parsed.isSubscriber,
        };
    } catch {
        return {
            enableParticles: false,
            particleEffect: "sparks",
            mode: "classic",
            isAuthenticated: false,
            isSubscriber: false,
        };
    }
}

export function GameSettingsProvider({
                                         children,
                                     }: {
    children: React.ReactNode;
}) {
    // Ensure localStorage exists in test environments
    if (
        typeof window !== "undefined" &&
        typeof window.localStorage === "undefined"
    ) {
        try {
            const store: Record<string, string> = {};
            (window as any).localStorage = {
                getItem: (k: string) => (k in store ? store[k] : null),
                setItem: (k: string, v: string) => {
                    store[k] = String(v);
                },
                removeItem: (k: string) => {
                    delete store[k];
                },
                clear: () => {
                    for (const key of Object.keys(store)) {
                        delete store[key];
                    }
                },
                key: (i: number) => Object.keys(store)[i] ?? null,
                get length() {
                    return Object.keys(store).length;
                },
            } as any;
        } catch {
            // ignore
        }
    }
    const initial = loadInitial();
    const [enableParticles, setEnableParticles] = useState(
        initial.enableParticles,
    );
    const [particleEffect, setParticleEffect] = useState<"sparks" | "puff">(
        initial.particleEffect,
    );
    const [mode, setMode] = useState<"classic" | "hard" | "chaos">(initial.mode);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
        initial.isAuthenticated,
    );
    const [isSubscriber, setIsSubscriber] = useState<boolean>(
        initial.isSubscriber,
    );

    useEffect(() => {
        const payload = {
            enableParticles,
            particleEffect,
            mode,
            isAuthenticated,
            isSubscriber,
        };
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        } catch {
            // ignore
        }
        try {
            // Notify any non-context consumers (e.g., games that can’t access the provider directly)
            if (typeof window !== "undefined") {
                window.dispatchEvent(
                    new CustomEvent("gamehub:settings", {detail: payload}),
                );
            }
        } catch {
            // ignore
        }
    }, [enableParticles, particleEffect, mode, isAuthenticated, isSubscriber]);

    const setAuthState = (auth: boolean, sub: boolean) => {
        setIsAuthenticated(!!auth);
        setIsSubscriber(!!sub);
    };

    const value = useMemo<GameSettings>(
        () => ({
            enableParticles,
            setEnableParticles,
            particleEffect,
            setParticleEffect,
            mode,
            setMode,
            isAuthenticated,
            isSubscriber,
            setAuthState,
        }),
        [enableParticles, particleEffect, mode, isAuthenticated, isSubscriber],
    );
    return (
        <GameSettingsContext.Provider value={value}>
            {children}
        </GameSettingsContext.Provider>
    );
}

export function useGameSettings(): GameSettings {
    const ctx = useContext(GameSettingsContext);
    if (!ctx) {
        return {
            enableParticles: false,
            setEnableParticles: () => {
            },
            particleEffect: "sparks",
            setParticleEffect: () => {
            },
            mode: "classic",
            setMode: () => {
            },
            isAuthenticated: false,
            isSubscriber: false,
            setAuthState: () => {
            },
        };
    }
    return ctx;
}
