"use client";

import React, {useEffect, useMemo, useRef, useState} from "react";
import {DialogueBox, GameContainer, InventoryBar, versionedLoad, versionedSave} from "@games/shared";
import {detectLang, effects, ensureCtx, type Lang, nextScene, type Scene,} from "@games/shared/pointclick/engine";
import {clearKeypad, createKeypadState, pressKey, submitKeypad,} from "@games/shared/pointclick/puzzles/keypad";
import {
    createGearsState,
    evaluateGears,
    type GearsState,
    setGearsTeeth as setGearTeeth,
} from "@games/shared/pointclick/puzzles/gears";
import {t} from "@/lib/i18n";
import {
    createWiresState,
    hasWiresCrossing,
    setWiresConnection,
    type WiresState
} from "@games/shared/pointclick/puzzles/wires";
import {
    createPipesState,
    evaluatePipes,
    type PipesState,
    setTileRotation,
    type Tile,
    toggleValve
} from "@games/shared/pointclick/puzzles/pipes";
import {createSequenceState, pressSequenceKey, type SequenceState} from "@games/shared/pointclick/puzzles/sequence";
import {E1CabinetCanvas} from "./E1CabinetCanvas";

const SAVE_KEY = "tme:save:v1";

type TmeSaveV1 = {
    sceneId: string;
    flags: {
        keypad?: { solved?: boolean };
        gears?: { solved?: boolean };
        wires?: { solved?: boolean };
        pipes?: { solved?: boolean };
        latch?: { revealed?: boolean };
        seen?: {
            posterOrder?: boolean;
            ratioPlate?: boolean;
            scuff?: boolean;
        };
    };
    inventory: string[];
};

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

    // Load v1 save (frontend-only). Fallback to minimal defaults.
    const initialSave = (() => {
        try {
            const payload = versionedLoad<TmeSaveV1>(SAVE_KEY);
            return payload?.data ?? null;
        } catch {
            return null;
        }
    })();

    const [sceneId, setSceneId] = useState<string>(() => initialSave?.sceneId || "INTRO");
    const [ctx, setCtx] = useState(() => ensureCtx({
        inventory: initialSave?.inventory ?? [],
        flags: initialSave?.flags ?? {},
    }));

    // Wires mini state (simple 2×2 example for stub UI)
    const [wires, setWires] = useState<WiresState>(() =>
        createWiresState(["A1", "A2"], ["B1", "B2"], {
            red: [{from: "A1", to: "B2"}],
            blue: [{from: "A2", to: "B1"}],
        })
    );

    // Pipes mini state — small 3×1 with a valve in middle
    const initialTiles: Tile[] = [
        {type: "straight", rotation: 0, source: true},
        {type: "valve", rotation: 0, open: false},
        {type: "straight", rotation: 0, sink: true},
    ];
    const [pipes, setPipes] = useState<PipesState>(() => createPipesState(3, 1, initialTiles));
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

    const [sorter, setSorter] = useState<SequenceState>(() =>
        createSequenceState(["red", "blue", "green"], ["red", "blue", "green", "red"])
    );

    // Persist with a small idempotency guard to reduce redundant writes
    const lastSavedRef = useRef<string | null>(null);
    useEffect(() => {
        const data: TmeSaveV1 = {
            sceneId,
            flags: ctx.flags || {},
            inventory: ctx.inventory || [],
        } as any;
        const payload = JSON.stringify({v: 1, data});
        if (lastSavedRef.current !== payload) {
            versionedSave<TmeSaveV1>(SAVE_KEY, 1, data);
            lastSavedRef.current = payload;
        }
    }, [sceneId, ctx]);

    // Auto-award a simple medal for E1 once a gate is solved and the latch is revealed.
    useEffect(() => {
        const flags: any = (ctx as any).flags || {};
        const gateSolved = !!(flags["gears.solved"] || flags["wires.solved"] || flags["pipes.solved"]);
        const latch = !!flags["latch.revealed"];
        const existing = flags?.medals?.e1;
        if (!gateSolved || !latch || existing) return;
        const hintsUsed = [flags?.["seen.posterOrder"], flags?.["seen.ratioPlate"]].filter(Boolean).length;
        const level = hintsUsed === 0 ? 'gold' : hintsUsed === 1 ? 'silver' : 'bronze';
        setCtx((c) => effects.setFlag(`medals.e1`, level)(ensureCtx(c)));
    }, [ctx]);

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
                    {scene?.title?.[lang] ?? t('tme.e1.title')}
                </h2>
                {scene?.body ? (
                    <p className="mb-4 text-muted-foreground">{scene.body[lang]}</p>
                ) : (
                    <p className="mb-4 text-muted-foreground">{t('tme.e1.body')}</p>
                )}

                {/* Episode 1 keypad mini (simple mobile-friendly UI) */}
                {sceneId === "E1_GEAR" && (
                    <div className="mb-4 rounded-md border p-3">
                        <p className="mb-2 text-sm">{t('tme.e1.keypad.hint')}</p>
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
                                {t('tme.e1.keypad.clear')}
                            </button>
                            <button
                                className="min-h-11 px-4 py-2 rounded bg-primary text-primary-foreground"
                                onClick={() => {
                                    setKeypad((s) => {
                                        const next = submitKeypad(s, {code: "2413"});
                                        if (next.solved) {
                                            const updated = effects.addItem("gear-key")(ctx);
                                            setCtx(effects.setFlag("keypad.solved", true)(ensureCtx(updated)));
                                        }
                                        return next;
                                    });
                                }}
                            >
                                {t('tme.e1.keypad.submit')}
                            </button>
                        </div>
                        <div className="mt-2 text-sm">
                            {t('tme.e1.keypad.input')} <b>{keypad.input}</b>{" "}
                            {keypad.solved &&
                                <span className="text-green-600">{t('tme.e1.keypad.unlocked')}</span>}
                        </div>
                        {/* Gears mini (ratio 1/3) — adjust teeth to achieve target */}
                        <div className="mt-4">
                            <p className="mb-2 text-sm">{t('tme.e1.gears.instruction')}</p>
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
                                            setCtx((c) => effects.setFlag("gears.solved", true)(ensureCtx(c)));
                                        }}
                                    >
                                        {lang === "fr" ? "Valider l'engrenage" : "Confirm gears"}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Cabinet panel — minimal Wires and Pipes stubs for E1 */}
                {sceneId === "E1_GEAR" && (
                    <div className="mb-4 rounded-md border p-3">
                        <h3 className="font-semibold mb-2">{t('tme.e1.panel.title')}</h3>

                        {/* Observation buttons to set seen.* flags (diegetic clues) */}
                        <div className="flex flex-wrap gap-2 mb-3">
                            <button
                                className="px-3 py-2 rounded bg-muted"
                                onClick={() => setCtx(c => effects.setFlag("seen.posterOrder", true)(ensureCtx(c)))}
                            >{lang === 'fr' ? 'Regarder l’affiche (ordre des jouets)' : 'Examine poster (toys order)'}</button>
                            <button
                                className="px-3 py-2 rounded bg-muted"
                                onClick={() => setCtx(c => effects.setFlag("seen.ratioPlate", true)(ensureCtx(c)))}
                            >{lang === 'fr' ? 'Observer la plaque 3:1' : 'Inspect 3:1 plate'}</button>
                        </div>

                        {/* Wires stub */}
                        <div className="mb-3">
                            <p className="text-sm mb-2">{t('tme.e1.panel.wiresHint')}</p>
                            <div className="flex items-center gap-2 mb-2">
                                <select aria-label="Left terminal"
                                        onChange={(e) => (e.currentTarget.dataset.v = e.target.value)} data-v="A1"
                                        data-testid="wires-left">
                                    {wires.terminalsLeft.map(id => <option key={id} value={id}>{id}</option>)}
                                </select>
                                <span>→</span>
                                <select aria-label="Right terminal"
                                        onChange={(e) => (e.currentTarget.dataset.v = e.target.value)} data-v="B1"
                                        data-testid="wires-right">
                                    {wires.terminalsRight.map(id => <option key={id} value={id}>{id}</option>)}
                                </select>
                                <select aria-label="Color" defaultValue="red" data-testid="wires-color">
                                    {Object.keys(wires.goal).map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <button className="px-3 py-2 rounded bg-muted" onClick={(e) => {
                                    const leftSel = (e.currentTarget.parentElement?.querySelector('[data-testid="wires-left"]') as HTMLSelectElement);
                                    const rightSel = (e.currentTarget.parentElement?.querySelector('[data-testid="wires-right"]') as HTMLSelectElement);
                                    const colorSel = (e.currentTarget.parentElement?.querySelector('[data-testid="wires-color"]') as HTMLSelectElement);
                                    const next = setWiresConnection(wires, (leftSel?.value) || 'A1', (rightSel?.value) || 'B1', (colorSel?.value) || 'red');
                                    setWires(next);
                                    if (next.solved) setCtx(c => effects.setFlag("wires.solved", true)(ensureCtx(c)));
                                }}>{lang === 'fr' ? 'Connecter' : 'Connect'}</button>
                            </div>
                            {hasWiresCrossing(wires) && (
                                <div className="text-amber-600 text-sm"
                                     role="status">{t('tme.e1.panel.wiresAvoid')}</div>
                            )}
                            {wires.solved && <div className="text-emerald-600 text-sm"
                                                  role="status">{t('tme.e1.panel.wiresSolved')}</div>}
                        </div>

                        {/* Pipes stub */}
                        <div>
                            <p className="text-sm mb-2">{t('tme.e1.panel.pipesHint')}</p>
                            <div className="flex items-center gap-2 mb-2">
                                <button className="px-3 py-2 rounded bg-muted"
                                        onClick={() => setPipes(s => evaluatePipes(setTileRotation(s, 0, 0, (s.grid[0]?.rotation || 0) + 1)))}>{t('tme.e1.panel.rotate00')}</button>
                                <button className="px-3 py-2 rounded bg-muted"
                                        onClick={() => setPipes(s => evaluatePipes(setTileRotation(s, 2, 0, (s.grid[2]?.rotation || 0) + 1)))}>{t('tme.e1.panel.rotate20')}</button>
                                <button className="px-3 py-2 rounded bg-muted"
                                        onClick={() => setPipes(s => evaluatePipes(toggleValve(s, 1, 0, true)))}>{t('tme.e1.panel.openValve')}</button>
                            </div>
                            <div className="text-sm" role="status">
                                {pipes.solved ? t('tme.e1.panel.pipesSolved') : t('tme.e1.panel.pipesNotSolved')}
                            </div>
                            {pipes.errors && pipes.errors.length > 0 && (
                                <ul className="text-amber-600 text-sm mt-1 list-disc pl-5">
                                    {pipes.errors.map((e, i) => <li key={i}>{e}</li>)}
                                </ul>
                            )}
                            {pipes.solved && (
                                <button className="mt-2 px-3 py-2 rounded bg-emerald-600 text-white"
                                        onClick={() => setCtx(c => effects.setFlag("pipes.solved", true)(ensureCtx(c)))}>
                                    {lang === 'fr' ? 'Valider les tuyaux' : 'Confirm pipes'}
                                </button>
                            )}
                        </div>

                        {/* Sorter — simple sequence tap/drag */}
                        <div className="mt-4">
                            <p className="text-sm mb-2">{t('tme.playroom.colors.hint')}</p>
                            <div className="flex gap-2">
                                {["red", "blue", "green"].map(color => (
                                    <button
                                        key={color}
                                        className="w-16 h-16 rounded border flex items-center justify-center capitalize"
                                        style={{backgroundColor: color, color: color === 'green' ? 'black' : 'white'}}
                                        onClick={() => {
                                            const next = pressSequenceKey(sorter, color);
                                            setSorter(next);
                                            if (next.solved) {
                                                setCtx(c => effects.setFlag("sorter.solved", true)(ensureCtx(c)));
                                            }
                                        }}
                                    >
                                        {color}
                                    </button>
                                ))}
                            </div>
                            <div className="mt-2 text-sm">
                                Progress: {sorter.input.length} / {sorter.goal.length}
                                {ctx.flags["sorter.solved"] && <span className="text-green-500 ml-2">Solved!</span>}
                            </div>
                        </div>

                        {/* Hidden latch — long-press then drag over scuff area (macro mimic) */}
                        <div className="mt-4">
                            <p className="text-sm mb-2">{t('tme.e1.latch.hint')}</p>
                            {/* Canvas macro version (registers holdThenDrag) with DOM fallback for accessibility */}
                            <div className="flex items-center gap-4 flex-wrap">
                                <E1CabinetCanvas
                                    onLatchReveal={() => setCtx(c => effects.setFlag("latch.revealed", true)(ensureCtx(c)))}
                                />
                                <div
                                    className="text-sm text-muted-foreground">{lang === 'fr' ? 'Astuce: appui long puis glisser sur la rayure.' : 'Tip: long‑press then drag over the scuff.'}</div>
                            </div>
                            <ScuffLatch
                                onRevealed={() => setCtx(c => effects.setFlag("latch.revealed", true)(ensureCtx(c)))}
                                onSeen={() => setCtx(c => effects.setFlag("seen.scuff", true)(ensureCtx(c)))}/>
                            {((ctx as any).flags?.["latch.revealed"]) && (
                                <div className="mt-2 text-emerald-600" role="status">{t('tme.e1.latch.revealed')}</div>
                            )}
                            {((ctx as any).flags?.medals?.e1) && (
                                <div className="mt-1 text-sm" role="status" data-testid="medal-line">
                                    {`${t('tme.e1.medal.label')} ${t('tme.e1.medal.' + (ctx as any).flags.medals.e1)}`}
                                </div>
                            )}
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

// --- Internal helper: scuff latch interaction (long-press then drag) ---
function ScuffLatch({onRevealed, onSeen}: { onRevealed: () => void; onSeen: () => void }) {
    const [pressStart, setPressStart] = React.useState<number | null>(null);
    const [longPressed, setLongPressed] = React.useState(false);
    const timeoutRef = React.useRef<number | null>(null);

    const onPointerDown = () => {
        onSeen();
        setLongPressed(false);
        const start = Date.now();
        setPressStart(start);
        timeoutRef.current = window.setTimeout(() => {
            setLongPressed(true);
        }, 800); // match long-press duration from InputManager default
    };
    const onPointerUp = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
        setPressStart(null);
        setLongPressed(false);
    };
    const onPointerMove = () => {
        // Consider this a drag following a successful long-press
        if (longPressed) {
            onRevealed();
        }
    };
    return (
        <div
            role="button"
            aria-label="Scuffed area"
            tabIndex={0}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerMove={onPointerMove}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onRevealed();
            }}
            className="w-24 h-10 rounded border border-dashed border-muted-foreground/60 bg-muted/50 select-none flex items-center justify-center"
            data-testid="scuff-area"
        >
            <span className="text-xs text-muted-foreground">{"// scuff"}</span>
        </div>
    );
}
