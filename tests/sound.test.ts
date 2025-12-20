import {beforeEach, describe, expect, it} from "vitest";
import {soundManager as mgrModule} from "@games/shared";

// We import via the built package path to ensure the same instance
const soundManager = mgrModule;

class FakeAudio {
  src: string;
  loop = false;
  volume = 1;
  currentTime = 0;
  private listeners: Record<string, Function[]> = {};

  constructor(src?: string) {
    this.src = src || "";
    setTimeout(() => {
      // auto trigger based on src prefix
      if (this.src.includes("ok")) this.dispatch("canplaythrough");
      else this.dispatch("error");
    }, 0);
  }

  addEventListener(ev: string, fn: any) {
    this.listeners[ev] ||= [];
    this.listeners[ev].push(fn);
  }

  removeEventListener(ev: string, fn: any) {
    this.listeners[ev] = (this.listeners[ev] || []).filter((f) => f !== fn);
  }

  dispatch(ev: string) {
    (this.listeners[ev] || []).forEach((fn) => fn());
  }

  play() {
    return Promise.resolve();
  }

  pause() {
  }
}

// Attach mock to globalThis without redeclaring the DOM `Audio` symbol type

describe("SoundManager fail-safe", () => {
  beforeEach(() => {
    // Provide a constructor-compatible replacement for `Audio`
    globalThis.Audio = FakeAudio as unknown as typeof Audio;
  });

  it("marks missing sounds as disabled after failed preload", async () => {
    // Register a path that will fail (not containing 'ok')
    soundManager.registerSound("missing", "/sounds/fail-missing.mp3");
    const ok = await (soundManager as any).preloadSound(
        "missing",
        "/sounds/fail-missing.mp3",
    );
    expect(ok).toBe(false);
    expect(soundManager.isDisabled("missing")).toBe(true);
  });

  it("playSound returns early for disabled sounds", () => {
    soundManager.disableSound("disabled-key");
    // No throw
    soundManager.playSound("disabled-key");
    expect(soundManager.isDisabled("disabled-key")).toBe(true);
  });

  it("lazy first play attempts preload once and plays when available", async () => {
    // Register an OK path
    soundManager.registerSound("chime", "/sounds/ok-chime.mp3");
    // First call will schedule preload and then play
    soundManager.playSound("chime");
    // Wait for the next tick to allow the preload to complete
    await new Promise((r) => setTimeout(r, 10));
    // The sound should be available after preload
    expect(soundManager.isAvailable("chime")).toBe(true);
  });

  it("playMusic respects disabled/availability", async () => {
    // Register a sound that will fail to load (doesn't contain 'ok' in path)
    soundManager.registerSound("bg-bad", "/sounds/fail-music.mp3", true);
    // This should trigger a failed preload
    soundManager.playMusic("bg-bad");
    // Wait for the next tick to allow the preload to fail
    await new Promise((r) => setTimeout(r, 10));
    // The sound should be marked as disabled after failed preload
    expect(soundManager.isDisabled("bg-bad")).toBe(true);
  });
});
