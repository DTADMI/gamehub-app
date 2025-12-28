"use client";

import Link from "next/link";
import React from "react";

import PlanPicker from "@/components/billing/PlanPicker";
import {useAuth} from "@/contexts/AuthContext";

export default function SubscribePage() {
    const {user} = useAuth();
    return (
        <div className="container mx-auto px-4 py-10">
            <div className="max-w-5xl mx-auto space-y-8">
                <header className="text-center space-y-2">
                    <h1 className="text-3xl font-bold">Upgrade to GameHub Pro</h1>
                    <p className="text-muted-foreground text-balance">
                        Unlock advanced leaderboards, premium themes, and early access to
                        new games.
                    </p>
                </header>
                {!user && (
                    <div
                        className="rounded-md border border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200 p-3 text-sm">
                        You need to be signed in to subscribe.{" "}
                        <Link
                            className="underline"
                            href="/login?callbackUrl=/account/subscribe"
                        >
                            Sign in
                        </Link>
                    </div>
                )}
                <PlanPicker/>
                <footer className="text-xs text-muted-foreground text-center">
                    Payments are powered by Stripe in test mode. No real charges will be
                    made.
                </footer>
            </div>
        </div>
    );
}
