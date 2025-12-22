// frontend/app/games/page.tsx
"use client";

import React from "react";

import GamesList from "@/components/games/GamesList";
import {listGames} from "@/games/manifest";
import {getGameById} from "@/lib/games";
import {useFlags} from "@/contexts/FlagsContext";

export default function GamesPage() {
  const {flags} = useFlags();
  // Map manifest entries into the GamesList shape, overriding image from lib/games.ts when available
  const entries = listGames();
  const games = entries.map((e) => {
    const lib = getGameById(e.slug);
    return {
      id: e.slug,
      title: e.title,
      description: e.shortDescription,
      image: lib?.image || e.image,
      tags: e.tags,
      // GamesList treats `featured` as "playable now"
      featured: e.enabled !== false && !e.upcoming,
    };
  });
  // Optionally expose Systems Discovery — Body Systems as a separate card via flags
  if (flags.sdBodEnabled) {
    games.push({
      id: "systems-discovery?pack=breath",
      title: "Systems Discovery — Body Systems",
      description: "Explore the Body Systems sub‑packs (Breath, Fuel, Move, Signal & Defend, Grow).",
      image: "/images/bg-abstract-dark.jpg",
      tags: ["Educational", "Packs", "Accessible"],
      featured: true,
    });
  }

  return <GamesList games={games}/>;
}
