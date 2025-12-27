"use client";

import dynamic from "next/dynamic";
import {useEffect, useState} from "react";

import {GameShell} from "@/components/games/GameShell";
import LocalLeaderboard, {submitLocalScore} from "@/components/games/LocalLeaderboard";
import StatsPanel from "@/components/games/StatsPanel";
import MiniBoard from "@/components/leaderboards/MiniBoard";
import {PresenceBadge} from "@/components/PresenceBadge";
import {useAuth} from "@/contexts/AuthContext";
import {useProfile} from "@/contexts/ProfileContext";
import {useFeature} from "@/lib/flags";
import {submitScore} from "@/lib/graphql/queries";
import {useStomp} from "@/lib/realtime/useStomp";

const SnakeGame = dynamic(
    () => import("@games/snake").then((m) => m.SnakeGame),
    {
        ssr: false,
        loading: () => (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading game...</div>
            </div>
        ),
    },
);

const SnakeGame3D = SnakeGame;

function DifficultySelector() {
    const [difficulty, setDifficulty] = useState<"easy" | "normal" | "hard">(
        () => {
            if (typeof window === "undefined") {
                return "normal";
            }
            return (
                (localStorage.getItem("snakeDifficulty") as
                    | "easy"
                    | "normal"
                    | "hard"
                    | null) ?? "normal"
            );
        },
    );

  useEffect(() => {
      window.dispatchEvent(
          new CustomEvent("snake:setDifficulty", {detail: {difficulty}}),
      );
  }, [difficulty]);

  return (
    <div className="flex items-center justify-center gap-2 mb-4">
      {(["easy", "normal", "hard"] as const).map((d) => (
        <button
          key={d}
          onClick={() => setDifficulty(d)}
          className={`px-3 py-1 rounded-md text-sm ${
            difficulty === d
              ? "bg-primary text-primary-foreground"
              : "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100"
          }`}
          aria-pressed={difficulty === d}
        >
          {d[0].toUpperCase() + d.slice(1)}
        </button>
      ))}
    </div>
  );
}

// Local SoundControls were moved to a global widget in the app shell.

export default function SnakeGamePage() {
    const {profile, updateStat} = useProfile();
    const realtimeEnabled = useFeature("realtime_enabled", true, {
        preferBackend: true,
    });
    const threeDEnabled = useFeature("snake_3d_mode", false, {
        preferBackend: true,
    });
    const [use3D, setUse3D] = useState(
      () =>
        typeof window !== "undefined" && localStorage.getItem("snake:3d") === "1",
    );
    const {publish, connected} = useStomp({enabled: realtimeEnabled});
    const {user} = useAuth();

    useEffect(() => {
        // When the game ends, publish the score (WS if enabled) and submit to backend if signed in
        const onGameOver = async (e: Event) => {
            const detail = (e as CustomEvent).detail as
              | { score?: number }
              | undefined;
            const score = detail?.score ?? 0;

            // Local stats update
            updateStat("snake", {
                lastScore: score,
                sessions: 1,
            });
            submitLocalScore("snake", profile.nickname, score);

            const env = {
                type: "score",
                room: {id: "snake:global", game: "snake", visibility: "public"},
                user: {id: undefined, role: "guest", nickname: profile.nickname, subscription: "free"},
                payload: {value: score},
            };
            try {
                if (realtimeEnabled) {
                    publish("/app/snake/score", env);
                }
            } catch {
            }

            // Auth-only leaderboards: submit score to backend GraphQL when user is signed in
            try {
                if (user && score > 0) {
                    await submitScore({
                        gameType: "SNAKE",
                        score,
                        metadata: {
                            difficulty: (
                              localStorage.getItem("snakeDifficulty") || "normal"
                            ).toString(),
                            client: "web",
                            version: process.env.NEXT_PUBLIC_APP_VERSION || "0.1.0",
                        },
                    });
                    // Optionally trigger a UI refresh elsewhere
                    window.dispatchEvent(new Event("snake:leaderboardUpdated"));
                }
            } catch (err) {
                // Non-blocking: log and proceed
                console.warn("submitScore failed:", err);
            }
        };
        window.addEventListener("snake:gameover", onGameOver as EventListener);

        return () => {
            window.removeEventListener("snake:gameover", onGameOver as EventListener);
        };
    }, [publish, realtimeEnabled, user, profile.nickname, updateStat]);

    return (
      <GameShell
        ariaLabel="Snake game"
        tips="Arrows to move • Space to pause/resume • Space after Game Over to restart"
        preloadSounds={[
            {key: "eat", url: "/sounds/eat.mp3"},
            {key: "gameOver", url: "/sounds/game-over.mp3"},
            {key: "background", url: "/sounds/snake-bg.mp3", loop: true},
        ]}
      >
          <div className="pt-4">
              <DifficultySelector/>
          </div>
          <div className="flex items-center justify-between px-4">
              {realtimeEnabled ? (
                <PresenceBadge game="snake"/>
              ) : (
                <span className="text-xs text-amber-700">
            Realtime disabled — using snapshot
          </span>
              )}
              {realtimeEnabled && connected && (
                <span className="text-xs text-gray-500">Realtime on</span>
              )}
          </div>
          {threeDEnabled && (
            <div className="flex items-center justify-center mb-3">
                <button
                  onClick={() => {
                      const n = !use3D;
                      setUse3D(n);
                      try {
                          localStorage.setItem("snake:3d", n ? "1" : "0");
                      } catch {
                      }
                  }}
                  className={`px-3 py-1 rounded-md text-sm ${use3D ? "bg-primary text-primary-foreground" : "bg-gray-200 dark:bg-gray-700 dark:text-gray-100"}`}
                >
                    {use3D ? "3D Mode On" : "Enable 3D Mode"}
                </button>
            </div>
          )}
          {use3D && threeDEnabled ? <SnakeGame3D/> : <SnakeGame/>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 px-4 pb-8 text-foreground">
              <StatsPanel gameSlug="snake"/>
              <div className="flex flex-col gap-4">
                  <LocalLeaderboard gameSlug="snake" localStorageKey="snakeLeaderboard"/>
                  <MiniBoard gameType="SNAKE" limit={10}/>
              </div>
          </div>
      </GameShell>
    );
}
