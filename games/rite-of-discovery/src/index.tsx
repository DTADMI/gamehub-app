"use client";
import React from "react";
import {ChoiceList, Scene, SceneController} from "@games/_engine";

const scenes: Scene[] = [
    {
        id: "S1",
        title: "S1 — Tag Reassembly",
        render: ({go, setFlag}) => (
            <div>
                <p>Reassemble the name tag (stub). Choose a style:</p>
                <ChoiceList
                    choices={[
                        {id: "careful", label: "Careful arrangement", next: "S2"},
                        {id: "quick", label: "Quick fix", next: "S2"},
                    ]}
                    onPick={(id, next) => {
                        setFlag("s1.style", id);
                        go(next);
                    }}
                />
            </div>
        ),
    },
    {
        id: "S2",
        title: "S2 — Note Letter‑Match",
        render: ({go, setFlag}) => (
            <div>
                <p>Match 3 letters on a note (stub). Spot the difference?</p>
                <ChoiceList
                    choices={[
                        {id: "match", label: "Matched all 3", next: "S3"},
                        {id: "miss1", label: "Missed one (okay)", next: "S3"},
                    ]}
                    onPick={(id, next) => {
                        setFlag("s2.result", id);
                        go(next);
                    }}
                />
            </div>
        ),
    },
    {
        id: "S3",
        title: "S3 — Proof Moment",
        render: ({go, setFlag}) => (
            <div>
                <p>Choose how you learn the truth (stub branch).</p>
                <ChoiceList
                    choices={[
                        {id: "receipt", label: "Find a receipt", next: "EP"},
                        {id: "overhear", label: "Overhear a talk", next: "EP"},
                    ]}
                    onPick={(id, next) => {
                        setFlag("s3.path", id);
                        go(next);
                    }}
                />
            </div>
        ),
    },
    {
        id: "EP",
        title: "Epilogue — Helper Badge",
        render: ({state}) => (
            <div>
                <p>Well done. You completed the MVP slice.</p>
                <ul className="list-disc ml-6">
                    <li>S1 style: {String(state.flags["s1.style"])}</li>
                    <li>S2 result: {String(state.flags["s2.result"])}</li>
                    <li>S3 path: {String(state.flags["s3.path"])}</li>
                </ul>
                <p className="mt-2 font-medium">Helper Badge unlocked (visual TBD). New Game+ will reveal Mentor
                    Mini.</p>
            </div>
        ),
    },
];

export function RiteOfDiscoveryGame() {
    return (
        <SceneController scenes={scenes} initial={{scene: "S1", flags: {}, inventory: []}} saveKey="rod:save:v1"/>
    );
}

export default RiteOfDiscoveryGame;
