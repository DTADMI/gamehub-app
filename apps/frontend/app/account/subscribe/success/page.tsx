"use client";

// This page depends on runtime session/subscription state and must not be
// statically prerendered. Mark as dynamic to avoid SSG/Prerender errors when
// hooks read SubscriptionContext during build.
export const dynamic = "force-dynamic";

import Link from "next/link";
import React, {useEffect} from "react";

import {useSubscription} from "@/contexts/SubscriptionContext";

export default function SubscribeSuccessPage() {
    const {refresh} = useSubscription();
    useEffect(() => {
        // Refresh entitlements after returning from checkout
        refresh().catch(() => {
        });
    }, [refresh]);

    return (
        <div className="container mx-auto px-4 py-10">
            <div className="max-w-xl mx-auto text-center space-y-4">
                <h1 className="text-2xl font-bold">Thanks for upgrading!</h1>
                <p className="text-muted-foreground">
                    Your subscription status has been updated. Advanced leaderboards and
                    premium features are now unlocked.
                </p>
                <div className="flex items-center justify-center gap-3">
                    <Link
                        href="/leaderboard"
                        className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm"
                    >
                        View Leaderboards
                    </Link>
                    <Link href="/games" className="rounded-md border px-4 py-2 text-sm">
                        Browse Games
                    </Link>
                </div>
            </div>
        </div>
    );
}
