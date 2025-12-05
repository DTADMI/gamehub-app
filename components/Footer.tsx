// frontend/components/Footer.tsx
"use client";

import Link from "next/link";
import { Gamepad2, Github, Linkedin, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { useState, useEffect } from "react";
import { CONTACT_EMAIL, GITHUB_URL, LINKEDIN_URL, mailto } from "@/lib/env";

const footerLinks = [
  {
    title: "Games",
    items: [
      { name: "All Games", href: "/games" },
      { name: "Featured", href: "/games?filter=featured" },
      { name: "New Releases", href: "/games?filter=new" },
      { name: "Popular", href: "/games?filter=popular" },
      { name: "Leaderboard", href: "/leaderboard" },
    ],
  },
  {
    title: "Company",
    items: [
      { name: "About Us", href: "/about" },
      { name: "Contact", href: "/contact" },
      { name: "Blog", href: "/blog" },
      { name: "Careers", href: "/careers" },
    ],
  },
  {
    title: "Legal",
    items: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "/cookies" },
    ],
  },
  {
    title: "Social",
    items: [
      { name: "GitHub", href: GITHUB_URL, icon: Github },
      { name: "LinkedIn", href: LINKEDIN_URL, icon: Linkedin },
      { name: "Email", href: CONTACT_EMAIL ? mailto(CONTACT_EMAIL) : "", icon: Mail },
    ],
  },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement newsletter subscription
    console.log("Subscribed with email:", email);
    setEmail("");
  };

  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container px-4 py-12 md:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Gamepad2 className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Gamehub
              </span>
            </Link>
            <p className="text-muted-foreground max-w-xs">
              A collection of fun and engaging games for everyone.
            </p>
          </div>

          {footerLinks.map((section) => {
            const items =
              section.title === "Social"
                ? section.items.filter((item) => {
                    if (item.name === "GitHub") return Boolean(GITHUB_URL);
                    if (item.name === "LinkedIn") return Boolean(LINKEDIN_URL);
                    if (item.name === "Email") return Boolean(CONTACT_EMAIL);
                    return true;
                  })
                : section.items;

            if (items.length === 0) {
              return null;
            }

            return (
              <div key={section.title} className="space-y-4">
                <h4 className="text-sm font-semibold">{section.title}</h4>
                <ul className="space-y-2">
                  {items.map((item) => {
                    const isExternal =
                      item.href.startsWith("http") || item.href.startsWith("mailto:");
                    return (
                      <li key={item.name}>
                        {isExternal ? (
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                          >
                            {item.name}
                          </a>
                        ) : (
                          <Link
                            href={item.href}
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                          >
                            {item.name}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Subscribe to our newsletter</h4>
            <p id="newsletter-help" className="text-sm text-muted-foreground">Get the latest updates and news.</p>
            <form onSubmit={handleSubmit} className="flex space-x-2" aria-describedby="newsletter-help">
              <label htmlFor="newsletter-email" className="sr-only">Email address</label>
              <input
                id="newsletter-email"
                type="email"
                placeholder="Your email"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-required="true"
                disabled={!isMounted}
                suppressHydrationWarning
              />
              <Button type="submit" size="sm" className="bg-primary hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary/60">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
        <div className="mt-12 border-t pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Gamehub. All rights reserved.
            </p>
            <div className="flex items-center space-x-4">
              <ModeToggle />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
