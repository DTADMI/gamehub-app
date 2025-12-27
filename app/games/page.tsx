// frontend/app/games/page.tsx
"use client";

import React from "react";

import GamesList from "@/components/games/GamesList";
import {useFlags} from "@/contexts/FlagsContext";
import {listGames} from "@/games/manifest";
import {getGameById} from "@/lib/games";

export default function GamesPage() {
  const {flags} = useFlags();
  // Map manifest entries into the GamesList shape, overriding image from lib/games.ts when available
  const entries = listGames();
  const isNonProd = typeof window !== "undefined" && (process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_E2E === "true");
  const enableUpcomingLocal =
      (typeof window !== "undefined" && process.env.NEXT_PUBLIC_ENABLE_UPCOMING_PLAY_LOCAL === "true" && isNonProd) ||
      !!flags.ui?.allowPlayUpcomingLocal;

  const games = entries.map((e) => {
    const lib = getGameById(e.slug);
    // Determine if an upcoming game should be playable in local/dev
    const devPlayable = Boolean(
        e.upcoming && e.enabled === false && enableUpcomingLocal
    );
    return {
      id: e.slug,
      title: e.title,
      description: e.shortDescription,
      image: lib?.image || e.image,
      tags: e.tags,
      // GamesList treats `featured` as "playable now"
      featured: (e.enabled !== false && !e.upcoming) || devPlayable,
      devPlayable,
    };
  });
  // Optionally expose Systems Discovery — Body Systems as a separate card via flags
  if (flags.sdBodEnabled) {
    games.push({
      id: "systems-discovery?pack=breath",
      title: "Systems Discovery — Body Systems",
      description: "Explore the Body Systems sub‑packs (Breath, Fuel, Move, Signal & Defend, Grow).",
      image: "https://picsum.photos/seed/systems-discovery-body/1280/1280",
      tags: ["Educational", "Packs", "Accessible"],
      featured: true,
    });
  }

  return <GamesList games={games}/>;
}
