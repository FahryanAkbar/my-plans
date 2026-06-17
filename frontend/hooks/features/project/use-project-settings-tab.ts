"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { ROLES, USER_POSITION } from "@/lib";
import { useEdgeStore } from "@/lib/api/edgestore";
import { isSafeFile, sanitizeHtml, stripHtml } from "@/lib/utils";
import { projectsService } from "@/services";

type ProjectSettingsForm = {
  name: string;
  description: string;
  status: string;
  platform: string;
  icon: string;
  isCollaborative: boolean;
  projectImage: string;
  startDate?: number;
  endDate?: number;
  isArchived: boolean;
};

export const useProjectSettingsTab = (project: Doc<"projects">) => {
  const router = useRouter();
  const update = useMutation(api.project.update);
  const remove = useMutation(api.project.remove);
  const leave = useMutation(api.project.leave);
  const currentMember = useQuery(api.project.getCurrentMember, { projectId: project._id });

  const { edgestore } = useEdgeStore();
  const [isPending, setIsPending] = React.useState(false);
  const [file, setFile] = React.useState<File>();

  const [form, setForm] = React.useState<ProjectSettingsForm>({
    name: project.name,
    description: project.description || "",
    status: project.status,
    platform: project.platform || "Other",
    icon: project.icon || "",
    isCollaborative: !!project.isCollaborative,
    projectImage: project.projectImage || "",
    startDate: project.startDate,
    endDate: project.endDate,
    isArchived: !!project.isArchived,
  });

  const updateForm = React.useCallback((updates: Partial<ProjectSettingsForm>) => {
    setForm((prev) => ({ ...prev, ...updates }));
  }, []);

  const onChangeImage = React.useCallback((nextFile?: File) => {
    if (nextFile) {
      const validation = isSafeFile(nextFile);
      if (!validation.safe) {
        toast.error(validation.reason || "File is not safe.");
        return;
      }
      setFile(nextFile);
      return;
    }
    setFile(undefined);
    updateForm({ projectImage: "" });
  }, [updateForm]);

  const onSave = React.useCallback(async () => {
    if (!form.name.trim()) {
      toast.error("Project name is required");
      return;
    }

    try {
      setIsPending(true);
      let imageUrl = form.projectImage;

      if (file) {
        const res = await edgestore.publicFiles.upload({
          file,
          options: {
            replaceTargetUrl: project.projectImage,
          },
        });
        imageUrl = res.url;
      }

      const cleanedName = stripHtml(form.name);
      const cleanedDescription = form.description ? stripHtml(form.description) : "";

      await update({
        id: project._id,
        ...form,
        name: cleanedName,
        description: cleanedDescription,
        projectImage: imageUrl,
      });

      toast.success("Project updated successfully");
      
      // Update state lokal agar input field langsung bersih
      setForm(prev => ({
        ...prev,
        name: cleanedName,
        description: cleanedDescription,
        projectImage: imageUrl
      }));

      setFile(undefined);
    } catch (error) {
      toast.error("Failed to update project");
      console.error(error);
    } finally {
      setIsPending(false);
    }
  }, [edgestore.publicFiles, file, form, project._id, project.projectImage, update]);

  const onDelete = React.useCallback(async () => {
    try {
      setIsPending(true);

      // Delete from NestJS / PostgreSQL (safely catching errors in case it wasn't registered)
      try {
        await projectsService.removeProject(project._id);
      } catch (err) {
        console.error("Failed to delete project from NestJS backend:", err);
      }

      // Delete from Convex
      await remove({ id: project._id });
      
      toast.success("Project deleted successfully");
      router.push("/project");
    } catch {
      toast.error("Failed to delete project");
    } finally {
      setIsPending(false);
    }
  }, [project._id, remove, router]);

  const onLeave = React.useCallback(async () => {
    try {
      setIsPending(true);
      await leave({ projectId: project._id });
      toast.success("You left the project");
      router.push("/monitoring");
    } catch {
      toast.error("Failed to leave project");
    } finally {
      setIsPending(false);
    }
  }, [leave, project._id, router]);

  const canLeaveProject = !!currentMember &&
    currentMember.role !== ROLES.PIC &&
    currentMember.position !== USER_POSITION.ADMIN;

  const canDeleteProject = !!currentMember && (
    currentMember.role === ROLES.PIC ||
    currentMember.position === USER_POSITION.ADMIN
  );

  return {
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
  };
};

