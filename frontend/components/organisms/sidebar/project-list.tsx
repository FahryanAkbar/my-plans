"use client";

import { CheckSquare, LayoutDashboard, Folder, Plus, Logs, Bug } from "lucide-react";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import { Item } from "@/components/organisms";
import { Typography } from "@/components/atoms";
import { CreateProjectModal } from "@/components/organisms";

interface ProjectItem {
  _id: string;
  name: string;
  icon?: string;
}

interface ProjectListProps {
  data?: ProjectItem[];
}

export const ProjectList = ({ data }: ProjectListProps) => {
  const router = useRouter();
  const params = useParams();
  const projectsQuery = useQuery(api.project.getUserProjects);
  
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [isModalOpen, setIsModalOpen] = useState(false);
  const projects = data || projectsQuery;

  const onExpand = (projectId: string) => {
    setExpanded(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  }

  if (projects === undefined) {
    return (
      <div className="flex flex-col gap-y-1 px-3">
        <Item.Skeleton level={1} />
        <Item.Skeleton level={1} />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <>
        <div className="flex flex-col gap-y-0.5 mt-4">
          <Typography 
            variant="muted" 
            className="text-[11px] font-bold text-sidebar-muted-foreground uppercase tracking-widest mb-3 px-3"
          >
            My Projects
          </Typography>
          <Typography 
            className="text-[11px] font-medium text-sidebar-muted-foreground px-3 py-2 italic"
          >
            No projects available
          </Typography>
          <Item 
            label="Add project"
            icon={Plus}
            onClick={() => setIsModalOpen(true)}
          />
        </div>
        <CreateProjectModal 
          open={isModalOpen} 
          onOpenChange={() => setIsModalOpen(false)} 
        />
      </>
    );
  }


  return (
    <>
      <div className="flex flex-col gap-y-0.5 mt-4">
        <Typography 
          variant="muted" 
          className="text-[11px] font-bold text-sidebar-muted-foreground uppercase tracking-widest mb-3 px-3"
        >
          My Projects
        </Typography>
        <div className="space-y-0.5">
          {projects.filter((p): p is ProjectItem => p !== null).map((project) => (
            <div key={project._id}>{
              <Item
                key={project._id}
                label={project.name}
                icon={Folder}
                documentIcon={project.icon}
                onClick={() => onExpand(project._id)}
                active={params.projectId === project._id}
                level={0}

                onExpand={() => onExpand(project._id)}
                expanded={expanded[project._id]}
              />
            }
            {expanded[project._id] && (
              <div className="ml-2 mt-1 mb-2 bg-sidebar/60 dark:bg-sidebar/40 rounded-lg border-l-2 border-border/60 py-1 transition-all duration-300 animate-in fade-in slide-in-from-top-1">
                <Item 
                  label="Overview" 
                  icon={LayoutDashboard} 
                  onClick={() => router.push(`/project/${project._id}`)} 
                  level={1}
                />

                <Item 
                  label="Tasks" 
                  icon={CheckSquare} 
                  onClick={() => router.push(`/project/${project._id}/tasks`)} 
                  level={1}
                />

                <Item 
                  label="Scoring & Logs" 
                  icon={Logs} 
                  onClick={() => router.push(`/project/${project._id}/scoring-logs`)} 
                  level={1}
                />

                <Item 
                  label="Issue & Reports" 
                  icon={Bug} 
                  onClick={() => router.push(`/project/${project._id}/issues`)} 
                  level={1}
                />
              </div>
            )}
            </div>
          ))}
          <Item 
            label="Add project"
            icon={Plus}
            onClick={() => setIsModalOpen(true)}
          />
        </div>
      </div>
      <CreateProjectModal 
        open={isModalOpen} 
        onOpenChange={() => setIsModalOpen(false)} 
      />
    </>
  );
};
