import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Game {
  id: number;
  title: string;
  description: string;
  image: string;
  tags: string[];
  slug: string; // used to open the playable page under /games/[slug]
  featured?: boolean;
  upcoming?: boolean;
}

interface GameCardProps {
  game: Game
  featured?: boolean
}

export function GameCard({ game, featured = false }: GameCardProps) {
  return (
    <div className="block">
      <Card
        className={`group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${featured ? "ring-2 ring-primary/20" : ""}`}
      >
        <CardHeader className="p-0">
          <div className="relative overflow-hidden">
            <Image
              src={game.image || "/placeholder.svg"}
              alt={game.title}
              width={300}
              height={200}
              className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              {game.upcoming ? (
                <span className="inline-flex items-center rounded-md bg-amber-500/90 px-3 py-1.5 text-sm font-medium text-white">
                  Coming soon
                </span>
              ) : (
                <Button size="lg" className="gap-2" asChild>
                  <Link href={`/games/${game.slug}`}>
                    <Play className="w-4 h-4" />
                    Play
                  </Link>
                </Button>
              )}
            </div>
            {featured && (
              <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground">Featured</Badge>
            )}
            {game.upcoming && (
              <Badge className="absolute top-3 left-3 bg-amber-500 text-white">Upcoming</Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <h3 className="text-xl font-semibold text-card-foreground mb-2 text-balance">
            {game.title}
          </h3>
          <p className="text-muted-foreground mb-4 text-pretty">{game.description}</p>
          <div className="flex flex-wrap gap-2">
            {game.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
