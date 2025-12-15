"use client";

import {GameContainer, ParticlePool, soundManager, useGameSettings} from "@games/shared";
import React, {useCallback, useEffect, useRef, useState} from "react";

import {submitScore} from "@/lib/graphql/queries";

// Minimal, stable MVP implementation for Breakout
// Constants (logical canvas size; we apply DPR scaling in a resize handler)
// Increased canvas size to improve play area and match earlier screenshots
const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 420;

const PADDLE_WIDTH = 75;
const PADDLE_HEIGHT = 10;
const PADDLE_SPEED = 6;

const BALL_RADIUS = 8;
// Slightly higher baseline and ceiling to keep snappy feel on wider canvas
// Tuned down by ~10% for better control on desktop; still scales with level/mode
const BASE_BALL_SPEED = 4.32;
const MIN_BALL_SPEED = 3.6;
const MAX_BALL_SPEED = 7.2;

// Anti-stall and control feel
const MIN_BOUNCE_ANGLE = (10 * Math.PI) / 180; // minimum 10° away from vertical
const MAX_BOUNCE_ANGLE = (75 * Math.PI) / 180; // cap at 75° from vertical
const PADDLE_INFLUENCE_BASE = 0.04; // radians of angle influence per px of paddle movement this frame (desktop)
const PADDLE_INFLUENCE_MOBILE = 0.05; // a touch more influence on coarse pointers
const MAX_INFLUENCE_ANGLE = (20 * Math.PI) / 180; // clamp added influence to ±20°
const MIN_HORIZ_COMPONENT = 1.1; // ensure some horizontal speed exists after collisions
const NUDGE_EPS = 0.35; // if |dx| falls below this, consider nudging
const NUDGE_AMOUNT = 0.6; // horizontal nudge amount when trapped
const NUDGE_COOLDOWN_MS = 320; // minimal delay between nudges

const BRICK_ROW_COUNT = 5;
// Responsive brick layout: compute columns/width/offset from canvas width
const BRICK_HEIGHT = 18;
const BRICK_PADDING = 8;
const BRICK_OFFSET_TOP = 40;

type Brick = {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  points: number;
  health: number;
};

type Ball = {
  x: number;
  y: number;
  dx: number;
  dy: number;
  radius: number;
};

type Paddle = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const COLORS = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#a855f7"];

const clamp = (v: number, min: number, max: number) =>
    Math.max(min, Math.min(max, v));

type BrickLayout = {
  cols: number;
  brickWidth: number;
  offsetLeft: number;
  padding: number;
};

// Compute a centered, responsive brick layout based on logical canvas width
function computeBrickLayout(canvasW: number): BrickLayout {
  const minCols = 8;
  const maxCols = 12;
  const margin = 24; // left/right margin inside canvas
  const padding = BRICK_PADDING;
  // Try higher column counts first while keeping a decent min width
  let best: BrickLayout | null = null;
  for (let cols = maxCols; cols >= minCols; cols--) {
    const totalPadding = (cols - 1) * padding;
    const available = canvasW - 2 * margin - totalPadding;
    const brickWidth = Math.floor(available / cols);
    if (brickWidth >= 36) { // ensure decent hitbox/tap target
      const gridW = cols * brickWidth + totalPadding;
      const offsetLeft = Math.floor((canvasW - gridW) / 2);
      best = {cols, brickWidth, offsetLeft, padding};
      break;
    }
  }
  if (!best) {
    // Fallback: use minCols with whatever width fits, still centered
    const cols = minCols;
    const totalPadding = (cols - 1) * padding;
    const available = canvasW - 2 * 16 - totalPadding;
    const brickWidth = Math.max(28, Math.floor(available / cols));
    const gridW = cols * brickWidth + totalPadding;
    const offsetLeft = Math.floor((canvasW - gridW) / 2);
    best = {cols, brickWidth, offsetLeft, padding};
  }
  return best;
}

// Top-level brick factory (pure) to avoid effect dependencies in the game loop
function buildBricks(lvl: number, layout: BrickLayout = computeBrickLayout(CANVAS_WIDTH)): Brick[][] {
  const newBricks: Brick[][] = [];
  for (let c = 0; c < layout.cols; c++) {
    newBricks[c] = [] as Brick[];
    for (let r = 0; r < BRICK_ROW_COUNT; r++) {
      const brickX = c * (layout.brickWidth + layout.padding) + layout.offsetLeft;
      const brickY = r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP;
      const colorIndex = Math.floor(Math.random() * COLORS.length);
      const basePoints = (BRICK_ROW_COUNT - r) * 10 * Math.max(1, lvl);
      const toughChance = Math.min(0.1 + (Math.max(1, lvl) - 2) * 0.04, 0.28);
      const isTough = lvl >= 2 && Math.random() < toughChance;
      const health = isTough ? 2 : 1;
      const points = isTough ? basePoints * 2 : basePoints;
      newBricks[c][r] = {
        x: brickX,
        y: brickY,
        width: layout.brickWidth,
        height: BRICK_HEIGHT,
        color: isTough ? "#ea580c" : COLORS[colorIndex],
        points,
        health,
      } as Brick;
    }
  }
  return newBricks;
}

// Power-ups
// Existing: slow/fast/sticky
// New: thru (pierce bricks), bomb (AoE), fireball (one-hit), laser (paddle shots), extraLife
// Restored: expand (wider paddle), shrink (narrow paddle)
type PowerUpType =
    | "slow"
    | "fast"
    | "sticky"
    | "thru"
    | "bomb"
    | "fireball"
    | "laser"
    | "extraLife"
    | "expand"
    | "shrink"
    | "multiball";
type FallingPowerUp = {
  x: number;
  y: number;
  dy: number;
  type: PowerUpType;
  size: number;
};
type ActiveModifier = { type: PowerUpType; endTime: number } | null;

const POWERUP_DROP_CHANCE = 0.1; // 10% per brick break (desktop baseline)
const POWERUP_MAX_FALLING = 2;
const POWERUP_DURATION_MS = 7000; // 7s timed effect (default)
const POWERUP_DURATION_LONG_MS = 9500; // for premium ones
const FAST_FACTOR = 1.25;
const SLOW_FACTOR_DESKTOP = 0.75;
const SLOW_FACTOR_MOBILE = 0.9; // make slow less harsh on mobile to avoid sluggish feel
const PADDLE_EXPAND_FACTOR = 1.5;
const PADDLE_SHRINK_FACTOR = 0.7;

function pickWeightedPowerUp(current: ActiveModifier, entitled: { auth: boolean; sub: boolean }): PowerUpType {
  // Availability by entitlement
  const available: Array<{ t: PowerUpType; w: number }> = [];
  // Public
  if (!(current && current.type === "fast")) available.push({t: "fast", w: 0.32});
  if (!(current && current.type === "slow")) available.push({t: "slow", w: 0.18});
  available.push({t: "expand", w: 0.18});
  available.push({t: "shrink", w: 0.12});
  available.push({t: "multiball", w: 0.12});
  // Auth-only
  if (entitled.auth && !(current && current.type === "sticky")) available.push({t: "sticky", w: 0.15});
  // Subscriber-only (heavier features)
  if (entitled.sub) {
    available.push({t: "thru", w: 0.10});
    available.push({t: "bomb", w: 0.06});
    available.push({t: "fireball", w: 0.06});
    available.push({t: "laser", w: 0.05});
    available.push({t: "extraLife", w: 0.06});
  }
  const sum = available.reduce((a, b) => a + b.w, 0) || 1;
  let r = Math.random() * sum;
  for (const item of available) {
    if (r < item.w) return item.t;
    r -= item.w;
  }
  return available[0]?.t ?? "fast";
}

function desiredSpeedFromModifier(
    mod: ActiveModifier,
    level: number,
    slowFactor: number,
): number {
  // Gentle level-based ramp: +5% per level, capped at +30%
  const levelRamp = 1 + Math.min(Math.max(0, level - 1) * 0.05, 0.3);
  const base = BASE_BALL_SPEED * levelRamp;
  const factor =
      mod?.type === "fast" ? FAST_FACTOR : mod?.type === "slow" ? slowFactor : 1;
  // Mode scaling: Hard slightly faster; Chaos fastest
  const mode = (typeof window !== "undefined" && (window as any).__gh_mode) as
      | "classic"
      | "hard"
      | "chaos"
      | undefined;
  const modeScale = mode === "hard" ? 1.1 : mode === "chaos" ? 1.25 : 1;
  return clamp(base * factor * modeScale, MIN_BALL_SPEED, MAX_BALL_SPEED);
}

export default function BreakoutGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // Input device hint: coarse vs fine pointer
  const isCoarseRef = useRef<boolean>(false);
  const paddleInfluenceRef = useRef<number>(PADDLE_INFLUENCE_BASE);
  const slowFactorRef = useRef<number>(SLOW_FACTOR_DESKTOP);

  // Paddle state + a ref to move immediately inside RAF
  const [paddle, setPaddle] = useState<Paddle>({
    x: (CANVAS_WIDTH - PADDLE_WIDTH) / 2,
    y: CANVAS_HEIGHT - PADDLE_HEIGHT - 10,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
  });
  const paddleXRef = useRef<number>(paddle.x);
  const lastPaddleXRef = useRef<number>(paddle.x);
  const lastNudgeAtRef = useRef<number>(0);
  const paddleRef = useRef<Paddle>({...paddle});

  // Simple ball state
  const [ball, setBall] = useState<Ball>({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT - 30,
    dx: BASE_BALL_SPEED,
    dy: -BASE_BALL_SPEED,
    radius: BALL_RADIUS,
  });
  const ballRef = useRef<Ball>({...ball});

  // Bricks grid
  const [bricks, setBricks] = useState<Brick[][]>([]);
  const bricksRef = useRef<Brick[][]>([]);

  // Game flags
  const [gameStarted, setGameStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [level, setLevel] = useState(1);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [awaitingNext, setAwaitingNext] = useState(false);
  const gameStartedRef = useRef<boolean>(false);
  const isPausedRef = useRef<boolean>(false);
  const gameOverRef = useRef<boolean>(false);
  const levelRef = useRef<number>(1);
  const showLevelCompleteRef = useRef<boolean>(false);
  const awaitingNextRef = useRef<boolean>(false);

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(3);
  const scoreRef = useRef<number>(0);
  const livesRef = useRef<number>(3);

  // Power-ups state
  const [fallingPowerUps, setFallingPowerUps] = useState<FallingPowerUp[]>([]);
  const [activeModifier, setActiveModifier] = useState<ActiveModifier>(null);
  const fallingRef = useRef<FallingPowerUp[]>([]);
  const activeRef = useRef<ActiveModifier>(null);
  const lastLaserAtRef = useRef<number>(0);
  const modifierTimerRef = useRef<number>(0);
  // Extra balls for Multiball (do not cost lives when missed)
  const extraBallsRef = useRef<Ball[]>([]);
  // Sticky capture state
  const stickyStateRef = useRef<{ captured: boolean; offset: number; capturedAt: number } | null>(null);
  const stickyReleasePendingRef = useRef<boolean>(false);

  // Input cache
  const keysDownRef = useRef<Set<string>>(new Set());

  // Brick factory moved to top-level helper to avoid effect deps; see below usage

  // Initialize or reinitialize a level
  const initLevel = useCallback(() => {
    const layout = computeBrickLayout(CANVAS_WIDTH);
    const newBricks = buildBricks(levelRef.current || 1, layout);
    setBricks(newBricks);
    bricksRef.current = newBricks;

    // Reset ball and paddle for a fresh serve
    const nextBall: Ball = {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT - 30,
      dx: BASE_BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
      dy: -BASE_BALL_SPEED,
      radius: BALL_RADIUS,
    };
    setBall(nextBall);
    ballRef.current = nextBall;

    setPaddle((prev) => {
      const np = {
        ...prev,
        x: (CANVAS_WIDTH - PADDLE_WIDTH) / 2,
        y: CANVAS_HEIGHT - PADDLE_HEIGHT - 10,
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT,
      };
      paddleRef.current = np;
      return np;
    });
    paddleXRef.current = (CANVAS_WIDTH - PADDLE_WIDTH) / 2;
  }, []);

  const startGame = useCallback(() => {
    setScore(0);
    setLives(3);
    setLevel(1);
    setGameOver(false);
    setGameStarted(true);
    initLevel();
    soundManager.playMusic("background");
  }, [initLevel]);

  // Helper: advance to next level (used by Space and button when awaitingNext)
  const advanceToNextLevel = useCallback(() => {
    // Stop any ongoing fireworks immediately
    fireworksUntilRef.current = 0;
    const nextLevel = (levelRef.current || 1) + 1;
    setLevel(nextLevel);
    levelRef.current = nextLevel;
    const newGrid = buildBricks(nextLevel, computeBrickLayout(CANVAS_WIDTH));
    setBricks(newGrid);
    bricksRef.current = newGrid;
    const resetBall: Ball = {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT - 30,
      dx: BASE_BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
      dy: -BASE_BALL_SPEED,
      radius: BALL_RADIUS,
    };
    setBall(resetBall);
    ballRef.current = resetBall;
    const np = {
      ...paddleRef.current,
      x: (CANVAS_WIDTH - PADDLE_WIDTH) / 2,
      y: CANVAS_HEIGHT - PADDLE_HEIGHT - 10,
      width: PADDLE_WIDTH,
      height: PADDLE_HEIGHT,
    };
    setPaddle(np);
    paddleRef.current = np;
    paddleXRef.current = np.x;
    setShowLevelComplete(false);
    showLevelCompleteRef.current = false;
    setAwaitingNext(false);
    awaitingNextRef.current = false;
    setIsPaused(false);
  }, []);

  // Resize handling for crisp canvas on DPR screens
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const handleResize = () => {
      const container = canvas.parentElement;
      if (!container) {
        return;
      }
      const containerWidth = container.clientWidth;
      const scale = Math.min(containerWidth / CANVAS_WIDTH, 1);
      canvas.style.width = `${CANVAS_WIDTH * scale}px`;
      canvas.style.height = `${CANVAS_HEIGHT * scale}px`;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = CANVAS_WIDTH * dpr;
      canvas.height = CANVAS_HEIGHT * dpr;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // @ts-ignore - setTransform is supported broadly
        if (typeof (ctx as any).setTransform === "function") {
          (ctx as any).setTransform(dpr, 0, 0, dpr, 0, 0);
        } else {
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
      }
      // Update pointer type derived tuning (mobile vs desktop)
      try {
        const coarse = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
        isCoarseRef.current = !!coarse;
        // On coarse pointers (most touch devices), slightly increase paddle influence
        // so quick flicks meaningfully affect the ball's outgoing angle.
        paddleInfluenceRef.current = coarse ? PADDLE_INFLUENCE_MOBILE : PADDLE_INFLUENCE_BASE;
        slowFactorRef.current = coarse ? SLOW_FACTOR_MOBILE : SLOW_FACTOR_DESKTOP;
      } catch {
        // no-op
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Keyboard input
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (e.code === "Space") {
        e.preventDefault();
        if (awaitingNextRef.current) {
          // Space advances to next level when awaiting start
          advanceToNextLevel();
          return;
        }
        if (!gameStarted) {
          startGame();
        } else {
          setIsPaused((p) => !p);
        }
        return;
      }
      if (e.key === "ArrowUp") {
        // release sticky ball if held
        stickyReleasePendingRef.current = true;
      }
      if (e.key === "ArrowLeft" || key === "a") {
        e.preventDefault();
        keysDownRef.current.add("left");
      }
      if (e.key === "ArrowRight" || key === "d") {
        e.preventDefault();
        keysDownRef.current.add("right");
      }
    };
    const up = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (e.key === "ArrowLeft" || key === "a") {
        keysDownRef.current.delete("left");
      }
      if (e.key === "ArrowRight" || key === "d") {
        keysDownRef.current.delete("right");
      }
    };
    document.addEventListener("keydown", down, {capture: true});
    document.addEventListener("keyup", up, {capture: true});
    return () => {
      document.removeEventListener(
          "keydown",
          down as any,
          {capture: true} as any,
      );
      document.removeEventListener(
          "keyup",
          up as any,
          {capture: true} as any,
      );
    };
  }, [gameStarted, startGame, advanceToNextLevel]);

  // Pointer/touch input
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    (canvas.style as any).touchAction = "none";
    const moveTo = (clientX: number) => {
      const rect = canvas.getBoundingClientRect();
      const x =
          ((clientX - rect.left) / rect.width) * CANVAS_WIDTH - paddle.width / 2;
      const clamped = clamp(x, 0, CANVAS_WIDTH - paddle.width);
      paddleXRef.current = clamped;
    };
    const onMouseMove = (e: MouseEvent) => !isPaused && moveTo(e.clientX);
    const onTouchStart = (e: TouchEvent) => {
      if (isPaused) {
        return;
      }
      e.preventDefault();
      if (e.touches?.length) {
        moveTo(e.touches[0].clientX);
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (isPaused) {
        return;
      }
      e.preventDefault();
      if (e.touches?.length) {
        moveTo(e.touches[0].clientX);
      }
    };
    canvas.addEventListener("mousemove", onMouseMove as any);
    canvas.addEventListener(
        "touchmove",
        onTouchMove as any,
        {passive: false} as any,
    );
    canvas.addEventListener(
        "touchstart",
        onTouchStart as any,
        {passive: false} as any,
    );
    return () => {
      canvas.removeEventListener("mousemove", onMouseMove as any);
      canvas.removeEventListener("touchmove", onTouchMove as any);
      canvas.removeEventListener("touchstart", onTouchStart as any);
    };
  }, [isPaused, paddle.width]);

  // Keep refs in sync with state (so RAF loop can read fresh values)
  useEffect(() => {
    paddleRef.current = paddle;
  }, [paddle]);
  useEffect(() => {
    ballRef.current = ball;
  }, [ball]);
  useEffect(() => {
    bricksRef.current = bricks;
  }, [bricks]);
  useEffect(() => {
    fallingRef.current = fallingPowerUps;
  }, [fallingPowerUps]);
  useEffect(() => {
    activeRef.current = activeModifier;
  }, [activeModifier]);
  useEffect(() => {
    gameStartedRef.current = gameStarted;
  }, [gameStarted]);
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);
  useEffect(() => {
    gameOverRef.current = gameOver;
  }, [gameOver]);
  useEffect(() => {
    levelRef.current = level;
  }, [level]);
  useEffect(() => {
    showLevelCompleteRef.current = showLevelComplete;
  }, [showLevelComplete]);
  useEffect(() => {
    awaitingNextRef.current = awaitingNext;
  }, [awaitingNext]);
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);
  useEffect(() => {
    livesRef.current = lives;
  }, [lives]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    let raf = 0;
    let particles: ParticlePool | null = null;
    let lastTs = 0;

    const draw = () => {
      const stateBall = ballRef.current;
      const statePaddle = paddleRef.current;
      const stateBricks = bricksRef.current;
      const stateFalling = fallingRef.current;
      const stateActive = activeRef.current;
      const stateLives = livesRef.current;
      const stateLevel = levelRef.current;
      const started = gameStartedRef.current;
      const paused = isPausedRef.current;
      const over = gameOverRef.current;
      const levelDone = showLevelCompleteRef.current;

      // Defensive: if bricks are missing (edge case on rare mounts), rebuild grid
      if (!stateBricks || !stateBricks.length || !stateBricks[0]?.length) {
        const rebuilt = buildBricks(levelRef.current || 1, computeBrickLayout(CANVAS_WIDTH));
        setBricks(rebuilt);
        bricksRef.current = rebuilt;
      }

      // background (theme-aware: light canvas on dark theme, dark canvas on light theme)
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");
      ctx.fillStyle = isDark ? "#ffffff" : "#0f172a";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Seed E2E data attributes at the very start of the frame (helps tests avoid nulls)
      if (canvasRef.current) {
        const el = canvasRef.current as HTMLCanvasElement;
        el.dataset.px = String(Math.round(statePaddle.x));
        el.dataset.ballx = String(Math.round(stateBall.x));
        el.dataset.bally = String(Math.round(stateBall.y));
        el.dataset.lives = String(livesRef.current || 0);
      }

      // update paddle first for immediate response
      const down = keysDownRef.current;
      let dx = 0;
      if (down.has("left")) {
        dx -= PADDLE_SPEED;
      }
      if (down.has("right")) {
        dx += PADDLE_SPEED;
      }
      let newPx = clamp(
          (paddleXRef.current ?? statePaddle.x) + dx,
          0,
          CANVAS_WIDTH - statePaddle.width,
      );
      // Track paddle velocity (px per frame) for collision influence
      const paddleV = newPx - (lastPaddleXRef.current ?? newPx);
      lastPaddleXRef.current = newPx;
      paddleXRef.current = newPx;
      if (newPx !== statePaddle.x) {
        setPaddle((p) => {
          const np = {...p, x: newPx};
          paddleRef.current = np;
          return np;
        });
      }

      // draw paddle
      ctx.fillStyle = "#3498db";
      ctx.fillRect(newPx, statePaddle.y, statePaddle.width, statePaddle.height);
      // Expose paddleX for E2E via data attribute (every frame)
      if (canvasRef.current) {
        (canvasRef.current as HTMLCanvasElement).dataset.px = String(Math.round(newPx));
      }

      // draw ball
      ctx.beginPath();
      ctx.arc(stateBall.x, stateBall.y, stateBall.radius, 0, Math.PI * 2);
      ctx.fillStyle = isDark ? "#e11d48" : "#e74c3c";
      ctx.fill();
      ctx.closePath();

      // draw extra balls
      if (extraBallsRef.current.length) {
        for (const eb of extraBallsRef.current) {
          ctx.beginPath();
          ctx.arc(eb.x, eb.y, eb.radius, 0, Math.PI * 2);
          ctx.fillStyle = isDark ? "#22c55e" : "#10b981"; // emerald for extra balls
          ctx.fill();
          ctx.closePath();
        }
      }

      // draw bricks
      for (const col of stateBricks) {
        for (const b of col) {
          if (b.health <= 0) {
            continue;
          }
          // body
          ctx.fillStyle = b.color;
          ctx.fillRect(b.x, b.y, b.width, b.height);
          // if tough (health>1), add a highlight stripe
          if (b.health > 1) {
            ctx.fillStyle = "rgba(255,255,255,0.25)";
            ctx.fillRect(b.x + 4, b.y + 4, b.width - 8, 3);
          }
        }
      }

      // draw falling power-ups (color‑mapped, labeled)
      if (stateFalling.length) {
        for (const p of stateFalling) {
          ctx.beginPath();
          // Palette mapping
          const colorMap: Record<PowerUpType, string> = {
            fast: "#22c55e",       // green
            slow: "#f59e0b",       // amber
            sticky: "#f0abfc",     // fuchsia-300
            thru: "#84cc16",       // lime
            bomb: "#ef4444",       // red
            fireball: "#fb923c",   // orange
            laser: "#67e8f9",      // cyan
            extraLife: "#10b981",  // emerald
            expand: "#60a5fa",     // sky
            shrink: "#94a3b8",     // slate
            multiball: "#a78bfa",  // violet
          } as const;
          ctx.fillStyle = colorMap[p.type] || "#94a3b8";
          ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.closePath();
          // icon letter
          ctx.fillStyle = "#0f172a";
          ctx.font = "10px Arial";
          ctx.textAlign = "center";
          const letterMap: Record<PowerUpType, string> = {
            fast: "F",
            slow: "S",
            sticky: "G",
            thru: "T",
            bomb: "B",
            fireball: "🔥",
            laser: "L",
            extraLife: "+",
            expand: "><",
            shrink: "<>",
            multiball: "×2",
          } as const;
          const letter = letterMap[p.type] || "?";
          ctx.fillText(letter, p.x, p.y + 3);
        }
      }

      // In-canvas HUD text removed (external HUD bar handles score/lives/modifiers)

      // overlays
      if (!started) {
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.fillStyle = isDark ? "#111827" : "#fff";
        ctx.textAlign = "center";
        ctx.font = "20px Arial";
        ctx.fillText(
            "Press Space or Click to Start",
            CANVAS_WIDTH / 2,
            CANVAS_HEIGHT / 2,
        );
      } else if (paused) {
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.fillStyle = isDark ? "#111827" : "#fff";
        ctx.textAlign = "center";
        ctx.font = "20px Arial";
        ctx.fillText("Paused (Space)", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      } else if (levelDone) {
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.fillStyle = isDark ? "#111827" : "#fff";
        ctx.textAlign = "center";
        ctx.font = "22px Arial";
        ctx.fillText(
            `Level ${stateLevel} Complete!`,
            CANVAS_WIDTH / 2,
            CANVAS_HEIGHT / 2,
        );
      } else if (over) {
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.fillStyle = isDark ? "#111827" : "#fff";
        ctx.textAlign = "center";
        ctx.font = "24px Arial";
        ctx.fillText(
            "Game Over — Press Space",
            CANVAS_WIDTH / 2,
            CANVAS_HEIGHT / 2,
        );
      }

      // game updates
      if (started && !paused && !over) {
        // move ball
        let nx = stateBall.x + stateBall.dx;
        let ny = stateBall.y + stateBall.dy;
        let ndx = stateBall.dx;
        let ndy = stateBall.dy;

        // If sticky captured, follow paddle until release
        const sticky = stickyStateRef.current;
        if (sticky && sticky.captured) {
          const center = newPx + statePaddle.width / 2;
          nx = center + sticky.offset;
          ny = statePaddle.y - stateBall.radius - 0.01;
          ndx = 0;
          ndy = 0;
          // Check release input or timeout
          const now = Date.now();
          if (!awaitingNextRef.current && (stickyReleasePendingRef.current || now - sticky.capturedAt > 1500)) {
            // release upwards with slight angle from offset and paddle velocity
            stickyReleasePendingRef.current = false;
            const angleBase = clamp(sticky.offset / (statePaddle.width / 2), -1, 1) * MAX_BOUNCE_ANGLE;
            const influence = clamp(
                (newPx - (lastPaddleXRef.current ?? newPx)) * paddleInfluenceRef.current,
                -MAX_INFLUENCE_ANGLE,
                MAX_INFLUENCE_ANGLE,
            );
            let angle = angleBase + influence;
            if (Math.abs(angle) < MIN_BOUNCE_ANGLE) {
              angle = angle >= 0 ? MIN_BOUNCE_ANGLE : -MIN_BOUNCE_ANGLE;
            }
            const target = desiredSpeedFromModifier(activeRef.current, stateLevel, slowFactorRef.current);
            ndx = target * Math.sin(angle);
            ndy = -target * Math.cos(angle);
            stickyStateRef.current = {captured: false, offset: 0, capturedAt: 0};
          } else {
            // while held, update ball and skip rest of physics except power-ups fall
            const updatedBallWhileHeld: Ball = {x: nx, y: ny, dx: ndx, dy: ndy, radius: stateBall.radius};
            setBall(updatedBallWhileHeld);
            ballRef.current = updatedBallWhileHeld;
            // Expose data attrs
            if (canvasRef.current) {
              const el = canvasRef.current as HTMLCanvasElement;
              el.dataset.ballx = String(Math.round(nx));
              el.dataset.bally = String(Math.round(ny));
              el.dataset.lives = String(livesRef.current || 0);
            }
            // We still update falling power-ups and expiry timers below, so continue to that section
          }
        }

        // walls — reflect AND clamp position inside bounds so the ball never leaves the canvas
        if (nx + stateBall.radius > CANVAS_WIDTH) {
          nx = CANVAS_WIDTH - stateBall.radius;
          ndx = -Math.abs(ndx);
          soundManager.playSound("wall");
        } else if (nx - stateBall.radius < 0) {
          nx = stateBall.radius;
          ndx = Math.abs(ndx);
          soundManager.playSound("wall");
        }
        if (ny - stateBall.radius < 0) {
          ny = stateBall.radius;
          ndy = Math.abs(ndy);
          soundManager.playSound("wall");
        }

        // paddle
        if (
            // require downward motion to avoid double-hitting from below
            stateBall.dy > 0 &&
            ny + stateBall.radius > statePaddle.y &&
            ny - stateBall.radius < statePaddle.y + statePaddle.height &&
            nx + stateBall.radius > newPx &&
            nx - stateBall.radius < newPx + statePaddle.width
        ) {
          // If sticky modifier is active, capture the ball instead of bouncing
          if (activeRef.current && activeRef.current.type === "sticky" && !(stickyStateRef.current?.captured)) {
            const center = newPx + statePaddle.width / 2;
            const offset = nx - center;
            stickyStateRef.current = {captured: true, offset, capturedAt: Date.now()};
            nx = center + offset;
            ny = statePaddle.y - stateBall.radius - 0.01;
            ndx = 0;
            ndy = 0;
            soundManager.playSound("paddle");
          } else {
          // Compute bounce angle relative to paddle center (0 is straight up)
          const rel = (nx - (newPx + statePaddle.width / 2)) / (statePaddle.width / 2); // -1 .. 1
          const baseAngle = clamp(rel, -1, 1) * MAX_BOUNCE_ANGLE; // -MAX..+MAX
          // Add a small influence based on paddle movement direction/speed this frame
          const influence = clamp(
              paddleV * paddleInfluenceRef.current,
              -MAX_INFLUENCE_ANGLE,
              MAX_INFLUENCE_ANGLE,
          );
          let angle = baseAngle + influence;
          // Enforce a minimum horizontal angle away from vertical
          if (Math.abs(angle) < MIN_BOUNCE_ANGLE) {
            angle = angle >= 0 ? MIN_BOUNCE_ANGLE : -MIN_BOUNCE_ANGLE;
          }
          // Compute components from angle, preserving current speed magnitude
          const speed = Math.sqrt(ndx * ndx + ndy * ndy) || BASE_BALL_SPEED;
          let tx = speed * Math.sin(angle);
          let ty = -speed * Math.cos(angle);
          // Ensure horizontal component doesn't vanish
          if (Math.abs(tx) < MIN_HORIZ_COMPONENT) {
            const sign = tx >= 0 ? 1 : -1;
            const hx = MIN_HORIZ_COMPONENT * sign;
            const hy =
                -Math.sign(ty || -1) *
                Math.sqrt(Math.max(0, speed * speed - hx * hx));
            ndx = hx;
            ndy = hy;
          } else {
            ndx = tx;
            ndy = ty;
          }
          // Pop the ball just above the paddle to ensure it never gets embedded or appears below
          ny = statePaddle.y - stateBall.radius - 0.01;
          soundManager.playSound("paddle");
          }
        }

        // bottom
        if (ny + stateBall.radius > CANVAS_HEIGHT) {
          soundManager.playSound("loseLife");
          if ((livesRef.current || 0) <= 1) {
            setGameOver(true);
            soundManager.playSound("gameOver");
            soundManager.stopMusic();
          } else {
            setLives((l) => l - 1);
            livesRef.current = (livesRef.current || 1) - 1;
            setGameStarted(false);
            const resetBall: Ball = {
              x: CANVAS_WIDTH / 2,
              y: CANVAS_HEIGHT - 30,
              dx: BASE_BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
              dy: -BASE_BALL_SPEED,
              radius: BALL_RADIUS,
            };
            nx = resetBall.x;
            ny = resetBall.y;
            ndx = resetBall.dx;
            ndy = resetBall.dy;
            setBall(resetBall);
            ballRef.current = resetBall;
          }
        }

        // brick collisions (defensive against uninitialized/partial grids)
        const nextBricks = stateBricks.map((col) => col.map((b) => ({...b})));
        let hit = false;
        outer: for (let c = 0; c < nextBricks.length; c++) {
          const col = nextBricks[c];
          if (!col) {
            continue;
          }
          for (let r = 0; r < col.length; r++) {
            const b = col[r];
            if (!b || b.health <= 0) {
              continue;
            }
            if (
                nx + stateBall.radius > b.x &&
                nx - stateBall.radius < b.x + b.width &&
                ny + stateBall.radius > b.y &&
                ny - stateBall.radius < b.y + b.height
            ) {
              // choose axis by smaller overlap
              const overlapX = Math.min(
                  Math.abs(nx - (b.x + b.width)),
                  Math.abs(nx - b.x),
              );
              const overlapY = Math.min(
                  Math.abs(ny - (b.y + b.height)),
                  Math.abs(ny - b.y),
              );
              const thru = activeRef.current?.type === "thru";
              if (!thru) {
                if (overlapX < overlapY) {
                  ndx = -ndx;
                } else {
                  ndy = -ndy;
                }
              }
              b.health -= 1;
              // Fireball: one-hit kill
              if (activeRef.current?.type === "fireball") {
                b.health = 0;
              }
              setScore((s) => s + b.points);
              scoreRef.current = (scoreRef.current || 0) + b.points;
              // Sound feedback: hit vs break
              if (b.health <= 0) {
                soundManager.playSound("brickBreak");
              } else {
                soundManager.playSound("brickHit");
              }
              // Optional particles: on brick destruction, emit selected effect
              if (enableParticlesRef.current) {
                if (!particles) {
                  particles = new ParticlePool({maxParticles: 96});
                }
                if (b.health <= 0) {
                  const cx = b.x + b.width / 2;
                  const cy = b.y + b.height / 2;
                  if (particleEffectRef.current === "puff") {
                    // Slightly more puffs for visibility on desktop
                    particles.emitDustPuff(cx, cy, b.color, 8 + Math.floor(Math.random() * 4));
                  } else {
                    // Boost spark count for a clearer burst
                    particles.emitSparkBurst(cx, cy, b.color, 14 + Math.floor(Math.random() * 6));
                  }
                }
              }
              // Light haptics on supported devices
              try {
                (navigator as any)?.vibrate?.(b.health <= 0 ? 15 : 8);
              } catch {
              }
              // maybe drop a power-up
              if (b.health <= 0) {
                // Bomb: simple AoE around the destroyed brick and consume modifier
                if (activeRef.current?.type === "bomb") {
                  const R = 46;
                  for (let cc = 0; cc < nextBricks.length; cc++) {
                    const col2 = nextBricks[cc];
                    if (!col2) continue;
                    for (let rr = 0; rr < col2.length; rr++) {
                      const bb = col2[rr];
                      if (!bb || bb.health <= 0) continue;
                      const cx = bb.x + bb.width / 2;
                      const cy = bb.y + bb.height / 2;
                      const dx2 = (b.x + b.width / 2) - cx;
                      const dy2 = (b.y + b.height / 2) - cy;
                      if (dx2 * dx2 + dy2 * dy2 <= R * R) {
                        bb.health = 0;
                      }
                    }
                  }
                  setActiveModifier(null);
                  activeRef.current = null;
                }
                let chance = isCoarseRef.current ? 0.08 : POWERUP_DROP_CHANCE;
                // Mode adjusts drop rate slightly
                if (modeRef.current === "hard") chance *= 1.2;
                if (modeRef.current === "chaos") chance *= 1.5;
                const shouldDrop = Math.random() < chance;
                if (shouldDrop) {
                  setFallingPowerUps((prev) => {
                    if (prev.length >= POWERUP_MAX_FALLING) {
                      return prev;
                    }
                    const type = pickWeightedPowerUp(activeRef.current, authRef.current);
                    const next = [
                      ...prev,
                      {
                        x: b.x + b.width / 2,
                        y: b.y + b.height / 2,
                        dy: 2.2, // slightly faster fall to be noticeable
                        type,
                        size: 14,
                      },
                    ];
                    fallingRef.current = next;
                    return next;
                  });
                }
              }
              hit = true;
              break outer;
            }
          }
        }
        if (hit) {
          setBricks(nextBricks);
          bricksRef.current = nextBricks;
        }

        // Anti-stall: if horizontal component is too small after a bounce, gently nudge it
        const nowTs = Date.now();
        if (
            Math.abs(ndx) < NUDGE_EPS &&
            nowTs - (lastNudgeAtRef.current || 0) > NUDGE_COOLDOWN_MS
        ) {
          const dir = nx < CANVAS_WIDTH / 2 ? 1 : -1; // push toward center-ish
          ndx = dir * NUDGE_AMOUNT;
          lastNudgeAtRef.current = nowTs;
        }

        // normalize ball speed based on active modifier (no-op while sticky captured)
        const target = desiredSpeedFromModifier(
            activeRef.current,
            stateLevel,
            slowFactorRef.current,
        );
        const len = Math.sqrt(ndx * ndx + ndy * ndy) || 1;
        const scale = target / len;
        ndx *= scale;
        ndy *= scale;

        // After normalization, still ensure a minimum horizontal component to avoid vertical traps
        if (Math.abs(ndx) < MIN_HORIZ_COMPONENT * 0.5) {
          const sign = ndx >= 0 ? 1 : -1;
          const hx = MIN_HORIZ_COMPONENT * 0.5 * sign;
          const hy =
              -Math.sign(ndy || -1) *
              Math.sqrt(Math.max(0, target * target - hx * hx));
          ndx = hx;
          ndy = hy;
        }

        // Final safety: clamp position inside the canvas so the ball never leaves visible bounds
        nx = clamp(nx, stateBall.radius, CANVAS_WIDTH - stateBall.radius);
        ny = clamp(ny, stateBall.radius, CANVAS_HEIGHT - stateBall.radius);

        const updatedBall: Ball = {x: nx, y: ny, dx: ndx, dy: ndy, radius: stateBall.radius};
        setBall(updatedBall);
        ballRef.current = updatedBall;
        // Expose ball position for E2E
        if (canvasRef.current) {
          const el = canvasRef.current as HTMLCanvasElement;
          el.dataset.ballx = String(Math.round(nx));
          el.dataset.bally = String(Math.round(ny));
          el.dataset.lives = String(livesRef.current || 0);
        }

        // Update extra balls physics (simplified) — no life loss when missed
        if (extraBallsRef.current.length) {
          const nextExtras: Ball[] = [];
          for (const eb of extraBallsRef.current) {
            let ex = eb.x + eb.dx;
            let ey = eb.y + eb.dy;
            let edx = eb.dx;
            let edy = eb.dy;
            // walls
            if (ex + eb.radius > CANVAS_WIDTH || ex - eb.radius < 0) edx = -edx;
            if (ey - eb.radius < 0) edy = -edy;
            // paddle bounce
            if (
                ey + eb.radius >= statePaddle.y &&
                ey - eb.radius <= statePaddle.y + statePaddle.height &&
                ex >= newPx && ex <= newPx + statePaddle.width &&
                edy > 0
            ) {
              const rel = (ex - (newPx + statePaddle.width / 2)) / (statePaddle.width / 2);
              const angle = clamp(rel, -1, 1) * MAX_BOUNCE_ANGLE;
              const speed = Math.sqrt(edx * edx + edy * edy) || BASE_BALL_SPEED;
              edx = speed * Math.sin(angle);
              edy = -speed * Math.cos(angle);
              // small nudge to avoid vertical traps
              if (Math.abs(edx) < MIN_HORIZ_COMPONENT * 0.5) edx = (edx >= 0 ? 1 : -1) * MIN_HORIZ_COMPONENT * 0.5;
              ey = statePaddle.y - eb.radius - 0.01;
            }
            // bricks
            outerExtra: for (let c = 0; c < nextBricks.length; c++) {
              const col = nextBricks[c];
              if (!col) continue;
              for (let r = 0; r < col.length; r++) {
                const b = col[r];
                if (!b || b.health <= 0) continue;
                if (ex + eb.radius > b.x && ex - eb.radius < b.x + b.width && ey + eb.radius > b.y && ey - eb.radius < b.y + b.height) {
                  const ox = Math.min(Math.abs(ex - (b.x + b.width)), Math.abs(ex - b.x));
                  const oy = Math.min(Math.abs(ey - (b.y + b.height)), Math.abs(ey - b.y));
                  if (ox < oy) edx = -edx; else edy = -edy;
                  b.health -= 1;
                  if (b.health <= 0) soundManager.playSound("brickBreak"); else soundManager.playSound("brickHit");
                  break outerExtra;
                }
              }
            }
            // clamp and keep
            ex = clamp(ex, eb.radius, CANVAS_WIDTH - eb.radius);
            ey = clamp(ey, eb.radius, CANVAS_HEIGHT + eb.radius);
            if (ey - eb.radius <= CANVAS_HEIGHT) {
              nextExtras.push({x: ex, y: ey, dx: edx, dy: edy, radius: eb.radius});
            }
          }
          extraBallsRef.current = nextExtras;
        }

        // check level complete (robust against missing rows)
        const remaining = nextBricks.reduce(
            (acc, col) =>
                acc + (col?.filter((b) => b && b.health > 0).length || 0),
            0,
        );
        if (nextBricks.length && remaining === 0) {
          setShowLevelComplete(true);
          showLevelCompleteRef.current = true;
          setAwaitingNext(true);
          awaitingNextRef.current = true;
          soundManager.playSound("levelComplete");
          // Fireworks window
          fireworksUntilRef.current = Date.now() + 2500;
          // Park ball on paddle center until user starts next level
          const centerX = newPx + statePaddle.width / 2;
          const parkedBall: Ball = {
            x: centerX,
            y: statePaddle.y - stateBall.radius - 0.01,
            dx: 0,
            dy: 0,
            radius: stateBall.radius,
          };
          setBall(parkedBall);
          ballRef.current = parkedBall;
          stickyStateRef.current = {captured: true, offset: 0, capturedAt: Date.now()};
        }

        // Laser: periodically zap bricks above paddle while active
        if (activeRef.current?.type === "laser") {
          const nowMs = Date.now();
          const interval = modeRef.current === "chaos" ? 280 : 380;
          if (nowMs - (lastLaserAtRef.current || 0) > interval) {
            lastLaserAtRef.current = nowMs;
            const aimXs = [statePaddle.x + statePaddle.width * 0.25, statePaddle.x + statePaddle.width * 0.75];
            for (const ax of aimXs) {
              // Find the nearest brick intersecting ax (lowest y)
              let target: { c: number; r: number } | null = null;
              let minY = Infinity;
              for (let c = 0; c < nextBricks.length; c++) {
                const col = nextBricks[c];
                if (!col) continue;
                for (let r = 0; r < col.length; r++) {
                  const bb = col[r];
                  if (!bb || bb.health <= 0) continue;
                  if (ax >= bb.x && ax <= bb.x + bb.width) {
                    if (bb.y < minY) {
                      minY = bb.y;
                      target = {c, r};
                    }
                  }
                }
              }
              if (target) {
                const bb = nextBricks[target.c][target.r];
                if (bb) bb.health = 0;
              }
            }
          }
        }

        // update falling power-ups
        if (stateFalling.length) {
          const updated: FallingPowerUp[] = [];
          for (const p of stateFalling) {
            const nyPU = p.y + p.dy;
            // check catch by paddle
            const caught =
                nyPU + p.size / 2 >= statePaddle.y &&
                nyPU - p.size / 2 <= statePaddle.y + statePaddle.height &&
                p.x + p.size / 2 >= newPx &&
                p.x - p.size / 2 <= newPx + statePaddle.width;
            if (caught) {
              // apply/refresh modifier
              const now = Date.now();
              if (p.type === "extraLife") {
                setLives((lv) => Math.min(5, lv + 1));
                livesRef.current = Math.min(5, (livesRef.current || 0) + 1);
              } else if (p.type === "expand" || p.type === "shrink") {
                const base = PADDLE_WIDTH;
                const factor = p.type === "expand" ? PADDLE_EXPAND_FACTOR : PADDLE_SHRINK_FACTOR;
                const newW = clamp(base * factor, base * 0.6, base * 1.8);
                // Keep paddle within bounds when width changes
                setPaddle((prev) => {
                  const nx = clamp(prev.x, 0, CANVAS_WIDTH - newW);
                  const np = {...prev, width: newW, x: nx};
                  paddleRef.current = np;
                  return np;
                });
                const dur = POWERUP_DURATION_MS;
                const next: ActiveModifier = {type: p.type, endTime: now + dur};
                setActiveModifier(next);
                activeRef.current = next;
              } else if (p.type === "multiball") {
                // Spawn two additional balls from current main ball with slight angles
                const mb = ballRef.current;
                const speed = Math.sqrt(mb.dx * mb.dx + mb.dy * mb.dy) || BASE_BALL_SPEED;
                const angles = [-0.25, 0.25];
                for (const a of angles) {
                  const ca = Math.atan2(mb.dy, mb.dx) + a;
                  extraBallsRef.current.push({
                    x: mb.x,
                    y: mb.y,
                    dx: speed * Math.cos(ca),
                    dy: speed * Math.sin(ca),
                    radius: BALL_RADIUS * 0.9,
                  });
                }
                const next: ActiveModifier = {type: p.type, endTime: now + POWERUP_DURATION_MS};
                setActiveModifier(next);
                activeRef.current = next;
              } else {
                const dur = (p.type === "laser" || p.type === "thru" || p.type === "fireball") ? POWERUP_DURATION_LONG_MS : POWERUP_DURATION_MS;
                const next: ActiveModifier = {type: p.type, endTime: now + dur};
                setActiveModifier(next);
                activeRef.current = next;
              }
              // clear sticky state on mode change
              if (p.type !== "sticky") {
                stickyStateRef.current = {captured: false, offset: 0, capturedAt: 0};
              }
              soundManager.playSound("powerUp");
              continue; // consumed
            }
            if (nyPU - p.size / 2 <= CANVAS_HEIGHT) {
              updated.push({...p, y: nyPU});
            }
          }
          setFallingPowerUps(updated);
          fallingRef.current = updated;
        }

        // expire active modifier
        if (activeRef.current && Date.now() > activeRef.current.endTime) {
          // Reset paddle size when expand/shrink ends
          if (activeRef.current.type === "expand" || activeRef.current.type === "shrink") {
            setPaddle((prev) => {
              const w = PADDLE_WIDTH;
              const nx = clamp(prev.x, 0, CANVAS_WIDTH - w);
              const np = {...prev, width: w, x: nx};
              paddleRef.current = np;
              return np;
            });
          }
          setActiveModifier(null);
          activeRef.current = null;
          stickyStateRef.current = {captured: false, offset: 0, capturedAt: 0};
        }
      }

      // Fireworks emission window on victory
      if (fireworksUntilRef.current > Date.now()) {
        if (!particles) {
          particles = new ParticlePool({maxParticles: 192});
        }
        const tnow = Date.now();
        if (tnow - (fireworksTickRef.current || 0) > 120) {
          fireworksTickRef.current = tnow;
          // random position near top half
          const fx = 40 + Math.random() * (CANVAS_WIDTH - 80);
          const fy = 40 + Math.random() * (CANVAS_HEIGHT * 0.5);
          const colors = ["#f97316", "#22c55e", "#3b82f6", "#e11d48", "#a855f7", "#f59e0b"];
          const color = colors[(Math.random() * colors.length) | 0];
          if (particleEffectRef.current === "puff") {
            particles.emitDustPuff(fx, fy, color, 10 + Math.floor(Math.random() * 6));
          } else {
            particles.emitSparkBurst(fx, fy, color, 18 + Math.floor(Math.random() * 10));
          }
        }
      }

      // Draw particles last (overlay). Update only when enabled or during fireworks.
      // Ensure pool exists when we need to draw (also for fireworks)
      if ((enableParticlesRef.current || fireworksUntilRef.current > Date.now()) && !particles) {
        particles = new ParticlePool({maxParticles: 192});
      }
      if ((enableParticlesRef.current || fireworksUntilRef.current > Date.now()) && particles) {
        const now = performance.now();
        const dt = lastTs === 0 ? 16 : now - lastTs;
        lastTs = now;
        particles.update(dt);
        particles.draw(ctx);
      } else {
        lastTs = 0;
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Initialize dataset attributes once on mount to avoid null reads before first RAF
  useEffect(() => {
    const el = canvasRef.current as HTMLCanvasElement | null;
    if (!el) {
      return;
    }
    const b = ballRef.current || ball;
    const p = paddleRef.current || paddle;
    el.dataset.px = String(Math.round(p.x));
    el.dataset.ballx = String(Math.round(b.x));
    el.dataset.bally = String(Math.round(b.y));
    el.dataset.lives = String(livesRef.current || lives || 0);
  }, [ball, lives, paddle]);

  // Ensure particle pool uses device pixel ratio and draws after setting transform
  // Also reset globalAlpha each frame to avoid accidental 0 alpha from other ops
  const dprRef = useRef<number>(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1);

  // Game settings: particle toggle/effect and mode/entitlements
  const {enableParticles, particleEffect, mode, isAuthenticated, isSubscriber} = useGameSettings();
  const enableParticlesRef = useRef<boolean>(false);
  const particleEffectRef = useRef<"sparks" | "puff">("sparks");
  const modeRef = useRef<"classic" | "hard" | "chaos">("classic");
  const authRef = useRef<{ auth: boolean; sub: boolean }>({auth: false, sub: false});
  useEffect(() => {
    enableParticlesRef.current = !!enableParticles;
    particleEffectRef.current = particleEffect || "sparks";
    modeRef.current = mode || "classic";
    authRef.current = {auth: !!isAuthenticated, sub: !!isSubscriber};
  }, [enableParticles, particleEffect, mode, isAuthenticated, isSubscriber]);

  // Fireworks management during level completion
  const fireworksUntilRef = useRef<number>(0);
  const fireworksTickRef = useRef<number>(0);

  // High score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
    }
  }, [score, highScore]);

  // Deterministic life loss in E2E mode: on first start, drop the ball quickly below paddle
  const e2eLifeNudgedRef = useRef(false);
  useEffect(() => {
    const isE2E = process.env.NEXT_PUBLIC_E2E === "true";
    if (!isE2E) {
      return;
    }
    if (!gameStarted) {
      return;
    }
    if (e2eLifeNudgedRef.current) {
      return;
    }
    e2eLifeNudgedRef.current = true;
    // Nudge ball near bottom with downward velocity so `lives` decrements promptly
    setBall((prev) => {
      const nb = {
        ...prev,
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT - BALL_RADIUS - 2,
        dx: prev.dx || BASE_BALL_SPEED,
        dy: Math.abs(prev.dy || BASE_BALL_SPEED),
      };
      ballRef.current = nb;
      return nb;
    });
  }, [gameStarted]);

  // Dispatch gameover event for leaderboard submission listeners
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (!gameOver) {
      return;
    }
    const detail = {score} as { score: number };
    try {
      window.dispatchEvent(new CustomEvent("breakout:gameover", {detail}));
      window.dispatchEvent(new CustomEvent("game:gameover", {detail}));
    } catch {
      // no-op
    }
    // Submit score to backend (best-effort)
    (async () => {
      try {
        if (score > 0) {
          await submitScore({gameType: "BREAKOUT", score});
        }
      } catch {
        // ignore network/auth errors in game flow
      }
    })();
  }, [gameOver, score]);

  return (
      <GameContainer
          title="Breakout"
          description="Break all the bricks with the ball and don't let it fall!"
      >
        {/* Compact HUD above the canvas for better ergonomics */}
        <div className="mb-3">
          <div
              className="mx-auto max-w-[960px] rounded-md bg-gray-100 dark:bg-gray-800/80 px-3 py-2 shadow-sm flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-baseline gap-1.5">
              <div className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Score</div>
              <div className="text-lg md:text-xl font-bold tabular-nums">{score}</div>
            </div>
            <div className="hidden sm:flex items-baseline gap-1.5">
              <div className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">High</div>
              <div className="text-base md:text-lg font-semibold tabular-nums">{highScore}</div>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Lives</div>
              <div className="text-lg md:text-xl" aria-live="polite"
                   aria-label={`Lives ${lives}`}>{"❤️".repeat(lives)}</div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <div className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Level</div>
              <div className="text-base md:text-lg font-semibold">{level}</div>
            </div>
            {activeRef.current && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Mod</span>
                  {(() => {
                    const t = activeRef.current!.type as PowerUpType;
                    const colorClass: Record<PowerUpType, string> = {
                      fast: "bg-emerald-600",
                      slow: "bg-amber-600",
                      sticky: "bg-fuchsia-600",
                      thru: "bg-lime-600",
                      bomb: "bg-red-600",
                      fireball: "bg-orange-600",
                      laser: "bg-cyan-600",
                      extraLife: "bg-emerald-700",
                      expand: "bg-sky-600",
                      shrink: "bg-slate-600",
                      multiball: "bg-violet-600",
                    } as const;
                    return (
                        <span
                            className={`inline-flex items-center rounded ${colorClass[t]} text-white px-1.5 py-0.5 text-[11px] md:text-xs`}>
                          {t}
                          <span className="ml-1 rounded bg-black/20 px-1 tabular-nums">
                          {Math.max(0, Math.ceil((activeRef.current!.endTime - Date.now()) / 1000))}s
                        </span>
                      </span>
                    );
                  })()}
                </div>
            )}
          </div>
        </div>
      <div className="flex justify-center">
        <div className="relative">
          <canvas
              ref={canvasRef}
              className="rounded-lg shadow-lg block"
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              style={{maxWidth: "100%", height: "auto"}}
              tabIndex={0}
              aria-label="Breakout playfield"
              onMouseDown={(e) => (e.currentTarget as HTMLCanvasElement).focus()}
              onClick={() => {
                if (!gameStarted) {
                  setGameStarted(true);
                  soundManager.playMusic("background");
                } else if (isPaused) {
                  setIsPaused(false);
                } else {
                  // If sticky captured, clicking releases as well
                  stickyReleasePendingRef.current = true;
                }
              }}
          />

          {/* Tap-to-start / pause overlay for mobile-first UX */}
          {(!gameStarted || isPaused) && !gameOver && (
              <button
                  aria-label={!gameStarted ? "Tap to start" : "Tap to resume"}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-base sm:text-lg font-semibold select-none"
                  onClick={() => {
                    if (!gameStarted) {
                      setGameStarted(true);
                      soundManager.playMusic("background");
                    } else {
                      setIsPaused(false);
                    }
                  }}
              >
                {!gameStarted ? "Tap to start" : "Paused — Tap to resume"}
              </button>
          )}

          {/* Game over overlay */}
          {gameOver && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
                <div className="text-center space-y-3 p-4">
                  <div className="text-xl font-bold">Game Over</div>
                  <div className="opacity-90">Score: {score}</div>
                  <button
                      className="mt-2 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700"
                      onClick={startGame}
                  >
                    Restart
                  </button>
                </div>
              </div>
          )}
        </div>
      </div>

        {/* Centered controls below the canvas */}
        <div className="mt-3 text-center">
          {!gameStarted && !gameOver && !awaitingNext && (
              <button
                  onClick={startGame}
                  className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Start Game
          </button>
        )}
          {(gameStarted || awaitingNext) && (
              <button
                  onClick={() => {
                    if (awaitingNextRef.current) {
                      // advance to next level manually
                      const nextLevel = (levelRef.current || 1) + 1;
                      setLevel(nextLevel);
                      levelRef.current = nextLevel;
                      const newGrid = buildBricks(nextLevel, computeBrickLayout(CANVAS_WIDTH));
                      setBricks(newGrid);
                      bricksRef.current = newGrid;
                      const resetBall: Ball = {
                        x: CANVAS_WIDTH / 2,
                        y: CANVAS_HEIGHT - 30,
                        dx: BASE_BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
                        dy: -BASE_BALL_SPEED,
                        radius: BALL_RADIUS,
                      };
                      setBall(resetBall);
                      ballRef.current = resetBall;
                      const np = {
                        ...paddleRef.current,
                        x: (CANVAS_WIDTH - PADDLE_WIDTH) / 2,
                        y: CANVAS_HEIGHT - PADDLE_HEIGHT - 10,
                        width: PADDLE_WIDTH,
                        height: PADDLE_HEIGHT,
                      };
                      setPaddle(np);
                      paddleRef.current = np;
                      paddleXRef.current = np.x;
                      setShowLevelComplete(false);
                      showLevelCompleteRef.current = false;
                      setAwaitingNext(false);
                      awaitingNextRef.current = false;
                      // resume game
                      setIsPaused(false);
                    } else {
                      setIsPaused((p) => !p);
                    }
                  }}
                  className={`px-5 py-2 text-white rounded-md transition-colors ${awaitingNext ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-gray-600 hover:bg-gray-700'}`}
              >
                {awaitingNext ? "Next Level" : isPaused ? "Resume" : "Pause"}
          </button>
        )}
      </div>

        {/* Collapsible help on mobile; expanded sections on larger screens */}
      <div className="mt-6">
        {/* Mobile */}
        <details className="sm:hidden rounded-lg border border-gray-200 dark:border-gray-700">
          <summary className="cursor-pointer select-none px-4 py-2 text-base font-semibold">How to Play</summary>
          <ul className="px-4 pb-3 pt-1 text-sm text-gray-600 dark:text-gray-300 space-y-1">
            <li>• Use ← → or A/D to move the paddle</li>
            <li>• Press Space to start/pause</li>
            <li>• Break all bricks to advance</li>
          </ul>
        </details>
        {/* Desktop/tablet */}
        <div className="hidden sm:block">
          <h3 className="text-lg font-semibold mb-2">How to Play</h3>
          <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
            <li>• Use ← → or A/D to move the paddle</li>
            <li>• Press Space to start/pause</li>
            <li>• Break all bricks to advance</li>
          </ul>
        </div>
      </div>

        <div className="mt-4">
          {/* Mobile */}
          <details className="sm:hidden rounded-lg border border-gray-200 dark:border-gray-700">
            <summary className="cursor-pointer select-none px-4 py-2 text-base font-semibold">Power-Ups</summary>
            <div className="px-4 pb-3 pt-1 grid grid-cols-1 gap-3 text-sm">
              <PowerUpCardMobile title="Fast" desc="Faster ball (timed)"
                                 className="bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-100"/>
              <PowerUpCardMobile title="Slow" desc="Slower ball (timed)"
                                 className="bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-100"/>
              <PowerUpCardMobile title="Sticky" desc="Ball sticks; press ↑ or click to release"
                                 className="bg-fuchsia-100 text-fuchsia-900 dark:bg-fuchsia-900/30 dark:text-fuchsia-100"
                                 gated="auth"/>
              <PowerUpCardMobile title="Thru" desc="Ball pierces bricks"
                                 className="bg-lime-100 text-lime-900 dark:bg-lime-900/30 dark:text-lime-100"
                                 gated="sub"/>
              <PowerUpCardMobile title="Bomb" desc="AoE clears nearby bricks"
                                 className="bg-red-100 text-red-900 dark:bg-red-900/30 dark:text-red-100" gated="sub"/>
              <PowerUpCardMobile title="Fireball" desc="Bricks are one‑hit"
                                 className="bg-orange-100 text-orange-900 dark:bg-orange-900/30 dark:text-orange-100"
                                 gated="sub"/>
              <PowerUpCardMobile title="Laser" desc="Paddle shoots zaps"
                                 className="bg-cyan-100 text-cyan-900 dark:bg-cyan-900/30 dark:text-cyan-100"
                                 gated="sub"/>
              <PowerUpCardMobile title="Extra Life" desc="Gain +1 life (max 5)"
                                 className="bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-100"
                                 gated="sub"/>
            </div>
          </details>
          {/* Desktop/tablet */}
          <div className="hidden sm:block">
          <h3 className="text-lg font-semibold mb-2">Power-Ups</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-3 text-sm">
              <PowerUpCard title="Fast" desc="Faster ball (timed)"
                           className="bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-100"/>
              <PowerUpCard title="Slow" desc="Slower ball (timed)"
                           className="bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-100"/>
              <PowerUpCard title="Sticky" desc="Ball sticks; press ↑ or click to release"
                           className="bg-fuchsia-100 text-fuchsia-900 dark:bg-fuchsia-900/30 dark:text-fuchsia-100"
                           gated="auth"/>
              <PowerUpCard title="Thru" desc="Ball pierces bricks"
                           className="bg-lime-100 text-lime-900 dark:bg-lime-900/30 dark:text-lime-100" gated="sub"/>
              <PowerUpCard title="Bomb" desc="AoE clears nearby bricks"
                           className="bg-red-100 text-red-900 dark:bg-red-900/30 dark:text-red-100" gated="sub"/>
              <PowerUpCard title="Fireball" desc="Bricks are one‑hit"
                           className="bg-orange-100 text-orange-900 dark:bg-orange-900/30 dark:text-orange-100"
                           gated="sub"/>
              <PowerUpCard title="Laser" desc="Paddle shoots zaps"
                           className="bg-cyan-100 text-cyan-900 dark:bg-cyan-900/30 dark:text-cyan-100" gated="sub"/>
              <PowerUpCard title="Extra Life" desc="Gain +1 life (max 5)"
                           className="bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-100"
                           gated="sub"/>
          </div>
        </div>
        </div>
    </GameContainer>
  );
}

function PowerUpCard({title, desc, className, gated}: {
  title: string;
  desc: string;
  className: string;
  gated?: "auth" | "sub"
}) {
  const {isAuthenticated, isSubscriber} = useGameSettings();
  const locked = (gated === "auth" && !isAuthenticated) || (gated === "sub" && !isSubscriber);
  return (
      <div className={`rounded-md px-3 py-2 relative ${className}`}>
        <div className="font-semibold flex items-center gap-2">
          {title}
          {locked && <span
              className="text-[10px] px-1.5 py-0.5 rounded bg-gray-900/70 text-white">🔒 {gated === 'auth' ? 'Sign in' : 'Subscriber'}</span>}
        </div>
        <div className="opacity-80">{desc}</div>
      </div>
  );
}

function PowerUpCardMobile(props: { title: string; desc: string; className: string; gated?: "auth" | "sub" }) {
  return <PowerUpCard {...props} />;
}
