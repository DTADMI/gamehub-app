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

    it("detects an open-end leak (elbow pointing to empty)", () => {
        const grid: Tile[] = [
            {type: "elbow", rotation: 90, source: true}, // right-down
            {type: "elbow", rotation: 270, sink: true}, // left-up (points at 1,0 and 1,-1)
            {type: "empty", rotation: 0},
            {type: "straight", rotation: 90}, // vertical at 1,1
        ];
        // 2x2 grid
        // (0,0) source elbow RD -> (1,0) sink elbow LU
        // (0,0) also points down to (0,1) which is empty
        const s = createPipesState(2, 2, grid);
        expect(s.solved).toBe(false);
    });

    it("supports turning tiles to achieve connectivity", () => {
        // 2x2: source at (0,0) sink at (1,1)
        const grid: Tile[] = [
            {type: "elbow", rotation: 0, source: true}, // (0,0)
            {type: "elbow", rotation: 0},               // (1,0)
            {type: "endcap", rotation: 0},              // (0,1)
            {type: "endcap", rotation: 0, sink: true},  // (1,1)
        ];
        let s = createPipesState(2, 2, grid);
        expect(s.solved).toBe(false);

        // Target Path: (0,0) RD -> (1,0) LD -> (1,1) U
        // Also (0,0) RD also points D to (0,1) U (endcap)
        s = setTileRotation(s, 0, 0, 90);  // (0,0) elbow right-down
        s = setTileRotation(s, 1, 0, 180); // (1,0) elbow down-left
        s = setTileRotation(s, 1, 1, 0);   // (1,1) endcap up
        s = setTileRotation(s, 0, 1, 0);   // (0,1) endcap up

        s = evaluatePipes(s);
        expect(s.solved).toBe(true);
    });
});
