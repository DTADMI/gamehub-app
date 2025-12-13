# Multi-stage Dockerfile using Node + pnpm for Next.js 16

FROM node:20-alpine AS deps
WORKDIR /app
# Enable Corepack and prepare pnpm
RUN corepack enable && corepack prepare pnpm@10.24.0 --activate
COPY package.json pnpm-lock.yaml* ./
RUN pnpm i --frozen-lockfile

FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.24.0 --activate

# Copy package files and install dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build time
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_STANDALONE=true
ENV NODE_ENV=production

# Accept build arguments and set them as environment variables
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

ARG NEXT_PUBLIC_FIREBASE_API_KEY
ENV NEXT_PUBLIC_FIREBASE_API_KEY=${NEXT_PUBLIC_FIREBASE_API_KEY}

ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}

ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID=${NEXT_PUBLIC_FIREBASE_PROJECT_ID}

ARG NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ENV NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}

ARG NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ENV NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID}

ARG NEXT_PUBLIC_FIREBASE_APP_ID
ENV NEXT_PUBLIC_FIREBASE_APP_ID=${NEXT_PUBLIC_FIREBASE_APP_ID}

ARG PUBLIC_ENV_FINGERPRINT
ENV PUBLIC_ENV_FINGERPRINT=${PUBLIC_ENV_FINGERPRINT}

# Print environment variables for debugging (removed sensitive values)
RUN echo "Building with the following environment:" && \
    echo "NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}" && \
    echo "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}" && \
    echo "NEXT_PUBLIC_FIREBASE_PROJECT_ID=${NEXT_PUBLIC_FIREBASE_PROJECT_ID}" && \
    echo "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}" && \
    echo "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID}" && \
    echo "NEXT_PUBLIC_FIREBASE_APP_ID=${NEXT_PUBLIC_FIREBASE_APP_ID}" && \
    echo "NEXT_PUBLIC_FIREBASE_API_KEY=${NEXT_PUBLIC_FIREBASE_API_KEY:0:5}..."  # Show first 5 chars only

# Build the application
ENV NEXT_PUBLIC_ENV_STAMP=1
RUN \
  NEXT_PUBLIC_API_URL="$NEXT_PUBLIC_API_URL" \
  NEXT_PUBLIC_FIREBASE_API_KEY="$NEXT_PUBLIC_FIREBASE_API_KEY" \
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN" \
  NEXT_PUBLIC_FIREBASE_PROJECT_ID="$NEXT_PUBLIC_FIREBASE_PROJECT_ID" \
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="$NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET" \
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="$NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID" \
  NEXT_PUBLIC_FIREBASE_APP_ID="$NEXT_PUBLIC_FIREBASE_APP_ID" \
  pnpm build

# Create a non-production build for debugging if needed
# RUN pnpm build:debug

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy the built application
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Switch to the non-root user
USER nextjs

# Expose the port the app runs on
EXPOSE 3000

# Set the host to 0.0.0.0 for Cloud Run
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Use the start script from the standalone output
CMD ["node", "server.js"]
