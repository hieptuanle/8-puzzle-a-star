export type Position = {
  row: number;
  col: number;
};

export type PuzzleState = {
  board: number[][];
  emptyPos: Position;
  moves: number;
  path: string[];
};

export type Node = {
  state: PuzzleState;
  parent: Node | null;
  g: number;
  h: number;
  f: number;
};

export type QueueItem = {
  id: string;
  board: number[][];
  g: number;
  h: number;
  f: number;
  isVisited: boolean;
  isNew: boolean;
};

export type HFunction = "manhattan" | "euclidean" | "manhattan-linear-conflict";
