// Pure-logic gears puzzle primitive
// Model: gears connected by meshing edges. The overall speed ratio between
// an input gear and an output gear equals the product of teeth(prev)/teeth(next)
// along a connection path (idler gears do not change magnitude of ratio beyond their teeth contribution).
// Sign/direction flips are UI concerns; logic focuses on absolute ratio.

export type Gear = { id: string; teeth: number };
export type GearConnection = { a: string; b: string };

export type GearsState = {
    gears: Gear[];
    connections: GearConnection[];
    inputId: string;
    outputId: string;
    targetRatio: number; // expected |speed_out/speed_in|, e.g., 0.5 means output is half the input speed
    tolerance?: number; // acceptable absolute tolerance for ratio match (default 1e-6)
    solved: boolean;
};

export function createGearsState(
    gears: Gear[],
    connections: GearConnection[],
    inputId: string,
    outputId: string,
    targetRatio: number,
    tolerance: number = 1e-3,
): GearsState {
    const base: GearsState = {
        gears: [...gears],
        connections: [...connections],
        inputId,
        outputId,
        targetRatio,
        tolerance,
        solved: false,
    };
    return evaluateGears(base);
}

export function setGearsTeeth(state: GearsState, gearId: string, teeth: number): GearsState {
    const gears = state.gears.map((g) => (g.id === gearId ? {...g, teeth} : g));
    return evaluateGears({...state, gears});
}

export function evaluateGears(state: GearsState): GearsState {
    // Find a simple path from input to output via BFS and compute ratio
    const graph = buildGearsGraph(state.connections);
    const path = bfsPath(graph, state.inputId, state.outputId);
    if (!path) {
        return {...state, solved: false};
    }
    const gearMap = new Map(state.gears.map((g) => [g.id, g] as const));
    // Ensure all gears on path exist and teeth > 0
    for (const id of path) {
        const g = gearMap.get(id);
        if (!g || !Number.isFinite(g.teeth) || g.teeth <= 0) {
            return {...state, solved: false};
        }
    }
    // Compute magnitude ratio = product(teeth(prev)/teeth(next)) along the path
    let ratio = 1;
    for (let i = 0; i < path.length - 1; i++) {
        const a = gearMap.get(path[i])!;
        const b = gearMap.get(path[i + 1])!;
        ratio *= a.teeth / b.teeth;
    }
    const eps = state.tolerance ?? 1e-6;
    const solved = nearlyEqual(Math.abs(ratio), Math.abs(state.targetRatio), eps);
    return {...state, solved};
}

export function clearConnections(state: GearsState): GearsState {
    return evaluateGears({...state, connections: []});
}

export function setConnection(state: GearsState, a: string, b: string, on: boolean): GearsState {
    const exists = state.connections.some((c) => (c.a === a && c.b === b) || (c.a === b && c.b === a));
    let connections = state.connections;
    if (on && !exists) {
        connections = [...connections, {a, b}];
    } else if (!on && exists) {
        connections = connections.filter((c) => !((c.a === a && c.b === b) || (c.a === b && c.b === a)));
    }
    return evaluateGears({...state, connections});
}

function buildGearsGraph(conns: GearConnection[]): Record<string, string[]> {
    const g: Record<string, string[]> = {};
    for (const {a, b} of conns) {
        if (!g[a]) {
            g[a] = [];
        }
        if (!g[b]) {
            g[b] = [];
        }
        g[a].push(b);
        g[b].push(a);
    }
    return g;
}

function bfsPath(graph: Record<string, string[]>, start: string, goal: string): string[] | null {
    if (start === goal) {
        return [start];
    }
    const queue: string[] = [start];
    const prev = new Map<string, string | null>();
    prev.set(start, null);
    while (queue.length) {
        const cur = queue.shift()!;
        for (const nxt of graph[cur] || []) {
            if (!prev.has(nxt)) {
                prev.set(nxt, cur);
                if (nxt === goal) {
                    // reconstruct path
                    const path: string[] = [nxt];
                    let p: string | null = cur;
                    while (p) {
                        path.push(p);
                        p = prev.get(p) ?? null;
                    }
                    path.reverse();
                    return path;
                }
                queue.push(nxt);
            }
        }
    }
    return null;
}

function nearlyEqual(a: number, b: number, eps = 1e-9): boolean {
    return Math.abs(a - b) <= eps;
}
