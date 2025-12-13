import "@testing-library/jest-dom/vitest";

import {cleanup} from "@testing-library/react";
import {afterEach} from "vitest";

// Run cleanup after each test case
afterEach(() => {
  cleanup();
});

// Provide a basic matchMedia mock for libraries like next-themes
if (typeof window !== "undefined" && !window.matchMedia) {
  // @ts-ignore
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}
