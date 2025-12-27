"use client";

import dynamic from "next/dynamic";
import {useEffect, useState} from "react";

import {GameShell} from "@/components/games/GameShell";
import LocalLeaderboard, {submitLocalScore} from "@/components/games/LocalLeaderboard";
import StatsPanel from "@/components/games/StatsPanel";
import MiniBoard from "@/components/leaderboards/MiniBoard";
import {useAuth} from "@/contexts/AuthContext";
import {useProfile} from "@/contexts/ProfileContext";
import {submitScore} from "@/lib/graphql/queries";

const BreakoutGame = dynamic(
    () => import("@games/breakout").then((m) => m.BreakoutGame),
    {
        ssr: false,
        loading: () => (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading game...</div>
            </div>
        ),
    },
);

export default function BreakoutGamePage() {
    const {profile, updateStat} = useProfile();
    const [seed, setSeed] = useState(0);
    const {user} = useAuth();

    useEffect(() => {
        const handler = async (e: Event) => {
            const detail = (e as CustomEvent).detail as
                | { score?: number }
                | undefined;
            const score = detail?.score ?? 0;

            // Local stats update
            updateStat("breakout", {
                lastScore: score,
                sessions: 1,
            });
            submitLocalScore("breakout", profile.nickname, score);

            if (user && score > 0) {
                try {
                    await submitScore({
                        gameType: "BREAKOUT",
                        score,
                        metadata: {client: "web"},
                    });
                } catch (err) {
                    console.warn("submitScore failed (BREAKOUT)", err);
                }
            }
        };
        window.addEventListener("breakout:gameover", handler as EventListener);
        window.addEventListener("game:gameover", handler as EventListener);
        return () => {
            window.removeEventListener("breakout:gameover", handler as EventListener);
            window.removeEventListener("game:gameover", handler as EventListener);
        };
    }, [user, profile.nickname, updateStat]);

    return (
        <GameShell
            ariaLabel="Breakout game"
            tips="Move with mouse or arrows • Space to pause/resume"
            onRestartAction={() => {
                setSeed((s) => s + 1);
            }}
            preloadSounds={[
                {key: "paddle", url: "/sounds/paddle.mp3"},
                {key: "brickHit", url: "/sounds/brick-hit.mp3"},
                {key: "brickBreak", url: "/sounds/brick-break.mp3"},
                {key: "wall", url: "/sounds/wall.mp3"},
                {key: "loseLife", url: "/sounds/lose-life.mp3"},
                {key: "gameOver", url: "/sounds/game-over.mp3"},
                {key: "levelComplete", url: "/sounds/level-complete.mp3"},
                {key: "powerUp", url: "/sounds/power-up.mp3"},
                {key: "background", url: "/sounds/breakout-bg.mp3", loop: true},
            ]}
        >
            <BreakoutGame key={seed}/>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 px-4 pb-8 text-foreground">
                <StatsPanel gameSlug="breakout"/>
                <div className="flex flex-col gap-4">
                    <LocalLeaderboard gameSlug="breakout"/>
                    <MiniBoard gameType="BREAKOUT" limit={10}/>
                </div>
            </div>
        </GameShell>
    );
}
