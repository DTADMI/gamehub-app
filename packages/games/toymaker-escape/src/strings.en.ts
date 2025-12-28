export const tmeStrings = {
    e1a: {
        title: "E1 — Workshop (Gear or Music)",
        prompt: "Pick your path to open the plate:",
        choice_gears: "Align gears (stub)",
        choice_music: "Tune music box (stub)",
    },
    e1b: {
        title: "E1 — Playroom Sorter",
        prompt: "Sorter reveals Key Fragment 1 (stub):",
        choice_hints: "Use hints",
        choice_nohints: "No hints",
    },
    done: {
        title: "Episode Complete — Key Fragment 1",
        prompt: "Episode complete! Codex seed stored.",
        path: "Path",
        helper: "Helper",
        medal: "Medal",
        note: "Tip: Replay with a different route to try for a higher medal.",
    },
} as const;

export type TmeStrings = typeof tmeStrings;
