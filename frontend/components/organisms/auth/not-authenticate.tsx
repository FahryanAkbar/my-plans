'use client'

import Image from "next/image";
import Link from "next/link";
import { Home } from "lucide-react";
import { Button, Typography } from "@/components/atoms";

export const NotAuthenticate = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-8 animate-in fade-in duration-500">
      <div className="relative w-full max-w-64 aspect-square">
        <Image
          src="/access-denied.svg"
          alt="Access Denied"
          fill
          className="object-contain opacity-90"
          priority
        />
      </div>

      <div className="max-w-md space-y-2">
        <Typography variant="h3" className="font-bold">
          Access Denied
        </Typography>
        <Typography variant="muted" className="text-base leading-relaxed">
          You are not allowed to access this page. Please make sure you have authenticated correctly.
        </Typography>
      </div>

      <Button size="default" variant="default" asChild className="min-w-40 shadow-lg shadow-primary/10">
        <Link href="/">
          <Home className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
      </Button>
    </div>
  )
}