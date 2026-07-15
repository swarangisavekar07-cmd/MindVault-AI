import React, { useState } from "react";
import { Plus, Search, Edit, Trash2, MapPin, Layers, GraduationCap, Award } from "lucide-react";
import { Subject } from "./SubjectModal";

interface SubjectsPageProps {
  subjects: Subject[];
  onOpenSubjectModal: (subject: Subject | null) => void;
  onDeleteSubject: (code: string) => void;
}

export default function SubjectsPage({
  subjects,
  onOpenSubjectModal,
  onDeleteSubject,
}: SubjectsPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("all");

  const filtered = subjects.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      s.code.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q) ||
      s.faculty.toLowerCase().includes(q) ||
      (s.classroom && s.classroom.toLowerCase().includes(q));

    const matchesSemester =
      semesterFilter === "all" || s.semester === semesterFilter;

    return matchesSearch && matchesSemester;
  });

  const uniqueSemesters = Array.from(
    new Set(subjects.map((s) => s.semester).filter(Boolean))
  ) as string[];

  return (
    <div className="p-6 space-y-6 max-w-[1400px] animate-fade-in font-[DM_Sans]">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold font-[Outfit] text-foreground">Subjects Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Configure and organize your academic courses</p>
        </div>
        <button
          onClick={() => onOpenSubjectModal(null)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl px-4 py-2.5 transition-colors shadow-sm active:scale-95"
        >
          <Plus size={14} /> Add New Subject
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <p className="text-2xl font-bold font-[Outfit] text-foreground">{subjects.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Total Subjects</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <p className="text-2xl font-bold font-[Outfit] text-foreground">
            {uniqueSemesters.length || 1}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Semesters Active</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <p className="text-2xl font-bold font-[Outfit] text-foreground">
            {subjects.filter((s) => (s.target || 75) >= 75).length}
          </p>
          <p className="text-xs text-muted-foreground mt-1">High-Target Subjects</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <p className="text-2xl font-bold font-[Outfit] text-foreground">
            {subjects.reduce((sum, s) => sum + s.total, 0)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Total Lectures Logged</p>
        </div>
      </div>

      {/* Control bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-card border border-border p-4 rounded-2xl shadow-sm">
        <div className="relative sm:col-span-2">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search subjects by code, name, professor, classroom..."
            className="w-full bg-muted/50 border border-border rounded-xl pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
        </div>

        <select
          value={semesterFilter}
          onChange={(e) => setSemesterFilter(e.target.value)}
          className="bg-muted/50 border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40 cursor-pointer"
        >
          <option value="all">All Semesters</option>
          {uniqueSemesters.map((sem) => (
            <option key={sem} value={sem}>
              {sem}
            </option>
          ))}
        </select>
      </div>

      {/* Grid List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-2xl bg-card">
          <GraduationCap className="mx-auto w-10 h-10 text-muted-foreground opacity-50 mb-3" />
          <h3 className="font-bold text-foreground">No Subjects Configured</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            You don't have any subjects configured for the selected semester. Register a subject to link assignments and schedules.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s) => {
            const pct = s.total > 0 ? Math.round((s.attended / s.total) * 100) : 100;
            const isWarning = pct < (s.target || 75);

            return (
              <div
                key={s.code}
                className="bg-card border border-border rounded-2xl p-5 flex flex-col justify-between hover:shadow-md transition-all duration-200 relative group"
                style={{ borderTopColor: s.color, borderTopWidth: "4px" }}
              >
                <div>
                  <div className="flex justify-between items-start mb-3 select-none">
                    <span className="text-[10px] font-bold text-muted-foreground px-2 py-0.5 bg-muted rounded">
                      {s.semester || "Semester 1"}
                    </span>
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onOpenSubjectModal(s)}
                        className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                        title="Edit Subject"
                      >
                        <Edit size={12} />
                      </button>
                      <button
                        onClick={() => onDeleteSubject(s.code)}
                        className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-red-500"
                        title="Delete Subject"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-foreground font-[Outfit] text-base leading-snug">
                    {s.name}
                  </h3>
                  <p className="text-xs font-semibold text-muted-foreground font-[Geist_Mono] mt-0.5">
                    {s.code}
                  </p>

                  <div className="space-y-1.5 mt-4 text-xs text-muted-foreground">
                    <p className="flex items-center gap-1.5">
                      <GraduationCap size={13} className="text-muted-foreground/60" />
                      Prof. {s.faculty}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <MapPin size={13} className="text-muted-foreground/60" />
                      {s.classroom || "No classroom set"}
                    </p>
                  </div>
                </div>

                <div className="border-t border-border/20 pt-4 mt-5">
                  <div className="flex justify-between items-center text-xs mb-2">
                    <span className="text-muted-foreground">Attendance</span>
                    <span
                      className={`font-bold ${isWarning ? "text-red-500" : "text-emerald-500"}`}
                    >
                      {pct}%
                    </span>
                  </div>

                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: isWarning ? "#EF4444" : s.color,
                      }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-muted-foreground mt-2">
                    <span>Target: {s.target || 75}%</span>
                    <span>
                      {s.attended} / {s.total} Lectures
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
