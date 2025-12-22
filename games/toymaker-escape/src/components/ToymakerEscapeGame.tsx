"use client";

import React, {useEffect, useMemo, useState} from "react";
import {GameContainer} from "@games/shared";
import {detectLang, type Lang, load, nextScene, save, type Scene} from "@games/shared/pointclick/engine";

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
    const [ctx, setCtx] = useState<Record<string, any>>(() => load(SAVE_KEY)?.ctx || {});

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
                <div className="flex flex-col sm:flex-row gap-3">
                    {scene?.choices.map((c) => (
                        <button
                            key={c.id}
                            className="min-h-11 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                            onClick={() => {
                                const res = nextScene(sceneId, scenes, c.id, ctx);
                                setSceneId(res.sceneId);
                                setCtx(res.ctx);
                            }}
                        >
                            {c.text[lang]}
                        </button>
                    ))}
                </div>
            </div>
        </GameContainer>
    );
};

export default ToymakerEscapeGame;
