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
            "Mobile-first geocaching — create and share location-based treasure hunts.",
        image: "https://picsum.photos/seed/quest-hunt/1280/1280",
        url: "https://github.com/DTADMI/quest-hunt",
        featured: true,
    },
    {
        id: "story-forge",
        title: "Story Forge",
        description:
            "A gamified writing platform that helps writers build consistent habits, craft worlds, and share short stories with privacy controls and social features.",
        image: "https://picsum.photos/seed/story-forge/1280/1280",
        url: "https://github.com/DTADMI/story-forge",
        featured: true,
    },
    {
        id: "velvet-galaxy",
        title: "Velvet Galaxy",
        description:
            "Velvet Galaxy is a modern, full‑stack social application built on Next.js.",
        image: "https://picsum.photos/seed/velvet-galaxy/1280/1280",
        url: "https://github.com/DTADMI/velvet-galaxy",
        featured: true,
    },
];

export const FEATURED_PROJECTS: Project[] = PROJECTS.filter((p) => p.featured);
