"use client";

import dynamic from "next/dynamic";
import {useEffect, useRef} from "react";
import {enableGameKeyCapture} from "@games/shared";

const BubblePopGame = dynamic(() => import("@games/bubble-pop").then((m) => m.BubblePopGame), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-xl">Loading game...</div>
    </div>
  ),
});

export default function BubblePopPage() {
    const rootRef = useRef<HTMLDivElement | null>(null);

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
            aria-label="Bubble Pop game"
        >
            <BubblePopGame/>
        </div>
    );
}
