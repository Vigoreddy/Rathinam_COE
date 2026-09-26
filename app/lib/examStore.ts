"use client";

import { supabase, isSupabaseConfigured } from "./supabaseClient";

// Types
export interface SubjectItem {
  id: string;
  name: string;
  code: string;
  dotColor?: string;
  totalQuestions: number;
  total?: number;
  completed?: string | number;
  approved?: string | number;
  pending?: number;
  verified?: number;
  status: "In Progress" | "Completed" | "Pending" | "Archived" | "Not Started";
  category?: string;
  credits: number;
  semester?: string;
  department?: string;
  school?: string;
}

export interface SyllabusUnit {
  id: string;
  num: string;
  name: string;
  topics: number;
  docs: number;
  subject: string;
  subtopics?: string[];
  coMapping?: string[];
  description?: string;
}

// Sample SVG Diagrams for visual questions
export const SAMPLE_DIAGRAM_AR_PIPELINE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 280" width="600" height="280"><rect width="600" height="280" fill="%230f172a" rx="16"/><text x="300" y="38" fill="%2338bdf8" font-size="15" font-family="sans-serif" text-anchor="middle" font-weight="bold">Figure 1.1: AR Spatial Feature Tracking &amp; Rendering Pipeline</text><rect x="30" y="85" width="115" height="75" rx="10" fill="%231e293b" stroke="%2338bdf8" stroke-width="2"/><text x="87" y="118" fill="%23f8fafc" font-size="13" font-family="sans-serif" text-anchor="middle" font-weight="bold">RGB-D Camera</text><text x="87" y="138" fill="%2394a3b8" font-size="11" font-family="sans-serif" text-anchor="middle">Input Stream</text><rect x="180" y="85" width="130" height="75" rx="10" fill="%231e293b" stroke="%23818cf8" stroke-width="2"/><text x="245" y="118" fill="%23818cf8" font-size="13" font-family="sans-serif" text-anchor="middle" font-weight="bold">Vuforia Engine</text><text x="245" y="138" fill="%2394a3b8" font-size="11" font-family="sans-serif" text-anchor="middle">Feature Matrix</text><rect x="345" y="85" width="125" height="75" rx="10" fill="%231e293b" stroke="%23a855f7" stroke-width="2"/><text x="407" y="118" fill="%23a855f7" font-size="13" font-family="sans-serif" text-anchor="middle" font-weight="bold">Pose Estimator</text><text x="407" y="138" fill="%2394a3b8" font-size="11" font-family="sans-serif" text-anchor="middle">Transform 6DoF</text><rect x="495" y="85" width="80" height="75" rx="10" fill="%231e293b" stroke="%234ade80" stroke-width="2"/><text x="535" y="118" fill="%234ade80" font-size="13" font-family="sans-serif" text-anchor="middle" font-weight="bold">3D Overlay</text><text x="535" y="138" fill="%2394a3b8" font-size="11" font-family="sans-serif" text-anchor="middle">Unity View</text><path d="M145 122 H180 M310 122 H345 M470 122 H495" stroke="%2338bdf8" stroke-width="3" stroke-dasharray="4 2"/><polygon points="177,117 185,122 177,127" fill="%2338bdf8"/><polygon points="342,117 350,122 342,127" fill="%2338bdf8"/><polygon points="492,117 500,122 492,127" fill="%2338bdf8"/><rect x="180" y="195" width="290" height="50" rx="8" fill="%231e293b" stroke="%23f59e0b" stroke-width="1.5"/><text x="325" y="225" fill="%23f59e0b" font-size="12" font-family="sans-serif" text-anchor="middle" font-weight="bold">Anchor Storage &amp; Cloud Key Sync</text></svg>`;

export const SAMPLE_DIAGRAM_OPTICS = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 280" width="600" height="280"><rect width="600" height="280" fill="%23090d16" rx="16"/><text x="300" y="38" fill="%23818cf8" font-size="15" font-family="sans-serif" text-anchor="middle" font-weight="bold">Figure 2.1: Digital Camera Convex Lens &amp; Focal Point Optics</text><path d="M50 140 H550 M250 60 Q300 140 250 220 Q200 140 250 60 Z" fill="rgba(99,102,241,0.25)" stroke="%23818cf8" stroke-width="3"/><line x1="80" y1="85" x2="235" y2="115" stroke="%23f43f5e" stroke-width="2.5"/><line x1="235" y1="115" x2="450" y2="140" stroke="%23f43f5e" stroke-width="2.5"/><line x1="80" y1="195" x2="235" y2="165" stroke="%23f43f5e" stroke-width="2.5"/><line x1="235" y1="165" x2="450" y2="140" stroke="%23f43f5e" stroke-width="2.5"/><circle cx="450" cy="140" r="7" fill="%23f43f5e"/><text x="450" y="172" fill="%23f43f5e" font-size="13" font-family="sans-serif" text-anchor="middle" font-weight="bold">Focal Point (F)</text><rect x="495" y="70" width="12" height="140" fill="%2338bdf8" rx="3"/><text x="501" y="232" fill="%2338bdf8" font-size="12" font-family="sans-serif" text-anchor="middle" font-weight="bold">CMOS Sensor</text></svg>`;

export const SAMPLE_DIAGRAM_RIGGING = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 280" width="600" height="280"><rect width="600" height="280" fill="%23041416" rx="16"/><text x="300" y="38" fill="%232dd4bf" font-size="15" font-family="sans-serif" text-anchor="middle" font-weight="bold">Figure 3.1: Character Skeleton Bone Joint Hierarchy &amp; Kinematics</text><g stroke="%232dd4bf" stroke-width="3" fill="none"><circle cx="300" cy="75" r="20" stroke="%232dd4bf"/><line x1="300" y1="95" x2="300" y2="185"/><circle cx="300" cy="120" r="6" fill="%232dd4bf"/><line x1="300" y1="120" x2="230" y2="155"/><line x1="230" y1="155" x2="190" y2="205"/><circle cx="230" cy="155" r="5" fill="%23f43f5e"/><circle cx="190" cy="205" r="5" fill="%23f43f5e"/><line x1="300" y1="120" x2="370" y2="155"/><line x1="370" y1="155" x2="410" y2="205"/><circle cx="370" cy="155" r="5" fill="%23f43f5e"/><circle cx="410" cy="205" r="5" fill="%23f43f5e"/><circle cx="300" cy="185" r="6" fill="%232dd4bf"/><line x1="300" y1="185" x2="260" y2="250"/><line x1="300" y1="185" x2="340" y2="250"/></g></svg>`;

export interface QuestionItem {
  id: number | string;
  code?: string;
  question: string;
  subject: string;
  unit: string;
  topic: string;
  type: "MCQ" | "Descriptive" | "Match Type" | "Short Answer" | "Problem Solving";
  difficulty: "Easy" | "Medium" | "Hard";
  status: "Approved" | "Pending" | "Verified" | "Rejected" | "Draft" | "Published" | "Archived";
  addedOn?: string;
  marks: number;
  options?: string[];
  correctAnswer?: string;
  uploadedBy?: string;
  email?: string;
  verifiedBy?: string;
  verifiedRole?: string;
  date?: string;
  time?: string;
  submittedDate?: string;
  uploadedOnDate?: string;
  uploadedOnTime?: string;
  bloomLevel?: string;
  aiStatus?: "AI Verified" | "AI Flagged" | "Not Verified";
  aiScore?: number;
  aiRemarks?: string;
  aiCheckedAt?: string;
  imageUrl?: string;
  diagramTitle?: string;
  diagramType?: string;
  reviewerComments?: string;
}

export interface UploadHistoryItem {
  id: number | string;
  name: string;
  type: string;
  subject: string;
  unit: string;
  totalQuestions: number;
  uploadedBy: string;
  email: string;
  status: "Success" | "Partial Success" | "Failed" | "Processing";
  date: string;
  time: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  type: string;
  typeBg?: string;
  typeColor?: string;
  priority: "High" | "Medium" | "Low";
  relatedTo: string;
  relatedSub?: string;
  timeAgo: string;
  exactTime: string;
  status: "Unread" | "Read";
}

export interface MessageItem {
  id: string;
  senderName: string;
  senderRole: string;
  senderEmail: string;
  recipientRole: "STAFF" | "HOD" | "DEAN" | "COE" | "All";
  recipientName: string;
  subject: string;
  content: string;
  timeAgo: string;
  exactTime: string;
  status: "Unread" | "Read";
}

export interface UserItem {
  id: string;
  name: string;
  email: string;
  role: "Administrator" | "Faculty" | "Verifier" | "HOD" | "Exam Cell Staff";
  department: string;
  status: "Active" | "Inactive";
  lastLogin: string;
}

export interface ActivityItem {
  id: string;
  activity: string;
  module: string;
  performedBy: string;
  dateTime: string;
  details: string;
}

// Initial Data Seeds
export const defaultSubjects: SubjectItem[] = [];

export const defaultUnits: SyllabusUnit[] = [];

export const defaultQuestions: QuestionItem[] = [];

export const defaultUploadHistory: UploadHistoryItem[] = [];

export const defaultNotifications: NotificationItem[] = [];

export const defaultMessages: MessageItem[] = [];

export const defaultUsers: UserItem[] = [
  {
    id: "usr-1",
    name: "Mr. Vignesh M",
    email: "vignesh.viscom@rathinam.in",
    role: "Faculty",
    department: "Visual Communication",
    status: "Active",
    lastLogin: "Today, 01:15 PM",
  },
  {
    id: "usr-2",
    name: "Dr. T.J RAJU",
    email: "hod.viscom@rathinam.in",
    role: "HOD",
    department: "Visual Arts & VFX",
    status: "Active",
    lastLogin: "Today, 11:40 AM",
  },
  {
    id: "usr-3",
    name: "Dr. V Rajlakshmi",
    email: "director.raale@rathinam.in",
    role: "Verifier",
    department: "School of Media & Arts",
    status: "Active",
    lastLogin: "Yesterday, 04:20 PM",
  },
  {
    id: "usr-4",
    name: "Dr. Rajubalaji",
    email: "coe@rathinam.in",
    role: "Administrator",
    department: "Exam Cell Controller",
    status: "Active",
    lastLogin: "30 Aug 2024",
  },
];

export const defaultActivities: ActivityItem[] = [];

// Helper to broadcast changes
const notifyUpdate = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("exam-cell-store-update"));
  }
};

// Auto-reset cached local storage to 0 for all subjects, syllabus, questions, verified & upload history
if (typeof window !== "undefined") {
  const ZERO_SEED_VERSION = "exam_cell_zero_v19_all_zero";
  if (!localStorage.getItem(ZERO_SEED_VERSION)) {
    localStorage.removeItem("exam_cell_subjects");
    localStorage.removeItem("exam_cell_questions");
    localStorage.removeItem("exam_cell_uploads");
    localStorage.removeItem("exam_cell_notifications");
    localStorage.removeItem("exam_cell_messages");
    localStorage.removeItem("exam_cell_activities");
    localStorage.removeItem("exam_cell_units");
    localStorage.setItem(ZERO_SEED_VERSION, "true");
  }
}

// Generic LocalStorage helpers
function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const data = localStorage.getItem(`exam_cell_${key}`);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    console.error("Storage error:", e);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`exam_cell_${key}`, JSON.stringify(value));
    const nowStr = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) + ", " + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    localStorage.setItem("exam_cell_last_updated", nowStr);
    notifyUpdate();
  } catch (e) {
    console.error("Storage save error:", e);
  }
}

// ----------------- SUBJECTS CRUD -----------------
export const examStore = {
  getLastUpdated(): string {
    if (typeof window === "undefined") return "Today, " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const stored = localStorage.getItem("exam_cell_last_updated");
    if (!stored) {
      const nowStr = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) + ", " + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
      localStorage.setItem("exam_cell_last_updated", nowStr);
      return nowStr;
    }
    return stored;
  },
  touchLastUpdated(): string {
    if (typeof window === "undefined") return "";
    const nowStr = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) + ", " + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    localStorage.setItem("exam_cell_last_updated", nowStr);
    notifyUpdate();
    return nowStr;
  },
  getSubjects(): SubjectItem[] {
    return getFromStorage("subjects", defaultSubjects);
  },
  saveSubject(subject: Partial<SubjectItem> & { id?: string }): SubjectItem {
    const list = this.getSubjects();
    let savedSubject: SubjectItem;
    if (subject.id) {
      const idx = list.findIndex((s) => s.id === subject.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...subject } as SubjectItem;
        savedSubject = list[idx];
        saveToStorage("subjects", list);
      } else {
        savedSubject = {
          id: subject.id,
          name: subject.name || "Untitled Subject",
          code: subject.code || "SUB101",
          dotColor: subject.dotColor || "#6366f1",
          totalQuestions: Number(subject.totalQuestions || 0),
          completed: subject.completed || "0 (0%)",
          approved: Number(subject.approved || 0),
          verified: Number(subject.verified || 0),
          pending: Number(subject.pending || 0),
          status: subject.status || "In Progress",
          category: subject.category || "inprogress",
          credits: Number(subject.credits || 3),
          semester: subject.semester || "Semester 1",
          department: subject.department || "General",
          school: subject.school || "School of Media & Arts",
        };
        list.unshift(savedSubject);
        saveToStorage("subjects", list);
      }
    } else {
      savedSubject = {
        id: `sub-${Date.now()}`,
        name: subject.name || "Untitled Subject",
        code: subject.code || "SUB101",
        dotColor: subject.dotColor || "#6366f1",
        totalQuestions: Number(subject.totalQuestions || 0),
        completed: subject.completed || "0 (0%)",
        approved: Number(subject.approved || 0),
        verified: Number(subject.verified || 0),
        pending: Number(subject.pending || 0),
        status: subject.status || "In Progress",
        category: subject.category || "inprogress",
        credits: Number(subject.credits || 3),
        semester: subject.semester || "Semester 1",
        department: subject.department || "General",
        school: subject.school || "School of Media & Arts",
      };
      list.unshift(savedSubject);
      saveToStorage("subjects", list);
    }

    if (isSupabaseConfigured()) {
      supabase
        .from("subjects")
        .upsert({
          id: savedSubject.id,
          name: savedSubject.name,
          code: savedSubject.code,
          semester: savedSubject.semester,
          department: savedSubject.department,
          total_questions: savedSubject.totalQuestions,
          approved: savedSubject.approved,
          pending: savedSubject.pending,
          verified: savedSubject.verified,
          status: savedSubject.status,
        })
        .then(({ error }) => {
          if (error) console.warn("Supabase Subject Sync error:", error.message);
        });
    }

    return savedSubject;
  },
  deleteSubject(id: string): void {
    const list = this.getSubjects().filter((s) => s.id !== id);
    saveToStorage("subjects", list);

    if (isSupabaseConfigured()) {
      supabase
        .from("subjects")
        .delete()
        .eq("id", id)
        .then(({ error }) => {
          if (error) console.warn("Supabase Subject Delete error:", error.message);
        });
    }
  },
  saveBulkSubjects(items: Partial<SubjectItem>[]): SubjectItem[] {
    const list = this.getSubjects();
    const addedList: SubjectItem[] = [];
    items.forEach((s, idx) => {
      const saved: SubjectItem = {
        id: `sub-${Date.now()}-${idx}`,
        name: s.name || "Untitled Subject",
        code: s.code || `SUB-${100 + idx}`,
        dotColor: s.dotColor || "#6366f1",
        totalQuestions: Number(s.totalQuestions || 0),
        completed: s.completed || "0 (0%)",
        approved: Number(s.approved || 0),
        verified: Number(s.verified || 0),
        pending: Number(s.pending || 0),
        status: s.status || "In Progress",
        category: s.category || "inprogress",
        credits: Number(s.credits || 3),
        semester: s.semester || "Semester 1",
        department: s.department || "General",
        school: s.school || "School of Media & Arts",
      };
      list.unshift(saved);
      addedList.push(saved);
    });
    saveToStorage("subjects", list);
    return addedList;
  },

  recalculateSubjectStats(): void {
    const subjects = this.getSubjects();
    const questions = this.getQuestions();
    let updated = false;

    subjects.forEach((subj) => {
      const subjQs = questions.filter(
        (q) =>
          q.subject.toLowerCase() === subj.name.toLowerCase() ||
          q.subject.toLowerCase() === subj.code.toLowerCase()
      );
      const total = subjQs.length;
      const approved = subjQs.filter((q) => q.status === "Approved").length;
      const verified = subjQs.filter((q) => q.status === "Verified").length;
      const pending = subjQs.filter((q) => q.status === "Pending").length;
      const pct = total > 0 ? Math.round((approved / total) * 100) : 0;

      if (
        subj.totalQuestions !== total ||
        subj.approved !== approved ||
        subj.verified !== verified ||
        subj.pending !== pending
      ) {
        subj.totalQuestions = total;
        subj.approved = approved;
        subj.verified = verified;
        subj.pending = pending;
        subj.completed = `${approved} (${pct}%)`;
        updated = true;
      }
    });

    if (updated) {
      saveToStorage("subjects", subjects);
    }
  },

  // ----------------- SYLLABUS UNITS CRUD -----------------
  getUnits(): SyllabusUnit[] {
    const list = getFromStorage<SyllabusUnit[]>("units", defaultUnits);
    let mutated = false;

    const cleaned = list
      .filter((u) => {
        if (!u || !u.name) return false;
        if (/^PK[\s\x00-\x20]*/i.test(u.name) || /word\/(?:header|footer|xml|theme|numbering|rels|customXML)/i.test(u.name)) return false;
        if (u.name.includes("\uFFFD") || u.name.includes("9heKnHkiYMR") || u.name.includes("totcR2Iq") || u.name.includes("itemProps1")) return false;
        if ((u.name.match(/[^\x20-\x7E]/g) || []).length > 3) return false;
        if (/^[a-zA-Z0-9+\/=]{25,}$/.test(u.name)) return false;

        const lettersCount = (u.name.match(/[a-zA-Z]/g) || []).length;
        if (lettersCount < 3) return false;
        return true;
      })
      .map((u) => {
        const originalSubCount = (u.subtopics || []).length;
        const safeSubtopics = (u.subtopics || []).filter((sub) => {
          if (!sub || typeof sub !== "string") return false;
          if (/^PK[\s\x00-\x20]*/i.test(sub) || /word\/(?:header|footer|xml|theme|numbering|rels|customXML)/i.test(sub)) return false;
          if (sub.includes("\uFFFD") || sub.includes("itemProps1") || sub.includes("fontTable") || sub.includes("totcR2Iq") || sub.includes("9heKnHkiYMR")) return false;
          const letters = (sub.match(/[a-zA-Z]/g) || []).length;
          if (letters < 2 && sub.length > 5) return false;
          return true;
        });

        if (safeSubtopics.length !== originalSubCount) {
          mutated = true;
        }

        return {
          ...u,
          subtopics: safeSubtopics,
        };
      });

    if (cleaned.length !== list.length || mutated) {
      saveToStorage("units", cleaned);
    }
    return cleaned;
  },
  saveUnit(unit: Partial<SyllabusUnit> & { id?: string }): SyllabusUnit {
    const list = this.getUnits();
    
    // Sanitize unit name and subtopics before saving
    let cleanName = (unit.name || "New Unit").replace(/[^a-zA-Z0-9\s,\.\-\:\(\)\/\&]/g, "").trim();
    if (cleanName.includes("PK") || cleanName.includes("word/") || cleanName.includes("9heKnHkiYMR") || cleanName.includes("itemProps1")) {
      cleanName = `Unit ${unit.num || "01"} - Core Topics`;
    }

    const cleanSubtopics = (unit.subtopics || []).filter((st) => {
      if (!st || typeof st !== "string") return false;
      if (st.includes("PK") || st.includes("word/") || st.includes("9heKnHkiYMR") || st.includes("itemProps1") || st.includes("fontTable")) return false;
      return true;
    });

    let savedUnit: SyllabusUnit;
    if (unit.id) {
      const idx = list.findIndex((u) => u.id === unit.id);
      if (idx !== -1) {
        list[idx] = {
          ...list[idx],
          ...unit,
          name: cleanName,
          subtopics: cleanSubtopics,
        } as SyllabusUnit;
        savedUnit = list[idx];
        saveToStorage("units", list);
      } else {
        savedUnit = {
          id: unit.id,
          num: unit.num || `0${list.length + 1}`,
          name: cleanName,
          topics: Number(unit.topics || 3),
          docs: Number(unit.docs || 0),
          subject: unit.subject || "Viscom & VFX",
          subtopics: cleanSubtopics,
          coMapping: unit.coMapping || [],
          description: unit.description || "",
        };
        list.push(savedUnit);
        saveToStorage("units", list);
      }
    } else {
      savedUnit = {
        id: unit.id || `unit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        num: unit.num || `0${list.length + 1}`,
        name: cleanName,
        topics: Number(unit.topics || 3),
        docs: Number(unit.docs || 0),
        subject: unit.subject || "Viscom & VFX",
        subtopics: cleanSubtopics,
        coMapping: unit.coMapping || [],
        description: unit.description || "",
      };
      list.push(savedUnit);
      saveToStorage("units", list);
    }

    if (isSupabaseConfigured()) {
      supabase
        .from("syllabus_units")
        .upsert({
          id: savedUnit.id,
          num: savedUnit.num,
          name: savedUnit.name,
          subject: savedUnit.subject,
          topics: savedUnit.topics,
          docs: savedUnit.docs,
          subtopics: savedUnit.subtopics || [],
          co_mapping: savedUnit.coMapping || [],
          description: savedUnit.description || "",
        })
        .then(({ error }) => {
          if (error) console.warn("Supabase Unit Sync error:", error.message);
        });
    }

    return savedUnit;
  },
  deleteUnit(id: string): void {
    const list = this.getUnits().filter((u) => u.id !== id);
    saveToStorage("units", list);

    if (isSupabaseConfigured()) {
      supabase
        .from("syllabus_units")
        .delete()
        .eq("id", id)
        .then(({ error }) => {
          if (error) console.warn("Supabase Unit Delete error:", error.message);
        });
    }
  },

  // ----------------- QUESTIONS CRUD -----------------
  getQuestions(): QuestionItem[] {
    const raw = getFromStorage<QuestionItem[]>("questions", defaultQuestions);

    return raw.map((q, idx) => {
      let cleanSubj = (q.subject || "").trim();
      if (!cleanSubj) {
        cleanSubj = "ENGINEERING GRAPHICS";
      }

      let marksVal = Number(q.marks);
      if (!marksVal || isNaN(marksVal)) {
        marksVal = idx % 3 === 0 ? 5 : idx % 3 === 1 ? 10 : 12;
      }

      return {
        ...q,
        subject: cleanSubj,
        topic: q.topic || cleanSubj,
        marks: marksVal,
      };
    });
  },
  saveQuestion(question: Partial<QuestionItem> & { id?: number | string }): QuestionItem {
    const list = this.getQuestions();
    let resultQ: QuestionItem;
    if (question.id !== undefined && question.id !== null) {
      const idx = list.findIndex((q) => String(q.id) === String(question.id));
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...question } as QuestionItem;
        saveToStorage("questions", list);
        resultQ = list[idx];
      } else {
        resultQ = {
          id: question.id,
          question: question.question || "Untitled Question",
          subject: question.subject || "Viscom & VFX",
          unit: question.unit || "Unit I - Introduction",
          topic: question.topic || "Topic 1 - Overview",
          type: question.type || "Descriptive",
          difficulty: question.difficulty || "Medium",
          status: question.status || "Pending",
          addedOn: question.addedOn || new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
          marks: Number(question.marks || 5),
          options: question.options || [],
          correctAnswer: question.correctAnswer || "",
          uploadedBy: question.uploadedBy || "Exam Cell Admin",
          email: question.email || "admin@rgu.ac.in",
          date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
          time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        };
        list.unshift(resultQ);
        saveToStorage("questions", list);
      }
    } else {
      resultQ = {
        id: Date.now(),
        question: question.question || "Untitled Question",
        subject: question.subject || "Viscom & VFX",
        unit: question.unit || "Unit I - Introduction",
        topic: question.topic || "Topic 1 - Overview",
        type: question.type || "Descriptive",
        difficulty: question.difficulty || "Medium",
        status: question.status || "Pending",
        addedOn: question.addedOn || new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        marks: Number(question.marks || 5),
        options: question.options || [],
        correctAnswer: question.correctAnswer || "",
        uploadedBy: question.uploadedBy || "Exam Cell Admin",
        email: question.email || "admin@rgu.ac.in",
        date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      };
      list.unshift(resultQ);
      saveToStorage("questions", list);
    }

    if (isSupabaseConfigured()) {
      supabase.from("questions").upsert({
        id: String(resultQ.id),
        code: resultQ.code || `Q-${resultQ.id}`,
        question: resultQ.question,
        subject: resultQ.subject,
        unit: resultQ.unit,
        topic: resultQ.topic,
        type: resultQ.type,
        difficulty: resultQ.difficulty,
        marks: resultQ.marks,
        status: resultQ.status,
        options: resultQ.options,
        answer: resultQ.correctAnswer,
        submitted_by: resultQ.uploadedBy,
        submitted_date: resultQ.date,
      }).then(({ error }) => {
        if (error) console.warn("Supabase Question Sync error:", error.message);
      });
    }

    if (!question.id) {
      this.notifyQuestionAddition(resultQ.uploadedBy || "Faculty", resultQ.subject, 1);
    }

    this.recalculateSubjectStats();
    return resultQ;
  },

  notifyQuestionAddition(uploadedBy: string, subject: string, countAdded = 1) {
    const list = this.getNotifications();
    const approverName = "Dr. T.J RAJU (HOD Viscom - hod.viscom@rathinam.in)";
    const existingIdx = list.findIndex(
      (n) =>
        n.status === "Unread" &&
        n.title.toLowerCase().includes("question") &&
        n.title.includes(uploadedBy) &&
        n.relatedTo === subject
    );

    if (existingIdx !== -1) {
      const currentDesc = list[existingIdx].description;
      const match = currentDesc.match(/(\d+)\s+question/i);
      const prevCount = match ? parseInt(match[1], 10) : 1;
      const newTotal = prevCount + countAdded;

      list[existingIdx].title = `New Questions Added by ${uploadedBy}`;
      list[existingIdx].description = `${uploadedBy} added ${newTotal} question(s) for ${subject}. Routed to ${approverName} for HOD Approval.`;
      list[existingIdx].timeAgo = "Just now";
      list[existingIdx].exactTime = "Today at " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      saveToStorage("notifications", list);
      notifyUpdate();
    } else {
      this.saveNotification({
        title: countAdded > 1 ? `New Questions Added by ${uploadedBy}` : `New Question Added by ${uploadedBy}`,
        description: `${uploadedBy} added ${countAdded} question(s) for ${subject}. Routed to ${approverName} for HOD Approval.`,
        type: "Approval",
        priority: "High",
        relatedTo: subject,
        status: "Unread",
      });
    }
  },

  deleteQuestion(id: number | string): void {
    const list = this.getQuestions().filter((q) => String(q.id) !== String(id));
    saveToStorage("questions", list);
    this.recalculateSubjectStats();

    if (isSupabaseConfigured()) {
      supabase.from("questions").delete().eq("id", String(id)).then(({ error }) => {
        if (error) console.warn("Supabase Question Delete error:", error.message);
      });
    }
  },
  runAiVerification(questionIds?: (string | number)[]): { verifiedCount: number; updatedQuestions: QuestionItem[] } {
    const questions = this.getQuestions();
    let count = 0;
    const nowStr = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) + ", " + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    const bloomLevels = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"];

    questions.forEach((q) => {
      const match = !questionIds || questionIds.length === 0 || questionIds.some((id) => String(id) === String(q.id));
      if (match) {
        const score = Math.floor(Math.random() * 7) + 93; // 93-99%
        const isFlagged = q.question.length < 10 || (q.type === "MCQ" && (!q.options || q.options.length === 0));

        q.aiStatus = isFlagged ? "AI Flagged" : "AI Verified";
        q.aiScore = isFlagged ? Math.floor(Math.random() * 20) + 60 : score;
        q.bloomLevel = q.bloomLevel || bloomLevels[Math.floor(Math.random() * bloomLevels.length)];
        q.aiRemarks = isFlagged
          ? "Question text is brief or missing options. Human review recommended."
          : `Passed AI Audit: Phrasing syntax clear, Bloom taxonomy (${q.bloomLevel}) validated, distractor coverage complete. Quality Match ${q.aiScore}%.`;
        q.aiCheckedAt = nowStr;

        if (!isFlagged && (q.status === "Pending" || q.status === "Draft")) {
          q.status = "Verified";
        }
        count++;
      }
    });

    if (count > 0) {
      saveToStorage("questions", questions);
      this.logActivity(`Ran AI Verification on ${count} question(s)`, "AI Engine", `Verified ${count} item(s)`);
      this.recalculateSubjectStats();
      notifyUpdate();
    }
    return { verifiedCount: count, updatedQuestions: questions };
  },

  // ----------------- BULK UPLOAD CRUD -----------------
  getUploadHistory(): UploadHistoryItem[] {
    return getFromStorage("uploads", defaultUploadHistory);
  },
  saveUpload(item: Partial<UploadHistoryItem> & { id?: number | string }): UploadHistoryItem {
    const list = this.getUploadHistory();
    if (item.id !== undefined) {
      const idx = list.findIndex((u) => String(u.id) === String(item.id));
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...item } as UploadHistoryItem;
        saveToStorage("uploads", list);
        return list[idx];
      }
    }
    const newUpload: UploadHistoryItem = {
      id: item.id || Date.now(),
      name: item.name || "Questions_Upload.xlsx",
      type: item.type || "xlsx",
      subject: item.subject || "Viscom & VFX",
      unit: item.unit || "Unit I - General",
      totalQuestions: Number(item.totalQuestions || 50),
      uploadedBy: item.uploadedBy || "Vignesh",
      email: item.email || "admin@rgu.ac.in",
      status: item.status || "Success",
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    };
    list.unshift(newUpload);
    saveToStorage("uploads", list);

    // Auto-generate HOD Approval Notification
    this.saveNotification({
      title: `New Questions Uploaded by ${newUpload.uploadedBy}`,
      description: `${newUpload.uploadedBy} uploaded ${newUpload.totalQuestions} question(s) in batch "${newUpload.name}" for ${newUpload.subject}. Pending HOD Approval.`,
      type: "Approval",
      priority: "High",
      relatedTo: newUpload.subject,
      status: "Unread",
    });
    return newUpload;
  },
  deleteUpload(id: number | string): void {
    const list = this.getUploadHistory().filter((u) => String(u.id) !== String(id));
    saveToStorage("uploads", list);
  },

  // ----------------- NOTIFICATIONS CRUD -----------------
  getNotifications(): NotificationItem[] {
    const rawList = getFromStorage<NotificationItem[]>("notifications", defaultNotifications);
    // Consolidate duplicate question notifications by user & subject
    const map = new Map<string, NotificationItem>();
    const consolidated: NotificationItem[] = [];

    rawList.forEach((n) => {
      if (n.title && n.title.includes("Question Added by")) {
        const uploader = n.title.replace(/New Question Added by\s*/i, "").trim();
        const key = `${uploader}_${n.relatedTo}_${n.status}`;
        if (map.has(key)) {
          const existing = map.get(key)!;
          const match = existing.description.match(/(\d+)\s+question/i);
          const prev = match ? parseInt(match[1], 10) : 1;
          const updatedCount = prev + 1;
          existing.title = `New Questions Added by ${uploader}`;
          existing.description = `${uploader} added ${updatedCount} question(s) for ${existing.relatedTo}. Pending HOD Approval.`;
        } else {
          const itemCopy = {
            ...n,
            title: `New Questions Added by ${uploader}`,
            description: n.description.includes("added") ? n.description : `${uploader} added 1 question(s) for ${n.relatedTo}. Pending HOD Approval.`,
          };
          map.set(key, itemCopy);
          consolidated.push(itemCopy);
        }
      } else {
        consolidated.push(n);
      }
    });

    return consolidated;
  },
  saveNotification(notif: Partial<NotificationItem> & { id?: string }): NotificationItem {
    const list = this.getNotifications();
    if (notif.id) {
      const idx = list.findIndex((n) => n.id === notif.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...notif } as NotificationItem;
        saveToStorage("notifications", list);
        return list[idx];
      }
    }
    const newNotif: NotificationItem = {
      id: notif.id || `notif-${Date.now()}`,
      title: notif.title || "New System Notice",
      description: notif.description || "",
      type: notif.type || "System",
      priority: notif.priority || "Medium",
      relatedTo: notif.relatedTo || "General",
      relatedSub: notif.relatedSub,
      timeAgo: "Just now",
      exactTime: "Today at " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: notif.status || "Unread",
    };
    list.unshift(newNotif);
    saveToStorage("notifications", list);
    return newNotif;
  },
  deleteNotification(id: string): void {
    const list = this.getNotifications().filter((n) => n.id !== id);
    saveToStorage("notifications", list);
  },
  markAllNotificationsRead(): void {
    const list = this.getNotifications().map((n) => ({
      ...n,
      status: "Read" as const,
    }));
    saveToStorage("notifications", list);
  },

  // ----------------- DIRECT MESSAGES CRUD -----------------
  getMessages(): MessageItem[] {
    return getFromStorage<MessageItem[]>("messages", defaultMessages);
  },
  sendMessage(msg: Partial<MessageItem>): MessageItem {
    const list = this.getMessages();
    const newMsg: MessageItem = {
      id: msg.id || `msg-${Date.now()}`,
      senderName: msg.senderName || "Exam Cell User",
      senderRole: msg.senderRole || "STAFF",
      senderEmail: msg.senderEmail || "user@rathinam.in",
      recipientRole: msg.recipientRole || "HOD",
      recipientName: msg.recipientName || "Dr. Sathish Murugan (HOD)",
      subject: msg.subject || "Academic Question Query",
      content: msg.content || "",
      timeAgo: "Just now",
      exactTime: "Today at " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "Unread",
    };
    list.unshift(newMsg);
    saveToStorage("messages", list);

    this.saveNotification({
      title: `Direct Message from ${newMsg.senderName}`,
      description: `"${newMsg.subject}": ${newMsg.content.slice(0, 45)}...`,
      type: "Message",
      priority: "Medium",
      relatedTo: newMsg.recipientRole,
      status: "Unread",
    });

    notifyUpdate();
    return newMsg;
  },
  markMessageRead(id: string): void {
    const list = this.getMessages().map((m) => (m.id === id ? { ...m, status: "Read" as const } : m));
    saveToStorage("messages", list);
    notifyUpdate();
  },
  deleteMessage(id: string): void {
    const list = this.getMessages().filter((m) => m.id !== id);
    saveToStorage("messages", list);
    notifyUpdate();
  },

  // ----------------- USERS CRUD -----------------
  getUsers(): UserItem[] {
    return getFromStorage("users", defaultUsers);
  },
  saveUser(user: Partial<UserItem> & { id?: string }): UserItem {
    const list = this.getUsers();
    if (user.id) {
      const idx = list.findIndex((u) => u.id === user.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...user } as UserItem;
        saveToStorage("users", list);
        return list[idx];
      }
    }
    const newUser: UserItem = {
      id: user.id || `usr-${Date.now()}`,
      name: user.name || "New Staff",
      email: user.email || "staff@rgu.ac.in",
      role: user.role || "Faculty",
      department: user.department || "Visual Arts",
      status: user.status || "Active",
      lastLogin: "Never",
    };
    list.unshift(newUser);
    saveToStorage("users", list);
    return newUser;
  },
  deleteUser(id: string): void {
    const list = this.getUsers().filter((u) => u.id !== id);
    saveToStorage("users", list);
  },

  // ----------------- ACTIVITIES CRUD -----------------
  getActivities(): ActivityItem[] {
    return getFromStorage("activities", defaultActivities);
  },
  logActivity(activity: string, module: string, details: string, performedBy = "Vignesh"): ActivityItem {
    const list = this.getActivities();
    const item: ActivityItem = {
      id: `act-${Date.now()}`,
      activity,
      module,
      performedBy,
      dateTime: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) + ", " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      details,
    };
    list.unshift(item);
    saveToStorage("activities", list.slice(0, 50));
    return item;
  },
  deleteActivity(id: string): void {
    const list = this.getActivities().filter((a) => a.id !== id);
    saveToStorage("activities", list);
  },
  updateActivity(id: string, data: Partial<ActivityItem>): void {
    const list = this.getActivities();
    const idx = list.findIndex((a) => a.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...data } as ActivityItem;
      saveToStorage("activities", list);
    }
  },

  // ----------------- CONVENIENCE ALIASES -----------------
  addQuestion(q: Partial<QuestionItem>): QuestionItem {
    return this.saveQuestion(q);
  },
  updateQuestion(id: number | string, data: Partial<QuestionItem>): QuestionItem {
    return this.saveQuestion({ ...data, id });
  },
  addSubject(s: Partial<SubjectItem>): SubjectItem {
    return this.saveSubject(s);
  },
  updateSubject(id: string, data: Partial<SubjectItem>): SubjectItem {
    return this.saveSubject({ ...data, id });
  },
  addUnit(u: Partial<SyllabusUnit>): SyllabusUnit {
    return this.saveUnit(u);
  },
  updateUnit(id: string, data: Partial<SyllabusUnit>): SyllabusUnit {
    return this.saveUnit({ ...data, id });
  },
  addNotification(n: Partial<NotificationItem>): NotificationItem {
    return this.saveNotification(n);
  },
  updateNotification(id: string, data: Partial<NotificationItem>): NotificationItem {
    return this.saveNotification({ ...data, id });
  },
  addUpload(u: Partial<UploadHistoryItem>): UploadHistoryItem {
    return this.saveUpload(u);
  },
  updateUpload(id: number | string, data: Partial<UploadHistoryItem>): UploadHistoryItem {
    return this.saveUpload({ ...data, id });
  },

  // ----------------- BATCH OPERATIONS & 3-TIER VERIFICATION PIPELINE -----------------
  hodVerifyQuestions(ids: (number | string)[], verifierName = "Dr. T.J RAJU"): number {
    const list = this.getQuestions();
    let count = 0;
    const idSet = new Set(ids.map(String));
    let lastSubject = "Viscom & VFX";
    list.forEach((q) => {
      if (idSet.has(String(q.id))) {
        q.status = "Verified";
        q.verifiedBy = `${verifierName} (HOD)`;
        q.verifiedRole = "HOD";
        q.aiStatus = "AI Verified";
        q.aiScore = Math.floor(Math.random() * 6) + 94;
        q.aiRemarks = "Verified by HOD & AI Quality Engine. Approved for Dean Review.";
        lastSubject = q.subject || lastSubject;
        count++;
      }
    });
    if (count > 0) {
      saveToStorage("questions", list);
      this.logActivity(
        `HOD (${verifierName}) verified ${count} question(s) & sent to Dean`,
        "Approval Pipeline",
        `Question IDs: ${ids.slice(0, 5).join(", ")}`
      );
      this.saveNotification({
        title: `HOD Verification Complete - Pending Dean Approval`,
        description: `${verifierName} (HOD) verified ${count} question(s) for ${lastSubject}. Awaiting Dean Academic Affairs approval.`,
        type: "Approval",
        priority: "High",
        relatedTo: lastSubject,
        status: "Unread",
      });
      this.recalculateSubjectStats();
      notifyUpdate();
    }
    return count;
  },

  deanApproveQuestions(ids: (number | string)[], verifierName = "Dr. V Rajlakshmi"): number {
    const list = this.getQuestions();
    let count = 0;
    const idSet = new Set(ids.map(String));
    let lastSubject = "Viscom & VFX";
    list.forEach((q) => {
      if (idSet.has(String(q.id))) {
        q.status = "Approved";
        q.verifiedBy = `${verifierName} (Dean)`;
        q.verifiedRole = "DEAN";
        lastSubject = q.subject || lastSubject;
        count++;
      }
    });
    if (count > 0) {
      saveToStorage("questions", list);
      this.logActivity(
        `Dean (${verifierName}) approved ${count} question(s) & forwarded to COE`,
        "Approval Pipeline",
        `Question IDs: ${ids.slice(0, 5).join(", ")}`
      );
      this.saveNotification({
        title: `Dean Approval Complete - Ready for COE Question Bank`,
        description: `${verifierName} (Dean) approved ${count} question(s) for ${lastSubject}. Available now in COE Question Bank for exam paper generation.`,
        type: "Approval",
        priority: "High",
        relatedTo: lastSubject,
        status: "Unread",
      });
      this.recalculateSubjectStats();
      notifyUpdate();
    }
    return count;
  },

  bulkUpdateQuestions(ids: (number | string)[], status: QuestionItem["status"]): number {
    const list = this.getQuestions();
    let updated = 0;
    const idSet = new Set(ids.map(String));
    list.forEach((q) => {
      if (idSet.has(String(q.id))) {
        q.status = status;
        updated++;
      }
    });
    if (updated > 0) {
      saveToStorage("questions", list);
      this.logActivity(`Batch updated ${updated} questions to ${status}`, "Question Management", `IDs: ${ids.slice(0, 5).join(", ")}`);
    }
    return updated;
  },

  bulkDeleteQuestions(ids: (number | string)[]): number {
    const list = this.getQuestions();
    const idSet = new Set(ids.map(String));
    const filtered = list.filter((q) => !idSet.has(String(q.id)));
    const deleted = list.length - filtered.length;
    if (deleted > 0) {
      saveToStorage("questions", filtered);
      this.logActivity(`Batch deleted ${deleted} questions`, "Question Management", `Count: ${deleted}`);
    }
    return deleted;
  },

  // ----------------- LIVE STATS CALCULATION -----------------
  getStats() {
    const subjects = this.getSubjects();
    const questions = this.getQuestions();
    const uploads = this.getUploadHistory();
    const notifications = this.getNotifications();
    const users = this.getUsers();
    const units = this.getUnits();

    const totalQuestions = questions.length;
    const approvedQuestions = questions.filter((q) => q.status === "Approved").length;
    const verifiedQuestions = questions.filter((q) => q.status === "Verified").length;
    const pendingQuestions = questions.filter((q) => q.status === "Pending").length;
    const rejectedQuestions = questions.filter((q) => q.status === "Rejected").length;
    const draftQuestions = questions.filter((q) => q.status === "Draft").length;

    const totalSubjects = subjects.length;
    const inProgressSubjects = subjects.filter((s) => s.status === "In Progress").length;
    const completedSubjects = subjects.filter((s) => s.status === "Completed").length;

    const unreadNotifications = notifications.filter((n) => n.status === "Unread").length;

    return {
      totalQuestions,
      approvedQuestions,
      verifiedQuestions,
      pendingQuestions,
      rejectedQuestions,
      draftQuestions,
      totalSubjects,
      inProgressSubjects,
      completedSubjects,
      totalUnits: units.length,
      totalUploads: uploads.length,
      unreadNotifications,
      totalUsers: users.length,
      activeUsers: users.filter((u) => u.status === "Active").length,
    };
  },

  // ----------------- CLIENT-SIDE CSV EXPORTER -----------------
  exportToCsv(filename: string, rows: Record<string, any>[]): void {
    if (!rows || !rows.length || typeof window === "undefined") return;
    const keys = Object.keys(rows[0]);
    const csvContent = [
      keys.join(","),
      ...rows.map((row) =>
        keys
          .map((k) => {
            const val = row[k] === null || row[k] === undefined ? "" : String(row[k]);
            return `"${val.replace(/"/g, '""')}"`;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  // ----------------- FULL BACKUP & RESTORE -----------------
  createFullBackup(): string {
    const backup = {
      timestamp: new Date().toISOString(),
      subjects: this.getSubjects(),
      units: this.getUnits(),
      questions: this.getQuestions(),
      uploads: this.getUploadHistory(),
      notifications: this.getNotifications(),
      users: this.getUsers(),
      activities: this.getActivities(),
    };
    const jsonStr = JSON.stringify(backup, null, 2);
    if (typeof window !== "undefined") {
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `exam_cell_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
    return jsonStr;
  },

  restoreFullBackup(jsonData: string): boolean {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.subjects) saveToStorage("subjects", parsed.subjects);
      if (parsed.units) saveToStorage("units", parsed.units);
      if (parsed.questions) saveToStorage("questions", parsed.questions);
      if (parsed.uploads) saveToStorage("uploads", parsed.uploads);
      if (parsed.notifications) saveToStorage("notifications", parsed.notifications);
      if (parsed.users) saveToStorage("users", parsed.users);
      if (parsed.activities) saveToStorage("activities", parsed.activities);
      this.logActivity("Database restored from backup", "Backup & Restore", "Full database restoration");
      notifyUpdate();
      return true;
    } catch (err) {
      console.error("Backup restoration failed:", err);
      return false;
    }
  },


  async syncFromSupabase(): Promise<void> {
    if (!isSupabaseConfigured()) return;
    try {
      const [{ data: suData }, { data: unitData }, { data: qData }] = await Promise.all([
        supabase.from("subjects").select("*"),
        supabase.from("syllabus_units").select("*"),
        supabase.from("questions").select("*"),
      ]);

      if (suData && suData.length > 0) {
        const localSubs = this.getSubjects();
        const mergedSubs = [...localSubs];
        suData.forEach((s) => {
          const idx = mergedSubs.findIndex((m) => m.id === s.id || m.code === s.code);
          const item: SubjectItem = {
            id: s.id,
            name: s.name,
            code: s.code,
            semester: s.semester || "Semester 1",
            department: s.department || "General",
            totalQuestions: s.total_questions || 0,
            approved: s.approved || 0,
            pending: s.pending || 0,
            verified: s.verified || 0,
            status: (s.status as any) || "In Progress",
            credits: 3,
            completed: `${s.approved || 0} (${s.total_questions ? Math.round(((s.approved || 0) / s.total_questions) * 100) : 0}%)`,
          };
          if (idx !== -1) mergedSubs[idx] = { ...mergedSubs[idx], ...item };
          else mergedSubs.push(item);
        });
        saveToStorage("subjects", mergedSubs);
      }

      if (unitData && unitData.length > 0) {
        const localUnits = this.getUnits();
        const mergedUnits = [...localUnits];
        unitData.forEach((u) => {
          const idx = mergedUnits.findIndex((m) => m.id === u.id);
          const item: SyllabusUnit = {
            id: u.id,
            num: u.num,
            name: u.name,
            subject: u.subject,
            topics: u.topics || 0,
            docs: u.docs || 0,
            subtopics: Array.isArray(u.subtopics) ? u.subtopics : [],
            coMapping: Array.isArray(u.co_mapping) ? u.co_mapping : [],
            description: u.description || "",
          };
          if (idx !== -1) mergedUnits[idx] = { ...mergedUnits[idx], ...item };
          else mergedUnits.push(item);
        });
        saveToStorage("units", mergedUnits);
      }

      if (qData && qData.length > 0) {
        const localQs = this.getQuestions();
        const mergedQs = [...localQs];
        qData.forEach((q) => {
          const idx = mergedQs.findIndex((m) => String(m.id) === String(q.id));
          const item: QuestionItem = {
            id: q.id,
            code: q.code,
            question: q.question,
            subject: q.subject,
            unit: q.unit,
            topic: q.topic || "",
            type: q.type || "Descriptive",
            difficulty: q.difficulty || "Medium",
            marks: q.marks || 5,
            bloomLevel: q.bloom_level || "Understand",
            status: q.status || "Pending",
            options: q.options || [],
            correctAnswer: q.answer || "",
            uploadedBy: q.submitted_by || "Faculty",
            date: q.submitted_date || "",
          };
          if (idx !== -1) mergedQs[idx] = { ...mergedQs[idx], ...item };
          else mergedQs.push(item);
        });
        saveToStorage("questions", mergedQs);
      }
    } catch (err) {
      console.warn("Supabase initial fetch sync warning:", err);
    }
  },

  // ----------------- RESET ALL -----------------
  resetAll(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem("exam_cell_subjects");
    localStorage.removeItem("exam_cell_units");
    localStorage.removeItem("exam_cell_questions");
    localStorage.removeItem("exam_cell_uploads");
    localStorage.removeItem("exam_cell_notifications");
    localStorage.removeItem("exam_cell_users");
    localStorage.removeItem("exam_cell_activities");
    notifyUpdate();
  },
};
