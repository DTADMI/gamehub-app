"use client";

import React, {useEffect, useMemo, useState} from "react";
import {GameContainer} from "@games/shared";
import {detectLang, type Lang, load, nextScene, save, type Scene} from "@games/shared/pointclick/engine";

const SAVE_KEY = "rod:save:v1";

export const RiteOfDiscoveryGame: React.FC = () => {
    const lang = useMemo<Lang>(() => detectLang(), []);
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
                    {id: "start", text: {en: "Begin", fr: "Commencer"}, target: "C1"},
                ],
            },
            C1: {
                id: "C1",
                title: {en: "Chapter 1 — First Signs", fr: "Chapitre 1 — Premiers signes"},
                body: {
                    en: "Observe the room and choose your approach (MVP placeholder).",
                    fr: "Observez la pièce et choisissez votre approche (MVP).",
                },
                choices: [
                    {
                        id: "observe",
                        text: {en: "Observe gently", fr: "Observer doucement"},
                        target: "WRAP",
                        effect: (ctx) => ({...ctx, virtue: "care"}),
                    },
                ],
            },
            WRAP: {
                id: "WRAP",
                title: {en: "Wrap — Rite complete", fr: "Conclusion — Rite accompli"},
                body: {
                    en: "You chose care. A small rite, a bright start.",
                    fr: "Vous avez choisi le soin. Un petit rite, un départ lumineux.",
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
            title={scene?.title[lang] || "Rite of Discovery"}
            description={scene?.body?.[lang]}
            lockTouch={false}
            showParticleControls={false}
        >
            <div role="application" aria-label="Rite of Discovery" className="p-4">
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

export default RiteOfDiscoveryGame;
