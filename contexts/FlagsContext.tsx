"use client";

import React, {createContext, useContext, useEffect, useMemo, useState} from "react";

type Flags = {
    sdBodEnabled: boolean;
    sdBodBreath: boolean;
    sdBodFuel: boolean;
    sdBodMove: boolean;
    sdBodSignal: boolean;
    sdBodGrow: boolean;
  // Admin/UI seam: allow Upcoming games to be playable locally without rebuilds
  ui?: {
    allowPlayUpcomingLocal?: boolean;
  };
};

const DEFAULT_FLAGS: Flags = {
    sdBodEnabled: true,
    sdBodBreath: true,
    sdBodFuel: true,
    sdBodMove: true,
    sdBodSignal: true,
    sdBodGrow: true,
  ui: {allowPlayUpcomingLocal: false},
};

const STORAGE_KEY = "gh:flags:v1";

type FlagsContextValue = {
    flags: Flags;
    setFlag: <K extends keyof Flags>(key: K, value: Flags[K]) => void;
    reset: () => void;
};

const FlagsContext = createContext<FlagsContextValue | null>(null);

export function FlagsProvider({children}: { children: React.ReactNode }) {
    const [flags, setFlags] = useState<Flags>(DEFAULT_FLAGS);

    // load
    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                setFlags({...DEFAULT_FLAGS, ...parsed});
            }
        } catch {
        }
    }, []);

    // persist
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(flags));
        } catch {
        }
    }, [flags]);

    const value = useMemo<FlagsContextValue>(() => ({
        flags,
        setFlag: (key, value) => setFlags(prev => ({...prev, [key]: value} as Flags)),
        reset: () => setFlags(DEFAULT_FLAGS),
    }), [flags]);

    return <FlagsContext.Provider value={value}>{children}</FlagsContext.Provider>;
}

export function useFlags() {
    const ctx = useContext(FlagsContext);
    if (!ctx) throw new Error("useFlags must be used within FlagsProvider");
    return ctx;
}

export default FlagsProvider;
