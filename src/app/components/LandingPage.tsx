import React, { useState } from "react";
import { Brain, Sparkles, BookOpen, Clock, FileText, Calendar, Activity, ArrowRight, Shield, Award, HelpCircle, Star, MessageSquare } from "lucide-react";

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
  accentColor: string;
}

export default function LandingPage({
  onGetStarted,
  onSignIn,
  accentColor,
}: LandingPageProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const features = [
    {
      icon: <BookOpen className="w-5 h-5 text-indigo-400" />,
      title: "Assignments Tracker",
      desc: "Monitor deadlines, priority status, and calculate progress in a sleek kanban or list layout.",
    },
    {
      icon: <FileText className="w-5 h-5 text-emerald-400" />,
      title: "Digital Notebook",
      desc: "Autosave drafts, write long-form notes, tag keywords, and pin important study topics in subject binders.",
    },
    {
      icon: <Calendar className="w-5 h-5 text-purple-400" />,
      title: "Dynamic Calendar",
      desc: "Real-time calendar generation syncing assignments, reminders, and daily class slots automatically.",
    },
    {
      icon: <Clock className="w-5 h-5 text-amber-400" />,
      title: "Timetable Planner",
      desc: "Configure weekly schedule blocks, room coordinates, and professor directories in a neat calendar board.",
    },
    {
      icon: <Activity className="w-5 h-5 text-red-400" />,
      title: "Attendance Manager",
      desc: "Log daily attendance ratios, calculate safety targets, and forecast maximum allow-miss margins.",
    },
    {
      icon: <Sparkles className="w-5 h-5 text-pink-400" />,
      title: "MindVault AI Copilot",
      desc: "Interact with an advanced student assistant answering code tasks, calendar reviews, and planning routes.",
    },
  ];

  const testimonials = [
    {
      name: "Sophia Carter",
      role: "CS Sophomore, Stanford",
      text: "MindVault replaced Notion, Google Calendar, and my spreadsheet logs. The AI note annotation has kept my GPA at 3.9!",
      rating: 5,
    },
    {
      name: "Ethan Davis",
      role: "Engineering Junior, MIT",
      text: "The isolated user workspace is fast, offline-friendly, and the attendance manager tells me exactly how many classes I can miss safely.",
      rating: 5,
    },
  ];

  const faqs = [
    {
      q: "Is my data stored securely?",
      a: "Yes! MindVault uses secure cloud PostgreSQL database sync with JWT authentication. All your notes, assignments, timetable schedules, and profile data synchronize seamlessly across all your devices.",
    },
    {
      q: "How does the AI assistant function offline?",
      a: "MindVault's AI Copilot utilizes a smart local context simulation mapping your real homework deadlines and schedules to generate personalized student advice.",
    },
    {
      q: "Can I manage multiple semesters?",
      a: "Absolutely! The new Subjects module allows you to register and filter courses by academic semesters, custom colors, and classrooms, keeping each term neatly organized.",
    },
  ];

  const toggleFaq = (idx: number) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-[DM_Sans] selection:bg-indigo-600/30 overflow-x-hidden relative">
      {/* Background radial overlays */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-[800px] right-1/4 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[180px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="sticky top-0 bg-slate-950/75 backdrop-blur-md border-b border-slate-900 z-50 h-16 flex items-center justify-between px-6 md:px-12 select-none">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
            <Brain size={16} />
          </div>
          <span className="font-extrabold text-sm tracking-tight font-[Outfit] bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            MindVault AI
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-400">
          <a href="#features" className="hover:text-indigo-400 transition-colors">Features</a>
          <a href="#benefits" className="hover:text-indigo-400 transition-colors">Why MindVault</a>
          <a href="#faq" className="hover:text-indigo-400 transition-colors">FAQ</a>
        </nav>

        <div className="flex items-center gap-4">
          <button
            onClick={onSignIn}
            className="text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Sign In
          </button>
          <button
            onClick={onGetStarted}
            style={{ backgroundColor: accentColor }}
            className="text-xs font-bold text-white px-4 py-2.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-28 px-6 max-w-6xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-semibold mb-6">
          <Sparkles size={12} className="animate-pulse" />
          <span>Supercharging Student Productivity</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight font-[Outfit] text-white max-w-4xl mx-auto leading-tight bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
          Your Intelligent Academic OS
        </h1>
        <p className="text-slate-400 text-sm md:text-base mt-6 max-w-2xl mx-auto leading-relaxed">
          MindVault AI bridges assignments, notebook documentation, dynamic calendars, and class timetables into a single distraction-free, privacy-first workspace.
        </p>

        <div className="flex items-center justify-center gap-4 mt-8 flex-wrap">
          <button
            onClick={onGetStarted}
            style={{ backgroundColor: accentColor }}
            className="flex items-center gap-2 text-white font-bold text-sm px-6 py-3 rounded-2xl hover:brightness-110 hover:shadow-lg active:scale-95 transition-all cursor-pointer"
          >
            Get Started <ArrowRight size={15} />
          </button>
          <button
            onClick={onSignIn}
            className="flex items-center gap-2 bg-slate-900 border border-slate-800 text-slate-300 font-bold text-sm px-6 py-3 rounded-2xl hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
          >
            Sign In
          </button>
          <a
            href="#features"
            className="text-xs font-bold text-slate-400 hover:text-white underline underline-offset-4 py-2 transition-colors"
          >
            Learn More
          </a>
        </div>

        {/* Dynamic Glassmorphic Illustration Mockup */}
        <div className="mt-16 border border-slate-800/80 bg-slate-900/20 rounded-3xl p-4 md:p-6 backdrop-blur-sm relative group hover:border-slate-700/40 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 rounded-3xl pointer-events-none" />
          <div className="w-full h-48 md:h-96 rounded-2xl overflow-hidden bg-slate-950/60 border border-slate-900 flex flex-col items-center justify-center relative">
            {/* Mock Dashboard layout blobs */}
            <div className="absolute left-6 top-6 w-32 h-20 bg-indigo-500/10 rounded-xl border border-indigo-500/10 flex flex-col justify-between p-3">
              <div className="w-6 h-6 rounded-lg bg-indigo-500/20" />
              <div className="w-16 h-2.5 bg-slate-800 rounded" />
            </div>
            <div className="absolute right-6 top-6 w-40 h-28 bg-purple-500/10 rounded-xl border border-purple-500/10 flex flex-col justify-between p-3">
              <div className="flex gap-2">
                <div className="w-4 h-4 rounded bg-purple-500/20" />
                <div className="w-16 h-2 bg-slate-800 rounded" />
              </div>
              <div className="w-full h-8 bg-slate-900 rounded-lg flex items-center px-2">
                <div className="w-8 h-2 bg-slate-700 rounded" />
              </div>
            </div>
            <div className="absolute left-1/3 bottom-12 w-64 h-32 bg-slate-900/80 rounded-2xl border border-slate-800 flex flex-col justify-between p-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="w-24 h-3 bg-slate-700 rounded" />
                <div className="w-8 h-4 rounded-full bg-emerald-500/20" />
              </div>
              <div className="space-y-2">
                <div className="w-full h-1.5 bg-slate-800 rounded" />
                <div className="w-3/4 h-1.5 bg-slate-800 rounded" />
              </div>
              <div className="w-16 h-4 bg-indigo-600 rounded-lg" />
            </div>

            <Sparkles size={36} className="text-indigo-400 animate-pulse relative z-20" />
            <p className="text-xs text-slate-500 mt-2 font-semibold relative z-20">Virtual Dashboard Workspace Mockup</p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 border-t border-slate-900 bg-slate-950/40 relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold font-[Outfit] text-white">Academic Modules Built for Excellence</h2>
            <p className="text-slate-400 text-xs mt-3">All tools run in unified browser storage for instantaneous loads.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="bg-slate-900/30 border border-slate-900 rounded-2xl p-6 hover:border-slate-800 hover:shadow-lg transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-bold text-white text-base font-[Outfit]">{f.title}</h3>
                <p className="text-slate-400 text-xs mt-2 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why MindVault / Benefits */}
      <section id="benefits" className="py-20 border-t border-slate-900 relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-extrabold font-[Outfit] text-white leading-tight">
                Designed to Free Up Your Focus
              </h2>
              <p className="text-slate-400 text-sm mt-4 leading-relaxed">
                Most student setups suffer from fragmented tabs. Assignments are in one app, lecture notes in a paper notebook, and calendar meetings in a third app. MindVault centralizes your files in local cache so you never lose context.
              </p>

              <div className="space-y-4 mt-8">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 flex-shrink-0">
                    <Shield size={14} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">100% Isolated Data Space</h4>
                    <p className="text-xs text-slate-400 mt-1">Independent localStorage databases scoped per registered credentials, ensuring data privacy.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 flex-shrink-0">
                    <Award size={14} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Dynamic Productivity Scoring</h4>
                    <p className="text-xs text-slate-400 mt-1">Live analytics updates. Complete assignments or logs to see your scores increment automatically.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-slate-900 bg-slate-900/10 rounded-3xl p-6 backdrop-blur-sm relative overflow-hidden flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
              </div>
              <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-900 space-y-3 font-[Geist_Mono] text-[10px]">
                <p className="text-indigo-400"># User profile initialized successfully</p>
                <p className="text-emerald-400">✓ Database schema: local_storage_cache_v2</p>
                <p className="text-purple-400">✓ Auth status: verified (local_session_uuid)</p>
                <p className="text-slate-500"># Loading dynamic workspace boards...</p>
              </div>
              <p className="text-xs text-center text-slate-500 font-semibold mt-1">MindVault Local Core Engine logs</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 border-t border-slate-900 bg-slate-950/40 relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold font-[Outfit] text-white">Endorsed by Top Students</h2>
            <p className="text-slate-400 text-xs mt-3">Here is what students say about using MindVault as their daily driver.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="bg-slate-900/30 border border-slate-900 rounded-2xl p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, idx) => (
                      <Star key={idx} size={14} className="text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-300 text-xs italic leading-relaxed">"{t.text}"</p>
                </div>
                <div className="flex items-center gap-3 mt-6 border-t border-slate-800/80 pt-4">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white text-xs select-none">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs leading-none">{t.name}</h4>
                    <p className="text-[10px] text-slate-500 mt-1 leading-none">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 border-t border-slate-900 relative z-10">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <HelpCircle className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
            <h2 className="text-3xl font-extrabold font-[Outfit] text-white">Frequently Asked Questions</h2>
            <p className="text-slate-400 text-xs mt-2">Find answers to quick operational queries.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-slate-900/20 border border-slate-900 rounded-2xl overflow-hidden transition-all duration-200"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full text-left px-6 py-4 flex justify-between items-center text-sm font-bold text-white hover:bg-slate-900/50 transition-colors focus:outline-none"
                  >
                    <span>{faq.q}</span>
                    <span className="text-slate-500 font-semibold">{isOpen ? "−" : "+"}</span>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-slate-400 text-xs leading-relaxed border-t border-slate-900/40">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="border-t border-slate-900 py-12 px-6 bg-slate-950 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Brain size={12} />
            </div>
            <span className="font-bold text-xs tracking-tight font-[Outfit] text-white">
              MindVault AI
            </span>
          </div>

          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} MindVault AI OS. Running entirely in local browser storage. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
