"use client";
import dynamic from "next/dynamic";
import React from "react";

const ToymakerEscape = dynamic(
    () => import("@games/toymaker-escape").then((m) => m.ToymakerEscapeGame),
    {ssr: false, loading: () => <div className="p-8">Loading…</div>},
);

export default function ToymakerEscapePage() {
    return <ToymakerEscape/>;
}
