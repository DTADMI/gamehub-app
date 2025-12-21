import {beforeEach, describe, expect, it} from "vitest";
import React from "react";
import {render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {RiteOfDiscoveryGame} from "@games/rite-of-discovery";

describe("RiteOfDiscovery gentle mode & save", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it("toggles Gentle Mode and persists to localStorage", async () => {
        render(<RiteOfDiscoveryGame/>);
        const checkbox = screen.getByLabelText(/Gentle Mode/i) as HTMLInputElement;
        expect(checkbox.checked).toBe(false);
        await userEvent.click(checkbox);
        expect(checkbox.checked).toBe(true);
        const raw = localStorage.getItem("rod:save:v1");
        expect(raw).toBeTruthy();
        const parsed = JSON.parse(raw!);
        expect(parsed.flags.gentle).toBe(true);
    });

    it("loads saved gentle flag on next mount", async () => {
        // Prime storage
        localStorage.setItem("rod:save:v1", JSON.stringify({
            scene: "S1",
            flags: {gentle: true},
            inventory: [],
            version: 1
        }));
        render(<RiteOfDiscoveryGame/>);
        const checkbox = await screen.findByLabelText(/Gentle Mode/i);
        expect((checkbox as HTMLInputElement).checked).toBe(true);
    });
});
