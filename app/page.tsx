import {GameCard} from "@/components/GameCard";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {ExternalLink} from "lucide-react";
import {Carousel} from "@/components/Carousel";

type HomeGame = {
  id: number;
  title: string;
  description: string;
  image: string;
  tags: string[];
  slug: string;
  featured?: boolean;
  upcoming?: boolean;
};

const games: HomeGame[] = [
  {
    id: 1,
    title: "Snake Game",
    description: "Classic snake game with modern twist and smooth animations",
    image: "/retro-snake-game-with-neon-colors.jpg",
    tags: ["Canvas", "Game Logic", "Animation"],
    slug: "snake",
    featured: true,
  },
  {
    id: 2,
    title: "Tetris Clone",
    description: "Full-featured Tetris implementation with scoring and levels",
    image: "/colorful-tetris-blocks-falling.jpg",
    tags: ["JavaScript", "DOM", "Game State"],
    slug: "tetris",
    featured: true,
  },
  {
    id: 3,
    title: "Memory Card Game",
    description: "Interactive memory game with multiple difficulty levels",
    image: "/colorful-memory-cards-game-interface.jpg",
    tags: ["React", "State Management", "Animation"],
    slug: "memory",
    featured: false,
    upcoming: true,
  },
  {
    id: 4,
    title: "Breakout Game",
    description: "Classic brick-breaking game with power-ups and effects",
    image: "/breakout-game-with-paddle-and-colorful-bricks.jpg",
    tags: ["Canvas", "Physics", "Collision Detection"],
    slug: "breakout",
    featured: false,
  },
  {
    id: 5,
    title: "Puzzle Platformer",
    description: "2D platformer with physics-based puzzles and smooth controls",
    image: "/2d-platformer-game-with-character-and-obstacles.jpg",
    tags: ["Game Engine", "Physics", "Level Design"],
    slug: "platformer",
    featured: false,
    upcoming: true,
  },
  {
    id: 6,
    title: "Tower Defense",
    description: "Strategic tower defense game with multiple tower types",
    image: "/tower-defense-game-with-towers-and-enemies.jpg",
    tags: ["Strategy", "Pathfinding", "Game Balance"],
    slug: "tower-defense",
    featured: false,
    upcoming: true,
  },
];

export default function HomePage() {
  const featured = games.filter((g) => g.featured);
  const upcoming = games.filter((g) => g.upcoming);

  return (
    <div className="min-h-screen bg-background">
      <main className="flex-1">
        <div className="px-6 md:px-8 py-6">
            {/* Hero Section */}
            <section className="mb-12">
              <div className="max-w-4xl">
                <h1 className="text-4xl font-bold text-foreground mb-4 text-balance">
                  JavaScript Games & Interactive Projects
                </h1>
                <p className="text-lg text-muted-foreground mb-6 text-pretty">
                  Welcome to my collection of interactive games and projects built with JavaScript. Each project
                  showcases different aspects of game development, from classic arcade games to modern interactive
                  experiences.
                </p>
                <div className="flex gap-4">
                  <Button asChild size="lg" className="gap-2">
                    <Link href="/explore">
                      <ExternalLink className="w-4 h-4" />
                      Explore All
                    </Link>
                  </Button>
                </div>
              </div>
            </section>

            {/* Featured Games */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-foreground mb-6">Featured Games</h2>
              <Carousel>
                {featured.map((game) => (
                  <GameCard key={game.id} game={game} featured />
                ))}
              </Carousel>
            </section>

            {/* Upcoming Games */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-6">Upcoming Games</h2>
              <Carousel>
                {upcoming.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </Carousel>
            </section>
        </div>
      </main>
    </div>
  );
}
