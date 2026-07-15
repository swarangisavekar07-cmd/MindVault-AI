import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const ATTENDANCE = [
  { subject: "CS301", name: "Data Structures", attended: 45, total: 50, color: "#4F46E5", faculty: "Dr. Sarah Johnson" },
  { subject: "MATH202", name: "Advanced Math", attended: 46, total: 50, color: "#3B82F6", faculty: "Prof. Michael Chen" },
  { subject: "PHY101", name: "Physics Lab", attended: 38, total: 50, color: "#8B5CF6", faculty: "Dr. James Wilson" },
  { subject: "ENG104", name: "English Comp.", attended: 48, total: 50, color: "#10B981", faculty: "Ms. Priya Sharma" },
  { subject: "CS302", name: "Database Mgmt", attended: 42, total: 50, color: "#F59E0B", faculty: "Prof. Lisa Wang" },
  { subject: "CHEM101", name: "Chemistry", attended: 34, total: 50, color: "#EF4444", faculty: "Dr. Robert Kim" },
];

const TIMETABLE: Record<string, { time: string; subject: string; room: string }[]> = {
  Monday: [
    { time: "08:30–10:00", subject: "CS301", room: "Lab 204" },
    { time: "10:00–11:30", subject: "MATH202", room: "B-102" },
    { time: "14:00–15:30", subject: "ENG104", room: "A-205" },
  ],
  Tuesday: [
    { time: "09:00–10:30", subject: "PHY101", room: "Sci-301" },
    { time: "11:00–12:30", subject: "CS302", room: "CS-101" },
    { time: "15:00–16:30", subject: "CHEM101", room: "Chem-202" },
  ],
  Wednesday: [
    { time: "08:30–10:00", subject: "CS301", room: "Lab 204" },
    { time: "13:00–14:30", subject: "MATH202", room: "B-102" },
    { time: "15:30–17:00", subject: "PHY101", room: "Sci-301" },
  ],
  Thursday: [
    { time: "10:00–11:30", subject: "CS302", room: "CS-101" },
    { time: "12:00–13:30", subject: "ENG104", room: "A-205" },
    { time: "14:00–15:30", subject: "CHEM101", room: "Chem-202" },
  ],
  Friday: [
    { time: "09:00–10:30", subject: "CS301", room: "Lab 204" },
    { time: "11:00–12:30", subject: "MATH202", room: "B-102" },
    { time: "14:00–15:30", subject: "CS302", room: "CS-101" },
  ],
};

const INITIAL_ASSIGNMENTS = [
  { title: "Binary Tree Implementation", subject: "CS301", subjectName: "Data Structures", due: "Dec 15", priority: "high", status: "in-progress", progress: 65 },
  { title: "Calculus Problem Set #4", subject: "MATH202", subjectName: "Advanced Math", due: "Dec 18", priority: "medium", status: "not-started", progress: 0 },
  { title: "Electromagnetic Theory Lab Report", subject: "PHY101", subjectName: "Physics Lab", due: "Dec 20", priority: "high", status: "review", progress: 90 },
  { title: "Critical Analysis Essay", subject: "ENG104", subjectName: "English", due: "Dec 22", priority: "low", status: "completed", progress: 100 },
  { title: "Database Schema Design", subject: "CS302", subjectName: "Database Mgmt", due: "Dec 25", priority: "medium", status: "in-progress", progress: 40 },
  { title: "Organic Compounds Worksheet", subject: "CHEM101", subjectName: "Chemistry", due: "Dec 28", priority: "low", status: "not-started", progress: 0 },
];

const INITIAL_REMINDERS = [
  { title: "Study Group Meeting", desc: "Data Structures exam prep with Alex & Maya", time: "3:00 PM Today", priority: "high", category: "academic", done: false, recurring: true },
  { title: "Submit Lab Report", desc: "Upload PHY101 electromagnetic theory report", time: "11:59 PM Tomorrow", priority: "high", category: "assignment", done: false, recurring: false },
  { title: "Calculus Tutorial", desc: "Extra session with Prof. Chen in Room 203", time: "Wed 2:00 PM", priority: "medium", category: "academic", done: false, recurring: true },
  { title: "Library Book Return", desc: "Return \"Introduction to Algorithms\" 3rd Ed.", time: "Thu 5:00 PM", priority: "low", category: "personal", done: false, recurring: false },
  { title: "Review Flashcards", desc: "Binary trees, AVL trees, Red-Black trees", time: "Daily 9:00 PM", priority: "medium", category: "study", done: true, recurring: true },
  { title: "Register for Spring Semester", desc: "Portal opens at midnight — don't miss it", time: "Dec 20 12:00 AM", priority: "high", category: "admin", done: false, recurring: false },
];

const INITIAL_NOTES = [
  { title: "Binary Trees & BST Notes", subject: "CS301", content: "Binary search trees maintain sorted order. Left child < parent < right child. Traversals: inorder, preorder, postorder. Balance factor crucial for AVL trees.", date: "Dec 12", tags: "trees,algorithms" },
  { title: "Integration Techniques", subject: "MATH202", content: "Integration by parts: ∫u dv = uv − ∫v du. Choose u = LIATE order (Logarithmic, Inverse trig, Algebraic, Trig, Exponential).", date: "Dec 11", tags: "calculus,integration" },
  { title: "Maxwell's Equations Summary", subject: "PHY101", content: "Gauss's Law: ∇·E = ρ/ε₀. Faraday's: ∇×E = −∂B/∂t. Ampere-Maxwell: ∇×B = μ₀J + μ₀ε₀∂E/∂t.", date: "Dec 10", tags: "electromagnetics" },
  { title: "Essay Writing Framework", subject: "ENG104", content: "PEEL structure: Point, Evidence, Explanation, Link. Thesis must be arguable and specific. Use active voice throughout.", date: "Dec 9", tags: "writing,essays" },
  { title: "SQL Query Optimization", subject: "CS302", content: "Use indexes for frequently queried columns. Avoid SELECT *. Use JOINs instead of subqueries where possible. EXPLAIN ANALYZE.", date: "Dec 8", tags: "sql,databases" },
  { title: "Data Structures Cheat Sheet", subject: "CS301", content: "Array O(1) access, LinkedList O(n), Stack/Queue O(1) push/pop, HashTable O(1) avg. BST O(log n) search, Heap O(log n) insert.", date: "Dec 6", tags: "cheatsheet" },
];

const INITIAL_NOTIFICATIONS = [
  { type: "assignment", title: "Assignment Due Tomorrow", msg: "Binary Tree Implementation is due tomorrow at 11:59 PM", time: "2 hours ago", read: false },
  { type: "reminder", title: "Study Group in 30 min", msg: "Your study group meeting starts at 3:00 PM today", time: "30 min ago", read: false },
  { type: "warning", title: "Attendance Warning", msg: "Chemistry attendance dropped to 68%. Minimum required: 75%", time: "Yesterday", read: false },
  { type: "ai", title: "AI Study Plan Ready", msg: "Your personalized study plan for finals week has been generated", time: "Yesterday", read: true },
  { type: "grade", title: "Grade Posted", msg: "Your MATH202 midterm grade has been posted: 87/100", time: "2 days ago", read: true },
  { type: "reminder", title: "Registration Opens Soon", msg: "Spring semester registration opens in 5 days", time: "3 days ago", read: true },
];

async function main() {
  console.log("Seeding database...");

  // Clean existing tables
  await prisma.timetableClass.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.reminder.deleteMany();
  await prisma.note.deleteMany();
  await prisma.appNotification.deleteMany();
  await prisma.user.deleteMany();

  // Create default user (Alex Mercer)
  const hashedPassword = await bcrypt.hash("Swara@1234", 10);
  const user = await prisma.user.create({
    data: {
      email: "alex@university.edu",
      password: hashedPassword,
      name: "Alex Mercer",
      major: "Computer Science",
      year: "Sophomore",
    },
  });

  const userId = user.id;

  // Seed Subjects
  for (const s of ATTENDANCE) {
    await prisma.subject.create({
      data: {
        code: s.subject,
        name: s.name,
        color: s.color,
        faculty: s.faculty,
        attended: s.attended,
        total: s.total,
        target: 75,
        userId,
      },
    });
  }

  // Seed Timetable Classes
  for (const day of Object.keys(TIMETABLE)) {
    const classes = TIMETABLE[day];
    for (let idx = 0; idx < classes.length; idx++) {
      const cls = classes[idx];
      const parts = cls.time.split("–");
      const startTime = parts[0] ? parts[0].trim() : "08:30";
      const endTime = parts[1] ? parts[1].trim() : "10:00";
      await prisma.timetableClass.create({
        data: {
          id: `${day}-${idx}-${cls.subject}`,
          day,
          startTime,
          endTime,
          subjectCode: cls.subject,
          room: cls.room,
          userId,
        },
      });
    }
  }

  // Seed Assignments
  for (const a of INITIAL_ASSIGNMENTS) {
    await prisma.assignment.create({
      data: {
        title: a.title,
        subject: a.subject,
        subjectName: a.subjectName,
        due: a.due,
        priority: a.priority,
        status: a.status,
        progress: a.progress,
        userId,
      },
    });
  }

  // Seed Reminders
  for (const r of INITIAL_REMINDERS) {
    await prisma.reminder.create({
      data: {
        title: r.title,
        desc: r.desc,
        time: r.time,
        priority: r.priority,
        category: r.category,
        done: r.done,
        recurring: r.recurring,
        userId,
      },
    });
  }

  // Seed Notes
  for (const n of INITIAL_NOTES) {
    await prisma.note.create({
      data: {
        title: n.title,
        subject: n.subject,
        content: n.content,
        date: n.date,
        tags: n.tags,
        userId,
      },
    });
  }

  // Seed Notifications
  for (const n of INITIAL_NOTIFICATIONS) {
    await prisma.appNotification.create({
      data: {
        type: n.type,
        title: n.title,
        msg: n.msg,
        time: n.time,
        read: n.read,
        userId,
      },
    });
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
