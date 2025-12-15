// libs/shared/src/components/GameContainer.tsx
import React, {type ReactNode} from "react";

import {GameSettingsProvider, useGameSettings} from "../contexts/GameSettingsContext";
import {ErrorBoundary} from "../lib/ErrorBoundary";

export interface GameContainerProps {
  children: ReactNode;
  title: string;
  description?: string;
  className?: string;
    // When true, prevents page scroll/zoom and enables touch-action safety inside the game area (mobile-friendly)
    lockTouch?: boolean;
}

// Prefer a standard function component that explicitly returns JSX.Element
// This avoids React.FC typing nuances (e.g., ReactNode | Promise<ReactNode> in some type versions)
function GameContainer({
                           children,
                           title,
                           description,
                           className = "",
                           lockTouch = true,
                       }: GameContainerProps) {
    // Prevent scroll/zoom gestures while interacting with the game area on mobile
    const touchHandlers = lockTouch
        ? {
            onTouchMove: (e: React.TouchEvent) => e.preventDefault(),
            onTouchStart: (e: React.TouchEvent) => e.preventDefault(),
            onTouchEnd: (e: React.TouchEvent) => e.preventDefault(),
            onWheel: (e: React.WheelEvent) => e.preventDefault(),
        }
        : {};
  return (
      <GameSettingsProvider>
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${className}`}>
        <div className="container mx-auto px-4 py-4 md:py-6">
            <header className="mb-4 md:mb-6 text-center">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1 md:mb-2">
                {title}
            </h1>
          {description && (
              <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {description}
            </p>
          )}
        </header>

        <ErrorBoundary>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div
                  className={`relative w-full aspect-video max-w-4xl mx-auto ${lockTouch ? 'touch-none select-none' : ''}`}
                  {...touchHandlers}
              >
                  {children}
              </div>
          </div>
        </ErrorBoundary>

            <div className="mt-4 md:mt-6 flex flex-col items-center gap-3 md:gap-4">
              <ParticlesToggle/>
              <div className="text-center">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reset Game
          </button>
              </div>
          </div>
      </div>
    </div>
      </GameSettingsProvider>
  );
}

// Export the component as default
export default GameContainer;

function ParticlesToggle() {
    const {enableParticles, setEnableParticles} = useGameSettings();
    return (
        <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
            <input
                type="checkbox"
                checked={enableParticles}
                onChange={(e) => setEnableParticles(e.currentTarget.checked)}
                className="h-4 w-4 accent-blue-600"
            />
            Enable particles (experimental)
        </label>
    );
}
