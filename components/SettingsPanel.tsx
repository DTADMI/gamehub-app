"use client";

import React, {useEffect, useState} from "react";

type Settings = {
    music: boolean;
    sfx: boolean;
    particlesDefault: boolean;
    reducedMotion: boolean;
};

const LS_KEY = "gh:settings:v1";

function load(): Settings {
    if (typeof window === "undefined")
        return {music: true, sfx: true, particlesDefault: false, reducedMotion: false};
    try {
        const raw = localStorage.getItem(LS_KEY);
        return raw
            ? {...{music: true, sfx: true, particlesDefault: false, reducedMotion: false}, ...JSON.parse(raw)}
            : {music: true, sfx: true, particlesDefault: false, reducedMotion: false};
    } catch {
        return {music: true, sfx: true, particlesDefault: false, reducedMotion: false};
    }
}

export default function SettingsPanel() {
    const [settings, setSettings] = useState<Settings>(load);

    useEffect(() => {
        try {
            localStorage.setItem(LS_KEY, JSON.stringify(settings));
        } catch {
        }
    }, [settings]);

    return (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white/70 dark:bg-gray-800/70">
            <h3 className="font-semibold mb-2">Settings</h3>
            <div className="flex flex-col gap-3">
                <label className="inline-flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={settings.music}
                        onChange={(e) => setSettings((s) => ({...s, music: e.currentTarget.checked}))}
                    />
                    Music
                </label>
                <label className="inline-flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={settings.sfx}
                        onChange={(e) => setSettings((s) => ({...s, sfx: e.currentTarget.checked}))}
                    />
                    Sound effects
                </label>
                <label className="inline-flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={settings.particlesDefault}
                        onChange={(e) => setSettings((s) => ({...s, particlesDefault: e.currentTarget.checked}))}
                    />
                    Default particles on (where available)
                </label>
                <label className="inline-flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={settings.reducedMotion}
                        onChange={(e) => setSettings((s) => ({...s, reducedMotion: e.currentTarget.checked}))}
                    />
                    Reduced motion
                </label>
            </div>
        </div>
    );
}
