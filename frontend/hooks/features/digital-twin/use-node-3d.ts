import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { NodeType, NetworkNode, TwinObject } from "@/types/features";

export interface UseNode3DProps {
  node: NetworkNode;
  twin: TwinObject | undefined;
  lowPowerMode: boolean;
  center: { x: number; y: number };
}

export function useNode3D({ node, twin, lowPowerMode, center }: UseNode3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Position scaling: scale pixel coords to WebGL units
  const posX = (node.x - center.x) / 100;
  const posZ = (node.y - center.y) / 100;
  const posY = 0;

  // Pulse & Rotation animations
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const time = clock.getElapsedTime();

    // Rotate database and services
    if (!lowPowerMode) {
      if (node.nodeType === NodeType.DATABASE || node.nodeType === NodeType.SERVICE) {
        meshRef.current.rotation.y = time * 0.3;
      } else {
        meshRef.current.rotation.y = Math.sin(time * 0.5) * 0.2;
      }
    }

    // Pulse scale if warning/outage
    let pulseSpeed = 1;
    let pulseAmt = 0.03;
    if (twin) {
      if (twin.status === "down") {
        pulseSpeed = 5;
        pulseAmt = 0.12;
      } else if (twin.status === "degraded") {
        pulseSpeed = 2.5;
        pulseAmt = 0.06;
      }
    }

    if (!lowPowerMode && twin && twin.status !== "up" && twin.status !== "unknown") {
      const scale = 1 + Math.sin(time * pulseSpeed) * pulseAmt;
      meshRef.current.scale.set(scale, scale, scale);
    } else {
      meshRef.current.scale.set(1, 1, 1);
    }
  });

  // Get color based on live state status
  const getNodeColor = () => {
    if (!twin) return "#3B82F6"; // Unmonitored -> Cool Indigo Blue
    switch (twin.status) {
      case "up":
        return "#10B981"; // Healthy Emerald Green
      case "degraded":
        return "#F59E0B"; // Heavy Load Amber
      case "down":
        return "#EF4444"; // Outage Red
      case "unknown":
      default:
        return "#6B7280"; // Offline/Unknown Slate Gray
    }
  };

  const nodeColor = getNodeColor();

  return {
    meshRef,
    posX,
    posY,
    posZ,
    nodeColor,
  };
}
