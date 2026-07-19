import { useState, useEffect, useRef } from "react";
// Local state and storage imports
import {
  LayoutDashboard, BookOpen, Bell, FileText, Calendar,
  Clock, BarChart2, TrendingUp, Bot, Settings, User, LogOut,
  ChevronLeft, ChevronRight, Search, Moon, Sun, Plus, X,
  Check, Star, Filter, Grid, List, MoreHorizontal, Trash2,
  Edit2, Send, Target, Zap, Award, GraduationCap, Bookmark,
  Tag, Folder, CheckCircle, Flame, Activity, MessageSquare,
  Sparkles, Brain, FileQuestion, AlarmClock, AlertTriangle,
  ChevronDown, Download, Shield, Mail, Camera, Pencil, Timer,
  Repeat, Eye, Lock, Globe, HelpCircle, ArrowUp, ArrowDown,
  Hash, Mic, Paperclip, BookMarked, ChevronUp, Menu,
  EyeOff, Bell as BellIcon, MapPin, Coffee, Lightbulb,
  CheckSquare, Circle, TrendingDown, BarChart, PieChart,
  Users, RefreshCw, ArrowRight, Layers, Cpu, Wand2, Copy, AlertCircle, Edit
} from "lucide-react";
import {
  AreaChart, Area,
  BarChart as ReBarChart, Bar,
  LineChart, Line,
  PieChart as RePieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";

import {
  INITIAL_ASSIGNMENTS,
  INITIAL_REMINDERS,
  INITIAL_NOTES,
  STUDY_HOURS,
  WEEKLY_PRODUCTIVITY,
  MONTHLY_STUDY,
  ATTENDANCE,
  RADAR_DATA,
  TODAY_SCHEDULE,
  TIMETABLE,
  INITIAL_NOTIFICATIONS,
  AI_INITIAL,
  AI_SUGGESTIONS,
  ATTENDANCE_TREND,
  PROFILE_ACHIEVEMENTS,
  getAIResponse,
  Assignment,
  Note,
  Reminder,
  AppNotification
} from "./data/mockData";

import QuickAddModal from "./components/QuickAddModal";
import NotificationPanel from "./components/NotificationPanel";
import GlobalSearch from "./components/GlobalSearch";
import EmptyState from "./components/EmptyState";
import ToastContainer, { ToastMessage } from "./components/Toast";
import DeleteConfirmDialog from "./components/DeleteConfirmDialog";
import AssignmentDetailsModal from "./components/AssignmentDetailsModal";
import AssignmentEditModal from "./components/AssignmentEditModal";
import SubjectModal, { Subject } from "./components/SubjectModal";
import { fetchSubjects, createSubject, updateSubject, deleteSubject } from "./services/apiService";
import TimetableModal, { TimetableClass } from "./components/TimetableModal";
import {
  DashboardPageSkeleton,
  NotesSkeleton,
  Skeleton
} from "./components/SkeletonLoader";

import Sidebar from "./components/Sidebar";
import TopNav from "./components/TopNav";
import AIPage from "./components/AIPage";
import NotificationsPage from "./components/NotificationsPage";
import SettingsPage from "./components/SettingsPage";
import ProfilePage from "./components/ProfilePage";
import LoginScreen from "./components/LoginScreen";
import RegisterScreen from "./components/RegisterScreen";
import SubjectsPage from "./components/SubjectsPage";
import LandingPage from "./components/LandingPage";

// ─── TYPES ────────────────────────────────────────────────────

type NavPage =
  | "dashboard" | "assignments" | "reminders" | "notes"
  | "calendar" | "timetable" | "attendance"
  | "ai" | "notifications" | "settings" | "profile" | "subjects";

// ─── INITIAL CENTRAL SUBJECTS & CLASSES ────────────────────────

const INITIAL_SUBJECTS: Subject[] = ATTENDANCE.map(a => ({
  code: a.subject,
  name: a.name,
  color: a.color,
  faculty: a.faculty,
  attended: a.attended,
  total: a.total,
  target: 75
}));

const INITIAL_TIMETABLE_CLASSES: TimetableClass[] = Object.keys(TIMETABLE).flatMap(day => {
  return TIMETABLE[day].map((cls, idx) => {
    const parts = cls.time.split("–");
    const startTime = parts[0] ? parts[0].trim() : "08:30";
    const endTime = parts[1] ? parts[1].trim() : "10:00";
    return {
      id: `${day}-${idx}-${cls.subject}`,
      day,
      startTime,
      endTime,
      subjectCode: cls.subject,
      room: cls.room
    };
  });
});

// ─── LOCAL STORAGE HELPER ─────────────────────────────────────

function useLocalStorageState<T>(key: string, initialValue: T): [T, (val: T | ((curr: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn("Error reading localStorage key", key, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      setState(item ? JSON.parse(item) : initialValue);
    } catch (error) {
      console.warn("Error reading localStorage key on change", key, error);
    }
  }, [key]);

  const setPersistedState = (value: T | ((curr: T) => T)) => {
    try {
      setState((prev) => {
        const nextValue = value instanceof Function ? value(prev) : value;
        window.localStorage.setItem(key, JSON.stringify(nextValue));
        return nextValue;
      });
    } catch (error) {
      console.warn("Error setting localStorage key", key, error);
    }
  };

  return [state, setPersistedState];
}

// ─── UTILITY COMPONENTS ───────────────────────────────────────

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function Badge({ label, color }: { label: string; color: string }) {
  const styles: Record<string, string> = {
    high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-500/10",
    medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-500/10",
    low: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-500/10",
    "in-progress": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 border-indigo-500/10",
    "not-started": "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-500/10",
    review: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-500/10",
    completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-500/10",
  };
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize border", styles[color] || styles.low)}>
      {label}
    </span>
  );
}

function CircularProgress({ pct, color, size = 80 }: { pct: number; color: string; size?: number }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth="6" className="text-muted" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.6s ease" }} />
    </svg>
  );
}

function ProgressBar({ value, color = "#4F46E5" }: { value: number; color?: string }) {
  return (
    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${value}%`, backgroundColor: color }} />
    </div>
  );
}

function StatCard({ icon, label, value, sub, delta, color }: {
  icon: React.ReactNode; label: string; value: string; sub?: string;
  delta?: { val: string; up: boolean }; color: string;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-3 hover:shadow-lg hover:shadow-black/5 hover:-translate-y-0.5 transition-all duration-300 shadow-sm">
      <div className="flex items-start justify-between">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center")} style={{ backgroundColor: color + "20" }}>
          <span style={{ color }}>{icon}</span>
        </div>
        {delta && (
          <span className={cn("flex items-center gap-0.5 text-xs font-medium", delta.up ? "text-emerald-500" : "text-red-500")}>
            {delta.up ? <ArrowUp size={12} /> : <ArrowDown size={12} />}{delta.val}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold font-[Outfit] text-foreground leading-none">{value}</p>
        <p className="text-sm text-muted-foreground mt-1.5">{label}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </div>
    </div>
  );
}

// ─── DATE HELPERS FOR COUNTDOWNS ──────────────────────────────

const getDueDays = (dueStr: string): number => {
  try {
    const currentYear = new Date().getFullYear();
    const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    const cleaned = dueStr.toLowerCase().replace(/[^a-z0-9\s]/g, "");
    const tokens = cleaned.split(/\s+/);
    let monthIdx = -1;
    let day = -1;
    let year = currentYear;

    for (const token of tokens) {
      const idx = months.findIndex((m) => token.startsWith(m));
      if (idx !== -1) {
        monthIdx = idx;
      } else {
        const val = parseInt(token, 10);
        if (!isNaN(val)) {
          if (val > 31) {
            year = val;
          } else {
            day = val;
          }
        }
      }
    }

    if (monthIdx !== -1 && day !== -1) {
      const dueDateObj = new Date(year, monthIdx, day);
      dueDateObj.setHours(23, 59, 59, 999);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const diffTime = dueDateObj.getTime() - today.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
  } catch (_) {}
  return 999;
};

const getCountdownBadge = (dueStr: string, progress: number) => {
  if (progress === 100) {
    return { text: "Completed", class: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-500/10" };
  }
  const days = getDueDays(dueStr);
  if (days < 0) {
    return { text: "Overdue", class: "bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 border-red-500/10 font-bold" };
  }
  if (days === 0) {
    return { text: "Due Today", class: "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 border-amber-500/10 animate-pulse font-bold" };
  }
  if (days === 1) {
    return { text: "Due Tomorrow", class: "bg-amber-50 text-amber-500 dark:bg-amber-950/15 dark:text-amber-400 border-amber-500/10 font-medium" };
  }
  return { text: `${days} days left`, class: "bg-muted/60 text-muted-foreground border-border/60 text-[10px]" };
};

// ─── DASHBOARD PAGE ───────────────────────────────────────────

function DashboardPage({
  isDark,
  assignments,
  reminders,
  onOpenQuickAdd,
  onNavigate,
  exportData,
  subjects,
  timetableClasses,
  user,
  isDefaultUser
}: {
  isDark: boolean;
  assignments: Assignment[];
  reminders: Reminder[];
  onOpenQuickAdd: (tab: "assignment" | "note" | "reminder") => void;
  onNavigate: (page: NavPage) => void;
  exportData: () => void;
  subjects: Subject[];
  timetableClasses: TimetableClass[];
  user: any;
  isDefaultUser?: boolean;
}) {
  const chartColor = isDark ? "#6366F1" : "#4F46E5";
  const chartColor2 = isDark ? "#34D399" : "#10B981";
  const gridColor = isDark ? "#1A1A35" : "#E8E8FF";
  const textColor = isDark ? "#8B8BAE" : "#6B6B8A";
  const tooltipBg = isDark ? "#10102A" : "#fff";
  const tooltipBorder = isDark ? "#6366F1" : "#E0E7FF";

  const [greeting, setGreeting] = useState("Good morning");
  const [formattedDate, setFormattedDate] = useState("");

  useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 12) setGreeting("Good morning");
    else if (hours < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    setFormattedDate(new Date().toLocaleDateString("en-US", options));
  }, []);

  // Compute dynamic stats
  const assignmentsDueCount = assignments.filter(a => a.status !== "completed").length;
  const completedRemindersCount = reminders.filter(r => r.done).length;
  const totalRemindersCount = reminders.length;
  const overallAttendance = subjects.length > 0
    ? Math.round(subjects.reduce((s, a) => s + (a.total > 0 ? a.attended / a.total * 100 : 100), 0) / subjects.length)
    : 0;

  const totalItemsCount = assignments.length + reminders.length;
  const completedItemsCount = assignments.filter(a => a.status === "completed").length + completedRemindersCount;
  const productivityScore = isDefaultUser ? 82 : (totalItemsCount > 0 ? Math.round((completedItemsCount / totalItemsCount) * 100) : 0);
  const streakCount = isDefaultUser ? 14 : (user ? 1 : 0);

  const totalStudyHours = isDefaultUser ? STUDY_HOURS.reduce((s, d) => s + d.hours, 0).toFixed(1) + "h" : "0.0h";

  // Dynamic Today's Schedule mapper
  const currentDayName = new Date().toLocaleString("en-US", { weekday: "long" });
  let todayClasses = timetableClasses
    .filter(c => c.day === currentDayName)
    .map(c => {
      const sub = subjects.find(s => s.code === c.subjectCode);
      return {
        time: c.startTime,
        end: c.endTime,
        subject: c.subjectCode,
        name: sub ? sub.name : c.subjectCode,
        room: c.room,
        type: "lecture",
      };
    })
    .sort((a, b) => a.time.localeCompare(b.time));

  // Fallback to static mock schedule ONLY if running in demo mode
  if (todayClasses.length === 0 && isDefaultUser) {
    todayClasses = TODAY_SCHEDULE;
  }

  const subjectColors = subjects.reduce<Record<string, string>>((acc, s) => {
    acc[s.code] = s.color;
    return acc;
  }, {});

  // Compute AI suggestion dynamically
  let aiSuggestionText = "";
  const lowAttendanceSubject = subjects.find(s => (s.total > 0 ? (s.attended / s.total * 100) : 100) < (s.target || 75));
  if (isDefaultUser) {
    aiSuggestionText = "Your Chemistry attendance is at 68% — below the 75% minimum. You have a free period on Thursday afternoon. Consider scheduling a catch-up session with Dr. Robert Kim.";
  } else if (lowAttendanceSubject) {
    const pct = Math.round((lowAttendanceSubject.attended / lowAttendanceSubject.total) * 100);
    aiSuggestionText = `Your ${lowAttendanceSubject.name} attendance is at ${pct}% — below your ${lowAttendanceSubject.target || 75}% target. Attend upcoming classes to boost your standing.`;
  } else if (assignmentsDueCount > 0) {
    aiSuggestionText = `You have ${assignmentsDueCount} upcoming assignment${assignmentsDueCount > 1 ? "s" : ""}. Click to generate a study plan or ask the AI Assistant for guidance!`;
  } else if (subjects.length > 0 || timetableClasses.length > 0) {
    aiSuggestionText = "Your schedule & subjects are up to date! Use the AI Assistant to revise notes or generate practice flashcards.";
  } else {
    aiSuggestionText = "Welcome to MindVault! Add your subjects, timetable, and assignments to get real-time personalized AI study recommendations.";
  }

  return (
    <div className="p-6 space-y-6 max-w-[1600px] animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 p-6 md:p-8 text-white shadow-lg">
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-indigo-200 text-sm font-medium mb-1">{formattedDate}</p>
              <h1 className="text-2xl md:text-3xl font-bold font-[Outfit]">{greeting}, {user?.name || "Student"}! 👋</h1>
              <p className="text-indigo-200 mt-1">
                {assignmentsDueCount > 0 || totalRemindersCount - completedRemindersCount > 0
                  ? `You have ${assignmentsDueCount} uncompleted assignments and ${totalRemindersCount - completedRemindersCount} pending reminders. Keep it up!`
                  : `Welcome to MindVault! Start by adding your timetable, subjects, or notes to track your progress.`}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center bg-white/10 rounded-xl px-5 py-3 backdrop-blur-sm">
                <p className="text-2xl font-bold font-[Outfit]">{streakCount}</p>
                <p className="text-xs text-indigo-200 mt-0.5">Day Streak 🔥</p>
              </div>
              <div className="text-center bg-white/10 rounded-xl px-5 py-3 backdrop-blur-sm">
                <p className="text-2xl font-bold font-[Outfit]">{productivityScore}</p>
                <p className="text-xs text-indigo-200 mt-0.5">Productivity</p>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute -right-4 -bottom-12 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute left-1/2 top-1/2 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<BookOpen size={18} />}
          label="Assignments Due"
          value={String(assignmentsDueCount)}
          sub={assignments.length > 0 ? "Action items left" : "No assignments yet"}
          delta={{ val: assignmentsDueCount > 0 ? "active" : "clean", up: true }}
          color="#4F46E5"
        />
        <StatCard
          icon={<CheckCircle size={18} />}
          label="Completed Reminders"
          value={String(completedRemindersCount)}
          sub={totalRemindersCount > 0 ? `out of ${totalRemindersCount} total` : "No pending reminders"}
          delta={{ val: "live", up: true }}
          color="#10B981"
        />
        <StatCard
          icon={<BarChart2 size={18} />}
          label="Avg Attendance"
          value={subjects.length > 0 ? `${overallAttendance}%` : "N/A"}
          sub={subjects.length > 0 ? "Across all subjects" : "No attendance records yet"}
          delta={{ val: subjects.length > 0 ? `${subjects.length} subjects` : "none", up: overallAttendance >= 75 }}
          color="#8B5CF6"
        />
        <StatCard
          icon={<Clock size={18} />}
          label="Study Hours"
          value={totalStudyHours}
          sub={isDefaultUser ? "This week" : "Start studying to track your progress"}
          delta={{ val: isDefaultUser ? "8h" : "0h", up: true }}
          color="#F59E0B"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Study Hours Chart */}
        <div className="xl:col-span-2 bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold font-[Outfit] text-foreground">Study Hours This Week</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Daily study time vs. 5h target</p>
            </div>
            <span className="text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-full font-medium">{totalStudyHours} total</span>
          </div>
          {isDefaultUser ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={STUDY_HOURS} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="studyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="day" tick={{ fill: textColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: textColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: "12px", fontSize: "12px" }} />
                <Area type="monotone" dataKey="hours" stroke={chartColor} strokeWidth={2.5} fill="url(#studyGrad)" dot={{ fill: chartColor, r: 4 }} name="Hours Studied" />
                <Area type="monotone" dataKey="target" stroke={chartColor2} strokeWidth={1.5} strokeDasharray="5 5" fill="none" dot={false} name="Target" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState
              title="Start studying to track your progress."
              description="Log your study time or notes to see weekly charts here."
              actionLabel="Add Notes"
              onAction={() => onOpenQuickAdd("note")}
            />
          )}
        </div>

        {/* Today's Schedule */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold font-[Outfit] text-foreground">Today's Schedule</h2>
            <span className="text-xs text-muted-foreground">{todayClasses.length} class{todayClasses.length !== 1 ? "es" : ""}</span>
          </div>
          {todayClasses.length > 0 ? (
            <div className="space-y-3">
              {todayClasses.map((cls, i) => (
                <div key={i} className="flex gap-3 items-start group">
                  <div className="text-right min-w-[44px]">
                    <p className="text-xs font-medium text-muted-foreground">{cls.time}</p>
                  </div>
                  <div className="w-0.5 bg-muted mt-1 self-stretch rounded-full" style={{ backgroundColor: (subjectColors[cls.subject] || "#94a3b8") + "60" }} />
                  <div className="flex-1 bg-muted/50 rounded-xl px-3 py-2.5 group-hover:bg-muted/80 hover:scale-[1.01] transition-all">
                    <p className="text-sm font-medium text-foreground">{cls.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                      <MapPin size={10} />{cls.room}
                      <span className="ml-1 px-1.5 py-0.5 rounded text-[10px]" style={{ backgroundColor: (subjectColors[cls.subject] || "#94a3b8") + "25", color: subjectColors[cls.subject] || "#94a3b8" }}>
                        {cls.type}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No classes scheduled today."
              description="You have no classes on your timetable for today."
              actionLabel="View Timetable"
              onAction={() => onNavigate("timetable")}
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Upcoming Assignments */}
        <div className="xl:col-span-2 bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold font-[Outfit] text-foreground">Upcoming Assignments</h2>
            <button onClick={() => onNavigate("assignments")} className="text-xs text-indigo-500 hover:text-indigo-600 font-medium flex items-center gap-1">View all <ArrowRight size={12} /></button>
          </div>
          {assignments.length > 0 ? (
            <div className="space-y-3">
              {assignments.slice(0, 4).map((a) => (
                <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                  <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: subjectColors[a.subject] || "#94a3b8" }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-foreground truncate">{a.title}</p>
                      <Badge label={a.priority} color={a.priority} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{a.subjectName} · Due {a.due}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-xs font-medium text-foreground">{a.progress}%</p>
                    <div className="w-16 mt-1">
                      <ProgressBar value={a.progress} color={subjectColors[a.subject]} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No assignments yet."
              description="You've cleared your calendar! Keep up the good work or create a new assignment."
              actionLabel="New Assignment"
              onAction={() => onOpenQuickAdd("assignment")}
            />
          )}
        </div>

        {/* Weekly Productivity */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold font-[Outfit] text-foreground">Productivity Trend</h2>
            {isDefaultUser && <span className="text-xs text-emerald-500 font-medium flex items-center gap-1"><ArrowUp size={11} />+7pts</span>}
          </div>
          {isDefaultUser ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <ReBarChart data={WEEKLY_PRODUCTIVITY} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="week" tick={{ fill: textColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: textColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: "10px", fontSize: "12px" }} />
                  <Bar dataKey="score" fill={chartColor} radius={[6, 6, 0, 0]} name="Score" />
                </ReBarChart>
              </ResponsiveContainer>
              <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <span>Current week: <strong className="text-foreground">82 pts</strong></span>
                <span>Avg: <strong className="text-foreground">78 pts</strong></span>
              </div>
            </>
          ) : (
            <EmptyState
              title="No productivity records yet."
              description="Complete assignments and stay on track to build your productivity trend."
            />
          )}
        </div>
      </div>

      {/* AI Suggestion + Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-5 text-white shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 animate-pulse">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="font-semibold font-[Outfit]">AI Suggestion</h3>
              <p className="text-purple-200 text-xs mt-0.5">Based on your schedule & performance</p>
            </div>
          </div>
          <p className="text-sm text-purple-100 leading-relaxed">
            {aiSuggestionText}
          </p>
          <button onClick={() => onNavigate("ai")} className="mt-4 flex items-center gap-2 bg-white/20 hover:bg-white/30 transition-all active:scale-[0.98] text-sm font-medium rounded-xl px-4 py-2">
            <Bot size={14} /> Open AI Assistant
          </button>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="font-semibold font-[Outfit] text-foreground mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: <Plus size={16} />, label: "New Assignment", color: "#4F46E5", action: () => onOpenQuickAdd("assignment") },
              { icon: <FileText size={16} />, label: "New Note", color: "#8B5CF6", action: () => onOpenQuickAdd("note") },
              { icon: <BellIcon size={16} />, label: "Set Reminder", color: "#10B981", action: () => onOpenQuickAdd("reminder") },
              { icon: <Bot size={16} />, label: "Ask AI", color: "#F59E0B", action: () => onNavigate("ai") },
              { icon: <Calendar size={16} />, label: "Add Event", color: "#EF4444", action: () => onNavigate("calendar") },
              { icon: <Download size={16} />, label: "Export Data", color: "#3B82F6", action: exportData },
            ].map((action) => (
              <button key={action.label} onClick={action.action} className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/50 hover:bg-muted hover:scale-[1.02] active:scale-[0.98] transition-all text-left">
                <span className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: action.color + "20", color: action.color }}>
                  {action.icon}
                </span>
                <span className="text-sm text-foreground font-medium">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ASSIGNMENTS PAGE ─────────────────────────────────────────

function AssignmentsPage({
  assignments,
  setAssignments,
  onOpenQuickAdd,
  triggerToast,
  subjects
}: {
  assignments: Assignment[];
  setAssignments: (a: Assignment[] | ((curr: Assignment[]) => Assignment[])) => void;
  onOpenQuickAdd: () => void;
  triggerToast: (msg: string, type?: "success" | "error" | "info") => void;
  subjects: Subject[];
}) {
  const [view, setView] = useState<"table" | "kanban">("table");
  const [filter, setFilter] = useState("all");

  // Advanced Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dueDateFilter, setDueDateFilter] = useState("all");
  const [sortBy, setSortBy] = useState("due-date");

  // Modals state
  const [detailsItem, setDetailsItem] = useState<Assignment | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [editItem, setEditItem] = useState<Assignment | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [deleteItem, setDeleteItem] = useState<Assignment | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const statusLabel: Record<string, string> = {
    "not-started": "Not Started",
    "in-progress": "In Progress",
    review: "In Review",
    completed: "Completed"
  };

  const isOverdue = (dueStr: string, progress: number) => {
    if (progress === 100) return false;
    return getDueDays(dueStr) < 0;
  };

  const subjectColors = subjects.reduce<Record<string, string>>((acc, s) => {
    acc[s.code] = s.color;
    return acc;
  }, {});

  // Compute stats dynamically
  const totalCount = assignments.length;
  const completedCount = assignments.filter(a => a.status === "completed").length;
  const pendingCount = assignments.filter(a => a.status === "not-started").length;
  const inProgressCount = assignments.filter(a => a.status === "in-progress" || a.status === "review").length;
  const overdueCount = assignments.filter(a => isOverdue(a.due, a.progress)).length;

  // Filter and Sort implementation
  let filtered = assignments.filter((a) => {
    if (filter !== "all") {
      if (filter === "high" || filter === "medium" || filter === "low") {
        if (a.priority !== filter) return false;
      } else {
        if (a.status !== filter) return false;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = a.title.toLowerCase().includes(q);
      const matchSubject = a.subject.toLowerCase().includes(q);
      const matchSubjectName = a.subjectName.toLowerCase().includes(q);
      if (!matchTitle && !matchSubject && !matchSubjectName) return false;
    }

    if (subjectFilter !== "all" && a.subject !== subjectFilter) return false;
    if (priorityFilter !== "all" && a.priority !== priorityFilter) return false;
    if (statusFilter !== "all" && a.status !== statusFilter) return false;

    if (dueDateFilter !== "all") {
      const days = getDueDays(a.due);
      if (dueDateFilter === "overdue" && (days >= 0 || a.status === "completed")) return false;
      if (dueDateFilter === "today" && days !== 0) return false;
      if (dueDateFilter === "week" && (days < 0 || days > 7)) return false;
    }

    return true;
  });

  // Sorting
  filtered = [...filtered].sort((a, b) => {
    if (sortBy === "title") {
      return a.title.localeCompare(b.title);
    }
    if (sortBy === "recently-added") {
      return b.id - a.id;
    }
    if (sortBy === "priority") {
      const priorityMap: Record<string, number> = { high: 3, medium: 2, low: 1 };
      return (priorityMap[b.priority] || 0) - (priorityMap[a.priority] || 0);
    }
    if (sortBy === "due-date") {
      return getDueDays(a.due) - getDueDays(b.due);
    }
    return 0;
  });

  // Actions callbacks
  const handleOpenDetails = (a: Assignment) => {
    setDetailsItem(a);
    setIsDetailsOpen(true);
  };

  const handleOpenEdit = (a: Assignment) => {
    setEditItem(a);
    setIsEditOpen(true);
  };

  const handleOpenDelete = (a: Assignment) => {
    setDeleteItem(a);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deleteItem) {
      setAssignments((prev) => prev.filter((item) => item.id !== deleteItem.id));
      triggerToast(`Assignment "${deleteItem.title}" deleted successfully.`, "success");
      setIsDeleteOpen(false);
      setDeleteItem(null);
      if (detailsItem && detailsItem.id === deleteItem.id) {
        setIsDetailsOpen(false);
      }
    }
  };

  const handleSaveEdit = (updated: Assignment) => {
    setAssignments((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    triggerToast(`Assignment "${updated.title}" updated successfully.`, "success");
    setIsEditOpen(false);
    if (detailsItem && detailsItem.id === updated.id) {
      setDetailsItem(updated);
    }
  };

  return (
    <div className="p-6 space-y-5 max-w-[1400px] animate-fade-in">
      {/* Page Title */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold font-[Outfit] text-foreground">Assignments</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track and manage all your coursework</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-muted rounded-xl p-1 gap-1">
            <button onClick={() => setView("table")} className={cn("p-2 rounded-lg transition-colors", view === "table" ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground")}>
              <List size={16} />
            </button>
            <button onClick={() => setView("kanban")} className={cn("p-2 rounded-lg transition-colors", view === "kanban" ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground")}>
              <Layers size={16} />
            </button>
          </div>
          <button onClick={onOpenQuickAdd} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl px-4 py-2.5 transition-colors shadow-sm active:scale-95">
            <Plus size={15} /> New Assignment
          </button>
        </div>
      </div>

      {/* Dynamic Statistics cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard icon={<BookOpen size={16} />} label="Total Assignments" value={String(totalCount)} color="#4F46E5" />
        <StatCard icon={<CheckCircle size={16} />} label="Completed" value={String(completedCount)} color="#10B981" />
        <StatCard icon={<Clock size={16} />} label="In Progress" value={String(inProgressCount)} color="#8B5CF6" />
        <StatCard icon={<Circle size={16} />} label="Not Started" value={String(pendingCount)} color="#F59E0B" />
        <StatCard icon={<AlertTriangle size={16} />} label="Overdue" value={String(overdueCount)} color="#EF4444" />
      </div>

      {/* Filters (horizontal tabs) */}
      <div className="flex items-center gap-2 flex-wrap">
        {["all", "high", "medium", "low", "in-progress", "completed"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn("text-xs font-semibold px-3 py-1.5 rounded-full capitalize transition-colors border shadow-sm",
              filter === f ? "bg-indigo-600 text-white border-indigo-600" : "bg-card text-muted-foreground border-border hover:border-indigo-300")}>
            {f === "all" ? "All Assignments" : f.replace("-", " ")}
          </button>
        ))}
      </div>

      {/* Advanced search, dropdown filters, sorting */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 bg-card border border-border rounded-2xl p-4 shadow-sm">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search title or course..."
            className="w-full bg-muted/50 border border-border rounded-xl pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
        </div>

        {/* Subject Filter */}
        <select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className="bg-muted/50 border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
        >
          <option value="all">All Subjects</option>
          {subjects.map(s => <option key={s.code} value={s.code}>{s.code}</option>)}
        </select>

        {/* Due Date Filter */}
        <select
          value={dueDateFilter}
          onChange={(e) => setDueDateFilter(e.target.value)}
          className="bg-muted/50 border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
        >
          <option value="all">All Deadlines</option>
          <option value="overdue">Overdue</option>
          <option value="today">Due Today</option>
          <option value="week">Due This Week</option>
        </select>

        {/* Sort selector */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-muted/50 border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
        >
          <option value="due-date">Sort by Due Date</option>
          <option value="priority">Sort by Priority</option>
          <option value="title">Sort by Title</option>
          <option value="recently-added">Sort by Recent</option>
        </select>
      </div>

      {/* Grid or Kanban Render */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No Assignments Found"
          description="We couldn't find any assignments matching your search criteria. Clear your filters or create a new assignment."
          actionLabel="New Assignment"
          onAction={onOpenQuickAdd}
        />
      ) : view === "table" ? (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30 select-none">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Assignment</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Subject</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Due Date</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Deadline Status</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Priority</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Progress</th>
                  <th className="px-4 py-3.5" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((a, i) => {
                  const countdown = getCountdownBadge(a.due, a.progress);
                  return (
                    <tr
                      key={a.id}
                      className={cn(
                        "border-b border-border/50 hover:bg-muted/20 transition-all duration-200 cursor-pointer",
                        i === filtered.length - 1 && "border-0"
                      )}
                      onClick={() => handleOpenDetails(a)}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: subjectColors[a.subject] || "#94a3b8" }} />
                          <span className="font-semibold text-foreground hover:text-indigo-500 transition-colors">{a.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <span className="text-xs px-2 py-1 rounded-lg font-medium" style={{ backgroundColor: (subjectColors[a.subject] || "#94a3b8") + "20", color: subjectColors[a.subject] || "#94a3b8" }}>
                          {a.subject}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-muted-foreground hidden lg:table-cell">{a.due}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full border text-[10px] font-semibold ${countdown.class}`}>
                          {countdown.text}
                        </span>
                      </td>
                      <td className="px-4 py-4"><Badge label={a.priority} color={a.priority} /></td>
                      <td className="px-4 py-4"><Badge label={statusLabel[a.status] || a.status} color={a.status} /></td>
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <div className="flex items-center gap-2 w-32">
                          <ProgressBar value={a.progress} color={subjectColors[a.subject] || "#4F46E5"} />
                          <span className="text-xs text-muted-foreground w-8 text-right font-medium">{a.progress}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(a)}
                            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            title="Edit Assignment"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(a)}
                            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-red-500 transition-colors"
                            title="Delete Assignment"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {["not-started", "in-progress", "review", "completed"].map(status => (
            <div key={status} className="bg-card border border-border rounded-2xl p-4 shadow-sm flex flex-col min-h-[350px]">
              <div className="flex items-center justify-between mb-3 border-b border-border/50 pb-2 select-none">
                <h3 className="text-sm font-bold text-foreground">{statusLabel[status]}</h3>
                <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-semibold">
                  {filtered.filter(a => a.status === status).length}
                </span>
              </div>
              <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
                {filtered.filter(a => a.status === status).map(a => {
                  const countdown = getCountdownBadge(a.due, a.progress);
                  return (
                    <div
                      key={a.id}
                      onClick={() => handleOpenDetails(a)}
                      className="p-3.5 bg-muted/30 dark:bg-muted/10 rounded-xl border border-border/40 hover:border-indigo-400 dark:hover:border-indigo-800 hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer group relative"
                    >
                      {/* Floating hover edit/delete tools */}
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => handleOpenEdit(a)}
                          className="p-1 bg-card border border-border rounded-lg text-muted-foreground hover:text-foreground"
                          title="Edit"
                        >
                          <Edit2 size={11} />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(a)}
                          className="p-1 bg-card border border-border rounded-lg text-muted-foreground hover:text-red-500"
                          title="Delete"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>

                      <p className="text-sm font-bold text-foreground leading-snug pr-8 hover:text-indigo-500 transition-colors">{a.title}</p>

                      <div className="flex items-center gap-1.5 flex-wrap mt-2">
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold" style={{ backgroundColor: (subjectColors[a.subject] || "#94a3b8") + "25", color: subjectColors[a.subject] || "#94a3b8" }}>
                          {a.subject}
                        </span>
                        <Badge label={a.priority} color={a.priority} />
                        <span className={`inline-flex px-2 py-0.5 rounded-full border text-[9px] font-semibold ${countdown.class}`}>
                          {countdown.text}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-muted-foreground mt-3 pt-2.5 border-t border-border/20">
                        <span className="flex items-center gap-1"><Calendar size={10} />Due {a.due}</span>
                        <span className="font-semibold text-foreground">{a.progress}%</span>
                      </div>
                      {a.progress > 0 && (
                        <div className="mt-2">
                          <ProgressBar value={a.progress} color={subjectColors[a.subject] || "#4F46E5"} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assignment Detail Modal */}
      <AssignmentDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        assignment={detailsItem}
        onEdit={() => {
          setIsDetailsOpen(false);
          if (detailsItem) handleOpenEdit(detailsItem);
        }}
        onDelete={() => {
          if (detailsItem) handleOpenDelete(detailsItem);
        }}
      />

      {/* Edit Modal */}
      <AssignmentEditModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        assignment={editItem}
        subjects={subjects}
        onSave={handleSaveEdit}
      />

      {/* Delete Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        assignmentTitle={deleteItem ? deleteItem.title : ""}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

// ─── REMINDERS PAGE ───────────────────────────────────────────

function RemindersPage({
  reminders,
  setReminders,
  onOpenQuickAdd
}: {
  reminders: Reminder[];
  setReminders: (r: Reminder[] | ((curr: Reminder[]) => Reminder[])) => void;
  onOpenQuickAdd: () => void;
}) {
  const [filter, setFilter] = useState("all");

  const toggle = (id: number) => setReminders(p => p.map(r => r.id === id ? { ...r, done: !r.done } : r));
  const del = (id: number) => setReminders(p => p.filter(r => r.id !== id));

  const catColors: Record<string, string> = {
    academic: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 border-indigo-500/10",
    assignment: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-500/10",
    study: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-500/10",
    personal: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-500/10",
    admin: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-500/10",
  };

  const displayed = filter === "all" ? reminders : filter === "done" ? reminders.filter(r => r.done) : reminders.filter(r => !r.done);

  return (
    <div className="p-6 space-y-5 max-w-[900px] animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold font-[Outfit] text-foreground">Reminders</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{reminders.filter(r => !r.done).length} pending reminders</p>
        </div>
        <button onClick={onOpenQuickAdd} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl px-4 py-2.5 transition-colors">
          <Plus size={15} /> New Reminder
        </button>
      </div>

      <div className="flex gap-2">
        {["all", "pending", "done"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn("text-xs font-semibold px-3 py-1.5 rounded-full capitalize transition-colors border",
              filter === f ? "bg-indigo-600 text-white border-indigo-600" : "bg-card text-muted-foreground border-border hover:border-indigo-300")}>
            {f}
          </button>
        ))}
      </div>

      {displayed.length === 0 ? (
        <EmptyState
          title="No Reminders Found"
          description="No reminders are listed here. Add a new reminder for tracking study sessions, chores, or classes."
          actionLabel="New Reminder"
          onAction={onOpenQuickAdd}
        />
      ) : (
        <div className="space-y-3">
          {displayed.map(r => (
            <div key={r.id} className={cn("bg-card border rounded-2xl p-4 flex items-start gap-4 hover:shadow-sm transition-all group", r.done ? "border-border opacity-60" : "border-border")}>
              <button onClick={() => toggle(r.id)} className={cn("mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors",
                r.done ? "bg-emerald-500 border-emerald-500 text-white" : "border-border hover:border-indigo-400")}>
                {r.done && <Check size={11} />}
              </button>
              <div className="flex-1 min-w-0 pr-8">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <p className={cn("font-semibold text-foreground", r.done && "line-through")}>{r.title}</p>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {r.recurring && <span className="text-[10px] flex items-center gap-1 text-muted-foreground"><Repeat size={10} />Recurring</span>}
                    <Badge label={r.priority} color={r.priority} />
                  </div>
                </div>
                {r.desc && <p className="text-sm text-muted-foreground mt-1">{r.desc}</p>}
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock size={11} />{r.time}</span>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium capitalize border", catColors[r.category] || catColors.personal)}>{r.category}</span>
                </div>
              </div>
              <button
                onClick={() => del(r.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-red-500 transition-colors flex-shrink-0 ml-auto"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── NOTES PAGE ───────────────────────────────────────────────

function NotesPage({
  notes,
  setNotes,
  onOpenQuickAdd,
  loading,
  subjects
}: {
  notes: Note[];
  setNotes: (n: Note[] | ((curr: Note[]) => Note[])) => void;
  onOpenQuickAdd: () => void;
  loading: boolean;
  subjects: Subject[];
}) {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [active, setActive] = useState<Note | null>(null);

  // States for note editing inside the modal (autosave)
  const [editTitle, setEditTitle] = useState("");
  const [editSubject, setEditSubject] = useState("");
  const [editTagsStr, setEditTagsStr] = useState("");
  const [editPinned, setEditPinned] = useState(false);
  const [editFav, setEditFav] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [lastEdited, setLastEdited] = useState("");

  const editorRef = useRef<HTMLDivElement>(null);

  // Load active note values into editing states
  useEffect(() => {
    if (active) {
      setEditTitle(active.title);
      setEditSubject(active.subject);
      setEditTagsStr(active.tags ? active.tags.join(", ") : "");
      setEditPinned(active.pinned || false);
      setEditFav(active.fav || false);
      setEditContent(active.content || "");
      setLastEdited(active.date || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

      if (editorRef.current) {
        editorRef.current.innerHTML = active.content || "";
      }
    }
  }, [active?.id]);

  // Debounced Autosave effect
  useEffect(() => {
    if (!active) return;

    const delayDebounce = setTimeout(() => {
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastEdited(timestamp);

      setNotes((prev) =>
        prev.map((n) => {
          if (n.id === active.id) {
            const parsedTags = editTagsStr
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean);
            return {
              ...n,
              title: editTitle,
              content: editContent,
              subject: editSubject,
              tags: parsedTags,
              pinned: editPinned,
              fav: editFav,
              date: timestamp,
            };
          }
          return n;
        })
      );
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [editTitle, editContent, editSubject, editTagsStr, editPinned, editFav, active]);

  const filtered = notes.filter((n) => {
    const q = search.toLowerCase();
    const matchesSearch =
      n.title.toLowerCase().includes(q) ||
      (n.content && n.content.toLowerCase().includes(q)) ||
      n.subject.toLowerCase().includes(q) ||
      (n.tags && n.tags.some((t) => t.toLowerCase().includes(q)));

    const matchesSubject = selectedSubject === "all" || n.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const togglePin = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)));
    if (active && active.id === id) {
      setEditPinned((p) => !p);
    }
  };

  const toggleFav = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, fav: !n.fav } : n)));
    if (active && active.id === id) {
      setEditFav((f) => !f);
    }
  };

  const deleteNote = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (active && active.id === id) {
      setActive(null);
    }
  };

  const format = (command: string, value: string = "") => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setEditContent(editorRef.current.innerHTML);
    }
  };

  const handleEditorInput = () => {
    if (editorRef.current) {
      setEditContent(editorRef.current.innerHTML);
    }
  };

  const cleanText = editContent.replace(/<[^>]*>/g, "").trim();
  const wordCount = cleanText ? cleanText.split(/\s+/).filter(Boolean).length : 0;

  const subjectColors = subjects.reduce<Record<string, string>>((acc, s) => {
    acc[s.code] = s.color;
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-[1400px] animate-fade-in font-[DM_Sans] flex flex-col md:flex-row gap-6 h-[calc(100vh-5rem)]">
      {/* Subject-Wise Folders Sidebar Panel */}
      <div className="w-full md:w-64 bg-card border border-border rounded-2xl p-4 flex flex-col h-fit select-none">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2 mb-3">Notebook Folders</h2>
        <div className="space-y-1 overflow-y-auto max-h-[250px] md:max-h-[500px] pr-1">
          <button
            onClick={() => setSelectedSubject("all")}
            className={cn(
              "w-full text-left flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors",
              selectedSubject === "all" ? "bg-indigo-600 text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <span>📁 All Notebooks</span>
            <span className={cn("text-[10px] px-1.5 py-0.5 rounded-lg", selectedSubject === "all" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground")}>
              {notes.length}
            </span>
          </button>
          {subjects.map((sub) => {
            const count = notes.filter((n) => n.subject === sub.code).length;
            return (
              <button
                key={sub.code}
                onClick={() => setSelectedSubject(sub.code)}
                className={cn(
                  "w-full text-left flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors",
                  selectedSubject === sub.code ? "bg-indigo-600 text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <span className="flex items-center gap-2 truncate">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: sub.color }} />
                  {sub.code} Binder
                </span>
                <span className={cn("text-[10px] px-1.5 py-0.5 rounded-lg", selectedSubject === sub.code ? "bg-white/20 text-white" : "bg-muted text-muted-foreground")}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        <button
          onClick={onOpenQuickAdd}
          className="mt-4 w-full flex items-center justify-center gap-2 border border-dashed border-border hover:border-indigo-400 hover:text-indigo-400 text-muted-foreground rounded-xl py-2 text-xs font-semibold transition-all"
        >
          <Plus size={13} /> Add Binder Note
        </button>
      </div>

      {/* Main Notebook Panel */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold font-[Outfit] text-foreground">
              {selectedSubject === "all" ? "All Knowledge Folders" : `${selectedSubject} Notebook`}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {filtered.length} notes sorted by subjects
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-muted rounded-xl p-1">
              <button onClick={() => setView("grid")} className={cn("p-2 rounded-lg transition-colors", view === "grid" ? "bg-card shadow text-foreground" : "text-muted-foreground")}>
                <Grid size={15} />
              </button>
              <button onClick={() => setView("list")} className={cn("p-2 rounded-lg transition-colors", view === "list" ? "bg-card shadow text-foreground" : "text-muted-foreground")}>
                <List size={15} />
              </button>
            </div>
            <button onClick={onOpenQuickAdd} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl px-4 py-2.5 transition-colors">
              <Plus size={14} /> New Note
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes in this notebook..."
            className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
        </div>

        {loading ? (
          <NotesSkeleton />
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-2xl bg-card">
            <FileText className="mx-auto w-10 h-10 text-muted-foreground opacity-50 mb-3" />
            <h3 className="font-bold text-foreground">No notes yet. Create your first note.</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
              Knowledge registers are empty in this notebook folder. Write down your lecture notes or homework reminders!
            </p>
          </div>
        ) : (
          <div className={cn("overflow-y-auto flex-1 pr-1 pb-6", view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3")}>
            {filtered.map((n) => (
              <div
                key={n.id}
                onClick={() => setActive(n)}
                className={cn(
                  "bg-card border border-border rounded-2xl p-4 cursor-pointer hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all relative group flex flex-col justify-between min-h-[140px]",
                  view === "list" && "flex-row items-center min-h-[70px] py-3.5"
                )}
              >
                <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  <button onClick={(e) => togglePin(n.id, e)} className={cn("p-1 hover:bg-muted rounded text-muted-foreground", n.pinned && "text-amber-500")}>
                    <Bookmark size={12} fill={n.pinned ? "currentColor" : "none"} />
                  </button>
                  <button onClick={(e) => deleteNote(n.id, e)} className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-red-500">
                    <Trash2 size={12} />
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap pr-10">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ backgroundColor: (subjectColors[n.subject] || "#94a3b8") + "15", color: subjectColors[n.subject] || "#94a3b8" }}>
                      {n.subject}
                    </span>
                    {n.pinned && <Bookmark size={10} className="text-amber-500 fill-amber-500" />}
                    {n.fav && <Star size={10} className="text-amber-400 fill-amber-400" />}
                  </div>

                  <div>
                    <h3 className="font-bold text-foreground font-[Outfit] text-sm leading-snug line-clamp-1">
                      {n.title}
                    </h3>
                    <p
                      className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2 font-[DM_Sans]"
                      dangerouslySetInnerHTML={{ __html: n.content || "<i>No content yet</i>" }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border/20 pt-2.5 mt-3 text-[10px] text-muted-foreground">
                  <span>{n.date || "Just now"}</span>
                  {n.tags && n.tags.length > 0 && (
                    <span className="truncate max-w-[120px] font-semibold text-indigo-500">
                      #{n.tags[0]}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Real Student Digital Notebook Modal (Editable + Autosave) */}
      {active && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setActive(null)}>
          <div className="bg-card border border-border rounded-2xl w-full max-w-3xl p-6 shadow-2xl animate-scale-up max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border/40 mb-4 flex-shrink-0">
              <div className="flex items-center gap-2 select-none">
                <span className="text-xs font-semibold text-muted-foreground">Digital Notebook</span>
                <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-bold">Autosaving</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setEditPinned((p) => !p)}
                  className={cn("p-2 hover:bg-muted rounded-xl transition-colors", editPinned ? "text-amber-500" : "text-muted-foreground")}
                  title={editPinned ? "Unpin Note" : "Pin Note"}
                >
                  <Bookmark size={15} fill={editPinned ? "currentColor" : "none"} />
                </button>
                <button
                  onClick={() => setEditFav((f) => !f)}
                  className={cn("p-2 hover:bg-muted rounded-xl transition-colors", editFav ? "text-amber-400" : "text-muted-foreground")}
                  title={editFav ? "Remove from Favorites" : "Add to Favorites"}
                >
                  <Star size={15} fill={editFav ? "currentColor" : "none"} />
                </button>
                <button onClick={() => setActive(null)} className="p-2 hover:bg-muted rounded-xl text-muted-foreground">
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Editor Workspace Scroll Area */}
            <div className="space-y-4 overflow-y-auto flex-1 pr-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Notebook Subject</label>
                  <select
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40 cursor-pointer"
                  >
                    {subjects.map((s) => <option key={s.code} value={s.code}>{s.code} - {s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={editTagsStr}
                    onChange={(e) => setEditTagsStr(e.target.value)}
                    placeholder="trees, binary search, algorithms"
                    className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Note Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Untitled Note"
                  className="w-full bg-muted/40 border border-border focus:border-indigo-500/50 rounded-xl px-4 py-2.5 text-sm font-bold text-foreground focus:outline-none"
                />
              </div>

              {/* Distraction-Free Rich Text Editor Toolbar */}
              <div className="flex items-center gap-1.5 p-2 bg-muted/30 border border-border rounded-xl flex-wrap select-none">
                <button type="button" onClick={() => format("bold")} className="w-8 h-8 flex items-center justify-center font-bold text-xs bg-muted/40 hover:bg-muted rounded-lg font-serif" title="Bold">B</button>
                <button type="button" onClick={() => format("italic")} className="w-8 h-8 flex items-center justify-center italic text-xs bg-muted/40 hover:bg-muted rounded-lg font-serif" title="Italic">I</button>
                <button type="button" onClick={() => format("underline")} className="w-8 h-8 flex items-center justify-center underline text-xs bg-muted/40 hover:bg-muted rounded-lg font-serif" title="Underline">U</button>
                <div className="w-[1px] h-6 bg-border mx-1" />
                <button type="button" onClick={() => format("backColor", "#FDE047")} className="px-2.5 h-8 flex items-center justify-center text-[10px] font-bold bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/20 rounded-lg" title="Highlight Yellow">Highlight</button>
                <button type="button" onClick={() => format("backColor", "transparent")} className="px-2 h-8 flex items-center justify-center text-[10px] border border-border text-muted-foreground hover:bg-muted rounded-lg" title="Clear Highlight">Clear</button>
                <div className="w-[1px] h-6 bg-border mx-1" />
                <button type="button" onClick={() => format("formatBlock", "<h1>")} className="w-8 h-8 flex items-center justify-center font-bold text-[10px] bg-muted/40 hover:bg-muted rounded-lg" title="Heading 1">H1</button>
                <button type="button" onClick={() => format("formatBlock", "<h2>")} className="w-8 h-8 flex items-center justify-center font-bold text-[10px] bg-muted/40 hover:bg-muted rounded-lg" title="Heading 2">H2</button>
                <button type="button" onClick={() => format("formatBlock", "<pre>")} className="px-2.5 h-8 flex items-center justify-center text-[10px] bg-muted/40 hover:bg-muted rounded-lg font-mono" title="Insert Code Block">Code</button>
                <button type="button" onClick={() => format("insertUnorderedList")} className="px-2.5 h-8 flex items-center justify-center text-[10px] bg-muted/40 hover:bg-muted rounded-lg" title="Insert Bullet List">• List</button>
              </div>

              {/* Rich-Text Note-taking body */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Lecture Notes / Annotation Panel</label>
                <div
                  ref={editorRef}
                  contentEditable
                  onInput={handleEditorInput}
                  placeholder="Start writing your notebook paragraphs here. Use headers, lists, code snippets, or highlights..."
                  className="w-full min-h-[250px] max-h-[400px] bg-muted/10 border border-border focus:border-indigo-500/50 rounded-xl px-4 py-3.5 text-xs text-foreground focus:outline-none leading-relaxed overflow-y-auto font-[DM_Sans] prose prose-sm dark:prose-invert"
                  style={{ whiteSpace: "pre-wrap" }}
                />
              </div>
            </div>

            {/* Editor footer */}
            <div className="flex items-center justify-between mt-5 pt-3 border-t border-border/40 flex-shrink-0 text-[10px] text-muted-foreground select-none">
              <div className="flex gap-4">
                <span>Words: <b>{wordCount}</b></span>
                <span>Edited: <b>{lastEdited}</b></span>
              </div>
              <button
                onClick={() => {
                  setNotes((prev) => prev.filter((item) => item.id !== active.id));
                  setActive(null);
                }}
                className="flex items-center gap-1.5 hover:text-red-500 transition-colors font-semibold"
              >
                <Trash2 size={12} /> Delete Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CALENDAR PAGE ────────────────────────────────────────────

function CalendarPage({
  assignments,
  reminders,
  subjects
}: {
  assignments: Assignment[];
  reminders: Reminder[];
  subjects: Subject[];
}) {
  const todayDate = new Date();
  const [month, setMonth] = useState(todayDate.getMonth());
  const [year, setYear] = useState(todayDate.getFullYear());
  const [view, setView] = useState<"month" | "week">("month");

  const monthName = new Date(year, month).toLocaleString("default", { month: "long", year: "numeric" });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  // Dynamic colors
  const subjectColors = subjects.reduce<Record<string, string>>((acc, s) => {
    acc[s.code] = s.color;
    return acc;
  }, {});

  // Populate calendar events dynamically
  const calendarEvents: Record<number, { label: string; color: string; type: string }[]> = {};

  // Standard recurring class schedules mapper from timetable classes
  const currentMonthName = new Date(year, month).toLocaleString("default", { month: "short" }).toLowerCase();

  // Add assignments to calendar dynamically based on month matching
  assignments.forEach((a) => {
    try {
      const match = a.due.match(/([a-z]{3})\.?\s*(\d+)/i);
      if (match) {
        const aMonthName = match[1].toLowerCase();
        const day = parseInt(match[2], 10);
        if (aMonthName.startsWith(currentMonthName)) {
          if (!calendarEvents[day]) calendarEvents[day] = [];
          calendarEvents[day].push({
            label: `${a.title.substring(0, 15)}${a.title.length > 15 ? "..." : ""}`,
            color: subjectColors[a.subject] || "#EF4444",
            type: "assignment"
          });
        }
      }
    } catch (_) {}
  });

  // Add reminders to calendar dynamically
  reminders.forEach((r) => {
    try {
      const match = r.time.match(/([a-z]{3})\.?\s*(\d+)/i);
      if (match) {
        const rMonthName = match[1].toLowerCase();
        const day = parseInt(match[2], 10);
        if (rMonthName.startsWith(currentMonthName)) {
          if (!calendarEvents[day]) calendarEvents[day] = [];
          calendarEvents[day].push({
            label: `${r.title.substring(0, 15)}${r.title.length > 15 ? "..." : ""}`,
            color: "#8B5CF6",
            type: "reminder"
          });
        }
      } else if (r.time.toLowerCase().includes("today")) {
        const today = new Date();
        if (month === today.getMonth() && year === today.getFullYear()) {
          const day = today.getDate();
          if (!calendarEvents[day]) calendarEvents[day] = [];
          calendarEvents[day].push({
            label: `${r.title.substring(0, 15)}${r.title.length > 15 ? "..." : ""}`,
            color: "#8B5CF6",
            type: "reminder"
          });
        }
      }
    } catch (_) {}
  });

  const handlePrevMonth = () => {
    setMonth((m) => {
      if (m === 0) {
        setYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  };

  const handleNextMonth = () => {
    setMonth((m) => {
      if (m === 11) {
        setYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  };

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) => i < firstDay ? null : i - firstDay + 1);

  return (
    <div className="p-6 space-y-5 max-w-[1100px] animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold font-[Outfit] text-foreground">Calendar</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Assignments, exams, and events in one view</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-muted rounded-xl p-1">
            {(["month", "week"] as const).map(v => (
              <button key={v} onClick={() => setView(v)} className={cn("text-xs px-3 py-1.5 rounded-lg capitalize font-medium transition-colors",
                view === v ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground")}>{v}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {/* Month nav */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-foreground">
            <ChevronLeft size={16} />
          </button>
          <h2 className="font-semibold font-[Outfit] text-foreground">{monthName}</h2>
          <button onClick={handleNextMonth} className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-foreground">
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-border">
          {days.map(d => (
            <div key={d} className="py-3 text-center text-xs font-semibold text-muted-foreground">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            const isToday = day === todayDate.getDate() && month === todayDate.getMonth() && year === todayDate.getFullYear();
            const dayEvents = day ? calendarEvents[day] : [];
            return (
              <div key={i} className={cn("min-h-[90px] p-2 border-b border-r border-border/50 last:border-r-0 hover:bg-muted/30 transition-colors",
                !day && "bg-muted/20", isToday && "bg-indigo-50 dark:bg-indigo-950/30")}>
                {day && (
                  <>
                    <span className={cn("inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium",
                       isToday ? "bg-indigo-600 text-white animate-pulse" : "text-foreground")}>
                      {day}
                    </span>
                    <div className="mt-1 space-y-0.5">
                      {(dayEvents || []).slice(0, 2).map((e, ei) => (
                        <div key={ei} className="text-[10px] font-medium px-1.5 py-0.5 rounded truncate" style={{ backgroundColor: e.color + "25", color: e.color }}>
                          {e.label}
                        </div>
                      ))}
                      {(dayEvents || []).length > 2 && <span className="text-[9px] text-muted-foreground block pl-1">+{dayEvents.length - 2} more</span>}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap">
        {[
          { label: "Assignment", color: "#EF4444" },
          { label: "Class", color: "#4F46E5" },
          { label: "Reminder", color: "#8B5CF6" },
          { label: "Event", color: "#10B981" },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5 text-xs text-muted-foreground animate-fade-in">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: l.color }} />
            {l.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── TIMETABLE PAGE ───────────────────────────────────────────

function TimetablePage({
  subjects,
  timetableClasses,
  onOpenTimetableModal,
  onOpenSubjectModal
}: {
  subjects: Subject[];
  timetableClasses: TimetableClass[];
  onOpenTimetableModal: (slot: TimetableClass | null) => void;
  onOpenSubjectModal: () => void;
}) {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const [search, setSearch] = useState("");
  const [dayFilter, setDayFilter] = useState("all");

  const subjectColors = subjects.reduce<Record<string, string>>((acc, s) => {
    acc[s.code] = s.color;
    return acc;
  }, {});

  // Search & filter timetable classes
  const filteredClasses = timetableClasses.filter(c => {
    // Day check
    if (dayFilter !== "all" && c.day !== dayFilter) return false;

    // Search input checks (room, course name, course code, faculty)
    if (search.trim()) {
      const q = search.toLowerCase();
      const sub = subjects.find(s => s.code === c.subjectCode);
      const matchCode = c.subjectCode.toLowerCase().includes(q);
      const matchRoom = c.room.toLowerCase().includes(q);
      const matchName = sub ? sub.name.toLowerCase().includes(q) : false;
      const matchFaculty = sub ? sub.faculty.toLowerCase().includes(q) : false;

      if (!matchCode && !matchRoom && !matchName && !matchFaculty) return false;
    }
    return true;
  });

  return (
    <div className="p-6 space-y-5 max-w-[1200px] animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold font-[Outfit] text-foreground">Timetable</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Your weekly class schedule</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onOpenTimetableModal(null)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl px-4 py-2.5 transition-colors shadow-sm active:scale-95">
            <Plus size={14} /> Add Class Slot
          </button>
        </div>
      </div>

      {/* Control filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-card border border-border p-4 rounded-2xl shadow-sm">
        <div className="relative sm:col-span-2">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search classes by room, professor, course..."
            className="w-full bg-muted/50 border border-border rounded-xl pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
        </div>

        <select
          value={dayFilter}
          onChange={e => setDayFilter(e.target.value)}
          className="bg-muted/50 border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
        >
          <option value="all">All Days</option>
          {days.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Main planner grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {days.map(day => {
          const daySlots = filteredClasses
            .filter(c => c.day === day)
            .map(c => {
              const sub = subjects.find(s => s.code === c.subjectCode);
              return {
                ...c,
                name: sub ? sub.name : "Unknown Subject",
                faculty: sub ? sub.faculty : "Unknown Faculty",
                color: sub ? sub.color : "#94a3b8"
              };
            })
            // Sort daily slots chronologically
            .sort((a, b) => a.startTime.localeCompare(b.startTime));

          // Hide columns if day filter is active and doesn't match
          if (dayFilter !== "all" && dayFilter !== day) return null;

          return (
            <div key={day} className="space-y-3">
              <div className="bg-card border border-border rounded-xl px-3 py-2.5 text-center shadow-sm select-none">
                <p className="text-sm font-bold text-foreground">{day}</p>
              </div>
              
              {daySlots.length > 0 ? (
                daySlots.map((cls) => (
                  <div
                    key={cls.id}
                    onClick={() => onOpenTimetableModal(cls)}
                    className="bg-card border border-border rounded-xl p-3.5 hover:shadow-md hover:scale-[1.02] hover:border-indigo-400 dark:hover:border-indigo-800 transition-all shadow-sm cursor-pointer relative group"
                    style={{ borderLeftColor: cls.color, borderLeftWidth: "3.5px" }}
                  >
                    <p className="text-xs font-semibold font-[Geist_Mono]" style={{ color: cls.color }}>
                      {cls.startTime}–{cls.endTime}
                    </p>
                    <p className="text-sm font-bold text-foreground mt-1 font-[Outfit]">{cls.name}</p>
                    <p className="text-[11px] text-muted-foreground mt-1 font-[DM_Sans]">{cls.faculty}</p>
                    <div className="flex items-center gap-1 mt-2 text-[11px] text-muted-foreground">
                      <MapPin size={10} />{cls.room}
                    </div>
                    <div className="mt-2.5 flex justify-between items-center">
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded" style={{ backgroundColor: cls.color + "20", color: cls.color }}>
                        {cls.subjectCode}
                      </span>
                      <span className="opacity-0 group-hover:opacity-60 text-[9px] text-muted-foreground transition-opacity">
                        Click to edit
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-muted/20 border border-dashed border-border rounded-xl p-6 text-center select-none">
                  <p className="text-xs text-muted-foreground">No classes</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── ATTENDANCE PAGE ──────────────────────────────────────────

function AttendancePage({
  isDark,
  subjects,
  onOpenSubjectModal,
  onIncrementAttendance
}: {
  isDark: boolean;
  subjects: Subject[];
  onOpenSubjectModal: (s: Subject | null) => void;
  onIncrementAttendance: (code: string, isPresent: boolean) => void;
}) {
  const gridColor = isDark ? "#1A1A35" : "#E8E8FF";
  const textColor = isDark ? "#8B8BAE" : "#6B6B8A";
  const tooltipBg = isDark ? "#10102A" : "#fff";
  const tooltipBorder = isDark ? "#6366F1" : "#E0E7FF";

  // Dynamic statistics calculations
  const overall = subjects.length > 0 ? Math.round(subjects.reduce((s, a) => s + (a.total > 0 ? a.attended / a.total * 100 : 100), 0) / subjects.length) : 0;
  const totalAttended = subjects.reduce((sum, s) => sum + s.attended, 0);
  const totalClasses = subjects.reduce((sum, s) => sum + s.total, 0);
  const belowTargetCount = subjects.filter(s => (s.total > 0 ? (s.attended / s.total * 100) : 100) < (s.target || 75)).length;

  let bestSubjectName = "N/A";
  let bestPct = -1;
  subjects.forEach(s => {
    const pct = s.total > 0 ? (s.attended / s.total * 100) : 100;
    if (pct > bestPct) {
      bestPct = pct;
      bestSubjectName = s.code;
    }
  });

  return (
    <div className="p-6 space-y-6 max-w-[1200px] animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold font-[Outfit] text-foreground">Attendance</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track your presence across all subjects</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onOpenSubjectModal(null)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl px-4 py-2.5 transition-colors shadow-sm active:scale-95">
            <Plus size={14} /> Add Subject
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Activity size={18} />} label="Overall Attendance" value={`${overall}%`} delta={{ val: "calculated", up: true }} color="#4F46E5" />
        <StatCard icon={<CheckCircle size={18} />} label="Classes Attended" value={String(totalAttended)} sub={`out of ${totalClasses} total`} color="#10B981" />
        <StatCard icon={<AlertTriangle size={18} />} label="Below Target" value={String(belowTargetCount)} sub="Action items warning" color="#EF4444" />
        <StatCard icon={<TrendingUp size={18} />} label="Best Subject" value={bestSubjectName} sub={bestPct !== -1 ? `${Math.round(bestPct)}% attendance` : "N/A"} color="#8B5CF6" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Course cards stack */}
        <div className="xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {subjects.length > 0 ? (
            subjects.map(a => {
              const pct = a.total > 0 ? Math.round(a.attended / a.total * 100) : 100;
              const targetVal = a.target || 75;
              const warn = pct < targetVal;
              const ok = pct >= 85;

              // Safe/Warning/Critical logic
              let status = "Safe";
              let statusClass = "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-500/10";
              if (pct < 70) {
                status = "Critical";
                statusClass = "bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 border-red-500/10 font-bold";
              } else if (pct < targetVal) {
                status = "Warning";
                statusClass = "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 border-amber-500/10 font-bold";
              }

              // Mathematical Insights calculations
              let insightText = "";
              if (!warn) {
                // Safe: How many classes can they miss consecutively
                const targetDecimal = targetVal / 100;
                const maxMiss = Math.floor(a.attended / targetDecimal - a.total);
                if (maxMiss > 0) {
                  insightText = `You can miss ${maxMiss} more class${maxMiss !== 1 ? "es" : ""}.`;
                } else {
                  insightText = "On the target threshold. Do not miss any classes.";
                }
              } else {
                // Below Target: How many consecutive classes they must attend
                const targetDecimal = targetVal / 100;
                const reqCon = Math.ceil((targetDecimal * a.total - a.attended) / (1 - targetDecimal));
                if (reqCon > 0) {
                  insightText = `Attend the next ${reqCon} class${reqCon !== 1 ? "es" : ""} to reach target.`;
                }
              }

              return (
                <div key={a.code} className={cn("bg-card border rounded-2xl p-5 hover:shadow-md transition-all shadow-sm flex flex-col justify-between group", warn ? "border-red-300 dark:border-red-950/60" : "border-border")}>
                  <div>
                    {/* Badge Row */}
                    <div className="flex justify-between items-start mb-3 select-none">
                      <span className={`inline-flex px-2 py-0.5 rounded-full border text-[9px] font-semibold ${statusClass}`}>
                        {status}
                      </span>
                      <button
                        onClick={() => onOpenSubjectModal(a)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                        title="Edit Course Subject"
                      >
                        <Edit size={13} />
                      </button>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="relative flex-shrink-0 select-none">
                        <CircularProgress pct={pct} color={a.color} size={72} />
                        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold" style={{ color: a.color }}>
                          {pct}%
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 font-[DM_Sans]">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-bold text-foreground font-[Outfit] truncate leading-tight pr-2">{a.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 font-medium">{a.code}</p>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1.5">{a.faculty}</p>
                        <div className="flex items-center gap-2 mt-3 font-[Outfit] text-foreground select-none">
                          <span className="text-xs font-bold">{a.attended}/{a.total}</span>
                          <span className="text-xs text-muted-foreground font-medium">classes attended</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3.5 select-none">
                      <ProgressBar value={pct} color={warn ? "#EF4444" : a.color} />
                    </div>

                    {/* Insight Message */}
                    {insightText && (
                      <p className={`text-[11px] mt-2.5 leading-snug font-semibold ${warn ? "text-red-500" : "text-emerald-500"}`}>
                        {warn ? "⚠ " : "✓ "}{insightText}
                      </p>
                    )}
                  </div>

                  {/* Increment Quick Buttons */}
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3.5 border-t border-border/20 font-[Outfit] select-none">
                    <button
                      onClick={() => onIncrementAttendance(a.code, true)}
                      className="px-2 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 border border-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-xl transition-colors active:scale-95"
                    >
                      ✅ Present Today
                    </button>
                    <button
                      onClick={() => onIncrementAttendance(a.code, false)}
                      className="px-2 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 border border-red-500/10 text-red-600 dark:text-red-400 text-[10px] font-bold rounded-xl transition-colors active:scale-95"
                    >
                      ❌ Absent Today
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-2">
              <EmptyState
                title="No Subjects Registered"
                description="There are no subjects configured in your store. Add a subject to start tracking your daily attendance."
                actionLabel="Add Subject"
                onAction={() => onOpenSubjectModal(null)}
              />
            </div>
          )}
        </div>

        {/* Attendance monthly trend */}
        <div className="bg-card border border-border rounded-2xl p-5 flex flex-col shadow-sm hover:shadow-md transition-shadow select-none">
          <h2 className="font-semibold font-[Outfit] text-foreground mb-1">Attendance Trend</h2>
          <p className="text-xs text-muted-foreground mb-5 font-medium">Monthly overall attendance %</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={ATTENDANCE_TREND} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="month" tick={{ fill: textColor, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: textColor, fontSize: 12 }} axisLine={false} tickLine={false} domain={[70, 100]} />
              <Tooltip contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: "12px", fontSize: "12px" }} />
              <Line type="monotone" dataKey="pct" stroke="#4F46E5" strokeWidth={2.5} dot={{ fill: "#4F46E5", r: 5 }} name="Attendance %" />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-auto pt-4 border-t border-border font-[Outfit]">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-medium">Target Required</span>
              <span className="font-bold text-foreground">75%</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1.5">
              <span className="text-muted-foreground font-medium">Your Current average</span>
              <span className="font-bold text-emerald-500">{overall}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Analytics page removed

export default function App() {
  const [page, setPage] = useState<NavPage>("dashboard");
  const [isDark, setIsDark] = useLocalStorageState<boolean>("mindvault_dark_mode", true);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Authentication State
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("mindvault_token"));
  const [user, setUser] = useState<any | null>(() => {
    const saved = localStorage.getItem("mindvault_user");
    try {
      return saved ? JSON.parse(saved) : null;
    } catch (_) {
      return null;
    }
  });
  const [authMode, setAuthMode] = useState<"landing" | "login" | "register">("landing");

  // User ID or stable email key for localStorage scoping (permanent across re-logins)
  const userKey = user?.id || user?.email ? (user.id || user.email) : (token ? "active" : "guest");

  // Dynamic check to determine if this is the default demo/development account
  const isDefaultUser = userKey === "alex_mercer_default_id" || user?.email === "alex@university.edu" || token === "alex_mercer_default_id";

  // User-scoped Subject state powered by Express + PostgreSQL backend API
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // Fetch subjects from backend API when authenticated
  useEffect(() => {
    if (token) {
      fetchSubjects()
        .then((data) => {
          if (data && data.length > 0) {
            setSubjects(data);
          } else if (isDefaultUser) {
            // Seed initial subjects to backend if empty for default user
            Promise.all(INITIAL_SUBJECTS.map(s => createSubject(s)))
              .then(seeded => setSubjects(seeded))
              .catch(err => console.warn("Failed to seed subjects to backend:", err));
          } else {
            setSubjects([]);
          }
        })
        .catch((err) => console.warn("Failed to fetch subjects from backend:", err));
    } else {
      setSubjects([]);
    }
  }, [token, isDefaultUser]);

  const [timetableClasses, setTimetableClasses] = useLocalStorageState<TimetableClass[]>(
    userKey ? `mindvault_timetable_classes_${userKey}` : "mindvault_timetable_classes_guest",
    isDefaultUser ? INITIAL_TIMETABLE_CLASSES : []
  );
  const [assignments, setAssignments] = useLocalStorageState<Assignment[]>(
    userKey ? `mindvault_assignments_${userKey}` : "mindvault_assignments_guest",
    isDefaultUser ? INITIAL_ASSIGNMENTS : []
  );
  const [reminders, setReminders] = useLocalStorageState<Reminder[]>(
    userKey ? `mindvault_reminders_${userKey}` : "mindvault_reminders_guest",
    isDefaultUser ? INITIAL_REMINDERS : []
  );
  const [notes, setNotes] = useLocalStorageState<Note[]>(
    userKey ? `mindvault_notes_${userKey}` : "mindvault_notes_guest",
    isDefaultUser ? INITIAL_NOTES : []
  );
  const [notifications, setNotifications] = useLocalStorageState<AppNotification[]>(
    userKey ? `mindvault_notifications_${userKey}` : "mindvault_notifications_guest",
    isDefaultUser ? INITIAL_NOTIFICATIONS : []
  );

  // Initialize default seeded user on mount for local storage dev mode
  useEffect(() => {
    const usersRaw = localStorage.getItem("mindvault_users");
    const users = usersRaw ? JSON.parse(usersRaw) : [];
    const hasDefault = users.some((u: any) => u.email.toLowerCase() === "alex@university.edu");
    if (!hasDefault) {
      import("bcryptjs").then(async (bcrypt) => {
        const hash = await bcrypt.hash("Swara@1234", 10);
        const defaultUser = {
          id: "alex_mercer_default_id",
          email: "alex@university.edu",
          password: hash,
          name: "Alex Mercer",
          major: "Computer Science",
          year: "Sophomore",
          createdAt: new Date().toISOString()
        };
        users.push(defaultUser);
        localStorage.setItem("mindvault_users", JSON.stringify(users));
      });
    }
  }, []);

  // Listen for unauthorized event (401 token expiration)
  useEffect(() => {
    const onUnauthorized = () => {
      handleLogout();
      triggerToast("Session expired. Please login again.", "error");
    };
    window.addEventListener("mindvault_unauthorized", onUnauthorized);
    return () => window.removeEventListener("mindvault_unauthorized", onUnauthorized);
  }, []);

  // Auto-heal non-JWT tokens (e.g. legacy default user IDs) on startup
  useEffect(() => {
    const savedToken = localStorage.getItem("mindvault_token");
    if (savedToken && !savedToken.startsWith("ey")) {
      const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
      fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "alex@university.edu", password: "Swara@1234" }),
      })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data && data.token) {
            handleLoginSuccess(data.token, data.user);
          } else {
            // Auto-register default demo user if not in Prisma database
            fetch(`${BASE_URL}/api/auth/register`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: "alex@university.edu",
                password: "Swara@1234",
                name: "Alex Mercer",
                major: "Computer Science",
                year: "Sophomore",
              }),
            })
              .then(r => r.json())
              .then(regData => {
                if (regData && regData.token) {
                  handleLoginSuccess(regData.token, regData.user);
                }
              })
              .catch(e => console.warn("Token auto-register failed", e));
          }
        })
        .catch(err => console.warn("Auto-heal token failed:", err));
    }
  }, []);

  // Auth helper callbacks & logic
  const handleLoginSuccess = (newToken: string, newUser: any) => {
    localStorage.setItem("mindvault_token", newToken);
    localStorage.setItem("token", newToken);
    localStorage.setItem("mindvault_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem("mindvault_token");
    localStorage.removeItem("token");
    localStorage.removeItem("mindvault_user");
    setToken(null);
    setUser(null);
    setPage("dashboard");
    triggerToast("Logged out successfully.", "info");
  };

  const handleLogin = async (emailInput: string, passwordInput: string) => {
    const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

    // 1. Try real backend login
    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput, password: passwordInput }),
      });
      if (res.ok) {
        const data = await res.json();
        handleLoginSuccess(data.token, data.user);
        return data.user;
      }
    } catch (err) {
      console.warn("Backend auth request failed:", err);
    }

    // 2. Local credentials check
    const usersRaw = localStorage.getItem("mindvault_users");
    const users = usersRaw ? JSON.parse(usersRaw) : [];
    const matched = users.find((u: any) => u.email.toLowerCase() === emailInput.toLowerCase());

    if (!matched) {
      throw new Error("Invalid email or password.");
    }

    const bcrypt = await import("bcryptjs");
    const isMatch = await bcrypt.compare(passwordInput, matched.password);
    if (!isMatch) {
      throw new Error("Invalid email or password.");
    }

    // 3. Auto-provision in Prisma backend to retrieve valid signed JWT token
    try {
      const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: matched.email,
          password: passwordInput,
          name: matched.name || "Alex Mercer",
          major: matched.major || "Computer Science",
          year: matched.year || "Sophomore",
        }),
      });
      if (regRes.ok) {
        const regData = await regRes.json();
        handleLoginSuccess(regData.token, regData.user);
        return regData.user;
      }
    } catch (err) {
      console.warn("Auto-register fallback failed:", err);
    }

    throw new Error("Unable to contact backend authentication service.");
  };

  const handleRegister = async (data: any) => {
    const { name, email, password, collegeName } = data;
    const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
    const usersRaw = localStorage.getItem("mindvault_users");
    const users = usersRaw ? JSON.parse(usersRaw) : [];

    if (users.some((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("A user with this email already exists.");
    }

    try {
      const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          name,
          major: collegeName || "Computer Science",
          year: "Freshman",
        }),
      });
      if (regRes.ok) {
        const regData = await regRes.json();
        const bcrypt = await import("bcryptjs");
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
          id: regData.user.id,
          email,
          password: hashedPassword,
          name,
          collegeName: collegeName || "",
          createdAt: new Date().toISOString(),
        };
        users.push(newUser);
        localStorage.setItem("mindvault_users", JSON.stringify(users));
        handleLoginSuccess(regData.token, regData.user);
        return regData.user;
      }
    } catch (err) {
      console.warn("Backend registration failed:", err);
    }

    throw new Error("Unable to contact backend authentication service.");
  };

  const handleUpdateProfile = async (name: string, major: string, year: string) => {
    if (!user) return;
    const usersRaw = localStorage.getItem("mindvault_users");
    const users = usersRaw ? JSON.parse(usersRaw) : [];

    const updatedUsers = users.map((u: any) => {
      if (u.id === user.id) {
        return { ...u, name, major, year };
      }
      return u;
    });

    const updatedUser = { ...user, name, major, year };
    localStorage.setItem("mindvault_users", JSON.stringify(updatedUsers));
    localStorage.setItem("mindvault_user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    triggerToast("Profile updated successfully.", "success");
  };

  const handleChangePassword = async (currentPass: string, newPass: string) => {
    if (!user) return;
    const usersRaw = localStorage.getItem("mindvault_users");
    const users = usersRaw ? JSON.parse(usersRaw) : [];

    const matchedIndex = users.findIndex((u: any) => u.id === user.id);
    if (matchedIndex === -1) {
      throw new Error("User account not found.");
    }

    const matched = users[matchedIndex];
    const bcrypt = await import("bcryptjs");
    const isMatch = await bcrypt.compare(currentPass, matched.password);
    if (!isMatch) {
      throw new Error("Current password is incorrect.");
    }

    const hashedNew = await bcrypt.hash(newPass, 10);
    users[matchedIndex].password = hashedNew;

    localStorage.setItem("mindvault_users", JSON.stringify(users));
    triggerToast("Password changed successfully.", "success");
  };

  const [accentColor, setAccentColor] = useLocalStorageState<string>("mindvault_accent_color", "#4F46E5");

  // Custom Toast state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Simulated Startup loading
  const [loading, setLoading] = useState(true);

  // Quick Add modal controllers
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddTab, setQuickAddTab] = useState<"assignment" | "note" | "reminder">("assignment");

  // Subject Modal states
  const [isSubjectOpen, setIsSubjectOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  // Timetable Modal states
  const [isTimetableOpen, setIsTimetableOpen] = useState(false);
  const [selectedClassSlot, setSelectedClassSlot] = useState<TimetableClass | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const toggleDark = () => setIsDark(d => !d);

  const triggerToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToasts((prev) => [...prev, { id: Date.now(), message, type }]);
  };

  // Quick Add handlers
  const handleAddAssignment = (newA: Assignment) => {
    setAssignments((prev) => [newA, ...prev]);
    triggerToast(`Assignment "${newA.title}" added successfully.`, "success");
    setNotifications((prev) => [
      {
        id: Date.now(),
        type: "assignment",
        title: "New Assignment Created",
        msg: `"${newA.title}" added under ${newA.subjectName}. Due ${newA.due}.`,
        time: "Just now",
        read: false,
      },
      ...prev,
    ]);
  };

  const handleAddNote = (newN: Note) => {
    setNotes((prev) => [newN, ...prev]);
    triggerToast(`Note "${newN.title}" created.`, "success");
  };

  const handleAddReminder = (newR: Reminder) => {
    setReminders((prev) => [newR, ...prev]);
    triggerToast(`Reminder "${newR.title}" scheduled for ${newR.time}.`, "success");
    setNotifications((prev) => [
      {
        id: Date.now(),
        type: "reminder",
        title: "Reminder Set",
        msg: `"${newR.title}" scheduled for ${newR.time}.`,
        time: "Just now",
        read: false,
      },
      ...prev,
    ]);
  };

  // Notification handlers
  const handleMarkRead = (id: number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleDeleteNotif = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleMarkAllNotifRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // JSON exporter
  const exportData = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(
        JSON.stringify({
          subjects,
          timetableClasses,
          assignments,
          notes,
          reminders,
          notifications
        }, null, 2)
      );
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "mindvault_os_backup.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      triggerToast("All OS student metrics exported successfully.", "success");
    } catch (_) {
      triggerToast("Error compiling backup payload.", "error");
    }
  };

  const handleQuickNavigate = (targetPage: NavPage) => {
    setPage(targetPage);
  };

  // Sidebar badge values mapping
  const badgeValues = {
    assignments: assignments.filter(a => a.status !== "completed").length,
    reminders: reminders.filter(r => !r.done).length,
    notifications: notifications.filter(n => !n.read).length,
  };

  // Shared Subject Store handlers (Backend API powered)
  const handleSaveSubject = async (sub: Subject) => {
    const isEdit = subjects.some(s => s.code === sub.code);
    try {
      if (isEdit) {
        const updated = await updateSubject(sub.code, sub);
        setSubjects(prev => prev.map(s => s.code === sub.code ? updated : s));
        triggerToast(`Subject "${sub.code}" edited successfully.`, "success");
      } else {
        const created = await createSubject(sub);
        setSubjects(prev => [...prev, created]);
        triggerToast(`Subject "${sub.code}" added to your store.`, "success");
      }
    } catch (err) {
      console.error("Subject save failed:", err);
      triggerToast("Failed to save subject to backend.", "error");
    }
  };

  const handleDeleteSubject = async (code: string) => {
    try {
      await deleteSubject(code);
      setSubjects(prev => prev.filter(s => s.code !== code));
      // Cascade delete related timetable slots
      setTimetableClasses(prev => prev.filter(c => c.subjectCode !== code));
      triggerToast(`Subject "${code}" and its timetable slots deleted.`, "success");
    } catch (err) {
      console.error("Subject deletion failed:", err);
      triggerToast("Failed to delete subject from backend.", "error");
    }
  };

  const handleIncrementAttendance = async (code: string, isPresent: boolean) => {
    const targetSub = subjects.find(s => s.code === code);
    if (!targetSub) return;
    const newAttended = isPresent ? targetSub.attended + 1 : targetSub.attended;
    const newTotal = targetSub.total + 1;
    try {
      const updated = await updateSubject(code, { attended: newAttended, total: newTotal });
      setSubjects(prev => prev.map(s => s.code === code ? updated : s));
      triggerToast(isPresent ? `Marked present today for ${code}.` : `Marked absent today for ${code}.`, "info");
    } catch (err) {
      console.error("Attendance update failed:", err);
      triggerToast("Failed to update attendance on backend.", "error");
    }
  };

  // Timetable planner slots handlers
  const handleSaveTimetableClass = (slot: TimetableClass) => {
    const isEdit = timetableClasses.some(c => c.id === slot.id);
    if (isEdit) {
      setTimetableClasses(prev => prev.map(c => c.id === slot.id ? slot : c));
      triggerToast("Timetable class slot updated.", "success");
    } else {
      setTimetableClasses(prev => [...prev, slot]);
      triggerToast("Class slot added to timetable.", "success");
    }
  };

  const handleDeleteTimetableClass = (id: string) => {
    setTimetableClasses(prev => prev.filter(c => c.id !== id));
    triggerToast("Timetable slot removed.", "success");
  };

  const renderPage = () => {
    if (loading && page === "dashboard") {
      return <DashboardPageSkeleton />;
    }

    switch (page) {
      case "dashboard":
        return (
          <DashboardPage
            isDark={isDark}
            assignments={assignments}
            reminders={reminders}
            subjects={subjects}
            timetableClasses={timetableClasses}
            onOpenQuickAdd={(tab) => {
              setQuickAddTab(tab);
              setIsQuickAddOpen(true);
            }}
            onNavigate={setPage}
            exportData={exportData}
            user={user}
            isDefaultUser={isDefaultUser}
          />
        );
      case "assignments":
        return (
          <AssignmentsPage
            assignments={assignments}
            setAssignments={setAssignments}
            onOpenQuickAdd={() => {
              setQuickAddTab("assignment");
              setIsQuickAddOpen(true);
            }}
            triggerToast={triggerToast}
            subjects={subjects}
          />
        );
      case "reminders":
        return (
          <RemindersPage
            reminders={reminders}
            setReminders={setReminders}
            onOpenQuickAdd={() => {
              setQuickAddTab("reminder");
              setIsQuickAddOpen(true);
            }}
          />
        );
      case "notes":
        return (
          <NotesPage
            notes={notes}
            setNotes={setNotes}
            onOpenQuickAdd={() => {
              setQuickAddTab("note");
              setIsQuickAddOpen(true);
            }}
            loading={loading}
            subjects={subjects}
          />
        );
      case "calendar":
        return (
          <CalendarPage
            assignments={assignments}
            reminders={reminders}
            subjects={subjects}
          />
        );
      case "timetable":
        return (
          <TimetablePage
            subjects={subjects}
            timetableClasses={timetableClasses}
            onOpenTimetableModal={(slot) => {
              setSelectedClassSlot(slot);
              setIsTimetableOpen(true);
            }}
            onOpenSubjectModal={() => {
              setSelectedSubject(null);
              setIsSubjectOpen(true);
            }}
          />
        );
      case "attendance":
        return (
          <AttendancePage
            isDark={isDark}
            subjects={subjects}
            onOpenSubjectModal={(sub) => {
              setSelectedSubject(sub);
              setIsSubjectOpen(true);
            }}
            onIncrementAttendance={handleIncrementAttendance}
          />
        );
      case "ai":
        return <AIPage />;
      case "notifications":
        return (
          <NotificationsPage
            notifications={notifications}
            setNotifications={setNotifications}
          />
        );
      case "settings":
        return (
          <SettingsPage
            isDark={isDark}
            toggleDark={toggleDark}
            accentColor={accentColor}
            setAccentColor={setAccentColor}
            user={user}
            onUpdateProfile={handleUpdateProfile}
            onChangePassword={handleChangePassword}
          />
        );
      case "profile":
        return (
          <ProfilePage
            assignments={assignments}
            notes={notes}
            reminders={reminders}
            subjects={subjects}
            user={user}
            userKey={userKey}
          />
        );
      case "subjects":
        return (
          <SubjectsPage
            subjects={subjects}
            onOpenSubjectModal={(sub) => {
              setSelectedSubject(sub);
              setIsSubjectOpen(true);
            }}
            onDeleteSubject={handleDeleteSubject}
          />
        );
      default:
        return (
          <DashboardPage
            isDark={isDark}
            assignments={assignments}
            reminders={reminders}
            subjects={subjects}
            timetableClasses={timetableClasses}
            onOpenQuickAdd={(tab) => {
              setQuickAddTab(tab);
              setIsQuickAddOpen(true);
            }}
            onNavigate={setPage}
            exportData={exportData}
            user={user}
            isDefaultUser={isDefaultUser}
          />
        );
    }
  };

  if (!token) {
    if (authMode === "landing") {
      return (
        <LandingPage
          onGetStarted={() => setAuthMode("register")}
          onSignIn={() => setAuthMode("login")}
          accentColor={accentColor}
        />
      );
    }

    return authMode === "login" ? (
      <LoginScreen
        onLogin={handleLogin}
        onSwitchToRegister={() => setAuthMode("register")}
        accentColor={accentColor}
        triggerToast={triggerToast}
      />
    ) : (
      <RegisterScreen
        onRegister={handleRegister}
        onSwitchToLogin={() => setAuthMode("login")}
        accentColor={accentColor}
        triggerToast={triggerToast}
      />
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=Geist+Mono:wght@300;400;500;600&display=swap');
        .font-\\[Outfit\\] { font-family: 'Outfit', sans-serif; }
        .font-\\[DM_Sans\\] { font-family: 'DM Sans', sans-serif; }
        .font-\\[Geist_Mono\\] { font-family: 'Geist Mono', monospace; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        * { scrollbar-width: thin; scrollbar-color: transparent transparent; }
        *:hover { scrollbar-color: rgba(99,102,241,0.3) transparent; }

        /* Animation utilities */
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
        .animate-scale-up {
          animation: scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-spin-slow {
          animation: spin 3.5s linear infinite;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Accent variables dynamically mapped */
        :root {
          --primary-accent: ${accentColor};
        }
        .accent-indigo-600 {
          accent-color: var(--primary-accent);
        }
        .text-indigo-500 {
          color: var(--primary-accent);
        }
        .text-indigo-600 {
          color: var(--primary-accent);
        }
        .bg-indigo-600 {
          background-color: var(--primary-accent);
        }
        .hover\\:bg-indigo-700:hover {
          background-color: var(--primary-accent)EE;
        }
        .hover\\:border-indigo-300:hover {
          border-color: var(--primary-accent)80;
        }
        .dark .hover\\:border-indigo-700:hover {
          border-color: var(--primary-accent)AA;
        }
        .focus\\:ring-indigo-500\\/40:focus-within {
          --tw-ring-color: rgba(99, 102, 241, 0.4);
        }
      `}</style>

      <Sidebar
        page={page} setPage={setPage}
        collapsed={collapsed} setCollapsed={setCollapsed}
        mobileOpen={mobileOpen} setMobileOpen={setMobileOpen}
        badgeValues={badgeValues}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden font-[DM_Sans]">
        <TopNav
          page={page}
          isDark={isDark}
          toggleDark={toggleDark}
          onMenuClick={() => setMobileOpen(true)}
          unreadNotifCount={badgeValues.notifications}
          notifications={notifications}
          onMarkRead={handleMarkRead}
          onDelete={handleDeleteNotif}
          onMarkAllRead={handleMarkAllNotifRead}
          assignments={assignments}
          notes={notes}
          reminders={reminders}
          onNavigate={handleQuickNavigate}
          onOpenQuickAdd={() => {
            setQuickAddTab("assignment");
            setIsQuickAddOpen(true);
          }}
        />
        <main className={cn("flex-1 overflow-y-auto", page === "ai" && "flex flex-col overflow-hidden")}>
          {renderPage()}
        </main>
      </div>

      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        initialTab={quickAddTab}
        subjects={subjects}
        onAddAssignment={handleAddAssignment}
        onAddNote={handleAddNote}
        onAddReminder={handleAddReminder}
      />

      <SubjectModal
        isOpen={isSubjectOpen}
        onClose={() => setIsSubjectOpen(false)}
        subject={selectedSubject}
        existingSubjects={subjects}
        onSave={handleSaveSubject}
        onDelete={handleDeleteSubject}
      />

      <TimetableModal
        isOpen={isTimetableOpen}
        onClose={() => setIsTimetableOpen(false)}
        timetableClass={selectedClassSlot}
        subjects={subjects}
        onSave={handleSaveTimetableClass}
        onDelete={handleDeleteTimetableClass}
        onOpenAddSubject={() => {
          setSelectedSubject(null);
          setIsSubjectOpen(true);
        }}
      />

      <ToastContainer
        toasts={toasts}
        onRemove={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />
    </div>
  );
}
