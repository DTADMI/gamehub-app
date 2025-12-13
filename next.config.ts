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
    "@games/chess",
    "@games/checkers",
    "@games/snake",
    "@games/memory",
    "@games/breakout",
    "@games/tetris",
    "@games/platformer",
    "@games/bubble-pop",
    "@games/knitzy",
    "@games/tower-defense",
    "@react-three/fiber",
    "@react-three/drei",
  ],

  // Images: use remotePatterns only (domains is deprecated in Next 16)
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "via.placeholder.com" },
      { protocol: "https", hostname: "*" },
    ],
  },

  experimental: {
    // Allow importing files from outside the frontend/ directory using TS path aliases
    externalDir: true,
  },

  // Ensure webpack can resolve our local "@games/*" workspace-style aliases
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@games/shared": path.resolve(__dirname, "libs/shared/src"),
      "@games/breakout": path.resolve(__dirname, "games/breakout/src"),
      "@games/bubble-pop": path.resolve(__dirname, "games/bubble-pop/src"),
      "@games/checkers": path.resolve(__dirname, "games/checkers/src"),
      "@games/chess": path.resolve(__dirname, "games/chess/src"),
      "@games/knitzy": path.resolve(__dirname, "games/knitzy/src"),
      "@games/memory": path.resolve(__dirname, "games/memory/src"),
      "@games/platformer": path.resolve(__dirname, "games/platformer/src"),
      "@games/snake": path.resolve(__dirname, "games/snake/src"),
      "@games/tetris": path.resolve(__dirname, "games/tetris/src"),
      "@games/tower-defense": path.resolve(
          __dirname,
          "games/tower-defense/src",
      ),
    };
    return config;
  },

  // Environment variables baked at build time (local default points at backend:3000)
  env: {
    NEXT_PUBLIC_API_URL:
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
  },

  // Keep API requests going to the configured backend when running in the same origin
  async rewrites() {
    const target =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
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

  // Security headers with CSP tuned for Next.js 16, next/font, and optional Google Fonts
  async headers() {
    const backend =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
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
          { key: "Content-Security-Policy", value: csp },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
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
