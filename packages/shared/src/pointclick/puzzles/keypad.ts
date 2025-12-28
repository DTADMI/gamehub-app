export type KeypadState = {
    input: string;
    solved: boolean;
    attempts: number;
};

export type KeypadConfig = {
    code: string; // e.g., "2413"
    maxLen?: number; // defaults to code length
    allowLeadingZero?: boolean;
};

export function createKeypadState(): KeypadState {
    return {input: "", solved: false, attempts: 0};
}

export function pressKey(state: KeypadState, digit: string, cfg: KeypadConfig): KeypadState {
    if (state.solved) {
        return state;
    }
    if (!/^[0-9]$/.test(String(digit))) {
        return state;
    }
    const maxLen = cfg.maxLen ?? cfg.code.length;
    if (!cfg.allowLeadingZero && state.input.length === 0 && digit === "0") {
        return state; // ignore leading 0 by default
    }
    const next = state.input + digit;
    if (next.length > maxLen) {
        return {...state, input: digit};
    } // rolling buffer
    return {...state, input: next};
}

export function clearKeypad(state: KeypadState): KeypadState {
    if (state.solved) {
        return state;
    }
    return {...state, input: ""};
}

export function submitKeypad(state: KeypadState, cfg: KeypadConfig): KeypadState {
    if (state.solved) {
        return state;
    }
    const ok = state.input === cfg.code;
    return {
        input: ok ? state.input : "",
        solved: ok,
        attempts: state.attempts + 1,
    };
}
