import { Bell, Check, Trash2, Flame, Users, Sparkles, AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications, type Notification } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

const typeIcons: Record<string, typeof Bell> = {
  streak: Flame,
  group: Users,
  ai_insight: Sparkles,
  warning: AlertTriangle,
  info: Info,
};

const typeColors: Record<string, string> = {
  streak: "text-warning",
  group: "text-chart-blue",
  ai_insight: "text-primary",
  warning: "text-destructive",
  info: "text-muted-foreground",
};

function NotificationItem({
  notification,
  onRead,
  onDelete,
}: {
  notification: Notification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const Icon = typeIcons[notification.type] || Bell;
  const color = typeColors[notification.type] || "text-muted-foreground";

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer group",
        notification.read
          ? "opacity-60 hover:opacity-80"
          : "bg-accent/30 hover:bg-accent/50"
      )}
      onClick={() => !notification.read && onRead(notification.id)}
    >
      <div className={cn("mt-0.5 shrink-0", color)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0 space-y-0.5">
        <p className="text-sm font-medium text-foreground leading-tight">
          {notification.title}
        </p>
        <p className="text-xs text-muted-foreground leading-snug">
          {notification.message}
        </p>
        <p className="text-[10px] text-muted-foreground/60">
          {formatDistanceToNow(new Date(notification.created_at), {
            addSuffix: true,
          })}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 opacity-0 group-hover:opacity-100 shrink-0 text-muted-foreground hover:text-destructive"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(notification.id);
        }}
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
}

export function NotificationBell() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground transition-colors"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center animate-bounce-subtle">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 p-0 glass-card-premium border-border/50"
        sideOffset={8}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <h4 className="text-sm font-semibold text-foreground">
            Notifications
          </h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-primary hover:text-primary/80 h-auto py-1 px-2"
              onClick={markAllAsRead}
            >
              <Check className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-[360px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-30" />
              <p className="text-sm">No notifications yet</p>
              <p className="text-xs opacity-60">
                You'll see streak alerts, group activity & AI insights here
              </p>
            </div>
          ) : (
            <div className="p-1 space-y-0.5">
              {notifications.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onRead={markAsRead}
                  onDelete={deleteNotification}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
