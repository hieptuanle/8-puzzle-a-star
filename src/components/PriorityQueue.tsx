import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import { QueueItem } from "../types/PuzzleTypes";
import MiniBoard from "./MiniBoard";

interface PriorityQueueProps {
  items: QueueItem[];
  selectedMove: QueueItem | null;
}

const PriorityQueue: React.FC<PriorityQueueProps> = ({
  items,
  selectedMove,
}) => {
  return (
    <div className="w-full max-w-3xl">
      <motion.div className="grid grid-cols-4 gap-4">
        <AnimatePresence>
          {items.map((item) => (
            <MiniBoard
              key={item.id}
              board={item.board}
              g={item.g}
              h={item.h}
              f={item.f}
              isSelected={selectedMove?.id === item.id}
              isNew={item.isNew}
            />
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default PriorityQueue;
