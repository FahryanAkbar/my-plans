import { Loader } from "lucide-react";
import { cva, VariantProps } from "class-variance-authority";
import { cn } from "@/lib";

const loaderVariants = cva("text-muuted-foreground animate-spin", {
  variants: {
    size: {
      default: "w-3 h-3",
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-6 h-6",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

interface LoaderProps extends VariantProps<typeof loaderVariants> {
  className?: string;
}

export function Loaders({ 
  className, size 
}: LoaderProps) {
  return <Loader className={cn(loaderVariants({ size }), className)} />;
}