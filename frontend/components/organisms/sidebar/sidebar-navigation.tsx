"use client";

import { useRouter } from "next/navigation";
import { 
  Search, 
  Settings, 
  PlusCircle, 
  HomeIcon, 
  Briefcase,
  BookUser,
} from "lucide-react";
import { UserItem, Item } from "@/components/organisms";
import { useSearch, useSettings } from "@/hooks";
import { Typography } from "@/components/atoms";

interface SidebarNavigationProps {
  handleCreate: () => void;
}

export const SidebarNavigation = ({ handleCreate }: SidebarNavigationProps) => {
  const search = useSearch();
  const settings = useSettings();
  const router = useRouter();

  return (
    <div className="flex flex-col">
      <div className="h-14 flex items-center">
        <UserItem />
      </div>
      <div className="h-px bg-border" />

      <div className="flex flex-col gap-y-4 pt-4">
        <div>
          <Typography 
            variant="muted" 
            className="text-[11px] font-bold text-sidebar-muted-foreground uppercase tracking-widest mb-3 px-3"
          >
            Insights & Analytics
          </Typography>
          <div className="space-y-0.5">
            <Item 
              label="Analytics Dashboard" 
              icon={HomeIcon} 
              onClick={() => router.push('/monitoring')} 
            />
            <Item
              label="Project Management"
              icon={Briefcase}
              onClick={() => router.push('/project')}
            />
            <Item 
              label="Workspace" 
              icon={BookUser} 
              onClick={() => router.push('/documents')} 
            />
          </div>
        </div>

        <div>
          <Typography 
            variant="muted" 
            className="text-[11px] font-bold text-sidebar-muted-foreground uppercase tracking-widest mb-3 px-3"
          >
            Quick Actions
          </Typography>
          <div className="space-y-0.5">
            <Item 
              label="Search" 
              icon={Search} 
              isSearch 
              onClick={search.onOpen} 
            />
            <Item 
              label="Settings" 
              icon={Settings} 
              onClick={settings.onOpen} 
            />
            <Item 
              label="New Page" 
              icon={PlusCircle} 
              onClick={handleCreate} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};
