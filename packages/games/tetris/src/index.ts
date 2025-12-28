// Re-export default component as a named export so dynamic imports like
// `import("@games/tetris").then(m => m.TetrisGame)` work under TS/Turbopack.
export {default as TetrisGame} from "./components/TetrisGame";
export * from "./components/TetrisGame";
