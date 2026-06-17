"use client";

import React, { useState, useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { 
  AlertCircle, 
  CheckCircle2, 
  Flag, 
  User, 
  HelpCircle,
  History,
  Zap,
  Tag,
  Link2,
  Paperclip,
  Upload,
  FileIcon,
  X,
  Loader2,
  LucideIcon
} from "lucide-react";
import { toast } from "sonner";

import {
  Button,
  Textarea,
  Typography,
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/atoms";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/molecules";
import { TagInput } from "./tag-input";
import { TaskSelector } from "./task-selector";
import { Id } from "@/convex/_generated/dataModel";

import { 
  ISSUE_STATUS, 
  ISSUE_SEVERITY, 
  ISSUE_PRIORITY,
  ISSUE_STATUS_LABELS,
  ISSUE_SEVERITY_LABELS,
  ISSUE_PRIORITY_LABELS,
  IssueStatus,
  IssueSeverity,
  IssuePriority
} from "@/lib";
import { 
  CreateIssueFormValues, 
  createIssueFormSchema 
} from "@/lib";
import { IssueWithDetails } from "@/hooks";
import { cn, stripHtml } from "@/lib";
import { useProjectPermission } from "@/hooks";
import { ROLES, USER_POSITION } from "@/lib";

export interface TaskProjectMember {
  userId: string;
  fullName: string;
  imageUrl?: string;
  role: string;
  position: string;
  joinedAt: number;
}

interface IssueFormProps {
  projectId: Id<"projects">;
  onSubmit: (values: CreateIssueFormValues) => Promise<void>;
  onCancel: () => void;
  initialStatus?: IssueStatus;
  initialData?: IssueWithDetails;
  members?: TaskProjectMember[]; 
}

const FieldLabel = ({ icon: Icon, label, help }: { icon: LucideIcon, label: string, help?: string }) => (
  <div className="flex items-center gap-2 text-muted-foreground w-28 sm:w-32 shrink-0 group/label relative">
    <Icon className="h-4 w-4" />
    <span className="text-sm font-medium">{label}</span>
    {help && (
      <div className="relative group/help">
        <HelpCircle className="h-3 w-3 text-muted-foreground/40 hover:text-primary transition-colors cursor-help" />
        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 w-48 p-2 bg-popover border border-border rounded-lg shadow-xl opacity-0 invisible group-hover/help:opacity-100 group-hover/help:visible transition-all z-50 text-[10px] leading-normal font-normal text-foreground">
          {help}
        </div>
      </div>
    )}
  </div>
);

export const IssueForm = ({
  projectId,
  onSubmit,
  onCancel,
  initialStatus,
  initialData,
  members = []
}: IssueFormProps) => {
  const { role: currentRole, position: currentPosition } = useProjectPermission(projectId);
  const isAdminOrPic = currentRole === ROLES.PIC || currentPosition === USER_POSITION.ADMIN;

  const filteredMembers = isAdminOrPic 
    ? members 
    : members.filter(m => m.role !== ROLES.PIC && m.position !== USER_POSITION.ADMIN);

  const isEditMode = !!initialData;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [form, setForm] = useState<CreateIssueFormValues>({
    title: "",
    description: "",
    status: initialStatus || ISSUE_STATUS.OPEN,
    severity: ISSUE_SEVERITY.MEDIUM,
    priority: ISSUE_PRIORITY.P2,
    labels: [],
    attachments: [],
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title,
        description: initialData.description || "",
        status: initialData.status as IssueStatus,
        severity: initialData.severity as IssueSeverity,
        priority: initialData.priority as IssuePriority,
        assigneeId: initialData.assigneeId,
        labels: initialData.labels || [],
        attachments: initialData.attachments || [],
        linkedTaskId: initialData.linkedTaskId,
      });
    } else if (initialStatus) {
      setForm(prev => ({ ...prev, status: initialStatus }));
    }
  }, [initialData, initialStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = createIssueFormSchema.safeParse(form);
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }

    setIsLoading(true);
    try {
      const sanitizedForm = {
        ...form,
        title: stripHtml(form.title),
        description: form.description ? stripHtml(form.description) : "",
      };

      await onSubmit(sanitizedForm);
      toast.success(isEditMode ? "Issue updated successfully" : "Issue reported successfully");
    } catch (error) {
      toast.error(isEditMode ? "Failed to update issue" : "Failed to report issue");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if ((form.attachments?.length || 0) >= 3) {
      toast.error("Maximum 3 attachments allowed");
      return;
    }

    setIsUploading(true);
    try {
      const file = files[0];
      
      // 1. Get upload URL
      const postUrl = await generateUploadUrl();

      // 2. Upload file to Convex
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      const { storageId } = await result.json();

      // 3. Add to form
      setForm(prev => ({
        ...prev,
        attachments: [...(prev.attachments || []), storageId]
      }));

      toast.success("File uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (storageId: string) => {
    setForm(prev => ({
      ...prev,
      attachments: (prev.attachments || []).filter(id => id !== storageId)
    }));
  };

  const selectedAssignee = members.find(m => m.userId === form.assigneeId);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <input
          autoFocus
          placeholder="Issue title"
          maxLength={40}
          className="w-full bg-transparent border-none text-3xl font-bold placeholder:text-muted-foreground/30 focus-visible:outline-none focus-visible:ring-0"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
      </div>

      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-4 group">
          <FieldLabel icon={CheckCircle2} label="Status" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" size="sm" className="h-8 gap-2 hover:bg-muted/50 rounded-lg px-3">
                <div className={cn("w-2 h-2 rounded-full", 
                  form.status === ISSUE_STATUS.RESOLVED ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : 
                  form.status === ISSUE_STATUS.OPEN ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" : "bg-zinc-500"
                )} />
                <span className="text-sm font-bold">{ISSUE_STATUS_LABELS[form.status]}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 p-1 rounded-xl border-border/50 shadow-xl">
              <div className="flex flex-col">
                {Object.values(ISSUE_STATUS).map((status) => {
                  const label = ISSUE_STATUS_LABELS[status as IssueStatus];
                  const isActive = form.status === status;
                  return (
                    <DropdownMenuItem 
                      key={status} 
                      onClick={() => setForm({ ...form, status: status as IssueStatus })}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-lg cursor-pointer text-xs font-semibold transition-colors",
                        isActive ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground"
                      )}
                    >
                      {label}
                    </DropdownMenuItem>
                  );
                })}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Severity Dropdown with Grid */}
        <div className="flex items-center gap-4 group">
          <FieldLabel icon={AlertCircle} label="Severity" help="The impact of this issue on the product." />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" size="sm" className="h-8 gap-2 hover:bg-muted/50 rounded-lg px-3">
                <Flag className={cn("h-4 w-4", 
                  form.severity === ISSUE_SEVERITY.CRITICAL ? "text-red-500" :
                  form.severity === ISSUE_SEVERITY.HIGH ? "text-orange-500" : 
                  form.severity === ISSUE_SEVERITY.MEDIUM ? "text-blue-500" : "text-zinc-500"
                )} />
                <span className="text-sm font-bold">{ISSUE_SEVERITY_LABELS[form.severity]}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 p-1 rounded-xl border-border/50 shadow-xl">
              <div className="flex flex-col">
                {Object.values(ISSUE_SEVERITY).map((severity) => {
                  const label = ISSUE_SEVERITY_LABELS[severity as IssueSeverity];
                  const isActive = form.severity === severity;
                  return (
                    <DropdownMenuItem 
                      key={severity} 
                      onClick={() => setForm({ ...form, severity: severity as IssueSeverity })}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-lg cursor-pointer text-xs font-semibold transition-colors",
                        isActive ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground"
                      )}
                    >
                      {label}
                    </DropdownMenuItem>
                  );
                })}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Priority Dropdown with Grid */}
        <div className="flex items-center gap-4 group">
          <FieldLabel icon={Flag} label="Priority" help="How quickly should this be addressed?" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" size="sm" className="h-8 gap-2 hover:bg-muted/50 rounded-lg px-3">
                <Flag className={cn("h-4 w-4",
                  form.priority === ISSUE_PRIORITY.P0 ? "text-red-500" : 
                  form.priority === ISSUE_PRIORITY.P1 ? "text-orange-500" : "text-blue-500"
                )} />
                <span className="text-sm font-bold">
                  {ISSUE_PRIORITY_LABELS[form.priority as IssuePriority].split(' (')[0]}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 p-1 rounded-xl border-border/50 shadow-xl">
              <div className="flex flex-col">
                {Object.values(ISSUE_PRIORITY).map((priority) => {
                  const label = ISSUE_PRIORITY_LABELS[priority as IssuePriority];
                  const isActive = form.priority === priority;
                  return (
                    <DropdownMenuItem 
                      key={priority} 
                      onClick={() => setForm({ ...form, priority: priority as IssuePriority })}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-lg cursor-pointer text-xs font-semibold transition-colors",
                        isActive ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground"
                      )}
                    >
                      {label}
                    </DropdownMenuItem>
                  );
                })}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Assignee */}
        <div className="flex items-center gap-4 group">
          <FieldLabel icon={User} label="Assignee" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" size="sm" className="h-8 gap-2 hover:bg-muted/50 rounded-lg">
                {selectedAssignee ? (
                  <div className="flex items-center gap-2">
                    <Avatar size="sm">
                      <AvatarImage src={selectedAssignee.imageUrl} />
                      <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                        {selectedAssignee.fullName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{selectedAssignee.fullName}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground/60 italic">No assignee</span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 max-h-60 overflow-y-auto">
              <DropdownMenuItem onClick={() => setForm({ ...form, assigneeId: undefined })}>
                <User className="h-4 w-4 mr-2 text-muted-foreground" />
                No assignee
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {filteredMembers.map((member) => (
                <DropdownMenuItem 
                  key={member.userId} 
                  onClick={() => setForm({ ...form, assigneeId: member.userId })}
                  className="gap-2"
                >
                  <Avatar size="sm">
                    <AvatarImage src={member.imageUrl} />
                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                      {member.fullName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{member.fullName}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">{member.role}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Labels */}
        <div className="flex items-start gap-4 pt-2">
          <FieldLabel icon={Tag} label="Labels" />
          <div className="flex-1 max-w-125">
            <TagInput 
              tags={form.labels || []} 
              onChange={(labels) => setForm({ ...form, labels })}
              placeholder="Add labels (e.g. bug, frontend, logic)..."
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/10">
          {/* Linked Task */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground group/label">
              <Link2 className="h-4 w-4" />
              <span className="text-sm font-medium">Linked Task</span>
            </div>
            <TaskSelector 
              projectId={projectId}
              selectedTaskId={form.linkedTaskId as Id<"tasks"> | undefined}
              onSelect={(taskId) => setForm({ ...form, linkedTaskId: taskId })}
            />
          </div>

          {/* Attachments */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground group/label">
              <Paperclip className="h-4 w-4" />
              <span className="text-sm font-medium">Attachments</span>
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileUpload}
              accept="image/*,.pdf,.doc,.docx,.txt"
            />

            <div className="space-y-2">
              <div 
                onClick={() => {
                  if (isUploading) return;
                  if ((form.attachments?.length || 0) >= 3) {
                    toast.error("Maximum 3 attachments allowed");
                    return;
                  }
                  fileInputRef.current?.click();
                }}
                className={cn(
                  "flex items-center justify-center h-10 px-4 rounded-xl bg-muted/20 border border-dashed border-border/50 hover:bg-muted/30 hover:border-primary/30 transition-all text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 cursor-pointer",
                  (isUploading || (form.attachments?.length || 0) >= 3) && "opacity-50 cursor-not-allowed"
                )}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-3 w-3 mr-2" />
                    { (form.attachments?.length || 0) >= 3 ? "Limit Reached" : "Upload Files" }
                  </>
                )}
              </div>
              <Typography className="text-[9px] text-muted-foreground/40 italic text-center block">
                {(form.attachments?.length || 0)}/3 files uploaded
              </Typography>

              {form.attachments && form.attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {form.attachments.map((id) => (
                    <div 
                      key={id} 
                      className="group flex items-center gap-2 px-2 py-1.5 rounded-lg bg-card border border-border/50 hover:border-primary/30 transition-all max-w-37.5"
                    >
                      <FileIcon className="h-3 w-3 text-primary shrink-0" />
                      <span className="text-[10px] truncate opacity-60">File_{id.substring(0, 5)}</span>
                      <button 
                        type="button"
                        onClick={() => removeAttachment(id)}
                        className="ml-auto opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-500/10 hover:text-red-600 rounded transition-all"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Typography variant="smallText" className="font-semibold text-muted-foreground mb-2">Description</Typography>
        <Textarea
          placeholder="Describe the issue in detail..."
          className="min-h-37.5 bg-muted/20 border-none focus-visible:ring-1 focus-visible:ring-primary/20 rounded-xl resize-none p-4"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>

      <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-6 border-t border-border/10">
        <Button variant="outline" onClick={onCancel} disabled={isLoading} className="w-full sm:w-auto">
          Cancel
        </Button>
        <Button variant="default" className="w-full sm:w-auto px-8" disabled={isLoading || !form.title}>
          {isLoading ? "Saving..." : (isEditMode ? "Update Issue" : "Report Issue")}
        </Button>
      </div>
    </form>
  );
};
