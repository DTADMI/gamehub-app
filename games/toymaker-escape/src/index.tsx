"use client";
import React from "react";

export function ToymakerEscapeGame() {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-center p-6">
            <h1 className="text-3xl font-semibold">Toymaker Escape</h1>
            <p className="max-w-prose opacity-80">
                Episodic escape mystery with environmental puzzles. See
                <code className="mx-1">docs/toymaker-escape/</code> for design drafts.
            </p>
            <p className="text-sm opacity-60">Status: Upcoming • Prototype scaffolding only</p>
        </div>
    );
}

export default ToymakerEscapeGame;
