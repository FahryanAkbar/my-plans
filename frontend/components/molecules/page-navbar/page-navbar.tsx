"use client";

import * as React from "react";
import { MenuIcon } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/atoms";
import { cn } from "@/lib";

export interface PageNavbarProps {
  breadcrumbs?: { label: string; href: string }[];
  showMenuIcon?: boolean;
  onMenuClick?: () => void;
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  showUserButton?: boolean;
}

export const PageNavbar = ({
  breadcrumbs = [],
  showMenuIcon = false,
  onMenuClick,
  leftContent,
  rightContent,
  children,
  className,
  showUserButton = true,
}: PageNavbarProps) => {
  return (
    <nav
      className={cn(
        "sticky top-0 z-20 w-full bg-background/80 backdrop-blur-sm border-b px-4 md:px-6 py-3 flex items-center gap-4",
        className
      )}
    >
      <div className="flex items-center gap-3">
        {showMenuIcon && (
          <MenuIcon
            onClick={onMenuClick}
            role="button"
            className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors"
          />
        )}
        
        {leftContent}

        {leftContent && breadcrumbs.length > 0 && (
          <div className="h-4 w-px bg-border/60 mx-1 hidden sm:block" />
        )}

        {breadcrumbs.length > 0 && (
          <Breadcrumb className="hidden sm:block">
            <BreadcrumbList>
              {breadcrumbs.map((bc, idx) => (
                <React.Fragment key={`${bc.href}-${idx}`}>
                  <BreadcrumbItem>
                    {idx < breadcrumbs.length - 1 ? (
                      <BreadcrumbLink href={bc.href} asChild>
                        <a className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                          {bc.label}
                        </a>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage className="text-xs font-medium text-foreground">
                        {bc.label}
                      </BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                  {idx < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        )}
      </div>

      <div className="flex-1 flex items-center justify-center">
        {children}
      </div>

      <div className="flex items-center gap-3 ml-auto">
        {rightContent}
        {showUserButton && (
          <UserButton/>
        )}
      </div>
    </nav>
  );
};
