import {describe, expect, it} from 'vitest';
import {
    clearWiresConnections,
    createWiresState,
    hasWiresCrossing,
    setWiresConnection
} from '@games/shared/pointclick/puzzles/wires';

describe('wires negative/crossing cases', () => {
    it('detects a crossing when right indices decrease', () => {
        const goal = {red: [{from: 'A1', to: 'B2'}], blue: [{from: 'A2', to: 'B1'}]} as const;
        let s = createWiresState(['A1', 'A2'], ['B1', 'B2'], goal);
        s = setWiresConnection(s, 'A1', 'B2', 'red');
        s = setWiresConnection(s, 'A2', 'B1', 'blue');
        expect(hasWiresCrossing(s)).toBe(true);
    });

    it('unordered but correct goal connections still solve', () => {
        const goal = {red: [{from: 'A1', to: 'B2'}], blue: [{from: 'A2', to: 'B1'}]} as const;
        let s = createWiresState(['A1', 'A2'], ['B1', 'B2'], goal);
        // Connect in reverse order vs left indices
        s = setWiresConnection(s, 'A2', 'B1', 'blue');
        s = setWiresConnection(s, 'A1', 'B2', 'red');
        expect(s.solved).toBe(true);
    });

    it('clear resets solved state and removes connections', () => {
        const goal = {red: [{from: 'A1', to: 'B1'}]} as const;
        let s = createWiresState(['A1'], ['B1'], goal);
        s = setWiresConnection(s, 'A1', 'B1', 'red');
        expect(s.solved).toBe(true);
        s = clearWiresConnections(s);
        expect(s.solved).toBe(false);
        expect(s.connections.length).toBe(0);
    });
});
