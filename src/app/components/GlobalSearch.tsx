import React, { useRef, useEffect } from "react";
import { BookOpen, FileText, Bell, Search, CornerDownRight } from "lucide-react";
import { Assignment, Note, Reminder, SUBJECT_COLORS } from "../data/mockData";

interface GlobalSearchProps {
  query: string;
  isOpen: boolean;
  onClose: () => void;
  assignments: Assignment[];
  notes: Note[];
  reminders: Reminder[];
  onNavigate: (page: any, itemId?: number) => void;
}

export default function GlobalSearch({
  query,
  isOpen,
  onClose,
  assignments,
  notes,
  reminders,
  onNavigate,
}: GlobalSearchProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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

  if (!isOpen || !query.trim()) return null;

  const normalizedQuery = query.toLowerCase();

  const filteredAssignments = assignments.filter(
    (a) =>
      a.title.toLowerCase().includes(normalizedQuery) ||
      a.subject.toLowerCase().includes(normalizedQuery) ||
      a.subjectName.toLowerCase().includes(normalizedQuery)
  );

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(normalizedQuery) ||
      n.subject.toLowerCase().includes(normalizedQuery) ||
      n.content.toLowerCase().includes(normalizedQuery) ||
      n.tags.some((t) => t.toLowerCase().includes(normalizedQuery))
  );

  const filteredReminders = reminders.filter(
    (r) =>
      r.title.toLowerCase().includes(normalizedQuery) ||
      (r.desc && r.desc.toLowerCase().includes(normalizedQuery)) ||
      r.category.toLowerCase().includes(normalizedQuery)
  );

  const totalResults = filteredAssignments.length + filteredNotes.length + filteredReminders.length;

  return (
    <div
      ref={dropdownRef}
      className="absolute top-11 left-0 w-full max-w-sm sm:max-w-md bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col max-h-[380px] animate-fade-in"
    >
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/20 text-xs font-semibold text-muted-foreground">
        <span>Search Results for "{query}"</span>
        <span>{totalResults} matches</span>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-border/40 max-h-[320px] scrollbar-hide">
        {totalResults > 0 ? (
          <>
            {/* Assignments Category */}
            {filteredAssignments.length > 0 && (
              <div className="p-2 space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 py-1 flex items-center gap-1">
                  <BookOpen size={10} /> Assignments
                </p>
                {filteredAssignments.map((a) => (
                  <button
                    key={`a-${a.id}`}
                    onClick={() => {
                      onNavigate("assignments", a.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between gap-3 px-2 py-2 hover:bg-muted/50 rounded-xl transition-colors text-left"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: SUBJECT_COLORS[a.subject] }} />
                      <span className="text-xs text-foreground font-medium truncate">{a.title}</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium uppercase">
                        {a.subject}
                      </span>
                      <CornerDownRight size={10} className="text-muted-foreground/40" />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Notes Category */}
            {filteredNotes.length > 0 && (
              <div className="p-2 space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 py-1 flex items-center gap-1">
                  <FileText size={10} /> Notes
                </p>
                {filteredNotes.map((n) => (
                  <button
                    key={`n-${n.id}`}
                    onClick={() => {
                      onNavigate("notes", n.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between gap-3 px-2 py-2 hover:bg-muted/50 rounded-xl transition-colors text-left"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: SUBJECT_COLORS[n.subject] || "#94a3b8" }} />
                      <div className="min-w-0">
                        <p className="text-xs text-foreground font-medium truncate">{n.title}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{n.content}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium uppercase">
                        {n.subject}
                      </span>
                      <CornerDownRight size={10} className="text-muted-foreground/40" />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Reminders Category */}
            {filteredReminders.length > 0 && (
              <div className="p-2 space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 py-1 flex items-center gap-1">
                  <Bell size={10} /> Reminders
                </p>
                {filteredReminders.map((r) => (
                  <button
                    key={`r-${r.id}`}
                    onClick={() => {
                      onNavigate("reminders", r.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between gap-3 px-2 py-2 hover:bg-muted/50 rounded-xl transition-colors text-left"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${r.done ? "bg-emerald-500" : "bg-indigo-500"}`} />
                      <span className="text-xs text-foreground font-medium truncate">{r.title}</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-[10px] text-muted-foreground">{r.time}</span>
                      <CornerDownRight size={10} className="text-muted-foreground/40" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Search size={24} className="text-muted-foreground/30 mb-2 animate-pulse" />
            <p className="text-xs text-muted-foreground">No matches found for "{query}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
