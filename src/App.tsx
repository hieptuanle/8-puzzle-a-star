import { cloneDeep } from "lodash";
import { Pause, Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useInterval } from "usehooks-ts";
import Board from "./components/Board";
import PriorityQueue from "./components/PriorityQueue";
import VisitedStates from "./components/VisitedStates";
import { HFunction, PuzzleState, QueueItem } from "./types/PuzzleTypes";
import PQueue from "./utils/PQueue";
import {
  boardToString,
  createInitialState,
  findTilePosition,
  getEuclideanDistance,
  getLinearConflict,
  getManhattanDistance,
  getNextQueueItems,
  isSolvable,
  isSolved,
  isValidMove,
} from "./utils/puzzleUtils";

function App() {
  const [gameState, setGameState] = useState<PuzzleState>(createInitialState());
  const [visitedStates, setVisitedStates] = useState<Array<string>>([]);
  const nextQueueItems = getNextQueueItems(gameState, visitedStates, []);
  const [queueItems, setQueueItems] = useState<QueueItem[]>(
    new PQueue(nextQueueItems).getItems()
  );
  const [hFunction, setHFunction] = useState<HFunction>("euclidean");
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
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

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

      const newVisitedStates = [...visitedStates];
      if (!newVisitedStates.includes(boardToString(newBoard))) {
        newVisitedStates.unshift(boardToString(newBoard));
      }

      setHistory((prev) => [
        ...prev,
        {
          state: gameState,
          queue: queueItems,
          visited: [...newVisitedStates],
        },
      ]);
      setLastMovedTile(value);

      const newPuzzleState: PuzzleState = {
        board: newBoard,
        emptyPos: tilePos,
        moves: gameState.moves + 1,
        path: [...gameState.path, boardToString(gameState.board)],
      };

      setGameState(newPuzzleState);
      const newQueueItems = getNextQueueItems(
        newPuzzleState,
        newVisitedStates,
        queueItems,
        hFunction
      );
      const newQueue = new PQueue(
        [
          ...queueItems.map((item) => ({ ...item, isNew: false })),
          ...newQueueItems,
        ].filter(
          (item) => boardToString(item.board) !== boardToString(newBoard)
        )
      ).getItems();

      setQueueItems(newQueue);
      setSelectedMove(newQueue[0]);
      setVisitedStates(newVisitedStates);
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

    const newItems = getNextQueueItems(
      newPuzzleState,
      newVisitedStates,
      queueItems,
      hFunction
    );
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

    if (isSolved(newPuzzleState.board)) {
      setIsAutoPlaying(false);
    }
  }, [gameState, visitedStates, queueItems, hFunction]);

  const resetGame = (initialConfig?: string) => {
    const newState = createInitialState(initialConfig);
    setGameState(newState);
    setLastMovedTile(null);
    setVisitedStates([]);
    const queue = new PQueue(getNextQueueItems(newState, [], [], hFunction));
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

  const handleHFunctionChange = (hFunction: HFunction) => {
    setHFunction(hFunction);
    const queue = queueItems
      .map((item) => {
        const g = item.g;
        const h =
          hFunction === "manhattan"
            ? getManhattanDistance(item.board)
            : hFunction === "euclidean"
            ? getEuclideanDistance(item.board)
            : getManhattanDistance(item.board) + getLinearConflict(item.board);
        const f = g + h;
        return { ...item, g, h, f };
      })
      .sort((a, b) => a.f - b.f);
    setQueueItems(queue);
    setSelectedMove(queue[0]);
  };

  useInterval(
    () => {
      handleNextMove();
    },
    isAutoPlaying ? 1000 : null
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start py-8">
      <div className="flex flex-grow flex-col items-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Bài toán 8 số</h1>
        <div className="text-gray-600 text-xl mb-4">
          Giải bằng <span className="font-bold">thuật toán tìm kiếm A*</span>
        </div>
        <form className="mb-4 flex items-center gap-8" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2 px-4 md:px-0">
            <label htmlFor="initial-config" className="text-gray-600">
              Cấu hình ban đầu
            </label>
            <div className="flex items-center">
              <input
                id="initial-config"
                type="text"
                className="p-2 rounded-lg border border-gray-300 min-w-40 rounded-r-none text-sm md:text-base"
                placeholder="012345678"
                ref={initialConfigRef}
              />
              <button
                type="submit"
                className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold rounded-l-none text-sm md:text-base"
              >
                Game mới
              </button>
            </div>
            <p className="text-gray-600 text-sm">
              Để trống để tạo ngẫu nhiên, 0 là ô trống
            </p>
            {!isSolvable(gameState.board) && (
              <p className="text-red-500 text-sm">
                Lưu ý: Bài toán này không có lời giải.
              </p>
            )}
          </div>
        </form>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex flex-col items-center">
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

              <button
                onClick={() => {
                  if (isSolved(gameState.board) || isAutoPlaying) {
                    setIsAutoPlaying(false);
                  } else {
                    setIsAutoPlaying(!isAutoPlaying);
                    handleNextMove();
                  }
                }}
                disabled={isSolved(gameState.board)}
                className={`px-6 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 ${
                  isAutoPlaying
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : isSolved(gameState.board)
                    ? "bg-gray-400 hover:bg-gray-400 text-white cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                {isAutoPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                {isAutoPlaying ? "Tạm dừng" : "Tự động"}
              </button>
            </div>
            <div className="mt-4 text-gray-600 flex justify-center">
              Số lần đã đi: {gameState.moves} | Số lần đã xét:{" "}
              {visitedStates.length}
            </div>
          </div>
          <VisitedStates visitedStates={Array.from(visitedStates)} />
        </div>
        <div className="flex flex-col items-start gap-4 mt-8 px-4">
          <h2 className="text-xl font-semibold mb-4">
            Hàng đợi ưu tiên (Priority Queue)
          </h2>

          <div className="text-gray-600 text-sm">Chọn hàm heuristic:</div>
          <div className="flex items-stretch md:items-center gap-4">
            <button
              onClick={() => handleHFunctionChange("euclidean")}
              className={`px-6 py-2 rounded-lg font-semibold ${
                hFunction === "euclidean"
                  ? "bg-blue-500 hover:bg-blue-600 text-white"
                  : "bg-gray-400 "
              }`}
            >
              Euclidean Distance
            </button>
            <button
              onClick={() => handleHFunctionChange("manhattan")}
              className={`px-6 py-2 rounded-lg font-semibold ${
                hFunction === "manhattan"
                  ? "bg-blue-500 hover:bg-blue-600 text-white"
                  : "bg-gray-400 "
              }`}
            >
              Manhattan Distance
            </button>

            <button
              onClick={() => handleHFunctionChange("manhattan-linear-conflict")}
              className={`px-6 py-2 rounded-lg font-semibold ${
                hFunction === "manhattan-linear-conflict"
                  ? "bg-blue-500 hover:bg-blue-600 text-white"
                  : "bg-gray-400 "
              }`}
            >
              Manhattan + Linear Conflict
            </button>
          </div>
          <PriorityQueue items={queueItems} selectedMove={selectedMove} />
        </div>
      </div>
      <footer className="text-gray-600 text-sm mt-8 text-center px-4">
        Bài tập nhóm - Nhập môn Trí tuệ nhân tạo - B2CQ-CNTT02-K68 - HUST |{" "}
        <a
          href="https://github.com/hieptuanle/8-puzzle-a-star"
          target="_blank"
          rel="noreferrer"
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
