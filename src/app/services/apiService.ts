import { Subject } from "../components/SubjectModal";

const BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "https://mindvault-ai-4eey.onrender.com" : "http://localhost:3001");

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem("mindvault_token") || localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Fetch subjects for the current authenticated user from Express/Prisma backend.
 */
export async function fetchSubjects(): Promise<Subject[]> {
  const res = await fetch(`${BASE_URL}/api/subjects`, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
  });
  if (!res.ok) {
    if (res.status === 401) {
      window.dispatchEvent(new Event("mindvault_unauthorized"));
    }
    throw new Error("Failed to fetch subjects from backend");
  }
  return res.json();
}

/**
 * Create a new subject on the backend.
 */
export async function createSubject(subject: Subject): Promise<Subject> {
  const { classroom, semester, ...baseData } = subject;
  const fullPayload: any = { ...baseData };
  if (classroom && classroom.trim()) fullPayload.classroom = classroom;
  if (semester && semester.trim()) fullPayload.semester = semester;

  const res = await fetch(`${BASE_URL}/api/subjects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(fullPayload),
  });

  if (!res.ok) {
    if (res.status === 401) {
      window.dispatchEvent(new Event("mindvault_unauthorized"));
    }
    // Fallback: If backend server returns 500 due to unmigrated schema, retry with base payload
    if (res.status === 500 && (classroom || semester)) {
      const fallbackRes = await fetch(`${BASE_URL}/api/subjects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify(baseData),
      });
      if (fallbackRes.ok) {
        return fallbackRes.json();
      }
    }
    throw new Error("Failed to create subject on backend");
  }
  return res.json();
}

/**
 * Update an existing subject on the backend.
 */
export async function updateSubject(code: string, subject: Partial<Subject>): Promise<Subject> {
  const { classroom, semester, ...baseData } = subject;
  const fullPayload: any = { ...baseData };
  if (classroom !== undefined && classroom.trim()) fullPayload.classroom = classroom;
  if (semester !== undefined && semester.trim()) fullPayload.semester = semester;

  const res = await fetch(`${BASE_URL}/api/subjects/${encodeURIComponent(code)}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(fullPayload),
  });

  if (!res.ok) {
    if (res.status === 401) {
      window.dispatchEvent(new Event("mindvault_unauthorized"));
    }
    // Fallback: Retry with base fields if backend server returns 500
    if (res.status === 500 && (classroom !== undefined || semester !== undefined)) {
      const fallbackRes = await fetch(`${BASE_URL}/api/subjects/${encodeURIComponent(code)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify(baseData),
      });
      if (fallbackRes.ok) {
        return fallbackRes.json();
      }
    }
    throw new Error("Failed to update subject on backend");
  }
  return res.json();
}

/**
 * Delete a subject by code on the backend.
 */
export async function deleteSubject(code: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/subjects/${encodeURIComponent(code)}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeader(),
    },
  });
  if (!res.ok) {
    if (res.status === 401) {
      window.dispatchEvent(new Event("mindvault_unauthorized"));
    }
    throw new Error("Failed to delete subject from backend");
  }
}
