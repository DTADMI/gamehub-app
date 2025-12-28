// frontend/components/Navbar.tsx
"use client";

import {Gamepad2, Github, Linkedin, LogIn, Menu, UserPlus, X,} from "lucide-react";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {useEffect, useState} from "react";

import {ModeToggle} from "@/components/mode-toggle";
import {Button} from "@/components/ui/button";
import {GITHUB_URL, LINKEDIN_URL} from "@/lib/env";
import {cn} from "@/lib/utils";

const navItems = [
    {name: "Home", href: "/"},
    {name: "Games", href: "/games"},
    {name: "Projects", href: "/projects"},
    {name: "About", href: "/about"},
    {name: "Contact", href: "/contact"},
    {name: "Leaderboard", href: "/leaderboard"},
];

export function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const hasGithub = Boolean(GITHUB_URL);
    const hasLinkedIn = Boolean(LINKEDIN_URL);

    // Close mobile menu when route changes
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    return (
        <header
            className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center space-x-8">
                    <Link href="/" className="flex items-center space-x-2">
                        <Gamepad2 className="h-6 w-6 text-primary"/>
                        <span
                            className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Gamehub
            </span>
                    </Link>

                    <nav className="hidden md:flex space-x-6">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "text-sm font-medium transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded-md px-1.5 py-1",
                                    pathname === item.href
                                        ? "text-primary"
                                        : "text-foreground/60",
                                )}
                                aria-current={pathname === item.href ? "page" : undefined}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center space-x-2">
                    <div className="hidden md:flex items-center space-x-2">
                        {hasGithub && (
                            <Button
                                variant="ghost"
                                size="icon"
                                asChild
                                className="focus-visible:ring-2 focus-visible:ring-primary/60"
                            >
                                <a
                                    href={GITHUB_URL}
                                    aria-label="GitHub profile"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Github className="h-5 w-5"/>
                                </a>
                            </Button>
                        )}
                        {hasLinkedIn && (
                            <Button
                                variant="ghost"
                                size="icon"
                                asChild
                                className="focus-visible:ring-2 focus-visible:ring-primary/60"
                            >
                                <a
                                    href={LINKEDIN_URL}
                                    aria-label="LinkedIn profile"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Linkedin className="h-5 w-5"/>
                                </a>
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            asChild
                            className="focus-visible:ring-2 focus-visible:ring-primary/60"
                        >
                            <Link href="/login" className="flex items-center space-x-2">
                                <LogIn className="h-4 w-4"/>
                                <span>Sign In</span>
                            </Link>
                        </Button>
                        <Button
                            asChild
                            className="bg-primary hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary/60"
                        >
                            <Link href="/register" className="flex items-center space-x-2">
                                <UserPlus className="h-4 w-4"/>
                                <span>Sign up</span>
                            </Link>
                        </Button>
                    </div>
                    <ModeToggle/>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? (
                            <X className="h-5 w-5"/>
                        ) : (
                            <Menu className="h-5 w-5"/>
                        )}
                        <span className="sr-only">Toggle menu</span>
                    </Button>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t">
                    <div className="container py-4 space-y-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "block px-4 py-2 text-sm font-medium rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                                    pathname === item.href
                                        ? "bg-accent text-accent-foreground"
                                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                                )}
                                aria-current={pathname === item.href ? "page" : undefined}
                            >
                                {item.name}
                            </Link>
                        ))}
                        <div className="pt-2 border-t mt-2">
                            {(hasGithub || hasLinkedIn) && (
                                <div className="flex items-center gap-2 mb-2">
                                    {hasGithub && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            asChild
                                            className="focus-visible:ring-2 focus-visible:ring-primary/60"
                                        >
                                            <a
                                                href={GITHUB_URL}
                                                aria-label="GitHub profile"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <Github className="h-5 w-5"/>
                                            </a>
                                        </Button>
                                    )}
                                    {hasLinkedIn && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            asChild
                                            className="focus-visible:ring-2 focus-visible:ring-primary/60"
                                        >
                                            <a
                                                href={LINKEDIN_URL}
                                                aria-label="LinkedIn profile"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <Linkedin className="h-5 w-5"/>
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            )}
                            <Button
                                variant="ghost"
                                className="w-full justify-start focus-visible:ring-2 focus-visible:ring-primary/60"
                                asChild
                            >
                                <Link href="/login" className="flex items-center space-x-2">
                                    <LogIn className="h-4 w-4"/>
                                    <span>Sign In</span>
                                </Link>
                            </Button>
                            <Button
                                className="w-full justify-start mt-2 bg-primary hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary/60"
                                asChild
                            >
                                <Link href="/register" className="flex items-center space-x-2">
                                    <UserPlus className="h-4 w-4"/>
                                    <span>Create Account</span>
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
