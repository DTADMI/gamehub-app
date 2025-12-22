"use client";

import {LogIn} from "lucide-react";
import Link from "next/link";

import {ModeToggle} from "@/components/ModeToggle";
import {Button} from "@/components/ui/button";
import {useFeature} from "@/lib/flags";
import {LanguageToggle} from "@/components/LanguageToggle";

export function Header() {
  const showAdmin = useFeature("ADMIN", false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-6">
          <Link
              href="/"
              className="text-lg font-semibold"
              aria-label="GameHub Home"
          >
            GameHub
          </Link>
          <nav className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            <Link href="/games" className="hover:text-foreground">
              Games
            </Link>
            <Link href="/projects" className="hover:text-foreground">
              Projects
            </Link>
            <Link href="/leaderboard" className="hover:text-foreground">
              Leaderboard
            </Link>
            {showAdmin ? (
                <Link href="/admin/flags" className="hover:text-foreground">
                  Admin
                </Link>
            ) : null}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ModeToggle />
          <LanguageToggle/>
          <Button asChild size="sm" variant="ghost">
            <Link href="/login" className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              <span>Sign In</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

export default Header;
