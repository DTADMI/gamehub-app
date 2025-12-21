"use client";
import React from "react";
import {ChoiceList, Scene, SceneController} from "@games/_engine";

const scenes: Scene[] = [
    {
        id: "E1A",
        title: "E1 — Workshop (Gear or Music)",
        render: ({go, setFlag}) => (
            <div>
                <p>Pick your path to open the plate:</p>
                <ChoiceList
                    choices={[
                        {id: "gears", label: "Align gears (stub)", next: "E1B"},
                        {id: "music", label: "Tune music box (stub)", next: "E1B"},
                    ]}
                    onPick={(id, next) => {
                        setFlag("e1.path", id);
                        go(next);
                    }}
                />
            </div>
        ),
    },
    {
        id: "E1B",
        title: "E1 — Playroom Sorter",
        render: ({go, setFlag}) => (
            <div>
                <p>Sorter reveals Key Fragment 1 (stub):</p>
                <ChoiceList
                    choices={[
                        {id: "hints", label: "Use hints", next: "DONE"},
                        {id: "noHints", label: "No hints", next: "DONE"},
                    ]}
                    onPick={(id, next) => {
                        setFlag("e1.helper", id);
                        go(next);
                    }}
                />
            </div>
        ),
    },
    {
        id: "DONE",
        title: "Episode Complete — Key Fragment 1",
        render: ({state}) => (
            <div>
                <p>Episode complete! Codex seed stored.</p>
                <ul className="list-disc ml-6">
                    <li>Path: {String(state.flags["e1.path"])}</li>
                    <li>Helper: {String(state.flags["e1.helper"])}</li>
                </ul>
            </div>
        ),
    },
];

export function ToymakerEscapeGame() {
    return (
        <SceneController scenes={scenes} initial={{scene: "E1A", flags: {}, inventory: []}} saveKey="tme:save:v1"/>
    );
}

export default ToymakerEscapeGame;
