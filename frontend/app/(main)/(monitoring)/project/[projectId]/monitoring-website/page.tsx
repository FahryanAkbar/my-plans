'use client'

import { use } from "react";
import { MonitoringWebsitesTemplate } from "@/components/templates";

interface MonitoringWebsitePageProps {
    params: Promise<{ projectId: string }>;
}

export default function MonitoringWebsitePage({ params }: MonitoringWebsitePageProps) {
    const { projectId } = use(params);
    return (
        <MonitoringWebsitesTemplate projectId={projectId} />
    );
}