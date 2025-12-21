"use client";
import React from "react";

export function RiteOfDiscoveryGame() {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-center p-6">
            <h1 className="text-3xl font-semibold">Rite of Discovery</h1>
            <p className="max-w-prose opacity-80">
                This point‑and‑click adventure is coming soon. Follow progress in
                <code className="mx-1">docs/rite-of-discovery-design.md</code> and the stories tracker.
            </p>
            <p className="text-sm opacity-60">Status: Upcoming • Prototype scaffolding only</p>
        </div>
    );
}

export default RiteOfDiscoveryGame;
