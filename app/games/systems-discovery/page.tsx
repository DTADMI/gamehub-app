"use client";
import dynamic from "next/dynamic";
import React from "react";

const SystemsDiscovery = dynamic(
    () => import("@games/systems-discovery").then((m) => m.SystemsDiscoveryGame),
    {ssr: false, loading: () => <div className="p-8">Loading…</div>},
);

export default function SystemsDiscoveryPage() {
    return <SystemsDiscovery/>;
}
