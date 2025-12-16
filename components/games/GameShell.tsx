"use client";

import {enableGameKeyCapture, GameHUD, soundManager} from "@games/shared";
import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";

type PreloadSound = {
    key: string;
    url: string;
    loop?: boolean;
};

export type GameShellProps = {
    children: React.ReactNode;
    ariaLabel: string;
    tips?: string;
    className?: string;
    /**
     * Sounds to preload on mount. Music or ambient tracks can set loop=true.
     */
    preloadSounds?: PreloadSound[];
    /**
     * Show large mobile touch controls overlay (auto‑hidden on md+).
     */
    mobileControls?: boolean;
    /**
     * Called when user presses HUD pause/resume.
     * Default: dispatches a Space keydown or custom event 'pauseToggle' if keyboard not used by the game.
     */
    onPauseToggleAction?: () => void;
    /**
     * Called when user presses HUD restart.
     * Default: emits a custom 'game:restart' event.
     */
    onRestartAction?: () => void;
};

function MobileTouchControls({onKey}: { onKey: (key: string) => void }) {
    const send = useCallback(
        (key: string) => {
            // Dispatch keyboard to integrate with keyboard‑driven games
            onKey(key);
            // Haptics if available
            try {
                if (navigator.vibrate) {
                    navigator.vibrate(10);
                }
            } catch {
            }
        },
        [onKey],
    );

    // Avoid re-renders
    return useMemo(
        () => (
            <div className="pointer-events-none fixed inset-0 flex flex-col justify-end p-4 gap-4 md:hidden">
                <div className="pointer-events-auto mx-auto grid grid-cols-3 gap-3">
                    <button
                        aria-label="Up"
                        className="row-start-1 col-start-2 rounded-full size-14 bg-black/40 text-white backdrop-blur hover:bg-black/50 active:scale-95"
                        onClick={() => send("ArrowUp")}
                    >
                        ▲
                    </button>
                    <button
                        aria-label="Left"
                        className="row-start-2 col-start-1 rounded-full size-14 bg-black/40 text-white backdrop-blur hover:bg-black/50 active:scale-95"
                        onClick={() => send("ArrowLeft")}
                    >
                        ◀
                    </button>
                    <button
                        aria-label="Down"
                        className="row-start-2 col-start-2 rounded-full size-14 bg-black/40 text-white backdrop-blur hover:bg-black/50 active:scale-95"
                        onClick={() => send("ArrowDown")}
                    >
                        ▼
                    </button>
                    <button
                        aria-label="Right"
                        className="row-start-2 col-start-3 rounded-full size-14 bg-black/40 text-white backdrop-blur hover:bg-black/50 active:scale-95"
                        onClick={() => send("ArrowRight")}
                    >
                        ▶
                    </button>
                </div>
                <div className="pointer-events-auto flex justify-center">
                    <button
                        aria-label="Pause or resume"
                        className="rounded-full px-6 py-3 bg-primary text-primary-foreground shadow-md hover:bg-primary/90 active:scale-95"
                        onClick={() => send(" ")}
                    >
                        Pause / Resume
                    </button>
                </div>
            </div>
        ),
        [send],
    );
}

export function GameShell({
                              children,
                              ariaLabel,
                              tips,
                              className,
                              preloadSounds,
                              mobileControls = true,
                              onPauseToggleAction,
                              onRestartAction,
                          }: GameShellProps) {
    const rootRef = useRef<HTMLDivElement | null>(null);
    const [muted, setMuted] = useState<boolean>(false);

    useEffect(() => {
        const el = rootRef.current;
        el?.focus();
        const cleanupCapture = enableGameKeyCapture({rootEl: el ?? undefined});

        const preload = async () => {
            if (!preloadSounds || !preloadSounds.length) {
                return;
            }
            try {
                await Promise.all(
                    preloadSounds.map((s) =>
                        soundManager.preloadSound(s.key, s.url, !!s.loop),
                    ),
                );
            } catch (e) {
                console.warn("[GameShell] sound preload failed", e);
            }
        };
        preload();

        return () => {
            try {
                soundManager.stopMusic();
            } catch {
            }
            cleanupCapture();
        };
    }, [preloadSounds]);

    // Persist and apply mute preference
    useEffect(() => {
        try {
            const saved = localStorage.getItem("gamehub:soundMuted");
            const initial = saved === "true";
            setMuted(initial);
            // Best-effort: apply to sound manager if supported
            (soundManager as any)?.setMuted?.(initial);
        } catch {
            // ignore
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem("gamehub:soundMuted", String(muted));
            (soundManager as any)?.setMuted?.(muted);
        } catch {
            // ignore
        }
    }, [muted]);

    const sendKey = useCallback((key: string) => {
        // Try dispatching a keyboard event by default
        window.dispatchEvent(new KeyboardEvent("keydown", {key}));
    }, []);

    const handlePause = useCallback(() => {
        if (onPauseToggleAction) {
            return onPauseToggleAction();
        }
        // Fallback: emit custom event then Space for keyboard‑driven games
        window.dispatchEvent(new Event("game:pauseToggle"));
        sendKey(" ");
    }, [onPauseToggleAction, sendKey]);

    const handleRestart = useCallback(() => {
        if (onRestartAction) {
            return onRestartAction();
        }
        window.dispatchEvent(new Event("game:restart"));
    }, [onRestartAction]);

    return (
        <div
            ref={rootRef}
            className={`relative min-h-[80vh] outline-none focus:outline-none ${className ?? ""}`}
            tabIndex={0}
            role="application"
            aria-label={ariaLabel}
        >
            {/* Sound toggle (persists to localStorage) */}
            <div className="absolute right-3 top-3 z-20 flex items-center gap-2">
                <button
                    aria-label={muted ? "Unmute sound" : "Mute sound"}
                    className="rounded-md border bg-background px-2 py-1 text-sm shadow-sm hover:bg-muted"
                    onClick={() => setMuted((m) => !m)}
                >
                    {muted ? "🔇 Mute" : "🔈 Sound"}
                </button>
            </div>
            {children}
            {mobileControls && <MobileTouchControls onKey={sendKey}/>}
            <GameHUD
                onPauseToggleAction={handlePause}
                onRestartAction={handleRestart}
                tips={tips}
            />
        </div>
    );
}

export default GameShell;
