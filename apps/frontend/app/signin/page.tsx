"use client";

import Link from "next/link";
import {useRouter} from "next/navigation";
import {signIn} from "next-auth/react";
import {useMemo, useState} from "react";

function useCallbackUrl() {
    if (typeof window === "undefined") {
        return "/";
    }
    try {
        const url = new URL(window.location.href);
        return (
            url.searchParams.get("callbackUrl") || url.searchParams.get("next") || "/"
        );
    } catch {
        return "/";
    }
}

export default function SignInPage() {
    const router = useRouter();
    const [tab, setTab] = useState<"signin" | "signup">("signin");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const callbackUrl = useCallbackUrl();

    const API_BASE = useMemo(() => {
        const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
        return base.replace(/\/$/, "");
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            if (tab === "signup") {
                // Create account on backend then sign in
                const res = await fetch(`${API_BASE}/auth/signup`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify({email, password}),
                });
                if (!res.ok) {
                    const msg = await res.text().catch(() => "Sign up failed");
                    throw new Error(msg || "Sign up failed");
                }
            }
            // Use redirect: false so we can inspect the result object (NextAuth returns void when redirect: true)
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
                callbackUrl,
            });
            if (result?.error) {
                throw new Error(result.error);
            }
            // When ok, NextAuth returns a url to navigate to; otherwise push our callbackUrl
            if (result?.ok) {
                if (result.url) {
                    // Use full navigation to preserve NextAuth cookies
                    window.location.href = result.url;
                    return;
                }
                router.push(callbackUrl || "/");
                return;
            }
        } catch (err: any) {
            setError(err?.message || "Authentication failed");
        }
        setLoading(false);
    }

    function provider(provider: "google" | "github") {
        signIn(provider, {callbackUrl});
    }

    return (
        <div className="min-h-[70svh] grid grid-cols-1 md:grid-cols-5">
            {/* Side panel */}
            <div className="hidden md:block md:col-span-2 p-8">
                <div className="h-full rounded-xl bg-gradient-to-b from-primary/15 to-accent/15 backdrop-blur-sm">
                    <div className="h-full flex flex-col justify-end">
                        <h2 className="text-2xl font-bold mb-2">Welcome to GameHub</h2>
                        <p className="text-sm text-muted-foreground">
                            Play web games, track progress, and compete on leaderboards.
                        </p>
                    </div>
                </div>
            </div>

            {/* Auth card */}
            <div className="md:col-span-3 flex items-center justify-center p-6">
                <div className="w-full max-w-md rounded-xl shadow p-6 bg-card/90 backdrop-blur-sm text-card-foreground">
                    <div className="flex gap-4 mb-4">
                        <button
                            className={`flex-1 py-2 rounded-md text-sm font-medium ${
                                tab === "signin"
                                    ? "bg-primary text-white"
                                    : "bg-gray-100 dark:bg-gray-800"
                            }`}
                            onClick={() => setTab("signin")}
                            aria-pressed={tab === "signin"}
                        >
                            Sign In
                        </button>
                        <button
                            className={`flex-1 py-2 rounded-md text-sm font-medium ${
                                tab === "signup"
                                    ? "bg-primary text-white"
                                    : "bg-gray-100 dark:bg-gray-800"
                            }`}
                            onClick={() => setTab("signup")}
                            aria-pressed={tab === "signup"}
                        >
                            Sign Up
                        </button>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => provider("google")}
                            className="w-full h-10 rounded-md border border-input bg-background text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                            Continue with Google
                        </button>
                        <button
                            onClick={() => provider("github")}
                            className="w-full h-10 rounded-md border border-input bg-background text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                            Continue with GitHub
                        </button>
                    </div>

                    <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="h-px flex-1 bg-border"/>
                        <span>or with email</span>
                        <div className="h-px flex-1 bg-border"/>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div>
                            <label className="block text-sm mb-1" htmlFor="email">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full h-10 rounded-md border border-input bg-background px-3"
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-1" htmlFor="password">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                autoComplete={
                                    tab === "signin" ? "current-password" : "new-password"
                                }
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full h-10 rounded-md border border-input bg-background px-3"
                            />
                        </div>
                        {error && (
                            <div className="text-sm text-red-600" role="alert">
                                {error}
                            </div>
                        )}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-10 rounded-md bg-primary text-white hover:bg-primary/90 disabled:opacity-60"
                        >
                            {loading
                                ? "Please wait…"
                                : tab === "signin"
                                    ? "Sign In"
                                    : "Create account"}
                        </button>
                    </form>

                    <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                        <Link href="#" className="underline underline-offset-2">
                            Forgot password
                        </Link>
                        <span>
              By continuing you agree to our{" "}
                            <Link href="/terms" className="underline underline-offset-2">
                Terms
              </Link>{" "}
                            and{" "}
                            <Link href="/privacy" className="underline underline-offset-2">
                Privacy
              </Link>
              .
            </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
