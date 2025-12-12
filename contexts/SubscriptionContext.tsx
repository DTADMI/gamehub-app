"use client";

import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from "react";
import {useAuth} from "@/contexts/AuthContext";
import {fetchViewer, type Plan} from "@/lib/graphql/queries";

type Subscription = {
    id: string;
    plan: Plan; // FREE | PRO
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
            const data = await fetchViewer();
            const v = data.viewer;
            if (v && v.subscription) {
                setSubscription({
                    id: v.subscription.id,
                    plan: v.subscription.plan,
                    status: v.subscription.status,
                    currentPeriodEnd: v.subscription.currentPeriodEnd,
                });
            } else {
                setSubscription(null);
            }
            setEntitlements(v?.premium ?? defaultEntitlements);
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
