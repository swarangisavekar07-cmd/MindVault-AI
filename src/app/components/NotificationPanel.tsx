import React, { useRef, useEffect } from "react";
import { BookOpen, Bell, AlertTriangle, Sparkles, Award, Check, Trash2, X } from "lucide-react";
import { AppNotification } from "../data/mockData";

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkRead: (id: number) => void;
  onDelete: (id: number) => void;
  onMarkAllRead: () => void;
}

export default function NotificationPanel({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onDelete,
  onMarkAllRead,
}: NotificationPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const icons: Record<string, { icon: React.ReactNode; color: string }> = {
    assignment: { icon: <BookOpen size={13} />, color: "#4F46E5" },
    reminder: { icon: <Bell size={13} />, color: "#8B5CF6" },
    warning: { icon: <AlertTriangle size={13} />, color: "#EF4444" },
    ai: { icon: <Sparkles size={13} />, color: "#F59E0B" },
    grade: { icon: <Award size={13} />, color: "#10B981" },
  };

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-12 w-80 sm:w-96 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col max-h-[480px] animate-fade-in"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
        <div>
          <h3 className="text-sm font-bold font-[Outfit] text-foreground">Notifications</h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">{unreadCount} unread items</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="text-[11px] text-indigo-500 hover:text-indigo-600 font-semibold"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-lg text-muted-foreground"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Notifications list */}
      <div className="flex-1 overflow-y-auto divide-y divide-border/40 max-h-[360px]">
        {notifications.length > 0 ? (
          notifications.map((n) => {
            const typeConfig = icons[n.type] || icons.reminder;
            return (
              <div
                key={n.id}
                className={`flex gap-3 p-3.5 hover:bg-muted/40 transition-colors group relative ${
                  !n.read ? "bg-indigo-50/20 dark:bg-indigo-950/10" : ""
                }`}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: typeConfig.color + "15", color: typeConfig.color }}
                >
                  {typeConfig.icon}
                </div>
                <div className="flex-1 min-w-0 pr-8">
                  <div className="flex justify-between items-start gap-1">
                    <p className={`text-xs text-foreground font-medium truncate ${!n.read ? "font-bold" : ""}`}>
                      {n.title}
                    </p>
                    <span className="text-[9px] text-muted-foreground flex-shrink-0 mt-0.5">{n.time}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed break-words">{n.msg}</p>
                </div>

                {/* Hover actions */}
                <div className="absolute right-2 top-3.5 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!n.read && (
                    <button
                      onClick={() => onMarkRead(n.id)}
                      className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                      title="Mark as read"
                    >
                      <Check size={11} />
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(n.id)}
                    className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-red-500"
                    title="Delete"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Bell size={28} className="text-muted-foreground/30 mb-2" />
            <p className="text-xs text-muted-foreground">All caught up! No notifications.</p>
          </div>
        )}
      </div>
    </div>
  );
}
