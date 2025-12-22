"use client";
import React from "react";

type Size = "sm" | "md" | "lg";

export function HomeostasisMeter({
                                     value,
                                     ariaLabel,
                                     size = "md",
                                 }: {
    value: number;
    ariaLabel?: string;
    size?: Size;
}) {
    const clamped = Math.max(0, Math.min(100, Math.round(value)));
    const height = size === "sm" ? 10 : size === "lg" ? 20 : 14;

    return (
        <div className="w-full max-w-md">
            <div
                role="meter"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={clamped}
                aria-label={ariaLabel || "Homeostasis meter"}
                className="relative w-full rounded overflow-hidden border"
                style={{height}}
            >
                {/* Steady band background (45–65) with pattern for color‑blind safety */}
                <div
                    aria-hidden
                    className="absolute inset-0"
                    style={{
                        background:
                            "linear-gradient(90deg, transparent 45%, rgba(255,255,255,0.25) 45%, rgba(255,255,255,0.25) 65%, transparent 65%)",
                    }}
                />
                {/* Fill indicator */}
                <div
                    aria-hidden
                    className="h-full bg-primary/70"
                    style={{width: `${clamped}%`}}
                />
            </div>
            <div className="flex justify-between mt-1 text-[11px] text-muted-foreground">
                <span>0</span>
                <span>45</span>
                <span>65</span>
                <span>100</span>
            </div>
            <div className="sr-only" aria-live="polite">
                {clamped < 45 ? "Low" : clamped > 65 ? "High" : "Steady"}
            </div>
        </div>
    );
}

export default HomeostasisMeter;
