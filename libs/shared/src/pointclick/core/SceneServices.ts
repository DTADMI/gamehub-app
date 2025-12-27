import {EventSystem} from '../utils/EventSystem';

// Timers — pausable timeouts/intervals tied to a scene lifecycle
export type TimerHandle = {
    pause: () => void;
    resume: () => void;
    cancel: () => void;
    isActive: () => boolean;
};

type TimerRecord = {
    id: number;
    remaining: number; // ms
    period?: number; // for interval
    cb: () => void;
    active: boolean;
    lastStart: number; // ts when started/resumed
    repeat: boolean;
};

export class TimerService {
    private timers: Map<number, TimerRecord> = new Map();
    private nextId = 1;
    private raf?: number;
    private running = false;

    update = (now: number) => {
        if (!this.running) {
            return;
        }
        const toFire: TimerRecord[] = [];
        for (const rec of this.timers.values()) {
            if (!rec.active) {
                continue;
            }
            const elapsed = now - rec.lastStart;
            if (elapsed >= rec.remaining) {
                toFire.push(rec);
            }
        }
        for (const rec of toFire) {
            if (!this.timers.has(rec.id)) {
                continue;
            }
            try {
                rec.cb();
            } catch (e) {
                console.error('[TimerService] timer error', e);
            }
            if (rec.repeat && rec.period != null) {
                rec.lastStart = now;
                rec.remaining = rec.period;
            } else {
                this.timers.delete(rec.id);
            }
        }
        if (this.timers.size === 0) {
            this.stop();
        }
    };

    createTimeout(ms: number, cb: () => void): TimerHandle {
        const id = this.nextId++;
        const rec: TimerRecord = {id, remaining: ms, cb, active: true, lastStart: performance.now(), repeat: false};
        this.timers.set(id, rec);
        this.start();
        return this.handle(rec);
    }

    createInterval(ms: number, cb: () => void): TimerHandle {
        const id = this.nextId++;
        const rec: TimerRecord = {
            id,
            remaining: ms,
            period: ms,
            cb,
            active: true,
            lastStart: performance.now(),
            repeat: true
        };
        this.timers.set(id, rec);
        this.start();
        return this.handle(rec);
    }

    clearAll() {
        this.timers.clear();
        this.stop();
    }

    private loop = () => {
        this.update(performance.now());
        if (this.running) {
            this.raf = requestAnimationFrame(this.loop);
        }
    };

    private start() {
        if (this.running) {
            return;
        }
        this.running = true;
        this.raf = requestAnimationFrame(this.loop);
    }

    private stop() {
        this.running = false;
        if (this.raf) {
            cancelAnimationFrame(this.raf);
        }
        this.raf = undefined;
    }

    private handle(rec: TimerRecord): TimerHandle {
        return {
            pause: () => {
                if (!rec.active) {
                    return;
                }
                const now = performance.now();
                rec.remaining -= (now - rec.lastStart);
                rec.active = false;
            },
            resume: () => {
                if (rec.active) {
                    return;
                }
                rec.lastStart = performance.now();
                rec.active = true;
                this.start();
            },
            cancel: () => {
                this.timers.delete(rec.id);
                if (this.timers.size === 0) {
                    this.stop();
                }
            },
            isActive: () => rec.active,
        };
    }
}

// Cutscene runner — sequential steps that can wait on time or events
export type CutsceneStep =
    | { type: 'say'; payload: { text: string } }
    | { type: 'wait'; payload: { ms?: number; event?: string } }
    | { type: 'effect'; payload: { run: () => void } }
    | { type: 'animate'; payload: { run: (dt: number) => boolean } }; // return true when finished

export class CutsceneRunner {
    private playing = false;
    private cancelFlag = false;
    private disposeEvent?: () => void;

    constructor(private events: EventSystem, private timers: TimerService) {
    }

    async run(steps: CutsceneStep[]): Promise<void> {
        this.playing = true;
        this.cancelFlag = false;
        for (const step of steps) {
            if (this.cancelFlag) {
                break;
            }
            switch (step.type) {
                case 'say':
                    this.events.emit('cutscene:say', step.payload.text);
                    break;
                case 'effect':
                    step.payload.run();
                    break;
                case 'wait':
                    await new Promise<void>((resolve) => {
                        if (step.payload.ms != null) {
                            const h = this.timers.createTimeout(step.payload.ms, () => {
                                resolve();
                                h.cancel();
                            });
                        } else if (step.payload.event) {
                            const off = this.events.on(step.payload.event, () => {
                                off();
                                resolve();
                            });
                            this.disposeEvent = off;
                        } else {
                            resolve();
                        }
                    });
                    break;
                case 'animate':
                    await new Promise<void>((resolve) => {
                        const start = performance.now();
                        const tick = () => {
                            const dt = (performance.now() - start) / 1000;
                            const done = step.payload.run(dt);
                            if (done || this.cancelFlag) {
                                resolve();
                            } else {
                                requestAnimationFrame(tick);
                            }
                        };
                        requestAnimationFrame(tick);
                    });
                    break;
            }
        }
        this.disposeEvent?.();
        this.disposeEvent = undefined;
        this.playing = false;
        this.events.emit('cutscene:done');
    }

    cancel() {
        this.cancelFlag = true;
    }

    isPlaying() {
        return this.playing;
    }
}

// Blackboard — tiny per‑scene typed KV store
export class Blackboard<T extends Record<string, any> = Record<string, any>> {
    private data = new Map<keyof T, T[keyof T]>();

    get<K extends keyof T>(key: K): T[K] | undefined {
        return this.data.get(key) as T[K] | undefined;
    }

    set<K extends keyof T>(key: K, value: T[K]) {
        this.data.set(key, value);
    }

    update<K extends keyof T>(key: K, fn: (prev: T[K] | undefined) => T[K]) {
        const next = fn(this.get(key));
        this.set(key, next);
        return next;
    }

    clear() {
        this.data.clear();
    }
}

// SceneServices facade to be attached per scene
export class SceneServices {
    public timers = new TimerService();
    public cutscenes: CutsceneRunner;
    public blackboard: Blackboard<any> = new Blackboard();

    constructor(private events: EventSystem) {
        this.cutscenes = new CutsceneRunner(events, this.timers);
    }

    destroy() {
        this.timers.clearAll();
        this.blackboard.clear();
        if (this.cutscenes.isPlaying()) {
            this.cutscenes.cancel();
        }
    }
}

export {EventSystem} from '../utils/EventSystem';
