"use client";

import dynamic from "next/dynamic";
import {useEffect, useRef, useState} from "react";
import {enableGameKeyCapture, GameHUD} from "@games/shared";

const TetrisGame = dynamic(() => import("@games/tetris").then((m) => m.TetrisGame), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-xl">Loading game...</div>
    </div>
  ),
});

export default function TetrisGamePage() {
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
            aria-label="Tetris game"
        >
            <TetrisGame key={seed}/>
            <GameHUD
                onPauseToggle={() => {
                    window.dispatchEvent(new KeyboardEvent("keydown", {key: " ", code: "Space"}));
                }}
                onRestart={() => setSeed((s) => s + 1)}
                tips="Arrows to move • Up to rotate • Space to drop/pause (game dependent)"
            />
        </div>
    );
}
