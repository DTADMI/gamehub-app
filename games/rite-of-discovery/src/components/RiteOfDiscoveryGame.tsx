"use client";

import React, {useEffect, useMemo, useState} from "react";
import {DialogueBox, GameContainer, InventoryBar} from "@games/shared";
import {detectLang, effects, ensureCtx, type Lang, nextScene, type Scene} from "@games/shared/pointclick/engine";
import {loadWithMigrations, SAVE_KEYS, versionedSave} from "@games/shared/pointclick/core/Persistence";
import {clearKeypad, createKeypadState, pressKey, submitKeypad} from "@games/shared/pointclick/puzzles/keypad";
import {createWiresState, setWiresConnection} from "@games/shared/pointclick/puzzles/wires";

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
                title: {en: "Rite of Discovery — Intro", fr: "Rite of Discovery — Intro"},
                body: {
                    en: "A family tradition. A quiet choice. Tonight it begins.",
                    fr: "Une tradition familiale. Un choix discret. Ce soir, cela commence.",
                },
                choices: [
                    {id: "start", text: {en: "Begin", fr: "Commencer"}, target: "HALLWAY"},
                ],
            },
            HALLWAY: {
                id: "HALLWAY",
                title: {en: "The Dim Hallway", fr: "Le couloir sombre"},
                body: {
                    en: "A heavy metal door blocks your path. A keypad glows faintly.",
                    fr: "Une lourde porte métallique bloque votre chemin. Un pavé numérique luit faiblement.",
                },
                choices: [
                    {
                        id: "back",
                        text: {en: "Go back", fr: "Retourner"},
                        target: "INTRO"
                    }
                ],
            },
            KEYPAD_ZOOM: {
                id: "KEYPAD_ZOOM",
                title: {en: "Keypad Lock", fr: "Serrure à code"},
                body: {
                    en: "Enter the 4-digit code found on the old parchment.",
                    fr: "Entrez le code à 4 chiffres trouvé sur le vieux parchemin.",
                },
                choices: [
                    {id: "exit", text: {en: "Back", fr: "Retour"}, target: "HALLWAY"}
                ]
            },
            WIRES_PANEL: {
                id: "WIRES_PANEL",
                title: {en: "Maintenance Panel", fr: "Panneau de maintenance"},
                body: {
                    en: "Exposed wires hum with power. Connect them correctly to restore light.",
                    fr: "Des fils dénudés bourdonnent d'énergie. Connectez-les correctement pour restaurer la lumière.",
                },
                choices: [
                    {id: "exit", text: {en: "Back", fr: "Retour"}, target: "HALLWAY"}
                ]
            },
            INNER_CHAMBER: {
                id: "INNER_CHAMBER",
                title: {en: "The Inner Chamber", fr: "La chambre intérieure"},
                body: {
                    en: "The air is still here. You've passed the first trial.",
                    fr: "L'air est immobile ici. Vous avez passé la première épreuve.",
                },
                choices: [
                    {id: "restart", text: {en: "Restart", fr: "Recommencer"}, target: "INTRO", effect: () => ({})}
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
                <p className="mb-6">{scene?.body[lang]}</p>

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
                                    className="h-12 w-12 border rounded bg-background hover:bg-accent"
                                    onClick={() => setKeypad(s => pressKey(s, n.toString(), {code: "1234"}))}
                                >
                                    {n}
                                </button>
                            ))}
                            <button
                                className="col-span-2 h-12 border rounded bg-background hover:bg-accent"
                                onClick={() => setKeypad(s => clearKeypad(s))}
                            >
                                Clear
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
                                OK
                            </button>
                        </div>
                        <div className="text-center font-mono text-xl tracking-widest h-8">
                            {keypad.input.padEnd(4, '_')}
                        </div>
                        {ctx.flags["door.keypadSolved"] && (
                            <p className="text-green-500 text-center mt-2">Unlocked!</p>
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
                                        className="p-1 rounded border"
                                        onChange={(e) => {
                                            const [l, r] = e.target.value.split("-");
                                            setWires(s => {
                                                const next = setWiresConnection(s, l, r, color as any);
                                                if (next.solved) setCtx(c => effects.setFlag("door.wiresSolved", true)(ensureCtx(c)));
                                                return next;
                                            });
                                        }}
                                    >
                                        <option value="">Select connection...</option>
                                        <option value="L1-R1">L1 to R1</option>
                                        <option value="L1-R2">L1 to R2</option>
                                        <option value="L2-R1">L2 to R1</option>
                                        <option value="L2-R2">L2 to R2</option>
                                    </select>
                                </div>
                            ))}
                        </div>
                        {ctx.flags["door.wiresSolved"] && (
                            <p className="text-green-500 text-center mt-4">Power Restored!</p>
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
