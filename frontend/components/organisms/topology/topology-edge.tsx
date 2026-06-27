"use client";

import React from "react";
import { NetworkEdge } from "@/types/features";

export interface TopologyEdgeProps {
  edge: NetworkEdge;
  coords: { x1: number; y1: number; x2: number; y2: number };
  isSelected: boolean;
  isSimImpacted: boolean;
  onClick: () => void;
}

export function TopologyEdge({
  coords,
  isSelected,
  isSimImpacted,
  onClick,
}: TopologyEdgeProps) {
  const { x1, y1, x2, y2 } = coords;
  // Smooth bezier path curve
  const controlDist = Math.abs(x2 - x1) * 0.5;
  const pathD = `M ${x1} ${y1} C ${x1 + controlDist} ${y1}, ${x2 - controlDist} ${y2}, ${x2} ${y2}`;

  let strokeColor = "#374151";
  let strokeWidth = 2;
  let arrowMarker = "url(#arrow-default)";
  const isFlowing = true;

  if (isSimImpacted) {
    strokeColor = "#EF4444"; // Outage red
    strokeWidth = 3;
    arrowMarker = "url(#arrow-danger)";
  } else if (isSelected) {
    strokeColor = "#4361EE"; // Selected primary blue
    strokeWidth = 3.5;
    arrowMarker = "url(#arrow-selected)";
  }

  return (
    <g className="pointer-events-auto cursor-pointer animate-in fade-in duration-300">
      <path
        d={pathD}
        fill="none"
        stroke="transparent"
        strokeWidth={16}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      />
      {/* Main visible connection line */}
      <path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        markerEnd={arrowMarker}
        className="transition-colors duration-300"
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      />
      {isFlowing && (
        <path
          d={pathD}
          fill="none"
          stroke={
            isSimImpacted ? "#EF4444" : isSelected ? "#4361EE" : "#10B981"
          }
          strokeWidth={1.5}
          strokeDasharray="6, 12"
          className={`pointer-events-none ${isSimImpacted ? "flow-edge-animate-danger" : "flow-edge-animate"}`}
          opacity={isSimImpacted ? 0.95 : 0.6}
        />
      )}
    </g>
  );
}
