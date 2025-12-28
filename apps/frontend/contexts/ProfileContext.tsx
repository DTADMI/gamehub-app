"use client";

import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from "react";

export type Profile = {
    nickname: string;
    avatarUrl?: string;
};

export type GameStat = {
    highScore?: number;
    lastScore?: number;
    sessions?: number;
    bestTimeMs?: number;
};

type StatsMap = Record<string, GameStat>; // key: game slug

type ProfileContextValue = {
    profile: Profile;
    updateProfile: (p: Partial<Profile>) => void;
    stats: StatsMap;
    updateStat: (game: string, patch: Partial<GameStat>) => void;
    resetAll: () => void;
};

const DEFAULT_PROFILE: Profile = {nickname: "guest", avatarUrl: "/assets/avatars/default.svg"};
const LS_PROFILE_KEY = "gh:profile:v1";
const LS_STATS_KEY = "gh:stats:v1";

export const BUILTIN_AVATARS = [
    "/assets/avatars/avatar1.svg",
    "/assets/avatars/avatar2.svg",
    "/assets/avatars/avatar3.svg",
    "/assets/avatars/avatar4.svg",
    "/assets/avatars/avatar5.svg",
    "/assets/avatars/avatar6.svg",
    "/assets/avatars/avatar7.svg",
    "/assets/avatars/avatar8.svg",
];

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

export function ProfileProvider({children}: { children: React.ReactNode }) {
    const [profile, setProfile] = useState<Profile>(() => {
        if (typeof window === "undefined") {
            return DEFAULT_PROFILE;
        }
        try {
            const raw = localStorage.getItem(LS_PROFILE_KEY);
            return raw ? {...DEFAULT_PROFILE, ...JSON.parse(raw)} : DEFAULT_PROFILE;
        } catch {
            return DEFAULT_PROFILE;
        }
    });
    const [stats, setStats] = useState<StatsMap>(() => {
        if (typeof window === "undefined") {
            return {};
        }
        try {
            const raw = localStorage.getItem(LS_STATS_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch {
            return {};
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(LS_PROFILE_KEY, JSON.stringify(profile));
        } catch {
        }
    }, [profile]);

    useEffect(() => {
        try {
            localStorage.setItem(LS_STATS_KEY, JSON.stringify(stats));
        } catch {
        }
    }, [stats]);

    const updateProfile = useCallback((p: Partial<Profile>) => {
        setProfile((prev) => ({...prev, ...p}));
    }, []);

    const updateStat = useCallback((game: string, patch: Partial<GameStat>) => {
        setStats((prev) => {
            const next: StatsMap = {...prev};
            const curr = next[game] || {sessions: 0, highScore: 0};

            const sessions = patch.sessions !== undefined
                ? (curr.sessions || 0) + patch.sessions
                : curr.sessions;

            const highScore = patch.lastScore !== undefined
                ? Math.max(curr.highScore || 0, patch.lastScore)
                : curr.highScore;

            next[game] = {
                ...curr,
                ...patch,
                sessions,
                highScore,
            };
            return next;
        });
    }, []);

    const resetAll = useCallback(() => {
        setProfile(DEFAULT_PROFILE);
        setStats({});
    }, []);

    const value = useMemo(
        () => ({profile, updateProfile, stats, updateStat, resetAll}),
        [profile, stats, updateProfile, updateStat, resetAll],
    );

    return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
    const ctx = useContext(ProfileContext);
    if (!ctx) {
        throw new Error("useProfile must be used within ProfileProvider");
    }
    return ctx;
}
