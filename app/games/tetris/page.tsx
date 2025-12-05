"use client";

import dynamic from "next/dynamic";

const TetrisGame = dynamic(() => import("@games/tetris").then((m) => m.TetrisGame), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-xl">Loading game...</div>
    </div>
  ),
});

export default function TetrisGamePage() {
  return <TetrisGame />;
}
