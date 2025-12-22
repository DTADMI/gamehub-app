import {beforeEach, describe, expect, it} from "vitest";
import React from "react";
import {render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {ToymakerEscapeGame} from "@games/toymaker-escape";

describe("ToymakerEscape — medals & save", () => {
    beforeEach(() => localStorage.clear());

    it("gears route + no hints yields gold", async () => {
        render(<ToymakerEscapeGame/>);
        // Choose gears path
        await userEvent.click(screen.getByRole('button', {name: /gears/i}));
        // Set dials to 1-3-2
        // Dial 2 click twice → 3; Dial 3 click once → 2
        await userEvent.click(screen.getByRole('button', {name: /dial 2/i}));
        await userEvent.click(screen.getByRole('button', {name: /dial 2/i}));
        await userEvent.click(screen.getByRole('button', {name: /dial 3/i}));
        await userEvent.click(screen.getByRole('button', {name: /continue/i}));

        // No hints
        await userEvent.click(screen.getByRole('button', {name: /no hints/i}));
        // Select colors
        await userEvent.click(screen.getByRole('button', {name: /red/i}));
        await userEvent.click(screen.getByRole('button', {name: /blue/i}));
        await userEvent.click(screen.getByRole('button', {name: /green/i}));
        await userEvent.click(screen.getByRole('button', {name: /reveal key fragment 1/i}));

        expect(screen.getByText(/Medal/i).textContent?.toLowerCase()).toContain('gold');
    });

    it("persists save under tme:save:v1", async () => {
        render(<ToymakerEscapeGame/>);
        await userEvent.click(screen.getByLabelText(/Gentle Mode/i));
        const raw = localStorage.getItem('tme:save:v1');
        expect(raw).toBeTruthy();
        const parsed = JSON.parse(raw!);
        expect(parsed.flags.gentle).toBe(true);
    });
});
