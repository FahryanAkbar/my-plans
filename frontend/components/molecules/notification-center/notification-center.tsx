'use client'

import React from "react"
import Image from "next/image"
import Link from "next/link"
import { 
  Bell, 
  Trash2, 
  Inbox, 
  MessageSquare, 
  UserPlus, 
  AlertCircle, 
  CheckCircle2 
} from "lucide-react"
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger ,
  Button, 
  Typography, 
  Avatar, 
  Badge
} from "@/components/atoms"
import { formatDistanceToNow } from "date-fns"
import { Doc, Id } from "@/convex/_generated/dataModel"

import { cn } from "@/lib"
import { NOTIFICATION_COLORS } from "@/lib"

type NotificationWithSender = Doc<"notifications"> & {
  senderName?: string;
  senderImageUrl?: string;
}

interface NotificationItemProps {
  notification: NotificationWithSender;
  onMarkRead: () => void;
  onRemove: () => void;
}

interface NotificationCenterProps {
  notifications?: NotificationWithSender[];
  unreadCount: number;
  isLoading: boolean;
  onMarkAsRead: (id: Id<"notifications">) => void;
  onMarkAllAsRead: () => void;
  onRemove: (id: Id<"notifications">) => void;
}

export const NotificationCenter = ({
  notifications,
  unreadCount,
  isLoading,
  onMarkAsRead,
  onMarkAllAsRead,
  onRemove
}: NotificationCenterProps) => {

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant='ghost'  
          size='icon-sm' 
          className='relative text-muted-foreground hover:text-foreground transition-colors'
          title="Notifications"
        >
          <Bell className="size-4"/>
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-4 w-4 min-w-0 p-0 flex items-center justify-center text-[10px] bg-red-500 hover:bg-red-600 border-2 border-background text-white"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 overflow-hidden rounded-xl border-border/50 shadow-2xl bg-popover/95 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4 border-b bg-muted/30">
          <Typography className="font-bold text-sm">Notifications</Typography>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onMarkAllAsRead}
              className="h-7 px-2 text-[11px] text-primary hover:text-primary hover:bg-primary/10"
            >
              Mark all as read
            </Button>
          )}
        </div>
        
        <div className="max-h-100 overflow-y-auto custom-scrollbar">
          {isLoading ? (
             <div className="p-12 text-center">
               <Typography variant="muted" className="text-xs animate-pulse">Loading...</Typography>
             </div>
          ) : !notifications || notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-10 text-center space-y-4">
              <div className="relative h-28 w-28 mx-auto">
                <Image
                  src="/empty-mailbox.svg"
                  fill
                  alt="No notifications"
                  className="object-contain opacity-70 dark:opacity-60"
                  priority
                />
              </div>
              <div className="space-y-1">
                <Typography className="font-semibold text-sm">
                  All caught up!
                </Typography>
                <Typography variant="muted" className="text-xs max-w-50 mx-auto">
                  You don&lsquo;t have any unread notifications at the moment.
                </Typography>
              </div>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-border/40">
              {notifications.map((n) => (
                <NotificationItem 
                  key={n._id} 
                  notification={n} 
                  onMarkRead={() => onMarkAsRead(n._id)}
                  onRemove={() => onRemove(n._id)}
                />
              ))}
            </div>
          )}
        </div>
        
        {notifications && notifications.length > 0 && (
           <div className="p-2 border-t bg-muted/10 text-center">
             <Typography className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
               Stay updated with your team
             </Typography>
           </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

const NotificationItem = ({ notification, onMarkRead, onRemove }: NotificationItemProps) => {
  const styles = NOTIFICATION_COLORS[notification.type as keyof typeof NOTIFICATION_COLORS]

  const getCleanLink = (link?: string) => {
    if (!link) return undefined;
    // Jika link mengarah ke spesifik task, arahkan ke tab tasks di project tersebut
    if (link.includes('/task/')) {
      return `${link.split('/task/')[0]}/tasks`;
    }
    return link;
  };

  const getIcon = () => {
    const iconClass = cn("size-3.5", styles?.text || "text-muted-foreground")
    switch (notification.type) {
      case 'TASK_ASSIGNED': return <UserPlus className={iconClass} />
      case 'COMMENT_TAGGED': return <MessageSquare className={iconClass} />
      case 'PROJECT_INVITATION': return <Inbox className={iconClass} />
      case 'MEMBER_REMOVED': return <AlertCircle className={iconClass} />
      case 'STATUS_CHANGED': return <CheckCircle2 className={iconClass} />
      default: return <Bell className={iconClass} />
    }
  }

  return (
    <div 
      className={cn(
        "group relative flex gap-3 p-4 transition-all hover:bg-muted/40 cursor-default",
        !notification.isRead && "bg-primary/5"
      )}
      onClick={() => !notification.isRead && onMarkRead()}
    >
      <Avatar className="size-9 border border-border/50 shadow-sm">
        <Image 
          src={notification.senderImageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${notification.senderName || 'System'}`} 
          alt={notification.senderName || 'User Avatar'} 
          width={36}
          height={36}
          className="object-cover rounded-full"
          unoptimized
        />
      </Avatar>
      
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <div className={cn(
            "p-1 rounded-md border shadow-sm transition-colors",
            styles?.bg || "bg-background",
            styles?.border || "border-border/50"
          )}>
            {getIcon()}
          </div>
          <Typography className={cn("text-[13px] leading-tight truncate", !notification.isRead ? "font-bold" : "font-medium")}>
            {notification.title}
          </Typography>
        </div>
        
        <Typography variant="muted" className="text-[12px] leading-snug line-clamp-2">
          {notification.description}
        </Typography>
        
        <div className="flex items-center justify-between mt-1">
          <Typography className="text-[10px] text-muted-foreground/70 font-medium">
            {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
          </Typography>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {notification.link && (
               <Link href={getCleanLink(notification.link) || '#'}>
                 <Button variant="ghost" size="icon" className="size-6 text-muted-foreground hover:text-primary">
                   <Inbox className="size-3" />
                 </Button>
               </Link>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={(e) => {
                e.stopPropagation()
                onRemove()
              }}
              className="size-6 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="size-3" />
            </Button>
          </div>
        </div>
      </div>

      {!notification.isRead && (
        <span className="absolute top-4 right-4 size-2 rounded-full bg-primary" />
      )}
    </div>
  )
}
