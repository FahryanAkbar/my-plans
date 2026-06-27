"use client";

import React from "react";
import { Activity } from "lucide-react";
import { Typography, Button } from "@/components/atoms";
import { useTopologyCanvas } from "@/hooks";
import { TopologyLeftSidebar } from "./topology-left-sidebar";
import { TopologyNode } from "./topology-node";
import { TopologyEdge } from "./topology-edge";
import { TopologyInspector } from "./topology-inspector";
import { AddNodeModal } from "./add-node-modal";
import { AddLinkModal } from "./add-link-modal";
import { EditNodeModal } from "./edit-node-modal";

interface TopologyCanvasProps {
  projectId: string;
  className?: string;
}

export function TopologyCanvas({ projectId, className }: TopologyCanvasProps) {
  const {
    edges,
    isTopologyLoading,
    configs,
    localNodes,
    selectedNodeId,
    setSelectedNodeId,
    selectedEdgeId,
    setSelectedEdgeId,
    isLocked,
    setIsLocked,
    pan,
    scale,
    activeSimulation,
    showAddNodeModal,
    setShowAddNodeModal,
    showAddEdgeModal,
    setShowAddEdgeModal,
    showEditNodeModal,
    setShowEditNodeModal,
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
    isNodeSimulatedFailed,
    isNodeSimulatedImpacted,
    isEdgeSimulatedImpacted,
    getConnectionCoords,
    connectingSourceId,
    setConnectingSourceId,
    isSimulationLoading,
    impactResult,
  } = useTopologyCanvas(projectId);

  const selectedNode = localNodes.find((n) => n.id === selectedNodeId) || null;
  const selectedConfig = selectedNode
    ? configs.find((c) => c.id === selectedNode.configId)
    : undefined;
  const selectedEdge = edges.find((e) => e.id === selectedEdgeId) || null;

  const sourceNodeLabel = selectedEdge
    ? localNodes.find((n) => n.id === selectedEdge.sourceId)?.label || "Unknown"
    : "Unknown";
  const targetNodeLabel = selectedEdge
    ? localNodes.find((n) => n.id === selectedEdge.targetId)?.label || "Unknown"
    : "Unknown";
  const connectingSourceLabel = connectingSourceId
    ? localNodes.find((n) => n.id === connectingSourceId)?.label
    : undefined;

  return (
    <div
      className={`relative w-full flex flex-col xl:flex-row gap-5 h-175 border border-border/40 rounded-2xl overflow-hidden bg-card/20 shadow-sm ${className}`}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
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
      `,
        }}
      />

      {/* LEFT SIDEBAR: TOPOLOGY CONTROLS */}
      <TopologyLeftSidebar
        isTopologyLoading={isTopologyLoading}
        nodeCount={localNodes.length}
        edgeCount={edges.length}
        isLocked={isLocked}
        onLockChange={setIsLocked}
        onAddNodeClick={() => {
          setNewNodeConfigId("");
          setShowAddNodeModal(true);
        }}
        onAddLinkClick={() => setShowAddEdgeModal(true)}
        zoomIn={zoomIn}
        zoomOut={zoomOut}
        resetView={resetView}
      />

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
            <Typography
              variant="span"
              className="text-xs font-semibold text-red-400"
            >
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
              <Typography
                variant="caption"
                className="text-xs text-muted-foreground/80 font-medium"
              >
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
                refX="22"
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

              return (
                <TopologyEdge
                  key={edge.id}
                  edge={edge}
                  coords={coords}
                  isSelected={selectedEdgeId === edge.id}
                  isSimImpacted={isEdgeSimulatedImpacted(edge)}
                  onClick={() => {
                    setSelectedEdgeId(edge.id);
                    setSelectedNodeId(null);
                  }}
                />
              );
            })}
          </svg>

          {/* RENDER ABSOLUTE NODE ELEMENTS */}
          {localNodes.map((node) => {
            const isSelected = selectedNodeId === node.id;
            const isFailed = isNodeSimulatedFailed(node.id);
            const isImpacted = isNodeSimulatedImpacted(node.id);
            const config = configs.find((c) => c.id === node.configId);

            return (
              <TopologyNode
                key={node.id}
                node={node}
                config={config}
                isLocked={isLocked}
                isSelected={isSelected}
                isFailed={isFailed}
                isImpacted={isImpacted}
                onMouseDown={(e) => handleNodeMouseDown(e, node)}
                onConnectingClick={() => {
                  setConnectingSourceId(node.id);
                }}
              />
            );
          })}
        </div>
      </div>

      {/* RIGHT SIDEBAR: PROPERTIES & ACTION PANEL */}
      <TopologyInspector
        selectedNode={selectedNode}
        selectedConfig={selectedConfig}
        selectedEdge={selectedEdge}
        sourceNodeLabel={sourceNodeLabel}
        targetNodeLabel={targetNodeLabel}
        connectingSourceLabel={connectingSourceLabel}
        isLocked={isLocked}
        isSimulatingActive={
          !!activeSimulation &&
          !!selectedNode &&
          activeSimulation.sourceNodeId === selectedNode.id
        }
        isSimulationLoading={isSimulationLoading}
        impactResult={impactResult}
        onCancelConnecting={() => setConnectingSourceId(null)}
        onDeleteNode={handleDeleteNode}
        onDeleteEdge={handleDeleteEdge}
        onStartSimulation={() =>
          selectedNode && handleStartSimulation(selectedNode)
        }
        onStopSimulation={handleStopSimulation}
        onEditNodeClick={handleEditNodeClick}
      />

      {/* MODAL DIALOGS */}
      <AddNodeModal
        show={showAddNodeModal}
        newNodeName={newNodeName}
        onNewNodeNameChange={setNewNodeName}
        newNodeType={newNodeType}
        onNewNodeTypeChange={setNewNodeType}
        newNodeConfigId={newNodeConfigId}
        onNewNodeConfigIdChange={setNewNodeConfigId}
        configs={configs}
        onClose={() => setShowAddNodeModal(false)}
        onSubmit={handleCreateNodeSubmit}
      />

      <AddLinkModal
        show={showAddEdgeModal}
        newEdgeSourceId={newEdgeSourceId}
        onNewEdgeSourceIdChange={setNewEdgeSourceId}
        newEdgeTargetId={newEdgeTargetId}
        onNewEdgeTargetIdChange={setNewEdgeTargetId}
        newEdgeRelation={newEdgeRelation}
        onNewEdgeRelationChange={setNewEdgeRelation}
        localNodes={localNodes}
        onClose={() => setShowAddEdgeModal(false)}
        onSubmit={handleCreateEdgeSubmit}
      />

      <EditNodeModal
        show={showEditNodeModal}
        editNodeName={editNodeName}
        onEditNodeNameChange={setEditNodeName}
        editNodeType={editNodeType}
        onEditNodeTypeChange={setEditNodeType}
        editNodeConfigId={editNodeConfigId}
        onEditNodeConfigIdChange={setEditNodeConfigId}
        configs={configs}
        onClose={() => setShowEditNodeModal(false)}
        onSubmit={handleEditNodeSubmit}
      />
    </div>
  );
}
