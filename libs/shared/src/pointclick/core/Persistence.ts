// Versioned localStorage helpers for per-title saves

export type VersionedPayload<T> = { v: number; data: T };

export type MigrationMap<T> = {
    // from version -> migration function producing the next version's data
    [fromVersion: number]: (oldData: any) => T;
};

export function versionedSave<T>(key: string, v: number, data: T) {
    const payload: VersionedPayload<T> = {v, data};
    try {
        localStorage.setItem(key, JSON.stringify(payload));
        return true;
    } catch (e) {
        console.error('[Persistence] save failed', e);
        return false;
    }
}

export function versionedLoad<T>(key: string): VersionedPayload<T> | null {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (typeof parsed?.v !== 'number' || !('data' in parsed)) return null;
        return parsed as VersionedPayload<T>;
    } catch (e) {
        console.warn('[Persistence] load parse failed; clearing key', key, e);
        try {
            localStorage.removeItem(key);
        } catch {
        }
        return null;
    }
}

// Apply migrations to reach target version; returns data at target version or null
export function loadWithMigrations<T>(
    key: string,
    targetVersion: number,
    migrations: MigrationMap<T> = {}
): T | null {
    const payload = versionedLoad<T>(key);
    if (!payload) return null;
    let {v, data} = payload as any as { v: number; data: any };
    if (v === targetVersion) return data as T;
    // Forward-only migrations: apply step by step up to target
    while (v < targetVersion) {
        const migrate = migrations[v];
        if (!migrate) {
            console.warn('[Persistence] missing migration for version', v, '->', v + 1);
            break;
        }
        data = migrate(data);
        v += 1;
    }
    if (v !== targetVersion) return null;
    // Persist upgraded data
    versionedSave<T>(key, targetVersion, data as T);
    return data as T;
}

export const SAVE_KEYS = {
    rod: 'rod:save:v1',
    tme: 'tme:save:v1',
    sysdisc: 'sysdisc:save:v1',
    settings: 'gh:settings:v1',
} as const;

export type GlobalSettings = {
    language: 'en' | 'fr';
    reducedMotion: boolean;
    volume: number;
};

export const DEFAULT_SETTINGS: GlobalSettings = {
    language: 'en',
    reducedMotion: false,
    volume: 0.8,
};

export function saveSettings(settings: GlobalSettings) {
    return versionedSave(SAVE_KEYS.settings, 1, settings);
}

export function loadSettings(): GlobalSettings {
    const data = loadWithMigrations<GlobalSettings>(SAVE_KEYS.settings, 1, {
        // v0 -> v1 example stub
        0: (old: any) => ({...DEFAULT_SETTINGS, ...old}),
    });
    return data || DEFAULT_SETTINGS;
}
