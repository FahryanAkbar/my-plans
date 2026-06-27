"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export interface FlowingParticlesProps {
  start: [number, number, number];
  end: [number, number, number];
  status: "up" | "down" | "degraded" | "unknown";
  lowPowerMode: boolean;
}

export function FlowingParticles({ start, end, status, lowPowerMode }: FlowingParticlesProps) {
  const particleRef1 = useRef<THREE.Mesh>(null);
  const particleRef2 = useRef<THREE.Mesh>(null);
  const particleRef3 = useRef<THREE.Mesh>(null);

  const speed = status === "down" ? 0 : status === "degraded" ? 0.3 : 0.8;
  const color = status === "down" ? "#EF4444" : status === "degraded" ? "#F59E0B" : "#10B981";

  useFrame(({ clock }) => {
    if (lowPowerMode || speed === 0) return;
    const time = clock.getElapsedTime() * speed;

    const p1 = particleRef1.current;
    const p2 = particleRef2.current;
    const p3 = particleRef3.current;

    const startVec = new THREE.Vector3(...start);
    const endVec = new THREE.Vector3(...end);

    if (p1) {
      const t1 = (time) % 1;
      p1.position.copy(startVec).lerp(endVec, t1);
    }
    if (p2) {
      const t2 = (time + 0.33) % 1;
      p2.position.copy(startVec).lerp(endVec, t2);
    }
    if (p3) {
      const t3 = (time + 0.66) % 1;
      p3.position.copy(startVec).lerp(endVec, t3);
    }
  });

  if (lowPowerMode || status === "down") return null;

  return (
    <group>
      <mesh ref={particleRef1}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <mesh ref={particleRef2}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <mesh ref={particleRef3}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
    </group>
  );
}
