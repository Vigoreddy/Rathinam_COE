"use client";

export type UserRole = "STAFF" | "HOD" | "DEAN" | "COE";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  department: string;
  avatarBg: string;
  isSubjectFaculty?: boolean; // Specific to HOD role permission rule
}

export const PRESET_USERS: Record<UserRole, AuthUser> = {
  STAFF: {
    id: "usr-staff",
    name: "Mr. Vignesh M",
    email: "vignesh.viscom@rathinam.in",
    role: "STAFF",
    roleTitle: "Faculty / Staff",
    department: "Visual Communication",
    avatarBg: "#6366f1",
  },
  HOD: {
    id: "usr-hod",
    name: "Dr. T.J RAJU",
    email: "hod.viscom@rathinam.in",
    role: "HOD",
    roleTitle: "HOD / Associate Dean",
    department: "Visual Arts & VFX",
    avatarBg: "#0284c7",
    isSubjectFaculty: true,
  },
  DEAN: {
    id: "usr-dean",
    name: "Dr. V Rajlakshmi",
    email: "director.raale@rathinam.in",
    role: "DEAN",
    roleTitle: "Dean Academic Affairs",
    department: "School of Media & Arts",
    avatarBg: "#8b5cf6",
  },
  COE: {
    id: "usr-coe",
    name: "Dr. Rajubalaji",
    email: "coe@rathinam.in",
    role: "COE",
    roleTitle: "Controller of Examinations",
    department: "Exam Cell Office",
    avatarBg: "#10b981",
  },
};

export function authenticateUser(emailInput: string, passwordInput: string): { user: AuthUser | null; error: string | null } {
  const cleanEmail = emailInput.trim().toLowerCase();
  const cleanPassword = passwordInput.trim();

  if (cleanPassword !== "123") {
    return { user: null, error: "Invalid password. Use '123' as password." };
  }

  const matchedRole = (Object.keys(PRESET_USERS) as UserRole[]).find(
    (r) => PRESET_USERS[r].email.toLowerCase() === cleanEmail
  );

  if (!matchedRole) {
    return {
      user: null,
      error: "Invalid email. Valid credentials are: vignesh.viscom@rathinam.in, hod.viscom@rathinam.in, director.raale@rathinam.in, coe@rathinam.in",
    };
  }

  return { user: PRESET_USERS[matchedRole], error: null };
}

// Check permissions strictly matching the matrix table
export function hasPermission(role: UserRole, route: string, isSubjectFaculty: boolean = true): boolean {
  const normalizedRoute = route.replace(/\/$/, "").split("?")[0];

  switch (normalizedRoute) {
    case "/dashboard":
    case "":
      return true; // All roles

    case "/subjects":
    case "/subject":
    case "/syllabus":
    case "/question-bank":
    case "/bulk-upload":
      if (role === "COE" || role === "STAFF") return true;
      if (role === "HOD") return Boolean(isSubjectFaculty);
      if (role === "DEAN") return false;
      return false;

    case "/verify-questions":
    case "/approval":
      if (role === "COE" || role === "HOD" || role === "DEAN") return true;
      if (role === "STAFF") return false;
      return false;

    case "/reports":
    case "/manual-questions":
      if (role === "COE") return true;
      return false; // STAFF, HOD, DEAN denied

    case "/print-paper":
      return role === "COE"; // ONLY COE (Controller of Examinations) can print question papers

    case "/notifications":
    case "/settings":
      return true; // All roles

    default:
      return true;
  }
}

const STORAGE_KEY = "exam_cell_auth_user";

export const authStore = {
  getCurrentUser(): AuthUser {
    if (typeof window === "undefined") return PRESET_USERS.STAFF;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.role && PRESET_USERS[parsed.role as UserRole]) {
          const fresh = PRESET_USERS[parsed.role as UserRole];
          return {
            ...parsed,
            name: fresh.name,
            email: fresh.email,
            roleTitle: fresh.roleTitle,
          };
        }
      }
    } catch (e) {
      console.error("Auth storage read error:", e);
    }
    return PRESET_USERS.STAFF;
  },

  setCurrentUser(user: AuthUser): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      window.dispatchEvent(new CustomEvent("exam-cell-auth-update", { detail: user }));
    } catch (e) {
      console.error("Auth storage save error:", e);
    }
  },

  loginAs(role: UserRole, customIsSubjectFaculty?: boolean): AuthUser {
    const preset = PRESET_USERS[role];
    const userToSave: AuthUser = {
      ...preset,
      isSubjectFaculty: customIsSubjectFaculty !== undefined ? customIsSubjectFaculty : (preset.isSubjectFaculty ?? true),
    };
    this.setCurrentUser(userToSave);
    return userToSave;
  },

  toggleHodSubjectFaculty(): AuthUser {
    const current = this.getCurrentUser();
    if (current.role !== "HOD") return current;
    const updated: AuthUser = {
      ...current,
      isSubjectFaculty: !current.isSubjectFaculty,
    };
    this.setCurrentUser(updated);
    return updated;
  },

  logout(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent("exam-cell-auth-update", { detail: null }));
  },
};
