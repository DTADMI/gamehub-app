"use client";
import {ChoiceList, Scene, SceneController} from "@games/_engine";
import React from "react";

import {rodStrings as t} from "./strings.en";

const scenes: Scene[] = [
    {
        id: "S1",
        title: t.s1.title,
        render: ({go, setFlag, addItem, state}) => {
            const p1 = Number(state.flags["s1.p1"] ?? 2);
            const p2 = Number(state.flags["s1.p2"] ?? 3);
            const p3 = Number(state.flags["s1.p3"] ?? 1);
            const gentle = Boolean(state.flags["gentle"]);
            const cycle = (key: string, current: number) => setFlag(key, current % 3 + 1);
            const solved = p1 === 1 && p2 === 2 && p3 === 3;
            return (
                <div>
                    <p className="mb-1">{t.s1.prompt}</p>
                    {gentle && (
                        <p className="text-sm opacity-80 mb-2">{t.s1.hint}</p>
                    )}
                    <div className="flex gap-2 items-center mb-2" role="group" aria-label="Tag pieces order">
                        <button
                            className="min-h-[44px] px-3 py-2 rounded border"
                            onClick={() => cycle("s1.p1", p1)}
                            aria-label={`Rotate piece 1 (now ${p1})`}
                        >Piece 1: {p1}
                        </button>
                        <button
                            className="min-h-[44px] px-3 py-2 rounded border"
                            onClick={() => cycle("s1.p2", p2)}
                            aria-label={`Rotate piece 2 (now ${p2})`}
                        >Piece 2: {p2}
                        </button>
                        <button
                            className="min-h-[44px] px-3 py-2 rounded border"
                            onClick={() => cycle("s1.p3", p3)}
                            aria-label={`Rotate piece 3 (now ${p3})`}
                        >Piece 3: {p3}
                        </button>
                    </div>
                    <div className="text-sm opacity-80">Current order: [{p1}‑{p2}‑{p3}]</div>
                    <div className="mt-3">
                        <button
                            className="min-h-[44px] px-4 py-2 rounded bg-primary text-primary-foreground disabled:opacity-50"
                            disabled={!solved}
                            onClick={() => {
                                setFlag("s1.style", gentle ? "careful" : "quick");
                                addItem("name-tag");
                                go("S2");
                            }}
                        >{t.s1.continue}
                        </button>
                    </div>
                </div>
            );
        },
    },
    {
        id: "S2",
        title: t.s2.title,
        render: ({go, setFlag, addItem, state}) => {
            const gentle = Boolean(state.flags["gentle"]);
            const a = Boolean(state.flags["s2.a"]);
            const b = Boolean(state.flags["s2.b"]);
            const c = Boolean(state.flags["s2.c"]);
            const attempts = Number(state.flags["s2.attempts"] ?? 0);
            const set = (k: string, v: boolean) => setFlag(k, v);
            const toggle = (k: string, v: boolean) => setFlag(k, !v);
            const allMatched = a && b && c;
            const wrongAndGentleHint = gentle && attempts >= 2 && !allMatched;
            return (
                <div>
                    <p className="mb-1">{t.s2.prompt}</p>
                    {gentle && (
                        <p className="text-sm opacity-80 mb-2">{t.s2.hint} {wrongAndGentleHint && "Hint: One mismatch is near the lower right."}</p>
                    )}
                    <div role="group" aria-label="Note with letters" className="grid grid-cols-3 gap-2 max-w-xs">
                        <button
                            className={`min-h-[44px] px-3 py-2 rounded border ${a ? "bg-amber-100" : "bg-background"}`}
                            aria-pressed={a}
                            onClick={() => toggle("s2.a", a)}
                        >A
                        </button>
                        <button
                            className={`min-h-[44px] px-3 py-2 rounded border ${b ? "bg-amber-100" : "bg-background"}`}
                            aria-pressed={b}
                            onClick={() => toggle("s2.b", b)}
                        >B
                        </button>
                        <button
                            className={`min-h-[44px] px-3 py-2 rounded border ${c ? "bg-amber-100" : "bg-background"}`}
                            aria-pressed={c}
                            onClick={() => toggle("s2.c", c)}
                        >C
                        </button>
                    </div>
                    <div className="text-sm opacity-80 mt-2">Selected: [{a ? "A" : "-"}] [{b ? "B" : "-"}]
                        [{c ? "C" : "-"}]
                    </div>
                    <div className="mt-3 flex gap-2">
                        <button
                            className="min-h-[44px] px-4 py-2 rounded bg-secondary text-secondary-foreground"
                            onClick={() => setFlag("s2.attempts", attempts + 1)}
                        >{t.s2.check}
                        </button>
                        <button
                            className="min-h-[44px] px-4 py-2 rounded bg-primary text-primary-foreground disabled:opacity-50"
                            disabled={!allMatched}
                            onClick={() => {
                                setFlag("s2.result", allMatched ? "match" : "miss1");
                                addItem("note");
                                go("S3");
                            }}
                        >{t.s2.continue}
                        </button>
                        <button
                            className="min-h-[44px] px-3 py-2 rounded border"
                            onClick={() => {
                                set("s2.a", false);
                                set("s2.b", false);
                                set("s2.c", false);
                                setFlag("s2.attempts", 0);
                            }}
                            aria-label="Reset selections"
                        >{t.s2.reset}
                        </button>
                    </div>
                </div>
            );
        },
    },
    {
        id: "S3",
        title: t.s3.title,
        render: ({go, setFlag, addItem, state}) => (
            <div>
                <p>{t.s3.prompt}</p>
                {Boolean(state.flags["gentle"]) && (
                    <p className="text-sm opacity-80 mb-2">{t.s3.gentle}</p>
                )}
                <ChoiceList
                    choices={[
                        {id: "receipt", label: t.s3.receipt, next: "EP"},
                        {id: "overhear", label: t.s3.overhear, next: "EP"},
                    ]}
                    onPick={(id, next) => {
                        setFlag("s3.path", id);
                        addItem(id === "receipt" ? "proof-receipt" : "proof-note");
                        go(next);
                    }}
                />
            </div>
        ),
    },
    {
        id: "EP",
        title: t.ep.title,
        render: ({setFlag, state}) => {
            // auto-unlock Helper Badge once (idempotent)
            if (!state.flags["ep.badgeApplied"]) {
                setFlag("ep.badgeHelper", true);
                setFlag("ep.badgeApplied", true);
                // also stamp saveVersion
                setFlag("saveVersion", 1);
            }
            return (
                <div>
                    <p>{t.ep.done}</p>
                    <div className="my-2">
                        <img src="/assets/rod/badge_helper.svg" alt="Helper Badge" className="h-12 w-12"/>
                    </div>
                    {Boolean(state.flags["gentle"]) && (
                        <p className="text-sm opacity-80">{t.ep.gentle}</p>
                    )}
                    <ul className="list-disc ml-6">
                        <li>S1 style: {String(state.flags["s1.style"])}</li>
                        <li>S2 result: {String(state.flags["s2.result"])}</li>
                        <li>S3 path: {String(state.flags["s3.path"])}</li>
                        <li>Helper Badge: {String(state.flags["ep.badgeHelper"])}</li>
                    </ul>
                    <div className="mt-3 p-3 border rounded">
                        <p className="font-medium">{t.ep.ngpTitle}</p>
                        <p className="text-sm opacity-80">{t.ep.ngpNote}</p>
                    </div>
                </div>
            );
        },
    },
];

export function RiteOfDiscoveryGame() {
    return (
        <SceneController scenes={scenes} initial={{scene: "S1", flags: {}, inventory: []}} saveKey="rod:save:v1"/>
    );
}

export default RiteOfDiscoveryGame;
