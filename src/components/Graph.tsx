import React, { useState, useEffect } from "react";
import Node from "./Node";

interface GraphNode {
  id: number;
  x: number;
  y: number;
  neighbors: number[];
}

const nodes: GraphNode[] = [
  // Top layer
  { id: 0, x: 200, y: 50, neighbors: [1, 2] },
  // Second layer
  { id: 1, x: 100, y: 150, neighbors: [0, 3, 4] },
  { id: 2, x: 300, y: 150, neighbors: [0, 5, 6] },
  // Third layer
  { id: 3, x: 50, y: 250, neighbors: [1, 7] },
  { id: 4, x: 150, y: 250, neighbors: [1, 7, 8] },
  { id: 5, x: 250, y: 250, neighbors: [2, 8, 9] },
  { id: 6, x: 350, y: 250, neighbors: [2, 9] },
  // Fourth layer
  { id: 7, x: 100, y: 350, neighbors: [3, 4, 10] },
  { id: 8, x: 200, y: 350, neighbors: [4, 5, 10, 11] },
  { id: 9, x: 300, y: 350, neighbors: [5, 6, 11] },
  // Bottom layer
  { id: 10, x: 150, y: 450, neighbors: [7, 8] },
  { id: 11, x: 250, y: 450, neighbors: [8, 9] },
];

const Graph: React.FC = () => {
  const [visitedNodes, setVisitedNodes] = useState<Set<number>>(new Set());
  const [currentNode, setCurrentNode] = useState<number | null>(null);
  const [isTraversing, setIsTraversing] = useState(false);

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const resetState = () => {
    setVisitedNodes(new Set());
    setCurrentNode(null);
    setIsTraversing(false);
  };

  const dfs = async (start: number, end: number) => {
    setIsTraversing(true);
    const visited = new Set<number>();
    const stack: number[] = [start];

    while (stack.length > 0) {
      const node = stack.pop()!;

      if (!visited.has(node)) {
        setCurrentNode(node);
        visited.add(node);
        setVisitedNodes(new Set(visited));

        if (node === end) break;
        await delay(1000);

        const neighbors = nodes[node].neighbors;
        for (let i = neighbors.length - 1; i >= 0; i--) {
          if (!visited.has(neighbors[i])) {
            stack.push(neighbors[i]);
          }
        }
      }
    }

    setCurrentNode(null);
    setIsTraversing(false);
  };

  const bfs = async (start: number, end: number) => {
    setIsTraversing(true);
    const visited = new Set<number>();
    const queue: number[] = [start];
    visited.add(start);

    while (queue.length > 0) {
      const node = queue.shift()!;
      setCurrentNode(node);
      setVisitedNodes(new Set(visited));

      if (node === end) break;
      await delay(1000);

      for (const neighbor of nodes[node].neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          await delay(1000);
          queue.push(neighbor);
        }
      }
    }

    setCurrentNode(null);
    setIsTraversing(false);
  };

  return (
    <div>
      <div className="absolute top-2 left-4 space-x-4">
        <button
          onClick={() => {
            resetState();
            dfs(0, 11);
          }}
          disabled={isTraversing}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400 hover:bg-blue-600"
        >
          Run DFS
        </button>
        <button
          onClick={() => {
            resetState();
            bfs(0, 11);
          }}
          disabled={isTraversing}
          className="px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-400 hover:bg-green-600"
        >
          Run BFS
        </button>
      </div>
      <div className="relative w-full h-screen bg-gray-100">
        {/* Draw edges */}
        <svg className="absolute w-full h-full">
          {nodes.map((node) =>
            node.neighbors.map((neighborId) => (
              <line
                key={`${node.id}-${neighborId}`}
                x1={node.x + 24}
                y1={node.y + 24}
                x2={nodes[neighborId].x + 24}
                y2={nodes[neighborId].y + 24}
                stroke="gray"
                strokeWidth="2"
              />
            ))
          )}
        </svg>

        {/* Draw nodes */}
        {nodes.map((node) => (
          <Node
            key={node.id}
            id={node.id}
            x={node.x}
            y={node.y}
            isVisited={visitedNodes.has(node.id)}
            isStart={node.id === 0}
            isEnd={node.id === 11}
            isCurrentNode={currentNode === node.id}
          />
        ))}
      </div>
    </div>
  );
};

export default Graph;
