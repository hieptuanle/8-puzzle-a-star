import React from "react";
import Tile from "./Tile";

interface BoardProps {
  board: number[][];
  lastMovedTile: number | null;
  onTileClick: (value: number) => void;
}

const Board: React.FC<BoardProps> = ({ board, lastMovedTile, onTileClick }) => {
  return (
    <div className="inline-block bg-gray-100 p-4 rounded-xl">
      <div className="grid grid-cols-3 gap-1">
        {board.flat().map((value, index) => (
          <Tile
            key={index}
            value={value}
            isLastMoved={value === lastMovedTile}
            onClick={() => onTileClick(value)}
          />
        ))}
      </div>
    </div>
  );
};

export default Board;
