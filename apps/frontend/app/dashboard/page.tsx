"use client";

import Link from "next/link";

export default function DashboardGate() {
    // This page exists primarily to exercise middleware-based redirects in E2E.
    // When not redirected (e.g., in E2E public mode), show a simple stub.
    return (
        <main className="min-h-screen flex items-center justify-center p-8">
            <div
                className="max-w-md w-full rounded-xl border p-6 bg-white/70 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800">
                <h1 className="text-xl font-semibold mb-2">Dashboard</h1>
                <p className="text-sm text-muted-foreground mb-4">
                    This is a protected area. In production you should be redirected to
                    Login.
                </p>
                <p className="text-sm">
                    Go to{" "}
                    <Link className="underline" href="/login">
                        Login
                    </Link>{" "}
                    or{" "}
                    <Link className="underline" href="/">
                        Home
                    </Link>
                    .
                </p>
            </div>
        </main>
    );
}
