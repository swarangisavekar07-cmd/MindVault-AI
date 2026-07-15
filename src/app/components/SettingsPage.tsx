import React, { useState, useEffect } from "react";
import { Sun, Moon, Palette, Shield, User, Lock, Award, Check, Loader2 } from "lucide-react";

interface SettingsPageProps {
  isDark: boolean;
  toggleDark: () => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
  user: any;
  onUpdateProfile: (name: string, major: string, year: string) => Promise<void>;
  onChangePassword: (currentPass: string, newPass: string) => Promise<void>;
}

export default function SettingsPage({
  isDark,
  toggleDark,
  accentColor,
  setAccentColor,
  user,
  onUpdateProfile,
  onChangePassword,
}: SettingsPageProps) {
  const presetAccents = [
    { name: "Indigo", value: "#4F46E5" },
    { name: "Blue", value: "#3B82F6" },
    { name: "Violet", value: "#8B5CF6" },
    { name: "Emerald", value: "#10B981" },
    { name: "Amber", value: "#F59E0B" },
    { name: "Rose", value: "#EF4444" },
  ];

  // Profile Form State
  const [profileName, setProfileName] = useState(user?.name || "");
  const [profileMajor, setProfileMajor] = useState(user?.major || "Computer Science");
  const [profileYear, setProfileYear] = useState(user?.year || "Freshman");
  const [profileLoading, setProfileLoading] = useState(false);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState("");

  useEffect(() => {
    if (user) {
      setProfileName(user.name);
      setProfileMajor(user.major);
      setProfileYear(user.year);
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName) return;
    setProfileLoading(true);
    try {
      await onUpdateProfile(profileName, profileMajor, profileYear);
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    if (newPassword !== confirmPassword) {
      setPassError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setPassError("New password must be at least 6 characters long.");
      return;
    }
    setPassError("");
    setPassLoading(true);
    try {
      await onChangePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPassError(err.response?.data?.error || "Password change failed.");
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[800px] mx-auto animate-fade-in font-[DM_Sans] pb-24">
      {/* Title */}
      <div className="select-none">
        <h2 className="text-lg font-bold font-[Outfit] text-foreground">App Settings</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Customize your student dashboard and account settings</p>
      </div>

      {/* Profile settings */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold font-[Outfit] text-foreground flex items-center gap-2 select-none border-b border-border/40 pb-2">
          <User size={16} className="text-indigo-500" /> Account Profile
        </h3>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Full Name
              </label>
              <input
                type="text"
                required
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full px-4 py-2.5 bg-muted/40 border border-border focus:border-indigo-500 rounded-xl text-foreground text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Email Address (Static)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ""}
                className="w-full px-4 py-2.5 bg-muted/20 border border-border rounded-xl text-muted-foreground text-sm cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Major
              </label>
              <select
                value={profileMajor}
                onChange={(e) => setProfileMajor(e.target.value)}
                className="w-full px-4 py-2.5 bg-muted/40 border border-border focus:border-indigo-500 rounded-xl text-foreground text-sm focus:outline-none cursor-pointer"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Engineering">Engineering</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Liberal Arts">Liberal Arts</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Academic Year
              </label>
              <select
                value={profileYear}
                onChange={(e) => setProfileYear(e.target.value)}
                className="w-full px-4 py-2.5 bg-muted/40 border border-border focus:border-indigo-500 rounded-xl text-foreground text-sm focus:outline-none cursor-pointer"
              >
                <option value="Freshman">Freshman</option>
                <option value="Sophomore">Sophomore</option>
                <option value="Junior">Junior</option>
                <option value="Senior">Senior</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={profileLoading}
              style={{ backgroundColor: accentColor }}
              className="text-white font-medium py-2 px-6 rounded-xl hover:brightness-110 active:brightness-95 transition-all text-xs flex items-center gap-1.5 disabled:opacity-60"
            >
              {profileLoading ? <Loader2 size={13} className="animate-spin" /> : null}
              Save Profile
            </button>
          </div>
        </form>
      </div>

      {/* Security - Change Password */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold font-[Outfit] text-foreground flex items-center gap-2 select-none border-b border-border/40 pb-2">
          <Lock size={16} className="text-indigo-500" /> Change Password
        </h3>
        {passError && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs leading-relaxed">
            {passError}
          </div>
        )}
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-muted/40 border border-border focus:border-indigo-500 rounded-xl text-foreground text-sm focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="w-full px-4 py-2.5 bg-muted/40 border border-border focus:border-indigo-500 rounded-xl text-foreground text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-muted/40 border border-border focus:border-indigo-500 rounded-xl text-foreground text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={passLoading}
              style={{ backgroundColor: accentColor }}
              className="text-white font-medium py-2 px-6 rounded-xl hover:brightness-110 active:brightness-95 transition-all text-xs flex items-center gap-1.5 disabled:opacity-60"
            >
              {passLoading ? <Loader2 size={13} className="animate-spin" /> : null}
              Update Password
            </button>
          </div>
        </form>
      </div>

      {/* Theme Settings (Dark mode & Accent color) */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-5">
        <h3 className="text-sm font-bold font-[Outfit] text-foreground flex items-center gap-2 select-none border-b border-border/40 pb-2">
          <Palette size={16} className="text-indigo-500" /> Theme & Appearance
        </h3>

        {/* Dark Mode toggle */}
        <div className="flex items-center justify-between select-none">
          <div>
            <p className="text-sm font-semibold text-foreground">Dark Theme</p>
            <p className="text-xs text-muted-foreground mt-0.5">Use dark mode to reduce eye strain in low light</p>
          </div>
          <button
            onClick={toggleDark}
            className={`w-14 h-8 rounded-full p-1 transition-all duration-300 ${
              isDark ? "bg-indigo-600" : "bg-muted border border-border"
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white shadow flex items-center justify-center transition-transform duration-300 ${
                isDark ? "translate-x-6" : "translate-x-0"
              }`}
            >
              {isDark ? (
                <Moon size={12} className="text-indigo-600" />
              ) : (
                <Sun size={12} className="text-amber-500" />
              )}
            </div>
          </button>
        </div>

        {/* Accent Color picker */}
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold text-foreground select-none">Accent Theme Color</p>
            <p className="text-xs text-muted-foreground mt-0.5 select-none">Choose primary color accent for icons, highlight cards, and buttons</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {presetAccents.map((accent) => (
              <button
                key={accent.value}
                onClick={() => setAccentColor(accent.value)}
                className="w-10 h-10 rounded-xl relative hover:scale-105 active:scale-95 transition-all flex items-center justify-center shadow-sm"
                style={{ backgroundColor: accent.value }}
                title={accent.name}
              >
                {accentColor === accent.value && (
                  <Check size={16} className="text-white font-extrabold animate-scale-up" />
                )}
              </button>
            ))}
            
            {/* Custom hex color input */}
            <div className="flex items-center gap-1.5 border border-border bg-muted/20 px-2 py-1 rounded-xl h-10 select-none">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="w-7 h-7 rounded-lg border-0 cursor-pointer overflow-hidden bg-transparent"
              />
              <span className="text-xs font-semibold font-[Geist_Mono] uppercase text-foreground">
                {accentColor}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences Section (sliders & mocks) */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-5">
        <h3 className="text-sm font-bold font-[Outfit] text-foreground flex items-center gap-2 select-none border-b border-border/40 pb-2">
          <Award size={16} className="text-indigo-500" /> Academic Preferences
        </h3>

        {/* Target Attendance */}
        <div className="space-y-2">
          <div className="flex justify-between items-center select-none">
            <div>
              <p className="text-sm font-semibold text-foreground">Target Attendance Rate</p>
              <p className="text-xs text-muted-foreground mt-0.5">Define target attendance boundary before warnings trigger</p>
            </div>
            <span className="text-sm font-bold text-foreground bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-500/10 px-2.5 py-1 rounded-lg">
              75%
            </span>
          </div>
          <div className="w-full h-1.5 bg-muted rounded-full relative">
            <div className="absolute left-0 top-0 h-full bg-indigo-600 rounded-full" style={{ width: "75%" }} />
            <div className="absolute left-[75%] top-1/2 -translate-y-1/2 w-4.5 h-4.5 bg-white border border-indigo-600 rounded-full shadow cursor-not-allowed" />
          </div>
        </div>

        {/* Mock triggers */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between select-none">
            <div>
              <p className="text-sm font-semibold text-foreground">Automated Study Plan</p>
              <p className="text-xs text-muted-foreground mt-0.5">Let MindVault AI generate custom weekly schedules</p>
            </div>
            <div className="w-11 h-6 rounded-full bg-indigo-600 p-0.5 cursor-pointer">
              <div className="w-5 h-5 rounded-full bg-white shadow translate-x-5" />
            </div>
          </div>

          <div className="flex items-center justify-between select-none">
            <div>
              <p className="text-sm font-semibold text-foreground">Weekly Productivity Report</p>
              <p className="text-xs text-muted-foreground mt-0.5">Receive email summarizing hours studied and completion rates</p>
            </div>
            <div className="w-11 h-6 rounded-full bg-muted border border-border p-0.5 cursor-pointer">
              <div className="w-5 h-5 rounded-full bg-white shadow translate-x-0" />
            </div>
          </div>
        </div>
      </div>

      {/* Safety & System metadata */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold font-[Outfit] text-foreground flex items-center gap-2 select-none border-b border-border/40 pb-2">
          <Shield size={16} className="text-indigo-500" /> Security & Version
        </h3>
        <div className="flex justify-between items-center text-xs select-none">
          <span className="text-muted-foreground">Version</span>
          <span className="font-semibold text-foreground font-[Geist_Mono]">v2.0.0-fullstack</span>
        </div>
        <div className="flex justify-between items-center text-xs select-none">
          <span className="text-muted-foreground">Data Storage</span>
          <span className="font-semibold text-emerald-500">PostgreSQL Cloud Database Active</span>
        </div>
      </div>
    </div>
  );
}
