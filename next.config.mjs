/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output only when explicitly requested (e.g., in Docker builds)
  // This avoids Windows symlink errors during local builds.
  output: process.env.NEXT_STANDALONE === 'true' ? 'standalone' : undefined,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
