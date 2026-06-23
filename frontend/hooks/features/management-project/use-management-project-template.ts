import * as React from "react";
import { useQuery } from "convex/react";
import { DateRange } from "react-day-picker";
import { api } from "@/convex/_generated/api";
import {
  OverviewHeaderProps,
  OverviewControlsProps,
  ProjectRowProps,
} from "@/components/organisms";
import { Id } from "@/convex/_generated/dataModel";
import { Member } from "@/types";

interface UseManagementProjectTemplateProps {
  projectId?: Id<"projects">;
  header?: OverviewHeaderProps;
  controls?: OverviewControlsProps;
  projects?: ProjectRowProps[];
}

export const useManagementProjectTemplate = ({
  header,
  controls,
  projects,
}: UseManagementProjectTemplateProps) => {
  const [search, setSearch] = React.useState(controls?.search ?? "");
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(controls?.dateRange);
  const queriedProjects = useQuery(api.project.get, {});
  
  const allProjects = React.useMemo(() => {
    const data = (queriedProjects && 'data' in queriedProjects) ? (queriedProjects.data as ProjectRowProps[]) : [];
    return (projects ?? data) as ProjectRowProps[];
  }, [projects, queriedProjects]);

  React.useEffect(() => {
    if (controls?.search !== undefined) setSearch(controls.search);
  }, [controls?.search]);
 
  React.useEffect(() => {
    if (controls?.dateRange !== undefined) setDateRange(controls.dateRange);
  }, [controls?.dateRange]);

  const filteredProjects = React.useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return allProjects.filter((project) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        project.name.toLowerCase().includes(normalizedSearch) ||
        (project.description ?? "").toLowerCase().includes(normalizedSearch) ||
        String(project.status ?? "").toLowerCase().includes(normalizedSearch) ||
        String(project.platform ?? "").toLowerCase().includes(normalizedSearch);

      if (!matchesSearch) return false;

      if (!dateRange?.from && !dateRange?.to) return true;

      const projectDate = project.endDate ? new Date(project.endDate) : null;
      if (!projectDate) return false;

      const from = dateRange.from ? new Date(dateRange.from) : null;
      const to = dateRange.to ? new Date(dateRange.to) : null;

      if (from && to) {
        return projectDate >= from && projectDate <= to;
      }

      if (from) {
        return projectDate >= from;
      }

      if (to) {
        return projectDate <= to;
      }

      return true;
    });
  }, [allProjects, search, dateRange]);

  const mergedMembers = React.useMemo<Member[]>(() => {
    const map = new Map<string, Member>();

    for (const project of allProjects) {
      for (const member of project.members ?? []) {
        const key = `${member.fullName}|${member.imageUrl ?? ""}`;
        if (!map.has(key)) {
          map.set(key, {
            _id: key,
            fullName: member.fullName,
            imageUrl: member.imageUrl,
          });
        }
      }
    }

    return Array.from(map.values());
  }, [allProjects]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    controls?.onSearchChange?.(value);
  };

  const handleDateChange = (range: DateRange | undefined) => {
    setDateRange(range);
    controls?.onDateChange?.(range);
  };

  return {
    search,
    dateRange,
    filteredProjects,
    members: mergedMembers.length > 0 ? mergedMembers : header?.members,
    handleSearchChange,
    handleDateChange,
  };
};
