import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

import { projectsService } from '@/services';
import { ApiError } from '@/lib';
import {
  Project,
  CreateProjectRequest,
} from '@/types/features';

// --- Hook 1: Fetching and Managing All Projects ---

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await projectsService.findAllProjects();
      setProjects(data);
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      const errMsg = apiErr?.message || 'Failed to fetch projects';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createProject = useCallback(async (data: CreateProjectRequest) => {
    setIsCreating(true);
    try {
      const newProject = await projectsService.createProject(data);
      setProjects((prev) => [...prev, newProject]);
      toast.success('Project monitoring registered successfully');
      return newProject;
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      const errMsg = apiErr?.message || 'Failed to register project';
      toast.error(errMsg);
      throw err;
    } finally {
      setIsCreating(false);
    }
  }, []);

  const removeProject = useCallback(async (id: string) => {
    setIsDeleting(true);
    try {
      await projectsService.removeProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast.success('Project monitoring deleted successfully');
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      const errMsg = apiErr?.message || 'Failed to delete project';
      toast.error(errMsg);
      throw err;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    isLoading,
    error,
    isCreating,
    isDeleting,
    refetch: fetchProjects,
    createProject,
    removeProject,
  };
}
