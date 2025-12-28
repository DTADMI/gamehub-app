"use client";

import React, {useEffect, useState} from "react";

interface LocalLeaderboardProps {
    gameSlug: string;
    localStorageKey?: string; // fallback/legacy key
}

type LeaderboardEntry = {
    nickname: string;
    score: number;
    date: number;
};

export default function LocalLeaderboard({gameSlug, localStorageKey}: LocalLeaderboardProps) {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

    const key = `gh:leaderboard:${gameSlug}:v1`;

    useEffect(() => {
        const load = () => {
            let raw = localStorage.getItem(key);
            if (!raw && localStorageKey) {
                // Try legacy key
                const legacyRaw = localStorage.getItem(localStorageKey);
                if (legacyRaw) {
                    try {
                        const legacy = JSON.parse(legacyRaw);
                        if (Array.isArray(legacy)) {
                            // Convert legacy scores to entries
                            const converted = legacy.map((s: any) => ({
                                nickname: "anonymous",
                                score: typeof s === 'number' ? s : (s.score || 0),
                                date: Date.now()
                            }));
                            localStorage.setItem(key, JSON.stringify(converted));
                            raw = JSON.stringify(converted);
                        }
                    } catch {
                    }
                }
            }

            if (raw) {
                try {
                    const parsed = JSON.parse(raw);
                    setEntries(Array.isArray(parsed) ? parsed : []);
                } catch {
                    setEntries([]);
                }
            }
        };

        load();
        window.addEventListener(`gh:leaderboard:${gameSlug}:updated`, load);
        return () => window.removeEventListener(`gh:leaderboard:${gameSlug}:updated`, load);
    }, [gameSlug, key, localStorageKey]);

    if (entries.length === 0) {
        return null;
    }

    return (
        <div
            className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white/70 dark:bg-gray-800/70 shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-lg">Local Leaderboard</h3>
                <span
                    className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-semibold">Local only</span>
            </div>
            <div className="flex flex-col gap-1">
                {entries.slice(0, 10).map((entry, i) => (
                    <div key={i}
                         className="flex items-center justify-between text-sm py-1 border-b border-gray-100 dark:border-gray-700 last:border-0">
                        <div className="flex items-center gap-2">
                            <span className="text-muted-foreground w-4">{i + 1}.</span>
                            <span className="font-medium">{entry.nickname}</span>
                        </div>
                        <span className="font-mono font-bold">{entry.score}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

/**
 * Helper to submit a local score
 */
export function submitLocalScore(gameSlug: string, nickname: string, score: number) {
    const key = `gh:leaderboard:${gameSlug}:v1`;
    try {
        const raw = localStorage.getItem(key);
        let entries: LeaderboardEntry[] = raw ? JSON.parse(raw) : [];
        entries.push({nickname, score, date: Date.now()});
        entries.sort((a, b) => b.score - a.score);
        entries = entries.slice(0, 50); // Keep top 50
        localStorage.setItem(key, JSON.stringify(entries));
        window.dispatchEvent(new CustomEvent(`gh:leaderboard:${gameSlug}:updated`));
    } catch (e) {
        console.error("Failed to submit score", e);
    }
}
