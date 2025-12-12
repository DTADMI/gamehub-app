// frontend/app/games/page.tsx
"use client";

import dynamic from "next/dynamic";
import {type Game as CatalogGame, GAMES} from "@/lib/games";

// Dynamically import the GamesList component with SSR disabled
const GamesList = dynamic<{ games: CatalogGame[] }>(() => import("@/components/games/GamesList"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-300">Loading games...</p>
      </div>
    </div>
  ),
});

export default function GamesPage() {
  return <GamesList games={GAMES} />;
}
