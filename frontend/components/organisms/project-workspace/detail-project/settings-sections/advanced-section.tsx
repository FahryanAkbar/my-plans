"use client";

import { useState } from "react";
import { HelpCircle, LogOut, Trash2 } from "lucide-react";
import { 
  Button, 
  Typography, 
  Switch, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/atoms";
import { ConfirmModal } from "@/components/molecules";

interface AdvancedSectionProps {
  projectName: string;
  isCollaborative: boolean;
  isArchived: boolean;
  isPending: boolean;
  canLeaveProject: boolean;
  canDeleteProject: boolean;
  onCollaborativeChange: (value: boolean) => void;
  onArchivedChange: (value: boolean) => void;
  onLeave: () => void;
  onDelete: () => void;
}

export const AdvancedSection = ({
  projectName,
  isCollaborative,
  isArchived,
  isPending,
  canLeaveProject,
  canDeleteProject,
  onCollaborativeChange,
  onArchivedChange,
  onLeave,
  onDelete,
}: AdvancedSectionProps) => {
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isCollaborativeOpen, setIsCollaborativeOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);

  return (
    <TooltipProvider>
      <Card className="rounded-2xl n">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Advanced Settings
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl border border-border/7">
              <div>
                <div className="flex items-center gap-1.5">
                  <Typography className="text-sm font-medium">
                    Collaborative Mode
                  </Typography>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/50 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs p-3">
                      When enabled, other users can search for and join this project via the invitation link. Disabling it restricts access to existing members only.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Typography variant="muted" className="text-xs">
                  Allow others to join this project
                </Typography>
              </div>
              <Switch
                checked={isCollaborative}
                onCheckedChange={(v) => {
                  if (!v) {
                    setIsCollaborativeOpen(true);
                  } else {
                    onCollaborativeChange(true);
                  }
                }}
              />
              <ConfirmModal
                open={isCollaborativeOpen}
                onOpenChange={setIsCollaborativeOpen}
                title="Disable Collaborative Mode?"
                description="Disabling collaborative mode will prevent new users from joining this project via invitation link. Existing members will retain their access."
                variant="warning"
                confirmText="Disable"
                onConfirm={() => onCollaborativeChange(false)}
                isLoading={isPending}
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-border/70 dark:border-white/10 bg-background/60 dark:bg-white/2">
              <div>
                <div className="flex items-center gap-1.5">
                  <Typography className="text-sm font-medium text-amber-600">
                    Archive Project
                  </Typography>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3.5 w-3.5 text-amber-600/50 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs p-3">
                      Archived projects are hidden from the main dashboard but can still be accessed and restored from the archives. This is useful for completed or inactive projects.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Typography variant="muted" className="text-xs">
                  Move to archives and hide from active list
                </Typography>
              </div>
              <Switch
                checked={isArchived}
                onCheckedChange={(v) => {
                  if (v) {
                    setIsArchiveOpen(true);
                  } else {
                    onArchivedChange(false);
                  }
                }}
              />
              <ConfirmModal
                open={isArchiveOpen}
                onOpenChange={setIsArchiveOpen}
                title="Archive this project?"
                description="Archiving will hide this project from the active list. It can still be accessed and restored from the archives at any time."
                variant="warning"
                confirmText="Archive Project"
                onConfirm={() => onArchivedChange(true)}
                isLoading={isPending}
              />
            </div>
          </div>

        <div className="pt-4 border-t border-red-100 dark:border-red-500/20">
          <div className="p-5 rounded-2xl bg-red-50/60 dark:bg-red-500/10 border border-red-100 dark:border-red-500/30 space-y-4">
            <div className="space-y-1">
              <Typography className="text-sm font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                Danger Zone
              </Typography>
              <Typography className="text-xs text-red-700/80 dark:text-red-200/80">
                {canDeleteProject
                  ? "Permanently delete this project and all of its data. This action cannot be undone."
                  : "Leave this project. You will lose access unless invited again."}
              </Typography>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              {canLeaveProject && (
                <ConfirmModal
                  open={isLeaveOpen}
                  onOpenChange={setIsLeaveOpen}
                  title={`Leave "${projectName}"?`}
                  description="You will lose access to this project unless invited again."
                  variant="warning"
                  confirmText="Leave Project"
                  onConfirm={onLeave}
                  isLoading={isPending}
                >
                  <Button
                    variant="outline"
                    className="px-6 h-10 shadow-sm border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-500/30 dark:text-amber-300 dark:hover:bg-amber-500/10 font-semibold"
                    disabled={isPending}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Leave Project
                  </Button>
                </ConfirmModal>
              )}
              
              {canDeleteProject && (
                <ConfirmModal
                  open={isDeleteOpen}
                  onOpenChange={setIsDeleteOpen}
                  title={`Delete "${projectName}"?`}
                  description="Are you sure you want to delete this project? This will permanently remove all members and content associated with it."
                  variant="destructive"
                  confirmText="Delete Project"
                  onConfirm={onDelete}
                  isLoading={isPending}
                >
                  <Button 
                    variant="destructive" 
                    className="px-6 h-10 shadow-sm bg-red-600 hover:bg-red-700 text-white font-semibold"
                    disabled={isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Project
                  </Button>
                </ConfirmModal>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    </TooltipProvider>
  );
};


