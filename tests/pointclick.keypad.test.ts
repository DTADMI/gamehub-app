import {describe, expect, it} from "vitest";
import {clearKeypad, createKeypadState, pressKey, submitKeypad} from "@games/shared/pointclick/puzzles/keypad";

describe("keypad puzzle", () => {
    it("enters digits and solves when code matches", () => {
        const cfg = {code: "2413"};
        let s = createKeypadState();
        s = pressKey(s, "2", cfg);
        s = pressKey(s, "4", cfg);
        s = pressKey(s, "1", cfg);
        s = pressKey(s, "3", cfg);
        s = submitKeypad(s, cfg);
        expect(s.solved).toBe(true);
        expect(s.attempts).toBe(1);
    });

    it("clears after wrong attempt", () => {
        const cfg = {code: "12"};
        let s = createKeypadState();
        s = pressKey(s, "9", cfg);
        s = pressKey(s, "9", cfg);
        s = submitKeypad(s, cfg);
        expect(s.solved).toBe(false);
        expect(s.input).toBe("");
        expect(s.attempts).toBe(1);
    });

    it("ignores leading zero by default and rolls buffer when max exceeded", () => {
        const cfg = {code: "1234"};
        let s = createKeypadState();
        s = pressKey(s, "0", cfg); // ignored
        expect(s.input).toBe("");
        s = pressKey(s, "1", cfg);
        s = pressKey(s, "2", cfg);
        s = pressKey(s, "3", cfg);
        s = pressKey(s, "4", cfg);
        s = pressKey(s, "5", cfg); // rolls
        expect(s.input).toBe("5");
        s = clearKeypad(s);
        expect(s.input).toBe("");
    });
});
