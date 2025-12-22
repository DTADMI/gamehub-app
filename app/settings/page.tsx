"use client";

import React from "react";
import dynamic from "next/dynamic";

const SettingsPanel = dynamic(() => import("@/components/SettingsPanel"), {
    ssr: false,
});

export default function SettingsPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Settings</h1>
            <p className="text-muted-foreground mb-4">
                Personalize your experience. These preferences are stored only on this device.
            </p>
            <SettingsPanel/>
        </div>
    );
}
