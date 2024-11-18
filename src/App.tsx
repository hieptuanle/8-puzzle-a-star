import { cloneDeep } from "lodash";
import { useCallback, useEffect, useRef, useState } from "react";
import Board from "./components/Board";
import PriorityQueue from "./components/PriorityQueue";
import VisitedStates from "./components/VisitedStates";
import { PuzzleState, QueueItem } from "./types/PuzzleTypes";
import PQueue from "./utils/PQueue";
import {
  boardToString,
  createInitialState,
  findTilePosition,
  getNextQueueItems,
  isSolved,
  isValidMove,
} from "./utils/puzzleUtils";

function App() {
  const [gameState, setGameState] = useState<PuzzleState>(createInitialState());
  const [visitedStates, setVisitedStates] = useState<Array<string>>([]);
  const nextQueueItems = getNextQueueItems(gameState, visitedStates);
  const [queueItems, setQueueItems] = useState<QueueItem[]>(
    new PQueue(nextQueueItems).getItems()
  );
  const [lastMovedTile, setLastMovedTile] = useState<number | null>(null);
  const [history, setHistory] = useState<
    {
      state: PuzzleState;
      queue: QueueItem[];
      visited: Array<string>;
    }[]
  >([]);
  const [selectedMove, setSelectedMove] = useState<QueueItem | null>(
    queueItems[0]
  );
  const initialConfigRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const initialConfig = localStorage.getItem("puzzle-config");
    if (initialConfig) {
      const inputRef = initialConfigRef.current as HTMLInputElement;
      inputRef.value = initialConfig;
      resetGame(initialConfig);
    }
  }, []);

  const handleTileClick = (value: number) => {
    if (value === 0) return;

    const tilePos = findTilePosition(gameState.board, value);

    if (isValidMove(tilePos, gameState.emptyPos)) {
      const newBoard = gameState.board.map((row) => [...row]);
      newBoard[gameState.emptyPos.row][gameState.emptyPos.col] = value;
      newBoard[tilePos.row][tilePos.col] = 0;

      setHistory((prev) => [
        ...prev,
        {
          state: gameState,
          queue: queueItems,
          visited: [...visitedStates],
        },
      ]);
      setLastMovedTile(value);
      setGameState((prev) => ({
        ...prev,
        board: newBoard,
        emptyPos: tilePos,
        moves: prev.moves + 1,
      }));
    }
  };

  const handleUndo = () => {
    if (history.length > 0) {
      const previousState = history[history.length - 1];
      setGameState(previousState.state);
      setQueueItems(previousState.queue);
      setVisitedStates(previousState.visited);
      setHistory((prev) => prev.slice(0, -1));
      setLastMovedTile(null);
      setSelectedMove(previousState.queue[0]);
    }
  };

  const handleNextMove = useCallback(() => {
    if (queueItems.length === 0 || isSolved(gameState.board)) {
      return;
    }

    const currentBoardStr = boardToString(gameState.board);

    const bestMove = cloneDeep(queueItems[0]);

    const newPuzzleState: PuzzleState = {
      board: bestMove.board,
      emptyPos: findTilePosition(bestMove.board, 0),
      moves: bestMove.g,
      path: [...gameState.path, currentBoardStr],
    };

    const newVisitedStates = [...visitedStates];
    newVisitedStates.unshift(boardToString(bestMove.board));

    setGameState(newPuzzleState);

    const newItems = getNextQueueItems(newPuzzleState, newVisitedStates);
    const newQueueItems = [
      ...queueItems.map((item) => ({ ...item, isNew: false })),
      ...newItems,
    ]
      .filter((item) => !newVisitedStates.includes(boardToString(item.board)))
      .sort((a, b) => a.f - b.f)
      .slice(0, 100);
    setQueueItems(newQueueItems);

    setVisitedStates(newVisitedStates);

    setHistory((prev) => [
      ...prev,
      {
        state: cloneDeep(gameState),
        queue: cloneDeep(queueItems),
        visited: [...visitedStates],
      },
    ]);

    setLastMovedTile(null);

    setSelectedMove(newQueueItems[0]);
  }, [gameState, visitedStates, queueItems]);

  const resetGame = (initialConfig?: string) => {
    const newState = createInitialState(initialConfig);
    setGameState(newState);
    setLastMovedTile(null);
    setVisitedStates([]);
    const queue = new PQueue(getNextQueueItems(newState, []));
    setQueueItems(queue.getItems());
    setHistory([]);
    setSelectedMove(queue.first() || null);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const inputRef = initialConfigRef.current as HTMLInputElement;
    let config = inputRef.value;

    if (!config) {
      const newBoard = createInitialState();
      config = boardToString(newBoard.board);
      inputRef.value = config;
    }

    localStorage.setItem("puzzle-config", config);

    resetGame(config);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start py-8">
      <div className="flex flex-grow flex-col items-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Bài toán 8 số</h1>
        <div className="text-gray-600 text-xl mb-4">
          Giải bằng <span className="font-bold">thuật toán tìm kiếm A*</span>
        </div>
        <form className="mb-4 flex items-center gap-8" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label htmlFor="initial-config" className="text-gray-600">
              Cấu hình ban đầu
            </label>
            <div className="flex items-center">
              <input
                id="initial-config"
                type="text"
                className="w-16 p-2 rounded-lg border border-gray-300 min-w-80 rounded-r-none"
                placeholder="0,1,2,3,4,5,6,7,8"
                ref={initialConfigRef}
              />
              <button
                type="submit"
                className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold rounded-l-none"
              >
                Game mới
              </button>
            </div>
            <p className="text-gray-600 text-sm">
              Để trống để tạo ngẫu nhiên, 0 là ô trống
            </p>
          </div>
        </form>
        <div className="flex gap-8">
          <div>
            <Board
              board={gameState.board}
              lastMovedTile={lastMovedTile}
              onTileClick={handleTileClick}
            />
            <div className="mt-8 flex items-center gap-4 justify-center">
              <button
                onClick={handleUndo}
                disabled={history.length === 0}
                className={`px-6 py-2 rounded-lg font-semibold ${
                  history.length === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-yellow-500 hover:bg-yellow-600 text-white"
                }`}
              >
                Quay lại
              </button>

              <button
                onClick={handleNextMove}
                disabled={isSolved(gameState.board)}
                className={`px-6 py-2 rounded-lg font-semibold ${
                  isSolved(gameState.board)
                    ? "bg-green-400 cursor-not-allowed text-white"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                {isSolved(gameState.board) ? "Giải xong!" : "Đi tiếp"}
              </button>
            </div>
            <div className="mt-4 text-gray-600 flex justify-center">
              Số lần đã đi: {gameState.moves} | Số lần đã xét:{" "}
              {visitedStates.length}
            </div>
          </div>
          <VisitedStates visitedStates={Array.from(visitedStates)} />
        </div>
        <PriorityQueue items={queueItems} selectedMove={selectedMove} />
      </div>
      <footer className="text-gray-600 text-sm mt-8 text-center">
        Bài tập nhóm - Nhập môn Trí tuệ nhân tạo - B2CQ-CNTT02-K68 - HUST |{" "}
        <a
          href="https://github.com/hieptuanle/8-puzzle-a-star"
          target="_blank"
          className="text-blue-500 hover:text-blue-600"
        >
          Github
        </a>
        <br />
        MIT License - 2024
      </footer>
    </div>
  );
}

export default App;
