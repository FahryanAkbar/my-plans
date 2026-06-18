"use client";

import { useState } from "react";
import Link from "next/link";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib";
import {
  ChevronDown,
  Edit2,
  Globe,
  PlusCircle,
  Trash,
  Trash2,
  X,
} from "lucide-react";
import {
  Button,
  Switch,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Checkbox,
  Badge,
  Typography,
} from "@/components/atoms";
import { MonitoringSetupForm } from "./monitoring-setup-form";
import { ENV_BADGE, ENV_LABEL, NETWORK_LABEL } from "@/lib";
import { useMonitoringTab } from "@/hooks";
import { MonitoringConfig } from "@/types/features";

interface ConfigRowProps {
  config: MonitoringConfig;
  selected: boolean;
  onSelect: (id: string, checked: boolean) => void;
  onEdit: (config: MonitoringConfig) => void;
  onToggle: (config: MonitoringConfig) => void;
  onSoftDel: (config: MonitoringConfig) => void;
  onHardDel: (config: MonitoringConfig) => void;
}

const ConfigRow = ({
  config,
  selected,
  onSelect,
  onEdit,
  onToggle,
  onSoftDel,
  onHardDel,
}: ConfigRowProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        "group flex flex-col justify-between rounded-xl border p-4 transition-all duration-300",
        "bg-card border-border hover:border-border/80 hover:shadow-md",
        selected ? "border-primary/30 bg-primary/5" : "bg-card",
      )}
    >
      {/* Card Body */}
      <div className="flex items-start gap-3">
        <Checkbox
          checked={selected}
          onCheckedChange={(checked) => onSelect(config.id, checked === true)}
          className="mt-2.5 shrink-0"
        />

        <div className="min-w-0 flex-1 space-y-3">
          {/* Header Info: Icon + Name & Status */}
          <Link
            href={`/project/${config.projectId}/monitoring-website?configId=${config.id}`}
            className="flex items-start gap-3 cursor-pointer hover:opacity-80 transition-opacity group/link"
          >
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/50 transition-all duration-300",
                config.enabled
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 group-hover/link:bg-emerald-500/25 group-hover/link:text-emerald-600"
                  : "bg-muted/50 text-muted-foreground/40",
              )}
            >
              <Globe className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <Typography
                  variant="span"
                  className="text-sm font-semibold text-foreground/90 truncate block group-hover/link:text-primary transition-colors"
                  title={config.name}
                >
                  {config.name}
                </Typography>
                <Badge
                  className={cn(
                    "text-[9px] px-1.5 py-0.5 font-bold uppercase tracking-wider shrink-0",
                    ENV_BADGE[config.environment],
                  )}
                >
                  {ENV_LABEL[config.environment] ?? config.environment}
                </Badge>
                {!config.enabled && (
                  <Badge className="border-border/40 bg-muted/50 text-muted-foreground/60 text-[9px] px-1.5 py-0.5 font-bold uppercase tracking-wider shrink-0">
                    Paused
                  </Badge>
                )}
              </div>
              <Typography
                variant="caption"
                className="block truncate text-xs text-muted-foreground/60 group-hover/link:underline"
                title={config.url}
              >
                {config.url}
              </Typography>
            </div>
          </Link>

          {/* Details Accordion Button */}
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpen((v) => !v)}
              className="h-auto p-0 flex items-center gap-1 text-[10px] font-semibold text-muted-foreground/50 hover:text-muted-foreground/80 hover:bg-transparent transition-colors"
            >
              <ChevronDown
                className={cn(
                  "h-3 w-3 transition-transform duration-300",
                  open && "rotate-180",
                )}
              />
              {open ? "Hide Details" : "Show Details"}
            </Button>
          </div>

          {/* Details Content */}
          {open && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 pt-2.5 border-t border-border/40 animate-in fade-in slide-in-from-top-1 duration-200">
              {[
                {
                  label: "Interval",
                  value: `${config.interval / 1000 / 60} min`,
                },
                {
                  label: "Network",
                  value:
                    NETWORK_LABEL[config.networkProfile] ??
                    config.networkProfile,
                },
                { label: "Timeout", value: `${config.timeout} ms` },
                { label: "Expect HTTP", value: `${config.expectedStatus}` },
                { label: "SSL Check", value: config.checkSsl ? "Yes" : "No" },
                { label: "Engine", value: config.engine },
              ].map(({ label, value }) => (
                <div key={label} className="space-y-0.5">
                  <Typography
                    variant="caption"
                    className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/40 block"
                  >
                    {label}
                  </Typography>
                  <Typography
                    variant="caption"
                    className="text-[11px] font-semibold text-foreground/75 block truncate"
                  >
                    {value}
                  </Typography>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Card Footer: Toggle Switch + Actions */}
      <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
        {/* Toggle Switch */}
        <div className="flex items-center gap-2">
          <Switch
            checked={config.enabled}
            onCheckedChange={() => onToggle(config)}
            title={config.enabled ? "Pause monitoring" : "Resume monitoring"}
            id={`switch-${config.id}`}
          />
          <Typography
            variant="caption"
            className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60"
          >
            {config.enabled ? "Active" : "Paused"}
          </Typography>
        </div>

        {/* Hover Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
            onClick={() => onEdit(config)}
            title="Edit"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10"
                title="Archive"
              >
                <Trash className="h-3.5 w-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Archive monitoring config?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will pause and archive <strong>{config.name}</strong>.
                  Data is preserved and the config can be restored.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onSoftDel(config)}
                  className="bg-amber-500 hover:bg-amber-600"
                >
                  Archive
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                title="Delete permanently"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete permanently?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete <strong>{config.name}</strong>{" "}
                  and all its metrics. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onHardDel(config)}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};

interface MonitoringTabProps {
  projectId: Id<"projects">;
  projectName?: string;
}

export const MonitoringTab = ({
  projectId,
  projectName,
}: MonitoringTabProps) => {
  const {
    configs,
    view,
    setView,
    editTarget,
    selected,
    bulkPending,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    handleToggle,
    handleEdit,
    handleSoftDelete,
    handleHardDelete,
    handleBulkDelete,
    handleFormSuccess,
    handleCancel,
  } = useMonitoringTab({ projectId, projectName });

  if (configs === undefined) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-xl bg-muted/30 border border-border/30"
          />
        ))}
      </div>
    );
  }

  if (view === "create" || view === "edit") {
    return (
      <div className="w-full space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Typography variant="span" className="text-muted-foreground/40">
            |
          </Typography>
          <Typography variant="h6" className="text-sm font-semibold">
            {view === "edit"
              ? "Edit Configuration"
              : "New Monitoring Configuration"}
          </Typography>
        </div>

        <MonitoringSetupForm
          key={editTarget?.id ?? 'new'}
          projectId={projectId}
          configId={editTarget?.id}
          initialValues={
            editTarget
              ? {
                  name: editTarget.name,
                  url: editTarget.url,
                  environment: editTarget.environment,
                  interval: editTarget.interval,
                  networkProfile: editTarget.networkProfile,
                  timeout: editTarget.timeout,
                  expectedStatus: editTarget.expectedStatus,
                  checkSsl: editTarget.checkSsl,
                }
              : undefined
          }
          onSuccess={handleFormSuccess}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  const activeCount = configs.filter((c) => c.enabled).length;
  const totalCount = configs.length;
  const allSelected = totalCount > 0 && selected.size === totalCount;
  const someSelected = selected.size > 0 && selected.size < totalCount;

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-400">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-0.5">
          <Typography
            variant="h6"
            className="text-sm font-semibold text-foreground"
          >
            Monitoring Configurations
          </Typography>
          <Typography
            variant="caption"
            className="text-xs text-muted-foreground/70 block"
          >
            {totalCount === 0
              ? "No configurations yet."
              : `${activeCount} active · ${totalCount} total`}
          </Typography>
        </div>

        <Button
          id="monitoring-new-btn"
          onClick={() => setView("create")}
          className="gap-2"
          size="sm"
        >
          <PlusCircle className="h-4 w-4" />
          New Configuration
        </Button>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-2 shadow-xs">
          <Typography
            variant="span"
            className="text-xs font-medium text-muted-foreground"
          >
            {selected.size} selected
          </Typography>
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSelection}
              className="h-8 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={bulkPending}
                  className="h-8 text-xs text-destructive border-destructive/20 hover:bg-destructive/10 hover:border-destructive font-medium gap-1.5"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {bulkPending ? "Deleting..." : `Delete ${selected.size}`}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Delete {selected.size} configuration(s)?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    All selected monitoring configurations and their metrics
                    will be permanently deleted. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleBulkDelete}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Delete All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}

      {totalCount === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border/50 bg-muted/10 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted/30 text-muted-foreground/40">
            <Globe className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <Typography
              variant="largeText"
              className="text-sm font-semibold text-foreground/70 block"
            >
              No monitoring configured
            </Typography>
            <Typography
              variant="caption"
              className="text-xs text-muted-foreground/60 block"
            >
              Add a configuration to start monitoring your website uptime and
              performance.
            </Typography>
          </div>
          <Button onClick={() => setView("create")} size="sm" className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Add Configuration
          </Button>
        </div>
      )}

      {/* ── Config list ── */}
      {totalCount > 0 && (
        <div className="space-y-3.5">
          {/* Select all */}
          <label className="flex cursor-pointer w-fit items-center gap-2 text-xs text-muted-foreground/70 hover:text-muted-foreground transition-colors select-none">
            <Checkbox
              checked={someSelected ? "indeterminate" : allSelected}
              onCheckedChange={(checked) => toggleSelectAll(checked === true)}
            />
            <Typography variant="span">Select all</Typography>
          </label>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {configs.map((config) => (
              <ConfigRow
                key={config.id}
                config={config}
                selected={selected.has(config.id)}
                onSelect={toggleSelect}
                onEdit={handleEdit}
                onToggle={handleToggle}
                onSoftDel={handleSoftDelete}
                onHardDel={handleHardDelete}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
