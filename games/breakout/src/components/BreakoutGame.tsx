"use client";

import React, {useCallback, useEffect, useRef, useState} from "react";
import {GameContainer, soundManager} from "@games/shared";

// Minimal, stable MVP implementation for Breakout
// Constants (logical canvas size; we apply DPR scaling in a resize handler)
const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 320;

const PADDLE_WIDTH = 75;
const PADDLE_HEIGHT = 10;
const PADDLE_SPEED = 6;

const BALL_RADIUS = 8;
const BASE_BALL_SPEED = 4;

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

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export default function BreakoutGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Paddle state + a ref to move immediately inside RAF
  const [paddle, setPaddle] = useState<Paddle>({
    x: (CANVAS_WIDTH - PADDLE_WIDTH) / 2,
    y: CANVAS_HEIGHT - PADDLE_HEIGHT - 10,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
  });
  const paddleXRef = useRef<number>(paddle.x);

  // Simple ball state
  const [ball, setBall] = useState<Ball>({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT - 30,
    dx: BASE_BALL_SPEED,
    dy: -BASE_BALL_SPEED,
    radius: BALL_RADIUS,
  });

  // Bricks grid
  const [bricks, setBricks] = useState<Brick[][]>([]);

  // Game flags
  const [gameStarted, setGameStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [level, setLevel] = useState(1);
  const [showLevelComplete, setShowLevelComplete] = useState(false);

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(3);

  // Input cache
  const keysDownRef = useRef<Set<string>>(new Set());

  // Initialize or reinitialize a level
  const initLevel = useCallback(() => {
    const newBricks: Brick[][] = [];
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
      newBricks[c] = [];
      for (let r = 0; r < BRICK_ROW_COUNT; r++) {
        const brickX = c * (BRICK_WIDTH + BRICK_PADDING) + BRICK_OFFSET_LEFT;
        const brickY = r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP;
        const colorIndex = Math.floor(Math.random() * COLORS.length);
        const points = (BRICK_ROW_COUNT - r) * 10 * level;
        newBricks[c][r] = {
          x: brickX,
          y: brickY,
          width: BRICK_WIDTH,
          height: BRICK_HEIGHT,
          color: COLORS[colorIndex],
          points,
          health: 1,
        };
      }
    }
    setBricks(newBricks);

    // Reset ball and paddle for a fresh serve
    setBall({
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT - 30,
      dx: BASE_BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
      dy: -BASE_BALL_SPEED,
      radius: BALL_RADIUS,
    });

    setPaddle((prev) => ({
      ...prev,
      x: (CANVAS_WIDTH - PADDLE_WIDTH) / 2,
      y: CANVAS_HEIGHT - PADDLE_HEIGHT - 10,
      width: PADDLE_WIDTH,
      height: PADDLE_HEIGHT,
    }));
    paddleXRef.current = (CANVAS_WIDTH - PADDLE_WIDTH) / 2;
  }, [level]);

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
    if (!canvas) return;
    const handleResize = () => {
      const container = canvas.parentElement;
      if (!container) return;
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
        if (!gameStarted) startGame();
        else setIsPaused((p) => !p);
        return;
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
      if (e.key === "ArrowLeft" || key === "a") keysDownRef.current.delete("left");
      if (e.key === "ArrowRight" || key === "d") keysDownRef.current.delete("right");
    };
    document.addEventListener("keydown", down, {capture: true});
    document.addEventListener("keyup", up, {capture: true});
    return () => {
      document.removeEventListener("keydown", down as any, {capture: true} as any);
      document.removeEventListener("keyup", up as any, {capture: true} as any);
    };
  }, [gameStarted, startGame]);

  // Pointer/touch input
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    (canvas.style as any).touchAction = "none";
    const moveTo = (clientX: number) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * CANVAS_WIDTH - paddle.width / 2;
      const clamped = clamp(x, 0, CANVAS_WIDTH - paddle.width);
      setPaddle((prev) => ({...prev, x: clamped}));
      paddleXRef.current = clamped;
    };
    const onMouseMove = (e: MouseEvent) => !isPaused && moveTo(e.clientX);
    const onTouchMove = (e: TouchEvent) => {
      if (isPaused) return;
      e.preventDefault();
      if (e.touches?.length) moveTo(e.touches[0].clientX);
    };
    canvas.addEventListener("mousemove", onMouseMove as any);
    canvas.addEventListener("touchmove", onTouchMove as any, {passive: false} as any);
    return () => {
      canvas.removeEventListener("mousemove", onMouseMove as any);
      canvas.removeEventListener("touchmove", onTouchMove as any);
    };
  }, [isPaused, paddle.width]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;

    const draw = () => {
      // background
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // update paddle first for immediate response
      const down = keysDownRef.current;
      let dx = 0;
      if (down.has("left")) dx -= PADDLE_SPEED;
      if (down.has("right")) dx += PADDLE_SPEED;
      let newPx = clamp((paddleXRef.current ?? paddle.x) + dx, 0, CANVAS_WIDTH - paddle.width);
      paddleXRef.current = newPx;
      if (newPx !== paddle.x) setPaddle((p) => ({...p, x: newPx}));

      // draw paddle
      ctx.fillStyle = "#3498db";
      ctx.fillRect(newPx, paddle.y, paddle.width, paddle.height);

      // draw ball
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = "#e74c3c";
      ctx.fill();
      ctx.closePath();

      // draw bricks
      for (const col of bricks) {
        for (const b of col) {
          if (b.health <= 0) continue;
          ctx.fillStyle = b.color;
          ctx.fillRect(b.x, b.y, b.width, b.height);
        }
      }

      // HUD (minimal)
      ctx.fillStyle = "#fff";
      ctx.font = "12px Arial";
      ctx.textAlign = "left";
      ctx.fillText(`Score: ${score}`, 8, 8);
      ctx.textAlign = "right";
      ctx.fillText(`Lives: ${lives}`, CANVAS_WIDTH - 8, 8);

      // overlays
      if (!gameStarted) {
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.font = "20px Arial";
        ctx.fillText("Press Space or Click to Start", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      } else if (isPaused) {
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.font = "20px Arial";
        ctx.fillText("Paused (Space)", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      } else if (gameOver) {
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.font = "24px Arial";
        ctx.fillText("Game Over — Press Space", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      }

      // game updates
      if (gameStarted && !isPaused && !gameOver) {
        // move ball
        let nx = ball.x + ball.dx;
        let ny = ball.y + ball.dy;
        let ndx = ball.dx;
        let ndy = ball.dy;

        // walls
        if (nx + ball.radius > CANVAS_WIDTH || nx - ball.radius < 0) {
          ndx = -ndx;
          soundManager.playSound("wall");
        }
        if (ny - ball.radius < 0) {
          ndy = -ndy;
          soundManager.playSound("wall");
        }

        // paddle
        if (
            ny + ball.radius > paddle.y &&
            ny - ball.radius < paddle.y + paddle.height &&
            nx + ball.radius > newPx &&
            nx - ball.radius < newPx + paddle.width
        ) {
          const hit = (nx - newPx) / paddle.width;
          const angle = (hit * Math.PI) / 3; // 0..60°
          const speed = Math.sqrt(ndx * ndx + ndy * ndy) || BASE_BALL_SPEED;
          ndx = speed * Math.sin(angle) * (hit < 0.5 ? -1 : 1);
          ndy = -speed * Math.cos(angle);
          soundManager.playSound("paddle");
        }

        // bottom
        if (ny + ball.radius > CANVAS_HEIGHT) {
          soundManager.playSound("loseLife");
          if (lives <= 1) {
            setGameOver(true);
            soundManager.playSound("gameOver");
            soundManager.stopMusic();
          } else {
            setLives((l) => l - 1);
            setGameStarted(false);
            nx = CANVAS_WIDTH / 2;
            ny = CANVAS_HEIGHT - 30;
            ndx = BASE_BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
            ndy = -BASE_BALL_SPEED;
          }
        }

        // brick collisions (defensive against uninitialized/partial grids)
        const nextBricks = bricks.map((col) => col.map((b) => ({...b})));
        let hit = false;
        outer: for (let c = 0; c < nextBricks.length; c++) {
          const col = nextBricks[c];
          if (!col) continue;
          for (let r = 0; r < col.length; r++) {
            const b = col[r];
            if (!b || b.health <= 0) continue;
            if (
                nx + ball.radius > b.x &&
                nx - ball.radius < b.x + b.width &&
                ny + ball.radius > b.y &&
                ny - ball.radius < b.y + b.height
            ) {
              // choose axis by smaller overlap
              const overlapX = Math.min(Math.abs(nx - (b.x + b.width)), Math.abs(nx - b.x));
              const overlapY = Math.min(Math.abs(ny - (b.y + b.height)), Math.abs(ny - b.y));
              if (overlapX < overlapY) ndx = -ndx; else ndy = -ndy;
              b.health -= 1;
              setScore((s) => s + b.points);
              soundManager.playSound("brickHit");
              hit = true;
              break outer;
            }
          }
        }
        if (hit) setBricks(nextBricks);

        setBall({x: nx, y: ny, dx: ndx, dy: ndy, radius: ball.radius});

        // check level complete (robust against missing rows)
        const remaining = nextBricks.reduce((acc, col) => acc + (col?.filter((b) => b && b.health > 0).length || 0), 0);
        if (nextBricks.length && remaining === 0) {
          setShowLevelComplete(true);
          soundManager.playSound("levelComplete");
          setTimeout(() => {
            setShowLevelComplete(false);
            setLevel((lv) => lv + 1);
            initLevel();
          }, 1200);
        }
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [ball, bricks, gameOver, gameStarted, initLevel, isPaused, lives, paddle.height, paddle.width, paddle.y, score, showLevelComplete]);

  // High score
  useEffect(() => {
    if (score > highScore) setHighScore(score);
  }, [score, highScore]);

  // Dispatch gameover event for leaderboard submission listeners
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!gameOver) return;
    const detail = {score} as { score: number };
    try {
      window.dispatchEvent(new CustomEvent("breakout:gameover", {detail}));
      window.dispatchEvent(new CustomEvent("game:gameover", {detail}));
    } catch {
      // no-op
    }
  }, [gameOver, score]);

  return (
      <GameContainer title="Breakout" description="Break all the bricks with the ball and don't let it fall!">
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
            <button onClick={startGame}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Start Game
          </button>
        )}
        {gameStarted && (
            <button onClick={() => setIsPaused((p) => !p)}
                    className="ml-4 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
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
    </GameContainer>
  );
}
