"use client";

import {GameContainer, soundManager} from "@games/shared";
import React, {useCallback, useEffect, useRef, useState} from "react";

// Minimal, stable MVP implementation for Breakout
// Constants (logical canvas size; we apply DPR scaling in a resize handler)
// Increased canvas size to improve play area and match earlier screenshots
const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 420;

const PADDLE_WIDTH = 75;
const PADDLE_HEIGHT = 10;
const PADDLE_SPEED = 6;

const BALL_RADIUS = 8;
const BASE_BALL_SPEED = 4;
const MIN_BALL_SPEED = 3.2;
const MAX_BALL_SPEED = 6.2;

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
const BRICK_COLUMN_COUNT = 7;
const BRICK_WIDTH = 55;
const BRICK_HEIGHT = 18;
const BRICK_PADDING = 8;
const BRICK_OFFSET_TOP = 40;
const BRICK_OFFSET_LEFT = 30;

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

// Top-level brick factory (pure) to avoid effect dependencies in the game loop
function buildBricks(lvl: number): Brick[][] {
  const newBricks: Brick[][] = [];
  for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
    newBricks[c] = [] as Brick[];
    for (let r = 0; r < BRICK_ROW_COUNT; r++) {
      const brickX = c * (BRICK_WIDTH + BRICK_PADDING) + BRICK_OFFSET_LEFT;
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
        width: BRICK_WIDTH,
        height: BRICK_HEIGHT,
        color: isTough ? "#ea580c" : COLORS[colorIndex],
        points,
        health,
      } as Brick;
    }
  }
  return newBricks;
}

// Power-ups (Phase 1+: timed Slow/Fast + Sticky)
type PowerUpType = "slow" | "fast" | "sticky";
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
const POWERUP_DURATION_MS = 7000; // 7s timed effect
const FAST_FACTOR = 1.25;
const SLOW_FACTOR_DESKTOP = 0.75;
const SLOW_FACTOR_MOBILE = 0.82; // less harsh slow on mobile for better feel

function pickWeightedPowerUp(current: ActiveModifier): PowerUpType {
  // Slow is rarer and skipped if already active
  const allowSlow = !(current && current.type === "slow");
  const allowSticky = !(current && current.type === "sticky");
  const weights: Array<{ t: PowerUpType; w: number }> = [
    {t: "fast", w: 0.6},
    {t: "slow", w: allowSlow ? 0.25 : 0},
    {t: "sticky", w: allowSticky ? 0.15 : 0},
  ];
  const sum = weights.reduce((a, b) => a + b.w, 0) || 1;
  let r = Math.random() * sum;
  for (const item of weights) {
    if (r < item.w) {
      return item.t;
    }
    r -= item.w;
  }
  return "fast";
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
  return clamp(base * factor, MIN_BALL_SPEED, MAX_BALL_SPEED);
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
  const gameStartedRef = useRef<boolean>(false);
  const isPausedRef = useRef<boolean>(false);
  const gameOverRef = useRef<boolean>(false);
  const levelRef = useRef<number>(1);
  const showLevelCompleteRef = useRef<boolean>(false);

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
  // Sticky capture state
  const stickyStateRef = useRef<{ captured: boolean; offset: number; capturedAt: number } | null>(null);
  const stickyReleasePendingRef = useRef<boolean>(false);

  // Input cache
  const keysDownRef = useRef<Set<string>>(new Set());

  // Brick factory moved to top-level helper to avoid effect deps; see below usage

  // Initialize or reinitialize a level
  const initLevel = useCallback(() => {
    const newBricks = buildBricks(levelRef.current || 1);
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
  }, [gameStarted, startGame]);

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
      setPaddle((prev) => ({...prev, x: clamped}));
      paddleXRef.current = clamped;
    };
    const onMouseMove = (e: MouseEvent) => !isPaused && moveTo(e.clientX);
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
    return () => {
      canvas.removeEventListener("mousemove", onMouseMove as any);
      canvas.removeEventListener("touchmove", onTouchMove as any);
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

      // background (theme-aware: light canvas on dark theme, dark canvas on light theme)
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");
      ctx.fillStyle = isDark ? "#ffffff" : "#0f172a";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

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
      // Expose paddleX for E2E via data attribute
      if (canvasRef.current) {
        (canvasRef.current as HTMLCanvasElement).dataset.px = String(
            Math.round(newPx),
        );
      }

      // draw ball
      ctx.beginPath();
      ctx.arc(stateBall.x, stateBall.y, stateBall.radius, 0, Math.PI * 2);
      ctx.fillStyle = isDark ? "#e11d48" : "#e74c3c";
      ctx.fill();
      ctx.closePath();

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

      // draw falling power-ups
      if (stateFalling.length) {
        for (const p of stateFalling) {
          ctx.beginPath();
          ctx.fillStyle = p.type === "fast" ? "#22c55e" : "#f59e0b"; // green fast, amber slow
          ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.closePath();
          // icon letter
          ctx.fillStyle = "#0f172a";
          ctx.font = "10px Arial";
          ctx.textAlign = "center";
          const letter = p.type === "fast" ? "F" : p.type === "slow" ? "S" : "G";
          ctx.fillText(letter, p.x, p.y + 3);
        }
      }

      // HUD (minimal)
      ctx.fillStyle = isDark ? "#111827" : "#fff";
      ctx.font = "12px Arial";
      ctx.textAlign = "left";
      ctx.fillText(`Score: ${scoreRef.current}`, 8, 8);
      ctx.textAlign = "right";
      ctx.fillText(`Lives: ${stateLives}`, CANVAS_WIDTH - 8, 8);

      // HUD: active modifier timer center-top
      if (stateActive) {
        const now = Date.now();
        const remaining = Math.max(0, stateActive.endTime - now);
        const secs = Math.ceil(remaining / 1000);
        const label = stateActive.type === "fast" ? "FAST" : stateActive.type === "slow" ? "SLOW" : "STICKY";
        ctx.textAlign = "center";
        ctx.fillStyle =
            stateActive.type === "fast"
                ? "#22c55e"
                : stateActive.type === "slow"
                    ? "#f59e0b"
                    : "#8b5cf6";
        ctx.fillText(`${label} ${secs}s`, CANVAS_WIDTH / 2, 8);
      }

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
          if (stickyReleasePendingRef.current || now - sticky.capturedAt > 1500) {
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
              if (overlapX < overlapY) {
                ndx = -ndx;
              } else {
                ndy = -ndy;
              }
              b.health -= 1;
              setScore((s) => s + b.points);
              scoreRef.current = (scoreRef.current || 0) + b.points;
              // Sound feedback: hit vs break
              if (b.health <= 0) {
                soundManager.playSound("brickBreak");
              } else {
                soundManager.playSound("brickHit");
              }
              // maybe drop a power-up
              if (b.health <= 0) {
                const chance = isCoarseRef.current ? 0.08 : POWERUP_DROP_CHANCE;
                const shouldDrop = Math.random() < chance;
                if (shouldDrop) {
                  setFallingPowerUps((prev) => {
                    if (prev.length >= POWERUP_MAX_FALLING) {
                      return prev;
                    }
                    const type = pickWeightedPowerUp(activeRef.current);
                    const next = [
                      ...prev,
                      {
                        x: b.x + b.width / 2,
                        y: b.y + b.height / 2,
                        dy: 1.6,
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

        // check level complete (robust against missing rows)
        const remaining = nextBricks.reduce(
            (acc, col) =>
                acc + (col?.filter((b) => b && b.health > 0).length || 0),
            0,
        );
        if (nextBricks.length && remaining === 0) {
          setShowLevelComplete(true);
          showLevelCompleteRef.current = true;
          soundManager.playSound("levelComplete");
          setTimeout(() => {
            setShowLevelComplete(false);
            showLevelCompleteRef.current = false;
            const nextLevel = (levelRef.current || 1) + 1;
            setLevel(nextLevel);
            levelRef.current = nextLevel;
            // Rebuild bricks for the next level and reset ball/paddle
            const newGrid = buildBricks(nextLevel);
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
          }, 1200);
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
              const next: ActiveModifier = {
                type: p.type,
                endTime: now + POWERUP_DURATION_MS,
              };
              setActiveModifier(next);
              activeRef.current = next;
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
          setActiveModifier(null);
          activeRef.current = null;
          stickyStateRef.current = {captured: false, offset: 0, capturedAt: 0};
        }
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  // High score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
    }
  }, [score, highScore]);

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
  }, [gameOver, score]);

  return (
      <GameContainer
          title="Breakout"
          description="Break all the bricks with the ball and don't let it fall!"
      >
      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          className="rounded-lg shadow-lg"
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          style={{ maxWidth: "100%", height: "auto" }}
          tabIndex={0}
          onMouseDown={(e) => (e.currentTarget as HTMLCanvasElement).focus()}
          onClick={() => {
            if (!gameStarted) {
              setGameStarted(true);
              soundManager.playMusic("background");
            } else {
              // If sticky captured, clicking releases as well
              stickyReleasePendingRef.current = true;
            }
          }}
        />
      </div>

      <div className="mt-4 text-center">
        <div className="flex justify-center gap-4 mb-4">
          <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg">
            <div className="text-sm text-gray-500">Score</div>
            <div className="text-xl font-bold">{score}</div>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg">
            <div className="text-sm text-gray-500">High Score</div>
            <div className="text-xl font-bold">{highScore}</div>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg">
            <div className="text-sm text-gray-500">Lives</div>
            <div className="text-xl font-bold">{"❤️".repeat(lives)}</div>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg">
            <div className="text-sm text-gray-500">Level</div>
            <div className="text-xl font-bold">{level}</div>
          </div>
        </div>

        {!gameStarted && !gameOver && (
            <button
                onClick={startGame}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Game
          </button>
        )}
        {gameStarted && (
            <button
                onClick={() => setIsPaused((p) => !p)}
                className="ml-4 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
            {isPaused ? "Resume" : "Pause"}
          </button>
        )}
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">How to Play</h3>
        <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
          <li>• Use ← → or A/D to move the paddle</li>
          <li>• Press Space to start/pause</li>
          <li>• Break all bricks to advance</li>
        </ul>
      </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Power-Ups</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-sm">
            <div className="rounded-md px-3 py-2 bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-100">
              <div className="font-semibold">Expand</div>
              <div className="opacity-80">Wider paddle</div>
            </div>
            <div className="rounded-md px-3 py-2 bg-rose-100 text-rose-900 dark:bg-rose-900/30 dark:text-rose-100">
              <div className="font-semibold">Shrink</div>
              <div className="opacity-80">Smaller paddle</div>
            </div>
            <div className="rounded-md px-3 py-2 bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-100">
              <div className="font-semibold">Slow</div>
              <div className="opacity-80">Slower ball (timed)</div>
            </div>
            <div
                className="rounded-md px-3 py-2 bg-violet-100 text-violet-900 dark:bg-violet-900/30 dark:text-violet-100">
              <div className="font-semibold">Multiball</div>
              <div className="opacity-80">Extra balls</div>
            </div>
            <div
                className="rounded-md px-3 py-2 bg-fuchsia-100 text-fuchsia-900 dark:bg-fuchsia-900/30 dark:text-fuchsia-100">
              <div className="font-semibold">Sticky</div>
              <div className="opacity-80">Ball sticks; press ↑ or click to release</div>
            </div>
          </div>
        </div>
    </GameContainer>
  );
}
