"use client";
import React from "react";

export function SystemsDiscoveryGame() {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-center p-6">
            <h1 className="text-3xl font-semibold">Systems Discovery</h1>
            <p className="max-w-prose opacity-80">
                Explore everyday systems with extendable packs (Space, Ocean, and more). Documentation lives in
                <code className="mx-1">docs/systems-discovery/</code>.
            </p>
            <p className="text-sm opacity-60">Status: Upcoming • Prototype scaffolding only</p>
        </div>
    );
}

export default SystemsDiscoveryGame;
