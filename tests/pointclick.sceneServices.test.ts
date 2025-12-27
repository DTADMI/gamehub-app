import {describe, expect, it, vi} from "vitest";
import {Blackboard, CutsceneRunner, TimerService} from "@games/shared/pointclick/core/SceneServices";
import {EventSystem} from "@games/shared/pointclick/utils/EventSystem";

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

describe("Scene Services — TimerService", () => {
    it("fires a timeout", async () => {
        const timers = new TimerService();
        let fired = false;
        timers.createTimeout(10, () => {
            fired = true;
        });

        // TimerService uses performance.now() and requestAnimationFrame
        // We can manually trigger update for testing
        const now = performance.now();
        timers.update(now + 20);
        expect(fired).toBe(true);
        timers.clearAll();
    });

    it("can pause and resume a timer", () => {
        // Mocking performance.now for deterministic testing
        let mockTime = 1000;
        const spy = vi.spyOn(performance, 'now').mockImplementation(() => mockTime);

        const timers = new TimerService();
        let fired = false;
        const h = timers.createTimeout(100, () => {
            fired = true;
        });

        // First update at 1000: lastStart was 1000 (at creation), so no elapsed
        timers.update(mockTime);
        expect(fired).toBe(false);

        // Advance 50ms
        mockTime += 50;
        timers.update(mockTime);
        expect(fired).toBe(false);

        h.pause(); // remaining becomes 100 - (1050 - 1000) = 50

        // Advance while paused
        mockTime += 200;
        timers.update(mockTime);
        expect(fired).toBe(false);

        h.resume(); // lastStart becomes 1250 (current mockTime)

        // Advance 60ms (more than 50 remaining)
        mockTime += 60;
        timers.update(mockTime);
        expect(fired).toBe(true);

        timers.clearAll();
        spy.mockRestore();
    });
});

describe("Scene Services — CutsceneRunner", () => {
    it("runs a sequence of steps", async () => {
        const events = new EventSystem();
        const timers = new TimerService();
        const runner = new CutsceneRunner(events, timers);

        const results: string[] = [];
        const steps = [
            {type: 'effect' as const, payload: {run: () => results.push('one')}},
            {type: 'wait' as const, payload: {ms: 10}},
            {type: 'effect' as const, payload: {run: () => results.push('two')}},
        ];

        const promise = runner.run(steps);

        // Advance timers manually
        timers.update(performance.now() + 20);

        await promise;
        expect(results).toEqual(['one', 'two']);
    });
});
