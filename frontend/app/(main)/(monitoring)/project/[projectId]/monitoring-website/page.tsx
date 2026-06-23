'use client'

import { use } from "react";
import { MonitoringWebsitesTemplate } from "@/components/templates";

interface MonitoringWebsitePageProps {
    params: Promise<{ projectId: string }>;
    searchParams: Promise<{ configId?: string }>;
}

export default function MonitoringWebsitePage({ params, searchParams }: MonitoringWebsitePageProps) {
    const { projectId } = use(params);
    const { configId } = use(searchParams);
    return (
        <MonitoringWebsitesTemplate projectId={projectId} configId={configId} />
    );
}
