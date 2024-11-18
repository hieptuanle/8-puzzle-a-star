import { motion } from "framer-motion";
import React from "react";

interface MiniBoardProps {
  board: number[][];
  g: number;
  h: number;
  f: number;
  isSelected: boolean;
  isNew?: boolean;
  mini?: boolean;
}

const MiniBoard: React.FC<MiniBoardProps> = ({
  board,
  g,
  h,
  f,
  isSelected,
  isNew = false,
  mini = false,
}) => {
  return (
    <motion.div
      layout
      initial={{ scale: 0.8, opacity: 0 }}
      animate={
        isSelected
          ? {
              scale: [1, 1.2, 1],
              y: [-20, 0],
              transition: { duration: 1 },
              opacity: 1,
            }
          : {
              scale: 1,
              opacity: 1,
            }
      }
      exit={{ scale: 0.8, opacity: 0 }}
      className={`p-2 rounded-lg ${
        isSelected ? "ring-2 ring-green-500" : ""
      } shadow-md ${isNew ? "bg-green-100" : "bg-white"}`}
    >
      <div className="grid grid-cols-3 gap-0.5 aspect-square bg-gray-100 p-2 items-center justify-center">
        {board.flat().map((value, index) => (
          <div
            key={index}
            className={`${
              mini ? "w-6 h-6" : "w-10 h-10"
            } text-xs flex items-center justify-center font-semibold ${
              value === 0 ? "bg-gray-200" : "bg-blue-500 text-white"
            } rounded`}
          >
            {value !== 0 ? value : ""}
          </div>
        ))}
      </div>
      {!mini && (
        <div className="text-xs flex gap-2 items-center justify-center mt-2">
          <div>g:{g}</div>
          <div>h:{Number(h.toFixed(2))}</div>
          <div className="font-bold">f:{Number(f.toFixed(2))}</div>
        </div>
      )}
    </motion.div>
  );
};

export default MiniBoard;
