export const SUBJECT_COLORS: Record<string, string> = {
  CS301: "#4F46E5",
  MATH202: "#3B82F6",
  PHY101: "#8B5CF6",
  ENG104: "#10B981",
  CS302: "#F59E0B",
  CHEM101: "#EF4444",
};

export interface Assignment {
  id: number;
  title: string;
  subject: string;
  subjectName: string;
  due: string;
  priority: string;
  status: string;
  progress: number;
}

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  { id: 1, title: "Binary Tree Implementation", subject: "CS301", subjectName: "Data Structures", due: "Dec 15", priority: "high", status: "in-progress", progress: 65 },
  { id: 2, title: "Calculus Problem Set #4", subject: "MATH202", subjectName: "Advanced Math", due: "Dec 18", priority: "medium", status: "not-started", progress: 0 },
  { id: 3, title: "Electromagnetic Theory Lab Report", subject: "PHY101", subjectName: "Physics Lab", due: "Dec 20", priority: "high", status: "review", progress: 90 },
  { id: 4, title: "Critical Analysis Essay", subject: "ENG104", subjectName: "English", due: "Dec 22", priority: "low", status: "completed", progress: 100 },
  { id: 5, title: "Database Schema Design", subject: "CS302", subjectName: "Database Mgmt", due: "Dec 25", priority: "medium", status: "in-progress", progress: 40 },
  { id: 6, title: "Organic Compounds Worksheet", subject: "CHEM101", subjectName: "Chemistry", due: "Dec 28", priority: "low", status: "not-started", progress: 0 },
];

export interface Reminder {
  id: number;
  title: string;
  desc: string;
  time: string;
  priority: string;
  category: string;
  done: boolean;
  recurring: boolean;
}

export const INITIAL_REMINDERS: Reminder[] = [
  { id: 1, title: "Study Group Meeting", desc: "Data Structures exam prep with Alex & Maya", time: "3:00 PM Today", priority: "high", category: "academic", done: false, recurring: true },
  { id: 2, title: "Submit Lab Report", desc: "Upload PHY101 electromagnetic theory report", time: "11:59 PM Tomorrow", priority: "high", category: "assignment", done: false, recurring: false },
  { id: 3, title: "Calculus Tutorial", desc: "Extra session with Prof. Chen in Room 203", time: "Wed 2:00 PM", priority: "medium", category: "academic", done: false, recurring: true },
  { id: 4, title: "Library Book Return", desc: "Return \"Introduction to Algorithms\" 3rd Ed.", time: "Thu 5:00 PM", priority: "low", category: "personal", done: false, recurring: false },
  { id: 5, title: "Review Flashcards", desc: "Binary trees, AVL trees, Red-Black trees", time: "Daily 9:00 PM", priority: "medium", category: "study", done: true, recurring: true },
  { id: 6, title: "Register for Spring Semester", desc: "Portal opens at midnight — don't miss it", time: "Dec 20 12:00 AM", priority: "high", category: "admin", done: false, recurring: false },
];

export interface Note {
  id: number;
  title: string;
  subject: string;
  content: string;
  date: string;
  tags: string[];
  pinned: boolean;
  fav: boolean;
}

export const INITIAL_NOTES: Note[] = [
  { id: 1, title: "Binary Trees & BST Notes", subject: "CS301", content: "Binary search trees maintain sorted order. Left child < parent < right child. Traversals: inorder, preorder, postorder. Balance factor crucial for AVL trees.", date: "Dec 12", tags: ["trees", "algorithms"], pinned: true, fav: true },
  { id: 2, title: "Integration Techniques", subject: "MATH202", content: "Integration by parts: ∫u dv = uv − ∫v du. Choose u = LIATE order (Logarithmic, Inverse trig, Algebraic, Trig, Exponential).", date: "Dec 11", tags: ["calculus", "integration"], pinned: false, fav: true },
  { id: 3, title: "Maxwell's Equations Summary", subject: "PHY101", content: "Gauss's Law: ∇·E = ρ/ε₀. Faraday's: ∇×E = −∂B/∂t. Ampere-Maxwell: ∇×B = μ₀J + μ₀ε₀∂E/∂t.", date: "Dec 10", tags: ["electromagnetics"], pinned: true, fav: false },
  { id: 4, title: "Essay Writing Framework", subject: "ENG104", content: "PEEL structure: Point, Evidence, Explanation, Link. Thesis must be arguable and specific. Use active voice throughout.", date: "Dec 9", tags: ["writing", "essays"], pinned: false, fav: false },
  { id: 5, title: "SQL Query Optimization", subject: "CS302", content: "Use indexes for frequently queried columns. Avoid SELECT *. Use JOINs instead of subqueries where possible. EXPLAIN ANALYZE.", date: "Dec 8", tags: ["sql", "databases"], pinned: false, fav: true },
  { id: 6, title: "Data Structures Cheat Sheet", subject: "CS301", content: "Array O(1) access, LinkedList O(n), Stack/Queue O(1) push/pop, HashTable O(1) avg. BST O(log n) search, Heap O(log n) insert.", date: "Dec 6", tags: ["cheatsheet"], pinned: true, fav: true },
];

export const STUDY_HOURS = [
  { day: "Mon", hours: 4.5, target: 5 },
  { day: "Tue", hours: 6.2, target: 5 },
  { day: "Wed", hours: 3.8, target: 5 },
  { day: "Thu", hours: 7.1, target: 5 },
  { day: "Fri", hours: 2.9, target: 5 },
  { day: "Sat", hours: 8.0, target: 5 },
  { day: "Sun", hours: 1.5, target: 5 },
];

export const WEEKLY_PRODUCTIVITY = [
  { week: "Nov W1", score: 72, assignments: 3 },
  { week: "Nov W2", score: 68, assignments: 2 },
  { week: "Nov W3", score: 81, assignments: 4 },
  { week: "Nov W4", score: 76, assignments: 3 },
  { week: "Dec W1", score: 89, assignments: 5 },
  { week: "Dec W2", score: 82, assignments: 4 },
];

export const MONTHLY_STUDY = [
  { month: "Jul", hours: 52 },
  { month: "Aug", hours: 67 },
  { month: "Sep", hours: 89 },
  { month: "Oct", hours: 78 },
  { month: "Nov", hours: 95 },
  { month: "Dec", hours: 61 },
];

export interface CourseAttendance {
  subject: string;
  name: string;
  attended: number;
  total: number;
  color: string;
  faculty: string;
}

export const ATTENDANCE: CourseAttendance[] = [
  { subject: "CS301", name: "Data Structures", attended: 45, total: 50, color: "#4F46E5", faculty: "Dr. Sarah Johnson" },
  { subject: "MATH202", name: "Advanced Math", attended: 46, total: 50, color: "#3B82F6", faculty: "Prof. Michael Chen" },
  { subject: "PHY101", name: "Physics Lab", attended: 38, total: 50, color: "#8B5CF6", faculty: "Dr. James Wilson" },
  { subject: "ENG104", name: "English Comp.", attended: 48, total: 50, color: "#10B981", faculty: "Ms. Priya Sharma" },
  { subject: "CS302", name: "Database Mgmt", attended: 42, total: 50, color: "#F59E0B", faculty: "Prof. Lisa Wang" },
  { subject: "CHEM101", name: "Chemistry", attended: 34, total: 50, color: "#EF4444", faculty: "Dr. Robert Kim" },
];

export const RADAR_DATA = [
  { subject: "CS301", score: 88 },
  { subject: "MATH202", score: 74 },
  { subject: "PHY101", score: 66 },
  { subject: "ENG104", score: 91 },
  { subject: "CS302", score: 79 },
  { subject: "CHEM101", score: 58 },
];

export const TODAY_SCHEDULE = [
  { time: "08:30", end: "10:00", subject: "CS301", name: "Data Structures", room: "Lab 204", type: "lecture" },
  { time: "10:00", end: "11:30", subject: "MATH202", name: "Advanced Math", room: "Hall B-102", type: "tutorial" },
  { time: "13:00", end: "15:00", subject: "PHY101", name: "Physics Lab", room: "Science Bldg 3", type: "lab" },
  { time: "15:30", end: "17:00", subject: "CS302", name: "Database Mgmt", room: "CS Building 101", type: "lecture" },
];

export const TIMETABLE: Record<string, { time: string; subject: string; name: string; room: string; faculty: string }[]> = {
  Monday: [
    { time: "08:30–10:00", subject: "CS301", name: "Data Structures", room: "Lab 204", faculty: "Dr. Sarah Johnson" },
    { time: "10:00–11:30", subject: "MATH202", name: "Advanced Math", room: "B-102", faculty: "Prof. Michael Chen" },
    { time: "14:00–15:30", subject: "ENG104", name: "English Comp.", room: "A-205", faculty: "Ms. Priya Sharma" },
  ],
  Tuesday: [
    { time: "09:00–10:30", subject: "PHY101", name: "Physics Lab", room: "Sci-301", faculty: "Dr. James Wilson" },
    { time: "11:00–12:30", subject: "CS302", name: "Database Mgmt", room: "CS-101", faculty: "Prof. Lisa Wang" },
    { time: "15:00–16:30", subject: "CHEM101", name: "Chemistry", room: "Chem-202", faculty: "Dr. Robert Kim" },
  ],
  Wednesday: [
    { time: "08:30–10:00", subject: "CS301", name: "Data Structures", room: "Lab 204", faculty: "Dr. Sarah Johnson" },
    { time: "13:00–14:30", subject: "MATH202", name: "Advanced Math", room: "B-102", faculty: "Prof. Michael Chen" },
    { time: "15:30–17:00", subject: "PHY101", name: "Physics Lab", room: "Sci-301", faculty: "Dr. James Wilson" },
  ],
  Thursday: [
    { time: "10:00–11:30", subject: "CS302", name: "Database Mgmt", room: "CS-101", faculty: "Prof. Lisa Wang" },
    { time: "12:00–13:30", subject: "ENG104", name: "English Comp.", room: "A-205", faculty: "Ms. Priya Sharma" },
    { time: "14:00–15:30", subject: "CHEM101", name: "Chemistry", room: "Chem-202", faculty: "Dr. Robert Kim" },
  ],
  Friday: [
    { time: "09:00–10:30", subject: "CS301", name: "Data Structures", room: "Lab 204", faculty: "Dr. Sarah Johnson" },
    { time: "11:00–12:30", subject: "MATH202", name: "Advanced Math", room: "B-102", faculty: "Prof. Michael Chen" },
    { time: "14:00–15:30", subject: "CS302", name: "Database Mgmt", room: "CS-101", faculty: "Prof. Lisa Wang" },
  ],
};

export interface AppNotification {
  id: number;
  type: string;
  title: string;
  msg: string;
  time: string;
  read: boolean;
}

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  { id: 1, type: "assignment", title: "Assignment Due Tomorrow", msg: "Binary Tree Implementation is due tomorrow at 11:59 PM", time: "2 hours ago", read: false },
  { id: 2, type: "reminder", title: "Study Group in 30 min", msg: "Your study group meeting starts at 3:00 PM today", time: "30 min ago", read: false },
  { id: 3, type: "warning", title: "Attendance Warning", msg: "Chemistry attendance dropped to 68%. Minimum required: 75%", time: "Yesterday", read: false },
  { id: 4, type: "ai", title: "AI Study Plan Ready", msg: "Your personalized study plan for finals week has been generated", time: "Yesterday", read: true },
  { id: 5, type: "grade", title: "Grade Posted", msg: "Your MATH202 midterm grade has been posted: 87/100", time: "2 days ago", read: true },
  { id: 6, type: "reminder", title: "Registration Opens Soon", msg: "Spring semester registration opens in 5 days", time: "3 days ago", read: true },
];

export const AI_INITIAL = [
  { id: 1, role: "assistant", content: "Hi Alex! I'm your MindVault AI assistant. I can help you create study plans, explain concepts, generate quizzes, make flashcards, and more. What would you like to work on today?" },
];

export const AI_SUGGESTIONS = [
  "Create a study plan for finals week",
  "Explain binary search trees visually",
  "Generate 10 flashcards for MATH202",
  "Summarize my PHY101 Maxwell notes",
  "Quiz me on Data Structures",
  "Help me outline my ENG104 essay",
];

export const ATTENDANCE_TREND = [
  { month: "Aug", pct: 88 },
  { month: "Sep", pct: 85 },
  { month: "Oct", pct: 83 },
  { month: "Nov", pct: 80 },
  { month: "Dec", pct: 84 },
];

export const PROFILE_ACHIEVEMENTS = [
  { icon: "🔥", label: "14-Day Streak", desc: "Studied for 14 consecutive days" },
  { icon: "📚", label: "Note Master", desc: "Created 50+ study notes" },
  { icon: "✅", label: "Deadline Crusher", desc: "10 assignments submitted early" },
  { icon: "🎯", label: "Attendance Star", desc: "96% attendance in English" },
];

export const getAIResponse = (msg: string): string => {
  const m = msg.toLowerCase();
  if (m.includes("study plan") || m.includes("finals"))
    return "Here's your personalized finals study plan:\n\n**Week 1 (Dec 13–17)**\n• Mon: CS301 — Binary Trees, AVL Trees (3h)\n• Tue: MATH202 — Integration, Series (4h)\n• Wed: PHY101 — Maxwell's Equations review (3h)\n• Thu: CS301 — Practice problems + Past papers (4h)\n• Fri: ENG104 — Essay outline & draft (2h)\n\n**Week 2 (Dec 18–22)**\n• Focus on weak subjects: PHY101 & CHEM101\n• Daily: 2h active recall with flashcards\n• Take full mock exams under timed conditions\n\nPriority order: CS301 > PHY101 > MATH202 > CHEM101. You have an 88% in CS301 so mostly review — put extra hours into Chemistry (58%) and Physics (66%).";
  if (m.includes("binary") || m.includes("bst") || m.includes("tree"))
    return "**Binary Search Trees (BST)**\n\nA BST is a tree where every node satisfies:\n• Left subtree: all values < node\n• Right subtree: all values > node\n\n**Key Operations (avg / worst)**\n• Search: O(log n) / O(n)\n• Insert: O(log n) / O(n)\n• Delete: O(log n) / O(n)\n\n**Traversals**\n• Inorder (L→Root→R): sorted output\n• Preorder (Root→L→R): used for copying\n• Postorder (L→R→Root): used for deletion\n\n**Balance** is critical — a skewed tree degrades to O(n). AVL and Red-Black trees auto-balance. Would you like me to generate practice problems or flashcards on this topic?";
  if (m.includes("flashcard") || m.includes("flash"))
    return "**10 Flashcards — MATH202: Integration**\n\n1. **Q:** Integration by parts formula?\n   **A:** ∫u dv = uv − ∫v du\n\n2. **Q:** ∫xeˣ dx = ?\n   **A:** (x−1)eˣ + C\n\n3. **Q:** LIATE rule order?\n   **A:** Logarithmic, Inverse trig, Algebraic, Trig, Exponential\n\n4. **Q:** ∫sin²x dx = ?\n   **A:** x/2 − sin(2x)/4 + C\n\n5. **Q:** Substitution: u = f(x), then du = ?\n   **A:** f'(x) dx\n\n...and 5 more! Want me to export these or make them harder?";
  if (m.includes("quiz"))
    return "**Quick Quiz — Data Structures (5 Questions)**\n\n**Q1.** What is the time complexity of searching in a balanced BST?\na) O(1)  b) O(log n)  c) O(n)  d) O(n²)\n\n**Q2.** Which traversal of a BST gives sorted output?\na) Preorder  b) Postorder  c) Inorder  d) Level-order\n\n**Q3.** What data structure is used for implementing BFS?\na) Stack  b) Queue  c) Heap  d) Tree\n\n**Q4.** What is the worst-case height of an AVL tree with n nodes?\na) O(n)  b) O(log n)  c) O(n log n)  d) O(√n)\n\n**Q5.** A min-heap guarantees the minimum element is at?\na) Last node  b) Root  c) Leftmost leaf  d) Rightmost leaf\n\nType your answers (e.g. \"b, c, b, b, b\") and I'll grade them!";
  if (m.includes("summar") || m.includes("maxwell") || m.includes("physics"))
    return "**PHY101 — Maxwell's Equations Summary**\n\nThe four fundamental equations of electromagnetism:\n\n1. **Gauss's Law (Electric):** ∇·E = ρ/ε₀\n   → Electric field diverges from charges\n\n2. **Gauss's Law (Magnetic):** ∇·B = 0\n   → No magnetic monopoles exist\n\n3. **Faraday's Law:** ∇×E = −∂B/∂t\n   → Changing B field induces E field\n\n4. **Ampere-Maxwell Law:** ∇×B = μ₀J + μ₀ε₀∂E/∂t\n   → Currents and changing E fields create B fields\n\n**In words:** Changing electric fields produce magnetic fields and vice versa — this is the basis of electromagnetic waves (light!). Need more detail on any equation?";
  if (m.includes("essay") || m.includes("eng104") || m.includes("outline"))
    return "**ENG104 Essay Outline Framework**\n\n**Structure (PEEL per body paragraph):**\n\n📌 **Introduction** (10%)\n• Hook → Background → Thesis statement\n• Thesis: one clear, arguable claim\n\n📌 **Body Paragraph 1** (25%)\n• Point → Evidence (quote/data) → Explanation → Link back\n\n📌 **Body Paragraph 2** (25%)\n• Same PEEL structure with new evidence\n\n📌 **Body Paragraph 3** (25%)\n• Address counterargument + refutation\n\n📌 **Conclusion** (15%)\n• Restate thesis (new phrasing) → Synthesize points → Broader significance\n\n**Tips:** Use active voice, avoid \"I think/feel\", cite every claim. Want me to help with your specific topic?";
  return "That's a great question! Let me help you with that. Based on your current coursework and performance data, I can provide personalized guidance. Could you be a bit more specific? For example, I can:\n\n• **Explain** any concept from your subjects\n• **Create** a custom study plan\n• **Generate** quizzes or flashcards\n• **Summarize** your notes\n• **Help** with assignments and essays\n\nJust ask me anything — I'm here to help you succeed! 🎯";
};
