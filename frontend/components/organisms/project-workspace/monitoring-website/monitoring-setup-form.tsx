"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import {
  Shield,
  Globe,
  Gauge,
  PlusCircle,
  Save,
  ChevronDown,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Switch,
  Typography,
  Input,
} from "@/components/atoms";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/molecules";

import { useProjectConfigs } from "@/hooks";
import { Engine, Environment, NetworkProfile } from "@/lib";
import { CreateMonitoringConfigRequest } from "@/types/features";

// --- Form Values Interface ---

export interface MonitoringConfigValues {
  name: string;
  url: string;
  environment: Environment;
  interval: number;
  engine: Engine;
  networkProfile: NetworkProfile;
  timeout: number;
  expectedStatus: number;
  checkSsl: boolean;
  enabled?: boolean;
}

// --- Option constants for Dropdowns ---

const HTTP_STATUS_OPTIONS = [
  { value: 200, label: "200 OK", desc: "Standard successful response" },
  { value: 201, label: "201 Created", desc: "Resource created successfully" },
  { value: 204, label: "204 No Content", desc: "Success with empty response" },
  { value: 301, label: "301 Moved Permanently", desc: "Permanent redirection" },
  { value: 302, label: "302 Found", desc: "Temporary redirection" },
  {
    value: 400,
    label: "400 Bad Request",
    desc: "Server will not process request",
  },
  { value: 401, label: "401 Unauthorized", desc: "Authentication required" },
  { value: 403, label: "403 Forbidden", desc: "Access denied" },
  { value: 404, label: "404 Not Found", desc: "Resource does not exist" },
] as const;

const ENVIRONMENT_OPTIONS = [
  { value: "PRODUCTION", label: "Production", desc: "Live environment" },
  { value: "STAGING", label: "Staging", desc: "Pre-release environment" },
  {
    value: "DEVELOPMENT",
    label: "Development",
    desc: "Local/Sandbox environment",
  },
] as const;

const INTERVAL_OPTIONS = [
  { value: 10000, label: "10 Seconds", desc: "High frequency checking" },
  { value: 30000, label: "30 Seconds", desc: "Frequent checking" },
  { value: 60000, label: "1 Minute", desc: "Standard checking" },
  { value: 300000, label: "5 Minutes", desc: "Medium checking" },
  { value: 600000, label: "10 Minutes", desc: "Low checking" },
  { value: 1800000, label: "30 Minutes", desc: "Very low checking" },
  { value: 3600000, label: "1 Hour", desc: "Hourly checking" },
] as const;

const NETWORK_PROFILE_OPTIONS = [
  { value: "WIFI", label: "Wi-Fi / LAN", desc: "No simulation throttling" },
  {
    value: "NETWORK_4G",
    label: "4G LTE Connection",
    desc: "Throttled 4G profile",
  },
  {
    value: "FAST_3G",
    label: "Fast 3G Connection",
    desc: "Throttled Fast 3G profile",
  },
  { value: "NETWORK_3G", label: "3G Connection", desc: "Throttled 3G profile" },
] as const;

const ENGINE_OPTIONS = [
  { value: "HTTP", label: "HTTP", desc: "Fast latency and uptime checks" },
  {
    value: "PUPPETEER",
    label: "Puppeteer",
    desc: "Browser timing breakdown",
  },
] as const;

const TIMEOUT_OPTIONS = [
  { value: 5000, label: "5 Seconds", desc: "Strict 5s timeout" },
  { value: 10000, label: "10 Seconds", desc: "Standard 10s timeout" },
  { value: 15000, label: "15 Seconds", desc: "15s timeout" },
  { value: 30000, label: "30 Seconds", desc: "Relaxed 30s timeout" },
] as const;

interface MonitoringSetupFormProps {
  projectId: Id<"projects">;
  configId?: string; // UUID from PostgreSQL monitoring configs
  initialValues?: Partial<MonitoringConfigValues>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// --- Custom Hook to handle Form States and Actions ---

function useMonitoringSetupForm({
  projectId,
  configId,
  initialValues,
  onSuccess,
}: {
  projectId: string;
  configId?: string;
  initialValues?: Partial<MonitoringConfigValues>;
  onSuccess?: () => void;
}) {
  const { createConfig, updateConfig, isCreating, isUpdating } =
    useProjectConfigs(projectId);

  const [name, setName] = useState(initialValues?.name ?? "");
  const [url, setUrl] = useState(initialValues?.url ?? "");
  const [environment, setEnvironment] = useState<Environment>(initialValues?.environment ?? "PRODUCTION");
  const [interval, setInterval] = useState<number>(initialValues?.interval ?? 60000);
  const [engine, setEngine] = useState<Engine>(initialValues?.engine ?? "HTTP");
  const [networkProfile, setNetworkProfile] = useState<NetworkProfile>(initialValues?.networkProfile ?? "WIFI");
  const [timeout, setTimeout_] = useState<number>(initialValues?.timeout ?? 10000);
  const [expectedStatus, setExpectedStatus] = useState<number>(initialValues?.expectedStatus ?? 200);
  const [checkSsl, setCheckSsl] = useState<boolean>(initialValues?.checkSsl ?? true);



  const isEdit = !!configId;
  const isPending = isCreating || isUpdating;

  const handleSubmit = useCallback(async () => {
    if (!name.trim()) {
      toast.error("Please enter a website name");
      return;
    }
    if (!url.trim()) {
      toast.error("Please enter a target URL");
      return;
    }
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      toast.error("URL must start with http:// or https://");
      return;
    }

    const payload: CreateMonitoringConfigRequest = {
      name,
      url,
      environment,
      interval,
      networkProfile,
      engine,
      timeout,
      expectedStatus,
      checkSsl,
      enabled: initialValues?.enabled ?? true,
    };

    try {
      if (isEdit && configId) {
        await updateConfig(configId, payload);
      } else {
        await createConfig(payload);
      }
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error("Failed to save monitoring config:", err);
    }
  }, [
    name,
    url,
    environment,
    interval,
    engine,
    networkProfile,
    timeout,
    expectedStatus,
    checkSsl,
    isEdit,
    configId,
    initialValues,
    createConfig,
    updateConfig,
    onSuccess,
  ]);

  return {
    name,
    setName,
    url,
    setUrl,
    environment,
    setEnvironment,
    interval,
    setInterval,
    engine,
    setEngine,
    networkProfile,
    setNetworkProfile,
    timeout,
    setTimeout_,
    expectedStatus,
    setExpectedStatus,
    checkSsl,
    setCheckSsl,
    isPending,
    isEdit,
    handleSubmit,
  };
}

// --- Presentation Components ---

const SectionCard = ({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) => (
  <Card className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
    <CardHeader className="pb-3 px-5 pt-4">
      <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <span className="text-muted-foreground">{icon}</span>
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4 px-5 pb-5">{children}</CardContent>
  </Card>
);

const FieldWrapper = ({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={className}>
    <Typography
      variant="smallText"
      className="mb-1.5 block text-xs font-medium text-muted-foreground"
    >
      {label}
    </Typography>
    {children}
  </div>
);

interface DropdownSelectProps<T extends string | number> {
  value: T;
  onValueChange: (value: T) => void;
  options: readonly { value: T; label: string; desc?: string }[];
}

function DropdownSelect<T extends string | number>({
  value,
  onValueChange,
  options,
}: DropdownSelectProps<T>) {
  const currentOption = options.find((o) => o.value === value);
  const displayLabel = currentOption
    ? currentOption.desc
      ? `${currentOption.label} — ${currentOption.desc}`
      : currentOption.label
    : String(value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="h-8 w-full justify-between border-input bg-transparent px-2.5 py-1 text-sm font-normal text-foreground transition-colors hover:bg-muted/10 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <span className="truncate">{displayLabel}</span>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        style={{ width: "var(--radix-dropdown-menu-trigger-width)" }}
      >
        <DropdownMenuRadioGroup
          value={String(value)}
          onValueChange={(val) => {
            const found = options.find((o) => String(o.value) === val);
            if (found) {
              onValueChange(found.value);
            }
          }}
        >
          {options.map((o) => (
            <DropdownMenuRadioItem
              key={String(o.value)}
              value={String(o.value)}
            >
              {o.label}{" "}
              {o.desc && (
                <span className="text-[10px] text-muted-foreground/75 ml-1">
                  — {o.desc}
                </span>
              )}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const MonitoringSetupForm = ({
  projectId,
  configId,
  initialValues,
  onSuccess,
  onCancel,
}: MonitoringSetupFormProps) => {
  const {
    name,
    setName,
    url,
    setUrl,
    environment,
    setEnvironment,
    interval,
    setInterval,
    engine,
    setEngine,
    networkProfile,
    setNetworkProfile,
    timeout,
    setTimeout_,
    expectedStatus,
    setExpectedStatus,
    checkSsl,
    setCheckSsl,
    isPending,
    isEdit,
    handleSubmit,
  } = useMonitoringSetupForm({
    projectId,
    configId,
    initialValues,
    onSuccess,
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-400">
      {/* 2-Column Responsive Layout for Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Core Fields */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Information Section */}
          <SectionCard
            icon={<Globe className="h-4 w-4" />}
            title="General Information"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldWrapper label="Website Name" className="sm:col-span-2">
                <Input
                  id="monitoring-name"
                  value={name}
                  maxLength={50}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Production Landing Page"
                  autoComplete="off"
                />
              </FieldWrapper>

              <FieldWrapper label="Website URL" className="sm:col-span-2">
                <Input
                  id="monitoring-url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://your-website.com"
                  autoComplete="off"
                />
              </FieldWrapper>
            </div>
          </SectionCard>

          {/* Security Section */}
          <SectionCard icon={<Shield className="h-4 w-4" />} title="Security">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 items-end">
              <FieldWrapper label="Expected HTTP Status">
                <DropdownSelect
                  value={expectedStatus}
                  onValueChange={setExpectedStatus}
                  options={HTTP_STATUS_OPTIONS}
                />
              </FieldWrapper>

              <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/5 px-2.5 py-1 h-8">
                <div className="flex flex-col justify-center min-w-0">
                  <span className="text-xs font-semibold text-foreground leading-tight truncate">
                    SSL Check
                  </span>
                  <span className="text-[9px] text-muted-foreground/60 leading-none truncate">
                    Verify issuer &amp; expiry
                  </span>
                </div>
                <Switch
                  id="monitoring-ssl"
                  checked={checkSsl}
                  onCheckedChange={setCheckSsl}
                  className="scale-90"
                />
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Right Column: Settings & Metadata */}
        <div className="lg:col-span-1 space-y-6">
          {/* Performance & Environment Settings */}
          <SectionCard
            icon={<Gauge className="h-4 w-4" />}
            title="Performance Settings"
          >
            <div className="space-y-4">
              <FieldWrapper label="Environment">
                <DropdownSelect
                  value={environment}
                  onValueChange={setEnvironment}
                  options={ENVIRONMENT_OPTIONS}
                />
              </FieldWrapper>

              <FieldWrapper label="Monitoring Interval">
                <DropdownSelect
                  value={interval}
                  onValueChange={setInterval}
                  options={INTERVAL_OPTIONS}
                />
              </FieldWrapper>

              <FieldWrapper label="Monitoring Engine">
                <DropdownSelect
                  value={engine}
                  onValueChange={setEngine}
                  options={ENGINE_OPTIONS}
                />
              </FieldWrapper>

              <FieldWrapper label="Network Profile">
                <DropdownSelect
                  value={networkProfile}
                  onValueChange={setNetworkProfile}
                  options={NETWORK_PROFILE_OPTIONS}
                />
              </FieldWrapper>

              <FieldWrapper label="Connection Timeout">
                <DropdownSelect
                  value={timeout}
                  onValueChange={setTimeout_}
                  options={TIMEOUT_OPTIONS}
                />
              </FieldWrapper>
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Action Footer Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        {onCancel && (
          <Button
            id="monitoring-cancel-btn"
            variant="ghost"
            onClick={onCancel}
            disabled={isPending}
            className="text-xs text-muted-foreground hover:text-foreground h-9"
          >
            Cancel
          </Button>
        )}
        <Button
          id="monitoring-submit-btn"
          onClick={handleSubmit}
          disabled={isPending}
          className="gap-2 px-5 h-9 text-xs font-semibold"
        >
          {isPending ? (
            "Saving..."
          ) : isEdit ? (
            <>
              <Save className="h-3.5 w-3.5" /> Save Changes
            </>
          ) : (
            <>
              <PlusCircle className="h-3.5 w-3.5" /> Create Configuration
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
