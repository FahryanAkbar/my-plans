"use client";

import * as React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SortConfig } from "@/hooks";
import { ProjectRowProps } from "@/components/organisms";
import { ProjectStatus } from "@/lib/constants";

export const useProjectTemplate = () => {
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [limit, setLimit] = React.useState(5);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [sortConfig, setSortConfig] = React.useState<SortConfig<ProjectRowProps>>({ 
    key: "createdAt", 
    direction: "desc" 
  });
  
  const response = useQuery(api.project.get, {
    page: currentPage,
    limit: limit,
    search: searchTerm,
    status: statusFilter,
    isArchived: activeTab === "archived",
    sortBy: sortConfig.key,
    sortOrder: sortConfig.direction,
  });

  // Calculate counts - we still need all projects for counts or a separate query
  // For simplicity, we'll fetch all non-paginated for counts if needed, 
  // but let's see if we can use the total_element from response for the current view.
  const countsQuery = useQuery(api.project.get, { isArchived: activeTab === "archived" });
  
  const counts = React.useMemo(() => {
    const rawProjects = (countsQuery?.data || []);
    const projects = rawProjects.map(p => ({
      ...p,
      status: p.status as ProjectStatus
    })) as ProjectRowProps[];
    const nonArchived = projects.filter(p => !p.isArchived);
    
    return {
      all: nonArchived.length,
      archived: projects.filter(p => p.isArchived).length,
      "Planning": nonArchived.filter(p => p.status === "Planning").length,
      "In-Progress": nonArchived.filter(p => p.status === "In-Progress").length,
      "At Risk": nonArchived.filter(p => p.status === "At Risk").length,
      "Late": nonArchived.filter(p => p.status === "Late").length,
      "Completed": nonArchived.filter(p => p.status === "Completed").length,
    };
  }, [countsQuery, activeTab]);

  const handleSort = (key: keyof ProjectRowProps) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
    }));
  };

  const meta = response?.meta;
  const tableData = React.useMemo(() => {
    return (response?.data || []).map(p => ({
      ...p,
      status: p.status as ProjectStatus
    })) as ProjectRowProps[];
  }, [response?.data]);

  const table = {
    data: tableData,
    searchTerm,
    setSearchTerm: (val: string) => {
      setSearchTerm(val);
      setCurrentPage(1);
    },
    sortConfig,
    handleSort,
    currentPage: meta?.current_page || 1,
    totalPages: meta?.total_page || 0,
    totalItems: meta?.total_element || 0,
    startIndex: ((meta?.current_page || 1) - 1) * (meta?.size || limit) + 1,
    endIndex: Math.min((meta?.current_page || 1) * (meta?.size || limit), meta?.total_element || 0),
    setCurrentPage,
    setLimit,
    limit: meta?.size || limit,
    isFirstPage: (meta?.current_page || 1) === 1,
    isLastPage: (meta?.current_page || 1) === (meta?.total_page || 1),
    isEmpty: (meta?.total_element || 0) === 0,
  };

  // Reset status filter and page when switching tabs
  React.useEffect(() => {
    setStatusFilter("all");
    setCurrentPage(1);
  }, [activeTab]);

  return {
    isCreateOpen,
    setIsCreateOpen,
    activeTab,
    setActiveTab,
    statusFilter,
    setStatusFilter: (val: string) => {
      setStatusFilter(val);
      setCurrentPage(1);
    },
    table,
    counts,
    isLoading: response === undefined,
  };
};
