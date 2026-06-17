import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

export const useNotification = () => {
  const notifications = useQuery(api.notifications.get);
  const unreadCount = useQuery(api.notifications.getUnreadCount) || 0;

  const markAsReadMutation = useMutation(api.notifications.markAsRead);
  const markAllAsReadMutation = useMutation(api.notifications.markAllAsRead);
  const removeMutation = useMutation(api.notifications.remove);

  const onMarkAsRead = async (id: Id<"notifications">) => {
    try {
      await markAsReadMutation({ id });
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const onMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation();
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all as read");
      console.error(error);
    }
  };

  const onRemove = async (id: Id<"notifications">) => {
    try {
      await removeMutation({ id });
      toast.success("Notification removed");
    } catch (error) {
      toast.error("Failed to remove notification");
      console.error(error);
    }
  };

  return {
    notifications,
    unreadCount,
    onMarkAsRead,
    onMarkAllAsRead,
    onRemove,
    isLoading: notifications === undefined,
  };
};
