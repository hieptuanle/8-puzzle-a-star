import { nanoid } from "nanoid";
import {
  HFunction,
  Position,
  PuzzleState,
  QueueItem,
} from "../types/PuzzleTypes";

export const getNextQueueItems = (
  state: PuzzleState,
  visited: Array<string>,
  currentQueue: QueueItem[],
  currentHFunction: HFunction = "euclidean",
): QueueItem[] => {
  const moves = getValidMoves(state);
  return moves
    .filter((move) => !visited.includes(boardToString(move.board)))
    .filter((move) =>
      !currentQueue.some((item) =>
        boardToString(item.board) === boardToString(move.board)
      )
    )
    .map((move) => {
      const g = state.moves + 1;
      const h = currentHFunction === "manhattan"
        ? getManhattanDistance(move.board)
        : currentHFunction === "euclidean"
        ? getEuclideanDistance(move.board)
        : getManhattanDistance(move.board) + getLinearConflict(move.board);

      const f = g + h;
      return {
        id: nanoid(),
        board: move.board,
        g,
        h,
        f,
        isVisited: false,
        isNew: true,
      };
    });
};

export const createInitialState = (initialConfig?: string): PuzzleState => {
  let numbers: number[];
  if (initialConfig) {
    numbers = stringToBoard(initialConfig).flat();
  } else {
    numbers = Array.from({ length: 8 }, (_, i) => i + 1);
    numbers.push(0);

    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
  }

  const board = Array(3).fill(null).map((_, row) =>
    Array(3).fill(null).map((_, col) => numbers[row * 3 + col])
  );

  const emptyPos = findEmptyPosition(board);

  return {
    board,
    emptyPos,
    moves: 0,
    path: [],
  };
};

export const findEmptyPosition = (board: number[][]): Position => {
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      if (board[row][col] === 0) {
        return { row, col };
      }
    }
  }
  return { row: 0, col: 0 };
};

export const isSolved = (board: number[][]): boolean => {
  const flatBoard = board.flat();
  for (let i = 0; i < 8; i++) {
    if (flatBoard[i] !== i + 1) return false;
  }
  return flatBoard[8] === 0;
};

export const getManhattanDistance = (board: number[][]): number => {
  let distance = 0;
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const value = board[row][col];
      if (value !== 0) {
        const targetRow = Math.floor((value - 1) / 3);
        const targetCol = (value - 1) % 3;
        distance += Math.abs(row - targetRow) + Math.abs(col - targetCol);
      }
    }
  }
  return distance;
};

export const getEuclideanDistance = (board: number[][]): number => {
  let distance = 0;
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const value = board[row][col];
      if (value !== 0) {
        const targetRow = Math.floor((value - 1) / 3);
        const targetCol = (value - 1) % 3;
        distance += Math.sqrt(
          Math.pow(row - targetRow, 2) + Math.pow(col - targetCol, 2),
        );
      }
    }
  }
  return distance;
};

export const getLinearConflict = (board: number[][]): number => {
  let conflict = 0;

  // Check rows for conflicts
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const value1 = board[row][col];
      if (value1 === 0) continue;

      // Check if value1 belongs in this row
      const value1TargetRow = Math.floor((value1 - 1) / 3);
      if (value1TargetRow !== row) continue;

      // Compare with other tiles in the same row
      for (let col2 = col + 1; col2 < 3; col2++) {
        const value2 = board[row][col2];
        if (value2 === 0) continue;

        const value2TargetRow = Math.floor((value2 - 1) / 3);
        // If both tiles belong in this row and are in reverse order
        if (value2TargetRow === row && value1 > value2) {
          conflict += 2;
        }
      }
    }
  }

  // Check columns for conflicts
  for (let col = 0; col < 3; col++) {
    for (let row = 0; row < 3; row++) {
      const value1 = board[row][col];
      if (value1 === 0) continue;

      // Check if value1 belongs in this column
      const value1TargetCol = (value1 - 1) % 3;
      if (value1TargetCol !== col) continue;

      // Compare with other tiles in the same column
      for (let row2 = row + 1; row2 < 3; row2++) {
        const value2 = board[row2][col];
        if (value2 === 0) continue;

        const value2TargetCol = (value2 - 1) % 3;
        // If both tiles belong in this column and are in reverse order
        if (value2TargetCol === col && value1 > value2) {
          conflict += 2;
        }
      }
    }
  }

  return conflict;
};

export const directions = [
  { row: -1, col: 0, move: "UP" },
  { row: 1, col: 0, move: "DOWN" },
  { row: 0, col: -1, move: "LEFT" },
  { row: 0, col: 1, move: "RIGHT" },
];

export const isValidMove = (tilePos: Position, emptyPos: Position): boolean => {
  // Check if the tile is adjacent (not diagonal) to the empty space
  const rowDiff = Math.abs(tilePos.row - emptyPos.row);
  const colDiff = Math.abs(tilePos.col - emptyPos.col);

  // Valid move if exactly one coordinate differs by 1 and the other is 0
  return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
};

export const getValidMoves = (state: PuzzleState): PuzzleState[] => {
  const moves: PuzzleState[] = [];
  const { row, col } = state.emptyPos;

  for (const dir of directions) {
    const newRow = row + dir.row;
    const newCol = col + dir.col;

    if (newRow >= 0 && newRow < 3 && newCol >= 0 && newCol < 3) {
      const newBoard = state.board.map((row) => [...row]);
      newBoard[row][col] = newBoard[newRow][newCol];
      newBoard[newRow][newCol] = 0;

      moves.push({
        board: newBoard,
        emptyPos: { row: newRow, col: newCol },
        moves: state.moves + 1,
        path: [...state.path, dir.move],
      });
    }
  }

  return moves;
};

export const findTilePosition = (
  board: number[][],
  value: number,
): Position => {
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      if (board[row][col] === value) {
        return { row, col };
      }
    }
  }
  return { row: -1, col: -1 };
};

export const boardToString = (board: number[][]): string => {
  return board.flat().join("");
};

export const stringToBoard = (boardStr: string): number[][] => {
  const numbers = boardStr.split("").map(Number);
  const board: number[][] = [];
  for (let i = 0; i < 3; i++) {
    board.push(numbers.slice(i * 3, (i + 1) * 3));
  }
  return board;
};

export const isSolvable = (board: number[][]): boolean => {
  const flattened = board.flat();
  const inversionCount = flattened.reduce((count, current, index) => {
    if (current === 0) return count;
    for (let i = index + 1; i < flattened.length; i++) {
      if (flattened[i] && flattened[i] < current) {
        count++;
      }
    }
    return count;
  }, 0);

  return inversionCount % 2 === 0;
};
