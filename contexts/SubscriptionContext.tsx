"use client";

import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from "react";
import {useAuth} from "@/contexts/AuthContext";
import {gqlFetch} from "@/lib/graphql/client";

export type Plan = "FREE" | "WEEKLY" | "MONTHLY" | "YEARLY" | "LIFETIME";

type Subscription = {
    id: string;
    plan: Plan;
    status: string; // active, past_due, canceled
    currentPeriodEnd?: string;
};

type Entitlements = {
    advancedLeaderboards: boolean;
    cosmetics: boolean;
    earlyAccess: boolean;
};

interface SubscriptionContextType {
    loading: boolean;
    subscription: Subscription | null;
    entitlements: Entitlements;
    refresh: () => Promise<void>;
}

const defaultEntitlements: Entitlements = {
    advancedLeaderboards: false,
    cosmetics: false,
    earlyAccess: false,
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({children}: { children: React.ReactNode }) {
    const {user} = useAuth();
    const [loading, setLoading] = useState(false);
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [entitlements, setEntitlements] = useState<Entitlements>(defaultEntitlements);

    const fetchViewerSubscription = useCallback(async () => {
        if (!user) {
            setSubscription(null);
            setEntitlements(defaultEntitlements);
            return;
        }
        setLoading(true);
        try {
            // Temporary GraphQL query until backend exposes viewer.subscription/premium
            const data = await gqlFetch<{ userStats: { totalGames: number } }>({
                // noop query to verify connectivity; replace with viewerSubscription when available
                query: `query Ping($gameType: String!) { userStats(userId: "me", gameType: $gameType) { totalGames } }`,
                variables: {gameType: "snake"},
            }).catch(() => ({userStats: {totalGames: 0}} as any));

            // For now, derive FREE plan; to be replaced by real viewer.subscription
            const derived: Subscription = {
                id: user.uid,
                plan: "FREE",
                status: "active",
            };
            setSubscription(derived);
            setEntitlements({
                advancedLeaderboards: derived.plan !== "FREE",
                cosmetics: derived.plan !== "FREE",
                earlyAccess: derived.plan !== "FREE",
            });
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchViewerSubscription().catch(console.error);
    }, [fetchViewerSubscription]);

    const value = useMemo<SubscriptionContextType>(() => ({
        loading,
        subscription,
        entitlements,
        refresh: fetchViewerSubscription,
    }), [loading, subscription, entitlements, fetchViewerSubscription]);

    return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}

export function useSubscription() {
    const ctx = useContext(SubscriptionContext);
    if (!ctx) throw new Error("useSubscription must be used within SubscriptionProvider");
    return ctx;
}
