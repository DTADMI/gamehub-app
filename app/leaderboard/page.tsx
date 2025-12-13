"use client";

import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {useSession} from "next-auth/react";
import {useEffect, useMemo, useState} from "react";

import {useSubscription} from "@/contexts/SubscriptionContext";
import {
  fetchLeaderboardPaged,
  type GameType,
  type LeaderboardEntry,
  type LeaderboardScope,
  type TimeWindow,
} from "@/lib/graphql/queries";

const GAME_TYPES: GameType[] = [
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
];

const SCOPES: LeaderboardScope[] = ["GLOBAL", "FRIENDS", "PERSONAL"];
const WINDOWS: TimeWindow[] = ["ALL_TIME", "YEAR", "MONTH", "WEEK", "DAY"];

export default function LeaderboardPage() {
  const search = useSearchParams();
  const pathname = usePathname();
  const routerNav = useRouter();
  const {status, data} = useSession();
  const {entitlements} = useSubscription();

  const [gameType, setGameType] = useState<GameType>((search.get("game") as GameType) || "SNAKE");
  const [scope, setScope] = useState<LeaderboardScope>((search.get("scope") as LeaderboardScope) || "GLOBAL");
  const [window_, setWindow] = useState<TimeWindow>((search.get("window") as TimeWindow) || "ALL_TIME");

  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Update URL query params when controls change
  useEffect(() => {
    const params = new URLSearchParams(search?.toString() || "");
    params.set("game", gameType);
    params.set("scope", scope);
    params.set("window", window_);
    routerNav.replace(`${pathname}?${params.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameType, scope, window_]);

  // Protect route: require auth
  const router = useRouter();
  useEffect(() => {
    if (status === "unauthenticated") {
      const target = encodeURIComponent("/leaderboard");
      router.push(`/login?callbackUrl=${target}`);
    }
  }, [status, router]);

  async function loadPage(opts: { reset?: boolean } = {}) {
    try {
      setLoading(true);
      setError("");
      const variables = {
        gameType,
        scope,
        window: window_,
        first: 25,
        after: opts.reset ? null : cursor,
      } as const;

      // Premium gating on client: FRIENDS and non-ALL_TIME windows require advancedLeaderboards
      const isPremiumRequired = (scope !== "GLOBAL") || (window_ !== "ALL_TIME");
      if (isPremiumRequired && !entitlements.advancedLeaderboards) {
        setError("This leaderboard is available to Pro subscribers.");
        setEntries([]);
        setHasNext(false);
        setCursor(null);
        return;
      }

      const res = await fetchLeaderboardPaged(variables);
      const newEntries = res.leaderboard.edges.map(e => e.node);
      const end = res.leaderboard.pageInfo.endCursor || null;
      setHasNext(res.leaderboard.pageInfo.hasNextPage);
      setCursor(end);
      setEntries((prev) => (opts.reset ? newEntries : [...prev, ...newEntries]));
    } catch (err) {
      console.error(err);
      setError("Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  }

  // Initial load and when filters change
  useEffect(() => {
    if (status === "authenticated") {
      loadPage({reset: true});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameType, scope, window_, status]);

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

        {/* Scope chips */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-sm text-muted-foreground">Scope:</span>
          {SCOPES.map((s) => {
            const disabled = (s !== "GLOBAL") && !entitlements.advancedLeaderboards;
            return (
                <button
                    key={s}
                    className={`px-2 py-1 text-sm rounded ${scope === s ? "bg-primary text-primary-foreground" : "bg-muted text-foreground/80"} ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
                    title={disabled ? "Pro required" : s}
                    onClick={() => !disabled && setScope(s)}
                    disabled={disabled}
                >
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </button>
            );
          })}
        </div>

        {/* Window chips */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Window:</span>
          {WINDOWS.map((w) => {
            const disabled = (w !== "ALL_TIME") && !entitlements.advancedLeaderboards;
            const label = w.replace(/_/g, " ").toLowerCase().replace(/^./, (c) => c.toUpperCase());
            return (
                <button
                    key={w}
                    className={`px-2 py-1 text-sm rounded ${window_ === w ? "bg-primary text-primary-foreground" : "bg-muted text-foreground/80"} ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
                    title={disabled ? "Pro required" : label}
                    onClick={() => !disabled && setWindow(w)}
                    disabled={disabled}
                >
                  {label}
                </button>
            );
          })}
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

            {/* Pagination */}
            {hasNext && (
                <div className="p-4 flex justify-center">
                  <button
                      onClick={() => loadPage()}
                      className="px-4 py-2 rounded bg-primary text-primary-foreground"
                  >
                    Load more
                  </button>
                </div>
            )}
          </div>
      )}
    </div>
  );
}
