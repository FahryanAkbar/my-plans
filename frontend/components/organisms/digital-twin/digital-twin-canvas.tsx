"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Line, Html } from "@react-three/drei";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { 
  Activity, 
  RotateCcw, 
  Info, 
  CheckCircle2, 
  Wifi, 
  WifiOff, 
  TrendingUp, 
  TrendingDown,
  Layers,
  Cpu,
  Database,
  Globe,
  Radio,
  Server,
  Cloud,
  Eye,
  EyeOff,
  Zap,
  ShieldAlert
} from "lucide-react";
import { toast } from "sonner";
import * as THREE from "three";
import { 
  useNetworkTopology, 
  useDigitalTwin 
} from "@/hooks";
import { NodeType, NetworkNode, TwinObject } from "@/types/features";
import { Button, Typography, Switch, Badge } from "@/components/atoms";

interface DigitalTwinCanvasProps {
  projectId: string;
  className?: string;
}

// 1. Data Particle Flow Component
interface FlowingParticlesProps {
  start: [number, number, number];
  end: [number, number, number];
  status: "up" | "down" | "degraded" | "unknown";
  lowPowerMode: boolean;
}

function FlowingParticles({ start, end, status, lowPowerMode }: FlowingParticlesProps) {
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

// 2. 3D Node Mesh Component
interface Node3DProps {
  node: NetworkNode;
  twin: TwinObject | undefined;
  isSelected: boolean;
  onClick: () => void;
  showLabels: boolean;
  lowPowerMode: boolean;
  center: { x: number; y: number };
}

function Node3D({ node, twin, isSelected, onClick, showLabels, lowPowerMode, center }: Node3DProps) {
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

  // Custom 3D geometries based on node type
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
      {/* Node Mesh */}
      <mesh ref={meshRef} onClick={(e) => { e.stopPropagation(); onClick(); }} castShadow receiveShadow>
        {renderGeometry()}
        <meshStandardMaterial
          color={nodeColor}
          roughness={0.15}
          metalness={0.8}
          emissive={nodeColor}
          emissiveIntensity={isSelected ? (lowPowerMode ? 0.4 : 0.8) : (lowPowerMode ? 0.1 : 0.25)}
        />
      </mesh>

      {/* Selected Node Glow Outline */}
      {isSelected && !lowPowerMode && (
        <mesh scale={[1.25, 1.25, 1.25]}>
          {renderGeometry()}
          <meshBasicMaterial color={nodeColor} wireframe transparent opacity={0.4} />
        </mesh>
      )}

      {/* Floating 2D label */}
      {showLabels && (
        <Html distanceFactor={14} position={[0, 1.2, 0]} center>
          <div 
            onClick={onClick}
            className={`px-2.5 py-1 rounded-xl bg-slate-950/90 border text-[10px] font-bold text-white whitespace-nowrap cursor-pointer transition-all duration-300 flex items-center gap-1.5 shadow-lg select-none ${
              isSelected ? "border-primary ring-2 ring-primary/20 scale-105" : "border-white/10 hover:border-white/20"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${
              !twin ? "bg-blue-400" :
              twin.status === "up" ? "bg-emerald-400" :
              twin.status === "degraded" ? "bg-amber-400" : "bg-red-400"
            }`} />
            {node.label}
          </div>
        </Html>
      )}
    </group>
  );
}

// 3. Main DigitalTwinCanvas Component
export function DigitalTwinCanvas({ projectId, className }: DigitalTwinCanvasProps) {
  // A. Fetch Static Topology Map & Live State
  const { nodes, edges, isLoading: isTopologyLoading } = useNetworkTopology(projectId);
  const { state: twinState, isConnected } = useDigitalTwin(projectId);

  // B. Control States
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showLabels, setShowLabels] = useState(true);
  const [lowPowerMode, setLowPowerMode] = useState(false);
  const orbitRef = useRef<OrbitControlsImpl | null>(null);

  // C. Local Telemetry Log Mock
  const [mockLogs, setMockLogs] = useState<Array<{ time: string; msg: string; type: "info" | "warn" | "error" | "success" }>>([]);

  // D. Calculate dynamic topology center to focus 3D scene correctly
  const centerCoords = useMemo(() => {
    if (nodes.length === 0) return { x: 0, y: 0 };
    const sumX = nodes.reduce((sum, n) => sum + n.x, 0);
    const sumY = nodes.reduce((sum, n) => sum + n.y, 0);
    return {
      x: sumX / nodes.length,
      y: sumY / nodes.length,
    };
  }, [nodes]);

  // E. Map twins array for quick O(1) object lookup
  const twinLookup = useMemo(() => {
    const lookup: Record<string, TwinObject> = {};
    if (twinState && twinState.twins) {
      twinState.twins.forEach((twin) => {
        lookup[twin.configId] = twin;
      });
    }
    return lookup;
  }, [twinState]);

  // Selected Object Node & Mapped Twin Status
  const selectedNode = useMemo(() => {
    return nodes.find((n) => n.id === selectedNodeId) || null;
  }, [nodes, selectedNodeId]);

  const selectedTwin = useMemo(() => {
    if (!selectedNode || !selectedNode.configId) return null;
    return twinLookup[selectedNode.configId] || null;
  }, [selectedNode, twinLookup]);

  // F. Push network events into mock logger whenever live state changes
  useEffect(() => {
    if (!twinState) return;

    const timeStr = new Date().toLocaleTimeString();
    
    // Pick one active twin node to simulate traffic logs
    const activeTwins = twinState.twins;
    if (activeTwins.length > 0) {
      const idx = Math.floor(Math.random() * activeTwins.length);
      const twin = activeTwins[idx];
      let logType: "info" | "warn" | "error" | "success" = "success";
      let logMsg = `Gateway routed request to [${twin.name}] with status code 200`;

      if (twin.status === "down") {
        logType = "error";
        logMsg = `ALERT: Connect timeout on endpoint [${twin.name}] - Target Host Down`;
      } else if (twin.status === "degraded") {
        logType = "warn";
        logMsg = `WARN: Performance degraded on [${twin.name}] - Latency exceeded ${twin.latencyMs}ms`;
      } else if (twin.trend === "recovering") {
        logType = "info";
        logMsg = `INFO: Traffic load balancing on [${twin.name}] - Connection recovering`;
      }

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMockLogs((prev) => [
        { time: timeStr, msg: logMsg, type: logType },
        ...prev.slice(0, 14), // Cap logs list size
      ]);
    }
  }, [twinState]);

  const handleResetCamera = () => {
    if (orbitRef.current) {
      orbitRef.current.reset();
      toast.info("Camera view centered");
    }
  };

  const getLucideIcon = (type: NodeType) => {
    switch (type) {
      case NodeType.SERVICE: return <Cpu className="h-4 w-4" />;
      case NodeType.DATABASE: return <Database className="h-4 w-4" />;
      case NodeType.CDN: return <Radio className="h-4 w-4" />;
      case NodeType.GATEWAY: return <Server className="h-4 w-4" />;
      case NodeType.EXTERNAL: return <Cloud className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  const isLoaded = !isTopologyLoading;

  return (
    <div className={`relative w-full flex flex-col xl:flex-row gap-5 h-180 border border-border/40 rounded-2xl overflow-hidden bg-card/15 shadow-sm ${className}`}>
      
      {/* 1. LEFT TOOLBAR: NAVIGATION CONTROL & SETTINGS */}
      <div className="flex xl:flex-col gap-4 p-4 bg-muted/20 border-b xl:border-b-0 xl:border-r border-border/40 shrink-0 w-full xl:w-72 justify-between xl:justify-start">
        <div className="space-y-4 w-full">
          <div>
            <Typography variant="h6" className="text-sm font-bold flex items-center gap-2">
              <Layers className="h-4.5 w-4.5 text-primary animate-pulse" />
              Digital Twin Virtualizer
            </Typography>
            <Typography variant="caption" className="text-xs text-muted-foreground/60">
              Live WebGL status synchronizer.
            </Typography>
          </div>

          {/* Quick Metrics */}
          <div className="p-3.5 rounded-xl border border-border/30 bg-card/45 space-y-2.5">
            <Typography className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 block">
              Gateway Metadata
            </Typography>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground/70">Socket State:</span>
                {isConnected ? (
                  <Badge variant="outline" className="px-2 py-0 border-emerald-500/20 text-emerald-500 bg-emerald-500/5 font-bold text-[9px] uppercase tracking-wider flex items-center gap-1">
                    <Wifi className="h-3 w-3" /> Live
                  </Badge>
                ) : (
                  <Badge variant="outline" className="px-2 py-0 border-destructive/20 text-destructive bg-destructive/5 font-bold text-[9px] uppercase tracking-wider flex items-center gap-1 animate-pulse">
                    <WifiOff className="h-3 w-3" /> Offline
                  </Badge>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground/70">Topology Objects:</span>
                <span className="font-semibold text-foreground/90">{nodes.length} nodes</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground/70">Uptime Average:</span>
                <span className="font-bold text-foreground/90">
                  {twinState && twinState.twins.length > 0
                    ? `${(twinState.twins.reduce((acc, t) => acc + t.uptimePercent, 0) / twinState.twins.length).toFixed(2)}%`
                    : "100.00%"
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-3.5 pt-2 border-t border-border/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground/80 flex items-center gap-1.5">
                {showLabels ? <Eye className="h-3.5 w-3.5 text-primary/70" /> : <EyeOff className="h-3.5 w-3.5 text-muted-foreground/60" />}
                Render Node Labels
              </span>
              <Switch checked={showLabels} onCheckedChange={setShowLabels} id="label-switch" />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground/80 flex items-center gap-1.5">
                <Zap className={`h-3.5 w-3.5 ${!lowPowerMode ? "text-primary/70 animate-bounce" : "text-muted-foreground/60"}`} />
                Dynamic Particles
              </span>
              <Switch checked={!lowPowerMode} onCheckedChange={(val) => setLowPowerMode(!val)} id="power-switch" />
            </div>
          </div>
        </div>

        <div className="xl:mt-auto w-full pt-4 border-t border-border/20">
          <Button
            size="sm"
            variant="outline"
            className="w-full h-8 text-xs font-medium text-foreground hover:bg-muted gap-2"
            onClick={handleResetCamera}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Camera
          </Button>
        </div>
      </div>

      {/* 2. R3F VIEWPORT CANVAS */}
      <div className="flex-1 relative overflow-hidden bg-[#05070a] border border-border/30 rounded-xl">
        
        {/* Connection status overlay badge */}
        {!isConnected && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-xs">
            <div className="flex flex-col items-center gap-2 p-6 bg-slate-900 border border-white/10 rounded-2xl text-center shadow-2xl max-w-xs">
              <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-1" />
              <Typography variant="span" className="text-xs font-bold text-white block">
                Connecting to Digital Twin Socket Gateway...
              </Typography>
              <Typography variant="caption" className="text-[10px] text-muted-foreground/70">
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

        {/* 3D CANVAS */}
        {isLoaded && (
          <Canvas camera={{ position: [0, 6, 8], fov: 45 }} shadows className="w-full h-full cursor-grab active:cursor-grabbing">
            {/* Ambient Background Light */}
            <ambientLight intensity={0.4} />
            
            {/* Main Directional Shadow-Casting Light */}
            <directionalLight 
              position={[10, 18, 10]} 
              intensity={0.7} 
              castShadow 
              shadow-mapSize-width={1024} 
              shadow-mapSize-height={1024}
            />
            
            {/* Grid Floor */}
            <gridHelper args={[60, 60, "#1e293b", "#0f172a"]} position={[0, -0.6, 0]} />

            {/* Orbit Camera controls */}
            <OrbitControls 
              ref={orbitRef}
              maxPolarAngle={Math.PI / 2.1} 
              minDistance={2} 
              maxDistance={22} 
            />

            {/* RENDER NODES */}
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

            {/* RENDER EDGES WITH FLOWING DATA PARTICLES */}
            {edges.map((edge) => {
              const source = nodes.find((n) => n.id === edge.sourceId);
              const target = nodes.find((n) => n.id === edge.targetId);
              if (!source || !target) return null;

              // Scale coordinates to fit WebGL spatial coordinates
              const x1 = (source.x - centerCoords.x) / 100;
              const z1 = (source.y - centerCoords.y) / 100;
              const x2 = (target.x - centerCoords.x) / 100;
              const z2 = (target.y - centerCoords.y) / 100;

              // Determine traffic status from target/destination twin status
              const targetTwin = target.configId ? twinLookup[target.configId] : null;
              const connectionStatus = targetTwin ? targetTwin.status : "up";

              let strokeColor = "#1e293b"; // Muted dark line
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
                  {/* Connection Cable Mesh Line */}
                  <Line
                    points={[[x1, 0, z1], [x2, 0, z2]]}
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

        {/* Spatial control tips overlay */}
        <div className="absolute bottom-4 left-4 z-10 text-[9px] font-semibold text-muted-foreground/60 bg-black/60 px-3 py-1.5 border border-white/5 rounded-lg select-none pointer-events-none space-y-0.5">
          <div>🖱️ Drag: Rotate View</div>
          <div>🖱️ Right-Click + Drag: Pan View</div>
          <div>🖱️ Scroll: Zoom View</div>
        </div>
      </div>

      {/* 3. RIGHT SIDEBAR: DIGITAL TWIN TELEMETRY HUD */}
      <div className="p-4 bg-muted/10 border-t xl:border-t-0 xl:border-l border-border/40 shrink-0 w-full xl:w-80 flex flex-col gap-4 overflow-y-auto">
        <Typography variant="h6" className="text-sm font-bold border-b border-border/20 pb-2">
          Twin Telemetry HUD
        </Typography>

        {/* Node detail dashboard */}
        {selectedNode ? (
          <div className="space-y-4 flex-1 flex flex-col">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-card flex items-center gap-1 text-foreground/80 border-border/30">
                {getLucideIcon(selectedNode.nodeType)}
                {selectedNode.nodeType}
              </Badge>
              {selectedTwin && (
                <Badge 
                  variant="outline" 
                  className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest border-none ${
                    selectedTwin.status === "up" ? "bg-emerald-500/10 text-emerald-500" :
                    selectedTwin.status === "degraded" ? "bg-amber-500/10 text-amber-500" :
                    selectedTwin.status === "down" ? "bg-red-500/10 text-red-500 animate-pulse" :
                    "bg-slate-500/10 text-slate-500"
                  }`}
                >
                  {selectedTwin.status}
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <Typography className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider block">
                Infrastructure Info
              </Typography>
              <div className="space-y-1.5 bg-slate-950/40 border border-border/25 rounded-xl p-3.5 text-xs text-foreground/80">
                <div className="flex justify-between">
                  <span className="text-muted-foreground/60">Node Name:</span>
                  <span className="font-semibold">{selectedNode.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground/60">Database ID:</span>
                  <span className="font-mono text-[10px] text-muted-foreground/80 select-all">{selectedNode.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground/60">Mapped Config:</span>
                  <span className="font-medium text-foreground/75">
                    {selectedNode.configId ? "Connected Config" : "Not Mapped"}
                  </span>
                </div>
              </div>
            </div>

            {/* Mapped Live Telemetry Details */}
            {selectedNode.configId ? (
              selectedTwin ? (
                <div className="space-y-4 flex-1">
                  <div className="space-y-2">
                    <Typography className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider block">
                      Live Telemetry Metrics
                    </Typography>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {/* Health Indicator Card */}
                      <div className="p-3 bg-slate-950/45 border border-border/20 rounded-xl space-y-1">
                        <span className="text-muted-foreground/50 text-[10px] block">Health Score:</span>
                        <div className="flex items-center gap-1.5">
                          <Activity className={`h-4 w-4 ${
                            selectedTwin.twinHealth > 85 ? "text-emerald-400" :
                            selectedTwin.twinHealth > 60 ? "text-amber-400" : "text-red-400 animate-pulse"
                          }`} />
                          <span className="text-sm font-bold">{selectedTwin.twinHealth}%</span>
                        </div>
                      </div>

                      {/* Performance Trend Card */}
                      <div className="p-3 bg-slate-950/45 border border-border/20 rounded-xl space-y-1">
                        <span className="text-muted-foreground/50 text-[10px] block">Flow Trend:</span>
                        <div className="flex items-center gap-1.5 font-semibold">
                          {selectedTwin.trend === "stable" ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                              <span className="text-xs text-foreground/80 capitalize">{selectedTwin.trend}</span>
                            </>
                          ) : selectedTwin.trend === "recovering" ? (
                            <>
                              <TrendingUp className="h-4 w-4 text-emerald-400" />
                              <span className="text-xs text-foreground/80 capitalize">{selectedTwin.trend}</span>
                            </>
                          ) : (
                            <>
                              <TrendingDown className="h-4 w-4 text-destructive" />
                              <span className="text-xs text-destructive capitalize">{selectedTwin.trend}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 text-xs">
                      {/* Latency */}
                      <div className="bg-slate-950/45 border border-border/20 rounded-xl p-3 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground/60">Live Response Latency:</span>
                          <span className="font-bold text-foreground">{selectedTwin.latencyMs} ms</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px] pt-1.5 border-t border-white/5">
                          <span className="text-muted-foreground/55">Avg Response Latency:</span>
                          <span className="font-semibold text-muted-foreground/80">{selectedTwin.avgLatencyMs} ms</span>
                        </div>
                      </div>

                      {/* Uptime and Incidents */}
                      <div className="bg-slate-950/45 border border-border/20 rounded-xl p-3 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground/60">Uptime Percent:</span>
                          <span className="font-bold text-foreground">{selectedTwin.uptimePercent.toFixed(3)}%</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px] pt-1.5 border-t border-white/5">
                          <span className="text-muted-foreground/55">Outage Incidents:</span>
                          <span className="font-bold text-destructive/80 flex items-center gap-1">
                            {selectedTwin.downtimeIncidents > 0 && <ShieldAlert className="h-3 w-3" />}
                            {selectedTwin.downtimeIncidents} failures
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-border/40 text-center space-y-2 my-auto">
                  <Activity className="h-6 w-6 text-muted-foreground/40 mx-auto" />
                  <Typography variant="caption" className="text-xs text-muted-foreground/60 block leading-relaxed">
                    Mapped config target has not emitted telemetry data yet. Waiting for WebSocket handshake payload...
                  </Typography>
                </div>
              )
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-border/40 text-center space-y-2 my-auto">
                <Info className="h-6 w-6 text-primary/40 mx-auto" />
                <Typography variant="caption" className="text-xs text-muted-foreground/60 block leading-relaxed">
                  This node is an unmonitored internal infrastructure node. Match it to a Website Monitoring Config in the Topology editor to stream live socket metrics.
                </Typography>
              </div>
            )}

            <Button
              size="xs"
              variant="ghost"
              className="w-full text-center text-xs text-muted-foreground/70 hover:text-foreground mt-auto"
              onClick={() => setSelectedNodeId(null)}
            >
              Clear Inspector Selection
            </Button>
          </div>
        ) : (
          /* HUD LOGGER OVERVIEW */
          <div className="space-y-4 flex-1 flex flex-col h-full min-h-0">
            <div className="space-y-2">
              <Typography className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider block">
                Network Gateway Logs
              </Typography>
              <div className="flex flex-col gap-1.5 max-h-80 xl:max-h-none overflow-y-auto pr-1">
                {mockLogs.length > 0 ? (
                  mockLogs.map((log, idx) => (
                    <div key={idx} className="flex gap-2 text-[10.5px] border-b border-white/5 pb-1.5 leading-relaxed font-mono">
                      <span className="text-muted-foreground/50 shrink-0">[{log.time}]</span>
                      <span className={`flex-1 break-all ${
                        log.type === "error" ? "text-red-400 font-bold" :
                        log.type === "warn" ? "text-amber-400 font-medium" :
                        log.type === "info" ? "text-blue-400" : "text-emerald-400"
                      }`}>
                        {log.msg}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-[10.5px] text-muted-foreground/45 italic">
                    Listening for active gateway flow signals...
                  </div>
                )}
              </div>
            </div>

            <div className="text-center py-6 text-xs text-muted-foreground/50 border-t border-border/25 mt-auto">
              <Info className="h-4.5 w-4.5 text-muted-foreground/40 mx-auto mb-1.5" />
              Click any 3D node element in the canvas viewport to inspect its live socket telemetry variables.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
