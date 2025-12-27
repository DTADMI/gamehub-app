"use client";

import {GameEngine} from "@games/shared/pointclick/core/Engine";
import React from "react";

/**
 * Minimal canvas wrapper to exercise InputManager macro registration for TME E1 cabinet wall.
 * - Registers `holdThenDrag` macro: ['pointerdown','longpress','swipe']
 * - When macro fires and the pointer is over the scuff hotspot, calls onLatchReveal()
 * - Draws a simple scuff hotspot rectangle for debugging/visual hint
 */
export function E1CabinetCanvas({
                                    width = 480,
                                    height = 160,
                                    onLatchReveal,
                                }: {
    width?: number;
    height?: number;
    onLatchReveal: () => void;
}) {
    const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
    const engineRef = React.useRef<GameEngine | null>(null);
    const macroUnsubRef = React.useRef<() => void>(undefined);
    const unsubEventRef = React.useRef<() => void>(undefined);

    // Simple scuff hotspot bounds (logical canvas coords)
    const scuff = React.useMemo(() => ({x: 24, y: height - 48, w: 96, h: 24}), [height]);

    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }

        // Create engine
        const engine = new GameEngine({
            canvas,
            width,
            height,
            backgroundColor: "#111827", // gray-900-like backdrop
            debug: false,
        });
        engineRef.current = engine;

        // Register macro on input manager
        macroUnsubRef.current = engine.input.registerSequenceMacro(
            "holdThenDrag",
            ["pointerdown", "longpress", "swipe"],
        );

        // Listen for macro event and check hotspot hit
        const unsub = engine.events.on("input:macro:holdThenDrag", () => {
            const pos = engine.input.getPointerPosition();
            if (
                pos.x >= scuff.x &&
                pos.x <= scuff.x + scuff.w &&
                pos.y >= scuff.y &&
                pos.y <= scuff.y + scuff.h
            ) {
                onLatchReveal();
            }
        });
        unsubEventRef.current = unsub;

        // Minimal scene to draw the hotspot box
        const sceneId = "E1_CABINET_CANVAS";
        engine.scenes.register({
            id: sceneId,
            render(ctx: CanvasRenderingContext2D) {
                // Panel background
                ctx.fillStyle = "#0b1220"; // dark panel
                ctx.fillRect(0, 0, width, height);
                // Scuff hotspot (debug outline)
                ctx.fillStyle = "#374151"; // gray-700
                ctx.fillRect(scuff.x, scuff.y, scuff.w, scuff.h);
                ctx.strokeStyle = "#93c5fd"; // light blue
                ctx.lineWidth = 2;
                ctx.strokeRect(scuff.x + 0.5, scuff.y + 0.5, scuff.w - 1, scuff.h - 1);
            },
            addInteractionZone() {
            },
            removeInteractionZone() {
            },
            findZoneAt() {
                return null;
            },
        } as any);

        engine.start(sceneId).catch(() => {
        });

        return () => {
            try {
                unsubEventRef.current?.();
            } catch {
            }
            try {
                macroUnsubRef.current?.();
            } catch {
            }
            try {
                engine.destroy();
            } catch {
            }
            engineRef.current = null;
        };
    }, [width, height, scuff, onLatchReveal]);

    return (
        <div className="inline-block">
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                className="rounded border border-dashed border-muted-foreground/50"
                aria-label="Cabinet panel canvas"
            />
        </div>
    );
}

export default E1CabinetCanvas;
