import {describe, expect, it} from 'vitest';
import {initI18n, setLocale, t} from '@/lib/i18n';

describe('i18n', () => {
    it('returns EN by default and switches to FR', () => {
        initI18n('en');
        expect(t('tme.e1.keypad.clear')).toBe('Clear');
        setLocale('fr');
        expect(t('tme.e1.keypad.clear')).toBe('Effacer');
    });

    it('falls back to key when missing', () => {
        initI18n('en');
        expect(t('non.existent.key')).toBe('non.existent.key');
    });
});
