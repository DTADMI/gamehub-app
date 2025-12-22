"use client";
import React from "react";
import type {Lang, Scene} from "../engine";

export function DialogueBox({
                                scene,
                                lang,
                                onChoose,
                            }: {
    scene: Scene;
    lang: Lang;
    onChoose: (choiceId: string) => void;
}) {
    const title = scene.title[lang] ?? scene.title.en;
    const body = scene.body?.[lang] ?? scene.body?.en ?? "";
    return (
        <section
            role="dialog"
            aria-labelledby="dlg-title"
            className="rounded-lg border bg-card text-card-foreground p-4 shadow-sm"
        >
            <h2 id="dlg-title" className="text-xl font-semibold mb-2">
                {title}
            </h2>
            {body && <p className="mb-3 text-sm opacity-90">{body}</p>}
            <div className="flex flex-col gap-2 mt-2">
                {scene.choices.map((c) => (
                    <button
                        key={c.id}
                        className="min-h-11 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm text-left"
                        onClick={() => onChoose(c.id)}
                    >
                        {c.text[lang] ?? c.text.en}
                    </button>
                ))}
            </div>
        </section>
    );
}

export default DialogueBox;
