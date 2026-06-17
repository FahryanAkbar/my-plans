"use client";

import { Doc } from "@/convex/_generated/dataModel";
import { Save } from "lucide-react";
import { cn } from "@/lib";
import { useProjectSettingsTab } from "@/hooks/features/project/use-project-settings-tab";

import { 
  Button, 
} from "@/components/atoms";

import { GeneralSection } from "./settings-sections/general-section";
import { TimelineSection } from "./settings-sections/timeline-section";
import { AdvancedSection } from "./settings-sections/advanced-section";
import { CoverSection } from "./settings-sections/cover-section";

interface ProjectSettingsTabProps {
  project: Doc<"projects">;
  className?: string;
}

export const ProjectSettingsTab = ({ project, className }: ProjectSettingsTabProps) => {
  const {
    form,
    file,
    isPending,
    canLeaveProject,
    canDeleteProject,
    updateForm,
    onChangeImage,
    onSave,
    onDelete,
    onLeave,
  } = useProjectSettingsTab(project);

  return (
    <div className={cn("space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500", className)}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <div className="lg:col-span-8 space-y-8">
          <GeneralSection 
            name={form.name}
            icon={form.icon}
            description={form.description}
            onNameChange={(v) => updateForm({ name: v })}
            onIconChange={(v) => updateForm({ icon: v })}
            onDescriptionChange={(v) => updateForm({ description: v })}
          />

          <TimelineSection 
            startDate={form.startDate}
            endDate={form.endDate}
            status={form.status}
            platform={form.platform}
            onStartDateChange={(v) => updateForm({ startDate: v })}
            onEndDateChange={(v) => updateForm({ endDate: v })}
            onStatusChange={(v) => updateForm({ status: v })}
            onPlatformChange={(v) => updateForm({ platform: v })}
          />

          <AdvancedSection 
            projectName={project.name}
            isCollaborative={form.isCollaborative}
            isArchived={form.isArchived}
            isPending={isPending}
            canLeaveProject={canLeaveProject}
            canDeleteProject={canDeleteProject}
            onCollaborativeChange={(v) => updateForm({ isCollaborative: v })}
            onArchivedChange={(v) => updateForm({ isArchived: v })}
            onLeave={onLeave}
            onDelete={onDelete}
          />
        </div>

        <div className="space-y-8 lg:col-span-4 lg:sticky lg:top-8 h-fit">
          <CoverSection 
            imageValue={file || form.projectImage}
            isPending={isPending}
            onChangeImage={onChangeImage}
          />
        </div>

      </div>

      <div className="pt-6 border-t border-border/70 dark:border-white/10">
        <div className="flex justify-end">
          <Button 
            onClick={onSave}
            disabled={isPending}
            size="lg"
            className="px-10 shadow-md"
          >
            {isPending ? "Saving..." : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
