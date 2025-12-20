import {ExternalLink} from "lucide-react";
import Link from "next/link";

import {Carousel} from "@/components/Carousel";
import {GameCard} from "@/components/GameCard";
import {Button} from "@/components/ui/button";
import {GAMES} from "@/lib/games";

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

const games: HomeGame[] = GAMES.map((g, idx) => ({
  id: idx + 1,
  title: g.title,
  description: g.description,
  image: g.image,
  tags: g.tags,
  slug: g.id,
  featured: !!g.featured,
  // Upcoming is defined as any game that is NOT featured (MVPs are featured)
  upcoming: !g.featured,
}));

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
                Welcome to my collection of interactive games and projects built
                with JavaScript. Each project showcases different aspects of
                game development, from classic arcade games to modern
                interactive experiences.
              </p>
              <div className="flex gap-4">
                <Button asChild size="lg" className="gap-2">
                  <Link href="/explore">
                    <ExternalLink className="w-4 h-4"/>
                    Explore All
                  </Link>
                </Button>
              </div>
            </div>
          </section>

          {/* Featured Games */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-6">
              Featured Games
            </h2>
            <Carousel>
              {featured.map((game) => (
                  <GameCard key={game.id} game={game} featured/>
              ))}
            </Carousel>
          </section>

          {/* Upcoming Games */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-6">
              Upcoming Games
            </h2>
            <Carousel>
              {upcoming.map((game) => (
                  <GameCard key={game.id} game={game}/>
              ))}
            </Carousel>
          </section>

          {/* No separate "More Games" section: Upcoming shows all non-featured */}
        </div>
      </main>
    </div>
  );
}
