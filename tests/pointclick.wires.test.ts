import {describe, expect, it} from "vitest";
import {
    clearWiresConnections,
    createWiresState,
    hasWiresCrossing,
    setWiresConnection,
} from "@games/shared/pointclick/puzzles/wires";

describe("wires puzzle", () => {
    it("verifies goal connections regardless of order", () => {
        const goal = {
            red: [{from: "A1", to: "B2"}],
            blue: [{from: "A2", to: "B1"}],
        } as const;

        let s = createWiresState(["A1", "A2"], ["B1", "B2"], goal);
        s = setWiresConnection(s, "A2", "B1", "blue");
        expect(s.solved).toBe(false);
        s = setWiresConnection(s, "A1", "B2", "red");
        expect(s.solved).toBe(true);
    });

    it("detects crossings when right indices are decreasing", () => {
        const goal = {red: [{from: "A1", to: "B1"}]} as const;
        let s = createWiresState(["A1", "A2"], ["B1", "B2"], goal);
        s = setWiresConnection(s, "A1", "B2", "red");
        s = setWiresConnection(s, "A2", "B1", "blue");
        expect(hasWiresCrossing(s)).toBe(true);
    });

    it("clear resets connections and solved state", () => {
        const goal = {red: [{from: "A1", to: "B1"}]} as const;
        let s = createWiresState(["A1"], ["B1"], goal);
        s = setWiresConnection(s, "A1", "B1", "red");
        expect(s.solved).toBe(true);
        s = clearWiresConnections(s);
        expect(s.connections.length).toBe(0);
        expect(s.solved).toBe(false);
    });
});
