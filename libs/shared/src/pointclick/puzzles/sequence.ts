// libs/shared/src/pointclick/puzzles/sequence.ts
// Pure logic for a Simon/sequence memory puzzle.

export type SeqSymbol = string | number;

export type SequenceState = {
    target: SeqSymbol[]; // the full sequence to reproduce
    input: SeqSymbol[]; // current attempt buffer
    step: number; // how many correct items matched so far
    mistakes: number; // number of wrong attempts this round
    lives: number; // remaining lives (0 => fail lock)
    solved: boolean;
    failed: boolean;
};

export type SequenceOptions = {
    lives?: number; // default 3
};

export function createSequenceState(
    target: SeqSymbol[],
    opts: SequenceOptions = {},
): SequenceState {
    const lives = Math.max(0, opts.lives ?? 3);
    return {
        target: [...target],
        input: [],
        step: 0,
        mistakes: 0,
        lives,
        solved: false,
        failed: false,
    };
}

export function pressSeq(state: SequenceState, sym: SeqSymbol): SequenceState {
    if (state.solved || state.failed) return state;
    const next: SequenceState = {...state, input: [...state.input, sym]};
    const expected = state.target[state.input.length - 1];
    if (sym !== expected) {
        const mistakes = state.mistakes + 1;
        const lives = Math.max(0, state.lives - 1);
        return {
            ...next,
            mistakes,
            lives,
            input: [],
            step: 0,
            failed: lives === 0,
        };
    }
    const step = state.step + 1;
    const solved = step === state.target.length;
    return {
        ...next,
        step,
        solved,
    };
}

export function resetSeq(state: SequenceState): SequenceState {
    return {
        ...state,
        input: [],
        step: 0,
        mistakes: 0,
        // keep lives, target; do not change solved/failed here
    };
}

export function nextRoundSeq(
    state: SequenceState,
    extendBy: SeqSymbol[] | number = 1,
): SequenceState {
    // Extend the target (e.g., add 1 random symbol) and reset buffers
    const extension = Array.isArray(extendBy)
        ? extendBy
        : state.target.slice(-extendBy as number);
    return {
        ...state,
        target: [...state.target, ...extension],
        input: [],
        step: 0,
        mistakes: 0,
        solved: false,
        failed: false,
    };
}
