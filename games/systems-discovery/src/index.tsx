"use client";
import React from "react";
import {ChoiceList, Scene, SceneController} from "@games/_engine";

const scenes: Scene[] = [
    {
        id: "B1",
        title: "B1 — Loop Puzzle (Kitchen→Compost→Soil→Herbs)",
        render: ({go, setFlag}) => (
            <div>
                <p>Choose how to complete the loop today:</p>
                <ChoiceList
                    choices={[
                        {id: "bus", label: "Carry scraps to compost bin", next: "B2"},
                        {id: "bike", label: "Start herbs first, then compost", next: "B2"},
                    ]}
                    onPick={(id, next) => {
                        setFlag("b1.route", id);
                        go(next);
                    }}
                />
            </div>
        ),
    },
    {
        id: "B2",
        title: "B2 — Route Planner (Bus/Bike Sequence)",
        render: ({go, setFlag}) => (
            <div>
                <p>Plan an efficient route:</p>
                <ChoiceList
                    choices={[
                        {id: "bus-first", label: "Bus then Bike", next: "B3"},
                        {id: "bike-first", label: "Bike then Bus", next: "B3"},
                    ]}
                    onPick={(id, next) => {
                        setFlag("b2.plan", id);
                        go(next);
                    }}
                />
            </div>
        ),
    },
    {
        id: "B3",
        title: "B3 — Waste Sorting",
        render: ({go, setFlag}) => (
            <div>
                <p>Sort three items correctly (stub):</p>
                <ChoiceList
                    choices={[
                        {id: "sorted", label: "Sorted with hints", next: "WRAP"},
                        {id: "sorted-nohints", label: "Sorted without hints", next: "WRAP"},
                    ]}
                    onPick={(id, next) => {
                        setFlag("b3.result", id);
                        go(next);
                    }}
                />
            </div>
        ),
    },
    {
        id: "WRAP",
        title: "Wrap — Systems Scout Badge",
        render: ({state}) => (
            <div>
                <p>MVP complete — Systems Scout badge awarded.</p>
                <ul className="list-disc ml-6">
                    <li>B1 route: {String(state.flags["b1.route"])}</li>
                    <li>B2 plan: {String(state.flags["b2.plan"])}</li>
                    <li>B3 result: {String(state.flags["b3.result"])}</li>
                </ul>
            </div>
        ),
    },
];

export function SystemsDiscoveryGame() {
    return (
        <SceneController scenes={scenes} initial={{scene: "B1", flags: {}, inventory: []}} saveKey="sysdisc:save:v1"/>
    );
}

export default SystemsDiscoveryGame;
