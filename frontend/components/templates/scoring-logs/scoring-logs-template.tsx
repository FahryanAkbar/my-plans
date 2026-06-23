'use client'

import * as React from 'react'
import { 
  ScoreHistory, 
  ActivityTracker,
  UserScoreCard,
  TeamKpiTable,
} from '@/components/organisms'
import { PageHeader } from '@/components/molecules'

import { cn } from '@/lib/utils'
import { Id } from "@/convex/_generated/dataModel"

interface ScoringLogsTemplateProps {
  projectId: Id<"projects">
  className?: string
}

export const ScoringLogsTemplate = ({
  projectId,
  className,
}: ScoringLogsTemplateProps) => {
  return (
    <div className={cn("h-full flex flex-col bg-muted/5", className)} data-project-id={projectId}>
      <main className="flex-1 flex flex-col overflow-y-auto pb-20">
        <div className="w-full px-4 md:px-8 pt-4 md:pt-8">
          <div className="mx-auto w-full max-w-7xl">
            <div className="animate-in fade-in slide-in-from-top-4 duration-500">
              <PageHeader
                title="Scoring & Logs"
                description="Track individual performance, team KPIs, and activity history in one place."
                className="px-0 pt-0 pb-6 bg-transparent border-b-0 static"
              />
            </div>
          </div>
        </div>

        <div className="w-full px-4 md:px-8 pt-2 md:pt-4">
          <div className="mx-auto space-y-10 max-w-7xl">
          <section className="space-y-4">
            <UserScoreCard projectId={projectId} />
          </section>

          <section className="space-y-4">
            <div className="space-y-8">
              <div>
                <TeamKpiTable projectId={projectId} />
              </div>
              <div className="rounded-2xl border border-border/40 bg-card/50 overflow-hidden shadow-sm p-8 lg:p-10">
                <ActivityTracker 
                  projectId={projectId}
                  variant="heatmap"
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="rounded-2xl border border-border/40 bg-card/50 overflow-hidden shadow-sm p-2">
              <ScoreHistory 
                projectId={projectId}
              />
            </div>
          </section>
          </div>
        </div>
      </main>
    </div>
  )
}
