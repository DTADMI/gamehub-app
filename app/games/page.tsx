// frontend/app/games/page.tsx
"use client";

import React from "react";

import GamesList from "@/components/games/GamesList";
import {listGames} from "@/games/manifest";
import {getGameById} from "@/lib/games";

export default function GamesPage() {
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

  return <GamesList games={games}/>;
}
