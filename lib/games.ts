// frontend/lib/games.ts
export interface Game {
  id: string; // slug and route segment, e.g. "snake"
  title: string;
  description: string;
  image: string; // path under /public
  tags: string[];
  featured?: boolean;
  route: string; // full route, e.g. "/games/snake"
  component?: string; // optional component name in its package
}

export function getGameById(id: string): Game | undefined {
  return GAMES.find((game) => game.id === id);
}

export const GAMES: Game[] = [
  // Arcade / Classics
  {
    id: "snake",
    title: "Snake Game",
    description: "Classic snake with smooth controls and modern polish.",
    image: "/retro-snake-game-with-neon-colors.jpg",
    tags: ["Classic", "Arcade"],
    featured: true,
    route: "/games/snake",
    component: "SnakeGame",
  },
  {
    id: "breakout",
    title: "Breakout",
    description: "Break all the bricks and catch power‑ups.",
    image: "/breakout-game-with-paddle-and-colorful-bricks.jpg",
    tags: ["Arcade", "Action"],
    featured: true,
    route: "/games/breakout",
    component: "BreakoutGame",
  },
  {
    id: "tetris",
    title: "Tetris",
    description: "Classic tile‑matching puzzle game.",
    image: "/colorful-tetris-blocks-falling.jpg",
    tags: ["Puzzle", "Arcade"],
    featured: false,
    route: "/games/tetris",
    component: "TetrisGame",
  },

  // Puzzles & Casual
  {
    id: "memory",
    title: "Memory Card Game",
    description: "Match pairs and train your memory.",
    image: "/colorful-memory-cards-game-interface.jpg",
    tags: ["Puzzle", "Memory"],
    featured: true,
    route: "/games/memory",
    component: "MemoryGame",
  },
  {
    id: "bubble-pop",
    title: "Bubble Pop",
    description: "Pop matching bubbles for points.",
    image: "/placeholder.svg",
    tags: ["Casual", "Arcade"],
    featured: false,
    route: "/games/bubble-pop",
    component: "BubblePopGame",
  },
  {
    id: "block-blast",
    title: "Block‑Blast",
    description: "Place pieces to clear rows and columns.",
    image: "/placeholder.svg",
    tags: ["Puzzle", "Strategy"],
    featured: false,
    route: "/games/block-blast",
  },

  // Board games
  {
    id: "checkers",
    title: "Checkers",
    description: "Classic head‑to‑head strategy.",
    image: "/placeholder.svg",
    tags: ["Board", "Strategy"],
    featured: false,
    route: "/games/checkers",
    component: "CheckersGame",
  },
  {
    id: "chess",
    title: "Chess",
    description: "Timeless strategy classic.",
    image: "/placeholder.svg",
    tags: ["Board", "Strategy"],
    featured: false,
    route: "/games/chess",
    component: "ChessGame",
  },

  // Originals / Others
  {
    id: "knitzy",
    title: "Knitzy",
    description: "Cozy puzzle interactions.",
    image: "/placeholder.jpg",
    tags: ["Puzzle", "Casual"],
    featured: false,
    route: "/games/knitzy",
    component: "KnitzyGame",
  },
  {
    id: "platformer",
    title: "Puzzle Platformer",
    description: "2D platformer with physics‑based puzzles.",
    image: "/2d-platformer-game-with-character-and-obstacles.jpg",
    tags: ["Platformer", "Puzzle"],
    featured: false,
    route: "/games/platformer",
    component: "PlatformerGame",
  },
  {
    id: "tower-defense",
    title: "Tower Defense",
    description: "Strategic towers vs. waves of enemies.",
    image: "/tower-defense-game-with-towers-and-enemies.jpg",
    tags: ["Strategy", "Tactics"],
    featured: false,
    route: "/games/tower-defense",
    component: "TowerDefenseGame",
  },
];
