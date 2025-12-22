import {describe, expect, it} from "vitest";
import {clearConnections, createWiresState, hasCrossing, setConnection,} from "@games/shared/pointclick/puzzles/wires";

describe("wires puzzle", () => {
    it("verifies goal connections regardless of order", () => {
        const goal = {
            red: [{from: "A1", to: "B2"}],
            blue: [{from: "A2", to: "B1"}],
        } as const;

        let s = createWiresState(["A1", "A2"], ["B1", "B2"], goal);
        s = setConnection(s, "A2", "B1", "blue");
        expect(s.solved).toBe(false);
        s = setConnection(s, "A1", "B2", "red");
        expect(s.solved).toBe(true);
    });

    it("detects crossings when right indices are decreasing", () => {
        const goal = {red: [{from: "A1", to: "B1"}]} as const;
        let s = createWiresState(["A1", "A2"], ["B1", "B2"], goal);
        s = setConnection(s, "A1", "B2", "red");
        s = setConnection(s, "A2", "B1", "blue");
        expect(hasCrossing(s)).toBe(true);
    });

    it("clear resets connections and solved state", () => {
        const goal = {red: [{from: "A1", to: "B1"}]} as const;
        let s = createWiresState(["A1"], ["B1"], goal);
        s = setConnection(s, "A1", "B1", "red");
        expect(s.solved).toBe(true);
        s = clearConnections(s);
        expect(s.connections.length).toBe(0);
        expect(s.solved).toBe(false);
    });
});
