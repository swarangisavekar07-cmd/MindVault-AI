import React, { useState } from "react";
import { Menu, Plus, Search, Bell, Sun, Moon, Sparkles } from "lucide-react";
import { Assignment, Note, Reminder, AppNotification } from "../data/mockData";
import GlobalSearch from "./GlobalSearch";
import NotificationPanel from "./NotificationPanel";

type NavPage =
  | "dashboard"
  | "assignments"
  | "reminders"
  | "notes"
  | "calendar"
  | "timetable"
  | "attendance"
  | "analytics"
  | "ai"
  | "notifications"
  | "settings"
  | "profile"
  | "subjects"; // Added subjects navpage

interface TopNavProps {
  page: NavPage;
  isDark: boolean;
  toggleDark: () => void;
  onMenuClick: () => void;
  unreadNotifCount: number;
  notifications: AppNotification[];
  onMarkRead: (id: number) => void;
  onDelete: (id: number) => void;
  onMarkAllRead: () => void;
  assignments: Assignment[];
  notes: Note[];
  reminders: Reminder[];
  onNavigate: (page: NavPage) => void;
  onOpenQuickAdd: () => void;
  user: any;
}

export default function TopNav({
  page,
  isDark,
  toggleDark,
  onMenuClick,
  unreadNotifCount,
  notifications,
  onMarkRead,
  onDelete,
  onMarkAllRead,
  assignments,
  notes,
  reminders,
  onNavigate,
  onOpenQuickAdd,
  user,
}: TopNavProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Format page title for display
  const pageTitles: Record<NavPage, string> = {
    dashboard: "Dashboard",
    assignments: "Assignments",
    reminders: "Reminders",
    notes: "Notes",
    calendar: "Calendar",
    timetable: "Class Timetable",
    attendance: "Attendance Tracker",
    analytics: "Analytics & Progress",
    ai: "MindVault AI Assistant",
    notifications: "Notifications",
    settings: "Settings",
    profile: "User Profile",
    subjects: "Subjects Management",
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setIsSearchOpen(true);
  };

  const handleSearchNavigate = (targetPage: NavPage) => {
    onNavigate(targetPage);
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  const userName = user?.name || "Student User";
  const userYear = user?.year || "Freshman";
  const userInitials = userName.charAt(0).toUpperCase();

  return (
    <header className="h-16 border-b border-border bg-card px-4 flex items-center justify-between flex-shrink-0 z-30 select-none relative">
      {/* Left section: Hamburger (mobile) + Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-xl md:hidden transition-colors"
          title="Open Menu"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-base sm:text-lg font-bold font-[Outfit] text-foreground tracking-tight">
          {pageTitles[page] || "Student OS"}
        </h1>
      </div>

      {/* Middle section: Global Search Bar */}
      <div className="flex-1 max-w-md mx-4 hidden md:block relative">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search assignments, notes, tasks..."
            className="w-full bg-muted/60 border border-border/80 rounded-xl pl-9.5 pr-4 py-2 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
            onFocus={() => setIsSearchOpen(true)}
          />
        </div>
        
        {/* Global Search Results Dropdown Overlay */}
        <GlobalSearch
          query={searchQuery}
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          assignments={assignments}
          notes={notes}
          reminders={reminders}
          onNavigate={handleSearchNavigate}
        />
      </div>

      {/* Right section: Quick actions + Toggles + Notification dropdown + Profile card */}
      <div className="flex items-center gap-2">
        {/* Quick Add shortcut button */}
        <button
          onClick={onOpenQuickAdd}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all active:scale-[0.97]"
          title="Quick Add Item"
        >
          <Plus size={14} />
          <span className="hidden sm:inline">Quick Add</span>
        </button>

        {/* AI button shortcut */}
        {page !== "ai" && (
          <button
            onClick={() => onNavigate("ai")}
            className="p-2 hover:bg-muted text-purple-600 dark:text-purple-400 rounded-xl transition-colors relative group"
            title="Ask AI Assistant"
          >
            <Sparkles size={18} className="animate-pulse" />
            <span className="absolute bottom-[-32px] left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 bg-popover text-popover-foreground text-[10px] font-semibold px-2 py-1 rounded border border-border shadow-md transition-all duration-100 z-50 whitespace-nowrap">
              AI Assistant
            </span>
          </button>
        )}

        {/* Dark Mode toggle */}
        <button
          onClick={toggleDark}
          className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-xl transition-all active:scale-90"
          title={isDark ? "Light Mode" : "Dark Mode"}
        >
          {isDark ? (
            <Sun size={18} className="text-amber-500 transition-transform hover:rotate-45 duration-300" />
          ) : (
            <Moon size={18} className="text-indigo-600 transition-transform hover:-rotate-12 duration-300" />
          )}
        </button>

        {/* Notifications Icon with panel overlay */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className={`p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-xl transition-all relative ${
              isNotifOpen ? "bg-muted text-foreground" : ""
            }`}
            title="Notifications"
          >
            <Bell size={18} />
            {unreadNotifCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-card" />
            )}
          </button>
          
          <NotificationPanel
            isOpen={isNotifOpen}
            onClose={() => setIsNotifOpen(false)}
            notifications={notifications}
            onMarkRead={onMarkRead}
            onDelete={onDelete}
            onMarkAllRead={onMarkAllRead}
          />
        </div>

        {/* Profile Card pill */}
        <div
          onClick={() => onNavigate("profile")}
          className="flex items-center gap-2 p-1 pl-2 hover:bg-muted rounded-xl transition-all cursor-pointer border border-transparent hover:border-border"
        >
          <div className="hidden sm:block text-right">
            <p className="text-xs font-bold text-foreground leading-none font-[Outfit]">{userName}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 leading-none">{userYear}</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold flex items-center justify-center text-sm shadow-sm select-none font-[Outfit]">
            {userInitials}
          </div>
        </div>
      </div>
    </header>
  );
}
