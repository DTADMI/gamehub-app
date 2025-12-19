// frontend/app/games/page.tsx
"use client";

import React from "react";

import GamesList from "@/components/games/GamesList";
import {listGames} from "@/games/manifest";

export default function GamesPage() {
    // Map manifest entries into the legacy GamesList shape
    const entries = listGames();
    const games = entries.map((e) => ({
        id: e.slug,
        title: e.title,
        description: e.shortDescription,
        image: e.image,
        tags: e.tags,
        // GamesList currently treats `featured` as "playable now" (shows Play vs Coming Soon)
        featured: e.enabled !== false && !e.upcoming,
    }));

    return <GamesList games={games}/>;
}
