import {ExternalLink} from "lucide-react";
import Link from "next/link";

import {Carousel} from "@/components/Carousel";
import {GameCard} from "@/components/GameCard";
import {Button} from "@/components/ui/button";
import {listGames} from "@/games/manifest";
import {getGameById} from "@/lib/games";
import {FEATURED_PROJECTS} from "@/lib/projects";

type HomeGame = {
    id: string;
    title: string;
    description: string;
    image: string;
    tags: string[];
    slug: string;
    featured?: boolean;
};

export default function HomePage() {
    // Build games from manifest; overlay images from lib/games.ts
    const entries = listGames().filter(e => e.visible !== false);
    const allGames: HomeGame[] = entries.map((e) => {
        const lib = getGameById(e.slug);
        return {
            id: e.slug,
            title: e.title,
            description: e.shortDescription,
            image: lib?.image || e.image,
            tags: e.tags,
            slug: e.slug,
            featured: e.enabled !== false && !e.upcoming,
        };
    });
    const featured = allGames.filter((g) => g.featured);

    return (
        <div className="min-h-screen">
            <main className="flex-1">
                <div className="px-6 md:px-8 py-6 space-y-10">
                    {/* Hero Section */}
                    <section className="surface rounded-xl p-6">
                        <div className="max-w-4xl">
                            <h1 className="text-4xl font-bold text-foreground mb-4 text-balance">
                                Fun Games & Projects
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

                    {/* Featured Games */
                    }
                    <section className="rounded-xl p-0">
                        <h2 className="text-2xl font-semibold text-foreground mb-6">
                            Featured Games
                        </h2>
                        <Carousel>
                            {featured.map((game) => (
                                <GameCard key={game.id} game={game} featured/>
                            ))}
                        </Carousel>
                    </section>

                    {/* Featured Projects */}
                    <section className="rounded-xl p-0">
                        <h2 className="text-2xl font-semibold text-foreground mb-6">
                            Featured Projects
                        </h2>
                        <Carousel>
                            {FEATURED_PROJECTS.map((p) => (
                                <a
                                    key={p.id}
                                    href={p.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary rounded-md"
                                    aria-label={`Open project ${p.title}`}
                                >
                                    <div
                                        className="group h-full flex flex-col overflow-hidden rounded-lg shadow hover:shadow-lg transition-all duration-300">
                                        <div className="relative w-full aspect-[16/9] bg-muted/30">
                                            <img src={p.image} alt={p.title} className="w-full h-full object-cover"/>
                                        </div>
                                        <div
                                            className="p-4 bg-card/80 backdrop-blur-sm text-card-foreground flex-1 flex flex-col">
                                            <h3 className="text-lg font-semibold mb-1">{p.title}</h3>
                                            <p className="text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </Carousel>
                    </section>

                    {/* No Upcoming on Home; upcoming items live on /games or /projects */}
                </div>
            </main>
        </div>
    );
}
