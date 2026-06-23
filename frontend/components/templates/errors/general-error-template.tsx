"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, RefreshCw, Home } from "lucide-react";
import { Button, Typography } from "@/components/atoms";
import { cn } from "@/lib";

interface GeneralErrorTemplateProps {
  title?: string;
  description?: string;
  error?: Error & { digest?: string };
  reset?: () => void;
  className?: string;
}

export const GeneralErrorTemplate = ({
  title = "Something went wrong",
  description = "An unexpected error occurred. Our team has been notified and we're working to fix it.",
  error,
  reset,
  className,
}: GeneralErrorTemplateProps) => {
  return (
    <div className={cn("min-h-screen w-full flex flex-col items-center justify-center p-6 bg-background relative overflow-hidden", className)}>
      <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="flex justify-center">
          <div className="relative">
            <div className="h-24 w-24 rounded-3xl bg-destructive/10 flex items-center justify-center animate-pulse">
              <AlertCircle className="h-12 w-12 text-destructive" />
            </div>
            <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-background border-2 border-destructive flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-destructive" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Typography variant="h2" className="text-3xl font-bold tracking-tight">
            {title}
          </Typography>
          <Typography variant="muted" className="text-base max-w-sm mx-auto leading-relaxed">
            {description}
          </Typography>
          {error?.digest && (
            <div className="mt-4 p-2 rounded-lg bg-muted/50 border border-border/50">
              <Typography className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                Error ID: {error.digest}
              </Typography>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          {reset && (
            <Button 
              onClick={reset}
              size="lg" 
              className="w-full sm:w-auto min-w-35 shadow-lg shadow-primary/20"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          )}
          <Button 
            variant="outline" 
            size="lg" 
            asChild
            className="w-full sm:w-auto min-w-35"
          >
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
        </div>

        <div className="pt-8 flex justify-center">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to previous page
          </Button>
        </div>
      </div>

      {/* Subtle bottom text */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <Typography className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/30 font-medium">
          Secure Infrastructure · All Systems Operational
        </Typography>
      </div>
    </div>
  );
};
