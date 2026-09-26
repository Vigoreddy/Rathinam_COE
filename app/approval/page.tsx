"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Home,
  BookOpen,
  FileText,
  CheckSquare,
  Upload,
  Search,
  CheckCircle2,
  BarChart2,
  Bell,
  Edit3,
  Settings,
  Shield,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Headphones,
  Info,
  School,
  SlidersHorizontal,
  Clock,
  ThumbsUp,
  RefreshCw,
  XCircle,
  Eye,
  Check,
  RotateCcw,
  Trash2,
  Plus,
  Download,
  AlertCircle,
  FileCheck,
  ShieldCheck,
  Layers,
  LayoutGrid,
  ListFilter,
} from "lucide-react";
import { examStore, QuestionItem } from "../lib/examStore";
import { authStore, AuthUser, hasPermission } from "../lib/auth";
import RoleGuard from "../components/RoleGuard";
import {
  ViewModal,
  FormModal,
  DeleteModal,
  ToastNotification,
  VerificationResultModal,
  FormFieldDef,
  CrudActionButtons,
} from "../components/CrudModal";
import PortalFooter from "../components/PortalFooter";
import PortalHeader from "../components/PortalHeader";
import Pagination from "../components/Pagination";

export default function ApprovalPage() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState("approval");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedUnit, setSelectedUnit] = useState("all");
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedVerifier, setSelectedVerifier] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedRows, setSelectedRows] = useState<(number | string)[]>([]);
  const [viewMode, setViewMode] = useState<"table" | "cards">("cards");
  const [currentPage, setCurrentPage] = useState(1);

  // CRUD state
  const [questions, setQuestions] = useState<QuestionItem[]>(() => examStore.getQuestions());
  const [viewingQuestion, setViewingQuestion] = useState<QuestionItem | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(null);
  const [deletingQuestion, setDeletingQuestion] = useState<QuestionItem | null>(null);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);

  // Subject Questions Viewer Modal State
  const [subjectModalData, setSubjectModalData] = useState<{
    isOpen: boolean;
    subjectName: string;
    questions: QuestionItem[];
  }>({
    isOpen: false,
    subjectName: "",
    questions: [],
  });

  const handleOpenSubjectModal = (subjName: string) => {
    const cleanSubj = subjName.replace(/\s*\(All\)/i, "").trim();
    const subjQuestions = questions.filter((q) => {
      if (currentUser.role === "HOD" && q.status !== "Pending") return false;
      if (currentUser.role === "DEAN" && q.status !== "Verified") return false;
      const qSubj = (q.subject || "").trim();
      return (
        qSubj.toLowerCase().includes(cleanSubj.toLowerCase()) ||
        cleanSubj.toLowerCase().includes(qSubj.toLowerCase())
      );
    });

    setSubjectModalData({
      isOpen: true,
      subjectName: cleanSubj,
      questions: subjQuestions,
    });
  };

  const handleApproveSubjectFromModal = () => {
    const ids = subjectModalData.questions.map((q) => q.id);
    if (ids.length === 0) return;

    if (currentUser.role === "HOD") {
      examStore.hodVerifyQuestions(ids, currentUser.name);
      setVerifyPopModal({
        isOpen: true,
        itemName: `${subjectModalData.subjectName} (${ids.length} Questions)`,
        title: "HOD Subject Verification Complete!",
        remarks: `Verified all ${ids.length} question(s) in ${subjectModalData.subjectName} by HOD ${currentUser.name}. Forwarded to Dean Academic Affairs for approval.`,
      });
    } else if (currentUser.role === "DEAN") {
      examStore.deanApproveQuestions(ids, currentUser.name);
      setVerifyPopModal({
        isOpen: true,
        itemName: `${subjectModalData.subjectName} (${ids.length} Questions)`,
        title: "Dean Subject Approval Complete!",
        remarks: `Approved all ${ids.length} question(s) in ${subjectModalData.subjectName} by Dean ${currentUser.name}. Forwarded to COE Question Bank.`,
      });
    } else {
      examStore.deanApproveQuestions(ids, currentUser.name);
      setVerifyPopModal({
        isOpen: true,
        itemName: `${subjectModalData.subjectName} (${ids.length} Questions)`,
        title: "Subject Questions Approved!",
        remarks: `All ${ids.length} question(s) in ${subjectModalData.subjectName} have been verified and added to Question Bank.`,
      });
    }
  };

  // Verification Pop-up Modal State
  const [verifyPopModal, setVerifyPopModal] = useState<{
    isOpen: boolean;
    itemName?: string;
    title?: string;
    remarks?: string;
  }>({
    isOpen: false,
    itemName: "",
    title: "",
    remarks: "",
  });

  // Toast
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">("success");
  const [showToast, setShowToast] = useState(false);

  const triggerToast = (msg: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>(() => examStore.getLastUpdated());

  useEffect(() => {
    const loadQuestions = () => {
      const all = examStore.getQuestions();
      setQuestions(all);
      setLastUpdatedTime(examStore.getLastUpdated());
    };
    loadQuestions();
    window.addEventListener("exam-cell-store-update", loadQuestions);
    return () => window.removeEventListener("exam-cell-store-update", loadQuestions);
  }, []);

  // Auth User State
  const [currentUser, setCurrentUser] = useState<AuthUser>(() => authStore.getCurrentUser());

  useEffect(() => {
    const handleAuth = () => {
      setCurrentUser(authStore.getCurrentUser());
    };
    handleAuth();
    window.addEventListener("exam-cell-auth-update", handleAuth);
    return () => window.removeEventListener("exam-cell-auth-update", handleAuth);
  }, []);

  const rawMenuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, route: "/dashboard" },
    { id: "subjects", label: "Subjects", icon: BookOpen, route: "/subjects" },
    { id: "syllabus", label: "Syllabus", icon: FileText, route: "/syllabus" },
    { id: "question-bank", label: "Question Bank", icon: CheckSquare, route: "/question-bank" },
    { id: "bulk-upload", label: "Bulk Upload", icon: Upload, route: "/bulk-upload" },
    { id: "verify-questions", label: "Verify Questions", icon: Search, route: "/verify-questions" },
    { id: "approval", label: "Approval", icon: CheckSquare, hasArrow: true, route: "/approval" },
    { id: "reports", label: "Reports", icon: BarChart2, route: "/reports" },
    { id: "notifications", label: "Notifications", icon: Bell, route: "/notifications" },
    { id: "manual-questions", label: "Manual Questions", icon: Edit3, badge: "New", route: "/manual-questions" },
    { id: "settings", label: "Settings", icon: Settings, route: "/settings" },
  ];

  const menuItems = rawMenuItems.filter((item) =>
    hasPermission(currentUser.role, item.route, currentUser.isSubjectFaculty)
  );

  const handleApproveQuestion = (id: number | string) => {
    const q = questions.find((item) => String(item.id) === String(id));
    const qText = q ? q.question.slice(0, 45) + "..." : `#${id}`;

    if (currentUser.role === "HOD") {
      examStore.hodVerifyQuestions([id], currentUser.name);
      setVerifyPopModal({
        isOpen: true,
        itemName: qText,
        title: "HOD Verification Complete!",
        remarks: `Verified by HOD ${currentUser.name}. Question has been forwarded to Dean Academic Affairs (Dr. V Rajlakshmi) for final approval.`,
      });
    } else if (currentUser.role === "DEAN") {
      examStore.deanApproveQuestions([id], currentUser.name);
      setVerifyPopModal({
        isOpen: true,
        itemName: qText,
        title: "Dean Approval Complete!",
        remarks: `Approved by Dean ${currentUser.name}. Question has been forwarded to Controller of Examinations (COE) Question Bank.`,
      });
    } else {
      examStore.deanApproveQuestions([id], currentUser.name);
      setVerifyPopModal({
        isOpen: true,
        itemName: qText,
        title: "Question Fully Approved!",
        remarks: `Question #${id} has completed academic verification and is now available in COE Question Bank.`,
      });
    }
  };

  const handleReturnForEdit = (id: number | string) => {
    examStore.saveQuestion({ id, status: "Pending" });
    triggerToast(`Question #${id} returned for editing.`, "info");
  };

  const handleRejectQuestion = (id: number | string) => {
    examStore.saveQuestion({ id, status: "Rejected" });
    triggerToast(`Question #${id} marked as Rejected.`, "info");
  };

  const handleRequestEditQuestion = (id: number | string) => {
    handleReturnForEdit(id);
  };

  const handleBulkApprove = () => {
    if (selectedRows.length === 0) return;
    if (currentUser.role === "HOD") {
      examStore.hodVerifyQuestions(selectedRows, currentUser.name);
      setVerifyPopModal({
        isOpen: true,
        itemName: `${selectedRows.length} Selected Question(s)`,
        title: "HOD Batch Verification Complete!",
        remarks: `Verified ${selectedRows.length} question(s) by HOD ${currentUser.name}. Forwarded to Dean Academic Affairs for approval.`,
      });
    } else {
      examStore.deanApproveQuestions(selectedRows, currentUser.name);
      setVerifyPopModal({
        isOpen: true,
        itemName: `${selectedRows.length} Selected Question(s)`,
        title: "Dean Batch Approval Complete!",
        remarks: `Approved ${selectedRows.length} question(s) by Dean ${currentUser.name}. Forwarded to COE Question Bank.`,
      });
    }
    setSelectedRows([]);
  };

  const handleBulkReturn = () => {
    if (selectedRows.length === 0) return;
    examStore.bulkUpdateQuestions(selectedRows.map(Number), "Pending");
    setSelectedRows([]);
    triggerToast(`Returned ${selectedRows.length} question(s) for editing.`, "info");
  };

  const handleBulkDelete = () => {
    if (selectedRows.length === 0) return;
    if (confirm(`Delete ${selectedRows.length} selected question(s)?`)) {
      examStore.bulkDeleteQuestions(selectedRows.map(Number));
      setSelectedRows([]);
      triggerToast(`Removed ${selectedRows.length} question(s).`, "error");
    }
  };

  const handleExportApproved = () => {
    const approved = questions.filter((q) => q.status === "Approved");
    const dataToExport = approved.length > 0 ? approved : questions;
    const rows = dataToExport.map((q) => ({
      ID: q.id,
      Question: q.question,
      Subject: q.subject,
      Unit: q.unit,
      Topic: q.topic,
      Type: q.type,
      Difficulty: q.difficulty,
      Marks: q.marks,
      Status: q.status,
    }));
    examStore.exportToCsv("approved_questions_export.csv", rows);
    triggerToast(`Exported ${rows.length} questions to CSV!`, "success");
  };

  const toggleRow = (id: number | string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedRows.length === filteredQuestions.length && filteredQuestions.length > 0) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredQuestions.map((q) => q.id));
    }
  };

  const handleReset = () => {
    setSelectedSubject("all");
    setSelectedUnit("all");
    setSelectedTopic("all");
    setSelectedDifficulty("all");
    setSelectedType("all");
    setSelectedVerifier("all");
    setSortBy("newest");
    setSearchQuery("");
  };

  const filteredQuestions = questions.filter((q) => {
    // 3-Tier Approval Workflow Filter
    if (currentUser.role === "HOD" && q.status !== "Pending") return false;
    if (currentUser.role === "DEAN" && q.status !== "Verified") return false;
    if (selectedSubject !== "all") {
      if (selectedSubject === "vfx" && !q.subject.includes("VFX")) return false;
      if (selectedSubject === "viscom" && q.subject !== "Viscom") return false;
      if (selectedSubject !== "vfx" && selectedSubject !== "viscom" && !q.subject.toLowerCase().includes(selectedSubject.toLowerCase())) return false;
    }
    if (selectedUnit !== "all") {
      if (selectedUnit === "u1" && !q.unit.includes("Unit I")) return false;
      if (selectedUnit === "u2" && !q.unit.includes("Unit II")) return false;
      if (!selectedUnit.startsWith("u") && !q.unit.toLowerCase().includes(selectedUnit.toLowerCase())) return false;
    }
    if (selectedTopic !== "all") {
      if (selectedTopic === "t1" && !q.topic.toLowerCase().includes("basics")) return false;
      if (!selectedTopic.startsWith("t") && !q.topic.toLowerCase().includes(selectedTopic.toLowerCase())) return false;
    }
    if (selectedDifficulty !== "all" && q.difficulty.toLowerCase() !== selectedDifficulty.toLowerCase()) return false;
    if (selectedType !== "all" && q.type.toLowerCase() !== selectedType.toLowerCase()) return false;
    if (searchQuery.trim()) {
      const match = q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    q.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    q.topic.toLowerCase().includes(searchQuery.toLowerCase());
      if (!match) return false;
    }
    return true;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedSubject, selectedUnit, selectedTopic, selectedDifficulty, selectedType, selectedVerifier, sortBy]);

  const itemsPerPage = 6;
  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedQuestions = filteredQuestions.slice(startIndex, startIndex + itemsPerPage);

  const questionFields: FormFieldDef[] = [
    { name: "question", label: "Question Text", type: "textarea", required: true },
    {
      name: "subject",
      label: "Subject",
      type: "select",
      options: ["Viscom & VFX", "Viscom", "Animation Basics", "Sound Engineering"],
      required: true,
    },
    { name: "unit", label: "Unit", type: "text", required: true },
    { name: "topic", label: "Topic", type: "text", required: true },
    {
      name: "type",
      label: "Question Type",
      type: "select",
      options: ["MCQ", "Descriptive", "Match Type", "Short Answer"],
      required: true,
    },
    {
      name: "difficulty",
      label: "Difficulty Level",
      type: "select",
      options: ["Easy", "Medium", "Hard"],
      required: true,
    },
    { name: "marks", label: "Marks", type: "number", required: true },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: ["Pending", "Verified", "Approved", "Rejected"],
      required: true,
    },
  ];

  return (
    <RoleGuard route="/approval">
    <div
      style={{
        display: "flex",
        height: "100vh",
        maxHeight: "100vh",
        background: "#f4f6fb",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        color: "#0f172a",
        width: "100%",
        maxWidth: "100vw",
        overflow: "hidden",
      }}
    >
      {/* ================================= SIDEBAR ================================= */}
      <aside
        style={{
          width: "260px",
          background: "linear-gradient(180deg, #090e1f 0%, #060914 100%)",
          color: "#94a3b8",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          borderRight: "1px solid rgba(255, 255, 255, 0.06)",
          padding: "20px 14px",
          justifyContent: "space-between",
          height: "100vh",
          overflowY: "auto",
        }}
      >
        <div>
          {/* RGU Logo */}
          <div style={{ padding: "6px 10px 24px 10px" }}>
            <img
              src="/images/rgu-logo.png"
              alt="Rathinam Global (Deemed to be University)"
              style={{ maxHeight: "38px", width: "auto", objectFit: "contain" }}
            />
          </div>

          {/* Navigation Items */}
          <nav style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {menuItems.map((item) => {
              const IconComp = item.icon;
              const isActive = activeMenu === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveMenu(item.id);
                    if (item.route) router.push(item.route);
                  }}
                  className={`sidebar-btn-3d ${isActive ? "sidebar-btn-active" : "sidebar-btn-inactive"}`}
                >
                  <IconComp
                    size={18}
                    className="nav-icon-3d"
                    style={{
                      filter: isActive
                        ? "drop-shadow(0 0 6px rgba(255,255,255,0.8))"
                        : "none",
                      transition: "filter 0.2s ease",
                    }}
                  />
                  <span style={{ flex: 1, letterSpacing: "0.2px" }}>{item.label}</span>

                  {item.badge && (
                    <span className="badge-neon-3d">
                      {item.badge}
                    </span>
                  )}

                  {item.hasArrow && (
                    <ChevronRight
                      size={16}
                      color="#ffffff"
                      style={{
                        filter: "drop-shadow(0 0 4px rgba(255,255,255,0.6))",
                      }}
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Need Help Box */}
        <div className="support-card-3d">
          <div className="shield-icon-3d">
            <Shield
              size={19}
              style={{
                filter: "drop-shadow(0 0 6px rgba(96, 165, 250, 0.8))",
              }}
            />
          </div>
          <strong
            style={{
              display: "block",
              color: "#ffffff",
              fontSize: "13.5px",
              marginBottom: "4px",
              fontWeight: 700,
            }}
          >
            Need Help?
          </strong>
          <p
            style={{
              fontSize: "11.5px",
              color: "#94a3b8",
              lineHeight: 1.4,
              margin: "0 0 14px 0",
            }}
          >
            Our support team is ready to assist you.
          </p>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("open-exam-support-modal"));
              }
            }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              width: "100%",
              padding: "9px 12px",
              borderRadius: "10px",
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.14)",
              color: "#ffffff",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.16)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.25)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.14)";
            }}
          >
            <span>Contact Support</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </aside>

      {/* ================================= MAIN CONTENT ================================= */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, height: "100vh", overflow: "hidden" }}>
        {/* Top Header */}
        <PortalHeader activeRoute="approval" />


        {/* Scrollable Main Content */}
        <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto", overflowX: "hidden", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
          {/* Header & University Badge */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: "25px",
                  fontWeight: 800,
                  color: "#0f172a",
                  margin: "0 0 6px 0",
                  letterSpacing: "-0.4px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span>Approval</span>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "32px",
                    height: "32px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                    boxShadow: "0 4px 14px rgba(37, 99, 235, 0.45), inset 0 1px 2px rgba(255, 255, 255, 0.5)",
                    color: "#ffffff",
                    animation: "float3D 4s infinite ease-in-out",
                  }}
                >
                  <ShieldCheck size={20} style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,0.9)) drop-shadow(0 0 10px rgba(59, 130, 246, 0.8))" }} />
                </div>
              </h1>
              <p style={{ fontSize: "13.5px", color: "#64748b", margin: 0 }}>
                Review and approve questions verified by the verification team.
              </p>
            </div>

            {/* University Crest Card with 3D Glow Icon */}
            <div
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "14px",
                padding: "10px 16px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.03)",
                transition: "all 0.3s ease",
              }}
            >
              <div className="crest-badge-box-3d">
                <School size={20} style={{ filter: "drop-shadow(0 0 6px rgba(124, 58, 237, 0.6))" }} />
              </div>
              <div style={{ flexShrink: 0 }}>
                <strong style={{ display: "block", fontSize: "12.5px", color: "#0f172a", fontWeight: 700, whiteSpace: "nowrap" }}>
                  Rathinam Global (Deemed to be University)
                </strong>
                <span style={{ fontSize: "11px", color: "#64748b", whiteSpace: "nowrap" }}>Coimbatore, Tamil Nadu</span>
              </div>
            </div>
          </div>

          {/* ================= Top 4 Metric Cards (Matching Bulk Upload 3D Glow) ================= */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "18px",
              marginBottom: "28px",
            }}
          >
            {/* Metric 1: Pending Approval - 3D Blue with Floating Glow FileCheck */}
            <div className="stat-card-3d stat-card-blue">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "16px",
                }}
              >
                <div className="stat-icon-3d-box glow-blue">
                  <FileCheck
                    size={23}
                    color="#ffffff"
                    style={{
                      filter: "drop-shadow(0 0 8px rgba(255,255,255,0.9)) drop-shadow(0 0 14px rgba(59, 130, 246, 0.8))",
                    }}
                  />
                </div>
                <div className="stat-arrow-btn-3d">
                  <ArrowRight size={14} color="#ffffff" />
                </div>
              </div>
              <div style={{ fontSize: "12px", opacity: 0.9, marginBottom: "4px", fontWeight: 500 }}>
                Pending Approval
              </div>
              <div style={{ fontSize: "32px", fontWeight: 800, lineHeight: 1, marginBottom: "6px", textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
                {questions.filter((q) => q.status === "Pending" || q.status === "Verified").length}
              </div>
              <div style={{ fontSize: "11.5px", opacity: 0.85 }}>
                ({questions.length > 0 ? (((questions.filter((q) => q.status === "Pending" || q.status === "Verified").length) / questions.length) * 100).toFixed(1) : "0"}%)
              </div>
            </div>

            {/* Metric 2: Approved Questions - 3D Cyan with Floating Glow ThumbsUp */}
            <div className="stat-card-3d stat-card-cyan">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "16px",
                }}
              >
                <div className="stat-icon-3d-box glow-cyan">
                  <ThumbsUp
                    size={23}
                    color="#ffffff"
                    style={{
                      filter: "drop-shadow(0 0 8px rgba(255,255,255,0.9)) drop-shadow(0 0 14px rgba(6, 182, 212, 0.8))",
                    }}
                  />
                </div>
                <div className="stat-arrow-btn-3d">
                  <ArrowRight size={14} color="#ffffff" />
                </div>
              </div>
              <div style={{ fontSize: "12px", opacity: 0.9, marginBottom: "4px", fontWeight: 500 }}>
                Approved Questions
              </div>
              <div style={{ fontSize: "32px", fontWeight: 800, lineHeight: 1, marginBottom: "6px", textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
                {questions.filter((q) => q.status === "Approved").length}
              </div>
              <div style={{ fontSize: "11.5px", opacity: 0.85 }}>
                ({questions.length > 0 ? ((questions.filter((q) => q.status === "Approved").length / questions.length) * 100).toFixed(1) : "0"}%)
              </div>
            </div>

            {/* Metric 3: Returned for Edit - 3D Emerald with Floating Glow RefreshCw */}
            <div className="stat-card-3d stat-card-emerald">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "16px",
                }}
              >
                <div className="stat-icon-3d-box glow-emerald">
                  <RefreshCw
                    size={23}
                    color="#ffffff"
                    style={{
                      filter: "drop-shadow(0 0 8px rgba(255,255,255,0.9)) drop-shadow(0 0 14px rgba(52, 211, 153, 0.8))",
                    }}
                  />
                </div>
                <div className="stat-arrow-btn-3d">
                  <ArrowRight size={14} color="#ffffff" />
                </div>
              </div>
              <div style={{ fontSize: "12px", opacity: 0.9, marginBottom: "4px", fontWeight: 500 }}>
                Returned for Edit
              </div>
              <div style={{ fontSize: "32px", fontWeight: 800, lineHeight: 1, marginBottom: "6px", textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
                {questions.filter((q) => q.status === "Pending").length}
              </div>
              <div style={{ fontSize: "11.5px", opacity: 0.85 }}>
                ({questions.length > 0 ? ((questions.filter((q) => q.status === "Pending").length / questions.length) * 100).toFixed(1) : "0"}%)
              </div>
            </div>

            {/* Metric 4: Rejected Questions - 3D Orange with Floating Glow XCircle */}
            <div className="stat-card-3d stat-card-orange">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "16px",
                }}
              >
                <div className="stat-icon-3d-box glow-orange">
                  <XCircle
                    size={23}
                    color="#ffffff"
                    style={{
                      filter: "drop-shadow(0 0 8px rgba(255,255,255,0.9)) drop-shadow(0 0 14px rgba(251, 146, 60, 0.8))",
                    }}
                  />
                </div>
                <div className="stat-arrow-btn-3d">
                  <ArrowRight size={14} color="#ffffff" />
                </div>
              </div>
              <div style={{ fontSize: "12px", opacity: 0.9, marginBottom: "4px", fontWeight: 500 }}>
                Rejected Questions
              </div>
              <div style={{ fontSize: "32px", fontWeight: 800, lineHeight: 1, marginBottom: "6px", textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
                {questions.filter((q) => q.status === "Rejected").length}
              </div>
              <div style={{ fontSize: "11.5px", opacity: 0.85 }}>
                ({questions.length > 0 ? ((questions.filter((q) => q.status === "Rejected").length / questions.length) * 100).toFixed(1) : "0"}%)
              </div>
            </div>
          </div>

          {/* ================= Main Content Grid ================= */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 310px",
              gap: "24px",
              alignItems: "start",
            }}
          >
            {/* ================= LEFT WIDE COLUMN: Questions Table & Filters ================= */}
            <div className="widget-card-3d" style={{ padding: "24px" }}>
              {/* Header Title with 3D Icon */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "18px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    className="action-mini-icon-blue"
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 6px 16px rgba(79, 70, 229, 0.35)",
                    }}
                  >
                    <SlidersHorizontal size={18} color="#ffffff" style={{ filter: "drop-shadow(0 0 4px rgba(255,255,255,0.8))" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>
                      Review & Approve Questions
                    </div>
                    <div style={{ fontSize: "11.5px", color: "#64748b" }}>
                      Final gatekeeper approval before questions are officially added to Question Bank
                    </div>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: "11.5px",
                    fontWeight: 700,
                    color: "#2563eb",
                    background: "#eff6ff",
                    padding: "4px 12px",
                    borderRadius: "100px",
                    boxShadow: "0 2px 6px rgba(37, 99, 235, 0.15)",
                  }}
                >
                  {filteredQuestions.length} Questions Displayed
                </span>
              </div>

              {/* Subject Question Inspection Cards (Subject Wise Only) */}
              <div style={{ marginBottom: "22px", padding: "16px", background: "linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)", borderRadius: "14px", border: "1px solid #dbeafe" }}>
                <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#1e3a8a", marginBottom: "12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <BookOpen size={16} color="#2563eb" />
                    <span>Subject Question Inspection Packs</span>
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#2563eb", background: "#ffffff", padding: "3px 10px", borderRadius: "20px", border: "1px solid #bfdbfe" }}>
                    Click 👁️ to read full questions & approve
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
                  {/* Main Subject Pack */}
                  {Array.from(new Set(questions.map((q) => q.subject || "Viscom & VFX"))).map((subjName) => {
                    const subjQuestions = questions.filter((q) => {
                      const qSubj = (q.subject || "").trim().toLowerCase();
                      const targetSubj = subjName.trim().toLowerCase();
                      return qSubj.includes(targetSubj) || targetSubj.includes(qSubj);
                    });

                    return (
                      <div
                        key={subjName}
                        style={{
                          background: "linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)",
                          border: "1.5px solid #93c5fd",
                          borderRadius: "12px",
                          padding: "12px 14px",
                          boxShadow: "0 2px 8px rgba(37, 99, 235, 0.08)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "10px",
                        }}
                      >
                        <div>
                          <strong style={{ display: "block", fontSize: "13px", color: "#1e40af", fontWeight: 800 }}>
                            📚 {subjName} (All)
                          </strong>
                          <span style={{ fontSize: "11px", color: "#2563eb", fontWeight: 600 }}>
                            {subjQuestions.length} Question(s)
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleOpenSubjectModal(subjName)}
                          title={`Read all questions for ${subjName}`}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "7px 12px",
                            borderRadius: "8px",
                            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                            color: "#ffffff",
                            border: "none",
                            fontSize: "12px",
                            fontWeight: 700,
                            cursor: "pointer",
                            boxShadow: "0 2px 8px rgba(16, 185, 129, 0.35)",
                            flexShrink: 0,
                          }}
                        >
                          <Eye size={14} />
                          <span>View All</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bulk Actions Banner if rows selected */}
              {selectedRows.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 16px",
                    background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
                    borderRadius: "12px",
                    border: "1px solid #bfdbfe",
                    marginBottom: "16px",
                  }}
                >
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#1e40af" }}>
                    {selectedRows.length} question(s) selected
                  </span>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      type="button"
                      onClick={handleBulkApprove}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "8px",
                        background: "#16a34a",
                        color: "#ffffff",
                        border: "none",
                        fontSize: "11.5px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Approve Selected
                    </button>
                    <button
                      type="button"
                      onClick={handleBulkReturn}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "8px",
                        background: "#ea580c",
                        color: "#ffffff",
                        border: "none",
                        fontSize: "11.5px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Return Selected
                    </button>
                    <button
                      type="button"
                      onClick={handleBulkDelete}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "8px",
                        background: "#ef4444",
                        color: "#ffffff",
                        border: "none",
                        fontSize: "11.5px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Delete Selected
                    </button>
                  </div>
                </div>
              )}

              {/* Filter Row 1 */}
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "center",
                  marginBottom: "14px",
                }}
              >
                <div style={{ position: "relative", flex: 1 }}>
                  <input
                    type="text"
                    placeholder="Search questions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 38px 10px 14px",
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0",
                      background: "#ffffff",
                      fontSize: "13px",
                      color: "#1e293b",
                      outline: "none",
                      boxSizing: "border-box",
                      transition: "all 0.2s ease",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#6366f1";
                      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.15)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "#e2e8f0";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                  <Search
                    size={16}
                    color="#94a3b8"
                    style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)" }}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleExportApproved}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "9px 16px",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#334155",
                    cursor: "pointer",
                    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.04)",
                  }}
                >
                  <Download size={14} color="#2563eb" />
                  <span>Export CSV</span>
                </button>

                <button
                  type="button"
                  className="filter-btn-3d"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "9px 16px",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#475569",
                    cursor: "pointer",
                  }}
                >
                  <span>Filter</span>
                  <SlidersHorizontal size={14} color="#6366f1" />
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="filter-btn-3d"
                  style={{
                    padding: "9px 16px",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#475569",
                    cursor: "pointer",
                  }}
                >
                  Reset
                </button>

                <button
                  type="button"
                  onClick={() => setIsAddingQuestion(true)}
                  className="filter-btn-3d"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "9px 16px",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#ffffff",
                    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(37, 99, 235, 0.4)",
                  }}
                >
                  <Plus size={15} />
                  <span>Add Question</span>
                </button>

                {/* View Mode Switcher Pill */}
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                    padding: "3px",
                    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.03)",
                    flexShrink: 0,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setViewMode("cards")}
                    title="Grid / Cards View"
                    style={{
                      padding: "6px 9px",
                      borderRadius: "7px",
                      border: "none",
                      background: viewMode === "cards" ? "#eff6ff" : "transparent",
                      color: viewMode === "cards" ? "#4f46e5" : "#94a3b8",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <LayoutGrid size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("table")}
                    title="List / Table View"
                    style={{
                      padding: "6px 9px",
                      borderRadius: "7px",
                      border: "none",
                      background: viewMode === "table" ? "#eff6ff" : "transparent",
                      color: viewMode === "table" ? "#4f46e5" : "#94a3b8",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <ListFilter size={15} />
                  </button>
                </div>
              </div>

              {/* Filter Row 2 (7 Dropdowns) */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  gap: "8px",
                  marginBottom: "20px",
                  paddingBottom: "16px",
                  borderBottom: "1px solid #f1f5f9",
                }}
              >
                <div>
                  <label style={{ display: "block", fontSize: "11px", color: "#64748b", marginBottom: "4px" }}>
                    Subject
                  </label>
                  <div style={{ position: "relative" }}>
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "6px 20px 6px 8px",
                        borderRadius: "7px",
                        border: "1px solid #e2e8f0",
                        background: "#ffffff",
                        fontSize: "11.5px",
                        color: "#334155",
                        appearance: "none",
                        outline: "none",
                      }}
                    >
                      <option value="all">All Subjects</option>
                      <option value="vfx">Viscom & VFX</option>
                    </select>
                    <ChevronDown size={12} color="#94a3b8" style={{ position: "absolute", right: "6px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", color: "#64748b", marginBottom: "4px" }}>
                    Unit
                  </label>
                  <div style={{ position: "relative" }}>
                    <select
                      value={selectedUnit}
                      onChange={(e) => setSelectedUnit(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "6px 20px 6px 8px",
                        borderRadius: "7px",
                        border: "1px solid #e2e8f0",
                        background: "#ffffff",
                        fontSize: "11.5px",
                        color: "#334155",
                        appearance: "none",
                        outline: "none",
                      }}
                    >
                      <option value="all">All Units</option>
                      <option value="u1">Unit I</option>
                      <option value="u2">Unit II</option>
                    </select>
                    <ChevronDown size={12} color="#94a3b8" style={{ position: "absolute", right: "6px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", color: "#64748b", marginBottom: "4px" }}>
                    Topic
                  </label>
                  <div style={{ position: "relative" }}>
                    <select
                      value={selectedTopic}
                      onChange={(e) => setSelectedTopic(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "6px 20px 6px 8px",
                        borderRadius: "7px",
                        border: "1px solid #e2e8f0",
                        background: "#ffffff",
                        fontSize: "11.5px",
                        color: "#334155",
                        appearance: "none",
                        outline: "none",
                      }}
                    >
                      <option value="all">All Topics</option>
                      <option value="t1">Color Basics</option>
                    </select>
                    <ChevronDown size={12} color="#94a3b8" style={{ position: "absolute", right: "6px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", color: "#64748b", marginBottom: "4px" }}>
                    Difficulty
                  </label>
                  <div style={{ position: "relative" }}>
                    <select
                      value={selectedDifficulty}
                      onChange={(e) => setSelectedDifficulty(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "6px 20px 6px 8px",
                        borderRadius: "7px",
                        border: "1px solid #e2e8f0",
                        background: "#ffffff",
                        fontSize: "11.5px",
                        color: "#334155",
                        appearance: "none",
                        outline: "none",
                      }}
                    >
                      <option value="all">All Levels</option>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                    </select>
                    <ChevronDown size={12} color="#94a3b8" style={{ position: "absolute", right: "6px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", color: "#64748b", marginBottom: "4px" }}>
                    Question Type
                  </label>
                  <div style={{ position: "relative" }}>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "6px 20px 6px 8px",
                        borderRadius: "7px",
                        border: "1px solid #e2e8f0",
                        background: "#ffffff",
                        fontSize: "11.5px",
                        color: "#334155",
                        appearance: "none",
                        outline: "none",
                      }}
                    >
                      <option value="all">All Types</option>
                      <option value="mcq">MCQ</option>
                      <option value="desc">Descriptive</option>
                    </select>
                    <ChevronDown size={12} color="#94a3b8" style={{ position: "absolute", right: "6px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", color: "#64748b", marginBottom: "4px" }}>
                    Verified By
                  </label>
                  <div style={{ position: "relative" }}>
                    <select
                      value={selectedVerifier}
                      onChange={(e) => setSelectedVerifier(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "6px 20px 6px 8px",
                        borderRadius: "7px",
                        border: "1px solid #e2e8f0",
                        background: "#ffffff",
                        fontSize: "11.5px",
                        color: "#334155",
                        appearance: "none",
                        outline: "none",
                      }}
                    >
                      <option value="all">Pending Approval</option>
                      <option value="arun">Arun Kumar</option>
                      <option value="priya">Priya N</option>
                    </select>
                    <ChevronDown size={12} color="#94a3b8" style={{ position: "absolute", right: "6px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", color: "#64748b", marginBottom: "4px" }}>
                    Sort By
                  </label>
                  <div style={{ position: "relative" }}>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "6px 20px 6px 8px",
                        borderRadius: "7px",
                        border: "1px solid #e2e8f0",
                        background: "#ffffff",
                        fontSize: "11.5px",
                        color: "#334155",
                        appearance: "none",
                        outline: "none",
                      }}
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                    </select>
                    <ChevronDown size={12} color="#94a3b8" style={{ position: "absolute", right: "6px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  </div>
                </div>
              </div>

              {/* Table or Cards View */}
              {viewMode === "table" ? (
                <div className="no-scrollbar" style={{ overflowX: "auto", scrollbarWidth: "none", msOverflowStyle: "none" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                        <th style={{ padding: "10px 8px", width: "30px" }}>
                          <input
                            type="checkbox"
                            checked={selectedRows.length === questions.length}
                            onChange={toggleSelectAll}
                            style={{ cursor: "pointer" }}
                          />
                        </th>
                        <th style={{ padding: "10px 10px", fontSize: "11.5px", fontWeight: 600, color: "#64748b" }}>
                          Question
                        </th>
                        <th style={{ padding: "10px 10px", fontSize: "11.5px", fontWeight: 600, color: "#64748b" }}>
                          Subject / Unit / Topic
                        </th>
                        <th style={{ padding: "10px 8px", fontSize: "11.5px", fontWeight: 600, color: "#64748b" }}>
                          Type
                        </th>
                        <th style={{ padding: "10px 8px", fontSize: "11.5px", fontWeight: 600, color: "#64748b" }}>
                          Difficulty
                        </th>
                        <th style={{ padding: "10px 8px", fontSize: "11.5px", fontWeight: 600, color: "#64748b" }}>
                          Verified By
                        </th>
                        <th style={{ padding: "10px 8px", fontSize: "11.5px", fontWeight: 600, color: "#64748b" }}>
                          Verified On
                        </th>
                        <th style={{ padding: "10px 8px", fontSize: "11.5px", fontWeight: 600, color: "#64748b", textAlign: "center" }}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedQuestions.map((q) => {
                        const isChecked = selectedRows.includes(q.id);

                        return (
                          <tr
                            key={q.id}
                            className="table-row-3d"
                            style={{
                              borderBottom: "1px solid #f1f5f9",
                              background: isChecked ? "#f8fafc" : "transparent",
                            }}
                          >
                            <td style={{ padding: "12px 8px", verticalAlign: "top" }}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleRow(q.id)}
                                style={{ cursor: "pointer" }}
                              />
                            </td>

                            <td style={{ padding: "12px 10px", verticalAlign: "top", maxWidth: "240px" }}>
                              <span
                                style={{
                                  fontSize: "12.5px",
                                  fontWeight: 600,
                                  color: "#0f172a",
                                  lineHeight: "1.4",
                                  display: "block",
                                }}
                              >
                                {q.question}
                              </span>
                              <div style={{ display: "flex", gap: "6px", marginTop: "4px", alignItems: "center" }}>
                                <span style={{ fontSize: "10px", color: "#6366f1", fontWeight: 700 }}>
                                  #{q.id}
                                </span>
                                {q.marks !== undefined && (
                                  <span style={{ fontSize: "10.5px", color: "#64748b" }}>
                                    • {q.marks} Marks
                                  </span>
                                )}
                              </div>
                            </td>

                            <td style={{ padding: "12px 10px", verticalAlign: "top" }}>
                              <div style={{ fontSize: "12px", fontWeight: 600, color: "#1e293b" }}>
                                {q.subject}
                              </div>
                              <div style={{ fontSize: "11px", color: "#64748b" }}>
                                {q.unit}
                              </div>
                              <div style={{ fontSize: "10.5px", color: "#94a3b8" }}>
                                {q.topic}
                              </div>
                            </td>

                            <td style={{ padding: "12px 8px", verticalAlign: "top" }}>
                              <span
                                style={{
                                  display: "inline-block",
                                  fontSize: "10.5px",
                                  fontWeight: 600,
                                  padding: "3px 8px",
                                  borderRadius: "6px",
                                  background: "#f1f5f9",
                                  color: "#475569",
                                  border: "1px solid #e2e8f0",
                                }}
                              >
                                {q.type}
                              </span>
                            </td>

                            <td style={{ padding: "12px 8px", verticalAlign: "top" }}>
                              <span
                                style={{
                                  display: "inline-block",
                                  fontSize: "10.5px",
                                  fontWeight: 700,
                                  padding: "3px 9px",
                                  borderRadius: "7px",
                                  background:
                                    q.difficulty === "Easy"
                                      ? "#dcfce7"
                                      : q.difficulty === "Medium"
                                      ? "#fef3c7"
                                      : "#fee2e2",
                                  color:
                                    q.difficulty === "Easy"
                                      ? "#15803d"
                                      : q.difficulty === "Medium"
                                      ? "#b45309"
                                      : "#b91c1c",
                                }}
                              >
                                {q.difficulty}
                              </span>
                            </td>

                            <td style={{ padding: "12px 8px", verticalAlign: "top" }}>
                              <div style={{ fontSize: "11.5px", fontWeight: 600, color: "#334155" }}>
                                {q.verifiedBy || "Arun Kumar"}
                              </div>
                              <div style={{ fontSize: "10px", color: "#94a3b8" }}>
                                HOD / Senior Faculty
                              </div>
                            </td>

                            <td style={{ padding: "12px 8px", verticalAlign: "top", fontSize: "11px", color: "#64748b" }}>
                              {q.addedOn || "31 Aug 2024"}
                            </td>

                            <td style={{ padding: "12px 8px", verticalAlign: "top", textAlign: "center" }}>
                              <div style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                                <CrudActionButtons
                                  onView={() => setViewingQuestion(q)}
                                  onVerify={() => handleApproveQuestion(q.id)}
                                  onEdit={() => setEditingQuestion(q)}
                                  onDelete={() => setDeletingQuestion(q)}
                                  viewTitle="View & Inspect Question"
                                  verifyTitle={currentUser.role === "HOD" ? "Verify & Send to Dean" : "Approve & Send to COE"}
                                  editTitle="Edit Question"
                                  deleteTitle="Delete Question"
                                  size={30}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleApproveQuestion(q.id)}
                                  title="Approve Question"
                                  style={{
                                    width: "30px",
                                    height: "30px",
                                    borderRadius: "8px",
                                    border: "1px solid #bbf7d0",
                                    background: "#f0fdf4",
                                    color: "#16a34a",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    transition: "all 0.15s ease",
                                  }}
                                >
                                  <Check size={14} strokeWidth={2.2} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRejectQuestion(q.id)}
                                  title="Reject Question"
                                  style={{
                                    width: "30px",
                                    height: "30px",
                                    borderRadius: "8px",
                                    border: "1px solid #fecaca",
                                    background: "#fef2f2",
                                    color: "#dc2626",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    transition: "all 0.15s ease",
                                  }}
                                >
                                  <XCircle size={14} strokeWidth={2.2} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRequestEditQuestion(q.id)}
                                  title="Request Edit / Return"
                                  style={{
                                    width: "30px",
                                    height: "30px",
                                    borderRadius: "8px",
                                    border: "1px solid #fed7aa",
                                    background: "#fff7ed",
                                    color: "#ea580c",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    transition: "all 0.15s ease",
                                  }}
                                >
                                  <RotateCcw size={14} strokeWidth={2.2} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                    gap: "16px",
                  }}
                >
                  {paginatedQuestions.map((q) => {
                    const isChecked = selectedRows.includes(q.id);

                    return (
                      <div
                        key={q.id}
                        className="widget-card-3d"
                        style={{
                          background: isChecked ? "#f8fafc" : "#ffffff",
                          borderRadius: "16px",
                          border: isChecked ? "1.5px solid #6366f1" : "1px solid #e2e8f0",
                          padding: "18px",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          gap: "14px",
                          boxShadow: isChecked
                            ? "0 8px 20px rgba(99, 102, 241, 0.15)"
                            : "0 4px 14px rgba(0, 0, 0, 0.03)",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <div>
                          {/* Top Row: Checkbox, ID, Type badge, Difficulty badge */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              marginBottom: "10px",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleRow(q.id)}
                                style={{ cursor: "pointer", accentColor: "#4f46e5", width: "15px", height: "15px" }}
                              />
                              <span style={{ fontSize: "11px", fontWeight: 700, color: "#4f46e5", background: "#eef2ff", padding: "2px 7px", borderRadius: "6px" }}>
                                #{q.id}
                              </span>
                              <span
                                style={{
                                  fontSize: "11px",
                                  fontWeight: 600,
                                  color: "#475569",
                                  background: "#f1f5f9",
                                  padding: "2px 8px",
                                  borderRadius: "6px",
                                }}
                              >
                                {q.type}
                              </span>
                            </div>

                            <span
                              style={{
                                fontSize: "11px",
                                fontWeight: 700,
                                padding: "3px 9px",
                                borderRadius: "7px",
                                background:
                                  q.difficulty === "Easy"
                                    ? "#dcfce7"
                                    : q.difficulty === "Medium"
                                    ? "#fef3c7"
                                    : "#fee2e2",
                                color:
                                  q.difficulty === "Easy"
                                    ? "#15803d"
                                    : q.difficulty === "Medium"
                                    ? "#b45309"
                                    : "#b91c1c",
                              }}
                            >
                              {q.difficulty}
                            </span>
                          </div>

                          {/* Question Text */}
                          <p
                            style={{
                              fontSize: "13.5px",
                              fontWeight: 700,
                              color: "#0f172a",
                              lineHeight: "1.45",
                              margin: "0 0 10px 0",
                              display: "-webkit-box",
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {q.question}
                          </p>

                          {/* Attached Diagram / Image Preview Box */}
                          {q.imageUrl && (
                            <div
                              style={{
                                marginTop: "4px",
                                marginBottom: "10px",
                                borderRadius: "10px",
                                overflow: "hidden",
                                background: "#0f172a",
                                padding: "8px 10px",
                                border: "1px solid rgba(56, 189, 248, 0.35)",
                                cursor: "pointer",
                              }}
                              onClick={() => setViewingQuestion(q)}
                            >
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "10.5px", color: "#38bdf8", fontWeight: 700, marginBottom: "4px" }}>
                                <span>🖼️ Diagram Attached ({q.diagramType || "Figure"})</span>
                                <span style={{ fontSize: "9.5px", color: "#94a3b8" }}>🔍 Inspect</span>
                              </div>
                              <img
                                src={q.imageUrl}
                                alt={q.diagramTitle || "Question Diagram"}
                                style={{ width: "100%", maxHeight: "110px", objectFit: "contain", borderRadius: "6px" }}
                              />
                              {q.diagramTitle && (
                                <div style={{ fontSize: "10px", color: "#cbd5e1", marginTop: "4px", fontStyle: "italic", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                  {q.diagramTitle}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Subject / Unit / Topic */}
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "11.5px", color: "#64748b" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ fontWeight: 600, color: "#1e293b" }}>{q.subject}</span>
                              <span>•</span>
                              <span>{q.unit}</span>
                            </div>
                            {q.topic && (
                              <span style={{ fontSize: "11px", color: "#94a3b8" }}>{q.topic}</span>
                            )}
                          </div>
                        </div>

                        {/* Card Footer: Verifier info + Actions */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            paddingTop: "12px",
                            borderTop: "1px solid #f1f5f9",
                            marginTop: "auto",
                          }}
                        >
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            <span style={{ fontSize: "11px", color: "#334155", fontWeight: 600 }}>
                              {q.verifiedBy || "Arun Kumar"}
                            </span>
                            <span style={{ fontSize: "10px", color: "#94a3b8" }}>
                              {q.addedOn || "31 Aug 2024"}
                            </span>
                          </div>

                          <div style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                            <CrudActionButtons
                              onView={() => setViewingQuestion(q)}
                              onVerify={() => handleApproveQuestion(q.id)}
                              onEdit={() => setEditingQuestion(q)}
                              onDelete={() => setDeletingQuestion(q)}
                              viewTitle="View & Inspect Question"
                              verifyTitle={currentUser.role === "HOD" ? "Verify & Send to Dean" : "Approve & Send to COE"}
                              editTitle="Edit Question"
                              deleteTitle="Delete Question"
                              size={30}
                            />
                            <button
                              type="button"
                              onClick={() => handleApproveQuestion(q.id)}
                              title="Approve Question"
                              style={{
                                width: "30px",
                                height: "30px",
                                borderRadius: "8px",
                                border: "1px solid #bbf7d0",
                                background: "#f0fdf4",
                                color: "#16a34a",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                transition: "all 0.15s ease",
                              }}
                            >
                              <Check size={14} strokeWidth={2.2} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRejectQuestion(q.id)}
                              title="Reject Question"
                              style={{
                                width: "30px",
                                height: "30px",
                                borderRadius: "8px",
                                border: "1px solid #fecaca",
                                background: "#fef2f2",
                                color: "#dc2626",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                transition: "all 0.15s ease",
                              }}
                            >
                              <XCircle size={14} strokeWidth={2.2} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRequestEditQuestion(q.id)}
                              title="Request Edit / Return"
                              style={{
                                width: "30px",
                                height: "30px",
                                borderRadius: "8px",
                                border: "1px solid #fed7aa",
                                background: "#fff7ed",
                                color: "#ea580c",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                transition: "all 0.15s ease",
                              }}
                            >
                              <RotateCcw size={14} strokeWidth={2.2} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Table Footer / Pagination */}
              <Pagination
                currentPage={safeCurrentPage}
                totalItems={filteredQuestions.length}
                itemsPerPage={itemsPerPage}
                onPageChange={(p) => setCurrentPage(p)}
                itemName="questions"
              />
            </div>

            {/* ================= RIGHT COLUMN: Overview & Quick Actions ================= */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Card 1: Approval Overview */}
              <div className="widget-card-3d" style={{ padding: "22px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "18px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                      className="action-mini-icon-blue"
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 12px rgba(37, 99, 235, 0.35)",
                      }}
                    >
                      <Layers size={16} color="#ffffff" />
                    </div>
                    <span style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a" }}>
                      Approval Overview
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => router.push("/reports")}
                    className="filter-btn-3d"
                    style={{
                      padding: "5px 12px",
                      borderRadius: "8px",
                      fontSize: "11.5px",
                      fontWeight: 700,
                      color: "#2563eb",
                      border: "1px solid #bfdbfe",
                      background: "#eff6ff",
                      cursor: "pointer",
                    }}
                  >
                    View Report
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        className="action-mini-icon-blue"
                        style={{ width: "26px", height: "26px", borderRadius: "50%", boxShadow: "0 2px 8px rgba(37, 99, 235, 0.3)" }}
                      >
                        <BookOpen size={13} color="#ffffff" />
                      </div>
                      <span style={{ fontSize: "12.5px", color: "#334155", fontWeight: 600 }}>
                        Total Questions
                      </span>
                    </div>
                    <strong style={{ fontSize: "14px", color: "#0f172a", fontWeight: 800 }}>{questions.length}</strong>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        className="action-mini-icon-orange"
                        style={{ width: "26px", height: "26px", borderRadius: "50%", boxShadow: "0 2px 8px rgba(234, 88, 12, 0.3)" }}
                      >
                        <Clock size={13} color="#ffffff" />
                      </div>
                      <span style={{ fontSize: "12.5px", color: "#334155", fontWeight: 600 }}>
                        Pending Approval
                      </span>
                    </div>
                    <strong style={{ fontSize: "14px", color: "#ea580c", fontWeight: 800 }}>
                      {questions.filter((q) => q.status === "Pending" || q.status === "Verified").length}
                    </strong>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        className="action-mini-icon-green"
                        style={{ width: "26px", height: "26px", borderRadius: "50%", boxShadow: "0 2px 8px rgba(22, 163, 74, 0.3)" }}
                      >
                        <CheckCircle2 size={13} color="#ffffff" />
                      </div>
                      <span style={{ fontSize: "12.5px", color: "#334155", fontWeight: 600 }}>
                        Approved Questions
                      </span>
                    </div>
                    <strong style={{ fontSize: "14px", color: "#16a34a", fontWeight: 800 }}>
                      {questions.filter((q) => q.status === "Approved").length}
                    </strong>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        className="action-mini-icon-cyan"
                        style={{ width: "26px", height: "26px", borderRadius: "50%", boxShadow: "0 2px 8px rgba(2, 132, 199, 0.3)" }}
                      >
                        <RefreshCw size={13} color="#ffffff" />
                      </div>
                      <span style={{ fontSize: "12.5px", color: "#334155", fontWeight: 600 }}>
                        Returned for Edit
                      </span>
                    </div>
                    <strong style={{ fontSize: "14px", color: "#0284c7", fontWeight: 800 }}>
                      {questions.filter((q) => q.status === "Pending").length}
                    </strong>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        className="action-mini-icon-red"
                        style={{ width: "26px", height: "26px", borderRadius: "50%", boxShadow: "0 2px 8px rgba(220, 38, 38, 0.3)" }}
                      >
                        <XCircle size={13} color="#ffffff" />
                      </div>
                      <span style={{ fontSize: "12.5px", color: "#334155", fontWeight: 600 }}>
                        Rejected Questions
                      </span>
                    </div>
                    <strong style={{ fontSize: "14px", color: "#dc2626", fontWeight: 800 }}>
                      {questions.filter((q) => q.status === "Rejected").length}
                    </strong>
                  </div>

                  <div
                    style={{
                      borderTop: "1px solid #f1f5f9",
                      paddingTop: "12px",
                      marginTop: "6px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Clock size={14} color="#6366f1" style={{ animation: "float3D 3s ease-in-out infinite" }} />
                        <span style={{ fontSize: "11.5px", color: "#64748b", fontWeight: 500 }}>Last Approved</span>
                      </div>
                      <span style={{ fontSize: "11.5px", color: "#0f172a", fontWeight: 700 }}>
                        {lastUpdatedTime || "Just now"}
                      </span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Clock size={14} color="#6366f1" style={{ animation: "float3D 3s ease-in-out infinite" }} />
                        <span style={{ fontSize: "11.5px", color: "#64748b", fontWeight: 500 }}>Last Updated</span>
                      </div>
                      <span style={{ fontSize: "11.5px", color: "#0f172a", fontWeight: 700 }}>
                        {lastUpdatedTime || "Just now"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Quick Actions */}
              <div className="widget-card-3d" style={{ padding: "22px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                  <div
                    className="action-mini-icon-orange"
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 4px 12px rgba(234, 88, 12, 0.35)",
                    }}
                  >
                    <SlidersHorizontal size={16} color="#ffffff" />
                  </div>
                  <div style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a" }}>
                    Quick Actions
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {/* Action 1: Approve Selected Questions */}
                  <div
                    className="quick-action-row-3d"
                    onClick={() => {
                      if (selectedRows.length === 0) {
                        triggerToast("Please select questions to approve", "info");
                        return;
                      }
                      selectedRows.forEach((id) => examStore.saveQuestion({ id, status: "Approved" }));
                      triggerToast(`${selectedRows.length} questions approved for Question Bank!`, "success");
                      setSelectedRows([]);
                    }}
                  >
                    <div className="action-mini-icon-green" style={{ width: "34px", height: "34px" }}>
                      <Check size={16} strokeWidth={2.5} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ display: "block", fontSize: "12.5px", color: "#0f172a", fontWeight: 700 }}>
                        Approve Selected Questions
                      </strong>
                      <span style={{ fontSize: "11px", color: "#64748b" }}>Approve the selected questions ({selectedRows.length} selected)</span>
                    </div>
                    <ChevronRight size={16} className="chevron-arrow-glow" color="#94a3b8" />
                  </div>

                  {/* Action 2: Return for Edit */}
                  <div
                    className="quick-action-row-3d"
                    onClick={() => {
                      if (selectedRows.length === 0) {
                        triggerToast("Please select questions to return for edit", "info");
                        return;
                      }
                      selectedRows.forEach((id) => examStore.saveQuestion({ id, status: "Pending" }));
                      triggerToast(`${selectedRows.length} questions returned for edit.`, "info");
                      setSelectedRows([]);
                    }}
                  >
                    <div className="action-mini-icon-orange" style={{ width: "34px", height: "34px" }}>
                      <RotateCcw size={16} strokeWidth={2.5} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ display: "block", fontSize: "12.5px", color: "#0f172a", fontWeight: 700 }}>
                        Return for Edit
                      </strong>
                      <span style={{ fontSize: "11px", color: "#64748b" }}>Send questions back for corrections</span>
                    </div>
                    <ChevronRight size={16} className="chevron-arrow-glow" color="#94a3b8" />
                  </div>

                  {/* Action 3: Reject Selected Questions */}
                  <div
                    className="quick-action-row-3d"
                    onClick={() => {
                      if (selectedRows.length === 0) {
                        triggerToast("Please select questions to reject", "info");
                        return;
                      }
                      selectedRows.forEach((id) => examStore.saveQuestion({ id, status: "Rejected" }));
                      triggerToast(`${selectedRows.length} questions rejected.`, "info");
                      setSelectedRows([]);
                    }}
                  >
                    <div className="action-mini-icon-red" style={{ width: "34px", height: "34px" }}>
                      <Shield size={16} strokeWidth={2.5} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ display: "block", fontSize: "12.5px", color: "#0f172a", fontWeight: 700 }}>
                        Reject Selected Questions
                      </strong>
                      <span style={{ fontSize: "11px", color: "#64748b" }}>Reject the selected questions</span>
                    </div>
                    <ChevronRight size={16} className="chevron-arrow-glow" color="#94a3b8" />
                  </div>

                  {/* Action 4: Bulk Approval */}
                  <div
                    className="quick-action-row-3d"
                    onClick={() => {
                      const awaiting = filteredQuestions.filter((q) => q.status !== "Approved");
                      if (awaiting.length === 0) {
                        triggerToast("All questions in current view are already approved!", "info");
                        return;
                      }
                      awaiting.forEach((q) => examStore.saveQuestion({ id: q.id, status: "Approved" }));
                      triggerToast(`All ${awaiting.length} questions approved!`, "success");
                    }}
                  >
                    <div className="action-mini-icon-blue" style={{ width: "34px", height: "34px" }}>
                      <FileCheck size={16} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ display: "block", fontSize: "12.5px", color: "#0f172a", fontWeight: 700 }}>
                        Bulk Approval
                      </strong>
                      <span style={{ fontSize: "11px", color: "#64748b" }}>Approve multiple questions at once</span>
                    </div>
                    <ChevronRight size={16} className="chevron-arrow-glow" color="#94a3b8" />
                  </div>

                  {/* Action 5: Download Pending Questions */}
                  <div
                    className="quick-action-row-3d"
                    onClick={() => {
                      const pendingItems = questions.filter((q) => q.status === "Pending" || q.status === "Verified");
                      const itemsToExport = pendingItems.length ? pendingItems : questions;
                      examStore.exportToCsv("pending_approval_questions.csv", itemsToExport.map((q) => ({
                        ID: q.id,
                        Subject: q.subject,
                        Unit: q.unit,
                        Topic: q.topic,
                        Question: q.question,
                        Type: q.type,
                        Difficulty: q.difficulty,
                        Status: q.status,
                        Marks: q.marks,
                        VerifiedBy: q.verifiedBy || "N/A",
                      })));
                      triggerToast(`Exported ${itemsToExport.length} questions to CSV!`, "success");
                    }}
                  >
                    <div className="action-mini-icon-cyan" style={{ width: "34px", height: "34px" }}>
                      <Download size={16} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ display: "block", fontSize: "12.5px", color: "#0f172a", fontWeight: 700 }}>
                        Download Pending Questions
                      </strong>
                      <span style={{ fontSize: "11px", color: "#64748b" }}>Download pending questions as CSV</span>
                    </div>
                    <ChevronRight size={16} className="chevron-arrow-glow" color="#94a3b8" />
                  </div>

                  {/* Action 6: Approval Settings */}
                  <div
                    className="quick-action-row-3d"
                    onClick={() => router.push("/settings")}
                  >
                    <div className="action-mini-icon-purple" style={{ width: "34px", height: "34px" }}>
                      <Settings size={16} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ display: "block", fontSize: "12.5px", color: "#0f172a", fontWeight: 700 }}>
                        Approval Settings
                      </strong>
                      <span style={{ fontSize: "11px", color: "#64748b" }}>Configure approval workflow</span>
                    </div>
                    <ChevronRight size={16} className="chevron-arrow-glow" color="#94a3b8" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Support Banner & Footer */}
          <PortalFooter />
        </main>
      </div>

      {/* ================= CRUD MODALS ================= */}
      <ViewModal
        isOpen={subjectModalData.isOpen}
        onClose={() => setSubjectModalData({ isOpen: false, subjectName: "", questions: [] })}
        title={`${subjectModalData.subjectName} - Questions Approval Inspection`}
        subtitle="Read all questions in full detail below before giving official verification approval"
        badge={`${subjectModalData.questions.length} Questions`}
        badgeColor="blue"
        questionsList={subjectModalData.questions}
        onVerify={handleApproveSubjectFromModal}
        verifyLabel={
          currentUser.role === "HOD"
            ? "✓ Verify & Send to Dean"
            : currentUser.role === "DEAN"
            ? "✓ Approve & Send to COE"
            : "✓ Approve Subject Questions"
        }
      />

      <ViewModal
        isOpen={!!viewingQuestion}
        onClose={() => setViewingQuestion(null)}
        title="Question Details & Verification"
        subtitle={`ID: #${viewingQuestion?.id} • Subject: ${viewingQuestion?.subject}`}
        badge={viewingQuestion?.status || "Pending"}
        badgeColor={
          viewingQuestion?.status === "Approved"
            ? "green"
            : viewingQuestion?.status === "Verified"
            ? "blue"
            : "yellow"
        }
        questionsList={viewingQuestion ? [viewingQuestion] : []}
        verifyLabel={
          currentUser.role === "HOD"
            ? "Verify & Send to Dean"
            : currentUser.role === "DEAN"
            ? "Approve & Send to COE"
            : "Verify Question"
        }
        onVerify={() => {
          if (!viewingQuestion) return;
          handleApproveQuestion(viewingQuestion.id);
          setViewingQuestion(null);
        }}
        data={
          viewingQuestion
            ? [
                { label: "Question Statement", value: viewingQuestion.question, spanFull: true },
                { label: "Subject", value: viewingQuestion.subject },
                { label: "Unit", value: viewingQuestion.unit },
                { label: "Topic", value: viewingQuestion.topic },
                { label: "Type", value: viewingQuestion.type },
                { label: "Difficulty", value: viewingQuestion.difficulty },
                { label: "Marks", value: viewingQuestion.marks || 5 },
                { label: "Status", value: viewingQuestion.status },
                { label: "Uploaded By", value: viewingQuestion.uploadedBy || "Prof. Priya Sharma" },
                { label: "Verified By", value: viewingQuestion.verifiedBy || "Pending Review" },
                { label: "Verified On", value: viewingQuestion.date ? `${viewingQuestion.date}, ${viewingQuestion.time || ""}` : "Pending" },
              ]
            : []
        }
      />

      <FormModal
        isOpen={isAddingQuestion || !!editingQuestion}
        onClose={() => {
          setIsAddingQuestion(false);
          setEditingQuestion(null);
        }}
        title={editingQuestion ? "Edit Question" : "Add New Question"}
        subtitle={editingQuestion ? `Editing Question #${editingQuestion.id}` : "Create a new question for approval"}
        fields={questionFields}
        initialData={editingQuestion || { subject: "Viscom & VFX", type: "MCQ", difficulty: "Medium", marks: 5, status: "Verified" }}
        submitLabel={editingQuestion ? "Update Question" : "Create Question"}
        onSubmit={(data) => {
          if (editingQuestion) {
            examStore.saveQuestion({ ...editingQuestion, ...data });
            triggerToast("Question updated successfully!", "success");
          } else {
            examStore.saveQuestion({ ...data, status: data.status || "Verified" });
            triggerToast("New question created successfully!", "success");
          }
          setIsAddingQuestion(false);
          setEditingQuestion(null);
        }}
      />

      <DeleteModal
        isOpen={!!deletingQuestion}
        onClose={() => setDeletingQuestion(null)}
        title="Delete Question"
        message="Are you sure you want to permanently delete this question from approval? This action cannot be undone."
        itemName={deletingQuestion?.question ? `"${deletingQuestion.question.slice(0, 60)}..."` : undefined}
        onConfirm={() => {
          if (deletingQuestion) {
            examStore.deleteQuestion(deletingQuestion.id);
            triggerToast("Question deleted successfully.", "info");
            setDeletingQuestion(null);
          }
        }}
      />

      <ToastNotification
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />

      <VerificationResultModal
        isOpen={verifyPopModal.isOpen}
        onClose={() => setVerifyPopModal((prev) => ({ ...prev, isOpen: false }))}
        title={verifyPopModal.title}
        itemName={verifyPopModal.itemName}
        qualityScore={98}
        remarks={verifyPopModal.remarks}
      />
    </div>
    </RoleGuard>
  );
}
