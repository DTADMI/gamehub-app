"use client";
import {ChoiceList, Scene, SceneController} from "@games/_engine";
import React from "react";

import {t} from "@/lib/i18n";

const scenes: Scene[] = [
    {
        id: "ROD_INTRO",
        title: t("rod.intro.title"),
        render: ({go, setFlag}) => (
            <div>
                <p className="mb-2">{t("rod.intro.p1")}</p>
                <p className="mb-4 opacity-80">{t("rod.intro.p2")}</p>
                <div className="flex gap-2">
                    <button
                        className="min-h-[44px] px-4 py-2 rounded bg-primary text-primary-foreground"
                        onClick={() => {
                            setFlag("intro.seen", true);
                            go("S1");
                        }}
                    >{t("rod.intro.cta")}</button>
                    <button
                        className="min-h-[44px] px-3 py-2 rounded border"
                        onClick={() => {
                            setFlag("intro.seen", true);
                            go("S1");
                        }}
                    >{t("rod.intro.skip")}</button>
                </div>
            </div>
        ),
    },
    {
        id: "S1",
        title: t("rod.s1.title"),
        render: ({go, setFlag, addItem, state}) => {
            const p1 = Number(state.flags["s1.p1"] ?? 2);
            const p2 = Number(state.flags["s1.p2"] ?? 3);
            const p3 = Number(state.flags["s1.p3"] ?? 1);
            const gentle = Boolean(state.flags["gentle"]);
            const cycle = (key: string, current: number) => setFlag(key, current % 3 + 1);
            const solved = p1 === 1 && p2 === 2 && p3 === 3;
            return (
                <div>
                    {/* Minimal final art placeholders */}
                    <img src="/assets/rod/bg.svg" alt="Room background"
                         className="w-full h-32 object-cover rounded mb-3"/>
                    <div className="flex gap-2 mb-3" aria-label="Scene props">
                        <img src="/assets/rod/prop_1.svg" alt="Table prop" className="h-12 w-12"/>
                        <img src="/assets/rod/prop_2.svg" alt="Lamp prop" className="h-12 w-12"/>
                    </div>
                    <p className="mb-1">{t("rod.s1.prompt")}</p>
                    {gentle && (
                        <p className="text-sm opacity-80 mb-2">{t("rod.s1.hint")}</p>
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
                        >{t("rod.s1.continue")}
                        </button>
                    </div>
                </div>
            );
        },
    },
    {
        id: "S2",
        title: t("rod.s2.title"),
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
                    <p className="mb-1">{t("rod.s2.prompt")}</p>
                    {gentle && (
                        <p className="text-sm opacity-80 mb-2">{t("rod.s2.hint")} {wrongAndGentleHint && "Hint: One mismatch is near the lower right."}</p>
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
                        >{t("rod.s2.check")}
                        </button>
                        <button
                            className="min-h-[44px] px-4 py-2 rounded bg-primary text-primary-foreground disabled:opacity-50"
                            disabled={!allMatched}
                            onClick={() => {
                                setFlag("s2.result", allMatched ? "match" : "miss1");
                                addItem("note");
                                go("S3");
                            }}
                        >{t("rod.s2.continue")}
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
                        >{t("rod.s2.reset")}
                        </button>
                    </div>
                </div>
            );
        },
    },
    {
        id: "S3",
        title: t("rod.s3.title"),
        render: ({go, setFlag, addItem, state}) => (
            <div>
                <p>{t("rod.s3.prompt")}</p>
                {Boolean(state.flags["gentle"]) && (
                    <p className="text-sm opacity-80 mb-2">{t("rod.s3.gentle")}</p>
                )}
                <ChoiceList
                    choices={[
                        {id: "receipt", label: t("rod.s3.receipt"), next: "EP"},
                        {id: "overhear", label: t("rod.s3.overhear"), next: "EP"},
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
        title: t("rod.ep.title"),
        render: ({setFlag, state, go}) => {
            // auto-unlock Helper Badge once (idempotent)
            if (!state.flags["ep.badgeApplied"]) {
                setFlag("ep.badgeHelper", true);
                setFlag("ep.badgeApplied", true);
                // also stamp saveVersion
                setFlag("saveVersion", 1);
            }
            return (
                <div>
                    <p>{t("rod.ep.done")}</p>
                    <div className="my-2">
                        <img src="/assets/rod/badge_helper.svg" alt="Helper Badge" className="h-12 w-12"/>
                    </div>
                    {Boolean(state.flags["gentle"]) && (
                        <p className="text-sm opacity-80">{t("rod.ep.gentle")}</p>
                    )}
                    <ul className="list-disc ml-6">
                        <li>S1 style: {String(state.flags["s1.style"])}</li>
                        <li>S2 result: {String(state.flags["s2.result"])}</li>
                        <li>S3 path: {String(state.flags["s3.path"])}</li>
                        <li>Helper Badge: {String(state.flags["ep.badgeHelper"])}</li>
                    </ul>
                    <div className="mt-3">
                        <button
                            className="min-h-[44px] px-4 py-2 rounded bg-secondary text-secondary-foreground"
                            onClick={() => go("ROD_OUTRO")}
                        >View outro
                        </button>
                    </div>
                    <div className="mt-3 p-3 border rounded">
                        <p className="font-medium">{t("rod.ep.ngpTitle")}</p>
                        <p className="text-sm opacity-80">{t("rod.ep.ngpNote")}</p>
                    </div>
                </div>
            );
        },
    },
    {
        id: "ROD_OUTRO",
        title: t("rod.outro.title"),
        render: ({state, setFlag, go}) => (
            <div>
                <p className="mb-2">{t("rod.outro.p1")}</p>
                <div className="mb-3">
                    <div className="font-medium">{t("rod.outro.recap")}:</div>
                    <ul className="list-disc ml-6">
                        <li>S3 path: {String(state.flags["s3.path"])}</li>
                        <li>Items: {state.inventory.join(", ") || "none"}</li>
                        <li>Helper Badge: {String(state.flags["ep.badgeHelper"])}</li>
                    </ul>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button className="min-h-[44px] px-3 py-2 rounded border" onClick={() => {
                        setFlag("outro.seen", true);
                        go("S1");
                    }}>{t("rod.outro.replay")}</button>
                    <button className="min-h-[44px] px-3 py-2 rounded border" onClick={() => {
                        setFlag("outro.seen", true);
                        setFlag("s3.path", undefined);
                        go("S3");
                    }}>{t("rod.outro.branchOther")}</button>
                    <button className="min-h-[44px] px-3 py-2 rounded border" onClick={() => {
                        setFlag("outro.seen", true);
                        setFlag("gentle", !Boolean(state.flags["gentle"]));
                    }}>{t("rod.outro.toggleGentle")}</button>
                </div>
            </div>
        ),
    },
];

export function RiteOfDiscoveryGame() {
    return (
        <SceneController scenes={scenes} initial={{scene: "ROD_INTRO", flags: {}, inventory: []}}
                         saveKey="rod:save:v1"/>
    );
}

export default RiteOfDiscoveryGame;
