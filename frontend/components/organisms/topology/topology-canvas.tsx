"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import {
  Cpu,
  Database,
  Globe,
  Radio,
  Network,
  Zap,
  Server,
  Cloud,
  ExternalLink,
  Plus,
  Trash2,
  Play,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Lock,
  Unlock,
  Link as LinkIcon,
  X,
  AlertTriangle,
  Info,
  CheckCircle,
  HelpCircle,
  Eye,
  Activity
} from "lucide-react";
import {
  Button,
  Typography,
  Switch,
  Badge,
} from "@/components/atoms";
import {
  useNetworkTopology,
  useTopologyImpactAnalysis,
  useProjectConfigs,
} from "@/hooks";
import { NodeType, RelationType, NetworkNode, NetworkEdge } from "@/types/features";

interface TopologyCanvasProps {
  projectId: string;
  className?: string;
}

export function TopologyCanvas({ projectId, className }: TopologyCanvasProps) {
  // 1. API Hooks
  const {
    nodes,
    edges,
    isLoading: isTopologyLoading,
    error: topologyError,
    createNode,
    updateNode,
    deleteNode,
    createEdge,
    deleteEdge,
    refetch: refetchTopology
  } = useNetworkTopology(projectId);

  const {
    simulateImpact,
    clearSimulation,
    impactResult,
    isLoading: isSimulationLoading
  } = useTopologyImpactAnalysis(projectId);

  const { configs, isLoading: isConfigsLoading } = useProjectConfigs(projectId);

  // 2. Local State
  const [localNodes, setLocalNodes] = useState<NetworkNode[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  // Zoom & Pan state
  const [pan, setPan] = useState({ x: 50, y: 50 });
  const [scale, setScale] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Dragging state
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Interactive Connection Mode
  const [connectingSourceId, setConnectingSourceId] = useState<string | null>(null);

  // Simulation animation state
  const [activeSimulation, setActiveSimulation] = useState<{
    sourceNodeId: string;
    impactedNodeIds: Set<string>;
    nodesByDepth: Record<number, string[]>;
    maxDepth: number;
    currentAnimatedDepth: number;
  } | null>(null);

  // CRUD Dialog Modals
  const [showAddNodeModal, setShowAddNodeModal] = useState(false);
  const [showAddEdgeModal, setShowAddEdgeModal] = useState(false);

  // Form states
  const [newNodeName, setNewNodeName] = useState("");
  const [newNodeType, setNewNodeType] = useState<NodeType>(NodeType.SERVICE);
  const [newNodeConfigId, setNewNodeConfigId] = useState<string>("");

  const [newEdgeSourceId, setNewEdgeSourceId] = useState("");
  const [newEdgeTargetId, setNewEdgeTargetId] = useState("");
  const [newEdgeRelation, setNewEdgeRelation] = useState<RelationType>(RelationType.DEPENDS_ON);

  // Node dimension constants (for connection line offsets)
  const NODE_WIDTH = 190;
  const NODE_HEIGHT = 80;

  const containerRef = useRef<HTMLDivElement>(null);

  // Sync backend nodes to localNodes
  useEffect(() => {
    setLocalNodes(nodes);
  }, [nodes]);

  // Clean up simulation if component unmounts
  useEffect(() => {
    return () => {
      clearSimulation();
    };
  }, [clearSimulation]);

  // Trigger cascade animation when simulation impactResult is received
  useEffect(() => {
    if (impactResult && selectedNodeId) {
      const sourceNode = localNodes.find(
        n =>
          n.id === impactResult.sourceNodeId ||
          n.configId === impactResult.sourceNodeId ||
          n.id === selectedNodeId
      );
      const sourceId = sourceNode ? sourceNode.id : selectedNodeId;

      // Group impacted nodes by depth
      const nodesByDepth: Record<number, string[]> = {};
      let maxDepth = 0;

      impactResult.impactedNodes.forEach((item) => {
        // Find local node representing this impacted node
        const localNode = localNodes.find(n => n.id === item.nodeId || (n.configId && n.configId === item.nodeId));
        if (localNode) {
          if (!nodesByDepth[item.depth]) {
            nodesByDepth[item.depth] = [];
          }
          nodesByDepth[item.depth].push(localNode.id);
          if (item.depth > maxDepth) {
            maxDepth = item.depth;
          }
        }
      });

      setActiveSimulation({
        sourceNodeId: sourceId,
        impactedNodeIds: new Set<string>(),
        nodesByDepth,
        maxDepth,
        currentAnimatedDepth: -1,
      });
    }
  }, [impactResult, localNodes, selectedNodeId]);

  // Animate BFS cascading depths
  useEffect(() => {
    if (!activeSimulation) return;

    if (activeSimulation.currentAnimatedDepth < activeSimulation.maxDepth) {
      const nextDepth = activeSimulation.currentAnimatedDepth + 1;
      const timer = setTimeout(() => {
        setActiveSimulation(prev => {
          if (!prev) return null;
          const nextImpacted = new Set(prev.impactedNodeIds);
          
          // Add all nodes at nextDepth
          if (prev.nodesByDepth[nextDepth]) {
            prev.nodesByDepth[nextDepth].forEach(id => nextImpacted.add(id));
          }

          return {
            ...prev,
            impactedNodeIds: nextImpacted,
            currentAnimatedDepth: nextDepth
          };
        });
      }, 700); // 700ms cascade delay per depth

      return () => clearTimeout(timer);
    }
  }, [activeSimulation]);

  // 3. Canvas Handlers (Pan & Zoom)
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const zoomFactor = 1.08;
    const newScale = e.deltaY < 0 ? scale * zoomFactor : scale / zoomFactor;
    setScale(Math.max(0.3, Math.min(newScale, 2.5)));
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Left click on canvas background initiates panning
    if (e.button === 0) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (draggedNodeId && !isLocked) {
      const container = containerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        // Translate client mouse coordinates into canvas coordinates
        const x = Math.round((e.clientX - rect.left - pan.x) / scale - dragOffset.x);
        const y = Math.round((e.clientY - rect.top - pan.y) / scale - dragOffset.y);
        
        // Keep within reasonable boundaries
        const boundedX = Math.max(10, Math.min(x, 4000));
        const boundedY = Math.max(10, Math.min(y, 4000));

        setLocalNodes(prev =>
          prev.map(n => n.id === draggedNodeId ? { ...n, x: boundedX, y: boundedY } : n)
        );
      }
    } else if (isPanning) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleCanvasMouseUp = async () => {
    if (draggedNodeId && !isLocked) {
      const node = localNodes.find(n => n.id === draggedNodeId);
      if (node) {
        try {
          await updateNode(node.id, { x: node.x, y: node.y });
          toast.success(`Updated coordinates for ${node.label}`);
        } catch (err) {
          console.error(err);
        }
      }
      setDraggedNodeId(null);
    }
    setIsPanning(false);
  };

  const handleNodeMouseDown = (e: React.MouseEvent, node: NetworkNode) => {
    e.stopPropagation();
    if (isLocked) {
      setSelectedNodeId(node.id);
      setSelectedEdgeId(null);
      return;
    }

    if (connectingSourceId) {
      // Connect source to clicked target
      if (connectingSourceId !== node.id) {
        handleCreateEdgeInteractive(connectingSourceId, node.id);
      }
      setConnectingSourceId(null);
      return;
    }

    setSelectedNodeId(node.id);
    setSelectedEdgeId(null);
    setDraggedNodeId(node.id);

    // Calculate mouse click offset relative to node origin
    const container = containerRef.current;
    if (container) {
      const rect = container.getBoundingClientRect();
      const nodeCanvasX = node.x * scale + pan.x;
      const nodeCanvasY = node.y * scale + pan.y;
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      
      setDragOffset({
        x: (clickX - nodeCanvasX) / scale,
        y: (clickY - nodeCanvasY) / scale
      });
    }
  };

  // Zoom control helpers
  const zoomIn = () => setScale(s => Math.min(s * 1.2, 2.5));
  const zoomOut = () => setScale(s => Math.max(s / 1.2, 0.3));
  const resetView = () => {
    setPan({ x: 80, y: 80 });
    setScale(0.9);
  };

  // 4. API Event Wrappers
  const handleCreateNodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeName.trim()) {
      toast.error("Node label is required");
      return;
    }

    // Default coordinates based on pan offset to appear near center
    const x = Math.round((-pan.x + 300) / scale);
    const y = Math.round((-pan.y + 200) / scale);

    try {
      const requestData = {
        label: newNodeName,
        nodeType: newNodeType,
        configId: newNodeConfigId || undefined,
        x: Math.max(50, x),
        y: Math.max(50, y),
      };
      await createNode(requestData);
      setShowAddNodeModal(false);
      setNewNodeName("");
      setNewNodeConfigId("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateEdgeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEdgeSourceId || !newEdgeTargetId) {
      toast.error("Source and target nodes are required");
      return;
    }
    if (newEdgeSourceId === newEdgeTargetId) {
      toast.error("Cannot connect a node to itself");
      return;
    }

    try {
      await createEdge({
        sourceId: newEdgeSourceId,
        targetId: newEdgeTargetId,
        relationType: newEdgeRelation
      });
      setShowAddEdgeModal(false);
      setNewEdgeSourceId("");
      setNewEdgeTargetId("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateEdgeInteractive = async (sourceId: string, targetId: string) => {
    // Check if edge already exists
    const exists = edges.some(
      e => (e.sourceId === sourceId && e.targetId === targetId) || 
           (e.sourceId === targetId && e.targetId === sourceId)
    );
    if (exists) {
      toast.info("A connection already exists between these nodes");
      return;
    }

    try {
      await createEdge({
        sourceId,
        targetId,
        relationType: RelationType.DEPENDS_ON
      });
      toast.success("Created new connection relation");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNode = async (nodeId: string) => {
    if (confirm("Are you sure you want to delete this node? This will also remove any connection edges.")) {
      try {
        await deleteNode(nodeId);
        if (selectedNodeId === nodeId) {
          setSelectedNodeId(null);
        }
        if (connectingSourceId === nodeId) {
          setConnectingSourceId(null);
        }
        // If simulation was active, stop it
        if (activeSimulation) {
          handleStopSimulation();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDeleteEdge = async (edgeId: string) => {
    if (confirm("Are you sure you want to delete this connection?")) {
      try {
        await deleteEdge(edgeId);
        if (selectedEdgeId === edgeId) {
          setSelectedEdgeId(null);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // 5. BFS Simulation Trigger
  const handleStartSimulation = async (node: NetworkNode) => {
    if (!node.configId) {
      toast.error("Simulation requires this node to be mapped to a Monitoring Config");
      return;
    }

    try {
      toast.loading("Simulating impact analysis...", { id: "sim-load" });
      await simulateImpact(node.configId);
      toast.dismiss("sim-load");
      toast.success(`Simulation active: Failure of ${node.label}`);
    } catch (err) {
      toast.dismiss("sim-load");
      console.error(err);
    }
  };

  const handleStopSimulation = () => {
    clearSimulation();
    setActiveSimulation(null);
    toast.info("Simulation stopped");
  };

  // Helper: check if a node is currently simulated as failed
  const isNodeSimulatedFailed = (nodeId: string) => {
    if (!activeSimulation) return false;
    return activeSimulation.sourceNodeId === nodeId;
  };

  // Helper: check if a node is currently simulated as impacted by failure
  const isNodeSimulatedImpacted = (nodeId: string) => {
    if (!activeSimulation) return false;
    return activeSimulation.impactedNodeIds.has(nodeId);
  };

  // Helper: check if edge connects failure path
  const isEdgeSimulatedImpacted = (edge: NetworkEdge) => {
    if (!activeSimulation) return false;
    // An edge is impacted if the source node is failed/impacted AND target node is failed/impacted
    const sourceImpacted = edge.sourceId === activeSimulation.sourceNodeId || activeSimulation.impactedNodeIds.has(edge.sourceId);
    const targetImpacted = edge.targetId === activeSimulation.sourceNodeId || activeSimulation.impactedNodeIds.has(edge.targetId);
    return sourceImpacted && targetImpacted;
  };

  // Render node icon helper
  const getNodeIcon = (type: NodeType, sizeClass = "h-5 w-5") => {
    switch (type) {
      case NodeType.SERVICE:
        return <Cpu className={sizeClass} />;
      case NodeType.DATABASE:
        return <Database className={sizeClass} />;
      case NodeType.CDN:
        return <Radio className={sizeClass} />;
      case NodeType.GATEWAY:
        return <Network className={sizeClass} />;
      case NodeType.EXTERNAL:
        return <Cloud className={sizeClass} />;
      default:
        return <Server className={sizeClass} />;
    }
  };

  // Render type node custom CSS styling
  const getNodeBorderColor = (node: NetworkNode) => {
    const isSelected = selectedNodeId === node.id;
    const isFailed = isNodeSimulatedFailed(node.id);
    const isImpacted = isNodeSimulatedImpacted(node.id);

    if (isFailed) return "border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.7)] animate-pulse";
    if (isImpacted) return "border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.65)]";
    if (isSelected) return "border-primary shadow-[0_0_12px_rgba(67,97,238,0.4)]";

    switch (node.nodeType) {
      case NodeType.GATEWAY:
        return "border-sky-500/50 hover:border-sky-400";
      case NodeType.DATABASE:
        return "border-emerald-500/50 hover:border-emerald-400";
      case NodeType.CDN:
        return "border-purple-500/50 hover:border-purple-400";
      case NodeType.EXTERNAL:
        return "border-pink-500/50 hover:border-pink-400";
      default:
        return "border-neutral-500/50 hover:border-neutral-400";
    }
  };

  const getNodeBgColor = (node: NetworkNode) => {
    const isFailed = isNodeSimulatedFailed(node.id);
    const isImpacted = isNodeSimulatedImpacted(node.id);

    if (isFailed) return "bg-red-500/10 backdrop-blur-md";
    if (isImpacted) return "bg-amber-500/10 backdrop-blur-md";

    switch (node.nodeType) {
      case NodeType.GATEWAY:
        return "bg-sky-500/5 backdrop-blur-md";
      case NodeType.DATABASE:
        return "bg-emerald-500/5 backdrop-blur-md";
      case NodeType.CDN:
        return "bg-purple-500/5 backdrop-blur-md";
      case NodeType.EXTERNAL:
        return "bg-pink-500/5 backdrop-blur-md";
      default:
        return "bg-card/90 backdrop-blur-md";
    }
  };

  const getNodeTextColor = (node: NetworkNode) => {
    const isFailed = isNodeSimulatedFailed(node.id);
    const isImpacted = isNodeSimulatedImpacted(node.id);
    if (isFailed) return "text-red-400";
    if (isImpacted) return "text-amber-400";
    return "text-foreground";
  };

  // Get coordinates for drawing bezier connections
  const getConnectionCoords = (sourceId: string, targetId: string) => {
    const sourceNode = localNodes.find(n => n.id === sourceId);
    const targetNode = localNodes.find(n => n.id === targetId);

    if (!sourceNode || !targetNode) return null;

    // Anchor points: Center of nodes
    const x1 = sourceNode.x + NODE_WIDTH / 2;
    const y1 = sourceNode.y + NODE_HEIGHT / 2;
    const x2 = targetNode.x + NODE_WIDTH / 2;
    const y2 = targetNode.y + NODE_HEIGHT / 2;

    return { x1, y1, x2, y2 };
  };

  const selectedNode = localNodes.find(n => n.id === selectedNodeId);
  const selectedEdge = edges.find(e => e.id === selectedEdgeId);

  return (
    <div className={`relative w-full flex flex-col xl:flex-row gap-5 h-[700px] border border-border/40 rounded-2xl overflow-hidden bg-card/20 shadow-sm ${className}`}>
      
      {/* Dynamic CSS for neon flows and animated dash lines */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes dash {
          to {
            stroke-dashoffset: -40;
          }
        }
        .flow-edge-animate {
          animation: dash 1.5s linear infinite;
        }
        .flow-edge-animate-danger {
          animation: dash 0.5s linear infinite;
        }
      `}} />

      {/* LEFT SIDEBAR: TOPOLOGY CONTROLS */}
      <div className="flex xl:flex-col gap-3 p-4 bg-muted/20 border-b xl:border-b-0 xl:border-r border-border/40 shrink-0 w-full xl:w-72 justify-between xl:justify-start">
        <div className="space-y-4 w-full">
          <div>
            <Typography variant="h6" className="text-sm font-bold flex items-center gap-2">
              <Network className="h-4.5 w-4.5 text-primary" />
              Infrastructure Topology
            </Typography>
            <Typography variant="caption" className="text-xs text-muted-foreground/60">
              Interactive node dependency mapper.
            </Typography>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 text-xs text-foreground/80 hover:bg-muted"
              onClick={() => {
                setNewNodeConfigId("");
                setShowAddNodeModal(true);
              }}
              disabled={isTopologyLoading}
            >
              <Plus className="h-3.5 w-3.5" />
              Add Node
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 text-xs text-foreground/80 hover:bg-muted"
              onClick={() => setShowAddEdgeModal(true)}
              disabled={localNodes.length < 2 || isTopologyLoading}
            >
              <LinkIcon className="h-3.5 w-3.5" />
              Add Link
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="hidden xl:block p-3.5 rounded-xl border border-border/30 bg-card/40 space-y-2">
            <Typography variant="caption" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 block">
              Network Metadata
            </Typography>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="space-y-0.5">
                <span className="text-muted-foreground/60 block">Total Nodes:</span>
                <span className="font-semibold text-foreground/90">{localNodes.length}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-muted-foreground/60 block">Dependencies:</span>
                <span className="font-semibold text-foreground/90">{edges.length}</span>
              </div>
            </div>
          </div>

          {/* Guide Overlay */}
          <div className="hidden xl:block text-xs space-y-2 text-muted-foreground/80 p-3 rounded-lg bg-muted/40 border border-border/20">
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">
              <HelpCircle className="h-3.5 w-3.5" /> Quick Guide
            </div>
            <ul className="list-disc pl-4 space-y-1 text-[11px]">
              <li>Drag nodes to move (Save coordinates).</li>
              <li>Hover connectors and click to link nodes.</li>
              <li>Click node/edge to manage properties.</li>
              <li>Simulate system outages in Node details.</li>
            </ul>
          </div>
        </div>

        {/* Action Controls & Layout locking */}
        <div className="xl:mt-auto space-y-3 w-full border-t border-border/20 pt-4 hidden xl:block">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground/80 flex items-center gap-1.5">
              {isLocked ? <Lock className="h-3.5 w-3.5 text-muted-foreground/60" /> : <Unlock className="h-3.5 w-3.5 text-primary/70" />}
              Lock Positions
            </span>
            <Switch
              checked={isLocked}
              onCheckedChange={setIsLocked}
              id="lock-switch"
            />
          </div>
          
          <div className="flex justify-between items-center gap-1">
            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground" onClick={zoomIn} title="Zoom In">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground" onClick={zoomOut} title="Zoom Out">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground" onClick={resetView} title="Reset view">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* CANVAS VIEWPORT AREA */}
      <div 
        ref={containerRef}
        className="flex-1 relative overflow-hidden bg-[#0a0c10] border border-border/30 rounded-xl cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
        onWheel={handleWheel}
      >
        {/* Canvas Grid Background */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)`,
            backgroundSize: `${32 * scale}px ${32 * scale}px`,
            backgroundPosition: `${pan.x}px ${pan.y}px`,
          }}
        />

        {/* Simulation Floating Banner */}
        {activeSimulation && (
          <div className="absolute top-4 left-4 z-20 flex items-center gap-3 px-4 py-2 border border-red-500/30 bg-red-500/10 rounded-xl backdrop-blur-md animate-pulse">
            <Activity className="h-4 w-4 text-red-500" />
            <Typography variant="span" className="text-xs font-semibold text-red-400">
              Simulation Active: Failure Outage
            </Typography>
            <Button
              size="xs"
              variant="outline"
              className="h-6 text-[10px] text-red-400 border-red-500/20 hover:bg-red-500 hover:text-white font-medium"
              onClick={handleStopSimulation}
            >
              Stop Sim
            </Button>
          </div>
        )}

        {/* Loading Spinner */}
        {isTopologyLoading && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/50 backdrop-blur-xs">
            <div className="flex flex-col items-center gap-2">
              <div className="h-7 w-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <Typography variant="caption" className="text-xs text-muted-foreground/80 font-medium">
                Fetching topology map...
              </Typography>
            </div>
          </div>
        )}

        {/* INNER SCALED CONTAINER */}
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transformOrigin: "0 0",
            width: "4000px",
            height: "4000px",
          }}
          className="absolute inset-0 transition-transform duration-75 ease-out pointer-events-none"
        >
          {/* SVG LINKS/EDGES LAYER */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
            <defs>
              {/* Arrow Markers */}
              <marker
                id="arrow-default"
                viewBox="0 0 10 10"
                refX="22" // Adjusted so it points just at the border of nodes
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#4B5563" />
              </marker>
              <marker
                id="arrow-selected"
                viewBox="0 0 10 10"
                refX="22"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#4361EE" />
              </marker>
              <marker
                id="arrow-danger"
                viewBox="0 0 10 10"
                refX="22"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#EF4444" />
              </marker>
            </defs>

            {/* Render Connection Edges */}
            {edges.map((edge) => {
              const coords = getConnectionCoords(edge.sourceId, edge.targetId);
              if (!coords) return null;

              const { x1, y1, x2, y2 } = coords;
              // Smooth bezier path curve
              const controlDist = Math.abs(x2 - x1) * 0.5;
              const pathD = `M ${x1} ${y1} C ${x1 + controlDist} ${y1}, ${x2 - controlDist} ${y2}, ${x2} ${y2}`;

              const isSelected = selectedEdgeId === edge.id;
              const isSimImpacted = isEdgeSimulatedImpacted(edge);

              let strokeColor = "#374151"; // Default dark grey
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
                <g key={edge.id} className="pointer-events-auto cursor-pointer">
                  {/* Invisible broad curve underneath to ease mouse click selection */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke="transparent"
                    strokeWidth={16}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEdgeId(edge.id);
                      setSelectedNodeId(null);
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
                      setSelectedEdgeId(edge.id);
                      setSelectedNodeId(null);
                    }}
                  />
                  {/* Glowing moving dashed dots animation representing active network flow */}
                  {isFlowing && (
                    <path
                      d={pathD}
                      fill="none"
                      stroke={isSimImpacted ? "#EF4444" : isSelected ? "#4361EE" : "#10B981"}
                      strokeWidth={1.5}
                      strokeDasharray="6, 12"
                      className={`pointer-events-none ${isSimImpacted ? "flow-edge-animate-danger" : "flow-edge-animate"}`}
                      opacity={isSimImpacted ? 0.95 : 0.6}
                    />
                  )}
                </g>
              );
            })}
          </svg>

          {/* RENDER ABSOLUTE NODE ELEMENTS */}
          {localNodes.map((node) => {
            const isSelected = selectedNodeId === node.id;
            const isFailed = isNodeSimulatedFailed(node.id);
            const isImpacted = isNodeSimulatedImpacted(node.id);

            // Find config metadata if mapped
            const config = configs.find(c => c.id === node.configId);

            return (
              <div
                key={node.id}
                style={{
                  left: `${node.x}px`,
                  top: `${node.y}px`,
                  width: `${NODE_WIDTH}px`,
                  height: `${NODE_HEIGHT}px`,
                }}
                className={`absolute z-10 p-3.5 border rounded-xl pointer-events-auto cursor-grab active:cursor-grabbing select-none flex flex-col justify-between transition-all duration-300 group ${getNodeBgColor(node)} ${getNodeBorderColor(node)}`}
                onMouseDown={(e) => handleNodeMouseDown(e, node)}
              >
                {/* Node Top Row: Icon + Label */}
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className={`p-1.5 rounded-lg shrink-0 ${isFailed ? "bg-red-500/20 text-red-400" : isImpacted ? "bg-amber-500/20 text-amber-400" : isSelected ? "bg-primary/20 text-primary-300" : "bg-muted text-muted-foreground"}`}>
                    {getNodeIcon(node.nodeType, "h-4 w-4")}
                  </div>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <Typography
                      variant="span"
                      className={`text-xs font-bold truncate block ${getNodeTextColor(node)}`}
                    >
                      {node.label}
                    </Typography>
                    <Typography
                      variant="caption"
                      className="text-[9px] font-semibold text-muted-foreground/60 block uppercase tracking-wider"
                    >
                      {node.nodeType}
                    </Typography>
                  </div>
                </div>

                {/* Node Bottom Row: Status Indicator / Config name */}
                <div className="flex items-center justify-between border-t border-border/20 pt-1.5 mt-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {config ? (
                      <>
                        <Globe className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                        <span className="text-[10px] text-muted-foreground/60 truncate max-w-[90px]" title={config.name}>
                          {config.name}
                        </span>
                      </>
                    ) : (
                      <span className="text-[10px] text-muted-foreground/40 italic">
                        Not linked
                      </span>
                    )}
                  </div>

                  {/* Connected Target Status Badge */}
                  {config ? (
                    <div className="flex items-center gap-1 shrink-0">
                      <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${isFailed ? "bg-red-500 animate-ping" : isImpacted ? "bg-amber-500" : config.enabled ? "bg-emerald-500" : "bg-neutral-500"}`} />
                      <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/50">
                        {isFailed ? "DOWN" : isImpacted ? "IMPACT" : config.enabled ? "LIVE" : "PAUSED"}
                      </span>
                    </div>
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-neutral-600/40 shrink-0" />
                  )}
                </div>

                {/* INTERACTIVE CONNECTOR BUTTONS */}
                {!isLocked && (
                  <>
                    <div 
                      className="absolute -right-2 top-1/2 -translate-y-1/2 h-4 w-4 bg-muted hover:bg-primary border border-border rounded-full flex items-center justify-center cursor-crosshair opacity-0 group-hover:opacity-100 transition-opacity z-20"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConnectingSourceId(node.id);
                        toast.info(`Click target node to connect dependencies from ${node.label}`);
                      }}
                      title="Link out dependency"
                    >
                      <Plus className="h-3 w-3 text-foreground" />
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT SIDEBAR: PROPERTIES & ACTION PANEL */}
      <div className="p-4 bg-muted/10 border-t xl:border-t-0 xl:border-l border-border/40 shrink-0 w-full xl:w-80 flex flex-col gap-4 overflow-y-auto">
        <Typography variant="h6" className="text-sm font-bold border-b border-border/20 pb-2">
          Inspector Detail
        </Typography>

        {/* Connecting Helper Status */}
        {connectingSourceId && (
          <div className="p-3 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between text-xs text-primary-300">
            <span className="flex items-center gap-2 font-medium">
              <LinkIcon className="h-4 w-4 animate-pulse" />
              Source node: {localNodes.find(n => n.id === connectingSourceId)?.label}
            </span>
            <button className="text-muted-foreground hover:text-foreground" onClick={() => setConnectingSourceId(null)}>
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* CASE A: Node Selected */}
        {selectedNode ? (
          <div className="space-y-4 flex-1 flex flex-col">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                {selectedNode.nodeType}
              </Badge>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => handleDeleteNode(selectedNode.id)}
                title="Delete Node"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Typography className="text-xs font-bold text-muted-foreground/60 uppercase tracking-wider block">
                Node Properties
              </Typography>
              <div className="space-y-1 bg-card/40 border border-border/20 rounded-xl p-3.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Label:</span>
                  <span className="font-semibold text-foreground/80">{selectedNode.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-semibold text-foreground/80 capitalize">{selectedNode.nodeType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Coordinates:</span>
                  <span className="font-mono font-medium text-foreground/75">
                    X:{selectedNode.x}, Y:{selectedNode.y}
                  </span>
                </div>
              </div>
            </div>

            {/* Monitoring config association */}
            <div className="space-y-2">
              <Typography className="text-xs font-bold text-muted-foreground/60 uppercase tracking-wider block">
                Mapped Website Config
              </Typography>
              <div className="bg-card/40 border border-border/20 rounded-xl p-3.5 text-xs">
                {selectedNode.configId ? (
                  (() => {
                    const cfg = configs.find(c => c.id === selectedNode.configId);
                    if (!cfg) return <span className="text-muted-foreground/50">Config id {selectedNode.configId} not found</span>;
                    return (
                      <div className="space-y-2">
                        <div className="flex justify-between font-semibold">
                          <span className="text-foreground/80 truncate block max-w-[140px]">{cfg.name}</span>
                          <span className={cfg.enabled ? "text-emerald-500" : "text-muted-foreground"}>
                            {cfg.enabled ? "Active" : "Paused"}
                          </span>
                        </div>
                        <div className="text-[11px] text-muted-foreground/60 truncate block" title={cfg.url}>
                          {cfg.url}
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-[10px] pt-1 text-muted-foreground/70 border-t border-border/10">
                          <span>Env: {cfg.environment}</span>
                          <span>Timeout: {cfg.timeout}ms</span>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className="text-center py-2 space-y-2">
                    <span className="text-muted-foreground/50 text-[11px] block">No website monitoring mapped.</span>
                  </div>
                )}
              </div>
            </div>

            {/* IMPACT SIMULATION SECTION */}
            <div className="mt-auto border-t border-border/20 pt-4 space-y-3">
              <Typography className="text-xs font-bold text-muted-foreground/60 uppercase tracking-wider block">
                Failure Simulation (BFS)
              </Typography>

              {selectedNode.configId ? (
                <div className="space-y-2">
                  <Typography variant="caption" className="text-[11px] text-muted-foreground/70 block leading-relaxed">
                    Trigger a mock outage simulation to run a BFS algorithm traversal. Identify downstream bottlenecks and dependent system failure flows.
                  </Typography>
                  
                  {activeSimulation && activeSimulation.sourceNodeId === selectedNode.id ? (
                    <Button
                      className="w-full bg-red-600 hover:bg-red-700 text-white gap-2 font-medium"
                      onClick={handleStopSimulation}
                    >
                      <RotateCcw className="h-4 w-4" />
                      Reset Simulation
                    </Button>
                  ) : (
                    <Button
                      className="w-full bg-red-500/10 hover:bg-red-500/25 border border-red-500/30 text-red-400 gap-2 font-semibold"
                      onClick={() => handleStartSimulation(selectedNode)}
                      disabled={isSimulationLoading}
                    >
                      <Play className="h-4 w-4" />
                      {isSimulationLoading ? "Loading..." : "Simulate Outage 🚨"}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="p-3 rounded-lg border border-dashed border-border/40 text-center">
                  <AlertTriangle className="h-4.5 w-4.5 text-warning mx-auto mb-1.5" />
                  <Typography variant="caption" className="text-[10px] text-muted-foreground/70 block">
                    Map this node to a monitoring configuration first in order to enable outage simulations.
                  </Typography>
                </div>
              )}
            </div>

            {/* Impact Result summary */}
            {activeSimulation && activeSimulation.sourceNodeId === selectedNode.id && impactResult && (
              <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3.5 space-y-2">
                <Typography className="text-[10px] font-bold uppercase tracking-wider text-red-400/80 block">
                  Blast Radius: {impactResult.impactedNodes.length} affected
                </Typography>
                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1.5 scrollbar-thin scrollbar-thumb-muted">
                  {impactResult.impactedNodes.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[11px] border-b border-border/5 pb-1">
                      <span className="text-foreground/80 truncate max-w-[150px]">{item.label}</span>
                      <Badge variant="outline" className="text-[9px] px-1 py-0 border-amber-500/20 text-amber-500">
                        Depth: {item.depth}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : selectedEdge ? (
          /* CASE B: Edge/Connection Selected */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary border-primary/20 bg-primary/5">
                Relation Connection
              </Badge>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => handleDeleteEdge(selectedEdge.id)}
                title="Delete Connection"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Typography className="text-xs font-bold text-muted-foreground/60 uppercase tracking-wider block">
                Relation Properties
              </Typography>
              <div className="bg-card/40 border border-border/20 rounded-xl p-3.5 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Source Node:</span>
                  <span className="font-semibold text-foreground/80">
                    {localNodes.find(n => n.id === selectedEdge.sourceId)?.label || "Unknown"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Target Node:</span>
                  <span className="font-semibold text-foreground/80">
                    {localNodes.find(n => n.id === selectedEdge.targetId)?.label || "Unknown"}
                  </span>
                </div>
                <div className="flex justify-between border-t border-border/10 pt-2 mt-2">
                  <span className="text-muted-foreground">Relation Type:</span>
                  <Badge className="text-[9px] font-semibold tracking-wider">
                    {selectedEdge.relationType}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* CASE C: Empty State (General Details) */
          <div className="text-center py-12 space-y-3 flex-1 flex flex-col justify-center">
            <div className="h-10 w-10 rounded-full bg-muted/40 flex items-center justify-center mx-auto text-muted-foreground/40">
              <Info className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <Typography className="text-xs font-bold text-foreground/70 block">
                No selection
              </Typography>
              <Typography variant="caption" className="text-[11px] text-muted-foreground/50 block px-6 leading-relaxed">
                Click a node to configure settings, link monitoring websites, and simulate failure outages. Click connections to delete them.
              </Typography>
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL DIALOGS ── */}
      {/* 1. Add Node Modal */}
      {showAddNodeModal && (
        <div className="absolute inset-0 bg-[#000000]/70 backdrop-blur-xs flex items-center justify-center z-40 p-4">
          <div className="w-full max-w-md bg-card border border-border/60 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-border/20 pb-3 mb-4">
              <Typography variant="h6" className="text-sm font-bold flex items-center gap-1.5">
                <Plus className="h-4.5 w-4.5 text-primary" />
                Add Node Infrastructure
              </Typography>
              <button className="text-muted-foreground hover:text-foreground" onClick={() => setShowAddNodeModal(false)}>
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNodeSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 block">
                  Node Name / Label
                </label>
                <input
                  type="text"
                  placeholder="e.g. Auth Service, API Gateway..."
                  value={newNodeName}
                  onChange={(e) => setNewNodeName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-muted/45 border border-border/40 rounded-xl focus:outline-none focus:border-primary text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 block">
                    Infrastructure Type
                  </label>
                  <select
                    value={newNodeType}
                    onChange={(e) => setNewNodeType(e.target.value as NodeType)}
                    className="w-full px-3 py-2 text-xs bg-muted/45 border border-border/40 rounded-xl focus:outline-none focus:border-primary text-foreground"
                  >
                    <option value={NodeType.SERVICE}>Service</option>
                    <option value={NodeType.DATABASE}>Database</option>
                    <option value={NodeType.CDN}>CDN</option>
                    <option value={NodeType.GATEWAY}>Gateway</option>
                    <option value={NodeType.EXTERNAL}>External Endpoint</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 block">
                    Link Monitoring Config
                  </label>
                  <select
                    value={newNodeConfigId}
                    onChange={(e) => setNewNodeConfigId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-muted/45 border border-border/40 rounded-xl focus:outline-none focus:border-primary text-foreground"
                  >
                    <option value="">None (Unmonitored)</option>
                    {configs.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.environment})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border/20">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddNodeModal(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="text-xs text-white"
                >
                  Create Node
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Add Link/Relation Modal */}
      {showAddEdgeModal && (
        <div className="absolute inset-0 bg-[#000000]/70 backdrop-blur-xs flex items-center justify-center z-40 p-4">
          <div className="w-full max-w-md bg-card border border-border/60 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-border/20 pb-3 mb-4">
              <Typography variant="h6" className="text-sm font-bold flex items-center gap-1.5">
                <LinkIcon className="h-4 w-4 text-primary" />
                Add Connection Link
              </Typography>
              <button className="text-muted-foreground hover:text-foreground" onClick={() => setShowAddEdgeModal(false)}>
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEdgeSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 block">
                    Source Node
                  </label>
                  <select
                    value={newEdgeSourceId}
                    onChange={(e) => setNewEdgeSourceId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-muted/45 border border-border/40 rounded-xl focus:outline-none focus:border-primary text-foreground"
                  >
                    <option value="">Select source...</option>
                    {localNodes.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 block">
                    Target Node (Dependency)
                  </label>
                  <select
                    value={newEdgeTargetId}
                    onChange={(e) => setNewEdgeTargetId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-muted/45 border border-border/40 rounded-xl focus:outline-none focus:border-primary text-foreground"
                  >
                    <option value="">Select target...</option>
                    {localNodes.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 block">
                  Relation Type
                </label>
                <select
                  value={newEdgeRelation}
                  onChange={(e) => setNewEdgeRelation(e.target.value as RelationType)}
                  className="w-full px-3 py-2 text-xs bg-muted/45 border border-border/40 rounded-xl focus:outline-none focus:border-primary text-foreground"
                >
                  <option value={RelationType.DEPENDS_ON}>DEPENDS_ON</option>
                  <option value={RelationType.CALLS}>CALLS</option>
                  <option value={RelationType.PROXIES_TO}>PROXIES_TO</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border/20">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddEdgeModal(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="text-xs text-white"
                >
                  Connect Nodes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
