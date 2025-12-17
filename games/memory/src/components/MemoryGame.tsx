// games/memory/src/components/MemoryGame.tsx
import {GameContainer, soundManager} from "@games/shared";
import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";

interface Card {
  id: number;
  value: number;
  isFlipped: boolean;
  isMatched: boolean;
}

const EMOJIS = [
    "🍎",
    "🍌",
    "🍇",
    "🍉",
    "🍓",
    "🍒",
    "🍍",
    "🥝",
    "🍑",
    "🥥",
    "🍋",
    "🫐",
    "🍊",
    "🥕",
    "🌽",
    "🍆",
];
const MAX_PAIRS = 12; // supports up to hard mode
const CARD_VALUES = Array.from({length: MAX_PAIRS}, (_, i) => i + 1);

export const MemoryGame: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
    // Track cards visually hidden after match (keep layout space for continuity)
    const [hiddenIds, setHiddenIds] = useState<Set<number>>(() => new Set());
    // Throttle rapid sound effects on low-end devices
    const lastPlayRef = useRef<Record<string, number>>({});
    const playSound = useCallback((name: string, minIntervalMs = 60) => {
        try {
            const now = Date.now();
            const last = lastPlayRef.current[name] || 0;
            if (now - last < minIntervalMs) {
                return;
            }
            lastPlayRef.current[name] = now;
            soundManager.playSound(name as any);
        } catch {
            // no-op
        }
    }, []);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
      "medium",
  );
    const [autoCompleteLastPair, setAutoCompleteLastPair] =
        useState<boolean>(true);

  // Initialize game
  const initializeGame = useCallback(() => {
    // Load sounds
    soundManager.preloadSound("cardFlip", "/sounds/card-flip.mp3");
    soundManager.preloadSound("match", "/sounds/match.mp3");
    soundManager.preloadSound("win", "/sounds/win.mp3");
    soundManager.preloadSound("background", "/sounds/memory-bg.mp3", true);

    // Calculate number of pairs based on difficulty
    const pairs = difficulty === "easy" ? 6 : difficulty === "medium" ? 8 : 12;
    const values = CARD_VALUES.slice(0, pairs);
    const cardValues = [...values, ...values]; // Duplicate for pairs

    const shuffled = cardValues
      .sort(() => Math.random() - 0.5)
      .map((value, index) => ({
        id: index,
        value,
        isFlipped: false,
        isMatched: false,
      }));

    setCards(shuffled);
    setFlippedIndices([]);
    setMoves(0);
    setGameOver(false);
      setHiddenIds(new Set());
  }, [difficulty]);

    const startGame = useCallback(() => {
        setIsPaused(false);
        setGameStarted(true);
        initializeGame();
        soundManager.playMusic("background");
    }, [initializeGame]);

  // Check for matches
  useEffect(() => {
    if (flippedIndices.length === 2) {
      setIsProcessing(true);
      const [firstIndex, secondIndex] = flippedIndices;
      const firstCard = cards[firstIndex];
      const secondCard = cards[secondIndex];

      if (firstCard.value === secondCard.value) {
        // Match found
        setCards((prevCards) =>
          prevCards.map((card, idx) =>
              idx === firstIndex || idx === secondIndex
                  ? {...card, isMatched: true}
                  : card,
          ),
        );
          playSound("match", 80);
          // After a brief spin animation, visually hide matched cards but keep their grid space
          const idsToHide = [firstCard.id, secondCard.id];
          setTimeout(() => {
              setHiddenIds((prev) => {
                  const next = new Set(prev);
                  idsToHide.forEach((id) => next.add(id));
                  return next;
              });
          }, 500);
      } else {
        // No match, flip back after delay
        setTimeout(() => {
          setCards((prevCards) =>
            prevCards.map((card, idx) =>
                idx === firstIndex || idx === secondIndex
                    ? {...card, isFlipped: false}
                    : card,
            ),
          );
        }, 1000);
      }

      setMoves((prev) => prev + 1);
      setFlippedIndices([]);
      setTimeout(() => setIsProcessing(false), 1000);
    }
  }, [flippedIndices, cards, playSound]);

  // Check for game over
  useEffect(() => {
    if (cards.length > 0 && cards.every((card) => card.isMatched)) {
      setGameOver(true);
        playSound("win", 200);
      soundManager.stopMusic();
    }
  }, [cards, playSound]);

    // Auto-complete UX: when only two unmatched cards remain, auto-flip them and count as one move
    useEffect(() => {
        if (!autoCompleteLastPair || gameOver || isProcessing) {
            return;
        }
        if (cards.length === 0) {
            return;
        }
        const unmatched = cards
            .map((c, i) => (c.isMatched ? -1 : i))
            .filter((i) => i >= 0);

        if (unmatched.length === 2 && flippedIndices.length === 0) {
            // Flip both, then let the existing match effect handle marking + move increment
            setIsProcessing(true);
            playSound("cardFlip", 60);
            setCards((prev) =>
                prev.map((c, i) =>
                    i === unmatched[0] || i === unmatched[1]
                        ? {...c, isFlipped: true}
                        : c,
                ),
            );
            setTimeout(() => {
                setFlippedIndices([unmatched[0], unmatched[1]]);
                // The match effect will set isProcessing true and clear it; we can clear our guard shortly after
                setTimeout(() => setIsProcessing(false), 50);
            }, 200);
        }
    }, [
        autoCompleteLastPair,
        cards,
        flippedIndices.length,
        gameOver,
        isProcessing,
        playSound,
    ]);

  // Handle card click
  const handleCardClick = (index: number) => {
    if (
        !gameStarted ||
        isPaused ||
      isProcessing ||
      gameOver ||
      flippedIndices.includes(index) ||
      cards[index].isMatched ||
      flippedIndices.length >= 2
    ) {
      return;
    }

      playSound("cardFlip", 60);

    setCards((prev) =>
        prev.map((card, idx) =>
            idx === index ? {...card, isFlipped: true} : card,
        ),
    );

    setFlippedIndices((prev) => [...prev, index]);
  };

  // Initialize game on mount and when difficulty changes
  useEffect(() => {
    initializeGame();
    return () => {
      soundManager.stopMusic();
    };
  }, [initializeGame]);

    // Calculate score and pairs in play
  const score = cards.filter((card) => card.isMatched).length / 2;
    const pairsInPlay = useMemo(
        () =>
            cards.length / 2 ||
            (difficulty === "easy" ? 6 : difficulty === "medium" ? 8 : 12),
        [cards.length, difficulty],
    );

    const getEmojiForValue = (value: number) =>
        EMOJIS[(value - 1) % EMOJIS.length];

  return (
    <GameContainer
      title="Memory Card Game"
      description={`Match all the pairs in as few moves as possible! Matches: ${score} / ${pairsInPlay}`}
      lockTouch={false}
      backgroundImage="/images/bg-pastel-pattern.jpg"
      showParticleControls={false}
    >
      <div className="p-4">
          {/* Controls */}
          <div className="mb-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
              <div>
                  <label className="mr-2 text-gray-700 dark:text-gray-300">
                      Difficulty:
                  </label>
                  <select
                      value={difficulty}
                      onChange={(e) =>
                setDifficulty(e.target.value as "easy" | "medium" | "hard")
                      }
                      className="px-3 py-1 border rounded-md"
                      disabled={moves > 0 && gameStarted && !gameOver}
                  >
                      <option value="easy">Easy (6 pairs)</option>
                      <option value="medium">Medium (8 pairs)</option>
                      <option value="hard">Hard (12 pairs)</option>
                  </select>
              </div>
              <label className="inline-flex items-center gap-2 select-none">
                  <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={autoCompleteLastPair}
                      onChange={(e) => setAutoCompleteLastPair(e.target.checked)}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
              Auto-complete last pair (counts 1 move)
            </span>
              </label>
              {/* Start / Pause controls */}
              <div className="flex items-center gap-2">
                  {!gameStarted || gameOver ? (
                      <button
                          onClick={startGame}
                          className="px-4 py-2 rounded-md min-h-11 bg-blue-600 text-white hover:bg-blue-700"
                      >
                          {gameOver ? "Play Again" : "Start"}
                      </button>
                  ) : (
                      <button
                          onClick={() => {
                              setIsPaused((p) => {
                                  const next = !p;
                                  if (next) {
                                      soundManager.stopMusic();
                                  } else {
                                      soundManager.playMusic("background");
                                  }
                                  return next;
                              });
                          }}
                          className="px-4 py-2 rounded-md min-h-11 bg-gray-600 text-white hover:bg-gray-700"
                      >
                          {isPaused ? "Resume" : "Pause"}
                      </button>
                  )}
              </div>
        </div>

        {/* Game Board */}
        <div
            className={`relative grid gap-4 sm:gap-5 ${
            difficulty === "easy"
              ? "grid-cols-3"
              : difficulty === "medium"
                ? "grid-cols-4"
                : "grid-cols-6"
          }`}
        >
            {/* Tap-to-start / pause overlay for mobile */}
            {(!gameStarted || isPaused) && !gameOver && (
                <button
                    aria-label={!gameStarted ? "Tap to start" : "Tap to resume"}
                    className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 text-white text-base sm:text-lg font-semibold select-none rounded-xl"
                    onClick={() => {
                        if (!gameStarted) {
                            startGame();
                        } else {
                            setIsPaused(false);
                            soundManager.playMusic("background");
                        }
                    }}
                >
                    {!gameStarted ? "Tap to start" : "Paused — Tap to resume"}
                </button>
            )}
          {cards.map((card, index) => (
            <div
              key={card.id}
              onClick={() => handleCardClick(index)}
              className={`
                aspect-square rounded-xl cursor-pointer transition-transform duration-200
                [transform-style:preserve-3d] relative shadow-md hover:shadow-lg
                ${card.isMatched ? "animate-spin transition-opacity duration-500" : ""}
                ${hiddenIds.has(card.id) ? "opacity-0 pointer-events-none" : ""}
              `}
              style={{
                  transform:
                      card.isFlipped || card.isMatched
                          ? "rotateY(180deg)"
                          : "rotateY(0)",
                  // Shorten spin duration
                  animationDuration: card.isMatched ? "500ms" : undefined,
              }}
              aria-hidden={card.isMatched || undefined}
            >
                {/* Back */}
                <div
                    className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-semibold [backface-visibility:hidden]">
                    ✨
                </div>
                {/* Front */}
                <div
                    className="absolute inset-0 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center text-4xl [transform:rotateY(180deg)] [backface-visibility:hidden]">
                    <span aria-hidden>{getEmojiForValue(card.value)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Game Info */}
        <div className="mt-6 text-center">
          <p className="text-lg text-gray-700 dark:text-gray-300">
              Moves: {moves} | Matches: {score} / {pairsInPlay}
          </p>

          {gameOver && (
            <div className="mt-4 p-4 bg-green-100 dark:bg-green-900 rounded-lg">
              <h3 className="text-xl font-bold text-green-800 dark:text-green-200">
                Congratulations! You won in {moves} moves!
              </h3>
              <button
                  onClick={startGame}
                className="mt-3 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Play Again
              </button>
            </div>
          )}
        </div>
      </div>
    </GameContainer>
  );
};

export default MemoryGame;
