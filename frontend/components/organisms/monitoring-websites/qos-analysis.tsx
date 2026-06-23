"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { 
  Card, 
  CardHeader, 
  CardContent, 
  Badge, 
  Progress, 
  Typography 
} from "@/components/atoms";
import { 
  Wifi, 
  Smartphone, 
  Network, 
  Gauge, 
  CheckCircle, 
  AlertTriangle 
} from "lucide-react";
import { useQosMonitoring } from "@/hooks";
import type { AnalyticsRange } from "@/types/features";
import { HeaderChart, MonitoringEmptyState, MonitoringSkeletonLoading } from "./tools";

export interface QosAnalysisProps {
  className?: string;
  projectId: string;
  configId?: string;
  range?: AnalyticsRange;
}

const PROFILE_CONFIG: Record<
  string,
  {
    name: string;
    icon: React.ComponentType<any>;
    color: string;
    bgColor: string;
    borderColor: string;
    barColor: string;
  }
> = {
  WIFI: {
    name: "WiFi Connection",
    icon: Wifi,
    color: "text-emerald-500 dark:text-emerald-400",
    bgColor: "bg-emerald-500/5 dark:bg-emerald-950/10",
    borderColor: "border-emerald-500/10 dark:border-emerald-500/20",
    barColor: "bg-emerald-500",
  },
  NETWORK_4G: {
    name: "4G LTE Network",
    icon: Smartphone,
    color: "text-blue-500 dark:text-blue-400",
    bgColor: "bg-blue-500/5 dark:bg-blue-950/10",
    borderColor: "border-blue-500/10 dark:border-blue-500/20",
    barColor: "bg-blue-500",
  },
  NETWORK_3G: {
    name: "3G Mobile Network",
    icon: Network,
    color: "text-amber-500 dark:text-amber-400",
    bgColor: "bg-amber-500/5 dark:bg-amber-950/10",
    borderColor: "border-amber-500/10 dark:border-amber-500/20",
    barColor: "bg-amber-500",
  },
};

const getProfileConfig = (key: string) => {
  const upperKey = key.toUpperCase();
  if (upperKey.includes("WIFI")) return PROFILE_CONFIG.WIFI;
  if (upperKey.includes("4G") || upperKey.includes("LTE")) return PROFILE_CONFIG.NETWORK_4G;
  if (upperKey.includes("3G")) return PROFILE_CONFIG.NETWORK_3G;
  
  return {
    name: key,
    icon: Network,
    color: "text-indigo-500 dark:text-indigo-400",
    bgColor: "bg-indigo-500/5 dark:bg-indigo-950/10",
    borderColor: "border-indigo-500/10 dark:border-indigo-500/20",
    barColor: "bg-indigo-500",
  };
};

export function QosAnalysis({ className, projectId, configId, range }: QosAnalysisProps) {
  const { data, isLoading, error } = useQosMonitoring(projectId, range, configId);

  const activeQos = React.useMemo(() => {
    if (!data || data.length === 0) return null;
    return data.find((item) => !configId || item.configId === configId) || data[0];
  }, [configId, data]);

  if (isLoading) {
    return <MonitoringSkeletonLoading className={className} />;
  }

  if (error) {
    return (
      <MonitoringEmptyState
        className={className}
        title="QoS Analysis & Network Emulation"
        description="Analisis performa QoS berdasarkan profil koneksi jaringan"
        emptyTitle="Gagal Memuat Data"
        emptyDescription={error}
      />
    );
  }

  if (!activeQos || !activeQos.profiles || Object.keys(activeQos.profiles).length === 0) {
    return (
      <MonitoringEmptyState
        className={className}
        title="QoS Analysis & Network Emulation"
        description="Analisis performa QoS berdasarkan profil koneksi jaringan"
        emptyTitle="Belum Ada Data"
        emptyDescription="Data simulasi QoS belum tersedia. Tunggu beberapa saat agar proses background worker selesai mengumpulkan metrik."
      />
    );
  }

  return (
    <Card
      className={cn(
        "p-6 shadow-sm border border-border/40 bg-card rounded-2xl flex flex-col gap-6",
        className
      )}
    >
      <HeaderChart
        title="QoS Analysis & Network Emulation"
        description="Analisis Quality of Service (QoS) membandingkan emulasi berbagai kondisi jaringan internet"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(activeQos.profiles).map(([profileKey, metrics]) => {
          const config = getProfileConfig(profileKey);
          const ProfileIcon = config.icon;
          
          // Normalisasi QoS Score (0-1 atau 0-100)
          const score = metrics.qosScore;
          const displayScore = score <= 1 ? Math.round(score * 100) : Math.round(score);
          
          // Normalisasi Uptime (0-1 atau 0-100)
          const uptime = metrics.uptimePercent;
          const displayUptime = uptime <= 1 ? (uptime * 100).toFixed(2) : uptime.toFixed(2);

          const isBest = activeQos.bestProfile.toUpperCase() === profileKey.toUpperCase();
          const isWorst = activeQos.worstProfile.toUpperCase() === profileKey.toUpperCase();

          // Tentukan warna progress bar berdasarkan skor
          let scoreColor = "bg-destructive";
          let scoreTextClass = "text-destructive";
          if (displayScore >= 90) {
            scoreColor = "bg-emerald-500";
            scoreTextClass = "text-emerald-500 dark:text-emerald-400";
          } else if (displayScore >= 75) {
            scoreColor = "bg-amber-500";
            scoreTextClass = "text-amber-500 dark:text-amber-400";
          }

          return (
            <div
              key={profileKey}
              className={cn(
                "p-5 rounded-xl border flex flex-col gap-4 transition-all duration-300 hover:shadow-md",
                config.borderColor,
                config.bgColor
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg bg-card border border-border/30 shadow-sm", config.color)}>
                    <ProfileIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <Typography className="text-sm font-bold text-foreground">
                      {config.name}
                    </Typography>
                    <Typography className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground/60">
                      Profile: {profileKey}
                    </Typography>
                  </div>
                </div>

                {isBest && (
                  <Badge variant="success" className="text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider">
                    Best
                  </Badge>
                )}
                {isWorst && (
                  <Badge variant="destructive" className="text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider">
                    Worst
                  </Badge>
                )}
              </div>

              {/* QoS Score Circle / Progress Bar */}
              <div className="space-y-2 mt-2">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-1.5">
                    <Gauge className="h-4 w-4 text-muted-foreground/50" />
                    <span className="text-xs font-semibold text-muted-foreground/80">QoS Score</span>
                  </div>
                  <span className={cn("text-xl font-black tracking-tight", scoreTextClass)}>
                    {displayScore}%
                  </span>
                </div>
                <Progress 
                  value={displayScore} 
                  indicatorClassName={scoreColor}
                  className="h-1.5 bg-muted/65"
                />
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 pt-3 mt-1 border-t border-border/20">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">Avg Latency</span>
                  <span className="text-sm font-extrabold text-foreground/80">
                    {metrics.avgLatencyMs.toFixed(1)} <span className="text-xs font-medium text-muted-foreground/60">ms</span>
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">Uptime</span>
                  <span className="text-sm font-extrabold text-foreground/80">
                    {displayUptime}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Connection Recommendation footer */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3.5 px-5 py-4 bg-muted/20 border border-border/40 rounded-xl">
        <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
        <div className="space-y-0.5">
          <Typography className="text-xs font-bold text-foreground/80">
            Rekomendasi Profil Koneksi
          </Typography>
          <Typography className="text-[11px] text-muted-foreground leading-relaxed">
            Berdasarkan skor QoS di atas, performa website paling optimal diakses via koneksi{" "}
            <span className="font-extrabold text-foreground/80">
              {getProfileConfig(activeQos.bestProfile).name}
            </span>{" "}
            dengan stabilitas terbaik.
            {activeQos.bestProfile.toUpperCase() !== activeQos.worstProfile.toUpperCase() && (
              <>
                {" "}Sedangkan koneksi via{" "}
                <span className="font-extrabold text-foreground/80">
                  {getProfileConfig(activeQos.worstProfile).name}
                </span>{" "}
                memiliki resiko latency bottleneck terbesar.
              </>
            )}
          </Typography>
        </div>
      </div>
    </Card>
  );
}
