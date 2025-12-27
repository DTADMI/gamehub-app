"use client";

import React, {useEffect, useState} from "react";

import {BUILTIN_AVATARS, useProfile} from "@/contexts/ProfileContext";

type Settings = {
    music: boolean;
    sfx: boolean;
    particlesDefault: boolean;
    reducedMotion: boolean;
};

const LS_KEY = "gh:settings:v1";

function load(): Settings {
    if (typeof window === "undefined") {
        return {music: true, sfx: true, particlesDefault: false, reducedMotion: false};
    }
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
    const {profile, updateProfile, resetAll} = useProfile();
    const [settings, setSettings] = useState<Settings>(load);
    const [customAvatar, setCustomAvatar] = useState(profile.avatarUrl && !BUILTIN_AVATARS.includes(profile.avatarUrl) ? profile.avatarUrl : "");

    useEffect(() => {
        try {
            localStorage.setItem(LS_KEY, JSON.stringify(settings));
        } catch {
        }
    }, [settings]);

    return (
        <div className="flex flex-col gap-6">
            <div
                className="rounded-lg border border-gray-200 dark:border-gray-700 p-6 bg-white/70 dark:bg-gray-800/70 shadow-sm">
                <h3 className="text-xl font-bold mb-4">Profile</h3>
                <div className="flex flex-col gap-4">
                    <label className="flex flex-col gap-1">
                        <span className="text-sm font-medium">Nickname</span>
                        <input
                            type="text"
                            value={profile.nickname}
                            onChange={(e) => updateProfile({nickname: e.target.value})}
                            className="max-w-xs px-3 py-2 rounded border bg-background"
                            placeholder="Enter your nickname"
                        />
                    </label>

                    <div className="flex flex-col gap-2">
                        <span className="text-sm font-medium">Avatar</span>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {BUILTIN_AVATARS.map((url) => (
                                <button
                                    key={url}
                                    onClick={() => {
                                        updateProfile({avatarUrl: url});
                                        setCustomAvatar("");
                                    }}
                                    className={`w-12 h-12 rounded-full border-2 overflow-hidden bg-muted transition-all ${
                                        profile.avatarUrl === url ? "border-primary scale-110 shadow-md" : "border-transparent hover:border-gray-300"
                                    }`}
                                >
                                    <img src={url} alt="Avatar option" className="w-full h-full object-cover"/>
                                </button>
                            ))}
                        </div>
                        <label className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground">Or custom URL</span>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={customAvatar}
                                    onChange={(e) => {
                                        const url = e.target.value;
                                        setCustomAvatar(url);
                                        if (url.startsWith("http") || url.startsWith("/")) {
                                            updateProfile({avatarUrl: url});
                                        }
                                    }}
                                    className="max-w-xs flex-1 px-3 py-2 rounded border bg-background text-sm"
                                    placeholder="https://..."
                                />
                                {profile.avatarUrl && !BUILTIN_AVATARS.includes(profile.avatarUrl) && (
                                    <div className="w-10 h-10 rounded-full overflow-hidden border bg-muted">
                                        <img src={profile.avatarUrl} alt="Preview"
                                             className="w-full h-full object-cover"/>
                                    </div>
                                )}
                            </div>
                        </label>
                    </div>
                </div>
            </div>

            <div
                className="rounded-lg border border-gray-200 dark:border-gray-700 p-6 bg-white/70 dark:bg-gray-800/70 shadow-sm">
                <h3 className="text-xl font-bold mb-4">Game Preferences</h3>
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
            <div className="flex justify-end mt-4">
                <button
                    onClick={resetAll}
                    className="px-4 py-2 text-sm text-red-600 hover:text-red-700 font-medium"
                >
                    Reset all local data
                </button>
            </div>
        </div>
    );
}
