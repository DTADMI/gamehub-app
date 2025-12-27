"use client";

import {GameShell} from "@games/shared";
import dynamic from "next/dynamic";
import {useEffect, useState} from "react";

import LocalLeaderboard, {submitLocalScore} from "@/components/games/LocalLeaderboard";
import StatsPanel from "@/components/games/StatsPanel";
import MiniBoard from "@/components/leaderboards/MiniBoard";
import {useProfile} from "@/contexts/ProfileContext";

const MemoryGame = dynamic(
    () => import("@games/memory").then((m) => m.MemoryGame),
    {
        ssr: false,
        loading: () => (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading game...</div>
            </div>
        ),
    },
);

export default function MemoryGamePage() {
    const {profile, updateStat} = useProfile();
    const [seed, setSeed] = useState(0);

    useEffect(() => {
        const handler = (e: Event) => {
            const detail = (e as CustomEvent).detail as
                | { score?: number }
                | undefined;
            const score = detail?.score ?? 0;

            updateStat("memory", {
                lastScore: score,
                sessions: 1,
            });
            submitLocalScore("memory", profile.nickname, score);
        };
        window.addEventListener("memory:gameover", handler as EventListener);
        return () => window.removeEventListener("memory:gameover", handler as EventListener);
    }, [profile.nickname, updateStat]);

    return (
        <GameShell
            ariaLabel="Memory game"
            tips="Click cards to match pairs • Try to remember positions"
            onRestartAction={() => {
                setSeed((s) => s + 1);
            }}
            preloadSounds={[
                {key: "card-flip", url: "/sounds/card-flip.mp3"},
                {key: "match", url: "/sounds/match.mp3"},
                {key: "win", url: "/sounds/win.mp3"},
                {key: "background", url: "/sounds/memory-bg.mp3", loop: true},
            ]}
        >
            <MemoryGame key={seed}/>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 px-4 pb-8 text-foreground">
                <StatsPanel gameSlug="memory"/>
                <div className="flex flex-col gap-4">
                    <LocalLeaderboard gameSlug="memory"/>
                    <MiniBoard gameType="MEMORY" limit={10}/>
                </div>
            </div>
        </GameShell>
    );
}
