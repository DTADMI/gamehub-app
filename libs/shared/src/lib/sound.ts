// libs/shared/src/lib/sound.ts
export class SoundManager {
  private static instance: SoundManager;
  private sounds: Map<string, HTMLAudioElement> = new Map<
      string,
      HTMLAudioElement
  >();
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
      const music = this.sounds.get(this.currentMusic);
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

      this.sounds.set(name, audio);
      return true;
    } catch (error) {
      // Fallback to a silent buffer to avoid repeated 404s/log spam; still cache by name
      try {
        const silent = new Audio(SoundManager.SILENT_DATA_URI);
        silent.loop = loop;
        this.sounds.set(name, silent);
      } catch {
      }
      return false;
    }
  }

  public playSound(name: string, volume = 1): void {
    if (typeof window === "undefined") {
      return;
    } // Skip on server

    let audio = this.sounds.get(name);
    // Lazy preload by known default path on first call
    if (!audio) {
      const known = this.defaultPaths[name];
      if (known) {
        void this.preloadSound(name, known).then(() => {
          const a = this.sounds.get(name);
          if (a) {
            try {
              a.volume = Math.min(Math.max(volume, 0), 1);
              a.currentTime = 0;
              void a.play();
            } catch {
            }
          }
        });
      }
    }
    audio = this.sounds.get(name);
    if (audio) {
      try {
        audio.volume = Math.min(Math.max(volume, 0), 1);
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
  }

  playMusic(name: string, volume = 0.5): void {
    if (!this.musicEnabled || this.isMuted) {
      return;
    }

    this.stopMusic();
    const music = this.sounds.get(name);
    if (music) {
      this.currentMusic = name;
      music.volume = Math.min(1, Math.max(0, volume * this.volume));
      void music
          .play()
          .catch((e) => console.warn(`Could not play music ${name}:`, e));
    }
  }

  public stopMusic() {
    if (this.currentMusic) {
      const music = this.sounds.get(this.currentMusic);
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
