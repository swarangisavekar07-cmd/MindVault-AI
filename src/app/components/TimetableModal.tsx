import React, { useState, useEffect } from "react";
import { X, Plus, Edit3, Trash2 } from "lucide-react";
import { Subject } from "./SubjectModal";

export interface TimetableClass {
  id: string; // unique ID
  day: string; // Monday, Tuesday, etc.
  startTime: string; // e.g. "08:30"
  endTime: string; // e.g. "10:00"
  subjectCode: string; // matches Subject.code
  room: string;
}

interface TimetableModalProps {
  isOpen: boolean;
  onClose: () => void;
  timetableClass: TimetableClass | null; // Null means Add Mode, otherwise Edit Mode
  subjects: Subject[];
  onSave: (classSlot: TimetableClass) => void;
  onDelete?: (id: string) => void;
  onOpenAddSubject: () => void;
}

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function TimetableModal({
  isOpen,
  onClose,
  timetableClass,
  subjects,
  onSave,
  onDelete,
  onOpenAddSubject,
}: TimetableModalProps) {
  const [day, setDay] = useState("Monday");
  const [subjectCode, setSubjectCode] = useState("");
  const [startTime, setStartTime] = useState("08:30");
  const [endTime, setEndTime] = useState("10:00");
  const [room, setRoom] = useState("");

  const [error, setError] = useState("");

  useEffect(() => {
    if (timetableClass) {
      setDay(timetableClass.day);
      setSubjectCode(timetableClass.subjectCode);
      setStartTime(timetableClass.startTime);
      setEndTime(timetableClass.endTime);
      setRoom(timetableClass.room);
    } else {
      setDay("Monday");
      setSubjectCode(subjects.length > 0 ? subjects[0].code : "");
      setStartTime("08:30");
      setEndTime("10:00");
      setRoom("");
    }
    setError("");
  }, [timetableClass, isOpen, subjects]);

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

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!subjectCode) {
      setError("Please select a subject.");
      return;
    }

    if (!room.trim()) {
      setError("Please enter a classroom.");
      return;
    }

    // Time validation
    if (startTime >= endTime) {
      setError("Start Time must be earlier than End Time.");
      return;
    }

    onSave({
      id: timetableClass ? timetableClass.id : Date.now().toString(),
      day,
      startTime,
      endTime,
      subjectCode,
      room: room.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-bold font-[Outfit] text-foreground flex items-center gap-2">
            {timetableClass ? <Edit3 size={18} className="text-indigo-500" /> : <Plus size={18} className="text-indigo-500" />}
            {timetableClass ? "Edit Class Slot" : "Add Class Slot"}
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
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-500/20 rounded-xl text-red-500 text-xs font-medium">
              {error}
            </div>
          )}

          {subjects.length === 0 ? (
            <div className="text-center py-6 space-y-3">
              <p className="text-xs text-muted-foreground">
                No subjects exist in your store yet. You must create a subject first before adding classes.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAddSubject();
                }}
                className="text-xs font-semibold text-indigo-500 hover:text-indigo-600 flex items-center gap-1.5 mx-auto"
              >
                <Plus size={14} /> Create Subject
              </button>
            </div>
          ) : (
            <>
              {/* Day selection */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Day of the Week</label>
                <select
                  value={day}
                  onChange={e => setDay(e.target.value)}
                  className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                >
                  {DAYS_OF_WEEK.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Subject Code */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-muted-foreground">Subject Course</label>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAddSubject();
                    }}
                    className="text-[10px] text-indigo-500 hover:text-indigo-600 font-semibold"
                  >
                    + Manage Subjects
                  </button>
                </div>
                <select
                  value={subjectCode}
                  onChange={e => setSubjectCode(e.target.value)}
                  className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                >
                  {subjects.map(s => (
                    <option key={s.code} value={s.code}>
                      {s.code} - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start & End Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Start Time</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">End Time</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>
              </div>

              {/* Classroom */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Classroom / Location</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lab 204"
                  value={room}
                  onChange={e => setRoom(e.target.value)}
                  className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>

              {/* Actions row */}
              <div className="pt-4 border-t border-border flex justify-end gap-3">
                {timetableClass && onDelete && (
                  <button
                    type="button"
                    onClick={() => {
                      onDelete(timetableClass.id);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 border border-red-200 dark:border-red-950/20 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl text-xs font-semibold transition-colors mr-auto"
                  >
                    <Trash2 size={13} /> Delete Class
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-border hover:bg-muted text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                >
                  Save Class
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
