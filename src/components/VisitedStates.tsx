import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import { stringToBoard } from "../utils/puzzleUtils";
import MiniBoard from "./MiniBoard";

interface VisitedStatesProps {
  visitedStates: string[];
}

const VisitedStates: React.FC<VisitedStatesProps> = ({ visitedStates }) => {
  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow-md w-52">
      <h2 className="text-xl font-semibold mb-4">Visited States</h2>
      <div className="space-y-2 max-h-96 overflow-y-auto flex flex-col px-4">
        <AnimatePresence>
          {visitedStates.map((boardStr) => (
            <motion.div
              key={boardStr}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <MiniBoard
                board={stringToBoard(boardStr)}
                g={0}
                h={0}
                f={0}
                isSelected={false}
                mini={true}
                key={boardStr}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default VisitedStates;
