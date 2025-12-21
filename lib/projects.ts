// lib/projects.ts — Featured projects data for Home carousel

export type Project = {
    id: string;
    title: string;
    description: string;
    image: string; // public path under /public/images or root /public
    url: string; // external or internal URL
    featured?: boolean;
};

export const PROJECTS: Project[] = [
    {
        id: "quest-hunt",
        title: "Quest Hunt",
        description:
            "Mobile-first geocaching with MapLibre and Supabase — create and share location-based treasure hunts.",
        image: "/images/projects/quest-hunt.jpg",
        url: "https://github.com/DTADMI/quest-hunt",
        featured: true,
    },
    {
        id: "gamehub-backend",
        title: "GameHub Backend",
        description:
            "Spring Boot + GraphQL + Postgres — API service powering leaderboards and profiles.",
        image: "/images/projects/gamehub-backend.jpg",
        url: "https://github.com/DTADMI/gamehub-backend",
        featured: true,
    },
];

export const FEATURED_PROJECTS: Project[] = PROJECTS.filter((p) => p.featured);
