// frontend/components/mode-toggle.tsx
"use client";

import {Moon, Sun} from "lucide-react";
import {useTheme} from "next-themes";
import * as React from "react";
import {useEffect, useState} from "react";

import {Button} from "@/components/ui/button";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,} from "@/components/ui/dropdown-menu";

export function ModeToggle() {
  const [mounted, setMounted] = useState(false);
  const { setTheme } = useTheme();

  const apply = (t: "light" | "dark" | "system") => {
    // Persist for SSR so the server can render matching HTML on first paint
    try {
      const maxAge = 60 * 60 * 24 * 365; // 1 year
      document.cookie = `theme=${t}; Path=/; Max-Age=${maxAge}`;
      // Keep UA color-scheme consistent
      const isDark = t === "dark";
      document.documentElement.style.colorScheme = isDark ? "dark" : "light";
    } catch {}
    setTheme(t);
  };

  // Only show the theme toggle after mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9" disabled>
        <Sun className="h-5 w-5" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => apply("light")}>
              Light
          </DropdownMenuItem>
        <DropdownMenuItem onClick={() => apply("dark")}>Dark</DropdownMenuItem>
          <DropdownMenuItem onClick={() => apply("system")}>
              System
          </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
