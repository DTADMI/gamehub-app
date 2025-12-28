"use client";

import React from "react";

import {useProfile} from "@/contexts/ProfileContext";

interface StatsPanelProps {
    gameSlug: string;
}

export default function StatsPanel({gameSlug}: StatsPanelProps) {
    const {stats} = useProfile();
    const gameStat = stats[gameSlug];

    if (!gameStat) {
        return null;
    }

    return (
        <div
            className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white/70 dark:bg-gray-800/70 shadow-sm">
            <h3 className="font-bold text-lg mb-3">Your Stats</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex flex-col">
                    <span className="text-muted-foreground">High Score</span>
                    <span className="font-mono text-xl">{gameStat.highScore ?? 0}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-muted-foreground">Last Score</span>
                    <span className="font-mono text-xl">{gameStat.lastScore ?? 0}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-muted-foreground">Sessions</span>
                    <span className="font-mono text-xl">{gameStat.sessions ?? 0}</span>
                </div>
                {gameStat.bestTimeMs !== undefined && (
                    <div className="flex flex-col">
                        <span className="text-muted-foreground">Best Time</span>
                        <span className="font-mono text-xl">{(gameStat.bestTimeMs / 1000).toFixed(2)}s</span>
                    </div>
                )}
            </div>
        </div>
    );
}
