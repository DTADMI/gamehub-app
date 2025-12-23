import {describe, expect, it} from 'vitest';
import {createGearsState, evaluateGears, setGearsTeeth} from '@games/shared/pointclick/puzzles/gears';

describe('gears tolerance edge cases', () => {
    it('solves when ratio within tolerance, fails just outside', () => {
        // Target 1/3, tolerance 1e-3
        let s = createGearsState(
            [
                {id: 'in', teeth: 30},
                {id: 'out', teeth: 90},
            ],
            [{a: 'in', b: 'out'}],
            'in',
            'out',
            1 / 3,
            1e-3,
        );
        expect(s.solved).toBe(true);

        // Nudge teeth to move ratio outside tolerance
        s = setGearsTeeth(s, 'out', 89); // ratio ≈ 30/89 ≈ 0.3371...
        s = evaluateGears(s);
        expect(s.solved).toBe(false);
    });

    it('handles multiple idlers without breaking tolerance evaluation', () => {
        let s = createGearsState(
            [
                {id: 'in', teeth: 20},
                {id: 'idle1', teeth: 40},
                {id: 'idle2', teeth: 30},
                {id: 'out', teeth: 60},
            ],
            [
                {a: 'in', b: 'idle1'},
                {a: 'idle1', b: 'idle2'},
                {a: 'idle2', b: 'out'},
            ],
            'in',
            'out',
            1 / 3,
            1e-3,
        );
        expect(s.solved).toBe(true);
    });
});
