// libs/shared/src/pointclick/puzzles/pipes.ts
// Pure-logic pipes/flow puzzle.
// Rules:
// - Tiles: straight, elbow, tee, cross, endcap, valve (open/closed)
// - Grid has one or more sources and one or more sinks
// - Solved when: every sink is connected to any source via contiguous pipe connections,
//   no open ends along the connected network, and all valves on used paths are open.

export type Dir = "up" | "right" | "down" | "left";
export const DIRS: Dir[] = ["up", "right", "down", "left"];

export type TileType =
    | "empty"
    | "straight" // connects two opposite sides
    | "elbow" // connects two adjacent sides
    | "tee" // connects three sides
    | "cross" // connects all four sides
    | "endcap" // connects one side (dead-end)
    | "valve"; // straight with open/closed gate

export interface Tile {
    type: TileType;
    rotation: 0 | 90 | 180 | 270; // clockwise degrees
    open?: boolean; // only for valve; true => passable
    source?: boolean; // this tile counts as a source outlet
    sink?: boolean; // this tile counts as a sink inlet
}

export interface PipesState {
    width: number;
    height: number;
    grid: Tile[]; // row-major length = width*height
    solved: boolean;
}

export function indexOf(x: number, y: number, w: number) {
    return y * w + x;
}

export function inBounds(x: number, y: number, w: number, h: number) {
    return x >= 0 && y >= 0 && x < w && y < h;
}

export function createPipesState(width: number, height: number, grid: Tile[]): PipesState {
    if (grid.length !== width * height) throw new Error("grid size mismatch");
    return evaluatePipes({width, height, grid: grid.map((t) => ({...t})), solved: false});
}

export function setTileRotation(state: PipesState, x: number, y: number, rotation: 0 | 90 | 180 | 270): PipesState {
    const idx = indexOf(x, y, state.width);
    const grid = state.grid.slice();
    grid[idx] = {...grid[idx], rotation};
    return evaluatePipes({...state, grid});
}

export function toggleValve(state: PipesState, x: number, y: number, open: boolean): PipesState {
    const idx = indexOf(x, y, state.width);
    const t = state.grid[idx];
    if (t.type !== "valve") return state;
    const grid = state.grid.slice();
    grid[idx] = {...t, open};
    return evaluatePipes({...state, grid});
}

// Connectivity tables per tile type at rotation => sides that are open
function sidesFor(tile: Tile): Dir[] {
    const rot = tile.rotation;
    const rotIdx = (deg: number) => (((deg / 90) | 0) + (rot / 90)) % 4;
    const map = (base: Dir[]): Dir[] => base.map((d) => rotateDir(d, rotIdx(0)));
    switch (tile.type) {
        case "empty":
            return [];
        case "straight": {
            // up<->down at 0; right<->left at 90
            return (rot / 90) % 2 === 0 ? ["up", "down"] : ["left", "right"];
        }
        case "elbow": {
            // up-right at 0; rotate accordingly
            const seq: Dir[][] = [
                ["up", "right"],
                ["right", "down"],
                ["down", "left"],
                ["left", "up"],
            ];
            return seq[(rot / 90) % 4];
        }
        case "tee": {
            // like cross minus one side; opening at up,right,left at 0 (missing down)
            const seq: Dir[][] = [
                ["up", "left", "right"],
                ["up", "right", "down"],
                ["right", "down", "left"],
                ["down", "left", "up"],
            ];
            return seq[(rot / 90) % 4];
        }
        case "cross":
            return ["up", "right", "down", "left"];
        case "endcap": {
            const seq: Dir[] = ["up", "right", "down", "left"];
            return [seq[(rot / 90) % 4]];
        }
        case "valve": {
            // behaves like straight with gate; if closed, no sides
            if (!tile.open) return [];
            return (rot / 90) % 2 === 0 ? ["up", "down"] : ["left", "right"];
        }
    }
}

function rotateDir(d: Dir, steps: number): Dir {
    const idx = (DIRS.indexOf(d) + steps) % 4;
    return DIRS[idx] as Dir;
}

function neighbor(x: number, y: number, d: Dir): [number, number] {
    switch (d) {
        case "up":
            return [x, y - 1];
        case "right":
            return [x + 1, y];
        case "down":
            return [x, y + 1];
        case "left":
            return [x - 1, y];
    }
}

function opposite(d: Dir): Dir {
    switch (d) {
        case "up":
            return "down";
        case "right":
            return "left";
        case "down":
            return "up";
        case "left":
            return "right";
    }
}

export function evaluatePipes(state: PipesState): PipesState {
    const {width: w, height: h, grid} = state;

    // Collect sources and sinks
    const sources: number[] = [];
    const sinks: number[] = [];
    for (let i = 0; i < grid.length; i++) {
        if (grid[i].source) sources.push(i);
        if (grid[i].sink) sinks.push(i);
    }
    if (sinks.length === 0 || sources.length === 0) return {...state, solved: false};

    // BFS from all sources across valid pipe connections
    const visited = new Set<number>();
    const queue: number[] = [];
    for (const s of sources) {
        queue.push(s);
        visited.add(s);
    }

    const leakAt = (idx: number): boolean => {
        const x = idx % w;
        const y = (idx / w) | 0;
        const t = grid[idx];
        const sides = sidesFor(t);
        // A used tile leaks if it has an open side without a matching neighbor side
        for (const d of sides) {
            const [nx, ny] = neighbor(x, y, d);
            if (!inBounds(nx, ny, w, h)) return true; // open to outside
            const nIdx = indexOf(nx, ny, w);
            const nSides = sidesFor(grid[nIdx]);
            if (!nSides.includes(opposite(d))) return true;
        }
        return false;
    };

    while (queue.length) {
        const idx = queue.shift()!;
        const x = idx % w;
        const y = (idx / w) | 0;
        const t = grid[idx];
        const sides = sidesFor(t);
        for (const d of sides) {
            const [nx, ny] = neighbor(x, y, d);
            if (!inBounds(nx, ny, w, h)) continue;
            const nIdx = indexOf(nx, ny, w);
            const nSides = sidesFor(grid[nIdx]);
            if (nSides.includes(opposite(d)) && !visited.has(nIdx)) {
                visited.add(nIdx);
                queue.push(nIdx);
            }
        }
    }

    // all sinks must be connected
    for (const sk of sinks) {
        if (!visited.has(sk)) return {...state, solved: false};
    }

    // Ensure no leaks on the connected subgraph
    for (const idx of visited) {
        if (leakAt(idx)) return {...state, solved: false};
    }

    return {...state, solved: true};
}
