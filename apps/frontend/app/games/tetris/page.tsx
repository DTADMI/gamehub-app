"use client";

import dynamic from "next/dynamic";
import {useEffect, useState} from "react";

import {GameShell} from "@/components/games/GameShell";
import MiniBoard from "@/components/leaderboards/MiniBoard";
import {useAuth} from "@/contexts/AuthContext";
import {submitScore} from "@/lib/graphql/queries";

const TetrisGame = dynamic(
    () => import("@games/tetris").then((m) => m.TetrisGame),
    {
        ssr: false,
        loading: () => (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading game...</div>
            </div>
        ),
    },
);

export default function TetrisGamePage() {
    const [seed, setSeed] = useState(0);
    const {user} = useAuth();

    useEffect(() => {
        const handler = async (e: Event) => {
            const detail = (e as CustomEvent).detail as
                | { score?: number }
                | undefined;
            const score = detail?.score ?? 0;
            if (user && score > 0) {
                try {
                    await submitScore({
                        gameType: "TETRIS",
                        score,
                        metadata: {client: "web"},
                    });
                } catch (err) {
                    console.warn("submitScore failed (TETRIS)", err);
                }
            }
        };
        window.addEventListener("tetris:gameover", handler as EventListener);
        window.addEventListener("game:gameover", handler as EventListener);
        return () => {
            window.removeEventListener("tetris:gameover", handler as EventListener);
            window.removeEventListener("game:gameover", handler as EventListener);
        };
    }, [user]);

    return (
        <GameShell
            ariaLabel="Tetris game"
            tips="Arrows to move • Up to rotate • Space to drop/pause"
            onRestartAction={() => setSeed((s) => s + 1)}
            preloadSounds={[
                {key: "line", url: "/sounds/line.mp3"},
                {key: "move", url: "/sounds/move.mp3"},
                {key: "rotate", url: "/sounds/rotate.mp3"},
                {key: "drop", url: "/sounds/drop.mp3"},
                {key: "gameOver", url: "/sounds/game-over.mp3"},
                {key: "background", url: "/sounds/tetris-bg.mp3", loop: true},
            ]}
        >
            <TetrisGame key={seed}/>
            <div className="px-4">
                <MiniBoard gameType="TETRIS" limit={10}/>
            </div>
        </GameShell>
    );
}
