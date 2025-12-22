import {beforeEach, describe, expect, it} from 'vitest';
import {loadWithMigrations, SAVE_KEYS, versionedLoad, versionedSave} from '@games/shared/pointclick/core/Persistence';

// jsdom provides localStorage

describe('Persistence — versioned saves', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('saves and loads versioned payloads', () => {
        const ok = versionedSave(SAVE_KEYS.tme, 1, {s: 'hello'});
        expect(ok).toBe(true);
        const payload = versionedLoad<typeof data>(SAVE_KEYS.tme);
        // TS helper
        type data = { s: string };
        expect(payload?.v).toBe(1);
        expect((payload?.data as any).s).toBe('hello');
    });

    it('migrates forward to target version and persists it', () => {
        // Seed v0 payload
        localStorage.setItem(SAVE_KEYS.rod, JSON.stringify({v: 0, data: {score: '1'}}));
        const migrated = loadWithMigrations<{ score: number }>(SAVE_KEYS.rod, 1, {
            0: (old) => ({score: parseInt(old.score, 10) || 0}),
        });
        expect(migrated).toEqual({score: 0});
        const stored = JSON.parse(localStorage.getItem(SAVE_KEYS.rod) || '{}');
        expect(stored.v).toBe(1);
        expect(stored.data).toEqual({score: 0});
    });

    it('returns null if migration path is missing', () => {
        localStorage.setItem(SAVE_KEYS.sysdisc, JSON.stringify({v: 0, data: {ok: true}}));
        const migrated = loadWithMigrations(SAVE_KEYS.sysdisc, 2, {1: (old) => old});
        expect(migrated).toBeNull();
    });
});
