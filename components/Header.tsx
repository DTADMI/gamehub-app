"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useFeature } from "@/lib/flags";

export function Header() {
  const github = process.env.NEXT_PUBLIC_GITHUB_URL ?? "#";
  const linkedin = process.env.NEXT_PUBLIC_LINKEDIN_URL ?? "#";
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "";
  const showAdmin = useFeature("ADMIN", false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-semibold" aria-label="GameHub Home">
            GameHub
          </Link>
          <nav className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <Link href="/games" className="hover:text-foreground">Games</Link>
            <Link href="/projects" className="hover:text-foreground">Projects</Link>
            <Link href="/leaderboard" className="hover:text-foreground">Leaderboard</Link>
            {showAdmin ? (
              <Link href="/admin/flags" className="hover:text-foreground">Admin</Link>
            ) : null}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {github && (
            <Button asChild variant="ghost" size="sm">
              <a href={github} target="_blank" rel="noopener noreferrer">GitHub</a>
            </Button>
          )}
          {linkedin && (
            <Button asChild variant="ghost" size="sm">
              <a href={linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
            </Button>
          )}
          {email && (
            <Button asChild variant="outline" size="sm">
              <a href={`mailto:${email}`}>Email</a>
            </Button>
          )}

          <Button variant="ghost" size="icon" aria-label="Toggle theme">
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

export default Header;
