"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";

import {
  Input,
  Button,
  Textarea,
  Calendar,
  Switch,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Typography,
  Card,
  CardContent,
} from "@/components/atoms";

import {
  IconPicker
} from "@/components/molecules";

import { api } from "@/convex/_generated/api";
import { PROJECT_PLATFORM } from "@/lib/constants";

import type { ProjectPlatform } from "@/lib/constants";
import { CreateProjectInput } from "@/types/features";

import { toast } from "sonner";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash, Globe, Smartphone, Monitor, Layers } from "lucide-react";
import { cn, stripHtml } from "@/lib/utils";

type FormState = {
  name: string;
  icon?: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  platform?: ProjectPlatform;
  isCollaborative: boolean;
};

const Field = ({
  label,
  children,
  required,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) => (
  <div className="space-y-1.5">
    <p className="text-sm font-medium text-muted-foreground">
      {label}
      {required && <span className="text-destructive ml-1">*</span>}
    </p>
    {children}
  </div>
);

export const ProjectForm = ({
  onCancel
}: { onCancel?: () => void }) => {
  const router = useRouter();
  const createProject = useMutation(api.project.createProject);

  const [errors, setErrors] = useState<string[]>([]);
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);

  const [form, setForm] = useState<FormState>({
    name: "",
    icon: "",
    description: "",
    startDate: new Date(),
    endDate: undefined,
    platform: 'Web',
    isCollaborative: true,
  });

  const updateForm = (patch: Partial<FormState>) => {
    setErrors([]);
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const handleSubmit = async () => {
    const allEmpty =
      !form.name?.trim() &&
      !form.description?.trim() &&
      !form.platform &&
      !form.endDate;

    if (allEmpty) {
      toast.error("Please fill in the project details first.");
      return;
    }

    if (!form.name?.trim()) {
      toast.error("Project name is required.");
      return;
    }

    if(form.platform === undefined) {
      toast.error("Platform is required.");
      return;
    }

    if (form.endDate && form.endDate < form.startDate) {
      toast.error("End date cannot be earlier than start date.");
      return;
    }

    const promise = createProject({
      name: stripHtml(form.name),
      icon: form.icon || undefined,
      description: form.description ? stripHtml(form.description) : undefined,
      startDate: form.startDate.getTime(),
      endDate: form.endDate?.getTime(),
      platform: form.platform,
      isCollaborative: form.isCollaborative,
    } as CreateProjectInput);

    toast.promise(promise, {
      loading: "Creating project...",
      success: "Project created!",
      error: "Failed to create project",
    });

    try {
      const projectId = await promise;
      onCancel?.();
      router.push(`/project/${projectId}`);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div>
        <Typography variant="h4" className="font-semibold">
          Create new project
        </Typography>
        <Typography variant="muted">
          Fill in the details to initialize your workspace.
        </Typography>
      </div>

      <Card className="border rounded-xl">
        <CardContent className="p-4 sm:p-6 space-y-6">
          <div className="flex gap-4">
            <Field label="Icon">
              <div className="flex items-center gap-2">
                <IconPicker onChange={(icon) => updateForm({ icon })} asChild>
                  <Button 
                    variant="outline" 
                    className="h-10 aspect-square p-0 flex items-center justify-center text-xl rounded-lg border-border/50 hover:bg-muted/50 transition-colors"
                  >
                    {form.icon || <Plus className="h-4 w-4 opacity-60" />}
                  </Button>
                </IconPicker>
                {form.icon && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    onClick={() => updateForm({ icon: "" })}
                    title="Remove icon"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </Field>
            <div className="flex-1">
              <Field label="Project name" required>
                <Input
                  placeholder="e.g. Mobile Redesign Q3"
                  value={form.name}
                  maxLength={30}
                  onChange={(e) => updateForm({ name: e.target.value })}
                />
              </Field>
            </div>
          </div>
          
          <Field label="Description">
            <Textarea
              placeholder="What is this project about?"
              className="min-h-25"
              value={form.description}
              maxLength={150}
              onChange={(e) => updateForm({ description: e.target.value })}
            />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Start date" required>
              <Popover open={startOpen} onOpenChange={setStartOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between h-11 border-border/50">
                    <span className="font-medium">{format(form.startDate, "dd/MM/yyyy")}</span>
                    <CalendarIcon className="h-4 w-4 opacity-40" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-fit p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.startDate}
                    onSelect={(d) => {
                      if (!d) return;
                      setForm((p) => ({ ...p, startDate: d }));
                      setStartOpen(false);
                    }}
                    className="w-full"
                  />
                </PopoverContent>
              </Popover>
            </Field>

            <Field label="End date">
              <Popover open={endOpen} onOpenChange={setEndOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between h-11 border-border/50">
                    <span className="font-medium">
                      {form.endDate
                        ? format(form.endDate, "dd/MM/yyyy")
                        : "dd/mm/yyyy"}
                    </span>
                    <CalendarIcon className="h-4 w-4 opacity-40" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-fit p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.endDate}
                    onSelect={(d) => {
                      setForm((p) => ({ ...p, endDate: d }));
                      setEndOpen(false);
                    }}
                    disabled={(date) => date < form.startDate}
                    className="w-full"
                  />
                </PopoverContent>
              </Popover>
            </Field>
          </div>

          <Field label="Target platform" required>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { id: PROJECT_PLATFORM.WEB, label: "Web", icon: Globe },
                { id: PROJECT_PLATFORM.MOBILE, label: "Mobile", icon: Smartphone },
                { id: PROJECT_PLATFORM.DESKTOP, label: "Desktop", icon: Monitor },
                { id: PROJECT_PLATFORM.OTHER, label: "Other", icon: Layers },
              ].map((p) => (
                <Button
                  key={p.id}
                  type="button"
                  variant={form.platform === p.id ? "default" : "outline"}
                  className={cn(
                    "h-14 flex flex-col gap-1 items-center justify-center transition-all duration-200",
                    form.platform === p.id 
                      ? "ring-2 ring-primary ring-offset-2 ring-offset-background" 
                      : "border-border/50 hover:bg-muted/50"
                  )}
                  onClick={() => updateForm({ platform: p.id as ProjectPlatform })}
                >
                  <p.icon className={cn("h-4 w-4", form.platform === p.id ? "text-primary-foreground" : "text-muted-foreground")} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{p.label}</span>
                </Button>
              ))}
            </div>
          </Field>

          <div className="border-t" />

          <div className="flex items-center justify-between">
            <div>
              <Typography variant="smallText">
                Collaborative project
              </Typography>
              <Typography variant="muted" className="text-xs">
                Allow members to join and contribute.
              </Typography>
            </div>

            <Switch
              checked={form.isCollaborative}
              onCheckedChange={(v) => updateForm({ isCollaborative: v })}
            />
          </div>

          {errors.length > 0 && (
            <div className="w-full pt-4">
              <div className="p-3 border rounded-md bg-destructive/10 border-destructive/20 text-destructive">
                <ul className="list-disc list-inside text-sm font-medium">
                  {errors.map((err) => (
                    <li key={err}>{err}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 mt-2 border-t border-border/40">
            <Button variant="outline" size="default" className="w-full sm:w-auto" onClick={onCancel}>
              Cancel
            </Button>
            <Button size="default" className="w-full sm:w-auto px-8 font-semibold" onClick={handleSubmit}>
              Create project
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};