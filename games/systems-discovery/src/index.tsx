"use client";
import React from "react";
import {Scene, SceneController} from "@games/_engine";
import {sysStrings as t} from "./strings.en";

const scenes: Scene[] = [
    {
        id: "B1",
        title: t.b1.title,
        render: ({go, setFlag, state}) => {
            const gentle = Boolean(state.flags["gentle"]);
            const s1 = Boolean(state.flags["b1.kitchen"]);
            const s2 = Boolean(state.flags["b1.compost"]);
            const s3 = Boolean(state.flags["b1.soil"]);
            const s4 = Boolean(state.flags["b1.herbs"]);
            const canCompost = s1;
            const canSoil = s1 && s2;
            const canHerbs = s1 && s2 && s3;
            const done = s1 && s2 && s3 && s4;
            return (
                <div>
                    <p className="mb-2">{t.b1.prompt}</p>
                    {gentle && <p className="text-sm opacity-80 mb-2">{t.b1.hint}</p>}
                    <div role="group" aria-label="Loop steps" className="flex flex-wrap gap-2">
                        <button
                            className={`min-h-[44px] px-3 py-2 rounded border ${s1 ? "bg-amber-100" : "bg-background"}`}
                            aria-pressed={s1} onClick={() => setFlag("b1.kitchen", true)}>{t.b1.steps.kitchen}</button>
                        <button disabled={!canCompost}
                                className={`min-h-[44px] px-3 py-2 rounded border ${s2 ? "bg-amber-100" : "bg-background"} disabled:opacity-50`}
                                aria-pressed={s2}
                                onClick={() => setFlag("b1.compost", true)}>{t.b1.steps.compost}</button>
                        <button disabled={!canSoil}
                                className={`min-h-[44px] px-3 py-2 rounded border ${s3 ? "bg-amber-100" : "bg-background"} disabled:opacity-50`}
                                aria-pressed={s3} onClick={() => setFlag("b1.soil", true)}>{t.b1.steps.soil}</button>
                        <button disabled={!canHerbs}
                                className={`min-h-[44px] px-3 py-2 rounded border ${s4 ? "bg-amber-100" : "bg-background"} disabled:opacity-50`}
                                aria-pressed={s4} onClick={() => setFlag("b1.herbs", true)}>{t.b1.steps.herbs}</button>
                    </div>
                    <div className="mt-3">
                        <button
                            className="min-h-[44px] px-4 py-2 rounded bg-primary text-primary-foreground disabled:opacity-50"
                            disabled={!done} onClick={() => {
                            setFlag("b1.route", "loop-ok");
                            go("B2");
                        }}>{t.b1.continue}</button>
                    </div>
                </div>
            );
        },
    },
    {
        id: "B2",
        title: t.b2.title,
        render: ({go, setFlag}) => (
            <div>
                <p>{t.b2.prompt}</p>
                <div className="grid gap-2 sm:grid-cols-2" role="group" aria-label="Route plan">
                    <button className="min-h-[44px] px-3 py-2 rounded border" onClick={() => {
                        setFlag("b2.plan", "bus-first");
                        go("B3");
                    }}>{t.b2.busFirst}</button>
                    <button className="min-h-[44px] px-3 py-2 rounded border" onClick={() => {
                        setFlag("b2.plan", "bike-first");
                        go("B3");
                    }}>{t.b2.bikeFirst}</button>
                </div>
            </div>
        ),
    },
    {
        id: "B3",
        title: t.b3.title,
        render: ({go, setFlag, state}) => {
            const hint = Boolean(state.flags["b3.hints"]);
            const a = Boolean(state.flags["b3.banana"]);
            const b = Boolean(state.flags["b3.bottle"]);
            const c = Boolean(state.flags["b3.paper"]);
            const solved = a && b && c;
            return (
                <div>
                    <p className="mb-2">{t.b3.prompt}</p>
                    <div className="mb-2">
                        <button className="min-h-[32px] px-2 py-1 rounded border text-sm" aria-pressed={hint}
                                onClick={() => setFlag("b3.hints", !hint)}>{hint ? t.b3.hintsOn : t.b3.hintsOff}</button>
                    </div>
                    {hint && <p className="text-sm opacity-80">Banana → Compost; Bottle → Recycle; Paper → Paper.</p>}
                    <div role="group" aria-label="Sort items" className="flex gap-2 items-center">
                        <button
                            className={`min-h-[44px] px-3 py-2 rounded border ${a ? "bg-amber-100" : "bg-background"}`}
                            aria-pressed={a} onClick={() => setFlag("b3.banana", !a)}>{t.b3.items.banana}</button>
                        <button
                            className={`min-h-[44px] px-3 py-2 rounded border ${b ? "bg-amber-100" : "bg-background"}`}
                            aria-pressed={b} onClick={() => setFlag("b3.bottle", !b)}>{t.b3.items.bottle}</button>
                        <button
                            className={`min-h-[44px] px-3 py-2 rounded border ${c ? "bg-amber-100" : "bg-background"}`}
                            aria-pressed={c} onClick={() => setFlag("b3.paper", !c)}>{t.b3.items.paper}</button>
                    </div>
                    <div className="mt-3">
                        <button
                            className="min-h-[44px] px-4 py-2 rounded bg-primary text-primary-foreground disabled:opacity-50"
                            disabled={!solved} onClick={() => {
                            setFlag("b3.result", hint ? "sorted" : "sorted-nohints");
                            go("WRAP");
                        }}>{t.b3.reveal}</button>
                    </div>
                </div>
            );
        },
    },
    {
        id: "WRAP",
        title: t.wrap.title,
        render: ({state}) => (
            <div>
                <p>{t.wrap.done}</p>
                <ul className="list-disc ml-6">
                    <li>{t.wrap.b1}: {String(state.flags["b1.route"])}</li>
                    <li>{t.wrap.b2}: {String(state.flags["b2.plan"])}</li>
                    <li>{t.wrap.b3}: {String(state.flags["b3.result"])}</li>
                </ul>
            </div>
        ),
    },
];

export function SystemsDiscoveryGame() {
    return (
        <SceneController scenes={scenes} initial={{scene: "B1", flags: {}, inventory: []}} saveKey="sysdisc:save:v1"/>
    );
}

export default SystemsDiscoveryGame;
