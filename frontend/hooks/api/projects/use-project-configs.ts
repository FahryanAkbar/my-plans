import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import axios from 'axios';

import { projectsService } from '@/services';
import type { ApiError } from '@/lib';
import type {
  MonitoringConfig,
  CreateMonitoringConfigRequest,
  UpdateMonitoringConfigRequest,
} from '@/types/features';


export function useProjectConfigs(projectId: string, projectName?: string, configId?: string) {
  const [configs, setConfigs] = useState<MonitoringConfig[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchConfigs = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    setError(null);
    try {
      if (configId) {
        const data = await projectsService.findOneConfig(projectId, configId);
        setConfigs([data]);
        return;
      }

      const data = await projectsService.findConfigsByProject(projectId);
      setConfigs(data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        try {
          // Auto-register project on NestJS backend
          await projectsService.createProject({
            id: projectId,
            name: projectName || 'Project',
          });
          // Retry fetching configs
          if (configId) {
            const data = await projectsService.findOneConfig(projectId, configId);
            setConfigs([data]);
          } else {
            const data = await projectsService.findConfigsByProject(projectId);
            setConfigs(data);
          }
          return;
        } catch (regErr) {
          if (axios.isAxiosError(regErr) && regErr.response?.status === 409) {
            // Harmless conflict (project already created concurrently). Retry fetching.
            try {
              if (configId) {
                const data = await projectsService.findOneConfig(projectId, configId);
                setConfigs([data]);
              } else {
                const data = await projectsService.findConfigsByProject(projectId);
                setConfigs(data);
              }
              return;
            } catch (retryErr) {
              console.error('Failed to fetch configs after 409 conflict:', retryErr);
            }
          }
          console.error('Failed to auto-register project:', regErr);
        }
      }
      const apiErr = err as ApiError;
      const errMsg = apiErr?.message || 'Failed to fetch monitoring configs';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, projectName, configId]);

  const createConfig = useCallback(async (data: CreateMonitoringConfigRequest) => {
    if (!projectId) return;
    setIsCreating(true);
    try {
      const newConfig = await projectsService.createConfig(projectId, data);
      setConfigs((prev) => [...prev, newConfig]);
      toast.success('Monitoring config added successfully');
      return newConfig;
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        try {
          // Auto-register project on NestJS backend
          await projectsService.createProject({
            id: projectId,
            name: projectName || 'Project',
          });
          // Retry creating config
          const newConfig = await projectsService.createConfig(projectId, data);
          setConfigs((prev) => [...prev, newConfig]);
          toast.success('Monitoring config added successfully');
          return newConfig;
        } catch (regErr) {
          if (axios.isAxiosError(regErr) && regErr.response?.status === 409) {
            // Harmless conflict (project already created concurrently). Retry creating.
            try {
              const newConfig = await projectsService.createConfig(projectId, data);
              setConfigs((prev) => [...prev, newConfig]);
              toast.success('Monitoring config added successfully');
              return newConfig;
            } catch (retryErr) {
              console.error('Failed to create config after 409 conflict:', retryErr);
            }
          }
          console.error('Failed to auto-register project on config creation:', regErr);
        }
      }
      const apiErr = err as ApiError;
      const errMsg = apiErr?.message || 'Failed to add monitoring config';
      toast.error(errMsg);
      throw err;
    } finally {
      setIsCreating(false);
    }
  }, [projectId, projectName]);

  const updateConfig = useCallback(async (configId: string, data: UpdateMonitoringConfigRequest) => {
    if (!projectId) return;
    setIsUpdating(true);
    try {
      const updated = await projectsService.updateConfig(projectId, configId, data);
      setConfigs((prev) =>
        prev.map((c) => (c.id === configId ? updated : c))
      );
      toast.success('Monitoring config updated successfully');
      return updated;
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      const errMsg = apiErr?.message || 'Failed to update config';
      toast.error(errMsg);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, [projectId]);

  const removeConfig = useCallback(async (configId: string) => {
    if (!projectId) return;
    setIsDeleting(true);
    try {
      await projectsService.removeConfig(projectId, configId);
      setConfigs((prev) => prev.filter((c) => c.id !== configId));
      toast.success('Monitoring config deleted successfully');
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      const errMsg = apiErr?.message || 'Failed to delete config';
      toast.error(errMsg);
      throw err;
    } finally {
      setIsDeleting(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  return {
    configs,
    isLoading,
    error,
    isCreating,
    isUpdating,
    isDeleting,
    refetch: fetchConfigs,
    createConfig,
    updateConfig,
    removeConfig,
  };
}
