"use client";

import * as React from "react";

export type SortDirection = "asc" | "desc";

export interface SortConfig<T> {
  key: keyof T;
  direction: SortDirection;
}

export interface TableManagementOptions<T> {
  initialData: T[];
  defaultSort?: SortConfig<T>;
  defaultPageSize?: number;
  searchFields?: (keyof T)[];
}

export const useTableManagement = <T extends object>({
  initialData,
  defaultSort,
  defaultPageSize = 10,
  searchFields = [],
}: TableManagementOptions<T>) => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [sortConfig, setSortConfig] = React.useState<SortConfig<T> | undefined>(defaultSort);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(defaultPageSize);

  const filteredData = React.useMemo(() => {
    if (!searchTerm.trim() || searchFields.length === 0) return initialData;

    const lowerSearch = searchTerm.toLowerCase();
    return initialData.filter((item) =>
      searchFields.some((field) => {
        const value = item[field];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(lowerSearch);
      })
    );
  }, [initialData, searchTerm, searchFields]);

  const sortedData = React.useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === bValue) return 0;
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      const comparison = aValue < bValue ? -1 : 1;
      return sortConfig.direction === "asc" ? comparison : -comparison;
    });
  }, [filteredData, sortConfig]);

  const paginatedData = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key: keyof T) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        // Toggle direction if same key
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  const totalPages = Math.ceil(sortedData.length / pageSize);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return {
    data: paginatedData, 
    fullData: sortedData, 
    searchTerm,
    sortConfig,
    currentPage,
    pageSize,
    totalItems: sortedData.length,
    totalPages,
    startIndex: (currentPage - 1) * pageSize + 1,
    endIndex: Math.min(currentPage * pageSize, sortedData.length),
    setSearchTerm,
    setCurrentPage,
    setPageSize,
    handleSort,
    isEmpty: sortedData.length === 0,
    isFirstPage: currentPage === 1,
    isLastPage: currentPage === totalPages || totalPages === 0,
  };
};
