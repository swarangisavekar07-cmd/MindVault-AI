import React, { useState } from "react";
import { BookOpen, Bell, AlertTriangle, Sparkles, Award, Check, Trash2, MailOpen, Eye } from "lucide-react";
import { AppNotification } from "../data/mockData";
import EmptyState from "./EmptyState";

interface NotificationsPageProps {
  notifications: AppNotification[];
  setNotifications: (
    n: AppNotification[] | ((curr: AppNotification[]) => AppNotification[])
  ) => void;
}

export default function NotificationsPage({
  notifications,
  setNotifications,
}: NotificationsPageProps) {
  const [filter, setFilter] = useState<"all" | "unread" | "read" | "alerts">("all");

  const toggleRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const deleteNotif = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const icons: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
    assignment: { icon: <BookOpen size={16} />, color: "#4F46E5", bg: "bg-indigo-500/10" },
    reminder: { icon: <Bell size={16} />, color: "#8B5CF6", bg: "bg-purple-500/10" },
    warning: { icon: <AlertTriangle size={16} />, color: "#EF4444", bg: "bg-red-500/10" },
    ai: { icon: <Sparkles size={16} />, color: "#F59E0B", bg: "bg-amber-500/10" },
    grade: { icon: <Award size={16} />, color: "#10B981", bg: "bg-emerald-500/10" },
  };

  const displayed = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "read") return n.read;
    if (filter === "alerts") return n.type === "warning";
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;
  const totalCount = notifications.length;

  return (
    <div className="p-6 space-y-5 max-w-[900px] mx-auto animate-fade-in">
      {/* Header and Bulk Actions */}
      <div className="flex items-center justify-between flex-wrap gap-3 select-none">
        <div>
          <h2 className="text-lg font-bold font-[Outfit] text-foreground">Notifications Hub</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {unreadCount} unread of {totalCount} total updates
          </p>
        </div>
        {totalCount > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-muted/60 hover:bg-muted text-foreground border border-border/80 transition-all active:scale-[0.98]"
            >
              <MailOpen size={13} /> Mark all read
            </button>
            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-red-50 dark:bg-red-950/20 hover:bg-red-100 text-red-600 dark:text-red-400 border border-red-500/10 transition-all active:scale-[0.98]"
            >
              <Trash2 size={13} /> Clear all
            </button>
          </div>
        )}
      </div>

      {/* Tabs / Filters */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-3 select-none">
        {([
          { id: "all", label: "All Updates" },
          { id: "unread", label: "Unread", count: unreadCount },
          { id: "read", label: "Read" },
          { id: "alerts", label: "Alerts" },
        ] as const).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all ${
              filter === tab.id
                ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                : "bg-card text-muted-foreground border-border hover:border-indigo-300"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`ml-1.5 px-1 py-0.2 rounded-full text-[9px] font-bold ${
                filter === tab.id ? "bg-white text-indigo-600" : "bg-indigo-600 text-white"
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notification items */}
      {displayed.length === 0 ? (
        <EmptyState
          title="All Caught Up!"
          description={`No notifications found in the "${filter}" filter. You're completely up to date.`}
        />
      ) : (
        <div className="space-y-3">
          {displayed.map((n) => {
            const config = icons[n.type] || icons.reminder;
            return (
              <div
                key={n.id}
                className={`bg-card border rounded-2xl p-4 flex gap-4 hover:shadow-sm transition-all group ${
                  n.read ? "border-border/60 opacity-70" : "border-border"
                }`}
              >
                {/* Visual Icon Badge */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0`}
                  style={{ backgroundColor: config.color + "15", color: config.color }}
                >
                  {config.icon}
                </div>

                {/* Main details content */}
                <div className="flex-1 min-w-0 pr-8">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <p className={`text-sm font-bold text-foreground leading-snug ${!n.read ? "font-extrabold" : ""}`}>
                      {n.title}
                    </p>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0 select-none">
                      {n.time}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{n.msg}</p>
                </div>

                {/* Operations side tools */}
                <div className="flex items-center gap-1.5 flex-shrink-0 ml-auto select-none opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => toggleRead(n.id)}
                    className={`p-1.5 rounded-lg border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors`}
                    title={n.read ? "Mark as unread" : "Mark as read"}
                  >
                    <Check size={13} className={n.read ? "text-muted-foreground" : "text-emerald-500 font-bold"} />
                  </button>
                  <button
                    onClick={() => deleteNotif(n.id)}
                    className="p-1.5 rounded-lg border border-red-500/10 bg-red-50/30 dark:bg-red-950/10 hover:bg-red-100/40 text-red-500 hover:text-red-600 transition-colors"
                    title="Delete notification"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
