import type {Session, User} from "next-auth";
import NextAuth from "next-auth";
import type {JWT} from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

interface AuthUser extends User {
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
}

interface AuthSession extends Session {
  accessToken?: string;
  refreshToken?: string;
}

interface AuthToken extends JWT {
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  accessTokenIssuedAt?: number;
}

interface TokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

interface UserData {
  id?: number | string;
  username?: string;
  email?: string;
  roles?: string[];
}

const BACKEND_URL =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
    "http://localhost:8080/api";

function safeJson<T = any>(input: Response | string | null): T | null {
  try {
    if (!input) {
      return null;
    }
    if (typeof input === "string") {
      return JSON.parse(input) as T;
    }
    const ct = input.headers.get("content-type") || "";
    if (!ct.includes("application/json")) {
      return null;
    }
    // @ts-ignore - we'll coerce to T
    return input.json();
  } catch {
    return null;
  }
}

// Derive the options type from the NextAuth handler to be compatible with v4/v5 typings
type NAOptions = Parameters<typeof NextAuth>[0];

const authOptions: NAOptions = {
  secret: process.env.NEXTAUTH_SECRET || "dev-secret",
  session: { strategy: "jwt" as const },
  // Keep cookie settings explicit in dev to avoid host/port mismatches
  cookies: {
    sessionToken: {
      name:
          process.env.NODE_ENV === "production"
              ? "__Secure-next-auth.session-token"
              : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        let data: TokenResponse | null = null;
        try {
          const res = await fetch(`${BACKEND_URL}/auth/signin`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });
          if (!res.ok) {
            try {
              const errText = await res.text();
              console.warn("[auth] login failed", res.status, errText);
            } catch {
            }
            return null;
          }
          // Prefer JSON but guard against non-JSON error bodies
          data = (await safeJson<TokenResponse>(res)) as any;
          if (!data || !data.accessToken) {
            return null;
          }
        } catch {
          console.error("[auth] /auth/signin network error");
          return null;
        }

        let me: UserData = {};
        try {
          const r = await fetch(`${BACKEND_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${data.accessToken}` },
          });
          me = (await safeJson<UserData>(r)) || {};
        } catch {
          me = {};
        }

        try {
          localStorage.setItem("accessToken", data.accessToken);
        } catch {}
        try {
          localStorage.setItem("refreshToken", data.refreshToken || "");
        } catch {}

        return {
          id: me.id?.toString() || credentials.email,
          name: me.username || credentials.email,
          email: me.email || credentials.email,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresIn: data.expiresIn,
        } as AuthUser;
      },
    }),
    // Optional OAuth providers (enabled only if env vars are present)
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
        ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
        : []),
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
        ? [
          GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
          }),
        ]
        : []),
  ],
  callbacks: {
    // Prevent redirects to external origins (e.g., backend) — always bring back to frontend base URL.
    async redirect({url, baseUrl}: { url: string; baseUrl: string }) {
      // Always redirect to the frontend origin (NEXTAUTH_URL or computed baseUrl)
      const frontendBase = (process.env.NEXTAUTH_URL || baseUrl).replace(
          /\/$/,
          "",
      );
      try {
        // Normalize incoming url to a URL object using frontendBase as base
        const normalized = new URL(url, `${frontendBase}/`);
        const targetPath =
            normalized.pathname + normalized.search + normalized.hash;
        // Only ever return same-origin URLs
        return `${frontendBase}${targetPath}`;
      } catch {
        return frontendBase;
      }
    },
    async jwt({token, user}: { token: JWT; user?: User | null }) {
      const authToken = token as AuthToken;

      if (user) {
        const authUser = user as AuthUser;
        authToken.accessToken = authUser.accessToken;
        authToken.refreshToken = authUser.refreshToken;
        authToken.expiresIn = authUser.expiresIn;
        authToken.accessTokenIssuedAt = Date.now();
      }

      // Auto-refresh if nearing expiry (within 60s)
      const issuedAt: number = authToken.accessTokenIssuedAt || 0;
      const ttl: number = authToken.expiresIn || 0;
      const expAt = issuedAt + ttl;

      if (Date.now() > expAt - 60000 && authToken.refreshToken) {
        try {
          const res = await fetch(`${BACKEND_URL}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: authToken.refreshToken }),
          });
          if (res.ok) {
            const data = (await safeJson<TokenResponse>(res)) || null;
            if (data && data.accessToken) {
              authToken.accessToken = data.accessToken;
              authToken.refreshToken =
                  data.refreshToken || authToken.refreshToken;
              authToken.expiresIn = data.expiresIn;
              authToken.accessTokenIssuedAt = Date.now();
              try {
                localStorage.setItem("accessToken", data.accessToken);
              } catch {}
              try {
                if (data.refreshToken) {
                  localStorage.setItem("refreshToken", data.refreshToken);
                }
              } catch {}
            }
          }
        } catch (error) {
          console.error("Token refresh failed:", error);
        }
      }

      return authToken;
    },
    async session({session, token}: { session: Session; token: JWT }) {
      const authSession = session as AuthSession;
      const authToken = token as AuthToken;

      authSession.accessToken = authToken.accessToken;
      authSession.refreshToken = authToken.refreshToken;

      return authSession;
    },
  },
};

// In NextAuth v5 with Next.js App Router, export GET/POST handlers directly
export const {
  handlers: {GET, POST},
} = NextAuth(authOptions);
