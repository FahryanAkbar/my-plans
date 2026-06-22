import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { networkTopologyService } from "@/services";
import { ApiError } from "@/lib";
import {
  NetworkNode,
  NetworkEdge,
  CreateNodeRequest,
  UpdateNodeRequest,
  CreateEdgeRequest,
} from "@/types/features";

export function useNetworkTopology(projectId: string) {
  const [nodes, setNodes] = useState<NetworkNode[]>([]);
  const [edges, setEdges] = useState<NetworkEdge[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isCreatingNode, setIsCreatingNode] = useState<boolean>(false);
  const [isUpdatingNode, setIsUpdatingNode] = useState<boolean>(false);
  const [isDeletingNode, setIsDeletingNode] = useState<boolean>(false);
  const [isCreatingEdge, setIsCreatingEdge] = useState<boolean>(false);
  const [isDeletingEdge, setIsDeletingEdge] = useState<boolean>(false);

  const fetchTopology = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await networkTopologyService.getTopology(projectId);
      setNodes(data.nodes);
      setEdges(data.edges);
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      const errMsg = apiErr?.message || "Failed to fetch network topology";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  const createNode = useCallback(
    async (data: CreateNodeRequest) => {
      if (!projectId) return;
      setIsCreatingNode(true);
      try {
        const newNode = await networkTopologyService.createNode(
          projectId,
          data,
        );
        setNodes((prev) => [...prev, newNode]);
        toast.success("Topology node created successfully");
        return newNode;
      } catch (err: unknown) {
        const apiErr = err as ApiError;
        const errMsg = apiErr?.message || "Failed to create topology node";
        toast.error(errMsg);
        throw err;
      } finally {
        setIsCreatingNode(false);
      }
    },
    [projectId],
  );

  const updateNode = useCallback(
    async (nodeId: string, data: UpdateNodeRequest) => {
      if (!projectId) return;
      setIsUpdatingNode(true);
      try {
        const updatedNode = await networkTopologyService.updateNode(
          projectId,
          nodeId,
          data,
        );
        setNodes((prev) =>
          prev.map((node) => (node.id === nodeId ? updatedNode : node)),
        );
        return updatedNode;
      } catch (err: unknown) {
        const apiErr = err as ApiError;
        const errMsg = apiErr?.message || "Failed to update topology node";
        toast.error(errMsg);
        throw err;
      } finally {
        setIsUpdatingNode(false);
      }
    },
    [projectId],
  );

  const deleteNode = useCallback(
    async (nodeId: string) => {
      if (!projectId) return;
      setIsDeletingNode(true);
      try {
        await networkTopologyService.deleteNode(projectId, nodeId);
        setNodes((prev) => prev.filter((node) => node.id !== nodeId));
        setEdges((prev) =>
          prev.filter(
            (edge) => edge.sourceId !== nodeId && edge.targetId !== nodeId,
          ),
        );
        toast.success("Topology node deleted successfully");
      } catch (err: unknown) {
        const apiErr = err as ApiError;
        const errMsg = apiErr?.message || "Failed to delete topology node";
        toast.error(errMsg);
        throw err;
      } finally {
        setIsDeletingNode(false);
      }
    },
    [projectId],
  );

  const createEdge = useCallback(
    async (data: CreateEdgeRequest) => {
      if (!projectId) return;
      setIsCreatingEdge(true);
      try {
        const newEdge = await networkTopologyService.createEdge(
          projectId,
          data,
        );
        setEdges((prev) => {
          if (prev.some((edge) => edge.id === newEdge.id)) {
            return prev;
          }
          return [...prev, newEdge];
        });
        toast.success("Topology relation created successfully");
        return newEdge;
      } catch (err: unknown) {
        const apiErr = err as ApiError;
        const errMsg = apiErr?.message || "Failed to create topology relation";
        toast.error(errMsg);
        throw err;
      } finally {
        setIsCreatingEdge(false);
      }
    },
    [projectId],
  );

  const deleteEdge = useCallback(
    async (edgeId: string) => {
      if (!projectId) return;
      setIsDeletingEdge(true);
      try {
        await networkTopologyService.deleteEdge(projectId, edgeId);
        setEdges((prev) => prev.filter((edge) => edge.id !== edgeId));
        toast.success("Topology relation deleted successfully");
      } catch (err: unknown) {
        const apiErr = err as ApiError;
        const errMsg = apiErr?.message || "Failed to delete topology relation";
        toast.error(errMsg);
        throw err;
      } finally {
        setIsDeletingEdge(false);
      }
    },
    [projectId],
  );

  useEffect(() => {
    fetchTopology();
  }, [fetchTopology]);

  return {
    nodes,
    edges,
    isLoading,
    error,
    isCreatingNode,
    isUpdatingNode,
    isDeletingNode,
    isCreatingEdge,
    isDeletingEdge,
    refetch: fetchTopology,
    createNode,
    updateNode,
    deleteNode,
    createEdge,
    deleteEdge,
  };
}
