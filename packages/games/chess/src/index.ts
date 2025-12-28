export {ChessGame} from "./components/ChessGame";
// Re-export chess logic so unit tests (and consumers) can import from the package root
export {applyMove, initialState, legalMoves} from "./logic/rules";
export * from "./logic/types";
