/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "convex/react";
import { useMediaQuery } from "usehooks-ts";
import { api } from "@/convex/_generated/api";
import { 
  CalendarIcon, 
  Flag, 
  LayoutGrid, 
  User, 
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  LucideIcon,
  Clock8,
  HelpCircle
} from "lucide-react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";

import {
  Button,
  Textarea,
  Calendar,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Typography,
} from "@/components/atoms";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/molecules";

import { 
  TASK_TYPE, 
  TASK_STATUS, 
  TASK_PRIORITY,
  TaskStatus,
  TASK_ESTIMATION_SIZES,
  TASK_TIME_PRESETS,
  ROLES,
  USER_POSITION
} from "@/lib";
import { 
  CreateTaskFormValues, 
  createTaskFormSchema
} from "@/lib";
import { cn } from "@/lib";
import { stripHtml } from "@/lib/utils";
import { TaskCardProps, ProjectMember } from "../task-card";

interface CreateTaskFormProps {
  onSubmit: (values: CreateTaskFormValues) => Promise<void>;
  onCancel: () => void;
  initialStatus?: TaskStatus;
  initialData?: TaskCardProps;
  members?: ProjectMember[];
}

const HOURS_LIMIT_WARNING = "It is prohibited to exceed 720 hours.";
const LEADING_ZERO_WARNING = "Format 00000 is not allowed.";
const POINTS_LIMIT_WARNING = "Points must not exceed 150.";

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


export const CreateTaskForm = ({
  onSubmit,
  onCancel,
  initialStatus,
  initialData,
  members = []
}: CreateTaskFormProps) => {
  const MAX_POINTS_INPUT = 150;
  const MAX_HOURS_INPUT = 720;
  const clampToMax = (value: number, max = MAX_HOURS_INPUT) =>
    Math.min(max, value);

  const isMobile = useMediaQuery("(max-width: 768px)");
  const isEditMode = !!initialData;
  const currentUser = useQuery(api.users.getCurrentUser);
  
  const assignableMembers = useMemo(() => {
    if (!members) return [];
    if (!currentUser) return members;

    const currentMember = members.find(m => m.userId === currentUser._id);
    if (!currentMember) return members;

    const isCurrentUserPicOrAdmin = 
      currentMember.role === ROLES.PIC || 
      currentMember.position === USER_POSITION.ADMIN

    if (isCurrentUserPicOrAdmin) {
      return members;
    }

    return members.filter(m => 
      m.role !== ROLES.PIC && 
      m.position !== USER_POSITION.ADMIN
    );
  }, [members, currentUser]);

  const [isLoading, setIsLoading] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [pointsWarning, setPointsWarning] = useState<string | null>(null);
  const [estimatedHoursWarning, setEstimatedHoursWarning] = useState<string | null>(null);
  const [actualHoursWarning, setActualHoursWarning] = useState<string | null>(null);
  const [form, setForm] = useState<CreateTaskFormValues>({
    title: "",
    description: "",
    status: initialStatus || TASK_STATUS.TODO,
    priority: TASK_PRIORITY.MEDIUM,
    type: TASK_TYPE.TASK,
    scoreValue: 0,
    watchers: [],
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title,
        description: initialData.description || "",
        status: initialData.status,
        priority: initialData.priority,
        type: initialData.type,
        scoreValue: initialData.scoreValue || 0,
        assigneeId: initialData.assigneeId,
        watchers: initialData.watchers || [],
        startDate: initialData.startDate,
        dueDate: initialData.dueDate,
        estimatedHours: initialData.estimatedHours,
        actualHours: initialData.actualHours,
      });
    } else if (initialStatus) {
      setForm(prev => ({ ...prev, status: initialStatus }));
    } else {
       setForm({
        title: "",
        description: "",
        status: TASK_STATUS.TODO,
        priority: TASK_PRIORITY.MEDIUM,
        type: TASK_TYPE.TASK,
        scoreValue: 0,
        watchers: [],
       });
    }
  }, [initialData, initialStatus]);

  const selectedWatchers = useMemo(
    () => members.filter((member) => (form.watchers || []).includes(member.userId)),
    [members, form.watchers]
  );
  const hasInputWarnings = Boolean(pointsWarning || estimatedHoursWarning || actualHoursWarning);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = createTaskFormSchema.safeParse(form);
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }

    setIsLoading(true);
    try {
      const cleanedTitle = stripHtml(form.title);
      const cleanedDescription = form.description ? stripHtml(form.description) : "";

      const sanitizedForm = {
        ...form,
        title: cleanedTitle,
        description: cleanedDescription,
      };

      await onSubmit(sanitizedForm);
      
      setForm(prev => ({
        ...prev,
        title: cleanedTitle,
        description: cleanedDescription,
      }));

      toast.success(isEditMode ? "Task updated successfully" : "Task created successfully");
    } catch (error) {
      toast.error(isEditMode ? "Failed to update task" : "Failed to create task");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-500">
      <div className="space-y-2">
        <input
          autoFocus
          placeholder="Task title"
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
              <Button type="button" variant="ghost" size="sm" className="h-8 gap-2 hover:bg-muted/50 rounded-lg">
                <div className={cn("w-2 h-2 rounded-full", 
                  form.status === TASK_STATUS.DONE ? "bg-green-500" : "bg-blue-500"
                )} />
                {form.status.replace("_", " ")}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {Object.values(TASK_STATUS).map((status) => (
                <DropdownMenuItem 
                  key={status} 
                  onClick={() => {
                    const updates: Partial<CreateTaskFormValues> = { status };
                    // UX Improvement: Auto-set startDate if moving to In Progress and it's empty
                    if (status === TASK_STATUS.IN_PROGRESS && !form.startDate) {
                      updates.startDate = new Date().getTime();
                    }
                    setForm({ ...form, ...updates });
                  }}
                >
                  {status.replace("_", " ")}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-4 group">
          <FieldLabel icon={AlertCircle} label="Priority" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" size="sm" className="h-8 gap-2 hover:bg-muted/50 rounded-lg">
                <Flag className={cn("h-3.5 w-3.5", 
                  form.priority === TASK_PRIORITY.HIGH ? "text-red-500" : 
                  form.priority === TASK_PRIORITY.MEDIUM ? "text-amber-500" : "text-blue-500"
                )} />
                {form.priority}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {Object.values(TASK_PRIORITY).map((priority) => (
                <DropdownMenuItem key={priority} onClick={() => setForm({ ...form, priority })}>
                  {priority}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-4 group">
          <FieldLabel icon={LayoutGrid} label="Type" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" size="sm" className="h-8 gap-2 hover:bg-muted/50 rounded-lg uppercase text-[10px] font-bold">
                {form.type}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 max-h-60 overflow-y-auto">
              {Object.values(TASK_TYPE).map((type) => (
                <DropdownMenuItem key={type} onClick={() => setForm({ ...form, type })}>
                  {type}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-4 group">
          <FieldLabel icon={User} label="Assignee" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" size="sm" className="h-8 gap-2 hover:bg-muted/50 rounded-lg">
                {form.assigneeId ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                       {members.find(m => m.userId === form.assigneeId)?.imageUrl ? (
                         <img src={members.find(m => m.userId === form.assigneeId)?.imageUrl} alt="" className="w-full h-full object-cover" />
                       ) : (
                         <User className="h-3 w-3 text-primary" />
                       )}
                    </div>
                    <span className="text-sm">
                      {members.find(m => m.userId === form.assigneeId)?.fullName || "Unknown"}
                    </span>
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
              {assignableMembers.map((member) => (
                <DropdownMenuItem 
                  key={member.userId} 
                  onClick={() => setForm({ ...form, assigneeId: member.userId })}
                  className="gap-2"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                    {member.imageUrl ? (
                      <img src={member.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-3.5 w-3.5 text-primary" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{member.fullName}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">{member.role}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-4 group">
          <FieldLabel icon={Users} label="Watchers" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" size="sm" className="h-8 gap-2 hover:bg-muted/50 rounded-lg">
                {selectedWatchers.length > 0 ? (
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {selectedWatchers.slice(0, 3).map((watcher) => (
                        <div
                          key={watcher.userId}
                          className="h-6 w-6 rounded-full border-2 border-background bg-primary/10 overflow-hidden flex items-center justify-center"
                          title={watcher.fullName}
                        >
                          {watcher.imageUrl ? (
                            <img src={watcher.imageUrl} alt={watcher.fullName} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-[10px] font-bold text-primary">
                              {watcher.fullName.slice(0, 1).toUpperCase()}
                            </span>
                          )}
                        </div>
                      ))}
                      {selectedWatchers.length > 3 && (
                        <div className="h-6 w-6 rounded-full border-2 border-background bg-muted text-[10px] font-bold flex items-center justify-center">
                          +{selectedWatchers.length - 3}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {selectedWatchers.length} watcher{selectedWatchers.length > 1 ? "s" : ""}
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground/60 italic">No watchers</span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72 max-h-72 overflow-y-auto">
              <DropdownMenuItem onClick={() => setForm({ ...form, watchers: [] })}>
                Clear watchers
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {members.map((member) => {
                const isSelected = (form.watchers || []).includes(member.userId);
                return (
                  <DropdownMenuItem
                    key={member.userId}
                    onClick={() => {
                      const currentWatchers = form.watchers || [];
                      const nextWatchers = isSelected
                        ? currentWatchers.filter((id) => id !== member.userId)
                        : [...currentWatchers, member.userId];
                      setForm({ ...form, watchers: nextWatchers });
                    }}
                    className="gap-2"
                  >
                    <div className={cn(
                      "h-4 w-4 rounded border flex items-center justify-center text-[10px] font-bold",
                      isSelected ? "bg-primary border-primary text-primary-foreground" : "border-border text-transparent"
                    )}>
                      ✓
                    </div>
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                      {member.imageUrl ? (
                        <img src={member.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User className="h-3.5 w-3.5 text-primary" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{member.fullName}</span>
                      <span className="text-[10px] text-muted-foreground uppercase">{member.role}</span>
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-4 group">
          <FieldLabel icon={CalendarIcon} label="Timeline" />
          <div className="flex flex-wrap items-center gap-2">
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button type="button" variant="ghost" size="sm" className="h-8 gap-2 hover:bg-muted/50 rounded-lg">
                  {form.startDate ? (
                    <span className="flex items-center gap-2 whitespace-nowrap">
                      {format(form.startDate, "dd MMM")}
                      {form.dueDate && (
                        <>
                          <span className="text-muted-foreground/30">—</span>
                          {format(form.dueDate, "dd MMM yyyy")}
                        </>
                      )}
                    </span>
                  ) : (
                    "Set timeline"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  disabled={{ before: new Date(new Date().setHours(0, 0, 0, 0)) }}
                  selected={{
                    from: form.startDate ? new Date(form.startDate) : undefined,
                    to: form.dueDate ? new Date(form.dueDate) : undefined,
                  }}
                  onSelect={(range: DateRange | undefined) => {
                    setForm({
                      ...form,
                      startDate: range?.from?.getTime(),
                      dueDate: range?.to?.getTime(),
                    });

                    // Auto-close when range is complete
                    if (range?.from && range?.to) {
                      setIsCalendarOpen(false);
                    }
                  }}
                  numberOfMonths={isMobile ? 1 : 2}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            {!form.startDate && (
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                className="h-7 px-2 text-[10px] font-bold text-primary hover:bg-primary/5 border-primary/20"
                onClick={() => setForm({ ...form, startDate: new Date().getTime() })}
              >
                Start Today
              </Button>
            )}

            {form.startDate && form.dueDate && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/5 text-primary border border-primary/10 whitespace-nowrap">
                <Clock8 className="h-3 w-3 shrink-0" />
                <span className="text-[10px] font-bold">
                  {Math.ceil(((form.dueDate || 0) - (form.startDate || 0)) / (1000 * 60 * 60 * 24)) + 1} days
                </span>
              </div>
            )}

            {(form.startDate || form.dueDate) && (
               <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-[10px] font-bold text-muted-foreground/40 hover:text-red-500"
                onClick={() => setForm({ ...form, startDate: undefined, dueDate: undefined })}
              >
                Reset
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 group">
          <FieldLabel icon={Clock} label="Points" />
          <div className="flex items-center gap-2">
              <input 
              type="number"
              min={0}
              max={MAX_POINTS_INPUT}
              className="w-12 bg-transparent border-none text-sm focus:ring-0 p-0 font-medium placeholder:text-primary/50 placeholder:italic"
              value={form.scoreValue === 0 ? "" : form.scoreValue}
              placeholder="Auto"
              onChange={(e) => {
                const rawValue = e.target.value;
                if (!rawValue) {
                  setPointsWarning(null);
                  setForm({ ...form, scoreValue: 0 });
                  return;
                }
                if (/^0{2,}$/.test(rawValue)) {
                  setPointsWarning(LEADING_ZERO_WARNING);
                  setForm({ ...form, scoreValue: 0 });
                  return;
                }
                const val = parseInt(rawValue);
                if (!isNaN(val) && val > MAX_POINTS_INPUT) {
                  setPointsWarning(POINTS_LIMIT_WARNING);
                } else {
                  setPointsWarning(null);
                }
                const safeValue = isNaN(val) ? 0 : clampToMax(Math.max(0, val), MAX_POINTS_INPUT);
                setForm({ ...form, scoreValue: safeValue });
              }}
            />
            <span className="text-xs text-muted-foreground">pts</span>
          </div>
          {pointsWarning && (
            <Typography className="text-xs text-amber-500 animate-in fade-in-0 duration-200">{pointsWarning}</Typography>
          )}
        </div>

        <div className="flex flex-col gap-3 group">
          <div className="flex items-center gap-4">
            <FieldLabel 
              icon={Clock} 
              label="Estimated" 
              help="Target waktu pengerjaan yang direncanakan di awal." 
            />
            <div className="flex items-center gap-2">
              <input 
                type="number"
                step="0.5"
                min={0}
                max={MAX_HOURS_INPUT}
                className="w-12 bg-transparent border-none text-sm focus:ring-0 p-0 font-medium"
                value={form.estimatedHours ?? ""}
                placeholder="0"
                onChange={(e) => {
                  const rawValue = e.target.value;
                  if (!rawValue) {
                    setEstimatedHoursWarning(null);
                    setForm({ ...form, estimatedHours: undefined });
                    return;
                  }
                  if (/^0{2,}$/.test(rawValue)) {
                    setEstimatedHoursWarning(LEADING_ZERO_WARNING);
                    setForm({ ...form, estimatedHours: undefined });
                    return;
                  }
                  const parsed = parseFloat(rawValue);
                  if (!isNaN(parsed) && parsed > MAX_HOURS_INPUT) {
                    setEstimatedHoursWarning(HOURS_LIMIT_WARNING);
                  } else {
                    setEstimatedHoursWarning(null);
                  }
                  const safeValue = isNaN(parsed) ? undefined : clampToMax(Math.max(0, parsed));
                  setForm({ ...form, estimatedHours: safeValue });
                }}
              />
              <span className="text-xs text-muted-foreground">hrs</span>
              {estimatedHoursWarning && (
                <p className="text-xs text-amber-500 animate-in fade-in-0 duration-200">{estimatedHoursWarning}</p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2 sm:mt-0 sm:ml-36">
            {TASK_ESTIMATION_SIZES.map((size) => (
              <Button
                key={size.label}
                type="button"
                variant={form.estimatedHours === size.value ? "secondary" : "outline"}
                size="sm"
                className={cn(
                  "h-7 px-2 text-[10px] font-bold transition-all",
                  form.estimatedHours === size.value ? "bg-primary/10 border-primary/20 text-primary" : "text-muted-foreground/60 hover:text-foreground"
                )}
                onClick={() =>
                  {
                    setEstimatedHoursWarning(null);
                    setForm({
                      ...form,
                      estimatedHours: clampToMax(Math.max(0, size.value), MAX_HOURS_INPUT),
                    });
                  }
                }
                title={size.description}
              >
                {size.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 group">
          <div className="flex items-center gap-4">
            <FieldLabel 
              icon={Clock} 
              label="Actual" 
              help="Total waktu yang sudah benar-benar terpakai untuk mengerjakan tugas ini." 
            />
            <div className="flex items-center gap-2">
              <input 
                type="number"
                step="0.01"
                min={0}
                max={MAX_HOURS_INPUT}
                className="w-12 bg-transparent border-none text-sm focus:ring-0 p-0 font-medium text-primary"
                value={form.actualHours ?? ""}
                placeholder="0"
                onChange={(e) => {
                  const rawValue = e.target.value;
                  if (!rawValue) {
                    setActualHoursWarning(null);
                    setForm({ ...form, actualHours: undefined });
                    return;
                  }
                  if (/^0{2,}$/.test(rawValue)) {
                    setActualHoursWarning(LEADING_ZERO_WARNING);
                    setForm({ ...form, actualHours: undefined });
                    return;
                  }
                  const parsed = parseFloat(rawValue);
                  if (!isNaN(parsed) && parsed > MAX_HOURS_INPUT) {
                    setActualHoursWarning(HOURS_LIMIT_WARNING);
                  } else {
                    setActualHoursWarning(null);
                  }
                  const safeValue = isNaN(parsed) ? undefined : clampToMax(Math.max(0, parsed));
                  setForm({ ...form, actualHours: safeValue });
                }}
              />
              <span className="text-xs text-muted-foreground">hrs</span>
              {actualHoursWarning && (
                <p className="text-xs text-amber-500 animate-in fade-in-0 duration-200">{actualHoursWarning}</p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2 sm:mt-0 sm:ml-36">
            {TASK_TIME_PRESETS.map((preset) => (
              <Button
                key={preset.label}
                type="button"
                variant="outline"
                size="sm"
                className="h-7 px-2 text-[10px] font-bold text-muted-foreground/60 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all"
                onClick={() => {
                  const current = form.actualHours || 0;
                  const newVal = preset.label === "1d" ? preset.value : current + preset.value;
                  setActualHoursWarning(newVal > MAX_HOURS_INPUT ? HOURS_LIMIT_WARNING : null);
                  setForm({ ...form, actualHours: clampToMax(Math.max(0, newVal), MAX_HOURS_INPUT) });
                }}
              >
                {preset.label}
              </Button>
            ))}
            {(form.actualHours ?? 0) > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-[10px] font-bold text-red-500/60 hover:text-red-500 hover:bg-red-500/5"
                onClick={() => {
                  setActualHoursWarning(null);
                  setForm({ ...form, actualHours: 0 });
                }}
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </div>

      <DropdownMenuSeparator className="my-6" />

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          <Typography variant="smallText" className="font-semibold">Description</Typography>
        </div>
        <Textarea
          placeholder="Add more details about this task..."
          className="min-h-37.5 bg-muted/20 border-none focus-visible:ring-1 focus-visible:ring-primary/20 rounded-xl resize-none p-4"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>

      <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-6 border-t border-border/10">
        <Button 
          variant="outline" 
          onClick={onCancel}
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="default" 
          className="w-full sm:w-auto px-8"
          disabled={isLoading || !form.title || hasInputWarnings}
        >
          {isLoading ? (isEditMode ? "Updating..." : "Creating...") : (isEditMode ? "Update Task" : "Create Task")}
        </Button>
      </div>
    </form>
  );
};
