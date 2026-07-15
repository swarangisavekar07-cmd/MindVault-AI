import React, { useState, useEffect } from "react";
import { X, Edit2 } from "lucide-react";
import { Assignment } from "../data/mockData";
import { Subject } from "./SubjectModal";

interface AssignmentEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment | null;
  subjects: Subject[];
  onSave: (updatedAssignment: Assignment) => void;
}

export default function AssignmentEditModal({
  isOpen,
  onClose,
  assignment,
  subjects,
  onSave,
}: AssignmentEditModalProps) {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("CS301");
  const [priority, setPriority] = useState("medium");
  const [due, setDue] = useState("");
  const [progress, setProgress] = useState(0);

  const convertToInputDateFormat = (dueStr: string) => {
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
        const mStr = String(monthIdx + 1).padStart(2, "0");
        const dStr = String(day).padStart(2, "0");
        return `${year}-${mStr}-${dStr}`;
      }
    } catch (_) {}
    return "";
  };

  // Reset fields when active assignment changes
  useEffect(() => {
    if (assignment) {
      setTitle(assignment.title);
      setSubject(assignment.subject);
      setPriority(assignment.priority);
      setProgress(assignment.progress);
      setDue(convertToInputDateFormat(assignment.due));
    }
  }, [assignment]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !due || !subject) return;

    let formattedDue = due;
    try {
      const dateObj = new Date(due);
      if (!isNaN(dateObj.getTime())) {
        formattedDue = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      }
    } catch (_) {}

    const selectedSub = subjects.find(s => s.code === subject);

    onSave({
      ...assignment,
      title,
      subject,
      subjectName: selectedSub ? selectedSub.name : "Other",
      due: formattedDue,
      priority,
      status: progress === 100 ? "completed" : progress > 0 ? "in-progress" : "not-started",
      progress: Number(progress),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-bold font-[Outfit] text-foreground flex items-center gap-2">
            <Edit2 size={18} className="text-indigo-500" />
            Edit Assignment
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-muted rounded-xl text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              >
                {subjects.map((sub) => (
                  <option key={sub.code} value={sub.code}>
                    {sub.code} - {sub.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Due Date</label>
            <input
              type="date"
              required
              value={due}
              onChange={(e) => setDue(e.target.value)}
              className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-muted-foreground">
              <span>Current Progress</span>
              <span>{progress}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full accent-indigo-600 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="pt-4 border-t border-border flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium border border-border hover:bg-muted text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
