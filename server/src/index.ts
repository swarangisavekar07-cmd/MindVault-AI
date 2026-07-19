import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { authMiddleware, AuthenticatedRequest } from "./middleware/authMiddleware";
import { createAIRouter } from "./routes/aiRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "mindvault_jwt_secret_key_123!";

app.use(cors());
app.use(express.json({ limit: "10mb" }));  // Allow larger bodies for pasted notes

// ─── AI ROUTES (mounted before auth routes) ────────────────────────────────
app.use("/api/ai", createAIRouter(prisma));


// ─── AUTHENTICATION ENDPOINTS ──────────────────────────────────
app.post("/api/auth/register", async (req, res) => {
  const { email, password, name, major, year } = req.body;

  if (!email || !password || !name || !major || !year) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: "User with this email already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        major,
        year,
      },
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
    const { password: _, ...userInfo } = user;
    res.status(201).json({ token, user: userInfo });
  } catch (error) {
    res.status(500).json({ error: "Registration failed" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
    const { password: _, ...userInfo } = user;
    res.json({ token, user: userInfo });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

app.get("/api/auth/profile", authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    const { password: _, ...userInfo } = user;
    res.json(userInfo);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

app.put("/api/auth/profile", authMiddleware, async (req: AuthenticatedRequest, res) => {
  const { name, major, year, bio, interests } = req.body;
  try {
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (major !== undefined) updateData.major = major;
    if (year !== undefined) updateData.year = year;
    if (bio !== undefined) updateData.bio = bio;
    if (interests !== undefined) updateData.interests = interests;

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: updateData,
    });
    const { password: _, ...userInfo } = user;
    res.json(userInfo);
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

app.put("/api/auth/change-password", authMiddleware, async (req: AuthenticatedRequest, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: "Current and new passwords are required" });
    return;
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      res.status(400).json({ error: "Incorrect current password" });
      return;
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.userId },
      data: { password: hashedNewPassword },
    });

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update password" });
  }
});

// ─── SUBJECTS ROUTES ──────────────────────────────────────────
app.get("/api/subjects", authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const subjects = await prisma.subject.findMany({
      where: { userId: req.userId },
    });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch subjects" });
  }
});

app.post("/api/subjects", authMiddleware, async (req: AuthenticatedRequest, res) => {
  const { code, name, color, faculty, attended, total, target, classroom, semester } = req.body;
  try {
    const subjectData: any = {
      code,
      name,
      color,
      faculty,
      attended: Number(attended) || 0,
      total: Number(total) || 0,
      target: Number(target) || 75,
      userId: req.userId!,
    };
    if (classroom !== undefined) subjectData.classroom = classroom;
    if (semester !== undefined) subjectData.semester = semester;

    const subject = await prisma.subject.create({
      data: subjectData,
    });
    res.status(201).json(subject);
  } catch (error: any) {
    console.error("POST /api/subjects error:", error);
    res.status(500).json({ error: "Failed to create subject", details: error?.message || String(error) });
  }
});

app.put("/api/subjects/:code", authMiddleware, async (req: AuthenticatedRequest, res) => {
  const { code } = req.params;
  const { name, color, faculty, attended, total, target, classroom, semester } = req.body;
  try {
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (color !== undefined) updateData.color = color;
    if (faculty !== undefined) updateData.faculty = faculty;
    if (attended !== undefined) updateData.attended = Number(attended);
    if (total !== undefined) updateData.total = Number(total);
    if (target !== undefined) updateData.target = Number(target);
    if (classroom !== undefined) updateData.classroom = classroom;
    if (semester !== undefined) updateData.semester = semester;

    const subject = await prisma.subject.update({
      where: {
        code_userId: {
          code,
          userId: req.userId!,
        },
      },
      data: updateData,
    });
    res.json(subject);
  } catch (error: any) {
    console.error("PUT /api/subjects error:", error);
    res.status(500).json({ error: "Failed to update subject", details: error?.message || String(error) });
  }
});

app.delete("/api/subjects/:code", authMiddleware, async (req: AuthenticatedRequest, res) => {
  const { code } = req.params;
  try {
    // Delete related classes first
    await prisma.timetableClass.deleteMany({
      where: {
        subjectCode: code,
        userId: req.userId!,
      },
    });
    await prisma.subject.delete({
      where: {
        code_userId: {
          code,
          userId: req.userId!,
        },
      },
    });
    res.json({ message: "Subject and related slots deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete subject" });
  }
});

// ─── TIMETABLE ROUTES ──────────────────────────────────────────
app.get("/api/timetable", authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const classes = await prisma.timetableClass.findMany({
      where: { userId: req.userId },
    });
    res.json(classes);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch timetable classes" });
  }
});

app.post("/api/timetable", authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { id, day, startTime, endTime, subjectCode, room } = req.body;
    const newClass = await prisma.timetableClass.create({
      data: {
        id: id || `class_${Date.now()}`,
        day: day || "Monday",
        startTime: startTime || "09:00",
        endTime: endTime || "10:00",
        subjectCode: subjectCode || "",
        room: room || "",
        userId: req.userId!,
      },
    });
    res.status(201).json(newClass);
  } catch (error: any) {
    console.error("Timetable create error:", error);
    res.status(500).json({ error: "Failed to create timetable class", details: error?.message });
  }
});

app.put("/api/timetable/:id", authMiddleware, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  try {
    const updatedClass = await prisma.timetableClass.update({
      where: {
        id_userId: {
          id,
          userId: req.userId!,
        },
      },
      data: req.body,
    });
    res.json(updatedClass);
  } catch (error) {
    res.status(500).json({ error: "Failed to update timetable class" });
  }
});

app.delete("/api/timetable/:id", authMiddleware, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  try {
    await prisma.timetableClass.delete({
      where: {
        id_userId: {
          id,
          userId: req.userId!,
        },
      },
    });
    res.json({ message: "Timetable slot deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete timetable class" });
  }
});

// ─── ASSIGNMENTS ROUTES ────────────────────────────────────────
app.get("/api/assignments", authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const assignments = await prisma.assignment.findMany({
      where: { userId: req.userId },
      orderBy: { id: "desc" },
    });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch assignments" });
  }
});

app.post("/api/assignments", authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { title, subject, subjectName, due, priority, status, progress } = req.body;
    const assignment = await prisma.assignment.create({
      data: {
        title: title || "",
        subject: subject || "",
        subjectName: subjectName || "",
        due: due || "",
        priority: priority || "medium",
        status: status || "not-started",
        progress: typeof progress === "number" ? progress : 0,
        userId: req.userId!,
      },
    });
    res.status(201).json(assignment);
  } catch (error: any) {
    console.error("Assignment create error:", error);
    res.status(500).json({ error: "Failed to create assignment", details: error?.message });
  }
});

app.put("/api/assignments/:id", authMiddleware, async (req: AuthenticatedRequest, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const item = await prisma.assignment.findUnique({ where: { id } });
    if (!item || item.userId !== req.userId) {
      res.status(403).json({ error: "Access denied. Action not permitted." });
      return;
    }
    const assignment = await prisma.assignment.update({
      where: { id },
      data: req.body,
    });
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ error: "Failed to update assignment" });
  }
});

app.delete("/api/assignments/:id", authMiddleware, async (req: AuthenticatedRequest, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const item = await prisma.assignment.findUnique({ where: { id } });
    if (!item || item.userId !== req.userId) {
      res.status(403).json({ error: "Access denied. Action not permitted." });
      return;
    }
    await prisma.assignment.delete({
      where: { id },
    });
    res.json({ message: "Assignment deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete assignment" });
  }
});

// ─── REMINDERS ROUTES ──────────────────────────────────────────
app.get("/api/reminders", authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const reminders = await prisma.reminder.findMany({
      where: { userId: req.userId },
    });
    res.json(reminders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reminders" });
  }
});

app.post("/api/reminders", authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { title, desc, time, priority, category, done, recurring } = req.body;
    const reminder = await prisma.reminder.create({
      data: {
        title: title || "",
        desc: desc || "",
        time: time || "",
        priority: priority || "medium",
        category: category || "personal",
        done: Boolean(done),
        recurring: Boolean(recurring),
        userId: req.userId!,
      },
    });
    res.status(201).json(reminder);
  } catch (error: any) {
    console.error("Reminder create error:", error);
    res.status(500).json({ error: "Failed to create reminder", details: error?.message });
  }
});

app.put("/api/reminders/:id", authMiddleware, async (req: AuthenticatedRequest, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const item = await prisma.reminder.findUnique({ where: { id } });
    if (!item || item.userId !== req.userId) {
      res.status(403).json({ error: "Access denied. Action not permitted." });
      return;
    }
    const reminder = await prisma.reminder.update({
      where: { id },
      data: req.body,
    });
    res.json(reminder);
  } catch (error) {
    res.status(500).json({ error: "Failed to update reminder" });
  }
});

app.delete("/api/reminders/:id", authMiddleware, async (req: AuthenticatedRequest, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const item = await prisma.reminder.findUnique({ where: { id } });
    if (!item || item.userId !== req.userId) {
      res.status(403).json({ error: "Access denied. Action not permitted." });
      return;
    }
    await prisma.reminder.delete({
      where: { id },
    });
    res.json({ message: "Reminder deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete reminder" });
  }
});

// ─── NOTES ROUTES ──────────────────────────────────────────────
app.get("/api/notes", authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const notes = await prisma.note.findMany({
      where: { userId: req.userId },
      orderBy: { id: "desc" },
    });
    const formattedNotes = notes.map((n) => ({
      ...n,
      tags: n.tags ? n.tags.split(",") : [],
    }));
    res.json(formattedNotes);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

app.post("/api/notes", authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { title, subject, content, date, tags, pinned, fav } = req.body;
    const note = await prisma.note.create({
      data: {
        title: title || "",
        subject: subject || "",
        content: content || "",
        date: date || "",
        tags: Array.isArray(tags) ? tags.join(",") : tags || "",
        pinned: Boolean(pinned),
        fav: Boolean(fav),
        userId: req.userId!,
      },
    });
    res.status(201).json({ ...note, tags: note.tags ? note.tags.split(",") : [] });
  } catch (error: any) {
    console.error("Note create error:", error);
    res.status(500).json({ error: "Failed to create note", details: error?.message });
  }
});

app.put("/api/notes/:id", authMiddleware, async (req: AuthenticatedRequest, res) => {
  const id = parseInt(req.params.id, 10);
  const { tags, ...rest } = req.body;
  try {
    const item = await prisma.note.findUnique({ where: { id } });
    if (!item || item.userId !== req.userId) {
      res.status(403).json({ error: "Access denied. Action not permitted." });
      return;
    }

    const updateData: any = { ...rest };
    if (tags !== undefined) {
      updateData.tags = Array.isArray(tags) ? tags.join(",") : tags || "";
    }

    const note = await prisma.note.update({
      where: { id },
      data: updateData,
    });
    res.json({ ...note, tags: note.tags ? note.tags.split(",") : [] });
  } catch (error) {
    res.status(500).json({ error: "Failed to update note" });
  }
});

app.delete("/api/notes/:id", authMiddleware, async (req: AuthenticatedRequest, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const item = await prisma.note.findUnique({ where: { id } });
    if (!item || item.userId !== req.userId) {
      res.status(403).json({ error: "Access denied. Action not permitted." });
      return;
    }
    await prisma.note.delete({
      where: { id },
    });
    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete note" });
  }
});

// ─── NOTIFICATIONS ROUTES ──────────────────────────────────────
app.get("/api/notifications", authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const notifications = await prisma.appNotification.findMany({
      where: { userId: req.userId },
      orderBy: { id: "desc" },
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

app.post("/api/notifications", authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { type, title, msg, time, read } = req.body;
    const notification = await prisma.appNotification.create({
      data: {
        type: type || "system",
        title: title || "",
        msg: msg || "",
        time: time || "",
        read: Boolean(read),
        userId: req.userId!,
      },
    });
    res.status(201).json(notification);
  } catch (error: any) {
    console.error("Notification create error:", error);
    res.status(500).json({ error: "Failed to create notification", details: error?.message });
  }
});

app.put("/api/notifications/mark-all-read", authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    await prisma.appNotification.updateMany({
      where: {
        userId: req.userId!,
        read: false,
      },
      data: { read: true },
    });
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ error: "Failed to mark all as read" });
  }
});

app.put("/api/notifications/:id", authMiddleware, async (req: AuthenticatedRequest, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const item = await prisma.appNotification.findUnique({ where: { id } });
    if (!item || item.userId !== req.userId) {
      res.status(403).json({ error: "Access denied. Action not permitted." });
      return;
    }
    const notification = await prisma.appNotification.update({
      where: { id },
      data: req.body,
    });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: "Failed to update notification" });
  }
});

app.delete("/api/notifications/clear-all", authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    await prisma.appNotification.deleteMany({
      where: { userId: req.userId! },
    });
    res.json({ message: "All notifications cleared" });
  } catch (error) {
    res.status(500).json({ error: "Failed to clear notifications" });
  }
});

app.delete("/api/notifications/:id", authMiddleware, async (req: AuthenticatedRequest, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const item = await prisma.appNotification.findUnique({ where: { id } });
    if (!item || item.userId !== req.userId) {
      res.status(403).json({ error: "Access denied. Action not permitted." });
      return;
    }
    await prisma.appNotification.delete({
      where: { id },
    });
    res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete notification" });
  }
});

app.listen(PORT, () => {
  console.log(`MindVault backend API running on port ${PORT}`);
});
