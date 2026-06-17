import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

import { projectsService } from '@/services';
import type { ApiError } from '@/lib';
import type { Project, UpdateProjectRequest } from '@/types/features';


export function useProject(projectId: string) {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const fetchProject = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await projectsService.findOneProject(projectId);
      setProject(data);
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      const errMsg = apiErr?.message || 'Failed to fetch project';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  const updateProject = useCallback(async (data: UpdateProjectRequest) => {
    if (!projectId) return;
    setIsUpdating(true);
    try {
      const updated = await projectsService.updateProject(projectId, data);
      setProject(updated);
      toast.success('Project details updated successfully');
      return updated;
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      const errMsg = apiErr?.message || 'Failed to update project';
      toast.error(errMsg);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  return {
    project,
    isLoading,
    error,
    isUpdating,
    refetch: fetchProject,
    updateProject,
  };
}
