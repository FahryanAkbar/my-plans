"use client";

import { AlertTriangle, CheckCircle, Info, Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/atoms";
import { useMediaQuery } from "usehooks-ts";
import { cn } from '@/lib';

export type ConfirmationVariant = 
  | 'default' 
  | 'destructive' 
  | 'warning' 
  | 'info' 
  | 'success'

interface ConfirmModalProps {
  children?: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  variant?: ConfirmationVariant;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void | Promise<void> | null | string
  isLoading?: boolean;
  icon?: React.ReactNode;
  className?: string;
};

const ConfirmationVarianStyle: Record<
  ConfirmationVariant,
  {
    icon: React.ComponentType<{ className?: string}>
    iconColor: string
    bgColor: string
    confirmationButtonVariant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost'
  }
> = {
  default: {
    icon: Info,
    iconColor: 'text-primary',
    bgColor: 'bg-primary/10',
    confirmationButtonVariant: 'default'
  },
  destructive: {
    icon: Trash2,
    iconColor: 'text-destructive',
    bgColor: 'bg-error/10',
    confirmationButtonVariant: 'destructive'
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-warning',
    bgColor: 'bg-warning/10',
    confirmationButtonVariant: 'destructive'
  },
  success: {
    icon: CheckCircle,
    iconColor: 'text-success',
    bgColor: 'bg-success/10',
    confirmationButtonVariant: 'default'
  },
  info: {
    icon: Info,
    iconColor: 'text-info',
    bgColor: 'bg-info/10',
    confirmationButtonVariant: 'outline'
  }
}

export const ConfirmModal = ({
  children,
  open,
  onOpenChange,
  title,
  description,
  variant = 'default',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  isLoading = false,
  icon: customIcon,
  className,
}: ConfirmModalProps) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isDestructive = variant === 'destructive' || variant === 'warning';

  const { icon: DefaultIcon, iconColor, bgColor, confirmationButtonVariant } = ConfirmationVarianStyle[variant];
  const IconComponent = customIcon || <DefaultIcon className={cn('h-6 w-6', iconColor)} />

  const handleConfirm = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.stopPropagation();
    if (typeof onConfirm === 'function') {
      onConfirm();
    }
  };

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        {children && (
          <DrawerTrigger onClick={(e) => e.stopPropagation()} asChild>
            {children}
          </DrawerTrigger>
        )}
        <DrawerContent className={className}>
          <DrawerHeader className="items-center text-center">
            <div className={cn("mb-4 flex h-12 w-12 items-center justify-center rounded-full", bgColor)}>
              {IconComponent}
            </div>
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter className="pt-2">
            <Button 
              onClick={handleConfirm} 
              disabled={isLoading} 
              variant={confirmationButtonVariant}
              className="w-full"
            >
              {isLoading ? "Processing..." : confirmText}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" className="w-full">
                {cancelText}
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }

  if (isDestructive) {
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        {children && (
          <AlertDialogTrigger onClick={(e) => e.stopPropagation()} asChild>
            {children}
          </AlertDialogTrigger>
        )}
        <AlertDialogContent className={cn("max-w-sm", className)}>
          <AlertDialogHeader>
            <AlertDialogMedia className={cn("rounded-full", bgColor)}>
              {IconComponent}
            </AlertDialogMedia>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              disabled={isLoading}
              onClick={e => e.stopPropagation()}
              variant="outline"
            >
              {cancelText}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirm}
              disabled={isLoading}
              variant={confirmationButtonVariant}
            >
              {isLoading ? "Processing..." : confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && (
        <DialogTrigger onClick={(e) => e.stopPropagation()} asChild>
          {children}
        </DialogTrigger>
      )}
      <DialogContent className={cn("max-w-sm", className)}>
        <DialogHeader className="items-center text-center">
          <div className={cn("mb-4 flex h-12 w-12 items-center justify-center rounded-full", bgColor)}>
            {IconComponent}
          </div>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="flex-1"
          >
            {cancelText}
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={isLoading} 
            variant={confirmationButtonVariant}
            className="flex-1"
          >
            {isLoading ? "Processing..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

