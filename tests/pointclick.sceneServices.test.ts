import {describe, expect, it} from "vitest";
import {Blackboard} from "@games/shared/pointclick/core/SceneServices";

describe("Scene Services — Blackboard", () => {
    it("sets and gets typed values", () => {
        type BB = { seen?: { poster?: boolean }, count?: number };
        const bb = new Blackboard<BB>();
        expect(bb.get("count")).toBeUndefined();
        bb.set("count", 1 as any);
        expect(bb.get("count")).toBe(1);
        bb.update("count", (n) => (n || 0) + 2);
        expect(bb.get("count")).toBe(3);
        bb.set("seen", {poster: true} as any);
        expect(bb.get("seen")?.poster).toBe(true);
    });
});
