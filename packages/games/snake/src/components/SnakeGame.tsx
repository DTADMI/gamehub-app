"use client";

// games/snake/src/components/SnakeGame.tsx
import {GameContainer, soundManager} from "@games/shared";
import React, {useCallback, useEffect, useRef, useState} from "react";

import {submitScore} from "@/lib/graphql/queries";

import {
    CELL_SIZE,
    Direction,
    GAME_SPEED,
    GameConfig,
    GameMode,
    GRID_SIZE,
    Obstacle,
    Portal,
    Position,
} from "../types/game";

type ControlScheme = "swipe" | "joystick" | "taps";
// Tunables for mobile control feel
const JOYSTICK_DEADZONE_PX = 14; // px radius with no direction change (slightly higher for small screens)
const SWIPE_THRESHOLD_MIN = 24; // minimum swipe distance in px
const SWIPE_THRESHOLD_MAX = 64; // cap threshold for larger cells

export const SnakeGame: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [gameOver, setGameOver] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [_leaderboard, setLeaderboard] = useState<number[]>([]);
    const [gameStarted, setGameStarted] = useState(false);
    const [pendingMode, setPendingMode] = useState<GameMode | null>(null);
    const [config, setConfig] = useState<GameConfig>({
        mode: "classic",
        speed: GAME_SPEED,
        hasObstacles: false,
        hasPortals: false,
        gridSize: GRID_SIZE,
    });

    const [snake, setSnake] = useState<Position[]>([]);
    const [food, setFood] = useState<Position>({x: 0, y: 0});
    const [direction, setDirection] = useState<Direction>("RIGHT");
    const [nextDirection, setNextDirection] = useState<Direction>("RIGHT");
    const [obstacles, setObstacles] = useState<Obstacle[]>([]);
    const [portals, setPortals] = useState<Portal[]>([]);
    const [gameLoop, setGameLoop] = useState<NodeJS.Timeout | null>(null);
    const [controlScheme, setControlScheme] = useState<ControlScheme>(() => {
        if (typeof window === "undefined") {
            return "swipe";
        }
        try {
            const saved = localStorage.getItem("snakeControlScheme");
            return saved === "joystick" || saved === "swipe" || saved === "taps"
                ? (saved as ControlScheme)
                : "swipe";
        } catch {
            return "swipe";
        }
    });
    useEffect(() => {
        try {
            localStorage.setItem("snakeControlScheme", controlScheme);
        } catch {
        }
    }, [controlScheme]);

    // Load persisted scores on mount
    useEffect(() => {
        try {
            const savedHigh = parseInt(
                localStorage.getItem("snakeHighScore") || "0",
                10,
            );
            if (!isNaN(savedHigh)) {
                setHighScore(savedHigh);
            }
            const savedBoard = JSON.parse(
                localStorage.getItem("snakeLeaderboard") || "[]",
            );
            if (Array.isArray(savedBoard)) {
                setLeaderboard(savedBoard);
            }
        } catch {
        }
    }, []);

    // Generate random position
    const getRandomPosition = useCallback(
        (exclude: Position[] = []): Position => {
            let position: Position;
            do {
                position = {
                    x: Math.floor(Math.random() * config.gridSize),
                    y: Math.floor(Math.random() * config.gridSize),
                };
            } while (
                exclude.some((pos) => pos.x === position.x && pos.y === position.y)
                );
            return position;
        },
        [config.gridSize],
    );

    // Generate food at random position
    const generateFood = useCallback(
        (exclude: Position[]): Position => {
            return getRandomPosition(exclude);
        },
        [getRandomPosition],
    );

    // Generate obstacles
    const generateObstacles = useCallback(
        (exclude: Position[]): Obstacle[] => {
            const obstacles: Obstacle[] = [];
            const obstacleCount = Math.floor(config.gridSize * config.gridSize * 0.1); // 10% of grid

            for (let i = 0; i < obstacleCount; i++) {
                obstacles.push(getRandomPosition([...exclude, ...obstacles]));
            }

            return obstacles;
        },
        [config.gridSize, getRandomPosition],
    );

    // Generate portal pairs
    const generatePortals = useCallback((): Portal[] => {
        const portalCount = 2; // Number of portal pairs
        const portals: Portal[] = [];
        const usedPositions: Position[] = [];

        for (let i = 0; i < portalCount; i++) {
            const entry = getRandomPosition(usedPositions);
            usedPositions.push(entry);

            const exit = getRandomPosition([...usedPositions]);
            usedPositions.push(exit);

            portals.push({entry, exit});
        }

        return portals;
    }, [getRandomPosition]);

    // Initialize game
    const initGame = useCallback(
        (nextCfg?: GameConfig) => {
            // Use provided config or fall back to current state
            const currentConfig = nextCfg || config;

            // Set up initial snake
            const initialSnake = [
                {x: 5, y: 10},
                {x: 4, y: 10},
                {x: 3, y: 10},
            ];

            setSnake(initialSnake);
            setDirection("RIGHT");
            setNextDirection("RIGHT");
            setScore(0);
            setGameOver(false);
            setFood(generateFood(initialSnake));

            if (currentConfig.hasObstacles) {
                setObstacles(generateObstacles(initialSnake));
            } else {
                setObstacles([]);
            }

            if (currentConfig.hasPortals) {
                setPortals(generatePortals());
            } else {
                setPortals([]);
            }

            soundManager.playMusic("background");

            return initialSnake;
        },
        [config, generateFood, generateObstacles, generatePortals],
    );

    // Restart helper that applies a provided configuration immediately
    const restartWithConfig = useCallback(
        (nextCfg: GameConfig) => {
            setConfig(nextCfg);
            initGame(nextCfg);
        },
        [initGame],
    );

    // Check collision
    const checkCollision = (position: Position, checkWalls = true): boolean => {
        // Check walls
        if (
            checkWalls &&
            (position.x < 0 ||
                position.x >= config.gridSize ||
                position.y < 0 ||
                position.y >= config.gridSize)
        ) {
            return true;
        }

        // Check self collision
        if (
            snake.some(
                (segment, index) =>
                    index > 0 && segment.x === position.x && segment.y === position.y,
            )
        ) {
            return true;
        }

        // Check obstacle collision
        if (
            config.hasObstacles &&
            obstacles.some((obs) => obs.x === position.x && obs.y === position.y)
        ) {
            return true;
        }

        return false;
    };

    // Handle keyboard input
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            // If game over: Space should restart a fresh game
            if (gameOver) {
                if (e.code === "Space") {
                    setIsPaused(false);
                    setGameStarted(true);
                    restartWithConfig(config);
                }
                return;
            }

            if (!gameStarted) {
                if (e.code === "Space") {
                    setGameStarted(true);
                    initGame();
                }
                return;
            }

            if (e.code === "Space") {
                setIsPaused((prev) => !prev);
                return;
            }

            switch (e.key) {
                case "ArrowUp":
                    if (direction !== "DOWN") {
                        setNextDirection("UP");
                    }
                    break;
                case "ArrowDown":
                    if (direction !== "UP") {
                        setNextDirection("DOWN");
                    }
                    break;
                case "ArrowLeft":
                    if (direction !== "RIGHT") {
                        setNextDirection("LEFT");
                    }
                    break;
                case "ArrowRight":
                    if (direction !== "LEFT") {
                        setNextDirection("RIGHT");
                    }
                    break;
            }
        },
        [direction, gameStarted, gameOver, initGame, config, restartWithConfig],
    );

    // Touch swipe controls when controlScheme === 'swipe'
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }
        if (controlScheme !== "swipe") {
            return;
        }

        let startX = 0;
        let startY = 0;
        let tracking = false;
        // Scale threshold with cell size but keep within practical bounds
        const threshold = Math.min(
            SWIPE_THRESHOLD_MAX,
            Math.max(SWIPE_THRESHOLD_MIN, Math.floor(CELL_SIZE * 0.75)),
        );

        const onTouchStart = (e: TouchEvent) => {
            if (!gameStarted || isPaused || gameOver) {
                return;
            }
            const t = e.touches[0];
            startX = t.clientX;
            startY = t.clientY;
            tracking = true;
            e.preventDefault();
        };
        const onTouchMove = (e: TouchEvent) => {
            if (!tracking) {
                return;
            }
            e.preventDefault();
        };
        const commitDirection = (dx: number, dy: number) => {
            const ax = Math.abs(dx);
            const ay = Math.abs(dy);
            if (ax < threshold && ay < threshold) {
                return;
            }
            if (ax > ay) {
                if (dx < 0 && direction !== "RIGHT") {
                    setNextDirection("LEFT");
                } else if (dx > 0 && direction !== "LEFT") {
                    setNextDirection("RIGHT");
                }
            } else {
                if (dy < 0 && direction !== "DOWN") {
                    setNextDirection("UP");
                } else if (dy > 0 && direction !== "UP") {
                    setNextDirection("DOWN");
                }
            }
        };
        const onTouchEnd = (e: TouchEvent) => {
            if (!tracking) {
                return;
            }
            const t = e.changedTouches[0];
            const dx = t.clientX - startX;
            const dy = t.clientY - startY;
            commitDirection(dx, dy);
            tracking = false;
            e.preventDefault();
        };

        canvas.addEventListener("touchstart", onTouchStart, {passive: false});
        canvas.addEventListener("touchmove", onTouchMove, {passive: false});
        canvas.addEventListener("touchend", onTouchEnd, {passive: false});

        return () => {
            canvas.removeEventListener("touchstart", onTouchStart as any);
            canvas.removeEventListener("touchmove", onTouchMove as any);
            canvas.removeEventListener("touchend", onTouchEnd as any);
        };
    }, [controlScheme, direction, gameStarted, isPaused, gameOver]);

    // Taps control scheme: tapping left/right halves issues relative left/right turns
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }
        if (controlScheme !== "taps") {
            return;
        }

        const turnLeft = (dir: Direction): Direction => {
            switch (dir) {
                case "UP":
                    return "LEFT";
                case "DOWN":
                    return "RIGHT";
                case "LEFT":
                    return "DOWN";
                case "RIGHT":
                    return "UP";
            }
        };
        const turnRight = (dir: Direction): Direction => {
            switch (dir) {
                case "UP":
                    return "RIGHT";
                case "DOWN":
                    return "LEFT";
                case "LEFT":
                    return "UP";
                case "RIGHT":
                    return "DOWN";
            }
        };

        const handleTap = (clientX: number) => {
            if (!gameStarted || isPaused || gameOver) {
                return;
            }
            const rect = canvas.getBoundingClientRect();
            const isLeft = clientX < rect.left + rect.width / 2;
            const target = isLeft ? turnLeft(direction) : turnRight(direction);
            // Avoid 180° reversal guards are inherent in relative turns
            setNextDirection(target);
        };

        const onClick = (e: MouseEvent) => handleTap(e.clientX);
        const onTouchStart = (e: TouchEvent) => {
            const t = e.touches[0];
            handleTap(t.clientX);
            // Do not preventDefault so page can still scroll when not tapping canvas
        };

        canvas.addEventListener("click", onClick as any, {passive: true} as any);
        canvas.addEventListener(
            "touchstart",
            onTouchStart as any,
            {passive: true} as any,
        );
        return () => {
            canvas.removeEventListener("click", onClick as any);
            canvas.removeEventListener("touchstart", onTouchStart as any);
        };
    }, [controlScheme, direction, gameStarted, isPaused, gameOver]);

    // Game loop
    const gameLoopCallback = useCallback(() => {
        if (isPaused || !gameStarted) {
            return;
        }

        setDirection(nextDirection);

        setSnake((prevSnake) => {
            const head = {...prevSnake[0]};

            // Move head
            switch (direction) {
                case "UP":
                    head.y -= 1;
                    break;
                case "DOWN":
                    head.y += 1;
                    break;
                case "LEFT":
                    head.x -= 1;
                    break;
                case "RIGHT":
                    head.x += 1;
                    break;
            }

            // Check for portal
            if (config.hasPortals) {
                const portal = portals.find(
                    (p) => p.entry.x === head.x && p.entry.y === head.y,
                );

                if (portal) {
                    soundManager.playSound("portal");
                    head.x = portal.exit.x;
                    head.y = portal.exit.y;
                }
            }

            // Check for collision
            if (checkCollision(head)) {
                soundManager.playSound("gameOver");
                // Gentle haptics on supported devices
                try {
                    (navigator as any)?.vibrate?.(35);
                } catch {
                }
                soundManager.stopMusic();
                setGameOver(true);
                return prevSnake;
            }

            const newSnake = [head, ...prevSnake];

            // Check if food is eaten
            if (head.x === food.x && head.y === food.y) {
                soundManager.playSound("eat");
                // Gentle haptics for positive feedback
                try {
                    (navigator as any)?.vibrate?.(12);
                } catch {
                }
                setScore((prev) => {
                    const newScore = prev + 10;
                    if (newScore > highScore) {
                        setHighScore(newScore);
                    }
                    return newScore;
                });

                // Generate new food
                setFood(generateFood([...newSnake, ...obstacles]));

                // Increase speed every 50 points
                if (score > 0 && score % 50 === 0) {
                    setConfig((prev) => ({
                        ...prev,
                        speed: Math.max(50, prev.speed - 10),
                    }));
                }
            } else {
                // Remove tail if no food eaten
                newSnake.pop();
            }

            return newSnake;
        });
        // The loop uses current closures intentionally; keep deps minimal to avoid jitter
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        direction,
        nextDirection,
        isPaused,
        gameStarted,
        food,
        obstacles,
        portals,
        score,
        highScore,
    ]);

    // Set up game loop
    useEffect(() => {
        if (gameStarted && !gameOver) {
            const loop = setInterval(gameLoopCallback, config.speed);
            setGameLoop(loop);
            return () => clearInterval(loop);
        }
    }, [gameLoopCallback, gameStarted, gameOver, config.speed]);

    // Handle keyboard events
    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    // Draw game
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }

        const ctx = canvas.getContext("2d");
        if (!ctx) {
            return;
        }

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw grid
        ctx.strokeStyle = "#e5e7eb";
        for (let i = 0; i <= config.gridSize; i++) {
            // Vertical lines
            ctx.beginPath();
            ctx.moveTo(i * CELL_SIZE, 0);
            ctx.lineTo(i * CELL_SIZE, config.gridSize * CELL_SIZE);
            ctx.stroke();

            // Horizontal lines
            ctx.beginPath();
            ctx.moveTo(0, i * CELL_SIZE);
            ctx.lineTo(config.gridSize * CELL_SIZE, i * CELL_SIZE);
            ctx.stroke();
        }

        // Draw obstacles
        if (config.hasObstacles) {
            ctx.fillStyle = "#6b7280";
            obstacles.forEach((obstacle) => {
                ctx.fillRect(
                    obstacle.x * CELL_SIZE,
                    obstacle.y * CELL_SIZE,
                    CELL_SIZE,
                    CELL_SIZE,
                );
            });
        }

        // Draw portals
        if (config.hasPortals) {
            portals.forEach((portal) => {
                // Entry portal (blue)
                ctx.fillStyle = "rgba(59, 130, 246, 0.7)";
                ctx.beginPath();
                ctx.arc(
                    portal.entry.x * CELL_SIZE + CELL_SIZE / 2,
                    portal.entry.y * CELL_SIZE + CELL_SIZE / 2,
                    CELL_SIZE / 2,
                    0,
                    Math.PI * 2,
                );
                ctx.fill();

                // Exit portal (purple)
                ctx.fillStyle = "rgba(168, 85, 247, 0.7)";
                ctx.beginPath();
                ctx.arc(
                    portal.exit.x * CELL_SIZE + CELL_SIZE / 2,
                    portal.exit.y * CELL_SIZE + CELL_SIZE / 2,
                    CELL_SIZE / 2,
                    0,
                    Math.PI * 2,
                );
                ctx.fill();
            });
        }

        // Draw food
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.arc(
            food.x * CELL_SIZE + CELL_SIZE / 2,
            food.y * CELL_SIZE + CELL_SIZE / 2,
            CELL_SIZE / 2 - 2,
            0,
            Math.PI * 2,
        );
        ctx.fill();

        // Draw snake
        snake.forEach((segment, index) => {
            // Head is a different color
            if (index === 0) {
                ctx.fillStyle = "#2563eb"; // Head color
            } else {
                // Gradient from head to tail
                const gradient = ctx.createLinearGradient(
                    segment.x * CELL_SIZE,
                    segment.y * CELL_SIZE,
                    (segment.x + 1) * CELL_SIZE,
                    (segment.y + 1) * CELL_SIZE,
                );
                const alpha = 1 - (index / snake.length) * 0.8;
                gradient.addColorStop(0, `rgba(34, 197, 94, ${alpha})`);
                gradient.addColorStop(1, `rgba(22, 163, 74, ${alpha})`);
                ctx.fillStyle = gradient;
            }

            // Draw rounded rectangle for each segment
            const size = CELL_SIZE - 2;
            const x = segment.x * CELL_SIZE + 1;
            const y = segment.y * CELL_SIZE + 1;
            const radius = 3;

            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + size - radius, y);
            ctx.quadraticCurveTo(x + size, y, x + size, y + radius);
            ctx.lineTo(x + size, y + size - radius);
            ctx.quadraticCurveTo(x + size, y + size, x + size - radius, y + size);
            ctx.lineTo(x + radius, y + size);
            ctx.quadraticCurveTo(x, y + size, x, y + size - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();
            ctx.fill();
        });

        // Draw game over overlay
        if (gameOver) {
            ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = "#ffffff";
            ctx.font = "24px Arial";
            ctx.textAlign = "center";
            ctx.fillText("Game Over!", canvas.width / 2, canvas.height / 2 - 30);
            ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 10);
            ctx.font = "16px Arial";
            ctx.fillText(
                "Press Space to Restart",
                canvas.width / 2,
                canvas.height / 2 + 50,
            );
        } else if (!gameStarted) {
            ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = "#ffffff";
            ctx.font = "24px Arial";
            ctx.textAlign = "center";
            ctx.fillText("Snake Game", canvas.width / 2, canvas.height / 2 - 50);
            ctx.font = "16px Arial";
            ctx.fillText(
                "Use arrow keys to move",
                canvas.width / 2,
                canvas.height / 2 - 10,
            );
            ctx.fillText(
                "Press Space to Start",
                canvas.width / 2,
                canvas.height / 2 + 30,
            );
        } else if (isPaused) {
            ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = "#ffffff";
            ctx.font = "24px Arial";
            ctx.textAlign = "center";
            ctx.fillText("Paused", canvas.width / 2, canvas.height / 2);
            ctx.font = "16px Arial";
            ctx.fillText(
                "Press Space to Resume",
                canvas.width / 2,
                canvas.height / 2 + 30,
            );
        }
    }, [
        snake,
        food,
        gameOver,
        isPaused,
        gameStarted,
        score,
        obstacles,
        portals,
        config,
    ]);

    // DPR/responsive scaling: fit canvas to container width while keeping crisp pixels
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }
        const handleResize = () => {
            const container = canvas.parentElement as HTMLElement | null;
            if (!container) {
                return;
            }
            const logicalW = config.gridSize * CELL_SIZE;
            const logicalH = config.gridSize * CELL_SIZE;
            const containerWidth = container.clientWidth || logicalW;
            const scale = Math.min(containerWidth / logicalW, 1);
            canvas.style.width = `${logicalW * scale}px`;
            canvas.style.height = `${logicalH * scale}px`;
            const dpr = window.devicePixelRatio || 1;
            canvas.width = logicalW * dpr;
            canvas.height = logicalH * dpr;
            const ctx = canvas.getContext("2d");
            if (ctx) {
                // @ts-ignore setTransform vendor differences
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
    }, [config.gridSize]);

    // Handle game over
    useEffect(() => {
        if (gameOver) {
            soundManager.playSound("gameOver");
            soundManager.stopMusic();
            if (gameLoop) {
                clearInterval(gameLoop);
            }
            // Dispatch a public gameover event for external integrations (e.g., STOMP score submit)
            try {
                window.dispatchEvent(
                    new CustomEvent("snake:gameover", {detail: {score}}),
                );
            } catch {
            }
            // Submit score to backend (best-effort)
            (async () => {
                try {
                    if (score > 0) {
                        await submitScore({gameType: "SNAKE", score});
                    }
                } catch {
                    // ignore network/auth errors in game flow
                }
            })();
            // Update local high score and leaderboard
            try {
                // Save high score
                localStorage.setItem("snakeHighScore", String(highScore));
                // Update leaderboard with current score
                const existing = JSON.parse(
                    localStorage.getItem("snakeLeaderboard") || "[]",
                );
                const next = Array.isArray(existing) ? existing : [];
                next.push(score);
                const top = next
                    .filter((n) => typeof n === "number" && !isNaN(n))
                    .sort((a, b) => b - a)
                    .slice(0, 10);
                localStorage.setItem("snakeLeaderboard", JSON.stringify(top));
                setLeaderboard(top);
                try {
                    window.dispatchEvent(new Event("snake:leaderboardUpdated"));
                } catch {
                }
            } catch {
            }
        }
    }, [gameOver, gameLoop, highScore, score]);

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (gameLoop) {
                clearInterval(gameLoop);
            }
            soundManager.stopMusic();
        };
    }, [gameLoop]);

    // Handle difficulty changes via a custom DOM event dispatched by the page wrapper UI
    useEffect(() => {
        const handler = (e: Event) => {
            const detail = (e as CustomEvent).detail as
                | { difficulty?: "easy" | "normal" | "hard" }
                | undefined;
            const difficulty = detail?.difficulty ?? "normal";
            // Map difficulty to speed and grid size
            const baseSpeed = GAME_SPEED; // lower is faster
            const baseGrid = GRID_SIZE;
            let nextSpeed = baseSpeed;
            let nextGrid = baseGrid;
            switch (difficulty) {
                case "easy":
                    nextSpeed = Math.min(300, baseSpeed + 50);
                    nextGrid = Math.max(12, baseGrid - 4);
                    break;
                case "hard":
                    nextSpeed = Math.max(60, baseSpeed - 50);
                    nextGrid = Math.min(32, baseGrid + 4);
                    break;
                default:
                    nextSpeed = baseSpeed;
                    nextGrid = baseGrid;
            }
            setConfig((prev) => ({...prev, speed: nextSpeed, gridSize: nextGrid}));
            try {
                localStorage.setItem("snakeDifficulty", difficulty);
            } catch {
            }
        };

        window.addEventListener("snake:setDifficulty", handler as EventListener);

        // Apply saved or default difficulty on mount
        try {
            const saved =
                (localStorage.getItem("snakeDifficulty") as
                    | "easy"
                    | "normal"
                    | "hard"
                    | null) || "normal";
            window.dispatchEvent(
                new CustomEvent("snake:setDifficulty", {
                    detail: {difficulty: saved},
                }),
            );
        } catch {
            window.dispatchEvent(
                new CustomEvent("snake:setDifficulty", {
                    detail: {difficulty: "normal"},
                }),
            );
        }

        return () => {
            window.removeEventListener(
                "snake:setDifficulty",
                handler as EventListener,
            );
        };
    }, []);

    // Support external HUD controls (restart/pause) via custom events
    useEffect(() => {
        const onRestartAction = () => {
            restartWithConfig(config);
        };
        const onPauseToggleAction = () => {
            setIsPaused((p) => !p);
        };
        window.addEventListener("snake:restart", onRestartAction as EventListener);
        window.addEventListener(
            "snake:pauseToggle",
            onPauseToggleAction as EventListener,
        );
        return () => {
            window.removeEventListener(
                "snake:restart",
                onRestartAction as EventListener,
            );
            window.removeEventListener(
                "snake:pauseToggle",
                onPauseToggleAction as EventListener,
            );
        };
    }, [config, restartWithConfig]);

    // Handle game mode changes
    const buildConfigForMode = (base: GameConfig, mode: GameMode): GameConfig => {
        const next: GameConfig = {...base, mode};
        switch (mode) {
            case "obstacles":
                next.hasObstacles = true;
                next.hasPortals = false;
                next.speed = GAME_SPEED;
                break;
            case "portal":
                next.hasPortals = true;
                next.hasObstacles = false;
                next.speed = GAME_SPEED;
                break;
            case "speed":
                next.speed = Math.max(60, GAME_SPEED / 2);
                next.hasObstacles = false;
                next.hasPortals = false;
                break;
            default:
                next.hasObstacles = false;
                next.hasPortals = false;
                next.speed = GAME_SPEED;
        }
        return next;
    };

    const handleModeChange = (mode: GameMode) => {
        if (gameStarted && !gameOver) {
            setIsPaused(true);
            setPendingMode(mode);
            return;
        }
        const nextCfg = buildConfigForMode(config, mode);
        restartWithConfig(nextCfg);
    };

    return (
        <GameContainer
            title="Snake Game"
            description={`Eat the food to grow. Avoid walls and yourself! Score: ${score} | High Score: ${highScore}`}
            showParticleControls={false}
        >
            <div className="p-4">
                {/* Dev-only utilities and explicit Start New Game are intentionally reserved for point-and-click games.
            Snake already exposes restart via overlay/UI. */}
                {/* Mobile control mode selector: Swipe vs Joystick vs Taps */}
                <div className="mb-3 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Mobile Controls:
          </span>
                    <div className="inline-flex rounded-md overflow-hidden border border-gray-300 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={() => setControlScheme("swipe")}
                            className={`px-4 py-2 text-sm min-h-11 ${controlScheme === "swipe" ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"}`}
                        >
                            Swipe
                        </button>
                        <button
                            type="button"
                            onClick={() => setControlScheme("joystick")}
                            className={`px-4 py-2 text-sm min-h-11 border-l border-gray-300 dark:border-gray-700 ${controlScheme === "joystick" ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"}`}
                        >
                            Joystick
                        </button>
                        <button
                            type="button"
                            onClick={() => setControlScheme("taps")}
                            className={`px-4 py-2 text-sm min-h-11 border-l border-gray-300 dark:border-gray-700 ${controlScheme === "taps" ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"}`}
                        >
                            Taps
                        </button>
                    </div>
                </div>
                {/* Game Mode Selector */}
                <div className="mb-4 flex flex-wrap justify-center gap-2">
                    {(["classic", "obstacles", "portal", "speed"] as GameMode[]).map(
                        (mode) => (
                            <button
                                key={mode}
                                onClick={() => handleModeChange(mode)}
                                className={`px-4 py-2 rounded-md min-h-11 ${
                                    config.mode === mode
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                                }`}
                            >
                                {mode.charAt(0).toUpperCase() + mode.slice(1)}
                            </button>
                        ),
                    )}
                </div>

                {/* Inline confirm for mode change */}
                {pendingMode && (
                    <div className="mx-auto mb-4 max-w-md rounded-md border bg-card text-card-foreground p-3 shadow-sm">
                        <p className="text-sm mb-2">
                            Restart the game in <b>{pendingMode}</b> mode? Current progress
                            will be lost.
                        </p>
                        <div className="flex gap-2 justify-end">
                            <button
                                className="px-4 py-2 text-sm rounded-md min-h-11 bg-secondary text-secondary-foreground hover:bg-secondary/80"
                                onClick={() => {
                                    setPendingMode(null);
                                    setIsPaused(false);
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 text-sm rounded-md min-h-11 bg-primary text-primary-foreground hover:bg-primary/90"
                                onClick={() => {
                                    const nextCfg = buildConfigForMode(config, pendingMode);
                                    setPendingMode(null);
                                    restartWithConfig(nextCfg);
                                }}
                            >
                                Restart
                            </button>
                        </div>
                    </div>
                )}

                {/* Game Canvas */}
                <div className="flex justify-center">
                    <canvas
                        ref={canvasRef}
                        width={config.gridSize * CELL_SIZE}
                        height={config.gridSize * CELL_SIZE}
                        data-testid="snake-canvas"
                        className="bg-white rounded-lg shadow-md block"
                        aria-label="Snake playfield"
                        tabIndex={0}
                        onClick={() => {
                            if (!gameStarted) {
                                setGameStarted(true);
                            } else if (isPaused) {
                                setIsPaused(false);
                            }
                        }}
                    />
                </div>

                {/* Tap-to-start / pause overlay for mobile-first UX */}
                {(!gameStarted || isPaused) && !gameOver && (
                    <button
                        aria-label={!gameStarted ? "Tap to start" : "Tap to resume"}
                        className="mt-3 w-full max-w-xl mx-auto flex items-center justify-center bg-black/40 text-white text-base sm:text-lg font-semibold select-none rounded-md h-16"
                        onClick={() => {
                            if (!gameStarted) {
                                setGameStarted(true);
                            } else {
                                setIsPaused(false);
                            }
                        }}
                    >
                        {!gameStarted ? "Tap to start" : "Paused — Tap to resume"}
                    </button>
                )}

                {/* Virtual joystick for mobile when selected (optional; doesn't block page scroll) */}
                {controlScheme === "joystick" && (
                    <div className="mt-4 flex justify-center">
                        <VirtualJoystick
                            onDirection={(dir) => {
                                // Map to cardinal and avoid 180° reversals
                                switch (dir) {
                                    case "UP":
                                        if (direction !== "DOWN") {
                                            setNextDirection("UP");
                                        }
                                        break;
                                    case "DOWN":
                                        if (direction !== "UP") {
                                            setNextDirection("DOWN");
                                        }
                                        break;
                                    case "LEFT":
                                        if (direction !== "RIGHT") {
                                            setNextDirection("LEFT");
                                        }
                                        break;
                                    case "RIGHT":
                                        if (direction !== "LEFT") {
                                            setNextDirection("RIGHT");
                                        }
                                        break;
                                }
                            }}
                        />
                    </div>
                )}

                {/* Controls Info */}
                <div className="mt-4 text-center text-base sm:text-sm text-gray-600 dark:text-gray-400">
                    <p>
                        Use arrow keys to move | Space to {isPaused ? "resume" : "pause"}
                    </p>
                </div>

                {/* Game Stats */}
                <div className="mt-4 flex justify-between text-base sm:text-sm">
                    <div>
                        Score: <span className="font-bold">{score}</span>
                    </div>
                    <div>
                        High Score: <span className="font-bold">{highScore}</span>
                    </div>
                    <div>
                        Speed:{" "}
                        <span className="font-bold">
              {config.mode === "speed" ? "Fast" : "Normal"}
            </span>
                    </div>
                </div>
            </div>
        </GameContainer>
    );
};

type JoystickProps = {
    onDirection: (dir: Direction) => void;
};

const VirtualJoystick: React.FC<JoystickProps> = ({onDirection}) => {
    const padRef = useRef<HTMLDivElement>(null);
    const [active, setActive] = useState(false);
    const knobRef = useRef<HTMLDivElement>(null);

    // Convert movement vector to a cardinal direction
    const vectorToDir = useCallback(
        (dx: number, dy: number): Direction | null => {
            const dead = JOYSTICK_DEADZONE_PX; // px deadzone
            const ax = Math.abs(dx);
            const ay = Math.abs(dy);
            if (ax < dead && ay < dead) {
                return null;
            }
            if (ax > ay) {
                return dx > 0 ? "RIGHT" : "LEFT";
            }
            return dy > 0 ? "DOWN" : "UP";
        },
        [],
    );

    const handleMoveFromEvent = useCallback(
        (clientX: number, clientY: number) => {
            const pad = padRef.current;
            const knob = knobRef.current;
            if (!pad || !knob) {
                return;
            }
            const rect = pad.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = clientX - cx;
            const dy = clientY - cy;
            const maxR = rect.width * 0.32; // knob travel radius
            const len = Math.hypot(dx, dy) || 1;
            const nx = (dx / len) * Math.min(maxR, len);
            const ny = (dy / len) * Math.min(maxR, len);
            knob.style.transform = `translate(${nx}px, ${ny}px)`;
            const dir = vectorToDir(dx, dy);
            if (dir) {
                onDirection(dir);
            }
        },
        [onDirection, vectorToDir],
    );

    useEffect(() => {
        const pad = padRef.current;
        if (!pad) {
            return;
        }
        const onPointerDown = (e: PointerEvent) => {
            setActive(true);
            (e.target as HTMLElement)?.setPointerCapture?.(e.pointerId);
            handleMoveFromEvent(e.clientX, e.clientY);
            e.preventDefault();
        };
        const onPointerMove = (e: PointerEvent) => {
            if (!active) {
                return;
            }
            handleMoveFromEvent(e.clientX, e.clientY);
            e.preventDefault();
        };
        const onPointerUp = (e: PointerEvent) => {
            setActive(false);
            if (knobRef.current) {
                knobRef.current.style.transform = `translate(0px, 0px)`;
            }
            e.preventDefault();
        };

        pad.addEventListener(
            "pointerdown",
            onPointerDown as any,
            {passive: false} as any,
        );
        window.addEventListener(
            "pointermove",
            onPointerMove as any,
            {passive: false} as any,
        );
        window.addEventListener(
            "pointerup",
            onPointerUp as any,
            {passive: false} as any,
        );
        return () => {
            pad.removeEventListener("pointerdown", onPointerDown as any);
            window.removeEventListener("pointermove", onPointerMove as any);
            window.removeEventListener("pointerup", onPointerUp as any);
        };
    }, [active, handleMoveFromEvent]);

    return (
        <div className="select-none">
            <div
                ref={padRef}
                aria-label="Virtual joystick"
                className="relative h-32 w-32 rounded-full bg-gray-200 dark:bg-gray-700 shadow-inner"
                style={{touchAction: "none"}}
            >
                <div
                    ref={knobRef}
                    className={`absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-md ${
                        active ? "bg-blue-500" : "bg-white dark:bg-gray-400"
                    }`}
                />
            </div>
        </div>
    );
};

export default SnakeGame;
