// games/manifest.ts
// Note: Do not import next/dynamic in this file. This module is used by Server Components
// (e.g., Home page) to read the manifest, and importing next/dynamic with ssr:false here
// triggers a Next.js error. Dynamic loading should be handled in the client page that
// renders the game (e.g., app/games/[slug]/page.tsx).

export type GameSlug =
    | "breakout"
    | "memory"
    | "snake"
    | "pattern-matching"
    | "knitzy"
    | "bubble-pop"
    | "checkers"
    | "chess"
    // New point-and-click games (scaffolded as Upcoming)
    | "rite-of-discovery"
    | "systems-discovery"
    | "toymaker-escape"
    | "chrono-shift"
    | "elemental-conflux"
    | "quantum-architect";

export type GameEntry = {
    slug: GameSlug;
    title: string;
    shortDescription: string;
    tags: string[];
    image: string;
    upcoming?: boolean;
    visible?: boolean;
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
        image: "/breakout-game-with-paddle-and-colorful-bricks.jpg",
        enabled: true,
        visible: true,
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
        shortDescription:
            "Flip cards and match all pairs in as few moves as possible.",
        tags: ["Casual", "Memory", "Puzzle"],
        image: "/colorful-memory-cards-game-interface.jpg",
        enabled: true,
        visible: true,
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
        image: "/retro-snake-game-with-neon-colors.jpg",
        enabled: true,
        visible: true,
        backgroundImage: undefined,
        preloadAssets: [],
        getComponent: () => import("@games/snake").then((m) => m.SnakeGame),
    },
    "pattern-matching": {
        slug: "pattern-matching",
        title: "Pattern Matching",
        shortDescription:
            "Relaxing stitch puzzler — match the pattern and score combos.",
        tags: ["Puzzle", "Casual", "Mobile"],
        image: "https://picsum.photos/seed/pattern/1280/1280",
        enabled: true,
        visible: true,
        backgroundImage: "/images/bg-pastel-pattern.jpg",
        preloadAssets: [
            {key: "click", url: "/sounds/click.mp3"},
            {key: "background", url: "/sounds/memory-bg.mp3", loop: true},
        ],
        getComponent: () => import("@games/knitzy").then((m) => m.KnitzyGame),
    },
    knitzy: {
        slug: "knitzy",
        title: "Knitzy",
        shortDescription: "Cozy puzzler with rolling balls of wool (upcoming).",
        tags: ["Puzzle", "Casual"],
        image: "/colorful-knitting-wool-baskets.jpg",
        upcoming: true,
        enabled: false,
        visible: false,
        backgroundImage: "/images/bg-pastel-pattern.jpg",
        preloadAssets: [],
        // Placeholder component (not used while upcoming). Keeping import signature for future.
        getComponent: () => import("@games/knitzy").then((m) => m.KnitzyGame),
    },
    "bubble-pop": {
        slug: "bubble-pop",
        title: "Bubble Pop",
        shortDescription: "Aim, match and pop bubbles before the board fills!",
        tags: ["Arcade", "Match-3", "Casual"],
        image: "/soap-bubbles-colorful-nature.jpg",
        enabled: true,
        visible: true,
        backgroundImage: "/images/bg-abstract-dark.jpg",
        preloadAssets: [
            {key: "pop", url: "/sounds/brick-hit.mp3"},
            {key: "background", url: "/sounds/breakout-bg.mp3", loop: true},
        ],
        getComponent: () =>
            import("@games/bubble-pop").then((m) => m.BubblePopGame),
    },
    checkers: {
        slug: "checkers",
        title: "Checkers",
        shortDescription: "Classic draughts on an 8×8 board — local two player.",
        tags: ["Board", "Local 2P", "Strategy"],
        image: "/activity-checkers.jpg",
        enabled: true,
        visible: true,
        backgroundImage: "https://picsum.photos/seed/bg-checkers/1280/1280",
        preloadAssets: [],
        getComponent: () => import("@games/checkers").then((m) => m.CheckersGame),
    },
    chess: {
        slug: "chess",
        title: "Chess",
        shortDescription: "Open‑source chessboard — local two player (MVP).",
        tags: ["Board", "Local 2P", "Strategy"],
        image: "/king-chess-pieces.jpg",
        enabled: true,
        visible: true,
        backgroundImage: "https://picsum.photos/seed/bg-chess/1280/1280",
        preloadAssets: [],
        getComponent: () => import("@games/chess").then((m) => m.ChessGame),
    },
    "rite-of-discovery": {
        slug: "rite-of-discovery",
        title: "Rite of Discovery",
        shortDescription: "Gentle point‑and‑click about family‑made magic (Alpha MVP).",
        tags: ["Adventure", "Point & Click", "Story"],
        image: "https://picsum.photos/seed/rod/1280/1280",
        enabled: true,
        visible: true,
        backgroundImage: "/images/bg-pastel-pattern.jpg",
        preloadAssets: [],
        // Placeholder component (not used while upcoming)
        getComponent: () => import("@games/rite-of-discovery").then((m) => m.RiteOfDiscoveryGame),
    },
    "systems-discovery": {
        slug: "systems-discovery",
        title: "Systems Discovery",
        shortDescription: "Explore everyday systems with extendable packs (Alpha MVP).",
        tags: ["Adventure", "Point & Click", "Educational"],
        image: "https://picsum.photos/seed/systems-discovery/1280/1280",
        enabled: true,
        visible: true,
        backgroundImage: "https://picsum.photos/seed/bg-systems-discovery/1280/1280",
        preloadAssets: [],
        getComponent: () => import("@games/systems-discovery").then((m) => m.SystemsDiscoveryGame),
    },
    "toymaker-escape": {
        slug: "toymaker-escape",
        title: "Toymaker Escape",
        shortDescription: "Episodic escape game with a twisty mystery (Alpha MVP).",
        tags: ["Escape", "Puzzles", "Story"],
        image: "/patience-games-toys.jpg",
        enabled: true,
        visible: true,
        backgroundImage: "https://picsum.photos/seed/bg-escape-game/1280/1280",
        preloadAssets: [],
        getComponent: () => import("@games/toymaker-escape").then((m) => m.ToymakerEscapeGame),
    },
    "chrono-shift": {
        slug: "chrono-shift",
        title: "ChronoShift Labyrinth",
        shortDescription: "Manipulate time and space to navigate shifting environments.",
        tags: ["Puzzle", "Time", "Upcoming"],
        image: "https://picsum.photos/seed/chrono/1280/1280",
        upcoming: true,
        enabled: false,
        visible: false,
        getComponent: () => import("@games/chrono-shift").then((m) => m.game),
    },
    "elemental-conflux": {
        slug: "elemental-conflux",
        title: "Elemental Conflux",
        shortDescription: "Control multiple characters with complementary elemental abilities.",
        tags: ["Puzzle", "Elements", "Upcoming"],
        image: "https://picsum.photos/seed/elemental/1280/1280",
        upcoming: true,
        enabled: false,
        visible: false,
        getComponent: () => import("@games/elemental-conflux").then((m) => m.game),
    },
    "quantum-architect": {
        slug: "quantum-architect",
        title: "Quantum Architect",
        shortDescription: "Manipulate quantum states to create/destroy matter.",
        tags: ["Puzzle", "Quantum", "Upcoming"],
        image: "https://picsum.photos/seed/quantum/1280/1280",
        upcoming: true,
        enabled: false,
        visible: false,
        getComponent: () => import("@games/quantum-architect").then((m) => m.game),
    },
};

export function getGame(slug: string): GameEntry | undefined {
    return games[slug as GameSlug];
}

export function listGames(): GameEntry[] {
    return Object.values(games);
}

// Client pages should handle dynamic import using entry.getComponent().
