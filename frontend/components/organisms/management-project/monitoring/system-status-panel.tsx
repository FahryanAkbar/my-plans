"use client";

import * as React from "react";
import {
  Activity,
  Database,
  HardDrive,
  RefreshCw,
  Server,
  Wifi,
} from "lucide-react";

import { Badge, Button, Card, Typography } from "@/components/atoms";
import { useApiMetadata, useSystemHealth, useWorkerStatus } from "@/hooks";
import { cn } from "@/lib";
import type { DatabaseHealth, WorkerStatus } from "@/types/features";

type WorkerRuntimeStatus = "Active" | "Stale" | "Offline";

const HEALTH_SERVICES: {
  key: "postgres" | "redis" | "influxdb";
  label: string;
  icon: React.ReactNode;
}[] = [
  { key: "postgres", label: "PostgreSQL", icon: <Database className="h-4 w-4" /> },
  { key: "redis", label: "Redis", icon: <Wifi className="h-4 w-4" /> },
  { key: "influxdb", label: "InfluxDB", icon: <HardDrive className="h-4 w-4" /> },
];

export function SystemStatusPanel() {
  const {
    metadata,
    isLoading: isMetadataLoading,
    isRefreshing: isMetadataRefreshing,
    error: metadataError,
    refetch: refetchMetadata,
  } = useApiMetadata();
  const {
    health,
    isLoading: isHealthLoading,
    isRefreshing: isHealthRefreshing,
    error: healthError,
    refetch: refetchHealth,
  } = useSystemHealth();
  const {
    workers,
    isLoading: isWorkersLoading,
    isRefreshing: isWorkersRefreshing,
    error: workersError,
    refetch: refetchWorkers,
  } = useWorkerStatus();

  const isLoading = isMetadataLoading || isHealthLoading || isWorkersLoading;
  const isRefreshing = isMetadataRefreshing || isHealthRefreshing || isWorkersRefreshing;
  const hasError = Boolean(metadataError || healthError || workersError);
  const serviceDownCount = health
    ? Object.values(health.details).filter((item) => item.status === "DOWN").length
    : 0;
  const overallStatus =
    health?.status === "UP" && workers.length > 0
      ? "Operational"
      : health?.status === "DOWN" || serviceDownCount > 0
        ? "Partial Outage"
        : workers.length === 0
          ? "Worker Offline"
          : "Unknown";

  const latestTimestamp = [metadata?.timestamp, health ? new Date().toISOString() : undefined, ...workers.map((worker) => worker.timestamp)]
    .filter((value): value is string => Boolean(value))
    .sort((a, b) => Date.parse(b) - Date.parse(a))[0];

  const handleRefresh = () => {
    refetchMetadata();
    refetchHealth();
    refetchWorkers();
  };

  return (
    <Card className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={overallStatus} />
            {isRefreshing && (
              <Badge variant="info" className="gap-1">
                <RefreshCw className="h-3 w-3 animate-spin" />
                Refreshing
              </Badge>
            )}
          </div>
          <div>
            <Typography variant="h5" className="text-lg font-semibold">
              Monitoring Status
            </Typography>
            <Typography variant="smallText" className="text-muted-foreground">
              API gateway, storage dependencies, and background worker runtime.
            </Typography>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>{metadata?.name ?? "API Gateway"} {metadata?.version ? `v${metadata.version}` : ""}</span>
            <span>Auto-refresh 30s</span>
            <span>Last updated {latestTimestamp ? formatRelativeTime(latestTimestamp) : "unknown"}</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 gap-2 self-start"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {hasError && (
        <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-700 dark:text-amber-300">
          Unable to refresh all system status data. Showing the latest available state.
        </div>
      )}

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {HEALTH_SERVICES.map((service) => (
          <HealthServiceCard
            key={service.key}
            label={service.label}
            icon={service.icon}
            health={health?.details[service.key]}
            isLoading={isLoading}
          />
        ))}
      </div>

      <div className="mt-5 rounded-xl border border-border bg-background">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div>
            <Typography variant="span" className="text-sm font-semibold">
              Worker Runtime
            </Typography>
            <Typography variant="caption" className="block text-muted-foreground">
              {workers.length} active worker{workers.length === 1 ? "" : "s"} detected
            </Typography>
          </div>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </div>

        {workers.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <Server className="mx-auto h-8 w-8 text-muted-foreground/50" />
            <Typography variant="span" className="mt-3 block text-sm font-semibold">
              No active workers detected
            </Typography>
            <Typography variant="caption" className="mt-1 block text-muted-foreground">
              Monitoring jobs may not be running, or all heartbeat keys have expired.
            </Typography>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-175 text-sm">
              <thead className="bg-muted/40 text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Hostname</th>
                  <th className="px-4 py-3 text-left font-semibold">PID</th>
                  <th className="px-4 py-3 text-left font-semibold">Active Jobs</th>
                  <th className="px-4 py-3 text-left font-semibold">Memory</th>
                  <th className="px-4 py-3 text-left font-semibold">Uptime</th>
                  <th className="px-4 py-3 text-left font-semibold">Last Heartbeat</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {workers.map((worker) => (
                  <WorkerRow key={`${worker.hostname}-${worker.pid}`} worker={worker} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Card>
  );
}

function HealthServiceCard({
  label,
  icon,
  health,
  isLoading,
}: {
  label: string;
  icon: React.ReactNode;
  health?: DatabaseHealth;
  isLoading: boolean;
}) {
  const status = health?.status ?? "UNKNOWN";
  const isUp = status === "UP";

  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-muted p-2 text-muted-foreground">{icon}</span>
          <div>
            <Typography variant="span" className="block text-sm font-semibold">
              {label}
            </Typography>
            <Typography variant="caption" className="block text-muted-foreground">
              {isLoading ? "Checking..." : health?.latencyMs !== undefined ? `${health.latencyMs} ms` : "No latency"}
            </Typography>
          </div>
        </div>
        <Badge variant={isUp ? "success" : status === "DOWN" ? "destructive" : "neutral"}>
          {status}
        </Badge>
      </div>
      {health?.error && (
        <p className="mt-3 line-clamp-2 text-xs text-destructive">{health.error}</p>
      )}
    </div>
  );
}

function WorkerRow({ worker }: { worker: WorkerStatus }) {
  const status = getWorkerRuntimeStatus(worker.timestamp);

  return (
    <tr className="border-t border-border first:border-t-0">
      <td className="px-4 py-3 font-medium text-foreground">{worker.hostname}</td>
      <td className="px-4 py-3 text-muted-foreground">{worker.pid}</td>
      <td className="px-4 py-3 text-muted-foreground">{worker.activeJobs}</td>
      <td className="px-4 py-3 text-muted-foreground">{worker.memory} MB</td>
      <td className="px-4 py-3 text-muted-foreground">{formatDuration(worker.uptime)}</td>
      <td className="px-4 py-3 text-muted-foreground">{formatRelativeTime(worker.timestamp)}</td>
      <td className="px-4 py-3">
        <WorkerStatusBadge status={status} />
      </td>
    </tr>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variant =
    status === "Operational" ? "success" : status === "Unknown" ? "neutral" : "warning";

  return (
    <Badge variant={variant} className="gap-1.5">
      <span className="h-2 w-2 rounded-full bg-current" />
      {status}
    </Badge>
  );
}

function WorkerStatusBadge({ status }: { status: WorkerRuntimeStatus }) {
  const variant = status === "Active" ? "success" : status === "Stale" ? "warning" : "destructive";

  return <Badge variant={variant}>{status}</Badge>;
}

function getWorkerRuntimeStatus(timestamp: string): WorkerRuntimeStatus {
  const ageSeconds = (Date.now() - Date.parse(timestamp)) / 1000;
  if (ageSeconds <= 20) return "Active";
  if (ageSeconds <= 60) return "Stale";
  return "Offline";
}

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}

function formatRelativeTime(timestamp: string) {
  const ageSeconds = Math.max(0, Math.floor((Date.now() - Date.parse(timestamp)) / 1000));
  if (ageSeconds < 60) return `${ageSeconds}s ago`;

  const ageMinutes = Math.floor(ageSeconds / 60);
  if (ageMinutes < 60) return `${ageMinutes}m ago`;

  const ageHours = Math.floor(ageMinutes / 60);
  if (ageHours < 24) return `${ageHours}h ago`;

  const ageDays = Math.floor(ageHours / 24);
  return `${ageDays}d ago`;
}
