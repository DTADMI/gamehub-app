// libs/shared/src/lib/sound.ts
type SoundEntry = {
  audio: HTMLAudioElement | null;
  available: boolean;
  disabled: boolean;
  loop: boolean;
  lastErrorAt?: number;
  loading?: boolean;
};

export class SoundManager {
  private static instance: SoundManager;
  // Track richer status per sound
  private sounds: Map<string, SoundEntry> = new Map<string, SoundEntry>();
  private static SILENT_DATA_URI =
      "data:audio/mp3;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACcQCA"; // tiny silent mp3
  // Known default paths for game sounds — used for lazy preload and to avoid 404 spam
  private defaultPaths: Record<string, string> = {
    background: "/sounds/background.mp3",
    "breakout-bg": "/sounds/breakout-bg.mp3",
    click: "/sounds/click.mp3",
    gameOver: "/sounds/game-over.mp3",
    brickBreak: "/sounds/brick-break.mp3",
    brickHit: "/sounds/brick-hit.mp3",
    paddle: "/sounds/paddle.mp3",
    wall: "/sounds/wall.mp3",
    powerUp: "/sounds/power-up.mp3",
    levelComplete: "/sounds/level-complete.mp3",
    loseLife: "/sounds/lose-life.mp3",
  };
  private musicEnabled = true;
  private soundEffectsEnabled = true;
  private currentMusic: string | null = null;
  private audioContext: AudioContext | null = null;
  private initialized = false;
  private isMuted = false;
  private volume = 0.5;

  private constructor() {
    // Initialize with default sounds
    // Preload a few, others will lazy‑load on first use without spamming network if missing
    void this.preloadSound("background", this.defaultPaths.background, true);
    void this.preloadSound("click", this.defaultPaths.click);
    void this.preloadSound("gameOver", this.defaultPaths.gameOver);
  }

  static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  /** Toggle global mute state */
  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopMusic();
    }
  }

  /** Set global volume [0..1] applied to all sounds/music */
  public setVolume(v: number) {
    this.volume = Math.min(1, Math.max(0, v));
    // Apply to currently playing music
    if (this.currentMusic) {
      const entry = this.sounds.get(this.currentMusic);
      const music = entry?.audio;
      if (music) {
        music.volume = this.volume * 0.5; // keep music softer by default
      }
    }
  }

  async preloadSound(
      name: string,
      path: string,
      loop = false,
  ): Promise<boolean> {
    // Skip on server-side
    if (typeof window === "undefined") {
      return false;
    }

    // If already disabled, do not attempt again
    const existing = this.sounds.get(name);
    if (existing?.disabled) {
      return false;
    }

    try {
      await this.initializeAudioContext();

      const audio = new Audio(path);
      audio.loop = loop;

      await new Promise<void>((resolve, reject) => {
        const onReady = () => {
          cleanup();
          resolve();
        };

        const onError = (_e: Event) => {
          cleanup();
          reject(new Error(`Failed to load sound: ${name}`));
        };

        const cleanup = () => {
          audio.removeEventListener("canplaythrough", onReady);
          audio.removeEventListener("error", onError);
        };

        audio.addEventListener("canplaythrough", onReady, { once: true });
        audio.addEventListener("error", onError, { once: true });
      });
      this.sounds.set(name, {
        audio,
        available: true,
        disabled: false,
        loop,
      });
      return true;
    } catch {
      // Mark sound as disabled to prevent future attempts and log once
      this.sounds.set(name, {
        audio: null,
        available: false,
        disabled: true,
        loop,
        lastErrorAt: Date.now(),
      });
      return false;
    }
  }

  public playSound(name: string, volume = 1): void {
    if (typeof window === "undefined") {
      return;
    } // Skip on server
    if (this.isMuted || !this.soundEffectsEnabled) {
      return;
    }

    let entry = this.sounds.get(name);
    if (entry?.disabled) {
      return;
    }

    // Lazy preload by known default path on first call
    if (!entry) {
      const known = this.defaultPaths[name];
      if (known) {
        // Insert a placeholder entry to avoid concurrent retries
        this.sounds.set(name, {
          audio: null,
          available: false,
          disabled: false,
          loop: false,
          loading: true,
        });
        void this.preloadSound(name, known).then((ok) => {
          const e = this.sounds.get(name);
          if (!ok || !e || e.disabled || !e.available || !e.audio) {
            return;
          }
          try {
            e.audio.volume = Math.min(Math.max(volume, 0), 1) * this.volume;
            e.audio.currentTime = 0;
            void e.audio.play();
          } catch {
          }
        });
      } else {
        // Unknown sound; cache as disabled to avoid spamming
        this.sounds.set(name, {
          audio: null,
          available: false,
          disabled: true,
          loop: false,
          lastErrorAt: Date.now(),
        });
      }
      return;
    }

    const audio = entry.audio;
    if (!entry.available || entry.disabled || !audio) {
      return;
    }
    try {
      audio.volume = Math.min(Math.max(volume, 0), 1) * this.volume;
      audio.currentTime = 0;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn(`Error playing sound ${name}:`, error);
        });
      }
    } catch (error) {
      console.warn(`Error playing sound ${name}:`, error);
    }
  }

  playMusic(name: string, volume = 0.5): void {
    if (!this.musicEnabled || this.isMuted) {
      return;
    }

    this.stopMusic();
    const entry = this.sounds.get(name);
    if (entry?.disabled) {
      return;
    }
    if (!entry || !entry.available || !entry.audio) {
      // Try a single lazy preload if a default path exists
      const known = this.defaultPaths[name];
      if (known) {
        void this.preloadSound(name, known, true).then((ok) => {
          const e = this.sounds.get(name);
          if (!ok || !e || e.disabled || !e.available || !e.audio) {
            return;
          }
          this.currentMusic = name;
          e.audio.volume = Math.min(1, Math.max(0, volume * this.volume));
          void e.audio
              .play()
              .catch((err) => console.warn(`Could not play music ${name}:`, err));
        });
      }
      return;
    }
    this.currentMusic = name;
    entry.audio.volume = Math.min(1, Math.max(0, volume * this.volume));
    void entry.audio
        .play()
        .catch((e) => console.warn(`Could not play music ${name}:`, e));
  }

  public stopMusic() {
    if (this.currentMusic) {
      const entry = this.sounds.get(this.currentMusic);
      const music = entry?.audio;
      if (music) {
        music.pause();
        music.currentTime = 0;
      }
      this.currentMusic = null;
    }
  }

  toggleMusic(): void {
    this.musicEnabled = !this.musicEnabled;
    if (this.musicEnabled && this.currentMusic) {
      this.playMusic(this.currentMusic);
    } else {
      this.stopMusic();
    }
  }

  toggleSoundEffects(): void {
    this.soundEffectsEnabled = !this.soundEffectsEnabled;
  }

  isMusicEnabled(): boolean {
    return this.musicEnabled;
  }

  areSoundEffectsEnabled(): boolean {
    return this.soundEffectsEnabled;
  }

  /**
   * Public API helpers
   */
  registerSound(name: string, path: string, loop = false) {
    this.defaultPaths[name] = path;
    // Reset status so it can be loaded next time
    this.sounds.set(name, {
      audio: null,
      available: false,
      disabled: false,
      loop,
    });
  }

  isAvailable(name: string): boolean {
    const e = this.sounds.get(name);
    return !!e?.available && !e?.disabled && !!e?.audio;
  }

  isDisabled(name: string): boolean {
    const e = this.sounds.get(name);
    return !!e?.disabled;
  }

  enableSound(name: string) {
    const e = this.sounds.get(name);
    if (!e) {
      return;
    }
    e.disabled = false;
  }

  disableSound(name: string) {
    const e = this.sounds.get(name);
    if (!e) {
      return;
    }
    e.disabled = true;
  }

  private async initializeAudioContext() {
    // Skip on server-side or if already initialized
    if (typeof window === "undefined" || this.initialized) {
      return;
    }

    try {
      // @ts-ignore - Web Audio API types
      const AudioContextCtor = window.AudioContext || window.webkitAudioContext;

      if (AudioContextCtor) {
        this.audioContext = new AudioContextCtor();
        if (this.audioContext.state === "suspended") {
          await this.audioContext.resume();
        }
        this.initialized = true;
      }
    } catch (error) {
      console.warn("Web Audio API not supported", error);
    }
  }
}

export const soundManager = SoundManager.getInstance();
