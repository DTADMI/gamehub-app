import {describe, expect, it} from "vitest";
import {createSequenceState, pressSeq, resetSeq} from "@games/shared/pointclick/puzzles/sequence";

describe("sequence puzzle", () => {
    it("solves when full sequence is entered correctly", () => {
        let s = createSequenceState([1, 2, 3], {lives: 2});
        s = pressSeq(s, 1);
        s = pressSeq(s, 2);
        s = pressSeq(s, 3);
        expect(s.solved).toBe(true);
        expect(s.failed).toBe(false);
    });

    it("consumes a life on wrong press and resets step", () => {
        let s = createSequenceState(["A", "B"], {lives: 1});
        s = pressSeq(s, "A");
        expect(s.step).toBe(1);
        s = pressSeq(s, "X");
        expect(s.lives).toBe(0);
        expect(s.step).toBe(0);
        expect(s.failed).toBe(true);
    });

    it("reset clears input but keeps target and lives", () => {
        let s = createSequenceState(["R", "G", "B"], {lives: 3});
        s = pressSeq(s, "R");
        s = resetSeq(s);
        expect(s.input.length).toBe(0);
        expect(s.step).toBe(0);
        expect(s.target).toEqual(["R", "G", "B"]);
        expect(s.lives).toBe(3);
    });
});
