"use client";

import * as Tabs from "@radix-ui/react-tabs";
import Link from "next/link";
import {GameCard} from "@/components/GameCard";
import {Button} from "@/components/ui/button";
import {FolderKanban, Gamepad2} from "lucide-react";
import {Carousel} from "@/components/Carousel";
import {useFeature} from "@/lib/flags";

type Game = {
  id: number;
  title: string;
  description: string;
  image: string;
  tags: string[];
  slug: string;
  upcoming?: boolean;
  featured?: boolean;
};

const ALL_GAMES: Game[] = [
  {
    id: 1,
    title: "Snake Game",
    description: "Classic snake with smooth controls.",
    image: "/retro-snake-game-with-neon-colors.jpg",
    tags: ["Canvas", "Arcade"],
    slug: "snake",
    featured: true,
  },
  {
    id: 2,
    title: "Breakout",
    description: "Brick breaker with power-ups.",
    image: "/breakout-game-with-paddle-and-colorful-bricks.jpg",
    tags: ["Canvas", "Physics"],
    slug: "breakout",
  },
  {
    id: 3,
    title: "Tetris",
    description: "Tile-matching classic.",
    image: "/colorful-tetris-blocks-falling.jpg",
    tags: ["Puzzle"],
    slug: "tetris",
    upcoming: true,
  },
];

type Project = {
  title: string;
  description: string;
  tags: string[];
  repo?: string;
  demo?: string;
  comingSoon?: boolean;
};

const PROJECTS: Project[] = [
  {
    title: "Portfolio Website",
    description: "Personal website built with Next.js and TailwindCSS.",
    tags: ["Next.js", "TailwindCSS"],
  },
  {
    title: "Data Viz Dashboard",
    description: "Interactive charts and analytics.",
    tags: ["Charts", "Auth"],
    comingSoon: true,
  },
];

export default function ExplorePage() {
    const useCarousels = useFeature("EXPLORE_CAROUSELS", true);
    const showGamesFeatured = useFeature("EXPLORE_SHOW_FEATURED", true);
    const showGamesUpcoming = useFeature("EXPLORE_SHOW_UPCOMING", true);
    const showProjectsFeatured = useFeature("EXPLORE_SHOW_PROJECTS_FEATURED", true);
    const showProjectsComing = useFeature("EXPLORE_SHOW_PROJECTS_COMING_SOON", true);

  return (
    <section className="space-y-8 px-6 md:px-8 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Explore</h1>
      </div>

      <Tabs.Root defaultValue="games" className="w-full">
        <Tabs.List className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
          <Tabs.Trigger
            value="games"
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 data-[state=active]:bg-background data-[state=active]:text-foreground"
          >
            <Gamepad2 className="h-4 w-4" /> Games
          </Tabs.Trigger>
          <Tabs.Trigger
            value="projects"
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 data-[state=active]:bg-background data-[state=active]:text-foreground"
          >
            <FolderKanban className="h-4 w-4" /> Projects
          </Tabs.Trigger>
        </Tabs.List>

          <Tabs.Content value="games" className="mt-6 space-y-6">
              {showGamesFeatured && (
                  <>
                      <h3 className="text-lg font-semibold">Featured</h3>
                      {useCarousels ? (
                          <Carousel>
                              {ALL_GAMES.filter((g) => g.featured && !g.upcoming).map((g) => (
                                  <GameCard key={g.id} game={g} featured={g.featured}/>
                              ))}
                          </Carousel>
                      ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {ALL_GAMES.filter((g) => g.featured && !g.upcoming).map((g) => (
                                  <GameCard key={g.id} game={g} featured={g.featured}/>
                              ))}
                          </div>
                      )}
                  </>
              )}
              {showGamesUpcoming && (
                  <>
                      <h3 className="text-lg font-semibold">Upcoming</h3>
                      {useCarousels ? (
                          <Carousel>
                              {ALL_GAMES.filter((g) => g.upcoming).map((g) => (
                                  <GameCard key={g.id} game={g}/>
                              ))}
                          </Carousel>
                      ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {ALL_GAMES.filter((g) => g.upcoming).map((g) => (
                                  <GameCard key={g.id} game={g}/>
                              ))}
                          </div>
                      )}
                  </>
              )}
          <div className="mt-6">
            <Button asChild variant="outline">
              <Link href="/games">Open Games page</Link>
            </Button>
          </div>
        </Tabs.Content>

          <Tabs.Content value="projects" className="mt-6 space-y-6">
              {showProjectsFeatured && (
                  <>
                      <h3 className="text-lg font-semibold">Featured</h3>
                      {useCarousels ? (
                          <Carousel>
                              {PROJECTS.filter((p) => !p.comingSoon).map((p) => (
                                  <article key={p.title}
                                           className="rounded-lg border bg-card text-card-foreground shadow-sm">
                                      <div className="p-5 space-y-3">
                                          <h2 className="text-lg font-semibold">{p.title}</h2>
                                          <p className="text-sm text-muted-foreground">{p.description}</p>
                                          <div className="flex flex-wrap gap-2">
                                              {p.tags.map((t) => (
                                                  <span
                                                      key={t}
                                                      className="inline-flex items-center rounded-md bg-accent/10 px-2 py-1 text-xs font-medium text-accent dark:bg-accent/20"
                                                  >
                              {t}
                            </span>
                                              ))}
                                          </div>
                                      </div>
                                  </article>
                              ))}
                          </Carousel>
                      ) : (
                          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                              {PROJECTS.filter((p) => !p.comingSoon).map((p) => (
                                  <article key={p.title}
                                           className="rounded-lg border bg-card text-card-foreground shadow-sm">
                                      <div className="p-5 space-y-3">
                                          <h2 className="text-lg font-semibold">{p.title}</h2>
                                          <p className="text-sm text-muted-foreground">{p.description}</p>
                                          <div className="flex flex-wrap gap-2">
                                              {p.tags.map((t) => (
                                                  <span
                                                      key={t}
                                                      className="inline-flex items-center rounded-md bg-accent/10 px-2 py-1 text-xs font-medium text-accent dark:bg-accent/20"
                                                  >
                              {t}
                            </span>
                                              ))}
                                          </div>
                                      </div>
                                  </article>
                              ))}
                          </div>
                      )}
                  </>
              )}
              {showProjectsComing && (
                  <>
                      <h3 className="text-lg font-semibold">Coming Soon</h3>
                      {useCarousels ? (
                          <Carousel>
                              {PROJECTS.filter((p) => p.comingSoon).map((p) => (
                                  <article key={p.title}
                                           className="rounded-lg border bg-card text-card-foreground shadow-sm">
                                      <div className="p-5 space-y-3">
                                          <h2 className="text-lg font-semibold">{p.title}</h2>
                                          <p className="text-sm text-muted-foreground">{p.description}</p>
                                          <div className="flex flex-wrap gap-2">
                                              {p.tags.map((t) => (
                                                  <span
                                                      key={t}
                                                      className="inline-flex items-center rounded-md bg-accent/10 px-2 py-1 text-xs font-medium text-accent dark:bg-accent/20"
                                                  >
                              {t}
                            </span>
                                              ))}
                                          </div>
                                          <span
                                              className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">Coming soon</span>
                                      </div>
                                  </article>
                              ))}
                          </Carousel>
                      ) : (
                          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                              {PROJECTS.filter((p) => p.comingSoon).map((p) => (
                                  <article key={p.title}
                                           className="rounded-lg border bg-card text-card-foreground shadow-sm">
                                      <div className="p-5 space-y-3">
                                          <h2 className="text-lg font-semibold">{p.title}</h2>
                                          <p className="text-sm text-muted-foreground">{p.description}</p>
                                          <div className="flex flex-wrap gap-2">
                                              {p.tags.map((t) => (
                                                  <span
                                                      key={t}
                                                      className="inline-flex items-center rounded-md bg-accent/10 px-2 py-1 text-xs font-medium text-accent dark:bg-accent/20"
                                                  >
                              {t}
                            </span>
                                              ))}
                                          </div>
                                          <span
                                              className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">Coming soon</span>
                                      </div>
                                  </article>
                              ))}
                          </div>
                      )}
                  </>
              )}
          <div className="mt-6">
            <Button asChild variant="outline">
              <Link href="/projects">Open Projects page</Link>
            </Button>
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </section>
  );
}
