"use client";

import React from "react";
import { Html } from "@react-three/drei";
import { NodeType, NetworkNode, TwinObject } from "@/types/features";
import { useNode3D } from "@/hooks";

export interface Node3DProps {
  node: NetworkNode;
  twin: TwinObject | undefined;
  isSelected: boolean;
  onClick: () => void;
  showLabels: boolean;
  lowPowerMode: boolean;
  center: { x: number; y: number };
}

export function Node3D({
  node,
  twin,
  isSelected,
  onClick,
  showLabels,
  lowPowerMode,
  center,
}: Node3DProps) {
  const { meshRef, posX, posY, posZ, nodeColor } = useNode3D({
    node,
    twin,
    lowPowerMode,
    center,
  });

  const renderGeometry = () => {
    switch (node.nodeType) {
      case NodeType.DATABASE:
        return <cylinderGeometry args={[0.5, 0.5, 1.2, 16]} />;
      case NodeType.GATEWAY:
        return <torusGeometry args={[0.45, 0.18, 8, 24]} />;
      case NodeType.CDN:
        return <sphereGeometry args={[0.6, 16, 16]} />;
      case NodeType.EXTERNAL:
        return <octahedronGeometry args={[0.65]} />;
      case NodeType.SERVICE:
      default:
        return <boxGeometry args={[0.9, 0.9, 0.9]} />;
    }
  };

  return (
    <group position={[posX, posY, posZ]}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        castShadow
        receiveShadow
      >
        {renderGeometry()}
        <meshStandardMaterial
          color={nodeColor}
          roughness={0.15}
          metalness={0.8}
          emissive={nodeColor}
          emissiveIntensity={
            isSelected ? (lowPowerMode ? 0.4 : 0.8) : lowPowerMode ? 0.1 : 0.25
          }
        />
      </mesh>

      {isSelected && !lowPowerMode && (
        <mesh scale={[1.25, 1.25, 1.25]}>
          {renderGeometry()}
          <meshBasicMaterial
            color={nodeColor}
            wireframe
            transparent
            opacity={0.4}
          />
        </mesh>
      )}

      {showLabels && (
        <Html distanceFactor={14} position={[0, 1.2, 0]} center>
          <div
            onClick={onClick}
            className={`px-2.5 py-1 rounded-xl bg-slate-950/90 border text-[10px] font-bold text-white whitespace-nowrap cursor-pointer transition-all duration-300 flex items-center gap-1.5 shadow-lg select-none ${
              isSelected
                ? "border-primary ring-2 ring-primary/20 scale-105"
                : "border-white/10 hover:border-white/20"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                !twin
                  ? "bg-blue-400"
                  : twin.status === "up"
                    ? "bg-emerald-400"
                    : twin.status === "degraded"
                      ? "bg-amber-400"
                      : "bg-red-400"
              }`}
            />
            {node.label}
          </div>
        </Html>
      )}
    </group>
  );
}
