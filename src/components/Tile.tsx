import React from "react";

interface TileProps {
  value: number;
  isLastMoved: boolean;
  onClick: () => void;
}

const Tile: React.FC<TileProps> = ({ value, isLastMoved, onClick }) => {
  if (value === 0)
    return <div className="w-20 h-20 m-1 bg-gray-200 rounded-lg"></div>;

  return (
    <div
      onClick={onClick}
      className={`w-20 h-20 m-1 flex items-center justify-center rounded-lg text-2xl font-bold cursor-pointer transition-colors duration-300 ${
        isLastMoved
          ? "bg-green-500 text-white"
          : "bg-blue-500 text-white hover:bg-blue-600"
      }`}
    >
      {value}
    </div>
  );
};

export default Tile;
