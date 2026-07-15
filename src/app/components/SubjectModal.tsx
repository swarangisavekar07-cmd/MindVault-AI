import React, { useState, useEffect } from "react";
import { X, Plus, Edit3, Trash2 } from "lucide-react";

export interface Subject {
  code: string; // e.g. CS301 (unique identifier)
  name: string;
  color: string;
  faculty: string;
  attended: number;
  total: number;
  target?: number; // e.g. 75
  classroom?: string;
  semester?: string;
}

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: Subject | null; // Null means Add Mode, otherwise Edit Mode
  existingSubjects: Subject[];
  onSave: (subject: Subject) => void;
  onDelete?: (code: string) => void;
}

const PRESET_COLORS = ["#4F46E5", "#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444", "#EC4899", "#14B8A6"];

export default function SubjectModal({
  isOpen,
  onClose,
  subject,
  existingSubjects,
  onSave,
  onDelete,
}: SubjectModalProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [faculty, setFaculty] = useState("");
  const [color, setColor] = useState("#4F46E5");
  const [target, setTarget] = useState(75);
  const [attended, setAttended] = useState(0);
  const [total, setTotal] = useState(0);
  const [classroom, setClassroom] = useState("");
  const [semester, setSemester] = useState("Semester 1");

  const [error, setError] = useState("");

  // Sync inputs with edit subject or defaults
  useEffect(() => {
    if (subject) {
      setName(subject.name);
      setCode(subject.code);
      setFaculty(subject.faculty);
      setColor(subject.color);
      setTarget(subject.target || 75);
      setAttended(subject.attended);
      setTotal(subject.total);
      setClassroom(subject.classroom || "");
      setSemester(subject.semester || "Semester 1");
    } else {
      setName("");
      setCode("");
      setFaculty("");
      setColor("#4F46E5");
      setTarget(75);
      setAttended(0);
      setTotal(0);
      setClassroom("");
      setSemester("Semester 1");
    }
    setError("");
  }, [subject, isOpen]);

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

    const trimmedCode = code.trim().toUpperCase();
    const trimmedName = name.trim();
    const trimmedFaculty = faculty.trim();
    const trimmedClassroom = classroom.trim();
    const trimmedSemester = semester.trim();

    if (!trimmedName || !trimmedCode || !trimmedFaculty || !trimmedClassroom || !trimmedSemester) {
      setError("Please fill out all fields.");
      return;
    }

    // Unique code check (only in Add Mode)
    if (!subject) {
      const exists = existingSubjects.some(s => s.code.toUpperCase() === trimmedCode);
      if (exists) {
        setError(`A subject with code "${trimmedCode}" already exists.`);
        return;
      }
    }

    // Number validation
    if (attended < 0 || total < 0) {
      setError("Classes cannot be negative.");
      return;
    }

    if (attended > total) {
      setError("Attended classes cannot exceed total classes.");
      return;
    }

    onSave({
      code: subject ? subject.code : trimmedCode, // Code is immutable in edit mode to preserve references
      name: trimmedName,
      color,
      faculty: trimmedFaculty,
      attended: Number(attended),
      total: Number(total),
      target: Number(target),
      classroom: trimmedClassroom,
      semester: trimmedSemester,
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
            {subject ? <Edit3 size={18} className="text-indigo-500" /> : <Plus size={18} className="text-indigo-500" />}
            {subject ? "Edit Subject" : "Add Subject"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-muted rounded-xl text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto font-[DM_Sans]">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-500/20 rounded-xl text-red-500 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Subject Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Data Structures"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Subject Code</label>
              <input
                type="text"
                required
                disabled={!!subject}
                placeholder="e.g. CS301"
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40 uppercase disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Faculty Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Dr. Johnson"
                value={faculty}
                onChange={e => setFaculty(e.target.value)}
                className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Classroom</label>
              <input
                type="text"
                required
                placeholder="e.g. Hall B-102"
                value={classroom}
                onChange={e => setClassroom(e.target.value)}
                className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Semester</label>
            <select
              value={semester}
              onChange={e => setSemester(e.target.value)}
              className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40 cursor-pointer"
            >
              <option value="Semester 1">Semester 1</option>
              <option value="Semester 2">Semester 2</option>
              <option value="Semester 3">Semester 3</option>
              <option value="Semester 4">Semester 4</option>
              <option value="Semester 5">Semester 5</option>
              <option value="Semester 6">Semester 6</option>
              <option value="Semester 7">Semester 7</option>
              <option value="Semester 8">Semester 8</option>
            </select>
          </div>

          {/* Color Presets */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Subject Color</label>
            <div className="flex gap-2.5 flex-wrap">
              {PRESET_COLORS.map(c => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full border-2 hover:scale-110 active:scale-95 transition-all ${
                    color === c ? "border-foreground scale-105" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Target Attendance Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-muted-foreground">
              <span>Target Attendance Minimum</span>
              <span>{target}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="100"
              value={target}
              onChange={e => setTarget(Number(e.target.value))}
              className="w-full accent-indigo-600 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Attendance Stats */}
          <div className="grid grid-cols-2 gap-4 border-t border-border/40 pt-4 mt-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Attended Classes</label>
              <input
                type="number"
                min="0"
                value={attended}
                onChange={e => setAttended(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Total Classes</label>
              <input
                type="number"
                min="0"
                value={total}
                onChange={e => setTotal(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-border flex justify-end gap-3">
            {subject && onDelete && (
              <button
                type="button"
                onClick={() => {
                  onDelete(subject.code);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-4 py-2 border border-red-200 dark:border-red-950/20 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl text-xs font-semibold transition-colors mr-auto"
              >
                <Trash2 size={13} /> Delete Subject
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
              Save Subject
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
