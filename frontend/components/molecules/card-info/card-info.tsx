import * as React from "react";
import { type VariantProps, cva } from "class-variance-authority";

import { cn } from "@/lib";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button, 
  Badge, 
  Typography
} from "@/components/atoms";

const cardInfoVariants = cva("", {
  variants: {
    layout: {
      default: "",
      centered: "[&_.card-info-header]:items-center [&_.card-info-header]:text-center [&_.card-info-body]:text-center",
      compact: "",
    },
  },
  defaultVariants: {
    layout: "default",
  },
});

export interface CardInfoAction {
  label: React.ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  disabled?: boolean;
  className?: string;
}

export interface CardInfoBadge {
  label: React.ReactNode;
  variant?: React.ComponentProps<typeof Badge>["variant"];
  className?: string;
}

export interface CardInfoProps extends VariantProps<typeof cardInfoVariants> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  badges?: CardInfoBadge[];
  children?: React.ReactNode;
  actions?: CardInfoAction[];
  footer?: React.ReactNode;
  hideFooterBorder?: boolean;
  size?: "default" | "sm" | "lg";
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
}

export function CardInfo({
  title,
  description,
  icon,
  badges,
  children,
  actions,
  footer,
  hideFooterBorder = false,
  layout,
  className,
  headerClassName,
  bodyClassName,
  footerClassName,
}: CardInfoProps) {
  const hasHeader = icon || title || description || (badges && badges.length > 0);
  const hasBody = !!children;
  const hasActions = actions && actions.length > 0;
  const hasFooter = !!footer;

  return (
    <Card
      className={cn(cardInfoVariants({ layout }), className)}
    >
      {hasHeader && (
        <CardHeader
          className={cn("card-info-header flex flex-col gap-2", headerClassName)}
        >
          {icon && (
            <div className="card-info-icon mb-1 flex justify-center">
              {icon}
            </div>
          )}

          <div className="card-info-title-row flex flex-wrap items-center gap-2">
            {title && (
              <CardTitle className="flex-1">{title}</CardTitle>
            )}
            {badges?.map((badge, i) => (
              <Badge
                key={i}
                variant={badge.variant}
                className={badge.className}
              >
                {badge.label}
              </Badge>
            ))}
          </div>

          {description && (
            <CardDescription>{description}</CardDescription>
          )}
        </CardHeader>
      )}

      {hasBody && (
        <CardContent className={cn("card-info-body", bodyClassName)}>
          {children}
        </CardContent>
      )}

      {hasActions && (
        <CardContent className="card-info-actions flex flex-col gap-2 pt-0">
          {actions!.map((action, i) => (
            <Button
              key={i}
              variant={action.variant ?? (i === 0 ? "default" : "ghost")}
              size={action.size ?? "default"}
              disabled={action.disabled}
              onClick={action.onClick}
              className={cn("w-full", action.className)}
              {...(action.href ? { asChild: true } : {})}
            >
              {action.href ? (
                <a href={action.href}>{action.label}</a>
              ) : (
                action.label
              )}
            </Button>
          ))}
        </CardContent>
      )}

      {hasFooter && (
        <CardFooter
          className={cn(
            "card-info-footer",
            hideFooterBorder && "border-t-0 bg-transparent",
            footerClassName
          )}
        >
          {typeof footer === "string" ? (
            <Typography className="text-xs text-muted-foreground w-full text-center uppercase font-bold tracking-widest opacity-60">
              {footer}
            </Typography>
          ) : (
            footer
          )}
        </CardFooter>
      )}
    </Card>
  );
}
