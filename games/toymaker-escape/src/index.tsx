"use client";
import {Scene, SceneController} from "@games/_engine";
import React from "react";
import {t} from "@/lib/i18n";

const scenes: Scene[] = [
    {
        id: "TME_INTRO",
        title: t("tme.intro2.title"),
        render: ({go, setFlag}) => (
            <div>
                <p className="mb-2">{t("tme.intro2.p1")}</p>
                <p className="mb-4 opacity-80">{t("tme.intro2.p2")}</p>
                <div className="flex gap-2">
                    <button className="min-h-[44px] px-4 py-2 rounded bg-primary text-primary-foreground"
                            onClick={() => {
                                setFlag("intro.seen", true);
                                go("E1A");
                            }}>{t("tme.intro2.cta")}</button>
                    <button className="min-h-[44px] px-3 py-2 rounded border"
                            onClick={() => {
                                setFlag("intro.seen", true);
                                go("E1A");
                            }}>{t("tme.intro2.skip")}</button>
                </div>
            </div>
        ),
    },
    {
        id: "E1A",
        title: t("tme.intro.title"),
        render: ({go, setFlag, addItem, state}) => {
            const path = String(state.flags["e1.path"] ?? "gears");
            const gentle = Boolean(state.flags["gentle"]);
            // Simple interactive mini for one route (gears): three dials must be set to 1‑3‑2
            const d1 = Number(state.flags["e1a.d1"] ?? 1);
            const d2 = Number(state.flags["e1a.d2"] ?? 1);
            const d3 = Number(state.flags["e1a.d3"] ?? 1);
            const rotate = (k: string, v: number) => setFlag(k, (v % 3) + 1);
            const solvedGears = d1 === 1 && d2 === 3 && d3 === 2;
            // Music mini: three sliders 0-9 target 2-5-7
            const s1 = Number(state.flags["e1a.s1"] ?? 0);
            const s2 = Number(state.flags["e1a.s2"] ?? 0);
            const s3 = Number(state.flags["e1a.s3"] ?? 0);
            const setSlider = (k: string, v: number) => setFlag(k, Math.max(0, Math.min(9, v)));
            const solvedMusic = s1 === 2 && s2 === 5 && s3 === 7;
            const solved = path === "gears" ? solvedGears : solvedMusic;
            return (
                <div>
                    <p className="mb-2">{t("tme.intro.prompt")}</p>
                    {/* Minimal art placeholders */}
                    <img src="/assets/tme/workshop_bg.svg" alt="Workshop background"
                         className="w-full h-32 object-cover rounded mb-3"/>
                    <div className="mb-3">
                        <div className="text-sm font-medium mb-1">Choose path</div>
                        <div className="grid gap-2 sm:grid-cols-2" role="group" aria-label="Workshop path">
                            <button
                                className={`min-h-[44px] px-3 py-2 rounded border ${path === "gears" ? "bg-amber-100" : "bg-background"}`}
                                aria-pressed={path === "gears"}
                                onClick={() => setFlag("e1.path", "gears")}
                            >{t("tme.intro.gears")}</button>
                            <button
                                className={`min-h-[44px] px-3 py-2 rounded border ${path === "music" ? "bg-amber-100" : "bg-background"}`}
                                aria-pressed={path === "music"}
                                onClick={() => setFlag("e1.path", "music")}
                            >{t("tme.intro.music")}</button>
                        </div>
                    </div>
                    {path === "gears" ? (
                        <div aria-label="Gear alignment" role="group" className="mb-2">
                            {gentle && <p className="text-sm opacity-80 mb-2">{t("tme.workshop.gears.hint")}</p>}
                            <div className="flex gap-2 items-center">
                                <button aria-label={`${t("tme.workshop.gears.dial")} 1 value ${d1}`}
                                        className="min-h-[44px] px-3 py-2 rounded border"
                                        onClick={() => rotate("e1a.d1", d1)}>{t("tme.workshop.gears.dial")} 1: {d1}</button>
                                <button aria-label={`${t("tme.workshop.gears.dial")} 2 value ${d2}`}
                                        className="min-h-[44px] px-3 py-2 rounded border"
                                        onClick={() => rotate("e1a.d2", d2)}>{t("tme.workshop.gears.dial")} 2: {d2}</button>
                                <button aria-label={`${t("tme.workshop.gears.dial")} 3 value ${d3}`}
                                        className="min-h-[44px] px-3 py-2 rounded border"
                                        onClick={() => rotate("e1a.d3", d3)}>{t("tme.workshop.gears.dial")} 3: {d3}</button>
                            </div>
                            <div className="text-sm opacity-80 mt-1">{t("tme.workshop.gears.current")}:
                                [{d1}-{d2}-{d3}]
                            </div>
                        </div>
                    ) : (
                        <div className="mb-2" role="group" aria-label="Music sliders">
                            {gentle && <p className="text-sm opacity-80 mb-2">{t("tme.workshop.music.hint")}</p>}
                            <p className="mb-2">{t("tme.workshop.music.prompt")}</p>
                            <div className="flex flex-col gap-2 max-w-sm">
                                <label className="flex items-center gap-2 text-sm">
                                    <span className="w-24">{t("tme.workshop.music.s1")}:</span>
                                    <input type="range" min={0} max={9} step={1} aria-label={t("tme.workshop.music.s1")}
                                           value={s1}
                                           onChange={(e) => setSlider("e1a.s1", Number((e.target as HTMLInputElement).value))}
                                           className="w-full"/>
                                    <span aria-hidden className="w-6 text-right">{s1}</span>
                                </label>
                                <label className="flex items-center gap-2 text-sm">
                                    <span className="w-24">{t("tme.workshop.music.s2")}:</span>
                                    <input type="range" min={0} max={9} step={1} aria-label={t("tme.workshop.music.s2")}
                                           value={s2}
                                           onChange={(e) => setSlider("e1a.s2", Number((e.target as HTMLInputElement).value))}
                                           className="w-full"/>
                                    <span aria-hidden className="w-6 text-right">{s2}</span>
                                </label>
                                <label className="flex items-center gap-2 text-sm">
                                    <span className="w-24">{t("tme.workshop.music.s3")}:</span>
                                    <input type="range" min={0} max={9} step={1} aria-label={t("tme.workshop.music.s3")}
                                           value={s3}
                                           onChange={(e) => setSlider("e1a.s3", Number((e.target as HTMLInputElement).value))}
                                           className="w-full"/>
                                    <span aria-hidden className="w-6 text-right">{s3}</span>
                                </label>
                            </div>
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
                        >{t(path === "gears" ? "tme.workshop.gears.continue" : "tme.workshop.music.continue")}
                        </button>
                    </div>
                </div>
            );
        },
    },
    {
        id: "E1B",
        title: t("tme.playroom.intro.title"),
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
                    <img src="/assets/tme/playroom_bg.svg" alt="Playroom background"
                         className="w-full h-32 object-cover rounded mb-3"/>
                    <p className="mb-2">{t("tme.playroom.intro.prompt")}</p>
                    <div className="mb-2">
                        <div className="text-sm font-medium mb-1">Hints</div>
                        <div className="grid gap-2 sm:grid-cols-2" role="group" aria-label="Hints toggle">
                            <button
                                className={`min-h-[44px] px-3 py-2 rounded border ${helper === "hints" ? "bg-amber-100" : "bg-background"}`}
                                aria-pressed={helper === "hints"}
                                onClick={() => setFlag("e1.helper", "hints")}>{t("tme.playroom.colors.hint").replace("Gentle hint: ", "Use hints")}</button>
                            <button
                                className={`min-h-[44px] px-3 py-2 rounded border ${helper === "noHints" ? "bg-amber-100" : "bg-background"}`}
                                aria-pressed={helper === "noHints"}
                                onClick={() => setFlag("e1.helper", "noHints")}>No hints
                            </button>
                        </div>
                    </div>
                    <div role="group" aria-label="Sorter" className="flex gap-2 items-center">
                        {gentle && <p className="text-sm opacity-80 mr-2">{t("tme.playroom.colors.hint")}</p>}
                        <button
                            className={`min-h-[44px] px-3 py-2 rounded border ${a ? "bg-amber-100" : "bg-background"}`}
                            aria-pressed={a} onClick={() => toggle("e1b.red", a)}>{t("tme.playroom.colors.red")}
                        </button>
                        <button
                            className={`min-h-[44px] px-3 py-2 rounded border ${b ? "bg-amber-100" : "bg-background"}`}
                            aria-pressed={b} onClick={() => toggle("e1b.blue", b)}>{t("tme.playroom.colors.blue")}
                        </button>
                        <button
                            className={`min-h-[44px] px-3 py-2 rounded border ${c ? "bg-amber-100" : "bg-background"}`}
                            aria-pressed={c} onClick={() => toggle("e1b.green", c)}>{t("tme.playroom.colors.green")}
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
                        >{t("tme.playroom.colors.reveal")}
                        </button>
                    </div>
                </div>
            );
        },
    },
    {
        id: "DONE",
        title: t("tme.ep.title"),
        render: ({state, setFlag, go}) => {
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
                    <div className="my-2">
                        <img src="/assets/tme/key_fragment_1.svg" alt="Key Fragment 1" className="h-12 w-12"/>
                    </div>
                    <p>{t("tme.ep.done")}</p>
                    <ul className="list-disc ml-6">
                        <li>{t("tme.ep.path")}: {String(state.flags["e1.path"])}</li>
                        <li>{t("tme.ep.helper")}: {String(state.flags["e1.helper"])}</li>
                        <li>{t("tme.ep.medal")}: {String(state.flags["medals.e1"])}</li>
                    </ul>
                    <p className="mt-2 opacity-80 text-sm">{t("tme.ep.note")}</p>
                    <div className="mt-3">
                        <button className="min-h-[44px] px-4 py-2 rounded bg-secondary text-secondary-foreground"
                                onClick={() => go("TME_OUTRO")}>View outro
                        </button>
                    </div>
                </div>
            );
        },
    },
    {
        id: "TME_OUTRO",
        title: t("tme.outro.title"),
        render: ({state, setFlag, go}) => (
            <div>
                <p className="mb-2">{t("tme.outro.p1")}</p>
                <div className="mb-3">
                    <div className="font-medium">{t("tme.outro.recap.medal")}:</div>
                    <div className="ml-4">{String(state.flags["medals.e1"])}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button className="min-h-[44px] px-3 py-2 rounded border" onClick={() => {
                        setFlag("outro.seen", true);
                        go("E1A");
                    }}>{t("tme.outro.replay")}</button>
                    <button className="min-h-[44px] px-3 py-2 rounded border" onClick={() => {
                        setFlag("outro.seen", true);
                        const current = String(state.flags["e1.path"] ?? "gears");
                        setFlag("e1.path", current === "gears" ? "music" : "gears");
                        go("E1A");
                    }}>{t("tme.outro.switchRoute")}</button>
                    <button className="min-h-[44px] px-3 py-2 rounded border" onClick={() => {
                        setFlag("outro.seen", true);
                        const cur = String(state.flags["e1.helper"] ?? "hints");
                        setFlag("e1.helper", cur === "hints" ? "noHints" : "hints");
                    }}>{t("tme.outro.toggleHints")}</button>
                </div>
            </div>
        ),
    },
];

export function ToymakerEscapeGame() {
    return (
        <SceneController scenes={scenes} initial={{scene: "TME_INTRO", flags: {}, inventory: []}}
                         saveKey="tme:save:v1"/>
    );
}

export default ToymakerEscapeGame;
