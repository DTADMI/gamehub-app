import {describe, expect, it} from "vitest";
import React from "react";
import {render, screen} from "@testing-library/react";
import {HomeostasisMeter} from "@/components/sysdisc/HomeostasisMeter";

describe("HomeostasisMeter", () => {
    it("renders aria attributes and clamps value", () => {
        render(<HomeostasisMeter value={120} ariaLabel="Homeostasis"/>);
        const meter = screen.getByRole("meter", {name: /Homeostasis/i});
        expect(meter).toHaveAttribute("aria-valuemin", "0");
        expect(meter).toHaveAttribute("aria-valuemax", "100");
        // clamped to 100
        expect(meter).toHaveAttribute("aria-valuenow", "100");
    });

    it("announces state via sr-only region", () => {
        const {rerender} = render(<HomeostasisMeter value={30} ariaLabel="Balance"/>);
        expect(screen.getByText(/Low|Steady|High/)).toBeInTheDocument();
        rerender(<HomeostasisMeter value={60} ariaLabel="Balance"/>);
        expect(screen.getByText(/Steady/)).toBeInTheDocument();
        rerender(<HomeostasisMeter value={80} ariaLabel="Balance"/>);
        expect(screen.getByText(/High/)).toBeInTheDocument();
    });
});
