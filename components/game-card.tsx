"use client";

import {Play} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader} from "@/components/ui/card";

interface Game {
  id: number | string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  slug: string; // used to open the playable page under /games/[slug]
  featured?: boolean;
  upcoming?: boolean;
}

interface GameCardProps {
  game: Game;
  featured?: boolean;
}

export function GameCard({ game, featured = false }: GameCardProps) {
  // Handle play button click
  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the parent link
    if (typeof window !== "undefined") {
      window.location.href = `/games/${game.slug}`;
    }
  };

  // Full-card clickable for better UX; keep Play button overlay for affordance.
  const CardInner = (
      <Card
          className={`group h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
              featured ? "ring-2 ring-primary/20" : ""
          }`}
      >
        <CardHeader className="p-0">
          <div className="relative overflow-hidden">
            {/* 16:9 media slot to prevent stretching on desktop */}
            <div className="w-full aspect-[16/9] bg-muted/30">
              <Image
                  src={game.image || "/placeholder.svg"}
                  alt={game.title}
                  width={1920}
                  height={1080}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              {game.upcoming ? (
                  <span
                      className="inline-flex items-center rounded-md bg-amber-500/90 px-3 py-1.5 text-sm font-medium text-white">
                Coming soon
              </span>
              ) : (
                  <Button
                      size="lg"
                      className="gap-2"
                      onClick={handlePlayClick}
                      aria-label={`Play ${game.title}`}
                  >
                    <Play className="w-4 h-4"/>
                    Play
                  </Button>
              )}
            </div>
            {featured && (
                <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground">
                  Featured
                </Badge>
            )}
            {game.upcoming && (
                <Badge className="absolute top-3 left-3 bg-amber-500 text-white">
                  Upcoming
                </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-6 flex flex-col flex-1">
          <h3 className="text-xl font-semibold text-card-foreground mb-2 text-balance">
            {game.title}
          </h3>
          <p className="text-muted-foreground mb-4 text-pretty line-clamp-2">
            {game.description}
          </p>
          <div className="mt-auto pt-2 flex flex-wrap gap-2">
            {game.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
  );

  return (
      <div className="block h-full">
        {game.upcoming ? (
            CardInner
        ) : (
            // Wrap in Link to make the entire card clickable
            <Link
                href={`/games/${game.slug}`}
                className="block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary rounded-md"
                aria-label={`View details for ${game.title}`}
            >
              {CardInner}
            </Link>
        )}
    </div>
  );
}
