"use client";

import React, {useEffect, useMemo, useState} from "react";
import {DialogueBox, GameContainer, InventoryBar} from "@games/shared";
import {
    detectLang,
    effects,
    ensureCtx,
    type Lang,
    load,
    nextScene,
    save,
    type Scene,
} from "@games/shared/pointclick/engine";
import {clearKeypad, createKeypadState, pressKey, submitKeypad,} from "@games/shared/pointclick/puzzles/keypad";
import {
    createGearsState,
    evaluateGears,
    type GearsState,
    setTeeth as setGearTeeth,
} from "@games/shared/pointclick/puzzles/gears";

const SAVE_KEY = "tme:save:v1";

export const ToymakerEscapeGame: React.FC = () => {
    const lang = useMemo<Lang>(() => detectLang(), []);
    const scenes = useMemo<Record<string, Scene>>(
        () => ({
            INTRO: {
                id: "INTRO",
                title: {
                    en: "Toymaker Escape — Intro",
                    fr: "Toymaker Escape — Intro",
                },
                body: {
                    en: "A late evening at the atelier. Something is amiss...",
                    fr: "Un soir tard dans l'atelier. Quelque chose cloche...",
                },
                choices: [
                    {id: "begin", text: {en: "Begin", fr: "Commencer"}, target: "E1_GEAR"},
                ],
            },
            E1_GEAR: {
                id: "E1_GEAR",
                title: {en: "Episode 1 — Gears", fr: "Épisode 1 — Engrenages"},
                body: {
                    en: "Align the gears to open the panel (MVP placeholder puzzle).",
                    fr: "Alignez les engrenages pour ouvrir le panneau (puzzle MVP).",
                },
                choices: [
                    {
                        id: "solve",
                        text: {en: "Turn gears", fr: "Tourner les engrenages"},
                        target: "E1_WRAP",
                        effect: (ctx) => ({...ctx, gearSolved: true}),
                    },
                ],
            },
            E1_WRAP: {
                id: "E1_WRAP",
                title: {en: "Wrap — Episode 1", fr: "Conclusion — Épisode 1"},
                body: {
                    en: "You found the hidden compartment. Medal earned: Gear Whisperer.",
                    fr: "Vous avez trouvé le compartiment secret. Médaille: Chuchoteur d'engrenages.",
                },
                choices: [
                    {id: "restart", text: {en: "Restart", fr: "Recommencer"}, target: "INTRO", effect: () => ({})},
                ],
            },
        }),
        [],
    );

    const [sceneId, setSceneId] = useState<string>(() => load(SAVE_KEY)?.sceneId || "INTRO");
    const [ctx, setCtx] = useState(() => ensureCtx(load(SAVE_KEY)?.ctx || {}));
    const [keypad, setKeypad] = useState(() => createKeypadState());
    // Simple gears mini: input → idler → output, with a target ratio of 1/3
    const [gears, setGears] = useState<GearsState>(() =>
        createGearsState(
            [
                {id: "in", teeth: 20},
                {id: "idle", teeth: 30},
                {id: "out", teeth: 60},
            ],
            [
                {a: "in", b: "idle"},
                {a: "idle", b: "out"},
            ],
            "in",
            "out",
            1 / 3,
        ),
    );

    useEffect(() => {
        save(SAVE_KEY, {v: 1, sceneId, ctx});
    }, [sceneId, ctx]);

    const scene = scenes[sceneId];

    return (
        <GameContainer
            title={scene?.title[lang] || "Toymaker Escape"}
            description={scene?.body?.[lang]}
            lockTouch={false}
            showParticleControls={false}
        >
            <div role="application" aria-label="Toymaker Escape" className="p-4">
                <h2 className="text-2xl font-bold mb-2" aria-live="polite">
                    {scene?.title[lang]}
                </h2>
                {scene?.body && (
                    <p className="mb-4 text-muted-foreground">{scene.body[lang]}</p>
                )}

                {/* Episode 1 keypad mini (simple mobile-friendly UI) */}
                {sceneId === "E1_GEAR" && (
                    <div className="mb-4 rounded-md border p-3">
                        <p className="mb-2 text-sm">{lang === "fr" ? "Entrez le code pour déverrouiller (2413)" : "Enter the code to unlock (2413)"}</p>
                        <div className="grid grid-cols-3 gap-2 max-w-xs">
                            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].map((d) => (
                                <button
                                    key={d}
                                    className="min-h-11 px-4 py-2 rounded bg-muted hover:bg-muted/80"
                                    onClick={() => setKeypad((s) => pressKey(s, d, {code: "2413"}))}
                                >
                                    {d}
                                </button>
                            ))}
                            <button
                                className="col-span-2 min-h-11 px-4 py-2 rounded bg-gray-200 dark:bg-gray-700"
                                onClick={() => setKeypad((s) => clearKeypad(s))}
                            >
                                {lang === "fr" ? "Effacer" : "Clear"}
                            </button>
                            <button
                                className="min-h-11 px-4 py-2 rounded bg-primary text-primary-foreground"
                                onClick={() => {
                                    setKeypad((s) => {
                                        const next = submitKeypad(s, {code: "2413"});
                                        if (next.solved) {
                                            const updated = effects.addItem("gear-key")(ctx);
                                            setCtx(updated);
                                        }
                                        return next;
                                    });
                                }}
                            >
                                {lang === "fr" ? "Valider" : "Submit"}
                            </button>
                        </div>
                        <div className="mt-2 text-sm">
                            {lang === "fr" ? "Entrée:" : "Input:"} <b>{keypad.input}</b>{" "}
                            {keypad.solved &&
                                <span className="text-green-600">{lang === "fr" ? "Déverrouillé" : "Unlocked"}</span>}
                        </div>
                        {/* Gears mini (ratio 1/3) — adjust teeth to achieve target */}
                        <div className="mt-4">
                            <p className="mb-2 text-sm">
                                {lang === "fr"
                                    ? "Réglez les engrenages pour obtenir un rapport 1:3 (sortie = 1/3 de la vitesse d'entrée)."
                                    : "Adjust the gears to achieve a 1:3 ratio (output = 1/3 of input speed)."}
                            </p>
                            <div className="flex flex-col gap-2 max-w-md">
                                {["in", "idle", "out"].map((id) => (
                                    <div key={id} className="flex items-center gap-2">
                                        <span className="w-16 text-sm uppercase text-muted-foreground">{id}</span>
                                        <button
                                            className="px-3 py-2 rounded bg-gray-200 dark:bg-gray-700"
                                            aria-label={`- teeth ${id}`}
                                            onClick={() =>
                                                setGears((s) =>
                                                    setGearTeeth(
                                                        s,
                                                        id,
                                                        Math.max(10, (s.gears.find((g) => g.id === id)?.teeth || 10) - 10),
                                                    ),
                                                )
                                            }
                                        >
                                            −10
                                        </button>
                                        <span className="min-w-10 text-center">
                                            {gears.gears.find((g) => g.id === id)?.teeth}
                                        </span>
                                        <button
                                            className="px-3 py-2 rounded bg-gray-200 dark:bg-gray-700"
                                            aria-label={`+ teeth ${id}`}
                                            onClick={() =>
                                                setGears((s) =>
                                                    setGearTeeth(
                                                        s,
                                                        id,
                                                        Math.min(120, (s.gears.find((g) => g.id === id)?.teeth || 10) + 10),
                                                    ),
                                                )
                                            }
                                        >
                                            +10
                                        </button>
                                    </div>
                                ))}
                                <div className="text-sm">
                                    {lang === "fr" ? "Résultat:" : "Result:"}{" "}
                                    <b>{evaluateGears(gears).solved ? (lang === "fr" ? "Correct" : "Correct") : (lang === "fr" ? "Incorrect" : "Incorrect")}</b>
                                </div>
                                {evaluateGears(gears).solved && (
                                    <button
                                        className="self-start mt-1 px-4 py-2 rounded bg-emerald-600 text-white"
                                        onClick={() => {
                                            // Mark mini solved and allow wrap progression
                                            setCtx((c) => ({...c, gearSolved: true}));
                                        }}
                                    >
                                        {lang === "fr" ? "Valider l'engrenage" : "Confirm gears"}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <DialogueBox
                    scene={scene}
                    lang={lang}
                    onChoose={(choiceId) => {
                        const res = nextScene(sceneId, scenes, choiceId, ctx);
                        setSceneId(res.sceneId);
                        setCtx(res.ctx);
                        if (res.sceneId === "E1_WRAP") {
                            // award a simple medal flag when reaching wrap (placeholder)
                            setCtx((c) => effects.setFlag("medal:gear", true)(ensureCtx(c)));
                        }
                    }}
                />

                <InventoryBar items={ctx.inventory} onUse={() => { /* future: apply items to hotspots */
                }}/>
            </div>
        </GameContainer>
    );
};

export default ToymakerEscapeGame;
