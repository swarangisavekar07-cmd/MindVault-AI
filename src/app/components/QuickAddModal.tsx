import React, { useState, useEffect } from "react";
import { X, Plus, BookOpen, FileText, Bell } from "lucide-react";
import { Assignment, Note, Reminder } from "../data/mockData";
import { Subject } from "./SubjectModal";

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  onAddAssignment: (assignment: Assignment) => void;
  onAddNote: (note: Note) => void;
  onAddReminder: (reminder: Reminder) => void;
  initialTab?: "assignment" | "note" | "reminder";
}

export default function QuickAddModal({
  isOpen,
  onClose,
  subjects,
  onAddAssignment,
  onAddNote,
  onAddReminder,
  initialTab = "assignment",
}: QuickAddModalProps) {
  const [activeTab, setActiveTab] = useState<"assignment" | "note" | "reminder">(initialTab);

  // Sync active tab if initialTab changes
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

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

  // Form states - Assignment
  const [aTitle, setATitle] = useState("");
  const [aSubject, setASubject] = useState("");
  const [aPriority, setAPriority] = useState("medium");
  const [aDue, setADue] = useState("");
  const [aProgress, setAProgress] = useState(0);

  // Form states - Note
  const [nTitle, setNTitle] = useState("");
  const [nSubject, setNSubject] = useState("");
  const [nContent, setNContent] = useState("");
  const [nTags, setNTags] = useState("");
  const [nPinned, setNPinned] = useState(false);
  const [nFav, setNFav] = useState(false);

  // Form states - Reminder
  const [rTitle, setRTitle] = useState("");
  const [rDesc, setRDesc] = useState("");
  const [rTime, setRTime] = useState("");
  const [rPriority, setRPriority] = useState("medium");
  const [rCategory, setRCategory] = useState("academic");
  const [rRecurring, setRRecurring] = useState(false);

  useEffect(() => {
    if (subjects.length > 0) {
      setASubject(subjects[0].code);
      setNSubject(subjects[0].code);
    }
  }, [subjects, isOpen]);

  if (!isOpen) return null;

  const handleAssignmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aTitle.trim() || !aDue || !aSubject) return;

    let formattedDue = aDue;
    try {
      const dateObj = new Date(aDue);
      if (!isNaN(dateObj.getTime())) {
        formattedDue = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      }
    } catch (_) {}

    const selectedSub = subjects.find(s => s.code === aSubject);

    onAddAssignment({
      id: Date.now(),
      title: aTitle,
      subject: aSubject,
      subjectName: selectedSub ? selectedSub.name : "Other",
      due: formattedDue,
      priority: aPriority,
      status: aProgress === 100 ? "completed" : aProgress > 0 ? "in-progress" : "not-started",
      progress: Number(aProgress),
    });

    setATitle("");
    setADue("");
    setAProgress(0);
    onClose();
  };

  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nTitle.trim() || !nContent.trim() || !nSubject) return;

    const formattedDate = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const tagArray = nTags
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    onAddNote({
      id: Date.now(),
      title: nTitle,
      subject: nSubject,
      content: nContent,
      date: formattedDate,
      tags: tagArray,
      pinned: nPinned,
      fav: nFav,
    });

    setNTitle("");
    setNContent("");
    setNTags("");
    setNPinned(false);
    setNFav(false);
    onClose();
  };

  const handleReminderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rTitle.trim() || !rTime) return;

    onAddReminder({
      id: Date.now(),
      title: rTitle,
      desc: rDesc,
      time: rTime,
      priority: rPriority,
      category: rCategory,
      done: false,
      recurring: rRecurring,
    });

    setRTitle("");
    setRDesc("");
    setRTime("");
    setRRecurring(false);
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
            <Plus size={18} className="text-indigo-500" />
            Quick Add
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-muted rounded-xl text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border bg-muted/20 px-4 pt-2">
          {[
            { id: "assignment", label: "Assignment", icon: <BookOpen size={14} /> },
            { id: "note", label: "Note", icon: <FileText size={14} /> },
            { id: "reminder", label: "Reminder", icon: <Bell size={14} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 rounded-t-lg transition-colors -mb-px ${
                activeTab === tab.id
                  ? "border-indigo-600 text-indigo-500 bg-card"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Forms Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {subjects.length === 0 && (activeTab === "assignment" || activeTab === "note") ? (
            <div className="text-center py-10 space-y-3">
              <p className="text-sm text-muted-foreground">
                No subjects are configured in your planner. Please add a subject first in the Attendance or Timetable tabs.
              </p>
            </div>
          ) : (
            <>
              {activeTab === "assignment" && (
                <form onSubmit={handleAssignmentSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Database Schema Design"
                      value={aTitle}
                      onChange={(e) => setATitle(e.target.value)}
                      className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Subject</label>
                      <select
                        value={aSubject}
                        onChange={(e) => setASubject(e.target.value)}
                        className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                      >
                        {subjects.map((s) => (
                          <option key={s.code} value={s.code}>
                            {s.code} - {s.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Priority</label>
                      <select
                        value={aPriority}
                        onChange={(e) => setAPriority(e.target.value)}
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
                      value={aDue}
                      onChange={(e) => setADue(e.target.value)}
                      className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                      <span>Current Progress</span>
                      <span>{aProgress}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={aProgress}
                      onChange={(e) => setAProgress(Number(e.target.value))}
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
                      Add Assignment
                    </button>
                  </div>
                </form>
              )}

              {activeTab === "note" && (
                <form onSubmit={handleNoteSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Tree Traversals Cheat Sheet"
                      value={nTitle}
                      onChange={(e) => setNTitle(e.target.value)}
                      className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Subject</label>
                    <select
                      value={nSubject}
                      onChange={(e) => setNSubject(e.target.value)}
                      className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    >
                      {subjects.map((s) => (
                        <option key={s.code} value={s.code}>
                          {s.code} - {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Content</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Start typing your study notes..."
                      value={nContent}
                      onChange={(e) => setNContent(e.target.value)}
                      className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Tags (comma-separated)</label>
                    <input
                      type="text"
                      placeholder="e.g., algorithms, cheatsheet"
                      value={nTags}
                      onChange={(e) => setNTags(e.target.value)}
                      className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    />
                  </div>

                  <div className="flex gap-4 pt-2">
                    <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={nPinned}
                        onChange={(e) => setNPinned(e.target.checked)}
                        className="rounded border-border text-indigo-600 focus:ring-indigo-500/40 w-4 h-4 bg-muted/50"
                      />
                      Pin Note
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={nFav}
                        onChange={(e) => setNFav(e.target.checked)}
                        className="rounded border-border text-indigo-600 focus:ring-indigo-500/40 w-4 h-4 bg-muted/50"
                      />
                      Mark as Favorite
                    </label>
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
                      Create Note
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

          {activeTab === "reminder" && (
            <form onSubmit={handleReminderSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Study group session"
                  value={rTitle}
                  onChange={(e) => setRTitle(e.target.value)}
                  className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Description</label>
                <textarea
                  rows={2}
                  placeholder="Extra context or details..."
                  value={rDesc}
                  onChange={(e) => setRDesc(e.target.value)}
                  className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Schedule / Time</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., 3:00 PM Today"
                    value={rTime}
                    onChange={(e) => setRTime(e.target.value)}
                    className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Category</label>
                  <select
                    value={rCategory}
                    onChange={(e) => setRCategory(e.target.value)}
                    className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  >
                    <option value="academic">Academic</option>
                    <option value="assignment">Assignment</option>
                    <option value="study">Study</option>
                    <option value="personal">Personal</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Priority</label>
                  <select
                    value={rPriority}
                    onChange={(e) => setRPriority(e.target.value)}
                    className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rRecurring}
                      onChange={(e) => setRRecurring(e.target.checked)}
                      className="rounded border-border text-indigo-600 focus:ring-indigo-500/40 w-4 h-4 bg-muted/50"
                    />
                    Recurring reminder
                  </label>
                </div>
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
                  Set Reminder
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
