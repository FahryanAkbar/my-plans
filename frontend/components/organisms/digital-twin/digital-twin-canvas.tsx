"use client";

import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Line } from "@react-three/drei";
import { useDigitalTwinCanvas } from "@/hooks";
import { Typography } from "@/components/atoms";
import { FlowingParticles } from "./flowing-particles";
import { Node3D } from "./node-3d";
import { LeftToolbar } from "./left-toolbar";
import { TelemetryHud } from "./telemetry-hud";

interface DigitalTwinCanvasProps {
  projectId: string;
  className?: string;
}

export function DigitalTwinCanvas({
  projectId,
  className,
}: DigitalTwinCanvasProps) {
  const {
    nodes,
    edges,
    isTopologyLoading,
    isConnected,
    selectedNodeId,
    setSelectedNodeId,
    showLabels,
    setShowLabels,
    lowPowerMode,
    setLowPowerMode,
    orbitRef,
    mockLogs,
    centerCoords,
    twinLookup,
    selectedNode,
    selectedTwin,
    handleResetCamera,
    isLoaded,
    averageUptime,
  } = useDigitalTwinCanvas(projectId);

  return (
    <div
      className={`relative w-full flex flex-col xl:flex-row gap-5 h-180 border border-border/40 rounded-2xl overflow-hidden bg-card/15 shadow-sm ${className}`}
    >
      <LeftToolbar
        isConnected={isConnected}
        nodeCount={nodes.length}
        averageUptime={averageUptime}
        showLabels={showLabels}
        onShowLabelsChange={setShowLabels}
        lowPowerMode={lowPowerMode}
        onLowPowerModeChange={setLowPowerMode}
        onResetCamera={handleResetCamera}
      />

      <div className="flex-1 relative overflow-hidden bg-[#05070a] border border-border/30 rounded-xl">
        {!isConnected && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-xs">
            <div className="flex flex-col items-center gap-2 p-6 bg-slate-900 border border-white/10 rounded-2xl text-center shadow-2xl max-w-xs">
              <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-1" />
              <Typography
                variant="span"
                className="text-xs font-bold text-white block"
              >
                Connecting to Digital Twin Socket Gateway...
              </Typography>
              <Typography
                variant="caption"
                className="text-[10px] text-muted-foreground/70"
              >
                Attempting handshake at namespace /digital-twin
              </Typography>
            </div>
          </div>
        )}

        {isTopologyLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 backdrop-blur-xxs">
            <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {isLoaded && (
          <Canvas
            camera={{ position: [0, 6, 8], fov: 45 }}
            shadows
            className="w-full h-full cursor-grab active:cursor-grabbing"
          >
            <ambientLight intensity={0.4} />

            <directionalLight
              position={[10, 18, 10]}
              intensity={0.7}
              castShadow
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
            />

            <gridHelper
              args={[60, 60, "#1e293b", "#0f172a"]}
              position={[0, -0.6, 0]}
            />

            <OrbitControls
              ref={orbitRef}
              maxPolarAngle={Math.PI / 2.1}
              minDistance={2}
              maxDistance={22}
            />

            {nodes.map((node) => (
              <Node3D
                key={node.id}
                node={node}
                twin={node.configId ? twinLookup[node.configId] : undefined}
                isSelected={selectedNodeId === node.id}
                onClick={() => setSelectedNodeId(node.id)}
                showLabels={showLabels}
                lowPowerMode={lowPowerMode}
                center={centerCoords}
              />
            ))}

            {edges.map((edge) => {
              const source = nodes.find((n) => n.id === edge.sourceId);
              const target = nodes.find((n) => n.id === edge.targetId);
              if (!source || !target) return null;

              const x1 = (source.x - centerCoords.x) / 100;
              const z1 = (source.y - centerCoords.y) / 100;
              const x2 = (target.x - centerCoords.x) / 100;
              const z2 = (target.y - centerCoords.y) / 100;

              const targetTwin = target.configId
                ? twinLookup[target.configId]
                : null;
              const connectionStatus = targetTwin ? targetTwin.status : "up";

              let strokeColor = "#1e293b";
              let lineWidth = 1.0;
              if (connectionStatus === "down") {
                strokeColor = "#EF4444";
                lineWidth = 2.0;
              } else if (connectionStatus === "degraded") {
                strokeColor = "#F59E0B";
                lineWidth = 1.5;
              }

              return (
                <group key={edge.id}>
                  <Line
                    points={[
                      [x1, 0, z1],
                      [x2, 0, z2],
                    ]}
                    color={strokeColor}
                    lineWidth={lineWidth}
                  />

                  {/* Flowing packet particles */}
                  <FlowingParticles
                    start={[x1, 0, z1]}
                    end={[x2, 0, z2]}
                    status={connectionStatus}
                    lowPowerMode={lowPowerMode}
                  />
                </group>
              );
            })}
          </Canvas>
        )}

        <div className="absolute bottom-4 left-4 z-10 text-[9px] font-semibold text-muted-foreground/60 bg-black/60 px-3 py-1.5 border border-white/5 rounded-lg select-none pointer-events-none space-y-0.5">
          <div>🖱️ Drag: Rotate View</div>
          <div>🖱️ Right-Click + Drag: Pan View</div>
          <div>🖱️ Scroll: Zoom View</div>
        </div>
      </div>

      <TelemetryHud
        selectedNode={selectedNode}
        selectedTwin={selectedTwin}
        mockLogs={mockLogs}
        onClearSelection={() => setSelectedNodeId(null)}
      />
    </div>
  );
}
