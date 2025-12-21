"use client";
import {Scene, SceneController} from "@games/_engine";
import React from "react";

import {tmeStrings as t} from "./strings.en";

const scenes: Scene[] = [
    {
        id: "E1A",
        title: t.e1a.title,
        render: ({go, setFlag, addItem, state}) => {
            const path = String(state.flags["e1.path"] ?? "gears");
            const gentle = Boolean(state.flags["gentle"]);
            // Simple interactive mini for one route (gears): three dials must be set to 1‑3‑2
            const d1 = Number(state.flags["e1a.d1"] ?? 1);
            const d2 = Number(state.flags["e1a.d2"] ?? 1);
            const d3 = Number(state.flags["e1a.d3"] ?? 1);
            const rotate = (k: string, v: number) => setFlag(k, (v % 3) + 1);
            const solvedGears = d1 === 1 && d2 === 3 && d3 === 2;
            const solvedMusic = true; // music path is stubbed; goal is one working route for Beta
            const solved = path === "gears" ? solvedGears : solvedMusic;
            return (
                <div>
                    <p className="mb-2">{t.e1a.prompt}</p>
                    <div className="mb-3">
                        <div className="text-sm font-medium mb-1">Choose path</div>
                        <div className="grid gap-2 sm:grid-cols-2" role="group" aria-label="Workshop path">
                            <button
                                className={`min-h-[44px] px-3 py-2 rounded border ${path === "gears" ? "bg-amber-100" : "bg-background"}`}
                                aria-pressed={path === "gears"}
                                onClick={() => setFlag("e1.path", "gears")}
                            >{t.e1a.choice_gears}</button>
                            <button
                                className={`min-h-[44px] px-3 py-2 rounded border ${path === "music" ? "bg-amber-100" : "bg-background"}`}
                                aria-pressed={path === "music"}
                                onClick={() => setFlag("e1.path", "music")}
                            >{t.e1a.choice_music}</button>
                        </div>
                    </div>
                    {path === "gears" ? (
                        <div aria-label="Gear alignment" role="group" className="mb-2">
                            {gentle && <p className="text-sm opacity-80 mb-2">Hint: target is 1‑3‑2.</p>}
                            <div className="flex gap-2 items-center">
                                <button aria-label={`Dial 1 value ${d1}`}
                                        className="min-h-[44px] px-3 py-2 rounded border"
                                        onClick={() => rotate("e1a.d1", d1)}>Dial 1: {d1}</button>
                                <button aria-label={`Dial 2 value ${d2}`}
                                        className="min-h-[44px] px-3 py-2 rounded border"
                                        onClick={() => rotate("e1a.d2", d2)}>Dial 2: {d2}</button>
                                <button aria-label={`Dial 3 value ${d3}`}
                                        className="min-h-[44px] px-3 py-2 rounded border"
                                        onClick={() => rotate("e1a.d3", d3)}>Dial 3: {d3}</button>
                            </div>
                            <div className="text-sm opacity-80 mt-1">Current: [{d1}-{d2}-{d3}]</div>
                        </div>
                    ) : (
                        <div className="mb-2">
                            {gentle &&
                                <p className="text-sm opacity-80">Music box route is simplified for this Beta.</p>}
                            <p className="text-sm opacity-80">Tune three notes (stubbed) — considered solved.</p>
                        </div>
                    )}
                    <div className="mt-3">
                        <button
                            className="min-h-[44px] px-4 py-2 rounded bg-primary text-primary-foreground disabled:opacity-50"
                            disabled={!solved}
                            onClick={() => {
                                addItem("plate");
                                go("E1B");
                            }}
                        >Continue
                        </button>
                    </div>
                </div>
            );
        },
    },
    {
        id: "E1B",
        title: t.e1b.title,
        render: ({go, setFlag, addItem, state}) => {
            const helper = String(state.flags["e1.helper"] ?? "hints");
            const gentle = Boolean(state.flags["gentle"]);
            const a = Boolean(state.flags["e1b.red"]);
            const b = Boolean(state.flags["e1b.blue"]);
            const c = Boolean(state.flags["e1b.green"]);
            const toggle = (k: string, v: boolean) => setFlag(k, !v);
            const solved = a && b && c;
            return (
                <div>
                    <p className="mb-2">{t.e1b.prompt}</p>
                    <div className="mb-2">
                        <div className="text-sm font-medium mb-1">Hints</div>
                        <div className="grid gap-2 sm:grid-cols-2" role="group" aria-label="Hints toggle">
                            <button
                                className={`min-h-[44px] px-3 py-2 rounded border ${helper === "hints" ? "bg-amber-100" : "bg-background"}`}
                                aria-pressed={helper === "hints"}
                                onClick={() => setFlag("e1.helper", "hints")}>{t.e1b.choice_hints}</button>
                            <button
                                className={`min-h-[44px] px-3 py-2 rounded border ${helper === "noHints" ? "bg-amber-100" : "bg-background"}`}
                                aria-pressed={helper === "noHints"}
                                onClick={() => setFlag("e1.helper", "noHints")}>{t.e1b.choice_nohints}</button>
                        </div>
                    </div>
                    <div role="group" aria-label="Sorter" className="flex gap-2 items-center">
                        {gentle && <p className="text-sm opacity-80 mr-2">Select all three to sort correctly.</p>}
                        <button
                            className={`min-h-[44px] px-3 py-2 rounded border ${a ? "bg-amber-100" : "bg-background"}`}
                            aria-pressed={a} onClick={() => toggle("e1b.red", a)}>Red
                        </button>
                        <button
                            className={`min-h-[44px] px-3 py-2 rounded border ${b ? "bg-amber-100" : "bg-background"}`}
                            aria-pressed={b} onClick={() => toggle("e1b.blue", b)}>Blue
                        </button>
                        <button
                            className={`min-h-[44px] px-3 py-2 rounded border ${c ? "bg-amber-100" : "bg-background"}`}
                            aria-pressed={c} onClick={() => toggle("e1b.green", c)}>Green
                        </button>
                    </div>
                    <div className="mt-3">
                        <button
                            className="min-h-[44px] px-4 py-2 rounded bg-primary text-primary-foreground disabled:opacity-50"
                            disabled={!solved}
                            onClick={() => {
                                addItem("key-fragment-1");
                                go("DONE");
                            }}
                        >Reveal Key Fragment 1
                        </button>
                    </div>
                </div>
            );
        },
    },
    {
        id: "DONE",
        title: t.done.title,
        render: ({state, setFlag}) => {
            const path = String(state.flags["e1.path"] ?? "");
            const helper = String(state.flags["e1.helper"] ?? "");
            let medal: "bronze" | "silver" | "gold" = "bronze";
            if (helper === "noHints") {
                medal = "silver";
            }
            if (helper === "noHints" && path === "gears") {
                medal = "gold";
            }
            if (state.flags["medals.e1"] !== medal) {
                setFlag("medals.e1", medal);
            }
            return (
                <div>
                    <p>{t.done.prompt}</p>
                    <ul className="list-disc ml-6">
                        <li>{t.done.path}: {String(state.flags["e1.path"])}</li>
                        <li>{t.done.helper}: {String(state.flags["e1.helper"])}</li>
                        <li>{t.done.medal}: {String(state.flags["medals.e1"])}</li>
                    </ul>
                    <p className="mt-2 opacity-80 text-sm">{t.done.note}</p>
                </div>
            );
        },
    },
];

export function ToymakerEscapeGame() {
    return (
        <SceneController scenes={scenes} initial={{scene: "E1A", flags: {}, inventory: []}} saveKey="tme:save:v1"/>
    );
}

export default ToymakerEscapeGame;
