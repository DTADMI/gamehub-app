"use client";

import dynamic from "next/dynamic";
import {notFound} from "next/navigation";
import React from "react";

import {GameShell} from "@/components/games/GameShell";
import MiniBoard from "@/components/leaderboards/MiniBoard";
import {getGame} from "@/games/manifest";

type PageProps = { params: { slug: string } };

export default function GameLauncherPage({params}: PageProps) {
    const entry = getGame(params.slug);
    if (!entry) {
        return notFound();
    }
    // Allow dev/local play for upcoming when explicitly enabled via env or Admin seam
    const isNonProd = typeof window !== "undefined" && (process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_E2E === "true");
    const allowUpcomingLocal =
        typeof window !== "undefined" && process.env.NEXT_PUBLIC_ENABLE_UPCOMING_PLAY_LOCAL === "true" && isNonProd;

    if (entry.upcoming && !allowUpcomingLocal) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-2">{entry.title}</h1>
                <p className="text-muted-foreground mb-4">{entry.shortDescription}</p>
                <div className="rounded-md border p-4 bg-amber-50 dark:bg-amber-900/20">
                    This game is marked as <b>Coming Soon</b>.
                </div>
            </div>
        );
    }
    if (entry.enabled === false) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-2">{entry.title}</h1>
                <p className="text-muted-foreground mb-4">{entry.shortDescription}</p>
                <div className="rounded-md border p-4 bg-gray-50 dark:bg-gray-800">
                    This game is currently <b>disabled by admin</b>.
                </div>
            </div>
        );
    }

    const Game = dynamic(() => entry.getComponent().then((m) => m.default ?? m), {
        ssr: false,
        loading: () => (
            <div className="min-h-[50vh] flex items-center justify-center">
                <div className="text-xl">Loading game...</div>
            </div>
        ),
    });

    return (
        <GameShell
            ariaLabel={`${entry.title} game`}
            tips={undefined}
            preloadSounds={entry.preloadAssets}
        >
            <Game/>
            {/* Optional mini leaderboard when known */}
            {entry.slug === "breakout" ? (
                <div className="px-4">
                    <MiniBoard gameType="BREAKOUT" limit={10}/>
                </div>
            ) : null}
        </GameShell>
    );
}
