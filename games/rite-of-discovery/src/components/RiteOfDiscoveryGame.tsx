"use client";

import React, {useEffect, useMemo, useState} from "react";
import {DialogueBox, GameContainer, InventoryBar} from "@games/shared";
import {detectLang, effects, ensureCtx, type Lang, nextScene, type Scene} from "@games/shared/pointclick/engine";
import {loadWithMigrations, SAVE_KEYS, versionedSave} from "@games/shared/pointclick/core/Persistence";
import {clearKeypad, createKeypadState, pressKey, submitKeypad} from "@games/shared/pointclick/puzzles/keypad";
import {createWiresState, setWiresConnection} from "@games/shared/pointclick/puzzles/wires";
import {t} from "@/lib/i18n";

const SAVE_KEY = SAVE_KEYS.rod;

export const RiteOfDiscoveryGame: React.FC = () => {
    const lang = useMemo<Lang>(() => detectLang(), []);

    // Puzzles state
    const [keypad, setKeypad] = useState(() => createKeypadState());
    const [wires, setWires] = useState(() => createWiresState(["L1", "L2"], ["R1", "R2"], {
        red: [{from: "L1", to: "R2"}],
        blue: [{from: "L2", to: "R1"}]
    }));

    const scenes = useMemo<Record<string, Scene>>(
        () => ({
            INTRO: {
                id: "INTRO",
                title: {en: t("rod.intro.title"), fr: t("rod.intro.title")},
                body: {
                    en: t("rod.intro.p1"),
                    fr: t("rod.intro.p1"),
                },
                choices: [
                    {id: "start", text: {en: t("rod.intro.cta"), fr: t("rod.intro.cta")}, target: "HALLWAY"},
                ],
            },
            HALLWAY: {
                id: "HALLWAY",
                title: {en: t("rod.hallway.title"), fr: t("rod.hallway.title")},
                body: {
                    en: t("rod.hallway.body"),
                    fr: t("rod.hallway.body"),
                },
                choices: [
                    {
                        id: "back",
                        text: {en: t("rod.hallway.goBack"), fr: t("rod.hallway.goBack")},
                        target: "INTRO"
                    }
                ],
            },
            KEYPAD_ZOOM: {
                id: "KEYPAD_ZOOM",
                title: {en: t("rod.keypad.title"), fr: t("rod.keypad.title")},
                body: {
                    en: t("rod.keypad.body"),
                    fr: t("rod.keypad.body"),
                },
                choices: [
                    {id: "exit", text: {en: t("rod.keypad.back"), fr: t("rod.keypad.back")}, target: "HALLWAY"}
                ]
            },
            WIRES_PANEL: {
                id: "WIRES_PANEL",
                title: {en: t("rod.wires.title"), fr: t("rod.wires.title")},
                body: {
                    en: t("rod.wires.body"),
                    fr: t("rod.wires.body"),
                },
                choices: [
                    {id: "exit", text: {en: t("rod.wires.back"), fr: t("rod.wires.back")}, target: "HALLWAY"}
                ]
            },
            INNER_CHAMBER: {
                id: "INNER_CHAMBER",
                title: {en: t("rod.chamber.title"), fr: t("rod.chamber.title")},
                body: {
                    en: t("rod.chamber.body"),
                    fr: t("rod.chamber.body"),
                },
                choices: [
                    {
                        id: "restart",
                        text: {en: t("rod.chamber.restart"), fr: t("rod.chamber.restart")},
                        target: "INTRO",
                        effect: () => ({})
                    }
                ]
            }
        }),
        [],
    );

    const [sceneId, setSceneId] = useState<string>(() => loadWithMigrations<any>(SAVE_KEY, 1)?.sceneId || "INTRO");
    const [ctx, setCtx] = useState(() => ensureCtx(loadWithMigrations<any>(SAVE_KEY, 1)?.ctx || {}));

    useEffect(() => {
        versionedSave(SAVE_KEY, 1, {sceneId, ctx});
    }, [sceneId, ctx]);

    const scene = scenes[sceneId];

    return (
        <GameContainer
            title={scene?.title[lang] || "Rite of Discovery"}
            description={scene?.body?.[lang]}
        >
            <div className="p-4 max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold mb-4">{scene?.title[lang]}</h2>
                <p className="mb-6">{scene?.body?.[lang] ?? ""}</p>

                {sceneId === "HALLWAY" && (
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <button
                            className="p-8 border rounded-lg hover:bg-muted text-center"
                            onClick={() => setSceneId("KEYPAD_ZOOM")}
                        >
                            {lang === "fr" ? "Examiner le pavé" : "Examine Keypad"}
                        </button>
                        <button
                            className="p-8 border rounded-lg hover:bg-muted text-center"
                            onClick={() => setSceneId("WIRES_PANEL")}
                        >
                            {lang === "fr" ? "Ouvrir le panneau" : "Open Panel"}
                        </button>
                    </div>
                )}

                {sceneId === "KEYPAD_ZOOM" && (
                    <div className="bg-muted p-6 rounded-lg mb-6">
                        <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto mb-4">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(n => (
                                <button
                                    key={n}
                                    className="min-h-11 h-12 w-12 border rounded bg-background hover:bg-accent"
                                    onClick={() => setKeypad(s => pressKey(s, n.toString(), {code: "1234"}))}
                                >
                                    {n}
                                </button>
                            ))}
                            <button
                                className="col-span-2 h-12 border rounded bg-background hover:bg-accent"
                                onClick={() => setKeypad(s => clearKeypad(s))}
                            >
                                {t("rod.keypad.clear")}
                            </button>
                            <button
                                className="h-12 border rounded bg-primary text-primary-foreground"
                                onClick={() => {
                                    const next = submitKeypad(keypad, {code: "1234"});
                                    setKeypad(next);
                                    if (next.solved) {
                                        setCtx(c => effects.setFlag("door.keypadSolved", true)(ensureCtx(c)));
                                    }
                                }}
                            >
                                {t("rod.keypad.submit")}
                            </button>
                        </div>
                        <div className="text-center font-mono text-xl tracking-widest h-8">
                            {t("rod.keypad.input")} {keypad.input.padEnd(4, '_')}
                        </div>
                        {ctx.flags["door.keypadSolved"] && (
                            <p className="text-green-500 text-center mt-2 font-bold">{t("rod.keypad.unlocked")}</p>
                        )}
                    </div>
                )}

                {sceneId === "WIRES_PANEL" && (
                    <div className="bg-muted p-6 rounded-lg mb-6">
                        <div className="flex flex-col gap-4">
                            {["red", "blue"].map(color => (
                                <div key={color} className="flex items-center gap-4">
                                    <span className="w-16 capitalize">{color}:</span>
                                    <select
                                        className="p-1 rounded border min-h-11"
                                        onChange={(e) => {
                                            const [l, r] = e.target.value.split("-");
                                            setWires(s => {
                                                const next = setWiresConnection(s, l, r, color as any);
                                                if (next.solved) setCtx(c => effects.setFlag("door.wiresSolved", true)(ensureCtx(c)));
                                                return next;
                                            });
                                        }}
                                    >
                                        <option
                                            value="">{lang === 'fr' ? 'Sélectionner...' : 'Select connection...'}</option>
                                        <option value="L1-R1">L1 to R1</option>
                                        <option value="L1-R2">L1 to R2</option>
                                        <option value="L2-R1">L2 to R1</option>
                                        <option value="L2-R2">L2 to R2</option>
                                    </select>
                                </div>
                            ))}
                        </div>
                        {ctx.flags["door.wiresSolved"] && (
                            <p className="text-green-500 text-center mt-4 font-bold">{t("rod.wires.solved")}</p>
                        )}
                    </div>
                )}

                {sceneId === "HALLWAY" && ctx.flags["door.keypadSolved"] && ctx.flags["door.wiresSolved"] && (
                    <button
                        className="w-full p-4 bg-primary text-primary-foreground rounded-lg mb-6 animate-pulse"
                        onClick={() => setSceneId("INNER_CHAMBER")}
                    >
                        {lang === "fr" ? "Entrer dans la chambre" : "Enter Chamber"}
                    </button>
                )}

                <DialogueBox
                    scene={scene}
                    lang={lang}
                    onChoose={(choiceId) => {
                        const res = nextScene(sceneId, scenes, choiceId, ctx);
                        setSceneId(res.sceneId);
                        setCtx(res.ctx);
                    }}
                />

                <InventoryBar items={ctx.inventory} onUse={(item) => console.log("Using", item)}/>
            </div>
        </GameContainer>
    );
};

export default RiteOfDiscoveryGame;
