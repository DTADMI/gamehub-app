"use client";
import React from "react";

export function InventoryBar({
                                 items,
                                 onUse,
                                 ariaLabel = "Inventory",
                             }: {
    items: string[];
    onUse?: (id: string) => void;
    ariaLabel?: string;
}) {
    if (!items?.length) {
        return null;
    }
    return (
        <div
            role="toolbar"
            aria-label={ariaLabel}
            className="mt-3 flex flex-wrap gap-2 p-2 rounded-md bg-card text-card-foreground border"
        >
            {items.map((id) => (
                <button
                    key={id}
                    type="button"
                    className="min-h-11 px-3 py-2 rounded bg-muted hover:bg-muted/80 text-sm"
                    onClick={() => onUse?.(id)}
                >
                    {id}
                </button>
            ))}
        </div>
    );
}

export default InventoryBar;
