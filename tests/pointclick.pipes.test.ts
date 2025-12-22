import {describe, expect, it} from "vitest";
import {
    createPipesState,
    evaluatePipes,
    setTileRotation,
    type Tile,
    toggleValve
} from "@games/shared/pointclick/puzzles/pipes";

describe("pipes/flow puzzle", () => {
    it("solves a simple straight connection source→sink", () => {
        const grid: Tile[] = [
            {type: "straight", rotation: 0, source: true},
            {type: "straight", rotation: 0},
            {type: "straight", rotation: 0, sink: true},
        ];
        const s1 = createPipesState(3, 1, grid);
        expect(s1.solved).toBe(true);
    });

    it("fails when a valve is closed on the path", () => {
        const grid: Tile[] = [
            {type: "straight", rotation: 0, source: true},
            {type: "valve", rotation: 0, open: false},
            {type: "straight", rotation: 0, sink: true},
        ];
        let s = createPipesState(3, 1, grid);
        expect(s.solved).toBe(false);
        s = toggleValve(s, 1, 0, true);
        expect(s.solved).toBe(true);
    });

    it("detects an open-end leak (elbow pointing to empty/outside)", () => {
        const grid: Tile[] = [
            {type: "elbow", rotation: 0, source: true}, // up-right
            {type: "elbow", rotation: 270, sink: true}, // left-up
            {type: "empty", rotation: 0},
        ];
        // 3x1 doesn't make sense for elbows; expect unsolved due to leaks
        const s = createPipesState(3, 1, grid);
        expect(s.solved).toBe(false);
    });

    it("supports turning tiles to achieve connectivity", () => {
        // 2x2: source at (0,0) elbow to (1,0) straight down to sink at (1,1)
        const grid: Tile[] = [
            {type: "elbow", rotation: 0, source: true}, // up-right (need right-down)
            {type: "straight", rotation: 0}, // up-down
            {type: "empty", rotation: 0},
            {type: "endcap", rotation: 0, sink: true}, // needs up
        ];
        let s = createPipesState(2, 2, grid);
        expect(s.solved).toBe(false);
        s = setTileRotation(s, 0, 0, 90); // elbow right-down
        s = setTileRotation(s, 1, 0, 90); // straight left-right
        s = setTileRotation(s, 1, 1, 270); // endcap 'up'
        s = evaluatePipes(s);
        expect(s.solved).toBe(true);
    });
});
