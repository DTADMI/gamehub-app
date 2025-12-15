// libs/shared/src/contexts/GameSettingsContext.tsx
import React, {createContext, useContext, useEffect, useMemo, useState} from "react";

export type GameSettings = {
    enableParticles: boolean;
    setEnableParticles: (v: boolean) => void;
  particleEffect: "sparks" | "puff";
  setParticleEffect: (t: "sparks" | "puff") => void;
};

const GameSettingsContext = createContext<GameSettings | null>(null);

const STORAGE_KEY = "gamehub:settings";

function loadInitial(): Pick<GameSettings, "enableParticles" | "particleEffect"> {
    if (typeof window === "undefined") {
      return {enableParticles: false, particleEffect: "sparks"};
    }
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return {enableParticles: false, particleEffect: "sparks"};
      }
        const parsed = JSON.parse(raw);
      return {
        enableParticles: !!parsed.enableParticles,
        particleEffect: parsed.particleEffect === "puff" ? "puff" : "sparks",
      };
    } catch {
      return {enableParticles: false, particleEffect: "sparks"};
    }
}

export function GameSettingsProvider({children}: { children: React.ReactNode }) {
  const initial = loadInitial();
  const [enableParticles, setEnableParticles] = useState(initial.enableParticles);
  const [particleEffect, setParticleEffect] = useState<"sparks" | "puff">(initial.particleEffect);

    useEffect(() => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({enableParticles, particleEffect}));
        } catch {
            // ignore
        }
    }, [enableParticles, particleEffect]);

  const value = useMemo<GameSettings>(
      () => ({enableParticles, setEnableParticles, particleEffect, setParticleEffect}),
      [enableParticles, particleEffect],
  );
    return <GameSettingsContext.Provider value={value}>{children}</GameSettingsContext.Provider>;
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
        };
    }
    return ctx;
}
