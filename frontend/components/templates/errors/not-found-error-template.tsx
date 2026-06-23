"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Home } from "lucide-react";
import { Button, Typography } from "@/components/atoms";
import { cn } from "@/lib";

interface NotFoundErrorTemplateProps {
  title?: string;
  description?: string;
  className?: string;
}

export const NotFoundErrorTemplate = ({
  title = "Oops! Page not found",
  description = "The page you are looking for doesn't exist.",
  className,
}: NotFoundErrorTemplateProps) => {
  return (
    <div className={cn("min-h-screen w-full flex flex-col items-center justify-center p-6 bg-background relative overflow-hidden", className)}>
      <div className="absolute top-1/4 -right-1/4 w-1/2 h-1/2 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg text-center space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-700">
        <div className="flex justify-center">
          <div className="relative w-full max-w-[320px] aspect-square">
            <Image
              src="/404-error.svg"
              alt="404 Error"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        <div className="space-y-2">
          <Typography variant="h3" className="text-xl font-semibold">
            {title}
          </Typography>
          <Typography variant="muted" className="text-base max-w-sm mx-auto leading-relaxed">
            {description}
          </Typography>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Button 
            size="default" 
            variant="default"
            className="w-full sm:w-auto min-w-44 shadow-lg shadow-primary/20"
            asChild
          >
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <Button 
            variant="outline" 
            size="default"
            onClick={() => window.history.back()}
            className="w-full sm:w-auto min-w-44"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>

      <div className="absolute bottom-8 left-0 right-0 text-center">
        <Typography className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/20 font-bold">
          My Plans · A Project Management Platform for everyone 
        </Typography>
      </div>
    </div>
  );
};
