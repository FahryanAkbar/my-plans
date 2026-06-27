import { useState, useEffect, useMemo, useRef } from "react";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { toast } from "sonner";
import { 
  useNetworkTopology, 
  useDigitalTwin 
} from "@/hooks";
import { NetworkNode, TwinObject } from "@/types/features";

export interface TelemetryLog {
  time: string;
  msg: string;
  type: "info" | "warn" | "error" | "success";
}

export function useDigitalTwinCanvas(projectId: string) {
  // A. Fetch Static Topology Map & Live State
  const { nodes, edges, isLoading: isTopologyLoading } = useNetworkTopology(projectId);
  const { state: twinState, isConnected } = useDigitalTwin(projectId);

  // B. Control States
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showLabels, setShowLabels] = useState(true);
  const [lowPowerMode, setLowPowerMode] = useState(false);
  const orbitRef = useRef<OrbitControlsImpl | null>(null);

  // C. Local Telemetry Log Mock
  const [mockLogs, setMockLogs] = useState<TelemetryLog[]>([]);

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

  const isLoaded = !isTopologyLoading;

  const averageUptime = useMemo(() => {
    if (twinState && twinState.twins.length > 0) {
      const avg = twinState.twins.reduce((acc, t) => acc + t.uptimePercent, 0) / twinState.twins.length;
      return `${avg.toFixed(2)}%`;
    }
    return "100.00%";
  }, [twinState]);

  return {
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
  };
}
