"use client";
import dynamic from "next/dynamic";
import React from "react";

const RiteOfDiscovery = dynamic(
    () => import("@games/rite-of-discovery").then((m) => m.RiteOfDiscoveryGame),
    {ssr: false, loading: () => <div className="p-8">Loading…</div>},
);

export default function RiteOfDiscoveryPage() {
    return <RiteOfDiscovery/>;
}
