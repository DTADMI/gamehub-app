"use client";

import {enableGameKeyCapture, GameHUD} from "@games/shared";
import dynamic from "next/dynamic";
import {useEffect, useRef, useState} from "react";

const CheckersGame = dynamic(
    () => import("@games/checkers").then((m) => m.CheckersGame),
    {
        ssr: false,
        loading: () => (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading game...</div>
            </div>
        ),
    },
);

export default function CheckersPage() {
    const rootRef = useRef<HTMLDivElement | null>(null);
    const [seed, setSeed] = useState(0);

    useEffect(() => {
        const el = rootRef.current;
        el?.focus();
        const cleanup = enableGameKeyCapture({rootEl: el ?? undefined});
        return () => cleanup();
    }, []);

    return (
        <div
            ref={rootRef}
            className="relative min-h-[80vh] outline-none focus:outline-none"
            tabIndex={0}
            role="application"
            aria-label="Checkers game"
        >
            <CheckersGame key={seed}/>
            <GameHUD
                onPauseToggle={() => {
                    // Some board UIs toggle hints with Space; we dispatch it here if the game listens to keyboard
                    window.dispatchEvent(
                        new KeyboardEvent("keydown", {key: " ", code: "Space"}),
                    );
                }}
                onRestart={() => setSeed((s) => s + 1)}
                tips="Click a piece then a target tile • Follow legal moves to capture"
            />
        </div>
    );
}
