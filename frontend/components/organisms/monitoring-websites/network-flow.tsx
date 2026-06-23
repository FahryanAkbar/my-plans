"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/atoms";
import {
  Search,
  Shuffle,
  Lock,
  Hourglass,
  Download,
  Cpu,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  Globe,
} from "lucide-react";

import {
  HeaderChart,
  MonitoringEmptyState,
  MonitoringSkeletonLoading,
} from "@/components/organisms";

import { useNetworkFlow, useProjectConfigs } from "@/hooks";
import type { AnalyticsRange, NetworkFlowResponse } from "@/types/features";

export interface NetworkFlowProps {
  className?: string;
  projectId: string;
  configId?: string;
  range?: AnalyticsRange;
}

interface StepDetails {
  key: keyof Omit<NetworkFlowResponse, "configId" | "url" | "totalNetworkTime" | "bottleneck">;
  label: string;
  description: string;
  icon: React.ElementType;
}

const FLOW_STEPS: StepDetails[] = [
  {
    key: "dnsTime",
    label: "DNS Lookup",
    description: "Resolving website domain to IP",
    icon: Search,
  },
  {
    key: "tcpTime",
    label: "TCP Connection",
    description: "Establishing three-way handshake",
    icon: Shuffle,
  },
  {
    key: "tlsTime",
    label: "TLS Handshake",
    description: "Negotiating secure SSL session",
    icon: Lock,
  },
  {
    key: "ttfbTime",
    label: "Server TTFB",
    description: "Waiting for first byte of response",
    icon: Hourglass,
  },
  {
    key: "downloadTime",
    label: "Data Transfer",
    description: "Downloading response body content",
    icon: Download,
  },
];

const BOTTLENECK_RECOMMENDATIONS: Record<string, string> = {
  dnsTime: "DNS lookup is taking longer than expected. Consider using a faster DNS provider (e.g. Cloudflare DNS, Amazon Route 53) or extending DNS TTL values.",
  tcpTime: "TCP connection setup time is high. This often indicates a high round-trip network distance or network congestion. Consider using a CDN or placing servers closer to users.",
  tlsTime: "TLS negotiation is slow. Ensure OCSP stapling is enabled, configure modern cipher suites, optimize your SSL certificate chain, or enable TLS session resumption.",
  ttfbTime: "Time to First Byte (TTFB) is high, indicating server-side latency. Consider caching database queries, optimizing backend application logic, or scaling compute resources.",
  downloadTime: "Content download transfer rate is slow. Consider enabling Gzip/Brotli compression, optimizing asset sizes (images, scripts), or utilizing CDN caching.",
};

export function NetworkFlow({ className, projectId, configId, range }: NetworkFlowProps) {
  const [activeConfigId, setActiveConfigId] = React.useState<string | null>(null);
  
  // Default range for network flow is 24h as per backend resolve specs
  const activeRange = range ?? "24h";
  const { data, isLoading, error } = useNetworkFlow(projectId, activeRange, configId);
  const { configs, isLoading: isConfigsLoading } = useProjectConfigs(projectId, undefined, configId);

  const activeConfigIds = React.useMemo(
    () => new Set(configs.filter((config) => config.enabled && !config.isArchived).map((config) => config.id)),
    [configs],
  );

  const visibleData = React.useMemo(() => {
    if (activeConfigIds.size === 0) return [];
    return data.filter((item) => activeConfigIds.has(item.configId) && (!configId || item.configId === configId));
  }, [activeConfigIds, configId, data]);

  React.useEffect(() => {
    if (!visibleData || visibleData.length === 0) {
      setActiveConfigId(null);
      return;
    }

    if (!activeConfigId || !visibleData.some((item) => item.configId === activeConfigId)) {
      setActiveConfigId(visibleData[0].configId);
    }
  }, [activeConfigId, visibleData]);

  if (isLoading || isConfigsLoading) {
    return <MonitoringSkeletonLoading className={className} />;
  }

  if (error) {
    return (
      <MonitoringEmptyState
        className={className}
        title="Network Flow & Bottlenecks"
        description="Analisis jalur koneksi dan identifikasi hambatan kecepatan jaringan."
        emptyTitle="Gagal Memuat Data"
        emptyDescription={error}
      />
    );
  }

  if (!visibleData || visibleData.length === 0) {
    return (
      <MonitoringEmptyState
        className={className}
        title="Network Flow & Bottlenecks"
        description="Analisis jalur koneksi dan identifikasi hambatan kecepatan jaringan."
        emptyTitle="Belum Ada Data"
        emptyDescription="Belum ada data aliran jaringan untuk konfigurasi aktif. Tunggu pengecekan otomatis berjalan."
      />
    );
  }

  const selectedData = visibleData.find((item) => item.configId === activeConfigId) ?? visibleData[0];
  const bottleneck = selectedData.bottleneck;
  
  return (
    <Card className={cn("p-6 shadow-sm border border-border/40 bg-card rounded-2xl flex flex-col gap-6", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-4">
        <HeaderChart
          title="Network Flow & Bottlenecks"
          description="Rincian alur proses transfer data dari client hingga server beserta analisis bottleneck."
        />

        {visibleData.length > 1 ? (
          <label className="flex min-w-0 flex-col gap-1 text-xs font-medium text-muted-foreground sm:min-w-72 self-start sm:self-auto">
            Monitoring config
            <select
              value={selectedData.configId}
              onChange={(event) => setActiveConfigId(event.target.value)}
              className="h-9 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground outline-none transition-colors focus:border-primary"
            >
              {visibleData.map((item) => (
                <option key={item.configId} value={item.configId}>
                  {item.url || item.configId}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <div className="min-w-0 text-sm font-medium text-muted-foreground self-start sm:self-auto">
            {selectedData.url}
          </div>
        )}
      </div>

      {/* Network Pipeline visualization */}
      <div className="flex flex-col gap-6 lg:gap-4 lg:flex-row lg:items-center lg:justify-between py-2">
        {/* Step: Client start */}
        <div className="flex flex-col items-center justify-center shrink-0 p-3 bg-muted/40 rounded-xl border border-border/30 w-full lg:w-28 text-center gap-1">
          <Cpu className="h-5 w-5 text-muted-foreground/60 animate-pulse" />
          <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-wider">Source</span>
          <span className="text-xs font-bold text-foreground/80">Client</span>
        </div>

        {FLOW_STEPS.map((step, idx) => {
          const Icon = step.icon;
          const timingVal = Number(selectedData[step.key] || 0);
          const isBottleneck = bottleneck === step.key;
          
          return (
            <React.Fragment key={step.key}>
              {/* Connector Arrow */}
              <div className="hidden lg:flex items-center justify-center text-muted-foreground/30 grow">
                <ArrowRight className={cn(
                  "h-5 w-5",
                  isBottleneck ? "text-rose-500/50 animate-bounce horizontal-bounce" : "text-muted-foreground/20"
                )} />
              </div>
              <div className="flex lg:hidden items-center justify-center text-muted-foreground/30">
                <span className="h-4 w-px bg-border/60" />
              </div>

              {/* Hop Step card */}
              <div className={cn(
                "relative flex items-center lg:flex-col gap-4 lg:gap-2 p-4 lg:py-4 lg:px-2 rounded-2xl border transition-all duration-300 w-full lg:w-44 text-left lg:text-center",
                isBottleneck 
                  ? "bg-gradient-to-br from-rose-500/10 to-rose-500/5 border-rose-500/50 dark:border-rose-500/30 shadow-md shadow-rose-500/5 scale-105" 
                  : "bg-background/40 border-border/40 hover:border-border/80 hover:shadow-xs"
              )}>
                {/* Status dot / warning flag */}
                {isBottleneck && (
                  <span className="absolute -top-2 left-4 lg:left-1/2 lg:-translate-x-1/2 flex items-center gap-1 rounded-full bg-rose-500 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-white shadow-sm">
                    <AlertTriangle className="h-2 w-2" />
                    Bottleneck
                  </span>
                )}

                {/* Step Icon */}
                <div className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors",
                  isBottleneck 
                    ? "bg-rose-500/25 border-rose-500/30 text-rose-500 animate-pulse" 
                    : "bg-muted/40 border-border/50 text-muted-foreground/60"
                )}>
                  <Icon className="h-4.5 w-4.5" />
                </div>

                <div className="space-y-1 grow lg:grow-0">
                  <div className="flex items-baseline justify-between lg:justify-center gap-2">
                    <span className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-wider block">
                      {step.label}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground/60 block lg:hidden">
                    {step.description}
                  </span>
                </div>

                {/* Timing badge value */}
                <div className={cn(
                  "shrink-0 rounded-lg px-2.5 py-1 text-xs font-bold font-mono tracking-tight",
                  isBottleneck 
                    ? "bg-rose-500/10 text-rose-600 border border-rose-500/20" 
                    : "bg-muted/60 text-foreground/80 border border-border/40"
                )}>
                  {timingVal.toFixed(1)} ms
                </div>
              </div>
            </React.Fragment>
          );
        })}

        {/* Step: Server end */}
        <div className="hidden lg:flex items-center justify-center text-muted-foreground/20 grow">
          <ArrowRight className="h-5 w-5" />
        </div>
        <div className="flex lg:hidden items-center justify-center text-muted-foreground/30">
          <span className="h-4 w-px bg-border/60" />
        </div>

        <div className="flex flex-col items-center justify-center shrink-0 p-3 bg-muted/40 rounded-xl border border-border/30 w-full lg:w-28 text-center gap-1">
          <Globe className="h-5 w-5 text-muted-foreground/60" />
          <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-wider">Dest</span>
          <span className="text-xs font-bold text-foreground/80">Server</span>
        </div>
      </div>

      {/* Summary and Recommendation section */}
      <div className={cn(
        "rounded-2xl border p-5 flex flex-col md:flex-row gap-5 items-start md:items-center",
        bottleneck 
          ? "bg-rose-500/5 border-rose-500/20 text-rose-950 dark:text-rose-250" 
          : "bg-emerald-500/5 border-emerald-500/20 text-emerald-950 dark:text-emerald-250"
      )}>
        <div className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border",
          bottleneck 
            ? "bg-rose-500/10 border-rose-500/20 text-rose-500" 
            : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
        )}>
          {bottleneck ? <AlertTriangle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
        </div>
        
        <div className="space-y-1 grow">
          <h4 className="text-sm font-bold tracking-tight">
            {bottleneck 
              ? `Performance Bottleneck Detected: ${FLOW_STEPS.find((s) => s.key === bottleneck)?.label}`
              : "Connection Performing Optimally"}
          </h4>
          <p className="text-xs opacity-85 leading-relaxed font-medium">
            {bottleneck 
              ? BOTTLENECK_RECOMMENDATIONS[bottleneck] 
              : "There are no major delays detected across the network flow. All network layers resolved within expected limits."}
          </p>
        </div>

        <div className="shrink-0 flex flex-col self-end md:self-auto text-right gap-0.5">
          <span className="text-[9px] font-bold opacity-60 uppercase tracking-widest block">Total Duration</span>
          <span className="text-xl font-black font-mono tracking-tight block">
            {selectedData.totalNetworkTime.toFixed(1)} ms
          </span>
        </div>
      </div>
    </Card>
  );
}
