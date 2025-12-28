import type {NextConfig} from "next";
import path from "path";

// Central Next.js config (single source of truth)
const nextConfig: NextConfig = {
    // Prefer standalone when building in Docker runtime
    output: process.env.NEXT_STANDALONE === "true" ? "standalone" : undefined,
    // Force absolute asset URLs so chunks load correctly on nested routes (Cloud Run)
    assetPrefix: "/",

    // As of Next.js 16, Turbopack is the default bundler. Because we also define a
    // custom `webpack` config (for local aliases), Next expects a `turbopack` key
    // to acknowledge Turbopack usage. An empty object is sufficient and silences
    // the warning/error: "using Turbopack with a webpack config and no turbopack config".
    // If you need to force webpack instead, invoke `next build --webpack` in CI.
    turbopack: {},

    // Enable React Strict Mode
    reactStrictMode: true,

    // Ensure Next transpiles our local workspace packages
    transpilePackages: [
        "@games/shared",
        "@games/snake",
        "@games/memory",
        "@games/breakout",
        "@games/knitzy",
        "@games/chrono-shift",
        "@games/elemental-conflux",
        "@games/quantum-architect",
        // New point-and-click games (scaffolded)
        "@games/_engine",
        "@games/rite-of-discovery",
        "@games/systems-discovery",
        "@games/toymaker-escape",
        "@react-three/fiber",
        "@react-three/drei",
    ],

    // Images: use remotePatterns only (domains is deprecated in Next 16)
    images: {
        remotePatterns: [
            {protocol: "https", hostname: "images.unsplash.com"},
            {protocol: "https", hostname: "via.placeholder.com"},
            {protocol: "https", hostname: "*"},
        ],
    },

    experimental: {
        // Allow importing files from outside the frontend/ directory using TS path aliases
        externalDir: true,
    },

    // Ensure webpack can resolve our local "@games/*" workspace-style aliases
    webpack: (config) => {
        config.resolve = config.resolve || {};
        const gamesPath = path.resolve(__dirname, "../../packages/games");
        const sharedPath = path.resolve(__dirname, "../../packages/shared/src");
        config.resolve.alias = {
            ...(config.resolve.alias || {}),
            "@games/_engine": path.resolve(gamesPath, "_engine"),
            "@games/shared": sharedPath,
            "@games/breakout": path.resolve(gamesPath, "breakout/src"),
            "@games/knitzy": path.resolve(gamesPath, "knitzy/src"),
            "@games/memory": path.resolve(gamesPath, "memory/src"),
            "@games/snake": path.resolve(gamesPath, "snake/src"),
            "@games/chrono-shift": path.resolve(gamesPath, "chrono-shift/src"),
            "@games/elemental-conflux": path.resolve(gamesPath, "elemental-conflux/src"),
            "@games/quantum-architect": path.resolve(gamesPath, "quantum-architect/src"),
            // New point-and-click games (scaffolded)
            "@games/rite-of-discovery": path.resolve(gamesPath, "rite-of-discovery/src"),
            "@games/systems-discovery": path.resolve(gamesPath, "systems-discovery/src"),
            "@games/toymaker-escape": path.resolve(gamesPath, "toymaker-escape/src"),
            "@games/manifest": path.resolve(gamesPath, "manifest"),
        };
        return config;
    },

    // Environment variables baked at build time (local default points at backend:3000)
    env: {
        NEXT_PUBLIC_API_URL:
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
    },

    // Keep API requests going to the configured backend when running in the same origin
    async rewrites() {
        const target =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
        return [
            // IMPORTANT: Keep NextAuth routes on the frontend (do not proxy to backend)
            {
                source: "/api/auth/:path*",
                destination: "/api/auth/:path*",
            },
            // Public API to backend
            {
                source: "/api/:path*",
                destination: `${target}/:path*`,
            },
            // Safety net: some environments (or third‑party code) mistakenly request /next/* instead of /_next/*
            // Add a rewrite so those assets still resolve.
            {
                source: "/next/:path*",
                destination: "/_next/:path*",
            },
        ];
    },

    // Redirects for renamed routes
    async redirects() {
        return [
            {
                source: "/games/knitzy",
                destination: "/games/pattern-matching",
                permanent: true,
            },
        ];
    },

    // Security headers with CSP tuned for Next.js 16, next/font, and optional Google Fonts
    async headers() {
        const backend =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
        // Allow Google Fonts when used by older pages; next/font is self-hosted and works with 'self'
        const csp = [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "img-src 'self' data: blob: https:",
            "font-src 'self' data: https://fonts.gstatic.com",
            `connect-src 'self' ${backend.replace(/\/api$/, "")} https: http:`,
            "frame-ancestors 'self'",
            "base-uri 'self'",
        ].join("; ");

        return [
            {
                source: "/:path*",
                headers: [
                    {key: "Content-Security-Policy", value: csp},
                    {key: "Referrer-Policy", value: "strict-origin-when-cross-origin"},
                    {key: "X-Content-Type-Options", value: "nosniff"},
                    {key: "X-Frame-Options", value: "SAMEORIGIN"},
                    {
                        key: "Permissions-Policy",
                        value: "geolocation=(), microphone=(), camera=()",
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
