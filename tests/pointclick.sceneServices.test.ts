import {describe, expect, it, vi} from 'vitest';
import {Blackboard, CutsceneRunner, EventSystem, TimerService} from '@games/shared/pointclick/core/SceneServices';

describe('SceneServices — TimerService', () => {
    it('fires timeout and supports pause/resume', async () => {
        const timers = new TimerService();
        const cb = vi.fn();
        const handle = timers.createTimeout(30, cb);
        handle.pause();
        // Wait 50ms; since paused, should not fire
        await new Promise(r => setTimeout(r, 50));
        expect(cb).not.toHaveBeenCalled();
        handle.resume();
        await new Promise(r => setTimeout(r, 60));
        expect(cb).toHaveBeenCalledTimes(1);
        timers.clearAll();
    });

    it('interval repeats until cancel', async () => {
        const timers = new TimerService();
        const cb = vi.fn();
        const h = timers.createInterval(20, cb);
        await new Promise(r => setTimeout(r, 75));
        h.cancel();
        const calls = cb.mock.calls.length;
        expect(calls >= 3).toBe(true);
        timers.clearAll();
    });
});

describe('SceneServices — CutsceneRunner', () => {
    it('runs steps and waits on ms and event', async () => {
        const timers = new TimerService();
        const events = new EventSystem();
        const runner = new CutsceneRunner(events as any, timers);
        const says: string[] = [];
        events.on('cutscene:say', (t: string) => says.push(t));
        const done = vi.fn();
        events.on('cutscene:done', done);
        const promise = runner.run([
            {type: 'say', payload: {text: 'Hello'}},
            {type: 'wait', payload: {ms: 20}},
            {type: 'say', payload: {text: 'World'}},
            {type: 'wait', payload: {event: 'go'}},
            {type: 'say', payload: {text: '!'}},
        ]);
        await new Promise(r => setTimeout(r, 40));
        events.emit('go');
        await promise;
        expect(says).toEqual(['Hello', 'World', '!']);
        expect(done).toHaveBeenCalled();
        timers.clearAll();
    });
});

describe('SceneServices — Blackboard', () => {
    it('get/set/update works with types', () => {
        type T = { score: number; flag?: boolean };
        const bb = new Blackboard<T>();
        expect(bb.get('score')).toBeUndefined();
        bb.set('score', 1);
        expect(bb.get('score')).toBe(1);
        const v = bb.update('score', (prev) => (prev ?? 0) + 4);
        expect(v).toBe(5);
        expect(bb.get('score')).toBe(5);
        bb.set('flag', true);
        expect(bb.get('flag')).toBe(true);
    });
});
