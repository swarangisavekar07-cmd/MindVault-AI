import { Subject } from "../components/SubjectModal";
import { TimetableClass } from "../components/TimetableModal";
import { Assignment, Note, Reminder, AppNotification } from "../data/mockData";

const BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "https://mindvault-ai-4eey.onrender.com" : "http://localhost:3001");

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem("mindvault_token") || localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function handleUnauthorized(res: Response) {
  if (res.status === 401) {
    window.dispatchEvent(new Event("mindvault_unauthorized"));
  }
}

// ─── SUBJECTS ─────────────────────────────────────────────────────────────────

export async function fetchSubjects(): Promise<Subject[]> {
  const res = await fetch(`${BASE_URL}/api/subjects`, {
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
  });
  if (!res.ok) {
    handleUnauthorized(res);
    throw new Error("Failed to fetch subjects");
  }
  return res.json();
}

export async function createSubject(subject: Subject): Promise<Subject> {
  const { classroom, semester, ...baseData } = subject;
  const fullPayload: any = { ...baseData };
  if (classroom && classroom.trim()) fullPayload.classroom = classroom;
  if (semester && semester.trim()) fullPayload.semester = semester;

  const res = await fetch(`${BASE_URL}/api/subjects`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
    body: JSON.stringify(fullPayload),
  });

  if (!res.ok) {
    handleUnauthorized(res);
    if (res.status === 500 && (classroom || semester)) {
      const fallbackRes = await fetch(`${BASE_URL}/api/subjects`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify(baseData),
      });
      if (fallbackRes.ok) return fallbackRes.json();
    }
    throw new Error("Failed to create subject");
  }
  return res.json();
}

export async function updateSubject(code: string, subject: Partial<Subject>): Promise<Subject> {
  const { classroom, semester, ...baseData } = subject;
  const fullPayload: any = { ...baseData };
  if (classroom !== undefined && classroom.trim()) fullPayload.classroom = classroom;
  if (semester !== undefined && semester.trim()) fullPayload.semester = semester;

  const res = await fetch(`${BASE_URL}/api/subjects/${encodeURIComponent(code)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
    body: JSON.stringify(fullPayload),
  });

  if (!res.ok) {
    handleUnauthorized(res);
    if (res.status === 500 && (classroom !== undefined || semester !== undefined)) {
      const fallbackRes = await fetch(`${BASE_URL}/api/subjects/${encodeURIComponent(code)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify(baseData),
      });
      if (fallbackRes.ok) return fallbackRes.json();
    }
    throw new Error("Failed to update subject");
  }
  return res.json();
}

export async function deleteSubject(code: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/subjects/${encodeURIComponent(code)}`, {
    method: "DELETE",
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) {
    handleUnauthorized(res);
    throw new Error("Failed to delete subject");
  }
}

// ─── TIMETABLE ────────────────────────────────────────────────────────────────

export async function fetchTimetable(): Promise<TimetableClass[]> {
  const res = await fetch(`${BASE_URL}/api/timetable`, {
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
  });
  if (!res.ok) {
    handleUnauthorized(res);
    throw new Error("Failed to fetch timetable");
  }
  return res.json();
}

export async function createTimetableClass(slot: TimetableClass): Promise<TimetableClass> {
  const res = await fetch(`${BASE_URL}/api/timetable`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
    body: JSON.stringify(slot),
  });
  if (!res.ok) {
    handleUnauthorized(res);
    throw new Error("Failed to create timetable slot");
  }
  return res.json();
}

export async function updateTimetableClass(id: string, slot: Partial<TimetableClass>): Promise<TimetableClass> {
  const res = await fetch(`${BASE_URL}/api/timetable/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
    body: JSON.stringify(slot),
  });
  if (!res.ok) {
    handleUnauthorized(res);
    throw new Error("Failed to update timetable slot");
  }
  return res.json();
}

export async function deleteTimetableClass(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/timetable/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) {
    handleUnauthorized(res);
    throw new Error("Failed to delete timetable slot");
  }
}

// ─── ASSIGNMENTS ──────────────────────────────────────────────────────────────

export async function fetchAssignments(): Promise<Assignment[]> {
  const res = await fetch(`${BASE_URL}/api/assignments`, {
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
  });
  if (!res.ok) {
    handleUnauthorized(res);
    throw new Error("Failed to fetch assignments");
  }
  return res.json();
}

export async function createAssignment(assignment: Omit<Assignment, "id"> | Assignment): Promise<Assignment> {
  const { id, ...data } = assignment as Assignment;
  const res = await fetch(`${BASE_URL}/api/assignments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    handleUnauthorized(res);
    throw new Error("Failed to create assignment");
  }
  return res.json();
}

export async function updateAssignment(id: number, assignment: Partial<Assignment>): Promise<Assignment> {
  const res = await fetch(`${BASE_URL}/api/assignments/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
    body: JSON.stringify(assignment),
  });
  if (!res.ok) {
    handleUnauthorized(res);
    throw new Error("Failed to update assignment");
  }
  return res.json();
}

export async function deleteAssignment(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/assignments/${id}`, {
    method: "DELETE",
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) {
    handleUnauthorized(res);
    throw new Error("Failed to delete assignment");
  }
}

// ─── REMINDERS ────────────────────────────────────────────────────────────────

export async function fetchReminders(): Promise<Reminder[]> {
  const res = await fetch(`${BASE_URL}/api/reminders`, {
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
  });
  if (!res.ok) {
    handleUnauthorized(res);
    throw new Error("Failed to fetch reminders");
  }
  return res.json();
}

export async function createReminder(reminder: Omit<Reminder, "id"> | Reminder): Promise<Reminder> {
  const { id, ...data } = reminder as Reminder;
  const res = await fetch(`${BASE_URL}/api/reminders`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    handleUnauthorized(res);
    throw new Error("Failed to create reminder");
  }
  return res.json();
}

export async function updateReminder(id: number, reminder: Partial<Reminder>): Promise<Reminder> {
  const res = await fetch(`${BASE_URL}/api/reminders/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
    body: JSON.stringify(reminder),
  });
  if (!res.ok) {
    handleUnauthorized(res);
    throw new Error("Failed to update reminder");
  }
  return res.json();
}

export async function deleteReminder(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/reminders/${id}`, {
    method: "DELETE",
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) {
    handleUnauthorized(res);
    throw new Error("Failed to delete reminder");
  }
}

// ─── NOTES ────────────────────────────────────────────────────────────────────

export async function fetchNotes(): Promise<Note[]> {
  const res = await fetch(`${BASE_URL}/api/notes`, {
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
  });
  if (!res.ok) {
    handleUnauthorized(res);
    throw new Error("Failed to fetch notes");
  }
  return res.json();
}

export async function createNote(note: Omit<Note, "id"> | Note): Promise<Note> {
  const { id, pinned, fav, ...baseData } = note as any;
  const fullPayload: any = { ...baseData };
  if (pinned !== undefined) fullPayload.pinned = pinned;
  if (fav !== undefined) fullPayload.fav = fav;

  const res = await fetch(`${BASE_URL}/api/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
    body: JSON.stringify(fullPayload),
  });

  if (!res.ok) {
    handleUnauthorized(res);
    // Fallback: If 500 error occurs due to backend server running unmigrated schema without pinned/fav, retry with base payload
    if (res.status === 500 && (pinned !== undefined || fav !== undefined)) {
      const fallbackRes = await fetch(`${BASE_URL}/api/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify(baseData),
      });
      if (fallbackRes.ok) return fallbackRes.json();
    }
    throw new Error("Failed to create note on backend");
  }
  return res.json();
}

export async function updateNote(id: number, note: Partial<Note>): Promise<Note> {
  const { pinned, fav, ...baseData } = note as any;
  const fullPayload: any = { ...baseData };
  if (pinned !== undefined) fullPayload.pinned = pinned;
  if (fav !== undefined) fullPayload.fav = fav;

  const res = await fetch(`${BASE_URL}/api/notes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
    body: JSON.stringify(fullPayload),
  });

  if (!res.ok) {
    handleUnauthorized(res);
    if (res.status === 500 && (pinned !== undefined || fav !== undefined)) {
      const fallbackRes = await fetch(`${BASE_URL}/api/notes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify(baseData),
      });
      if (fallbackRes.ok) return fallbackRes.json();
    }
    throw new Error("Failed to update note on backend");
  }
  return res.json();
}

export async function deleteNote(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/notes/${id}`, {
    method: "DELETE",
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) {
    handleUnauthorized(res);
    throw new Error("Failed to delete note");
  }
}

// ─── NOTIFICATIONS ───────────────────────────────────────────────────────────

export async function fetchNotifications(): Promise<AppNotification[]> {
  const res = await fetch(`${BASE_URL}/api/notifications`, {
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
  });
  if (!res.ok) {
    handleUnauthorized(res);
    throw new Error("Failed to fetch notifications");
  }
  return res.json();
}

export async function createNotification(notification: Omit<AppNotification, "id"> | AppNotification): Promise<AppNotification> {
  const { id, ...data } = notification as AppNotification;
  const res = await fetch(`${BASE_URL}/api/notifications`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    handleUnauthorized(res);
    throw new Error("Failed to create notification");
  }
  return res.json();
}

export async function updateNotification(id: number, notification: Partial<AppNotification>): Promise<AppNotification> {
  const res = await fetch(`${BASE_URL}/api/notifications/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
    body: JSON.stringify(notification),
  });
  if (!res.ok) {
    handleUnauthorized(res);
    throw new Error("Failed to update notification");
  }
  return res.json();
}

export async function markAllNotificationsRead(): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/notifications/mark-all-read`, {
    method: "PUT",
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) {
    handleUnauthorized(res);
    throw new Error("Failed to mark notifications read");
  }
}

export async function clearAllNotifications(): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/notifications/clear-all`, {
    method: "DELETE",
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) {
    handleUnauthorized(res);
    throw new Error("Failed to clear notifications");
  }
}

export async function deleteNotification(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/notifications/${id}`, {
    method: "DELETE",
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) {
    handleUnauthorized(res);
    throw new Error("Failed to delete notification");
  }
}

// ─── USER PROFILE & BIO/INTERESTS ────────────────────────────────────────────

export async function fetchUserProfile(): Promise<any> {
  const res = await fetch(`${BASE_URL}/api/auth/profile`, {
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
  });
  if (!res.ok) {
    handleUnauthorized(res);
    throw new Error("Failed to fetch profile");
  }
  return res.json();
}

export async function updateUserProfile(data: { name?: string; major?: string; year?: string; bio?: string; interests?: string }): Promise<any> {
  const res = await fetch(`${BASE_URL}/api/auth/profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    handleUnauthorized(res);
    throw new Error("Failed to update profile");
  }
  return res.json();
}
