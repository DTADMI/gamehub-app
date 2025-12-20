// games/manifest.ts
import dynamic from "next/dynamic";
import React from "react";

export type GameSlug = "breakout" | "memory" | "snake" | "knitzy" | "bubble-pop" | "checkers" | "chess";

export type GameEntry = {
    slug: GameSlug;
    title: string;
    shortDescription: string;
    tags: string[];
    image: string;
    upcoming?: boolean;
    enabled?: boolean;
    backgroundImage?: string;
    preloadAssets?: { key: string; url: string; loop?: boolean }[];
    getComponent: () => Promise<any>;
};

export type GameManifest = Record<GameSlug, GameEntry>;

export const games: GameManifest = {
    breakout: {
        slug: "breakout",
        title: "Breakout",
        shortDescription: "Break all the bricks and don’t let the ball fall!",
        tags: ["Arcade", "Canvas", "Particles"],
        image: "/images/bg-neon-grid.jpg",
        enabled: true,
        backgroundImage: "/images/bg-neon-grid.jpg",
        preloadAssets: [
            {key: "paddle", url: "/sounds/paddle.mp3"},
            {key: "brickHit", url: "/sounds/brick-hit.mp3"},
            {key: "brickBreak", url: "/sounds/brick-break.mp3"},
            {key: "wall", url: "/sounds/wall.mp3"},
            {key: "loseLife", url: "/sounds/lose-life.mp3"},
            {key: "gameOver", url: "/sounds/game-over.mp3"},
            {key: "levelComplete", url: "/sounds/level-complete.mp3"},
            {key: "powerUp", url: "/sounds/power-up.mp3"},
            {key: "background", url: "/sounds/breakout-bg.mp3", loop: true},
        ],
        getComponent: () => import("@games/breakout").then((m) => m.BreakoutGame),
    },
    memory: {
        slug: "memory",
        title: "Memory",
        shortDescription: "Flip cards and match all pairs in as few moves as possible.",
        tags: ["Casual", "Memory", "Puzzle"],
        image: "/images/bg-pastel-pattern.jpg",
        enabled: true,
        backgroundImage: "/images/bg-pastel-pattern.jpg",
        preloadAssets: [
            {key: "cardFlip", url: "/sounds/card-flip.mp3"},
            {key: "match", url: "/sounds/match.mp3"},
            {key: "win", url: "/sounds/win.mp3"},
            {key: "background", url: "/sounds/memory-bg.mp3", loop: true},
        ],
        getComponent: () => import("@games/memory").then((m) => m.MemoryGame),
    },
    snake: {
        slug: "snake",
        title: "Snake",
        shortDescription: "Eat food, grow longer, and avoid crashing.",
        tags: ["Arcade", "Grid", "Swipe"],
        image: "/images/bg-abstract-dark.jpg",
        enabled: true,
        backgroundImage: undefined,
        preloadAssets: [],
        getComponent: () => import("@games/snake").then((m) => m.SnakeGame),
    },
    "knitzy": {
        slug: "knitzy",
        title: "Knitzy",
        shortDescription: "Relaxing stitch puzzler — knit patterns and score combos.",
        tags: ["Puzzle", "Casual", "Mobile"],
        image: "/images/bg-pastel-pattern.jpg",
        enabled: true,
        backgroundImage: "/images/bg-pastel-pattern.jpg",
        preloadAssets: [
            {key: "click", url: "/sounds/click.mp3"},
            {key: "background", url: "/sounds/memory-bg.mp3", loop: true},
        ],
        getComponent: () => import("@games/knitzy").then((m) => m.KnitzyGame),
    },
    "bubble-pop": {
        slug: "bubble-pop",
        title: "Bubble Pop",
        shortDescription: "Aim, match and pop bubbles before the board fills!",
        tags: ["Arcade", "Match-3", "Casual"],
        image: "/images/bg-abstract-dark.jpg",
        enabled: true,
        backgroundImage: "/images/bg-abstract-dark.jpg",
        preloadAssets: [
            {key: "pop", url: "/sounds/brick-hit.mp3"},
            {key: "background", url: "/sounds/breakout-bg.mp3", loop: true},
        ],
        getComponent: () => import("@games/bubble-pop").then((m) => m.BubblePopGame),
    },
    "checkers": {
        slug: "checkers",
        title: "Checkers",
        shortDescription: "Classic draughts on an 8×8 board — local two player.",
        tags: ["Board", "Local 2P", "Strategy"],
        image: "/images/bg-abstract-dark.jpg",
        enabled: true,
        backgroundImage: "/images/bg-abstract-dark.jpg",
        preloadAssets: [],
        getComponent: () => import("@games/checkers").then((m) => m.CheckersGame),
    },
    "chess": {
        slug: "chess",
        title: "Chess",
        shortDescription: "Open‑source chessboard — local two player (MVP).",
        tags: ["Board", "Local 2P", "Strategy"],
        image: "/images/bg-abstract-dark.jpg",
        enabled: true,
        backgroundImage: "/images/bg-abstract-dark.jpg",
        preloadAssets: [],
        getComponent: () => import("@games/chess").then((m) => m.ChessGame),
    },
};

export function getGame(slug: string): GameEntry | undefined {
    return games[slug as GameSlug];
}

export function listGames(): GameEntry[] {
    return Object.values(games);
}

export function dynamicComponent(entry: GameEntry) {
    return dynamic(() => entry.getComponent().then((m) => (m.default ?? m)), {
        ssr: false,
        loading: () =>
            React.createElement(
                "div",
                {className: "min-h-[50vh] flex items-center justify-center"},
                React.createElement("div", {className: "text-xl"}, "Loading game...")
            ),
    });
}
