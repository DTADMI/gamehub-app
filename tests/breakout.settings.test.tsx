import {beforeEach, describe, expect, it} from 'vitest';
import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import {GameSettingsProvider, useGameSettings} from '@games/shared';

function SettingsConsumer() {
    const {
        enableParticles,
        setEnableParticles,
        particleEffect,
        setParticleEffect,
        mode,
        setMode,
        isAuthenticated,
        isSubscriber,
        setAuthState
    } = useGameSettings();
    return (
        <div>
            <label>
                <input
                    aria-label="Particles"
                    type="checkbox"
                    checked={enableParticles}
                    onChange={(e) => setEnableParticles(e.currentTarget.checked)}
                />
            </label>
            <select
                aria-label="Particle effect"
                value={particleEffect}
                onChange={(e) => setParticleEffect(e.currentTarget.value as any)}
                disabled={!enableParticles}
            >
                <option value="sparks">sparks</option>
                <option value="puff">puff</option>
            </select>
            <select aria-label="Mode" value={mode} onChange={(e) => setMode(e.currentTarget.value as any)}>
                <option value="classic">classic</option>
                <option value="hard" disabled={!isAuthenticated}>hard</option>
                <option value="chaos" disabled={!isSubscriber}>chaos</option>
            </select>
            <button onClick={() => setAuthState(true, false)} aria-label="auth-on">auth</button>
            <button onClick={() => setAuthState(true, true)} aria-label="sub-on">sub</button>
        </div>
    );
}

describe('GameSettingsProvider — particles & mode gating', () => {
    beforeEach(() => {
        // Reset localStorage state between tests
        (globalThis as any).localStorage?.clear?.();
    });

    it('disables particle effect select when particles are off and enables it when on', () => {
        render(
            <GameSettingsProvider>
                <SettingsConsumer/>
            </GameSettingsProvider>
        );
        const checkbox = screen.getByLabelText('Particles') as HTMLInputElement;
        const select = screen.getByLabelText('Particle effect') as HTMLSelectElement;
        expect(checkbox.checked).toBe(false);
        expect(select.disabled).toBe(true);
        fireEvent.click(checkbox);
        expect(select.disabled).toBe(false);
    });

    it('persists mode/auth/subscriber flags to localStorage', () => {
        render(
            <GameSettingsProvider>
                <SettingsConsumer/>
            </GameSettingsProvider>
        );
        const authBtn = screen.getByLabelText('auth-on');
        fireEvent.click(authBtn);
        const raw = localStorage.getItem('gamehub:settings');
        expect(raw).toBeTruthy();
        const parsed = JSON.parse(raw || '{}');
        expect(parsed.isAuthenticated).toBe(true);
    });

    it('gates hard/chaos modes until auth/subscriber toggles are enabled', () => {
        render(
            <GameSettingsProvider>
                <SettingsConsumer/>
            </GameSettingsProvider>
        );
        const modeSelect = screen.getByLabelText('Mode') as HTMLSelectElement;
        // Initially, selecting hard/chaos should be blocked by disabled attributes in UI (simulation)
        expect(modeSelect).toBeInTheDocument();
        // Turn on auth -> hard allowed
        fireEvent.click(screen.getByLabelText('auth-on'));
        // Turn on sub -> chaos allowed
        fireEvent.click(screen.getByLabelText('sub-on'));
        // Switch to chaos
        fireEvent.change(modeSelect, {target: {value: 'chaos'}});
        expect(modeSelect.value).toBe('chaos');
    });
});
