import React, { useState } from "react";
import { User, Award, BookOpen, Clock, FileText, CheckCircle2, GraduationCap, Calendar, Mail, Edit3, Save, Plus, X, Lock, Check } from "lucide-react";
import { Assignment, Note, Reminder } from "../data/mockData";
import { Subject } from "../App";

import { updateUserProfile } from "../services/apiService";

interface ProfilePageProps {
  assignments: Assignment[];
  notes: Note[];
  reminders: Reminder[];
  subjects: Subject[];
  user: any;
  userKey?: string;
  onUpdateProfile?: (data: { name?: string; major?: string; year?: string; bio?: string; interests?: string }) => Promise<void>;
}

export default function ProfilePage({
  assignments,
  notes,
  reminders,
  subjects,
  user,
  userKey = "default",
  onUpdateProfile,
}: ProfilePageProps) {
  // Bio Persistence
  const [bio, setBio] = useState<string>(user?.bio || "Tell everyone a little about yourself...");
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [tempBio, setTempBio] = useState(bio);

  // Sync state if user prop updates
  React.useEffect(() => {
    if (user?.bio) setBio(user.bio);
    if (user?.interests) {
      try {
        setInterests(JSON.parse(user.interests));
      } catch (_) {
        setInterests(user.interests.split(","));
      }
    }
  }, [user]);

  // Focus Areas / Interests Persistence
  const [interests, setInterests] = useState<string[]>(() => {
    if (user?.interests) {
      try {
        return JSON.parse(user.interests);
      } catch (_) {
        return user.interests.split(",");
      }
    }
    return [];
  });
  const [newInterestInput, setNewInterestInput] = useState("");
  const [isAddingInterest, setIsAddingInterest] = useState(false);

  const handleSaveBio = async () => {
    const trimmed = tempBio.trim() || "Tell everyone a little about yourself...";
    setBio(trimmed);
    setIsEditingBio(false);
    try {
      if (onUpdateProfile) {
        await onUpdateProfile({ bio: trimmed });
      } else {
        await updateUserProfile({ bio: trimmed });
      }
    } catch (err) {
      console.warn("Failed to save bio to backend:", err);
    }
  };

  const handleAddInterest = async () => {
    const val = newInterestInput.trim();
    if (!val || interests.includes(val)) return;
    const updated = [...interests, val];
    setInterests(updated);
    setNewInterestInput("");
    setIsAddingInterest(false);
    try {
      if (onUpdateProfile) {
        await onUpdateProfile({ interests: JSON.stringify(updated) });
      } else {
        await updateUserProfile({ interests: JSON.stringify(updated) });
      }
    } catch (err) {
      console.warn("Failed to save interest to backend:", err);
    }
  };

  const handleRemoveInterest = async (target: string) => {
    const updated = interests.filter((i) => i !== target);
    setInterests(updated);
    try {
      if (onUpdateProfile) {
        await onUpdateProfile({ interests: JSON.stringify(updated) });
      } else {
        await updateUserProfile({ interests: JSON.stringify(updated) });
      }
    } catch (err) {
      console.warn("Failed to remove interest on backend:", err);
    }
  };

  // Performance computations
  const completedAssignments = assignments.filter((a) => a.status === "completed").length;
  const pendingAssignments = assignments.filter((a) => a.status !== "completed").length;
  const completedReminders = reminders.filter((r) => r.done).length;
  const pendingReminders = reminders.filter((r) => !r.done).length;
  const overallAttendance = subjects.length > 0
    ? Math.round(subjects.reduce((s, a) => s + (a.total > 0 ? a.attended / a.total * 100 : 100), 0) / subjects.length)
    : 0;

  const joinDate = user?.createdAt
    ? `Member since ${new Date(user.createdAt).toLocaleDateString(undefined, { month: "short", year: "numeric" })}`
    : "Member since 2026";

  // Dynamic Achievements
  const achievements = [
    {
      id: "first_subject",
      title: "First Subject",
      desc: "Created your first subject in MindVault",
      icon: "🎓",
      unlocked: subjects.length > 0,
      badge: subjects.length > 0 ? "Unlocked" : "Locked",
    },
    {
      id: "task_master",
      title: "Task Master",
      desc: "Completed your first academic assignment",
      icon: "✅",
      unlocked: completedAssignments > 0,
      badge: completedAssignments > 0 ? "Unlocked" : "Locked",
    },
    {
      id: "note_scholar",
      title: "Note Scholar",
      desc: "Created 5 or more study notes",
      icon: "📝",
      unlocked: notes.length >= 5,
      badge: notes.length >= 5 ? "Unlocked" : `${notes.length}/5 Notes`,
    },
    {
      id: "attendance_champ",
      title: "Attendance Star",
      desc: "Maintained 80%+ overall subject attendance",
      icon: "🌟",
      unlocked: subjects.length > 0 && overallAttendance >= 80,
      badge: subjects.length > 0 ? `${overallAttendance}%` : "Locked",
    },
  ];

  // Combine subject names with user interests for tags display
  const allFocusAreas = [
    ...subjects.map((s) => s.name),
    ...interests.filter((i) => !subjects.some((s) => s.name.toLowerCase() === i.toLowerCase())),
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1000px] mx-auto animate-fade-in font-[DM_Sans]">
      {/* Cover Header */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm relative">
        <div className="h-32 bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]" />
          <div className="absolute right-[-40px] top-[-40px] w-48 h-48 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute left-[20%] bottom-[-50px] w-64 h-64 rounded-full bg-purple-500/10 blur-3xl" />
        </div>

        {/* Profile Card Header */}
        <div className="px-6 pb-6 pt-0 relative flex flex-col sm:flex-row items-center sm:items-end gap-5 -mt-12 sm:-mt-10 select-none">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-extrabold flex items-center justify-center text-4xl border-4 border-card shadow-lg flex-shrink-0 font-[Outfit]">
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>

          <div className="text-center sm:text-left flex-1 min-w-0 pb-1">
            <h2 className="text-xl font-bold font-[Outfit] text-foreground flex items-center justify-center sm:justify-start gap-2">
              {user?.name || "Student User"}{" "}
              <span className="text-xs bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-500/10 px-2 py-0.5 rounded-full font-bold">
                Student
              </span>
            </h2>
            {(user?.collegeName || user?.major) && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center sm:justify-start gap-1 font-semibold">
                <GraduationCap size={13} className="text-indigo-500" /> {user?.collegeName || user?.major}
              </p>
            )}
            <div className="flex items-center justify-center sm:justify-start gap-4 mt-2 text-[11px] text-muted-foreground font-semibold flex-wrap">
              <span className="flex items-center gap-1"><Calendar size={11} /> {joinDate}</span>
              {user?.email && <span className="flex items-center gap-1"><Mail size={11} /> {user.email}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Bio + Academic Performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Bio Card */}
        <div className="md:col-span-2 bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center select-none">
            <h3 className="text-sm font-bold font-[Outfit] text-foreground">About Me</h3>
            {!isEditingBio ? (
              <button
                onClick={() => { setTempBio(bio); setIsEditingBio(true); }}
                className="text-xs text-indigo-500 hover:text-indigo-600 font-semibold flex items-center gap-1 transition-colors"
              >
                <Edit3 size={12} /> Edit Bio
              </button>
            ) : (
              <button
                onClick={handleSaveBio}
                className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1 rounded-lg flex items-center gap-1 transition-all shadow-sm"
              >
                <Save size={12} /> Save
              </button>
            )}
          </div>

          {isEditingBio ? (
            <textarea
              value={tempBio}
              onChange={(e) => setTempBio(e.target.value)}
              placeholder="Tell everyone a little about yourself..."
              rows={3}
              className="w-full bg-background border border-border rounded-xl p-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none font-sans"
            />
          ) : (
            <p className="text-xs text-muted-foreground leading-relaxed italic">
              "{bio}"
            </p>
          )}

          {/* Interests & Subjects Tags */}
          <div className="pt-2 select-none border-t border-border/40">
            <div className="flex justify-between items-center mb-2.5">
              <h4 className="text-[11px] font-bold text-foreground uppercase tracking-wider">
                Subjects & Focus Areas
              </h4>
              {!isAddingInterest && (
                <button
                  onClick={() => setIsAddingInterest(true)}
                  className="text-[10px] text-indigo-500 hover:text-indigo-600 font-bold flex items-center gap-1"
                >
                  <Plus size={11} /> Add Interest
                </button>
              )}
            </div>

            {isAddingInterest && (
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="text"
                  value={newInterestInput}
                  onChange={(e) => setNewInterestInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddInterest()}
                  placeholder="e.g. History, Python, Organic Chemistry"
                  className="bg-background border border-border rounded-lg px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                  autoFocus
                />
                <button onClick={handleAddInterest} className="p-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700">
                  <Check size={12} />
                </button>
                <button onClick={() => setIsAddingInterest(false)} className="p-1.5 bg-muted text-muted-foreground rounded-lg text-xs font-bold hover:text-foreground">
                  <X size={12} />
                </button>
              </div>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              {allFocusAreas.length > 0 ? (
                allFocusAreas.map((focus) => {
                  const isUserInterest = interests.includes(focus);
                  return (
                    <span
                      key={focus}
                      className="text-[10px] bg-muted px-2.5 py-1 rounded-full text-foreground border border-border/80 font-medium flex items-center gap-1.5 group"
                    >
                      {focus}
                      {isUserInterest && (
                        <button
                          onClick={() => handleRemoveInterest(focus)}
                          className="text-muted-foreground hover:text-red-500 transition-colors"
                        >
                          <X size={10} />
                        </button>
                      )}
                    </span>
                  );
                })
              ) : (
                <span className="text-xs text-muted-foreground italic">No focus areas added yet. Create subjects or add custom interests above.</span>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Academic Performance */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col justify-between select-none">
          <h3 className="text-sm font-bold font-[Outfit] text-foreground border-b border-border/40 pb-2 mb-3">
            Academic Performance
          </h3>
          <div className="space-y-3 flex-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5"><FileText size={12} /> Total Study Notes</span>
              <span className="font-bold text-foreground">{notes.length}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5"><BookOpen size={12} /> Assignments Completed</span>
              <span className="font-bold text-emerald-500">{completedAssignments}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5"><Clock size={12} /> Pending Tasks</span>
              <span className="font-bold text-amber-500">{pendingAssignments + pendingReminders}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5"><CheckCircle2 size={12} /> Attendance Average</span>
              <span className="font-bold text-indigo-500">{subjects.length > 0 ? `${overallAttendance}%` : "N/A"}</span>
            </div>
            <div className="flex justify-between items-center text-xs pt-1 border-t border-border/30">
              <span className="text-muted-foreground flex items-center gap-1.5"><GraduationCap size={12} /> Enrolled Subjects</span>
              <span className="font-bold text-purple-500">{subjects.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Achievements Panel */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4 select-none">
        <h3 className="text-sm font-bold font-[Outfit] text-foreground border-b border-border/40 pb-2 flex items-center gap-2">
          <Award size={16} className="text-indigo-500" /> Academic Achievements
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-4 border rounded-xl flex items-start gap-3 transition-all duration-300 ${
                ach.unlocked
                  ? "bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border-indigo-500/30 text-foreground"
                  : "bg-muted/10 border-border/60 opacity-60"
              }`}
            >
              <div className="text-xl p-2 bg-muted rounded-lg flex-shrink-0">{ach.icon}</div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-foreground truncate">{ach.title}</h4>
                  {ach.unlocked ? (
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-1.5 py-0.2 rounded-full font-bold">✓</span>
                  ) : (
                    <span className="text-[9px] bg-muted text-muted-foreground px-1.5 py-0.2 rounded-full font-semibold flex items-center gap-0.5"><Lock size={8} /></span>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{ach.desc}</p>
                <div className="mt-2 text-[9px] font-bold text-indigo-500">{ach.badge}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
