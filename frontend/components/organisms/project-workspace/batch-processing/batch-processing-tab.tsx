"use client";

import React, { useState, useMemo } from "react";
import { 
  Activity, 
  Calendar, 
  Play, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Database, 
  RefreshCw,
  Search,
  ArrowUpDown,
  Layers
} from "lucide-react";
import { 
  Button, 
  Badge, 
  Typography, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/atoms";
import { useBatch, useProjectConfigs } from "@/hooks";
import { 
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { format, subDays } from "date-fns";

interface BatchProcessingTabProps {
  projectId: string;
}

export function BatchProcessingTab({ projectId }: BatchProcessingTabProps) {
  // 1. API Hooks
  const [days, setDays] = useState<number>(30);
  const { 
    summaries, 
    isLoading, 
    isTriggering, 
    refetch, 
    triggerBatch 
  } = useBatch(projectId, days);

  const { configs, isLoading: isConfigsLoading } = useProjectConfigs(projectId);

  // 2. States for Manual Trigger & Filtering
  const [selectedDate, setSelectedDate] = useState<string>(
    format(subDays(new Date(), 1), "yyyy-MM-dd") // Default: yesterday
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"date" | "latency" | "uptime">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [activeConfigFilter, setActiveConfigFilter] = useState<string>("all");

  // State to simulate progress during batch triggering for rich UI feedback
  const [triggerProgress, setTriggerProgress] = useState<number>(0);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  // 3. Generate past 30 days array for the contribution grid
  const last30Days = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i);
      return format(date, "yyyy-MM-dd");
    });
  }, []);

  // 4. Calculate Summary KPIs
  const kpis = useMemo(() => {
    if (summaries.length === 0) {
      return {
        avgUptime: 100,
        avgLatency: 0,
        totalIncidents: 0,
        totalChecks: 0
      };
    }
    const totalUptime = summaries.reduce((acc, curr) => acc + curr.uptimePercent, 0);
    const totalLatency = summaries.reduce((acc, curr) => acc + curr.avgLatencyMs, 0);
    const totalIncidents = summaries.reduce((acc, curr) => acc + curr.downtimeIncidents, 0);
    const totalChecks = summaries.reduce((acc, curr) => acc + curr.totalChecks, 0);

    return {
      avgUptime: totalUptime / summaries.length,
      avgLatency: totalLatency / summaries.length,
      totalIncidents,
      totalChecks
    };
  }, [summaries]);

  // 5. Filter & Sort Summaries
  const filteredSummaries = useMemo(() => {
    return summaries
      .filter((s) => {
        const matchesSearch = s.url.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesConfig = activeConfigFilter === "all" || s.configId === activeConfigFilter;
        return matchesSearch && matchesConfig;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortBy === "date") {
          comp = a.date.localeCompare(b.date);
        } else if (sortBy === "latency") {
          comp = a.avgLatencyMs - b.avgLatencyMs;
        } else if (sortBy === "uptime") {
          comp = a.uptimePercent - b.uptimePercent;
        }
        return sortOrder === "asc" ? comp : -comp;
      });
  }, [summaries, searchQuery, sortBy, sortOrder, activeConfigFilter]);

  // 6. Map summaries by Date for the Chart (grouped harian)
  const chartData = useMemo(() => {
    const dailyMap: Record<string, { date: string; avgLatencyMs: number; count: number; uptimePercentSum: number; entries: number }> = {};
    
    summaries.forEach((s) => {
      if (!dailyMap[s.date]) {
        dailyMap[s.date] = {
          date: s.date,
          avgLatencyMs: 0,
          count: 0,
          uptimePercentSum: 0,
          entries: 0
        };
      }
      dailyMap[s.date].avgLatencyMs += s.avgLatencyMs;
      dailyMap[s.date].count += 1;
      dailyMap[s.date].uptimePercentSum += s.uptimePercent;
      dailyMap[s.date].entries += 1;
    });

    return Object.values(dailyMap)
      .map((d) => ({
        date: format(new Date(d.date), "dd MMM"),
        "Avg Latency (ms)": Math.round(d.avgLatencyMs / d.count),
        "Uptime (%)": parseFloat((d.uptimePercentSum / d.entries).toFixed(2))
      }))
      .sort((a, b) => {
        // Date parse helper for chart ordering
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
  }, [summaries]);

  // 7. Trigger Manual Batch Action with Progress Simulation
  const handleTriggerBatch = async () => {
    if (isTriggering) return;
    setTriggerProgress(5);
    setActiveJobId(null);

    // Progress bar simulation interval
    const interval = setInterval(() => {
      setTriggerProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 400);

    try {
      const res = await triggerBatch({ date: selectedDate });
      clearInterval(interval);
      setTriggerProgress(100);
      if (res && res.jobId) {
        setActiveJobId(res.jobId);
      }
      setTimeout(() => {
        setTriggerProgress(0);
        refetch();
      }, 1500);
    } catch (err) {
      clearInterval(interval);
      setTriggerProgress(0);
    }
  };

  const toggleSort = (field: "date" | "latency" | "uptime") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const getGridColor = (uptime: number) => {
    if (uptime === 100) return "bg-emerald-500 hover:scale-125 transition-transform";
    if (uptime >= 99) return "bg-emerald-400/80 hover:scale-125 transition-transform";
    if (uptime >= 95) return "bg-amber-500 hover:scale-125 transition-transform";
    return "bg-red-500 hover:scale-125 transition-transform animate-pulse";
  };

  return (
    <div className="space-y-6">
      {/* Hide scrollbars style */}
      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div className="space-y-1">
          <Typography variant="h6" className="text-lg font-bold flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Batch Pipeline Processing
          </Typography>
          <Typography variant="caption" className="text-xs text-muted-foreground/70 block">
            Analyze 30-day long-term aggregated logs and trigger manual Big Data jobs.
          </Typography>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={refetch} 
          disabled={isLoading}
          className="self-start md:self-auto gap-2"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Reload Data
        </Button>
      </div>

      {/* 2-COLUMN LAYOUT: Manual Run Panel & KPI Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MANUAL TRIGGER CARD */}
        <Card className="lg:col-span-1 border border-border/30 bg-card/45 shadow-sm">
          <CardHeader className="pb-3 border-b border-border/15">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Play className="h-4 w-4 text-primary" />
              Manual Pipeline Trigger
            </CardTitle>
            <CardDescription className="text-xs">
              Manually compile hourly InfluxDB latency data points into daily report summaries.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground/80 block">
                Target Batch Date:
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={selectedDate}
                  max={format(subDays(new Date(), 1), "yyyy-MM-dd")}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-muted/40 dark:bg-slate-950/40 border border-border/25 rounded-xl px-3.5 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/50 font-mono"
                />
              </div>
            </div>

            {triggerProgress > 0 && (
              <div className="space-y-1.5 animate-in fade-in duration-300">
                <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground/75 uppercase tracking-wider">
                  <span>Aggregating Pipeline Logs...</span>
                  <span>{triggerProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-muted/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300 ease-out shadow-[0_0_8px_rgba(67,97,238,0.5)]" 
                    style={{ width: `${triggerProgress}%` }}
                  />
                </div>
                {activeJobId && (
                  <div className="text-[10px] font-mono text-emerald-400">
                    Queue Job ID: {activeJobId}
                  </div>
                )}
              </div>
            )}

            <Button
              className="w-full gap-2 text-xs font-bold py-2 shadow-md"
              onClick={handleTriggerBatch}
              disabled={isTriggering || triggerProgress > 0}
            >
              <Play className="h-3.5 w-3.5" />
              {isTriggering ? "Spawning Redis Job..." : "Run Batch Pipeline"}
            </Button>
          </CardContent>
        </Card>

        {/* METRICS SUMMARY CARDS */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          {/* Uptime Card */}
          <Card className="border border-border/30 bg-card/45 shadow-sm p-5 flex flex-col justify-between">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 block">
                Avg Project Uptime
              </span>
              {isLoading ? (
                <div className="h-7 w-20 animate-pulse bg-muted/40 rounded-md" />
              ) : (
                <div className="text-2xl font-bold font-mono text-emerald-400">
                  {kpis.avgUptime.toFixed(3)}%
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60 pt-2 border-t border-border/10">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>Target: &gt;99.9% uptime</span>
            </div>
          </Card>

          {/* Average Latency Card */}
          <Card className="border border-border/30 bg-card/45 shadow-sm p-5 flex flex-col justify-between">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 block">
                Avg Response Latency
              </span>
              {isLoading ? (
                <div className="h-7 w-20 animate-pulse bg-muted/40 rounded-md" />
              ) : (
                <div className="text-2xl font-bold font-mono text-primary">
                  {Math.round(kpis.avgLatency)} ms
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60 pt-2 border-t border-border/10">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
              <span>Weighted response time</span>
            </div>
          </Card>

          {/* Incident Count Card */}
          <Card className="border border-border/30 bg-card/45 shadow-sm p-5 flex flex-col justify-between">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 block">
                Total Downtime Incidents
              </span>
              {isLoading ? (
                <div className="h-7 w-20 animate-pulse bg-muted/40 rounded-md" />
              ) : (
                <div className={`text-2xl font-bold font-mono ${kpis.totalIncidents > 0 ? "text-red-400" : "text-emerald-400"}`}>
                  {kpis.totalIncidents}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60 pt-2 border-t border-border/10">
              <AlertTriangle className={`h-3.5 w-3.5 ${kpis.totalIncidents > 0 ? "text-red-400" : "text-emerald-500"}`} />
              <span>30-day active incident count</span>
            </div>
          </Card>

          {/* Aggregated Checks Card */}
          <Card className="border border-border/30 bg-card/45 shadow-sm p-5 flex flex-col justify-between">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 block">
                Total Logs Processed
              </span>
              {isLoading ? (
                <div className="h-7 w-20 animate-pulse bg-muted/40 rounded-md" />
              ) : (
                <div className="text-2xl font-bold font-mono text-muted-foreground/80">
                  {kpis.totalChecks.toLocaleString("id-ID")}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60 pt-2 border-t border-border/10">
              <Database className="h-3.5 w-3.5 text-muted-foreground/55" />
              <span>Accumulated check logs</span>
            </div>
          </Card>
        </div>
      </div>

      {/* DUAL Y-AXIS HISTORICAL CHART */}
      <Card className="border border-border/40 bg-card/25 shadow-sm p-6">
        <CardHeader className="px-0 pt-0 pb-6">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Activity className="h-4.5 w-4.5 text-primary" />
            Dual-Axis Performance Analytics
          </CardTitle>
          <CardDescription className="text-xs">
            Correlate average response latency and uptime ratio over the current batch duration.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {isLoading ? (
            <div className="h-72 w-full animate-pulse bg-muted/20 border border-border/20 rounded-xl" />
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={chartData} margin={{ top: 10, right: -5, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="latencyAreaColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#f1f5f9" className="stroke-slate-100 dark:stroke-zinc-800/60" strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 10 }} tickLine={false} axisLine={false} />
                
                {/* Y-Axis Left (Latency) */}
                <YAxis 
                  yAxisId="left" 
                  tickFormatter={(v) => `${v}ms`} 
                  tick={{ fill: "#94a3b8", fontSize: 10 }} 
                  tickLine={false} 
                  axisLine={false}
                  width={50}
                />
                
                {/* Y-Axis Right (Uptime) */}
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  domain={[90, 100]}
                  tickFormatter={(v) => `${v}%`} 
                  tick={{ fill: "#94a3b8", fontSize: 10 }} 
                  tickLine={false} 
                  axisLine={false}
                  width={40}
                />
                
                <Tooltip 
                  contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", borderRadius: "12px", color: "#f8fafc", fontSize: "11px" }}
                  itemStyle={{ padding: "1px 0" }}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: "11px" }} />
                
                {/* Uptime Bar */}
                <Bar yAxisId="right" dataKey="Uptime (%)" fill="#10b981" radius={[4, 4, 0, 0]} opacity={0.65} barSize={20} />
                
                {/* Latency Line */}
                <Line yAxisId="left" type="monotone" dataKey="Avg Latency (ms)" stroke="#4f46e5" strokeWidth={2.5} dot={{ r: 2 }} activeDot={{ r: 5 }} />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-72 w-full flex flex-col items-center justify-center border border-dashed border-border/30 rounded-xl space-y-2 bg-muted/5">
              <Database className="h-8 w-8 text-muted-foreground/30" />
              <Typography className="text-xs text-muted-foreground/60">No batch aggregate data available. Run manual pipeline to generate statistics.</Typography>
            </div>
          )}
        </CardContent>
      </Card>

      {/* UPTIME CALENDAR GRID (GITHUB STYLE) */}
      <Card className="border border-border/40 bg-card/25 shadow-sm p-6">
        <CardHeader className="px-0 pt-0 pb-6 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Clock className="h-4.5 w-4.5 text-primary" />
              Uptime Calendar Grid (30 Days)
            </CardTitle>
            <CardDescription className="text-xs">
              Daily status grids mapped for each active monitoring website configuration.
            </CardDescription>
          </div>
          {/* Calendar Indicators */}
          <div className="flex items-center gap-3 text-[10px] font-semibold text-muted-foreground/75 bg-muted/50 dark:bg-slate-950/40 px-3 py-1.5 border border-border/30 dark:border-border/10 rounded-lg">
            <span>Worst</span>
            <span className="w-2.5 h-2.5 rounded-xs bg-red-500" />
            <span className="w-2.5 h-2.5 rounded-xs bg-amber-500" />
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-400/80" />
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
            <span>Best</span>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0 space-y-4">
          {isConfigsLoading || isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-10 w-full animate-pulse bg-muted/20 rounded-lg border border-border/10" />
              ))}
            </div>
          ) : configs.length > 0 ? (
            <div className="divide-y divide-border/15 max-h-96 overflow-y-auto pr-1">
              {configs.map((config) => {
                // Find matching summaries for this config
                const configSummaries = summaries.filter((s) => s.configId === config.id);
                
                return (
                  <div key={config.id} className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <Typography className="text-xs font-bold text-foreground truncate">{config.name}</Typography>
                      <Typography variant="caption" className="text-[10px] text-muted-foreground/60 truncate block hover:underline">
                        <a href={config.url} target="_blank" rel="noreferrer">{config.url}</a>
                      </Typography>
                    </div>

                    {/* 30-Day Contribution Grid */}
                    <div className="flex gap-1.5 shrink-0 overflow-x-auto py-1 no-scrollbar">
                      {last30Days.map((day) => {
                        const daySummary = configSummaries.find((s) => s.date === day);
                        const uptime = daySummary ? daySummary.uptimePercent : null;
                        const latency = daySummary ? daySummary.avgLatencyMs : null;

                        return (
                          <div 
                            key={day}
                            className={`group relative w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center text-[10px] font-mono cursor-default transition-all duration-200 border border-border/30 dark:border-white/5 ${
                              uptime !== null 
                                ? `${getGridColor(uptime)} text-white font-bold` 
                                : "bg-muted/40 dark:bg-slate-900 border-dashed border-border/40 text-muted-foreground/45 dark:text-muted-foreground/30"
                            }`}
                          >
                            <span>{day.substring(8)}</span>
                            
                            {/* Hover CSS Tooltip */}
                            <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2.5 bg-slate-950/95 border border-border/40 text-white rounded-xl text-[10px] whitespace-nowrap z-50 transition-opacity duration-200 pointer-events-none flex flex-col gap-1">
                              <span className="font-bold text-foreground">{format(new Date(day), "dd MMMM yyyy")}</span>
                              {uptime !== null ? (
                                <>
                                  <span className="flex items-center gap-1">
                                    <span className={`w-1.5 h-1.5 rounded-full ${uptime >= 99 ? "bg-emerald-400" : "bg-amber-400"}`} />
                                    Uptime: <strong className="text-foreground">{uptime.toFixed(2)}%</strong>
                                  </span>
                                  <span>Latency: <strong className="text-foreground">{Math.round(latency || 0)} ms</strong></span>
                                  <span>Checks: {daySummary?.totalChecks}</span>
                                </>
                              ) : (
                                <span className="text-muted-foreground/60">No batch logs compiled</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-muted-foreground/60 border border-dashed border-border/30 rounded-xl">
              No configurations mapped. Add a target URL in the Monitoring tab to check aggregates.
            </div>
          )}
        </CardContent>
      </Card>

      {/* FILTER & HISTORICAL SUMMARY LOGS TABLE */}
      <Card className="border border-border/40 bg-card/25 shadow-sm p-6">
        <CardHeader className="px-0 pt-0 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Database className="h-4.5 w-4.5 text-primary" />
              Pipeline Summary Reports
            </CardTitle>
            <CardDescription className="text-xs">
              Review and audit historic daily summary records generated by manual or cron triggers.
            </CardDescription>
          </div>
          
          {/* SEARCH & FILTERS BAR */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
              <input
                type="text"
                placeholder="Search url..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-muted/40 dark:bg-slate-950/40 border border-border/25 rounded-lg pl-8 pr-3 py-1.5 text-xs text-foreground outline-none transition-colors focus:border-primary/50 min-w-40 sm:min-w-56"
              />
            </div>
            
            <select
              value={activeConfigFilter}
              onChange={(e) => setActiveConfigFilter(e.target.value)}
              className="bg-muted/40 dark:bg-slate-950/40 border border-border/25 rounded-lg px-2.5 py-1.5 text-xs text-foreground outline-none transition-colors focus:border-primary/50"
            >
              <option value="all">All Targets</option>
              {configs.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </CardHeader>
        
        <CardContent className="px-0 pb-0">
          <div className="border border-border/20 rounded-xl overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/15 border-b border-border/20 text-[10.5px] font-bold text-muted-foreground/70 uppercase tracking-wider select-none">
                  <th className="px-4 py-3 cursor-pointer hover:text-foreground transition-colors" onClick={() => toggleSort("date")}>
                    <div className="flex items-center gap-1.5">
                      Batch Date
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="px-4 py-3">Config / Website Target</th>
                  <th className="px-4 py-3 cursor-pointer hover:text-foreground transition-colors" onClick={() => toggleSort("uptime")}>
                    <div className="flex items-center gap-1.5">
                      Uptime Ratio
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="px-4 py-3 cursor-pointer hover:text-foreground transition-colors" onClick={() => toggleSort("latency")}>
                    <div className="flex items-center gap-1.5">
                      Avg Latency
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="px-4 py-3">Downtimes</th>
                  <th className="px-4 py-3">Total Checks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10 text-xs text-foreground/80">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-4 py-3.5">
                          <div className="h-4 animate-pulse bg-muted/30 rounded-md" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filteredSummaries.length > 0 ? (
                  filteredSummaries.map((summary) => (
                    <tr key={summary.id} className="hover:bg-muted/5 transition-colors">
                      <td className="px-4 py-3.5 font-mono font-bold text-muted-foreground">{summary.date}</td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-foreground/90">{configs.find(c => c.id === summary.configId)?.name || "Target"}</div>
                        <div className="text-[10px] text-muted-foreground/60 font-mono truncate max-w-64" title={summary.url}>{summary.url}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge 
                          variant="outline" 
                          className={`font-mono font-bold text-[10px] border-none px-2 py-0.5 ${
                            summary.uptimePercent === 100 ? "bg-emerald-500/10 text-emerald-500" :
                            summary.uptimePercent >= 99 ? "bg-emerald-500/5 text-emerald-400" :
                            summary.uptimePercent >= 95 ? "bg-amber-500/10 text-amber-500" : "bg-red-500/10 text-red-500"
                          }`}
                        >
                          {summary.uptimePercent.toFixed(3)}%
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 font-mono font-semibold">
                        {summary.avgLatencyMs} ms <span className="text-[10.5px] text-muted-foreground/50 font-normal">({summary.minLatencyMs}-{summary.maxLatencyMs})</span>
                      </td>
                      <td className="px-4 py-3.5">
                        {summary.downtimeIncidents > 0 ? (
                          <Badge variant="outline" className="border-red-500/20 bg-red-500/5 text-red-400 font-bold text-[9px] uppercase tracking-wider gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {summary.downtimeIncidents} fails
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground/50 font-medium">None</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 font-mono font-medium text-muted-foreground/80">{summary.totalChecks.toLocaleString("id-ID")}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted-foreground/55 italic bg-muted/5">
                      No matching historical logs found in search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
