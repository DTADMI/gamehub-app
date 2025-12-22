import {describe, expect, it} from "vitest";
import {nextScene, type Scene} from "@games/shared/pointclick/engine";

describe("pointclick engine", () => {
    const scenes: Record<string, Scene> = {
        A: {
            id: "A",
            title: {en: "A", fr: "A"},
            choices: [
                {id: "go", text: {en: "Go", fr: "Aller"}, target: "B"},
            ],
        },
        B: {
            id: "B",
            title: {en: "B", fr: "B"},
            choices: [
                {
                    id: "guarded",
                    text: {en: "Guarded", fr: "Protégé"},
                    target: "C",
                    guard: (ctx) => ctx.ok === true,
                },
            ],
        },
        C: {id: "C", title: {en: "C", fr: "C"}, choices: []},
    };

    it("transitions to target scene when choice exists", () => {
        const res = nextScene("A", scenes, "go", {});
        expect(res.sceneId).toBe("B");
    });

    it("does not transition when guard fails", () => {
        const res = nextScene("B", scenes, "guarded", {});
        expect(res.sceneId).toBe("B");
    });

    it("transitions when guard passes", () => {
        const res = nextScene("B", scenes, "guarded", {ok: true});
        expect(res.sceneId).toBe("C");
    });
});
