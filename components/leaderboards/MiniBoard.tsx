"use client";

import React, {useEffect, useMemo, useState} from "react";

import {useAuth} from "@/contexts/AuthContext";
import {fetchLeaderboard, type GameType, type LeaderboardEntry} from "@/lib/graphql/queries";

type MiniBoardProps = {
    gameType: GameType;
    limit?: number;
    className?: string;
};

function Row({row, highlight}: { row: LeaderboardEntry; highlight: boolean }) {
    return (
        <div
            className={`flex items-center justify-between py-1.5 text-sm ${highlight ? "bg-blue-50 dark:bg-blue-900/20 rounded-md px-2" : ""}`}
        >
            <div className="w-8 shrink-0 text-muted-foreground">{row.rank}</div>
            <div className="flex-1 truncate pr-2 font-medium">{row.user.username}</div>
            <div className="w-20 text-right tabular-nums">{row.score.toLocaleString()}</div>
        </div>
    );
}

export default function MiniBoard({gameType, limit = 10, className}: MiniBoardProps) {
    const {user} = useAuth();
    const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null);
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        let cancelled = false;

        async function run() {
            if (!user) {
                setEntries(null);
                setLoading(false);
                return;
            }
            setLoading(true);
            setError("");
            try {
                const res = await fetchLeaderboard({gameType, limit});
                if (!cancelled) {
                    setEntries(res.leaderboard);
                }
            } catch (e) {
                console.warn("MiniBoard fetch error", e);
                if (!cancelled) {
                    setError("Failed to load leaderboard");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        run();
        return () => {
            cancelled = true;
        };
    }, [user, gameType, limit]);

    const currentIdentifier = useMemo(() => {
        // We only have Firebase user here; use email or uid to try to match username if same.
        return (user?.email || user?.displayName || user?.uid || "").toLowerCase();
    }, [user?.email, user?.displayName, user?.uid]);

    if (!user) {
        return (
            <div
                className="mt-4 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-4 text-center text-sm text-muted-foreground">
                Sign in to view leaderboards and compete with others.
            </div>
        );
    }

    return (
        <div
            className={`mt-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/60 p-4 ${className ?? ""}`}>
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold">Top {limit} — {gameType.replace(/_/g, " ")}</h3>
                {loading && <span className="text-xs text-muted-foreground">Loading…</span>}
            </div>
            {error && (
                <div className="text-sm text-red-500">{error}</div>
            )}
            {!loading && !error && (!entries || entries.length === 0) && (
                <div className="text-sm text-muted-foreground">No scores yet — be the first to play!</div>
            )}
            {!loading && !error && entries && entries.length > 0 && (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {entries.map((row) => {
                        const highlight = currentIdentifier && currentIdentifier === (row.user.username?.toLowerCase() || "");
                        return <Row key={`${row.gameType}-${row.rank}-${row.user.id}`} row={row}
                                    highlight={!!highlight}/>;
                    })}
                </div>
            )}
        </div>
    );
}
