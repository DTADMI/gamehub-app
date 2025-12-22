"use client";
import {Scene, SceneController} from "@games/_engine";
import React from "react";
import {t} from "@/lib/i18n";

const scenes: Scene[] = [
    {
        id: "SD_INTRO",
        title: t("sysdisc.intro.title"),
        render: ({go, setFlag}) => (
            <div>
                <p className="mb-2">{t("sysdisc.intro.p1")}</p>
                <p className="mb-4 opacity-80">{t("sysdisc.intro.p2")}</p>
                <div className="flex gap-2">
                    <button className="min-h-[44px] px-4 py-2 rounded bg-primary text-primary-foreground"
                            onClick={() => {
                                setFlag("intro.seen", true);
                                go("B1");
                            }}>{t("sysdisc.intro.cta")}</button>
                    <button className="min-h-[44px] px-3 py-2 rounded border"
                            onClick={() => {
                                setFlag("intro.seen", true);
                                go("B1");
                            }}>{t("sysdisc.intro.skip")}</button>
                </div>
            </div>
        ),
    },
    {
        id: "B1",
        title: t("sysdisc.b1.title"),
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
                    <p className="mb-2">{t("sysdisc.b1.prompt")}</p>
                    {gentle && <p className="text-sm opacity-80 mb-2">{t("sysdisc.b1.hint")}</p>}
                    <div role="group" aria-label="Loop steps" className="flex flex-wrap gap-2">
                        <button
                            className={`min-h-[44px] px-3 py-2 rounded border ${s1 ? "bg-amber-100" : "bg-background"}`}
                            aria-pressed={s1}
                            onClick={() => setFlag("b1.kitchen", true)}>{t("sysdisc.b1.steps.kitchen")}</button>
                        <button disabled={!canCompost}
                                className={`min-h-[44px] px-3 py-2 rounded border ${s2 ? "bg-amber-100" : "bg-background"} disabled:opacity-50`}
                                aria-pressed={s2}
                                onClick={() => setFlag("b1.compost", true)}>{t("sysdisc.b1.steps.compost")}</button>
                        <button disabled={!canSoil}
                                className={`min-h-[44px] px-3 py-2 rounded border ${s3 ? "bg-amber-100" : "bg-background"} disabled:opacity-50`}
                                aria-pressed={s3}
                                onClick={() => setFlag("b1.soil", true)}>{t("sysdisc.b1.steps.soil")}</button>
                        <button disabled={!canHerbs}
                                className={`min-h-[44px] px-3 py-2 rounded border ${s4 ? "bg-amber-100" : "bg-background"} disabled:opacity-50`}
                                aria-pressed={s4}
                                onClick={() => setFlag("b1.herbs", true)}>{t("sysdisc.b1.steps.herbs")}</button>
                    </div>
                    <div className="mt-3">
                        <button
                            className="min-h-[44px] px-4 py-2 rounded bg-primary text-primary-foreground disabled:opacity-50"
                            disabled={!done} onClick={() => {
                            setFlag("b1.route", "loop-ok");
                            go("B2");
                        }}>{t("sysdisc.b1.continue")}</button>
                    </div>
                </div>
            );
        },
    },
    {
        id: "B2",
        title: t("sysdisc.b2.title"),
        render: ({go, setFlag}) => (
            <div>
                <p>{t("sysdisc.b2.prompt")}</p>
                <div className="grid gap-2 sm:grid-cols-2" role="group" aria-label="Route plan">
                    <button className="min-h-[44px] px-3 py-2 rounded border" onClick={() => {
                        setFlag("b2.plan", "bus-first");
                        go("B3");
                    }}>{t("sysdisc.b2.busFirst")}</button>
                    <button className="min-h-[44px] px-3 py-2 rounded border" onClick={() => {
                        setFlag("b2.plan", "bike-first");
                        go("B3");
                    }}>{t("sysdisc.b2.bikeFirst")}</button>
                </div>
            </div>
        ),
    },
    {
        id: "B3",
        title: t("sysdisc.b3.title"),
        render: ({go, setFlag, state}) => {
            const hint = Boolean(state.flags["b3.hints"]);
            const a = Boolean(state.flags["b3.banana"]);
            const b = Boolean(state.flags["b3.bottle"]);
            const c = Boolean(state.flags["b3.paper"]);
            const solved = a && b && c;
            return (
                <div>
                    <p className="mb-2">{t("sysdisc.b3.prompt")}</p>
                    <div className="mb-2">
                        <button className="min-h-[32px] px-2 py-1 rounded border text-sm" aria-pressed={hint}
                                onClick={() => setFlag("b3.hints", !hint)}>{hint ? t("sysdisc.b3.hintsOn") : t("sysdisc.b3.hintsOff")}</button>
                    </div>
                    {hint && <p className="text-sm opacity-80">{t("sysdisc.b3.hintDetail")}</p>}
                    <div role="group" aria-label="Sort items" className="flex gap-2 items-center">
                        <button
                            className={`min-h-[44px] px-3 py-2 rounded border ${a ? "bg-amber-100" : "bg-background"}`}
                            aria-pressed={a}
                            onClick={() => setFlag("b3.banana", !a)}>{t("sysdisc.b3.items.banana")}</button>
                        <button
                            className={`min-h-[44px] px-3 py-2 rounded border ${b ? "bg-amber-100" : "bg-background"}`}
                            aria-pressed={b}
                            onClick={() => setFlag("b3.bottle", !b)}>{t("sysdisc.b3.items.bottle")}</button>
                        <button
                            className={`min-h-[44px] px-3 py-2 rounded border ${c ? "bg-amber-100" : "bg-background"}`}
                            aria-pressed={c}
                            onClick={() => setFlag("b3.paper", !c)}>{t("sysdisc.b3.items.paper")}</button>
                    </div>
                    <div className="mt-3">
                        <button
                            className="min-h-[44px] px-4 py-2 rounded bg-primary text-primary-foreground disabled:opacity-50"
                            disabled={!solved} onClick={() => {
                            setFlag("b3.result", hint ? "sorted" : "sorted-nohints");
                            go("WRAP");
                        }}>{t("sysdisc.b3.reveal")}</button>
                    </div>
                </div>
            );
        },
    },
    {
        id: "WRAP",
        title: t("sysdisc.wrap.title"),
        render: ({state, setFlag, go}) => {
            if (!state.flags["ep.badgeApplied"]) {
                setFlag("ep.badgeSystemsScout", true);
                setFlag("ep.badgeApplied", true);
                setFlag("saveVersion", 1);
            }
            return (
                <div>
                    <p>{t("sysdisc.wrap.done")}</p>
                    <div className="my-2">
                        <img src="/assets/sysdisc/badge_systems_scout.svg" alt="Systems Scout badge"
                             className="h-12 w-12"/>
                    </div>
                    <ul className="list-disc ml-6">
                        <li>{t("sysdisc.wrap.b1")}: {String(state.flags["b1.route"])}</li>
                        <li>{t("sysdisc.wrap.b2")}: {String(state.flags["b2.plan"])}</li>
                        <li>{t("sysdisc.wrap.b3")}: {String(state.flags["b3.result"])}</li>
                        <li>Badge: {String(state.flags["ep.badgeSystemsScout"])}</li>
                    </ul>
                    <div className="mt-3">
                        <button className="min-h-[44px] px-4 py-2 rounded bg-secondary text-secondary-foreground"
                                onClick={() => go("SD_OUTRO")}>View outro
                        </button>
                    </div>
                </div>
            );
        },
    },
    {
        id: "SD_OUTRO",
        title: t("sysdisc.outro.title"),
        render: ({state, setFlag, go}) => (
            <div>
                <p className="mb-2">{t("sysdisc.outro.p1")}</p>
                <div className="mb-3">
                    <div className="font-medium">{t("sysdisc.outro.recap")}:</div>
                    <ul className="list-disc ml-6">
                        <li>B1: {String(state.flags["b1.route"])}</li>
                        <li>B2: {String(state.flags["b2.plan"])}</li>
                        <li>B3: {String(state.flags["b3.result"])}</li>
                    </ul>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button className="min-h-[44px] px-3 py-2 rounded border" onClick={() => {
                        setFlag("outro.seen", true);
                        go("B1");
                    }}>{t("sysdisc.outro.replay")}</button>
                    <button className="min-h-[44px] px-3 py-2 rounded border" onClick={() => {
                        setFlag("outro.seen", true);
                        const cur = String(state.flags["b2.plan"] ?? "bus-first");
                        setFlag("b2.plan", cur === "bus-first" ? "bike-first" : "bus-first");
                        go("B2");
                    }}>{t("sysdisc.outro.altPlan")}</button>
                    <button className="min-h-[44px] px-3 py-2 rounded border" onClick={() => {
                        setFlag("outro.seen", true);
                        setFlag("b3.hints", !Boolean(state.flags["b3.hints"]));
                    }}>{t("sysdisc.outro.toggleHints")}</button>
                </div>
            </div>
        ),
    },
];

export function SystemsDiscoveryGame() {
    return (
        <SceneController scenes={scenes} initial={{scene: "SD_INTRO", flags: {}, inventory: []}}
                         saveKey="sysdisc:save:v1"/>
    );
}

export default SystemsDiscoveryGame;
