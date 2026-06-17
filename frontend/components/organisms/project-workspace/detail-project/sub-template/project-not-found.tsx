"use client";

import { useRouter } from "next/navigation";
import { FolderX } from "lucide-react";
import { Typography, Button } from "@/components/atoms";

export const ProjectNotFound = () => {
  const router = useRouter();

  return (
    <div className="h-full flex flex-col items-center justify-center gap-6 bg-background p-4 animate-in fade-in duration-500">
      <div className="h-24 w-24 rounded-full bg-muted/30 flex items-center justify-center">
        <FolderX className="h-10 w-10 text-muted-foreground" />
      </div>
      <div className="text-center space-y-2">
        <Typography variant="h3" className="font-semibold text-foreground">
          Project Unavailable
        </Typography>
        <Typography variant="muted" className="max-w-md mx-auto text-sm md:text-base">
          This project may have been deleted by the owner, or you no longer have access to it.
        </Typography>
      </div>
      <Button 
        onClick={() => router.push("/monitoring")} 
        variant="default" 
        className="mt-2 rounded-xl shadow-sm"
      >
        Go back to Projects
      </Button>
    </div>
  );
};
