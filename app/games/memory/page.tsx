"use client";

import dynamic from "next/dynamic";
import {useEffect, useRef, useState} from "react";
import {enableGameKeyCapture, GameHUD} from "@games/shared";

const MemoryGame = dynamic(() => import("@games/memory").then((m) => m.MemoryGame), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-xl">Loading game...</div>
    </div>
  ),
});

export default function MemoryGamePage() {
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
            aria-label="Memory game"
        >
            <MemoryGame key={seed}/>
            <GameHUD
                onPauseToggle={() => {
                    window.dispatchEvent(new KeyboardEvent("keydown", {key: " ", code: "Space"}));
                }}
                onRestart={() => setSeed((s) => s + 1)}
                tips="Click cards to match pairs • Try to remember positions"
            />
        </div>
    );
}
