import React, { useState } from "react";
import { LogIn, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

interface LoginScreenProps {
  onLogin: (email: string, password: string) => Promise<any>;
  onSwitchToRegister: () => void;
  accentColor: string;
  triggerToast: (msg: string, type: "success" | "error" | "info") => void;
}

export default function LoginScreen({
  onLogin,
  onSwitchToRegister,
  accentColor,
  triggerToast,
}: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const loggedInUser = await onLogin(email, password);
      triggerToast(`Welcome back, ${loggedInUser.name}!`, "success");
    } catch (err: any) {
      const errMsg = err.message || "Authentication failed. Please try again.";
      setError(errMsg);
      triggerToast(errMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 relative overflow-hidden select-none">
      {/* Background glowing blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-indigo-600/10 blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-violet-600/10 blur-[128px] pointer-events-none" />

      {/* Login Card */}
      <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 hover:border-slate-700/60 transition-all duration-300">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3.5 bg-indigo-500/10 text-indigo-400 rounded-2xl mb-4 border border-indigo-500/20">
            <LogIn className="w-6 h-6 animate-pulse" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent font-[Outfit]">
            MindVault AI
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Secure login to your academic OS
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.edu"
                className="w-full pl-12 pr-4 py-3.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-2xl text-white placeholder-slate-600 text-sm focus:outline-none transition-colors duration-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-12 py-3.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-2xl text-white placeholder-slate-600 text-sm focus:outline-none transition-colors duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ backgroundColor: accentColor }}
            className="w-full text-white font-medium py-3.5 px-4 rounded-2xl focus:outline-none shadow-lg shadow-indigo-600/10 hover:brightness-110 active:brightness-95 transition-all duration-200 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing In...
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-800/80 pt-6">
          <p className="text-slate-500 text-xs">
            Don't have an account?{" "}
            <button
              onClick={onSwitchToRegister}
              className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors focus:outline-none"
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
