"use client";

import {useEffect, useMemo, useState} from "react";
import {useSession} from "next-auth/react";
import {useRouter} from "next/navigation";
import {fetchLeaderboard, type LeaderboardEntry} from "@/lib/graphql/queries";
import {useSubscription} from "@/contexts/SubscriptionContext";

const GAME_TYPES = [
    "SNAKE",
    "BUBBLE_POP",
    "TETRIS",
    "BREAKOUT",
    "KNITZY",
    "MEMORY",
    "CHECKERS",
    "CHESS",
    "PLATFORMER",
    "TOWER_DEFENSE",
] as const;

type GameType = typeof GAME_TYPES[number];

export default function LeaderboardPage() {
    const [gameType, setGameType] = useState<GameType>("SNAKE");
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { status, data } = useSession();
  const router = useRouter();
    const {entitlements} = useSubscription();

  useEffect(() => {
    if (status === "unauthenticated") {
      const target = encodeURIComponent("/leaderboard");
      router.push(`/login?callbackUrl=${target}`);
    }
  }, [status, router]);

  useEffect(() => {
      const run = async () => {
      try {
        setLoading(true);
          setError("");
          const res = await fetchLeaderboard({gameType, limit: 50});
          setEntries(res.leaderboard);
      } catch (err) {
        console.error(err);
          setError("Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    };
      if (status === "authenticated") run();
  }, [gameType, status]);

    const currentIdentifier = useMemo(
        () => (data?.user?.email || data?.user?.name || "").toLowerCase(),
        [data?.user?.email, data?.user?.name],
    );

  return (
    <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Leaderboard</h1>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
            <select
                className="border rounded-md px-3 py-2 bg-background"
                value={gameType}
                onChange={(e) => setGameType(e.target.value as GameType)}
            >
                {GAME_TYPES.map((gt) => (
                    <option key={gt} value={gt}>
                        {gt.replace(/_/g, " ")}
                    </option>
                ))}
            </select>

            {/* Scope/window chips (UI only for now; PREMIUM locks) */}
            <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-muted-foreground">Scope:</span>
                <button className="px-2 py-1 text-sm rounded bg-primary text-primary-foreground">Global</button>
                <button className="px-2 py-1 text-sm rounded bg-muted text-muted-foreground cursor-not-allowed"
                        title="Coming soon">Friends
                </button>
                <button className="px-2 py-1 text-sm rounded bg-muted text-muted-foreground cursor-not-allowed"
                        title="Coming soon">Personal
                </button>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Window:</span>
                <button className="px-2 py-1 text-sm rounded bg-primary text-primary-foreground">All‑time</button>
                {entitlements.advancedLeaderboards ? (
                    <>
                        <button className="px-2 py-1 text-sm rounded bg-muted" title="Coming soon">Weekly</button>
                        <button className="px-2 py-1 text-sm rounded bg-muted" title="Coming soon">Monthly</button>
                    </>
                ) : (
                    <>
                        <a href="/account/subscribe"
                           className="px-2 py-1 text-sm rounded bg-muted text-muted-foreground hover:text-foreground"
                           title="Subscriber only — Upgrade">
                            Weekly (Pro)
                        </a>
                        <a href="/account/subscribe"
                           className="px-2 py-1 text-sm rounded bg-muted text-muted-foreground hover:text-foreground"
                           title="Subscriber only — Upgrade">
                            Monthly (Pro)
                        </a>
                    </>
                )}
            </div>
        </div>

        {loading && <div className="text-center py-8">Loading leaderboard...</div>}
        {error && <div className="text-center py-8 text-red-500">{error}</div>}

        {!loading && !error && (
            <div className="bg-white dark:bg-gray-900 shadow overflow-hidden sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Rank</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Player</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Score</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Game</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {entries.map((row) => {
                        const isCurrent =
                            currentIdentifier && currentIdentifier === (row.user.username?.toLowerCase() || "");
                        return (
                            <tr key={`${row.gameType}-${row.rank}-${row.user.id}`}
                                className={isCurrent ? "bg-blue-50 dark:bg-blue-900/20" : ""}>
                                <td className="px-6 py-3 text-sm text-muted-foreground">{row.rank}</td>
                                <td className="px-6 py-3 text-sm font-medium">{row.user.username}</td>
                                <td className="px-6 py-3 text-sm">{row.score.toLocaleString()}</td>
                                <td className="px-6 py-3 text-sm capitalize">{row.gameType.replace(/_/g, " ")}</td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        )}
    </div>
  );
}
