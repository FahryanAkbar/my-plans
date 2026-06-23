import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

import { useProjectConfigs } from '@/hooks';
import type { MonitoringConfig } from '@/types/features';

interface UseMonitoringTabProps {
  projectId: string;
  projectName?: string;
}

export function useMonitoringTab({ projectId, projectName }: UseMonitoringTabProps) {
  const {
    configs,
    updateConfig,
    removeConfig,
    refetch,
  } = useProjectConfigs(projectId, projectName);

  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [editTarget, setEditTarget] = useState<MonitoringConfig | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkPending, setBulkPending] = useState<boolean>(false);

  // Clear selection if configs change or load
  useEffect(() => {
    setSelected(new Set());
  }, [projectId]);

  const toggleSelect = useCallback((id: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      const allIds = configs.filter(c => !c.isArchived).map((c) => c.id);
      setSelected(new Set(allIds));
    } else {
      setSelected(new Set());
    }
  }, [configs]);

  const clearSelection = useCallback(() => {
    setSelected(new Set());
  }, []);

  const handleToggle = useCallback(async (config: MonitoringConfig) => {
    try {
      await updateConfig(config.id, { enabled: !config.enabled });
    } catch (err) {
      console.error('Failed to toggle config status:', err);
    }
  }, [updateConfig]);

  const handleEdit = useCallback((config: MonitoringConfig) => {
    setEditTarget(config);
    setView('edit');
  }, []);

  const handleSoftDelete = useCallback(async (config: MonitoringConfig) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await updateConfig(config.id, { isArchived: true, enabled: false } as any);
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(config.id);
        return next;
      });
    } catch (err) {
      console.error('Failed to archive config:', err);
    }
  }, [updateConfig]);

  const handleHardDelete = useCallback(async (config: MonitoringConfig) => {
    try {
      await removeConfig(config.id);
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(config.id);
        return next;
      });
    } catch (err) {
      console.error('Failed to delete config permanently:', err);
    }
  }, [removeConfig]);

  const handleBulkDelete = useCallback(async () => {
    setBulkPending(true);
    try {
      const deletePromises = Array.from(selected).map((id) => removeConfig(id));
      await Promise.all(deletePromises);
      setSelected(new Set());
      toast.success('Selected configs deleted successfully');
    } catch (err) {
      console.error('Failed to bulk delete configs:', err);
      toast.error('Failed to delete some configurations');
    } finally {
      setBulkPending(false);
    }
  }, [selected, removeConfig]);

  const handleFormSuccess = useCallback(() => {
    setView('list');
    setEditTarget(null);
    refetch();
  }, [refetch]);

  const handleCancel = useCallback(() => {
    setView('list');
    setEditTarget(null);
  }, []);

  // Filter out archived configs so they don't show up in the main list
  const activeConfigs = configs ? configs.filter((c) => !c.isArchived) : [];

  return {
    configs: activeConfigs,
    view,
    setView,
    editTarget,
    selected,
    bulkPending,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    handleToggle,
    handleEdit,
    handleSoftDelete,
    handleHardDelete,
    handleBulkDelete,
    handleFormSuccess,
    handleCancel,
  };
}
