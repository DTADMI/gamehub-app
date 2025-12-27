// libs/shared/src/pointclick/puzzles/wires.ts
// Pure logic for a simple wires/connectors puzzle.

export type WireColor = "red" | "green" | "blue" | "yellow" | "purple" | string;

export type TerminalId = string; // e.g., A1, A2 (left bank) and B1, B2 (right bank)

export type WireConnection = {
    from: TerminalId;
    to: TerminalId;
    color: WireColor;
};

export type WiresGoal = Record<WireColor, { from: TerminalId; to: TerminalId }[]>;

export type WiresState = {
    terminalsLeft: TerminalId[];
    terminalsRight: TerminalId[];
    connections: WireConnection[];
    goal: WiresGoal;
    solved: boolean;
};

export function createWiresState(
    terminalsLeft: TerminalId[],
    terminalsRight: TerminalId[],
    goal: WiresGoal,
): WiresState {
    return {
        terminalsLeft: [...terminalsLeft],
        terminalsRight: [...terminalsRight],
        connections: [],
        goal,
        solved: false,
    };
}

export function setWiresConnection(
    state: WiresState,
    from: TerminalId,
    to: TerminalId,
    color: WireColor,
): WiresState {
    // Remove any previous connection that uses either endpoint
    const filtered = state.connections.filter(
        (c) => c.from !== from && c.to !== to,
    );
    const next: WiresState = {
        ...state,
        connections: [...filtered, {from, to, color}],
    };
    return evaluateSolved(next);
}

export function removeConnection(
    state: WiresState,
    endpoint: TerminalId,
): WiresState {
    return evaluateSolved({
        ...state,
        connections: state.connections.filter((c) => c.from !== endpoint && c.to !== endpoint),
    });
}

export function clearWiresConnections(state: WiresState): WiresState {
    return {...state, connections: [], solved: false};
}

export function evaluateSolved(state: WiresState): WiresState {
    // Consider solved when for every color, all required pairs exist in any order
    for (const [color, pairs] of Object.entries(state.goal)) {
        for (const pair of pairs) {
            const ok = state.connections.some(
                (c) => c.color === color && c.from === pair.from && c.to === pair.to,
            );
            if (!ok) {
                return {...state, solved: false};
            }
        }
    }
    return {...state, solved: true};
}

export function hasWiresCrossing(state: WiresState): boolean {
    // Optional helper: check if any two connections cross assuming ordered banks
    // We map left terminals to an index and right terminals to an index, then detect inversions.
    const leftIndex = new Map<string, number>();
    state.terminalsLeft.forEach((t, i) => leftIndex.set(t, i));
    const rightIndex = new Map<string, number>();
    state.terminalsRight.forEach((t, i) => rightIndex.set(t, i));

    const pairs = state.connections
        .map((c) => ({li: leftIndex.get(c.from) ?? 0, ri: rightIndex.get(c.to) ?? 0}))
        .sort((a, b) => a.li - b.li);

    // If right indices are not non-decreasing, there is a crossing
    for (let i = 1; i < pairs.length; i++) {
        if (pairs[i].ri < pairs[i - 1].ri) {
            return true;
        }
    }
    return false;
}
