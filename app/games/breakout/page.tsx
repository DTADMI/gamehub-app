"use client";

import dynamic from "next/dynamic";
import {useEffect, useRef, useState} from "react";
import {enableGameKeyCapture, GameHUD, soundManager} from "@games/shared";

const BreakoutGame = dynamic(() => import("@games/breakout").then((m) => m.BreakoutGame), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-xl">Loading game...</div>
    </div>
  ),
});

export default function BreakoutGamePage() {
    const rootRef = useRef<HTMLDivElement | null>(null);
    const [seed, setSeed] = useState(0);

  useEffect(() => {
      const el = rootRef.current;
      el?.focus();
      const cleanupCapture = enableGameKeyCapture({rootEl: el ?? undefined});

    const preloadSounds = async () => {
      try {
        //await Promise.all([
        soundManager.preloadSound("paddle", "/sounds/paddle.mp3");
        soundManager.preloadSound("brickHit", "/sounds/brick-hit.mp3");
        soundManager.preloadSound("brickBreak", "/sounds/brick-break.mp3");
        soundManager.preloadSound("wall", "/sounds/wall.mp3");
        soundManager.preloadSound("loseLife", "/sounds/lose-life.mp3");
        soundManager.preloadSound("gameOver", "/sounds/game-over.mp3");
        soundManager.preloadSound("levelComplete", "/sounds/level-complete.mp3");
        soundManager.preloadSound("powerUp", "/sounds/power-up.mp3");
        soundManager.preloadSound("background", "/sounds/breakout-bg.mp3", true);
        //]);
      } catch (error) {
        console.warn("Error preloading sounds:", error);
      }
    };

    preloadSounds();

    return () => {
      soundManager.stopMusic();
        cleanupCapture();
    };
  }, []);

    return (
        <div
            ref={rootRef}
            className="relative min-h-[80vh] outline-none focus:outline-none"
            tabIndex={0}
            role="application"
            aria-label="Breakout game"
        >
            <BreakoutGame key={seed}/>
            <GameHUD
                onPauseToggle={() => {
                    window.dispatchEvent(new KeyboardEvent("keydown", {key: " ", code: "Space"}));
                }}
                onRestart={() => setSeed((s) => s + 1)}
                tips="Move with mouse or arrows • Space to pause/resume"
            />
        </div>
    );
}
