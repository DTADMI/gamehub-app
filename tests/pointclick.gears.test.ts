import {describe, expect, it} from "vitest";
import {createGearsState, evaluateGears, setGearsTeeth} from "@games/shared/pointclick/puzzles/gears";

describe("gears puzzle primitive", () => {
    it("solves a simple 2-gear ratio (20 -> 40 = 1/2)", () => {
        let s = createGearsState(
            [
                {id: "in", teeth: 20},
                {id: "out", teeth: 40},
            ],
            [{a: "in", b: "out"}],
            "in",
            "out",
            0.5,
        );
        expect(s.solved).toBe(true);

        s = setGearsTeeth(s, "out", 30);
        expect(s.solved).toBe(false);
    });

    it("handles idler gear without changing magnitude beyond teeth contribution (20-30-60 => 1/3)", () => {
        let s = createGearsState(
            [
                {id: "in", teeth: 20},
                {id: "idle", teeth: 30},
                {id: "out", teeth: 60},
            ],
            [
                {a: "in", b: "idle"},
                {a: "idle", b: "out"},
            ],
            "in",
            "out",
            1 / 3,
        );
        expect(s.solved).toBe(true);

        // Change idler teeth DOES NOT break the ratio in a simple mesh (idler teeth cancel out)
        s = setGearsTeeth(s, "idle", 20);
        s = evaluateGears(s);
        expect(s.solved).toBe(true);
    });
});
