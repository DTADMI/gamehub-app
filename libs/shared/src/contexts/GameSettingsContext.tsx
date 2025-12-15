// libs/shared/src/contexts/GameSettingsContext.tsx
import React, {createContext, useContext, useEffect, useMemo, useState} from "react";

export type GameSettings = {
    enableParticles: boolean;
    setEnableParticles: (v: boolean) => void;
};

const GameSettingsContext = createContext<GameSettings | null>(null);

const STORAGE_KEY = "gamehub:settings";

function loadInitial(): Pick<GameSettings, "enableParticles"> {
    if (typeof window === "undefined") {
        return {enableParticles: false};
    }
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return {enableParticles: false};
      }
        const parsed = JSON.parse(raw);
        return {enableParticles: !!parsed.enableParticles};
    } catch {
        return {enableParticles: false};
    }
}

export function GameSettingsProvider({children}: { children: React.ReactNode }) {
    const [enableParticles, setEnableParticles] = useState(loadInitial().enableParticles);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({enableParticles}));
        } catch {
            // ignore
        }
    }, [enableParticles]);

    const value = useMemo<GameSettings>(() => ({enableParticles, setEnableParticles}), [enableParticles]);
    return <GameSettingsContext.Provider value={value}>{children}</GameSettingsContext.Provider>;
}

export function useGameSettings(): GameSettings {
    const ctx = useContext(GameSettingsContext);
    if (!ctx) {
        return {
            enableParticles: false,
            setEnableParticles: () => {
            },
        };
    }
    return ctx;
}
