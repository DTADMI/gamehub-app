// frontend/app/projects/page.tsx
import {ExternalLink, FolderKanban, Github} from "lucide-react";
import Link from "next/link";

import {Carousel} from "@/components/Carousel";
import {Button} from "@/components/ui/button";
import {GITHUB_URL} from "@/lib/env";

type Project = {
  title: string;
  description: string;
  tags: string[];
  repo?: string;
  demo?: string;
  comingSoon?: boolean;
  featured?: boolean;
};

const projects: Project[] = [
  {
    title: "Portfolio Website",
    description:
        "Personal website with blog and contact page built with Next.js and TailwindCSS.",
    tags: ["Next.js", "TailwindCSS", "SSR"],
    repo: GITHUB_URL,
    demo: "#",
    featured: true,
  },
  {
    title: "Data Viz Dashboard",
    description:
        "Interactive charts and analytics with authentication and role-based access.",
    tags: ["Charts", "Auth", "Accessibility"],
    comingSoon: true,
  },
];

export default function ProjectsPage() {
  const featured = projects.filter((p) => p.featured && !p.comingSoon);
  const comingSoon = projects.filter((p) => p.comingSoon);
  return (
    <section className="space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FolderKanban className="h-6 w-6 text-primary" />
          Projects
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
              <Github className="h-4 w-4 mr-2" /> GitHub Profile
            </a>
          </Button>
        </div>
      </header>
      {/* Featured Projects */}
      {featured.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Featured</h2>
            <Carousel>
              {featured.map((p) => (
                  <article
                      key={p.title}
                      className="rounded-lg border bg-card text-card-foreground shadow-sm"
                  >
                    <div className="p-5 space-y-3">
                      <h2 className="text-lg font-semibold">{p.title}</h2>
                      <p className="text-sm text-muted-foreground">
                        {p.description}
                      </p>
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
                      <div className="flex items-center gap-2 pt-2">
                        {p.repo && (
                            <Button variant="secondary" asChild>
                              <a
                                  href={p.repo}
                                  target="_blank"
                                  rel="noopener noreferrer"
                              >
                                <Github className="h-4 w-4 mr-2"/> View Code
                              </a>
                            </Button>
                        )}
                        {p.demo && (
                            <Button
                                asChild
                                className="bg-primary hover:bg-primary/90"
                            >
                              <a
                                  href={p.demo}
                                  target="_blank"
                                  rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-4 w-4 mr-2"/> Live Demo
                              </a>
                            </Button>
                        )}
                      </div>
                    </div>
                  </article>
              ))}
            </Carousel>
          </section>
      )}

      {/* Coming Soon Projects */}
      {comingSoon.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Coming Soon</h2>
            <Carousel>
              {comingSoon.map((p) => (
                  <article
                      key={p.title}
                      className="rounded-lg border bg-card text-card-foreground shadow-sm"
                  >
                    <div className="p-5 space-y-3">
                      <h2 className="text-lg font-semibold">{p.title}</h2>
                      <p className="text-sm text-muted-foreground">
                        {p.description}
                      </p>
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
                  <span className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                    Coming soon
                  </span>
                    </div>
                  </article>
              ))}
            </Carousel>
          </section>
      )}

      <p className="text-sm text-muted-foreground">
        Looking for games? Visit the{" "}
        <Link href="/games" className="underline underline-offset-2">
          Games
        </Link>{" "}
        page to play directly in your browser.
      </p>
    </section>
  );
}
