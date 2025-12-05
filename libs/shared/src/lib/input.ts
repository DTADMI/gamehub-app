// libs/shared/src/lib/input.ts
// Centralized keyboard capture for game pages/components.
// Prevents page scrolling when pressing Space/Arrow keys while a game is active.

export type GameKeyCaptureOptions = {
    /**
     * Optional predicate to determine if key capture should be active.
     * Defaults to always true.
     */
    isActive?: () => boolean;
    /**
     * Target element to consider as the game region. If provided, capture is
     * active only when this element is focused or contains the active element.
     */
    rootEl?: HTMLElement | null;
    /** Additional key codes to prevent by default. */
    extraKeys?: string[];
};

const DEFAULT_KEYS = new Set<string>([
    // Space
    " ",
    "Spacebar",
    "Space",
    // Arrows
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
]);

function isTextInput(el: Element | null): boolean {
    if (!el) return false;
    const tag = el.tagName?.toLowerCase();
    if (tag === "input" || tag === "textarea") return true;
    const editable = (el as HTMLElement).isContentEditable;
    return Boolean(editable);
}

/**
 * Enable global key capture for a game session. Returns a cleanup function.
 * Use inside a useEffect in client components.
 */
export function enableGameKeyCapture(opts: GameKeyCaptureOptions = {}): () => void {
    if (typeof window === "undefined") {
        return () => void 0;
    }

    const keySet = new Set<string>([...DEFAULT_KEYS, ...(opts.extraKeys || [])]);
    const isActive = opts.isActive || (() => true);

    const shouldCapture = (): boolean => {
        if (!isActive()) return false;
        const active = document.activeElement;
        // Do not capture when user types in inputs/textareas/contenteditable
        if (isTextInput(active)) return false;
        if (!opts.rootEl) return true;
        // If a root element is provided, only capture when focus is inside it
        return active ? opts.rootEl.contains(active) : true;
    };

    const onKeyDown = (e: KeyboardEvent) => {
        if (!shouldCapture()) return;
        if (keySet.has(e.key)) {
            // Prevent page scroll and other default browser actions
            e.preventDefault();
        }
    };

    window.addEventListener("keydown", onKeyDown, {passive: false});
    return () => {
        window.removeEventListener("keydown", onKeyDown as EventListener);
    };
}
