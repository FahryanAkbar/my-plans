import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Globe,
  ExternalLink,
  Shield,
  Clock,
  RefreshCw,
  Wifi,
  Cpu,
} from "lucide-react";
import {
  Card,
  CardContent,
  Badge,
  Typography,
} from "@/components/atoms";
import { ENV_BADGE, ENV_LABEL, NETWORK_LABEL } from "@/lib";
import type { MonitoringConfig } from "@/types/features";

export interface MonitoringWebsitesDetailCardProps {
  activeConfig: MonitoringConfig;
  className?: string;
}

export function MonitoringWebsitesDetailCard({
  activeConfig,
  className,
}: MonitoringWebsitesDetailCardProps) {
  return (
    <Card className={cn("border border-border/40 shadow-sm bg-card rounded-2xl overflow-hidden relative", className)}>
      <div className="absolute top-0 left-0 w-full h-0.75" />
      
      <CardContent className="p-6 space-y-6">
        {/* Main info row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/10">
                <Globe className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Typography variant="h4" className="font-bold text-foreground">
                    {activeConfig.name}
                  </Typography>
                  <Badge
                    className={cn(
                      "text-[9px] px-2 py-0.5 font-bold uppercase tracking-wider shrink-0",
                      ENV_BADGE[activeConfig.environment],
                    )}
                  >
                    {ENV_LABEL[activeConfig.environment] ?? activeConfig.environment}
                  </Badge>
                </div>
                <a
                  href={activeConfig.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-1.5 text-xs text-muted-foreground/80 hover:text-primary transition-colors hover:underline font-medium"
                >
                  {activeConfig.url}
                  <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </div>
            </div>
          </div>

          {/* Status Switch or Status Pulse Info */}
          <div className="flex items-center gap-3 shrink-0 self-start md:self-auto bg-muted/20 border border-border/30 px-4 py-2.5 rounded-xl">
            <div className="relative flex h-3.5 w-3.5">
              <span className={cn(
                "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                activeConfig.enabled ? "bg-emerald-400" : "bg-amber-400"
              )} />
              <span className={cn(
                "relative inline-flex rounded-full h-3.5 w-3.5",
                activeConfig.enabled ? "bg-emerald-500" : "bg-amber-500"
              )} />
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-wider block">
                Status
              </span>
              <span className="text-xs font-bold text-foreground block">
                {activeConfig.enabled ? "Active (Monitoring)" : "Paused"}
              </span>
            </div>
          </div>
        </div>

        {/* Quick config specs grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          {[
            {
              icon: Shield,
              label: "SSL Verification",
              value: activeConfig.checkSsl ? "Enabled (HTTPS)" : "Disabled",
              color: activeConfig.checkSsl ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" : "text-muted-foreground/60 bg-muted/40 border-border/50",
            },
            {
              icon: Clock,
              label: "Timeout Threshold",
              value: `${activeConfig.timeout.toLocaleString("id-ID")} ms`,
              color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
            },
            {
              icon: RefreshCw,
              label: "Check Interval",
              value: `Every ${activeConfig.interval / 1000 / 60} min`,
              color: "text-indigo-500 bg-indigo-50/10 dark:bg-indigo-500/10 border-indigo-500/20",
            },
            {
              icon: Wifi,
              label: "Network Profile",
              value: NETWORK_LABEL[activeConfig.networkProfile] ?? activeConfig.networkProfile,
              color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
            },
          ].map((spec, index) => {
            const Icon = spec.icon;
            return (
              <div
                key={index}
                className="flex items-center gap-3 rounded-xl border border-border/50 bg-background/50 p-3 hover:bg-muted/10 transition-colors"
              >
                <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border", spec.color)}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-wider block">
                    {spec.label}
                  </span>
                  <span className="text-xs font-semibold text-foreground/80 block truncate">
                    {spec.value}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Footer note: engine details */}
        <div className="flex items-center gap-2 pt-2 border-t border-border/40 text-xs text-muted-foreground/60">
          <Cpu className="h-3.5 w-3.5" />
          <span>
            Engine: <strong className="font-semibold text-foreground/75">{activeConfig.engine}</strong> · Target expected status code: <strong className="font-semibold text-foreground/75">{activeConfig.expectedStatus}</strong>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
