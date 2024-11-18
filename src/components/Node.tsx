import React from "react";

interface NodeProps {
  id: number;
  x: number;
  y: number;
  isVisited: boolean;
  isStart: boolean;
  isEnd: boolean;
  isCurrentNode: boolean;
}

const Node: React.FC<NodeProps> = ({
  id,
  x,
  y,
  isVisited,
  isStart,
  isEnd,
  isCurrentNode,
}) => {
  const getNodeColor = () => {
    if (isCurrentNode) return "bg-yellow-400";
    if (isStart) return "bg-green-500";
    if (isVisited) return "bg-blue-300";
    if (isEnd) return "bg-red-500";
    return "bg-gray-200";
  };

  return (
    <div
      className={`absolute w-12 h-12 rounded-full flex items-center justify-center
        ${getNodeColor()} border-2 border-gray-600 transition-colors duration-300`}
      style={{ left: x, top: y }}
    >
      {id}
    </div>
  );
};

export default Node;
