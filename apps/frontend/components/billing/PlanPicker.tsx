"use client";

import React, {useState} from "react";

import {createCheckout, Plan} from "@/lib/graphql/queries";

export type BillingPlan = "WEEKLY" | "MONTHLY" | "YEARLY" | "LIFETIME";

type PlanCardProps = {
    title: string;
    price: string;
    period?: string;
    features: string[];
    recommended?: boolean;
    onSelect: () => void;
    disabled?: boolean;
};

function PlanCard({
                      title,
                      price,
                      period,
                      features,
                      recommended,
                      onSelect,
                      disabled,
                  }: PlanCardProps) {
    return (
        <div
            className={`rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col ${recommended ? "ring-2 ring-primary/30" : ""}`}
        >
            <div className="flex items-baseline justify-between mb-4">
                <h3 className="text-xl font-semibold">{title}</h3>
                {recommended && (
                    <span className="text-xs px-2 py-1 rounded bg-primary text-primary-foreground">
            Recommended
          </span>
                )}
            </div>
            <div className="mb-4">
                <span className="text-3xl font-bold">{price}</span>
                {period && (
                    <span className="text-muted-foreground ml-1">/{period}</span>
                )}
            </div>
            <ul className="text-sm space-y-2 mb-6">
                {features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                        <span className="mt-1 inline-block size-1.5 rounded-full bg-primary/70"/>
                        <span>{f}</span>
                    </li>
                ))}
            </ul>
            <button
                className="mt-auto inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                onClick={onSelect}
                disabled={disabled}
            >
                {disabled ? "Coming soon" : "Select"}
            </button>
        </div>
    );
}

export default function PlanPicker() {
    const [loadingPlan, setLoadingPlan] = useState<BillingPlan | null>(null);
    const [error, setError] = useState<string>("");

    async function handleSelect(plan: BillingPlan) {
        try {
            setLoadingPlan(plan);
            setError("");
            const origin =
                typeof window !== "undefined" ? window.location.origin : "";

            // Map BillingPlan to Plan
            const planMapping: Record<BillingPlan, Plan> = {
                WEEKLY: "PRO",
                MONTHLY: "PRO",
                YEARLY: "PRO",
                LIFETIME: "PRO",
            };

            const res = await createCheckout({
                plan: planMapping[plan],
                returnUrl: `${origin}/account/subscribe/success`,
                cancelUrl: `${origin}/account/subscribe`,
            });
            const url = res?.createCheckout?.url;
            if (url) {
                window.location.href = url;
            } else {
                throw new Error("No checkout URL returned");
            }
        } catch (e: any) {
            console.warn("Checkout create failed", e);
            setError(e?.message || "Failed to start checkout");
            setLoadingPlan(null);
        }
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Choose your plan</h2>
                <p className="text-muted-foreground">
                    Upgrade to unlock advanced leaderboards, cosmetics, and early access.
                </p>
            </div>
            {error && (
                <div
                    className="rounded-md border border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300 p-3 text-sm">
                    {error}
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <PlanCard
                    title="Weekly"
                    price="$2.99"
                    period="week"
                    features={[
                        "Advanced leaderboards",
                        "Cosmetic themes",
                        "Early access",
                    ]}
                    onSelect={() => handleSelect("WEEKLY")}
                    recommended={false}
                    disabled={loadingPlan !== null}
                />
                <PlanCard
                    title="Monthly"
                    price="$7.99"
                    period="month"
                    features={[
                        "Advanced leaderboards",
                        "Cosmetic themes",
                        "Early access",
                    ]}
                    onSelect={() => handleSelect("MONTHLY")}
                    recommended
                    disabled={loadingPlan !== null}
                />
                <PlanCard
                    title="Yearly"
                    price="$79.99"
                    period="year"
                    features={[
                        "2 months free",
                        "Advanced leaderboards",
                        "Cosmetic themes",
                    ]}
                    onSelect={() => handleSelect("YEARLY")}
                    recommended={false}
                    disabled={loadingPlan !== null}
                />
                <PlanCard
                    title="Lifetime"
                    price="$199"
                    features={["One-time purchase", "All premium features"]}
                    onSelect={() => handleSelect("LIFETIME")}
                    recommended={false}
                    disabled={loadingPlan !== null}
                />
            </div>
            <p className="text-xs text-muted-foreground text-center">
                Prices are placeholders in test mode. Taxes may apply at checkout.
            </p>
        </div>
    );
}
