import React from "react";
import {
  LayoutDashboard,
  BookOpen,
  Clock,
  FileText,
  Calendar,
  GraduationCap,
  Activity,
  BarChart2,
  Bot,
  Bell,
  Settings,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Brain,
  X,
  Library
} from "lucide-react";

type NavPage =
  | "dashboard"
  | "assignments"
  | "reminders"
  | "notes"
  | "calendar"
  | "timetable"
  | "attendance"
  | "ai"
  | "notifications"
  | "settings"
  | "profile"
  | "subjects";

interface SidebarProps {
  page: NavPage;
  setPage: (page: NavPage) => void;
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (o: boolean) => void;
  badgeValues: {
    assignments: number;
    reminders: number;
    notifications: number;
  };
  onLogout?: () => void;
}

export default function Sidebar({
  page,
  setPage,
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
  badgeValues,
  onLogout,
}: SidebarProps) {
  const menuItems = [
    { id: "dashboard" as NavPage, label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { id: "subjects" as NavPage, label: "Subjects", icon: <Library size={18} /> },
    { id: "assignments" as NavPage, label: "Assignments", icon: <BookOpen size={18} />, badge: badgeValues.assignments },
    { id: "reminders" as NavPage, label: "Reminders", icon: <Clock size={18} />, badge: badgeValues.reminders },
    { id: "notes" as NavPage, label: "Notes", icon: <FileText size={18} /> },
    { id: "calendar" as NavPage, label: "Calendar", icon: <Calendar size={18} /> },
    { id: "timetable" as NavPage, label: "Timetable", icon: <GraduationCap size={18} /> },
    { id: "attendance" as NavPage, label: "Attendance", icon: <Activity size={18} /> },
    { id: "ai" as NavPage, label: "AI Assistant", icon: <Bot size={18} />, highlight: true },
  ];

  const bottomItems = [
    { id: "notifications" as NavPage, label: "Notifications", icon: <Bell size={18} />, badge: badgeValues.notifications },
    { id: "settings" as NavPage, label: "Settings", icon: <Settings size={18} /> },
    { id: "profile" as NavPage, label: "Profile", icon: <User size={18} /> },
  ];

  const handleNavigate = (targetPage: NavPage) => {
    setPage(targetPage);
    setMobileOpen(false);
  };

  const renderNavList = (items: typeof menuItems) => {
    return items.map((item) => {
      const isActive = page === item.id;
      return (
        <button
          key={item.id}
          onClick={() => handleNavigate(item.id)}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 select-none group relative ${
            isActive
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
              : item.highlight
              ? "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/20 hover:bg-purple-100 dark:hover:bg-purple-950/30"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <span className={`flex-shrink-0 transition-transform duration-200 group-hover:scale-105 ${isActive ? "text-white" : ""}`}>
            {item.icon}
          </span>
          
          {(!collapsed || mobileOpen) && (
            <span className="truncate font-[Outfit]">{item.label}</span>
          )}

          {/* Badge count */}
          {item.badge !== undefined && item.badge > 0 && (
            <span
              className={`ml-auto px-1.5 py-0.5 rounded-full text-[10px] font-bold transition-all min-w-[18px] text-center ${
                isActive
                  ? "bg-white text-indigo-600"
                  : "bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-500/10"
              }`}
            >
              {item.badge}
            </span>
          )}

          {/* Tooltip for collapsed view */}
          {collapsed && !mobileOpen && (
            <span className="absolute left-14 scale-0 group-hover:scale-100 bg-popover text-popover-foreground text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-border shadow-lg transition-all duration-150 origin-left z-50 whitespace-nowrap">
              {item.label}
              {item.badge !== undefined && item.badge > 0 && ` (${item.badge})`}
            </span>
          )}
        </button>
      );
    });
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-card border-r border-border py-5 px-3">
      {/* Brand logo & header */}
      <div className="flex items-center justify-between px-2 mb-6">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-indigo-600/25">
            <Brain size={18} className="animate-pulse" />
          </div>
          {(!collapsed || mobileOpen) && (
            <div className="flex flex-col animate-fade-in">
              <span className="font-extrabold text-sm tracking-tight font-[Outfit] bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent leading-none">
                MindVault
              </span>
              <span className="text-[10px] font-bold text-muted-foreground mt-0.5">STUDENT OS</span>
            </div>
          )}
        </div>

        {/* Close mobile nav button */}
        {mobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg md:hidden transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Main Nav Section */}
      <div className="flex-1 space-y-1.5 overflow-y-auto pr-0.5 scrollbar-hide">
        {renderNavList(menuItems)}
      </div>

      {/* Bottom section (Settings, notifications, profile, signout) */}
      <div className="pt-4 border-t border-border/60 space-y-1.5">
        {renderNavList(bottomItems)}

        {/* Sign Out Trigger */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-all duration-200 select-none group relative"
          >
            <span className="flex-shrink-0 transition-transform duration-200 group-hover:scale-105">
              <LogOut size={18} />
            </span>
            {(!collapsed || mobileOpen) && <span className="truncate font-[Outfit]">Sign Out</span>}
            {collapsed && !mobileOpen && (
              <span className="absolute left-14 scale-0 group-hover:scale-100 bg-popover text-red-500 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-border shadow-lg transition-all duration-150 origin-left z-50 whitespace-nowrap animate-scale-up">
                Sign Out
              </span>
            )}
          </button>
        )}
        
        {/* Collapse Toggle trigger on desktop */}
        {!mobileOpen && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full hidden md:flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200"
          >
            <span className="flex-shrink-0">
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </span>
            {!collapsed && <span className="font-[Outfit]">Collapse Menu</span>}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:block h-screen transition-all duration-300 flex-shrink-0 z-20 ${
          collapsed ? "w-16" : "w-60"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (overlay backdrop) */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        >
          {/* Mobile Drawer content container */}
          <aside
            className="w-64 h-full animate-scale-up z-50 absolute left-0 top-0 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
