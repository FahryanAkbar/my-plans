"use client";

import Image from "next/image";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button, Typography } from "@/components/atoms";
import { cn } from "@/lib/utils";

interface JoinAuthCardProps {
  token: string;
  className?: string;
}

export const JoinAuthCard = ({ token, className }: JoinAuthCardProps) => {
  const cardBaseStyles = "border-none bg-white dark:bg-[#1A1A1A] shadow-xl rounded-[2rem] overflow-hidden";

  return (
    <div className={cn("w-full max-w-4xl", className)}>
      <div className={cn(cardBaseStyles, "flex flex-col md:flex-row")}>
        <div className="hidden md:flex flex-1 items-center justify-center p-12 relative overflow-hidden bg-gray-50/50 dark:bg-white/5 border-r border-gray-100 dark:border-gray-800/50">
          <div className="relative z-10 text-center">
            <div className="relative w-75 h-75 mx-auto mb-8">
              <Image 
                src="/newsletter.svg" 
                alt="Authentication" 
                fill 
                className="object-contain dark:hidden"
                priority
              />
              <Image 
                src="/newsletter-dark.svg" 
                alt="Authentication" 
                fill 
                className="hidden object-contain dark:block"
                priority
              />
            </div>
            <Typography className="text-lg font-medium text-muted-foreground/50 italic tracking-tight">
              &quot;One step away from your team.&quot;
            </Typography>
          </div>
        </div>

        <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-12">
            <Typography variant="h2" className="text-3xl font-bold text-black dark:text-white mb-4 tracking-tight">
              Join the Team
            </Typography>
            <Typography className="text-base leading-relaxed text-gray-500 dark:text-gray-400 max-w-md">
              You have a pending invitation. Please sign in or create an account to securely access your new project workspace.
            </Typography>
          </div>

          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-3">
              <SignInButton mode="modal" forceRedirectUrl={`/join/${token}`} signUpForceRedirectUrl={`/join/${token}`}>
                <Button variant="default" className="h-10 w-full font-bold text-sm shadow-sm">
                  Sign in
                </Button>
              </SignInButton>
              <SignUpButton mode="modal" forceRedirectUrl={`/join/${token}`} signInForceRedirectUrl={`/join/${token}`}>
                <Button variant="outline" className="h-10 w-full font-bold text-sm">
                  Create Account
                </Button>
              </SignUpButton>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
              <Button 
                variant="ghost" 
                onClick={() => window.location.href = "/"} 
                className="h-9 text-gray-400 hover:text-black dark:hover:text-white font-semibold text-xs transition-colors px-6"
              >
                Cancel
              </Button>
              <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800/30">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400/60">
              Authentication Required
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
