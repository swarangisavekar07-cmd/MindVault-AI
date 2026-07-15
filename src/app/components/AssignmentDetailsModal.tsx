import React, { useEffect } from "react";
import { X, Calendar, Clock, Award, BarChart, BookOpen, Trash2, Edit } from "lucide-react";
import { Assignment, SUBJECT_COLORS } from "../data/mockData";

interface AssignmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment | null;
  onEdit: () => void;
  onDelete: () => void;
}

export default function AssignmentDetailsModal({
  isOpen,
  onClose,
  assignment,
  onEdit,
  onDelete,
}: AssignmentDetailsModalProps) {
  // Escape key support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !assignment) return null;

  const getCountdownText = (dueStr: string) => {
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
        const diffTime = dueDateObj.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
          return { text: `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? "s" : ""}`, color: "text-red-500 font-semibold" };
        } else if (diffDays === 0) {
          return { text: "Due today!", color: "text-amber-500 font-bold" };
        } else if (diffDays === 1) {
          return { text: "Due tomorrow", color: "text-amber-500 font-semibold" };
        } else {
          return { text: `${diffDays} days remaining`, color: "text-muted-foreground" };
        }
      }
    } catch (_) {}

    return { text: `Due ${dueStr}`, color: "text-muted-foreground" };
  };

  const countdown = getCountdownText(assignment.due);

  const priorityStyles: Record<string, string> = {
    high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-500/10",
    medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-500/10",
    low: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-500/10",
  };

  const statusStyles: Record<string, string> = {
    "not-started": "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-500/10",
    "in-progress": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 border-indigo-500/10",
    review: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-500/10",
    completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-500/10",
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl p-6 relative animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 hover:bg-muted rounded-xl text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={16} />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2 mb-2 pr-6">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: SUBJECT_COLORS[assignment.subject] || "#4F46E5" }}
          />
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
            {assignment.subject} · {assignment.subjectName}
          </span>
        </div>

        <h2 className="text-lg font-bold font-[Outfit] text-foreground mb-4 pr-6 leading-snug">
          {assignment.title}
        </h2>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 bg-muted/30 dark:bg-muted/10 rounded-xl p-4 mb-4 text-xs">
          <div className="space-y-1">
            <p className="text-muted-foreground flex items-center gap-1">
              <Calendar size={12} /> Due Date
            </p>
            <p className="font-semibold text-foreground">{assignment.due}</p>
          </div>

          <div className="space-y-1">
            <p className="text-muted-foreground flex items-center gap-1">
              <Clock size={12} /> Countdown
            </p>
            <p className={countdown.color}>{countdown.text}</p>
          </div>

          <div className="space-y-1">
            <p className="text-muted-foreground flex items-center gap-1">
              <Award size={12} /> Priority
            </p>
            <span className={`inline-flex px-2 py-0.5 rounded-full border text-[10px] capitalize font-medium ${priorityStyles[assignment.priority]}`}>
              {assignment.priority}
            </span>
          </div>

          <div className="space-y-1">
            <p className="text-muted-foreground flex items-center gap-1">
              <BarChart size={12} /> Status
            </p>
            <span className={`inline-flex px-2 py-0.5 rounded-full border text-[10px] capitalize font-medium ${statusStyles[assignment.status]}`}>
              {assignment.status.replace("-", " ")}
            </span>
          </div>
        </div>

        {/* Progress Section */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground font-medium flex items-center gap-1">
              <BookOpen size={12} /> Progress
            </span>
            <span className="font-semibold text-foreground">{assignment.progress}%</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${assignment.progress}%`,
                backgroundColor: SUBJECT_COLORS[assignment.subject] || "#4F46E5",
              }}
            />
          </div>
        </div>

        {/* Actions Button Row */}
        <div className="flex gap-3 border-t border-border/40 pt-4 mt-2">
          <button
            onClick={onDelete}
            className="flex items-center justify-center gap-1.5 px-4 py-2 border border-red-200 dark:border-red-950/20 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl text-xs font-semibold transition-colors"
          >
            <Trash2 size={13} /> Delete
          </button>
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            <Edit size={13} /> Edit Details
          </button>
        </div>
      </div>
    </div>
  );
}
