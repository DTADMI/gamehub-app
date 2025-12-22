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

const DEFAULT_PROFILE: Profile = {nickname: "guest"};
const LS_PROFILE_KEY = "gh:profile:v1";
const LS_STATS_KEY = "gh:stats:v1";

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

export function ProfileProvider({children}: { children: React.ReactNode }) {
    const [profile, setProfile] = useState<Profile>(() => {
        if (typeof window === "undefined") return DEFAULT_PROFILE;
        try {
            const raw = localStorage.getItem(LS_PROFILE_KEY);
            return raw ? {...DEFAULT_PROFILE, ...JSON.parse(raw)} : DEFAULT_PROFILE;
        } catch {
            return DEFAULT_PROFILE;
        }
    });
    const [stats, setStats] = useState<StatsMap>(() => {
        if (typeof window === "undefined") return {};
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
            const curr = next[game] || {};
            next[game] = {...curr, ...patch};
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
    if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
    return ctx;
}
