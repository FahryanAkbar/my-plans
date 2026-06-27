import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import {
  useNetworkTopology,
  useTopologyImpactAnalysis,
  useProjectConfigs,
} from "@/hooks";
import { NodeType, RelationType, NetworkNode, NetworkEdge } from "@/types/features";

export function useTopologyCanvas(projectId: string) {
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
  const [showEditNodeModal, setShowEditNodeModal] = useState(false);

  // Form states
  const [newNodeName, setNewNodeName] = useState("");
  const [newNodeType, setNewNodeType] = useState<NodeType>(NodeType.SERVICE);
  const [newNodeConfigId, setNewNodeConfigId] = useState<string>("");

  const [editNodeName, setEditNodeName] = useState("");
  const [editNodeType, setEditNodeType] = useState<NodeType>(NodeType.SERVICE);
  const [editNodeConfigId, setEditNodeConfigId] = useState<string>("");

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

  // Canvas Handlers (Pan & Zoom)
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

  // API Event Wrappers
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

  const handleEditNodeClick = () => {
    const selectedNode = localNodes.find(n => n.id === selectedNodeId);
    if (selectedNode) {
      setEditNodeName(selectedNode.label);
      setEditNodeType(selectedNode.nodeType);
      setEditNodeConfigId(selectedNode.configId || "");
      setShowEditNodeModal(true);
    }
  };

  const handleEditNodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNodeId) return;
    if (!editNodeName.trim()) {
      toast.error("Node label is required");
      return;
    }

    try {
      await updateNode(selectedNodeId, {
        label: editNodeName,
        nodeType: editNodeType,
        configId: editNodeConfigId || null,
      });
      setShowEditNodeModal(false);
      toast.success("Successfully updated node configuration");
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

  // BFS Simulation Trigger
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
    const sourceImpacted = edge.sourceId === activeSimulation.sourceNodeId || activeSimulation.impactedNodeIds.has(edge.sourceId);
    const targetImpacted = edge.targetId === activeSimulation.sourceNodeId || activeSimulation.impactedNodeIds.has(edge.targetId);
    return sourceImpacted && targetImpacted;
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

  return {
    nodes,
    edges,
    isTopologyLoading,
    topologyError,
    configs,
    isConfigsLoading,
    
    localNodes,
    setLocalNodes,
    selectedNodeId,
    setSelectedNodeId,
    selectedEdgeId,
    setSelectedEdgeId,
    isLocked,
    setIsLocked,
    
    pan,
    setPan,
    scale,
    setScale,
    isPanning,
    
    draggedNodeId,
    connectingSourceId,
    setConnectingSourceId,
    activeSimulation,
    
    showAddNodeModal,
    setShowAddNodeModal,
    showAddEdgeModal,
    setShowAddEdgeModal,
    showEditNodeModal,
    setShowEditNodeModal,
    
    // form state & setters
    newNodeName,
    setNewNodeName,
    newNodeType,
    setNewNodeType,
    newNodeConfigId,
    setNewNodeConfigId,
    editNodeName,
    setEditNodeName,
    editNodeType,
    setEditNodeType,
    editNodeConfigId,
    setEditNodeConfigId,
    newEdgeSourceId,
    setNewEdgeSourceId,
    newEdgeTargetId,
    setNewEdgeTargetId,
    newEdgeRelation,
    setNewEdgeRelation,
    
    containerRef,
    
    // dimension constants
    NODE_WIDTH,
    NODE_HEIGHT,
    
    // handlers
    handleWheel,
    handleCanvasMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
    handleNodeMouseDown,
    zoomIn,
    zoomOut,
    resetView,
    
    handleCreateNodeSubmit,
    handleCreateEdgeSubmit,
    handleEditNodeClick,
    handleEditNodeSubmit,
    handleDeleteNode,
    handleDeleteEdge,
    handleStartSimulation,
    handleStopSimulation,
    
    // helpers
    isNodeSimulatedFailed,
    isNodeSimulatedImpacted,
    isEdgeSimulatedImpacted,
    getConnectionCoords,
    isSimulationLoading,
    impactResult,
  };
}
