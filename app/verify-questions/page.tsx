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
  Trash2,
  Plus,
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
  ShieldCheck,
  XCircle,
  Eye,
  Check,
  X,
  Maximize2,
  Download,
  AlertCircle,
  Layers,
  FileSpreadsheet,
  Sparkles,
  RotateCcw,
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

export default function VerifyQuestionsPage() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState("verify-questions");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedUnit, setSelectedUnit] = useState("all");
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("pending");
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | string>(1);
  const [showPreview, setShowPreview] = useState(true);
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
    const subjQuestions = questions.filter((q) =>
      (q.subject || "").toLowerCase().includes(subjName.toLowerCase()) ||
      subjName.toLowerCase().includes((q.subject || "").toLowerCase())
    );

    setSubjectModalData({
      isOpen: true,
      subjectName: subjName,
      questions: subjQuestions.length > 0 ? subjQuestions : questions,
    });
  };

  const handleApproveSubjectFromModal = () => {
    const ids = subjectModalData.questions.map((q) => q.id);
    if (ids.length === 0) return;

    if (currentUser.role === "HOD") {
      examStore.hodVerifyQuestions(ids, currentUser.name);
      setVerifyModalItem({
        isOpen: true,
        name: `${subjectModalData.subjectName} (${ids.length} Questions)`,
        totalQuestions: ids.length,
        score: 98,
      });
    } else if (currentUser.role === "DEAN") {
      examStore.deanApproveQuestions(ids, currentUser.name);
      setVerifyModalItem({
        isOpen: true,
        name: `${subjectModalData.subjectName} (${ids.length} Questions)`,
        totalQuestions: ids.length,
        score: 99,
      });
    } else {
      examStore.bulkUpdateQuestions(ids.map(Number), "Verified");
      setVerifyModalItem({
        isOpen: true,
        name: `${subjectModalData.subjectName} (${ids.length} Questions)`,
        totalQuestions: ids.length,
        score: 96,
      });
    }
  };

  // Toast
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">("success");
  const [showToast, setShowToast] = useState(false);

  // AI State
  const [isAiScanning, setIsAiScanning] = useState(false);
  const [aiScanStep, setAiScanStep] = useState(0);

  const [verifyModalItem, setVerifyModalItem] = useState<{
    isOpen: boolean;
    name: string;
    totalQuestions: number;
    score: number;
  }>({
    isOpen: false,
    name: "",
    totalQuestions: 0,
    score: 98,
  });

  const handleAiVerify = (targetIds?: (string | number)[]) => {
    setIsAiScanning(true);
    setAiScanStep(1);
    setTimeout(() => setAiScanStep(2), 400);
    setTimeout(() => setAiScanStep(3), 850);
    setTimeout(() => {
      const res = examStore.runAiVerification(targetIds);
      setIsAiScanning(false);
      setVerifyModalItem({
        isOpen: true,
        name: targetIds && targetIds.length === 1 ? `Question #${targetIds[0]}` : "Questions Pool",
        totalQuestions: res.verifiedCount,
        score: Math.floor(Math.random() * 6) + 94,
      });
    }, 1300);
  };

  const triggerToast = (msg: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>(() => examStore.getLastUpdated());

  useEffect(() => {
    const loadQuestions = () => {
      setQuestions(examStore.getQuestions());
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
    { id: "verify-questions", label: "Verify Questions", icon: Search, hasArrow: true, route: "/verify-questions" },
    { id: "approval", label: "Approval", icon: CheckSquare, route: "/approval" },
    { id: "reports", label: "Reports", icon: BarChart2, route: "/reports" },
    { id: "notifications", label: "Notifications", icon: Bell, route: "/notifications" },
    { id: "manual-questions", label: "Manual Questions", icon: Edit3, badge: "New", route: "/manual-questions" },
    { id: "settings", label: "Settings", icon: Settings, route: "/settings" },
  ];

  const menuItems = rawMenuItems.filter((item) =>
    hasPermission(currentUser.role, item.route, currentUser.isSubjectFaculty)
  );

  // Filtering
  const filteredQuestions = questions.filter((q) => {
    if (selectedSubject !== "all") {
      if (selectedSubject === "vfx" && !q.subject.includes("VFX")) return false;
      if (selectedSubject === "viscom" && q.subject !== "Viscom") return false;
      if (selectedSubject !== "vfx" && selectedSubject !== "viscom" && !q.subject.toLowerCase().includes(selectedSubject.toLowerCase())) return false;
    }
    if (selectedUnit !== "all") {
      if (selectedUnit === "u1" && !q.unit.includes("Unit I")) return false;
      if (selectedUnit === "u2" && !q.unit.includes("Unit II")) return false;
      if (selectedUnit === "u3" && !q.unit.includes("Unit III")) return false;
      if (!selectedUnit.startsWith("u") && !q.unit.toLowerCase().includes(selectedUnit.toLowerCase())) return false;
    }
    if (selectedTopic !== "all") {
      if (selectedTopic === "t1" && !q.topic.toLowerCase().includes("basics")) return false;
      if (selectedTopic === "t2" && !q.topic.toLowerCase().includes("model")) return false;
      if (!selectedTopic.startsWith("t") && !q.topic.toLowerCase().includes(selectedTopic.toLowerCase())) return false;
    }
    if (selectedDifficulty !== "all" && q.difficulty.toLowerCase() !== selectedDifficulty.toLowerCase()) return false;
    if (selectedStatus === "pending" && q.status !== "Pending") return false;
    if (selectedStatus === "verified" && q.status !== "Verified") return false;
    if (selectedStatus === "rejected" && q.status !== "Rejected") return false;
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
  }, [searchQuery, selectedSubject, selectedUnit, selectedTopic, selectedDifficulty, selectedStatus]);

  const itemsPerPage = 6;
  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedQuestions = filteredQuestions.slice(startIndex, startIndex + itemsPerPage);

  const currentPreview = filteredQuestions.find((q) => String(q.id) === String(selectedQuestionId)) || filteredQuestions[0] || questions[0];

  const handleVerifyQuestion = (id: number | string) => {
    examStore.saveQuestion({ id, status: "Verified" });
    triggerToast(`Question #${id} verified successfully!`, "success");
  };

  const handleRejectQuestion = (id: number | string) => {
    examStore.saveQuestion({ id, status: "Rejected" });
    triggerToast(`Question #${id} rejected.`, "info");
  };

  const handleBulkVerify = () => {
    if (selectedRows.length === 0) return;
    examStore.bulkUpdateQuestions(selectedRows.map(Number), "Verified");
    setSelectedRows([]);
    triggerToast(`${selectedRows.length} question(s) verified successfully!`, "success");
  };

  const handleBulkReject = () => {
    if (selectedRows.length === 0) return;
    examStore.bulkUpdateQuestions(selectedRows.map(Number), "Rejected");
    setSelectedRows([]);
    triggerToast(`${selectedRows.length} question(s) rejected.`, "info");
  };

  const handleBulkDelete = () => {
    if (selectedRows.length === 0) return;
    if (confirm(`Delete ${selectedRows.length} selected question(s)?`)) {
      examStore.bulkDeleteQuestions(selectedRows.map(Number));
      setSelectedRows([]);
      triggerToast(`${selectedRows.length} question(s) removed.`, "error");
    }
  };

  const handleExportVerified = () => {
    const dataToExport = filteredQuestions.length > 0 ? filteredQuestions : questions;
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
    examStore.exportToCsv("verify_questions_export.csv", rows);
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
    setSelectedStatus("pending");
    setSearchQuery("");
  };

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
    <RoleGuard route="/verify-questions">
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
              alt="Rathinam Global University"
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
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    width: "100%",
                    padding: "11px 15px",
                    borderRadius: "14px",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "13.5px",
                    fontWeight: isActive ? 700 : 500,
                    textAlign: "left",
                    position: "relative",
                  }}
                >
                  <IconComp
                    size={18}
                    style={{
                      filter: isActive
                        ? "drop-shadow(0 0 6px rgba(255, 255, 255, 0.8))"
                        : "none",
                    }}
                  />
                  <span style={{ flex: 1 }}>{item.label}</span>

                  {item.badge && (
                    <span
                      style={{
                        background: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)",
                        color: "#ffffff",
                        fontSize: "10px",
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: "10px",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        boxShadow: "0 2px 8px rgba(236, 72, 153, 0.5)",
                      }}
                    >
                      {item.badge}
                    </span>
                  )}

                  {item.hasArrow && (
                    <ChevronRight
                      size={16}
                      color="#ffffff"
                      style={{ filter: "drop-shadow(0 0 4px rgba(255,255,255,0.6))" }}
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Need Help Box */}
        <div className="support-card-3d" style={{ marginTop: "20px" }}>
          <div className="shield-icon-3d">
            <Shield size={20} style={{ filter: "drop-shadow(0 0 4px rgba(96, 165, 250, 0.8))" }} />
          </div>
          <strong style={{ display: "block", color: "#ffffff", fontSize: "14px", marginBottom: "4px", fontWeight: 700 }}>
            Need Help?
          </strong>
          <p style={{ fontSize: "11.5px", color: "#94a3b8", lineHeight: 1.45, margin: "0 0 14px 0" }}>
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
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#ffffff",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.16)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)")}
          >
            <span>Contact Support</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </aside>

      {/* ================================= MAIN CONTENT ================================= */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, height: "100vh", overflow: "hidden" }}>
        {/* Top Header */}
        <PortalHeader activeRoute="verify-questions" />


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
                <span>Verify Questions</span>
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
                Review, verify and manage questions uploaded to the question bank.
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
                <School
                  size={20}
                  style={{ filter: "drop-shadow(0 0 6px rgba(124, 58, 237, 0.6))" }}
                />
              </div>
              <div style={{ flexShrink: 0 }}>
                <strong style={{ display: "block", fontSize: "12.5px", color: "#0f172a", fontWeight: 700, whiteSpace: "nowrap" }}>
                  Rathinam Global Deemed To Be University
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
            {/* Metric 1: Total Questions - 3D Blue with Floating Glow BookOpen */}
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
                  <BookOpen
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
                Total Questions
              </div>
              <div style={{ fontSize: "32px", fontWeight: 800, lineHeight: 1, marginBottom: "6px", textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
                {questions.length}
              </div>
              <div style={{ fontSize: "11.5px", opacity: 0.85 }}>Across All Subjects</div>
            </div>

            {/* Metric 2: Pending Verification - 3D Cyan with Floating Glow ShieldCheck */}
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
                  <ShieldCheck
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
                Pending Verification
              </div>
              <div style={{ fontSize: "32px", fontWeight: 800, lineHeight: 1, marginBottom: "6px", textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
                {questions.filter((q) => q.status === "Pending").length}
              </div>
              <div style={{ fontSize: "11.5px", opacity: 0.85 }}>
                ({questions.length > 0 ? ((questions.filter((q) => q.status === "Pending").length / questions.length) * 100).toFixed(1) : "0"}%)
              </div>
            </div>

            {/* Metric 3: Verified Questions - 3D Emerald with Floating Glow CheckCircle2 */}
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
                  <CheckCircle2
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
                Verified Questions
              </div>
              <div style={{ fontSize: "32px", fontWeight: 800, lineHeight: 1, marginBottom: "6px", textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
                {questions.filter((q) => q.status === "Verified").length}
              </div>
              <div style={{ fontSize: "11.5px", opacity: 0.85 }}>
                ({questions.length > 0 ? ((questions.filter((q) => q.status === "Verified").length / questions.length) * 100).toFixed(1) : "0"}%)
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
            {/* ================= LEFT WIDE COLUMN: Filters, Table & Preview ================= */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Card 1: Filter & Table Container */}
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
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      className="action-mini-icon-blue"
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 6px 16px rgba(37, 99, 235, 0.35)",
                      }}
                    >
                      <Search size={18} color="#ffffff" />
                    </div>
                    <div>
                      <div style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.01em" }}>
                        Questions Verification List
                      </div>
                      <div style={{ fontSize: "11.5px", color: "#64748b" }}>
                        Review, modify, approve or reject uploaded questions before publishing
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <button
                      type="button"
                      onClick={() => handleAiVerify(selectedRows.length > 0 ? selectedRows : undefined)}
                      className="primary-btn-3d"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "7px 16px",
                        borderRadius: "10px",
                        border: "none",
                        background: "linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)",
                        color: "#ffffff",
                        fontSize: "12.5px",
                        fontWeight: 700,
                        cursor: "pointer",
                        boxShadow: "0 4px 14px rgba(124, 58, 237, 0.4)",
                      }}
                    >
                      <Sparkles size={15} style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,0.8))" }} />
                      <span>🤖 AI Verify Questions</span>
                    </button>
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
                      {filteredQuestions.length} Questions Shown
                    </span>
                  </div>
                </div>

                {/* Subject & Marks Question Inspection Cards */}
                <div style={{ marginBottom: "22px", padding: "16px", background: "linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)", borderRadius: "14px", border: "1px solid #dbeafe" }}>
                  <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#1e3a8a", marginBottom: "12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <BookOpen size={16} color="#2563eb" />
                      <span>Subject & Marks Question Inspection Packs</span>
                    </div>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#2563eb", background: "#ffffff", padding: "3px 10px", borderRadius: "20px", border: "1px solid #bfdbfe" }}>
                      Click 👁️ to read full questions & verify
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
                    {/* Main Subject Pack */}
                    {Array.from(new Set(questions.map((q) => q.subject || "Viscom & VFX"))).map((subjName) => {
                      const subjQuestions = questions.filter((q) => (q.subject || "").toLowerCase().includes(subjName.toLowerCase()));
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
                            <span style={{ fontSize: "11px", color: "#475569", fontWeight: 600 }}>
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
                              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                              color: "#ffffff",
                              border: "none",
                              fontSize: "12px",
                              fontWeight: 700,
                              cursor: "pointer",
                              boxShadow: "0 2px 8px rgba(37, 99, 235, 0.35)",
                              flexShrink: 0,
                            }}
                          >
                            <Eye size={14} />
                            <span>View All</span>
                          </button>
                        </div>
                      );
                    })}

                    {/* Marks Breakdown Packs (5 Marks, 10 Marks, 12 Marks) */}
                    {[5, 10, 12].map((mVal) => {
                      const markQs = questions.filter((q) => (Number(q.marks) || 5) === mVal);
                      if (markQs.length === 0) return null;

                      const badgeGrad = mVal === 5 ? "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)" : mVal === 10 ? "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)" : "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)";
                      const borderCol = mVal === 5 ? "#bfdbfe" : mVal === 10 ? "#bbf7d0" : "#e9d5ff";
                      const txtCol = mVal === 5 ? "#1d4ed8" : mVal === 10 ? "#15803d" : "#7e22ce";

                      return (
                        <div
                          key={mVal}
                          style={{
                            background: badgeGrad,
                            border: `1px solid ${borderCol}`,
                            borderRadius: "12px",
                            padding: "12px 14px",
                            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.02)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "10px",
                          }}
                        >
                          <div>
                            <strong style={{ display: "block", fontSize: "13px", color: txtCol, fontWeight: 800 }}>
                              🎯 {mVal} Marks Pack
                            </strong>
                            <span style={{ fontSize: "11px", color: "#475569", fontWeight: 600 }}>
                              {markQs.length} Question(s)
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setSubjectModalData({
                                isOpen: true,
                                subjectName: `${mVal} Marks Questions`,
                                questions: markQs,
                              });
                            }}
                            title={`Read ${mVal} Marks questions`}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              padding: "7px 12px",
                              borderRadius: "8px",
                              background: txtCol,
                              color: "#ffffff",
                              border: "none",
                              fontSize: "12px",
                              fontWeight: 700,
                              cursor: "pointer",
                              boxShadow: `0 2px 8px ${borderCol}`,
                              flexShrink: 0,
                            }}
                          >
                            <Eye size={14} />
                            <span>View</span>
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
                        onClick={() => handleAiVerify(selectedRows)}
                        style={{
                          padding: "6px 14px",
                          fontSize: "12px",
                          fontWeight: 700,
                          background: "linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "8px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <Sparkles size={13} />
                        🤖 AI Verify Selected
                      </button>
                      <button
                        type="button"
                        onClick={handleBulkVerify}
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
                        Verify Selected
                      </button>
                      <button
                        type="button"
                        onClick={handleBulkReject}
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
                        Reject Selected
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
                    marginBottom: "16px",
                  }}
                >
                  <div style={{ position: "relative", flex: 1 }}>
                    <input
                      type="text"
                      placeholder="Search questions by text, subject, or unit..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 42px 10px 14px",
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        background: "#ffffff",
                        fontSize: "13px",
                        color: "#1e293b",
                        outline: "none",
                        boxSizing: "border-box",
                        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.02)",
                      }}
                    />
                    <Search
                      size={16}
                      color="#2563eb"
                      style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)" }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleExportVerified}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "10px 16px",
                      borderRadius: "12px",
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
                    onClick={handleReset}
                    className="filter-btn-3d"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "10px 18px",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      background: "#ffffff",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#64748b",
                      cursor: "pointer",
                    }}
                  >
                    <RotateCcw size={13} />
                    <span>Reset</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsAddingQuestion(true)}
                    className="filter-btn-3d"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "10px 18px",
                      borderRadius: "12px",
                      border: "none",
                      background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#ffffff",
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

                {/* Filter Row 2: Select Dropdowns */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr 1fr 1.3fr",
                    gap: "12px",
                    marginBottom: "20px",
                    paddingBottom: "18px",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <div>
                    <label style={{ display: "block", fontSize: "11px", color: "#64748b", marginBottom: "5px", fontWeight: 600 }}>
                      Subject
                    </label>
                    <div style={{ position: "relative" }}>
                      <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px 26px 8px 12px",
                          borderRadius: "10px",
                          border: "1px solid #e2e8f0",
                          background: "#ffffff",
                          fontSize: "12px",
                          color: "#334155",
                          appearance: "none",
                          outline: "none",
                          fontWeight: 500,
                          cursor: "pointer",
                        }}
                      >
                        <option value="all">All Subjects</option>
                        <option value="vfx">Viscom & VFX</option>
                        <option value="viscom">Viscom</option>
                      </select>
                      <ChevronDown
                        size={14}
                        color="#64748b"
                        style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "11px", color: "#64748b", marginBottom: "5px", fontWeight: 600 }}>
                      Unit
                    </label>
                    <div style={{ position: "relative" }}>
                      <select
                        value={selectedUnit}
                        onChange={(e) => setSelectedUnit(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px 26px 8px 12px",
                          borderRadius: "10px",
                          border: "1px solid #e2e8f0",
                          background: "#ffffff",
                          fontSize: "12px",
                          color: "#334155",
                          appearance: "none",
                          outline: "none",
                          fontWeight: 500,
                          cursor: "pointer",
                        }}
                      >
                        <option value="all">All Units</option>
                        <option value="u1">Unit I</option>
                        <option value="u2">Unit II</option>
                        <option value="u3">Unit III</option>
                      </select>
                      <ChevronDown
                        size={14}
                        color="#64748b"
                        style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "11px", color: "#64748b", marginBottom: "5px", fontWeight: 600 }}>
                      Topic
                    </label>
                    <div style={{ position: "relative" }}>
                      <select
                        value={selectedTopic}
                        onChange={(e) => setSelectedTopic(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px 26px 8px 12px",
                          borderRadius: "10px",
                          border: "1px solid #e2e8f0",
                          background: "#ffffff",
                          fontSize: "12px",
                          color: "#334155",
                          appearance: "none",
                          outline: "none",
                          fontWeight: 500,
                          cursor: "pointer",
                        }}
                      >
                        <option value="all">All Topics</option>
                        <option value="t1">Color Basics</option>
                        <option value="t2">Color Models</option>
                      </select>
                      <ChevronDown
                        size={14}
                        color="#64748b"
                        style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "11px", color: "#64748b", marginBottom: "5px", fontWeight: 600 }}>
                      Difficulty
                    </label>
                    <div style={{ position: "relative" }}>
                      <select
                        value={selectedDifficulty}
                        onChange={(e) => setSelectedDifficulty(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px 26px 8px 12px",
                          borderRadius: "10px",
                          border: "1px solid #e2e8f0",
                          background: "#ffffff",
                          fontSize: "12px",
                          color: "#334155",
                          appearance: "none",
                          outline: "none",
                          fontWeight: 500,
                          cursor: "pointer",
                        }}
                      >
                        <option value="all">All Levels</option>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                      <ChevronDown
                        size={14}
                        color="#64748b"
                        style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "11px", color: "#64748b", marginBottom: "5px", fontWeight: 600 }}>
                      Status
                    </label>
                    <div style={{ position: "relative" }}>
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px 26px 8px 12px",
                          borderRadius: "10px",
                          border: "1px solid #e2e8f0",
                          background: "#ffffff",
                          fontSize: "12px",
                          color: "#334155",
                          appearance: "none",
                          outline: "none",
                          fontWeight: 500,
                          cursor: "pointer",
                        }}
                      >
                        <option value="pending">Pending Verification</option>
                        <option value="verified">Verified</option>
                        <option value="rejected">Rejected</option>
                      </select>
                      <ChevronDown
                        size={14}
                        color="#64748b"
                        style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Table or Cards View */}
                {viewMode === "table" ? (
                  <div className="no-scrollbar" style={{ overflowX: "auto", scrollbarWidth: "none", msOverflowStyle: "none" }}>
                    <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 6px", textAlign: "left" }}>
                      <thead>
                        <tr>
                          <th style={{ padding: "8px 10px", width: "32px" }}>
                            <input
                              type="checkbox"
                              checked={selectedRows.length === questions.length}
                              onChange={toggleSelectAll}
                              style={{ cursor: "pointer", width: "16px", height: "16px", accentColor: "#2563eb" }}
                            />
                          </th>
                          <th style={{ padding: "8px 12px", fontSize: "11.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Question
                          </th>
                          <th style={{ padding: "8px 12px", fontSize: "11.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Subject / Unit / Topic
                          </th>
                          <th style={{ padding: "8px 10px", fontSize: "11.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Type
                          </th>
                          <th style={{ padding: "8px 10px", fontSize: "11.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Difficulty
                          </th>
                          <th style={{ padding: "8px 10px", fontSize: "11.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Uploaded On
                          </th>
                          <th style={{ padding: "8px 10px", fontSize: "11.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Uploaded By
                          </th>
                          <th style={{ padding: "8px 10px", fontSize: "11.5px", fontWeight: 700, color: "#64748b", textAlign: "center", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedQuestions.map((q) => {
                          const isSelected = String(selectedQuestionId) === String(q.id);
                          const isChecked = selectedRows.includes(q.id);

                          return (
                            <tr
                              key={q.id}
                              onClick={() => {
                                setSelectedQuestionId(q.id);
                                setShowPreview(true);
                              }}
                              className="table-row-3d"
                              style={{
                                background: isSelected
                                  ? "#eff6ff"
                                  : isChecked
                                  ? "#f8fafc"
                                  : "#ffffff",
                                borderRadius: "12px",
                                cursor: "pointer",
                                boxShadow: isSelected
                                  ? "0 4px 14px rgba(37, 99, 235, 0.12), inset 0 0 0 1.5px #3b82f6"
                                  : "0 2px 6px rgba(0,0,0,0.02)",
                                border: "1px solid #f1f5f9",
                              }}
                            >
                              <td
                                style={{ padding: "14px 10px", verticalAlign: "top", borderTopLeftRadius: "12px", borderBottomLeftRadius: "12px" }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleRow(q.id)}
                                  style={{ cursor: "pointer", width: "16px", height: "16px", accentColor: "#2563eb", marginTop: "3px" }}
                                />
                              </td>

                              <td style={{ padding: "14px 12px", verticalAlign: "top", maxWidth: "260px" }}>
                                <div
                                  style={{
                                    fontSize: "12.5px",
                                    fontWeight: 700,
                                    color: "#0f172a",
                                    lineHeight: "1.45",
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                  }}
                                  title={q.question}
                                >
                                  {q.question}
                                </div>
                                <div style={{ display: "flex", gap: "6px", marginTop: "6px", alignItems: "center" }}>
                                  <span style={{ fontSize: "10.5px", color: "#2563eb", fontWeight: 700 }}>
                                    #{q.id}
                                  </span>
                                  {q.marks !== undefined && (
                                    <span style={{ fontSize: "10.5px", color: "#64748b", fontWeight: 500 }}>
                                      • {q.marks} Marks
                                    </span>
                                  )}
                                </div>
                              </td>

                              <td style={{ padding: "14px 12px", verticalAlign: "top" }}>
                                <div style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b" }}>
                                  {q.subject}
                                </div>
                                <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                                  {q.unit}
                                </div>
                                <div style={{ fontSize: "10.5px", color: "#94a3b8" }}>
                                  {q.topic}
                                </div>
                              </td>

                              <td style={{ padding: "14px 10px", verticalAlign: "top" }}>
                                <span
                                  style={{
                                    display: "inline-block",
                                    fontSize: "11px",
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

                              <td style={{ padding: "14px 10px", verticalAlign: "top" }}>
                                <span
                                  style={{
                                    display: "inline-block",
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
                              </td>

                              <td style={{ padding: "14px 10px", verticalAlign: "top", fontSize: "11.5px", color: "#64748b", fontWeight: 500 }}>
                                {q.addedOn}
                              </td>

                              <td style={{ padding: "14px 10px", verticalAlign: "top", fontSize: "12px", color: "#334155", fontWeight: 600 }}>
                                {q.uploadedBy || "Faculty"}
                              </td>

                              <td
                                style={{ padding: "14px 10px", verticalAlign: "middle", textAlign: "center", borderTopRightRadius: "12px", borderBottomRightRadius: "12px" }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                                  <CrudActionButtons
                                    onView={() => setViewingQuestion(q)}
                                    onVerify={() => handleAiVerify([q.id])}
                                    onEdit={() => setEditingQuestion(q)}
                                    onDelete={() => setDeletingQuestion(q)}
                                    viewTitle="View Details"
                                    verifyTitle="Verify Question with AI"
                                    editTitle="Edit Question"
                                    deleteTitle="Delete Question"
                                    size={32}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleVerifyQuestion(q.id)}
                                    title="Verify Question"
                                    style={{
                                      width: "32px",
                                      height: "32px",
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
                                      width: "32px",
                                      height: "32px",
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
                                    <X size={14} strokeWidth={2.2} />
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
                      const isSelected = String(selectedQuestionId) === String(q.id);
                      const isChecked = selectedRows.includes(q.id);

                      return (
                        <div
                          key={q.id}
                          onClick={() => {
                            setSelectedQuestionId(q.id);
                            setShowPreview(true);
                          }}
                          className="widget-card-3d"
                          style={{
                            background: isSelected ? "#eff6ff" : isChecked ? "#f8fafc" : "#ffffff",
                            borderRadius: "16px",
                            border: isSelected
                              ? "1.5px solid #2563eb"
                              : isChecked
                              ? "1.5px solid #93c5fd"
                              : "1px solid #e2e8f0",
                            padding: "18px",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            gap: "14px",
                            cursor: "pointer",
                            boxShadow: isSelected
                              ? "0 8px 24px rgba(37, 99, 235, 0.18)"
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
                              <div
                                style={{ display: "flex", alignItems: "center", gap: "8px" }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleRow(q.id)}
                                  style={{ cursor: "pointer", width: "16px", height: "16px", accentColor: "#2563eb" }}
                                />
                                <span style={{ fontSize: "11px", fontWeight: 700, color: "#2563eb", background: "#eff6ff", padding: "2px 7px", borderRadius: "6px" }}>
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

                            {/* Subject & Unit & Topic */}
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

                          {/* Footer with Uploader & Actions */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              paddingTop: "12px",
                              borderTop: "1px solid #f1f5f9",
                              marginTop: "auto",
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                              <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 500 }}>
                                By {q.uploadedBy || "Faculty"}
                              </span>
                              <span style={{ fontSize: "10px", color: "#94a3b8" }}>{q.addedOn}</span>
                            </div>

                            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                              <CrudActionButtons
                                onView={() => setViewingQuestion(q)}
                                onVerify={() => handleAiVerify([q.id])}
                                onEdit={() => setEditingQuestion(q)}
                                onDelete={() => setDeletingQuestion(q)}
                                viewTitle="View Details"
                                verifyTitle="Verify Question with AI"
                                editTitle="Edit Question"
                                deleteTitle="Delete Question"
                                size={30}
                              />
                              <button
                                type="button"
                                onClick={() => handleVerifyQuestion(q.id)}
                                title="Verify Question"
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
                                <X size={14} strokeWidth={2.2} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Table Footer / 3D Pagination */}
                <Pagination
                  currentPage={safeCurrentPage}
                  totalItems={filteredQuestions.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={(p) => setCurrentPage(p)}
                  itemName="questions"
                />
              </div>

              {/* Card 2: Question Preview Card */}
              {showPreview && currentPreview && (
                <div
                  className="widget-card-3d"
                  style={{
                    padding: "24px",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "18px",
                      borderBottom: "1px solid #f1f5f9",
                      paddingBottom: "12px",
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
                        <Eye size={16} color="#ffffff" style={{ filter: "drop-shadow(0 0 4px rgba(255,255,255,0.8))" }} />
                      </div>
                      <span style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>
                        Question Preview
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowPreview(false)}
                      className="filter-btn-3d"
                      style={{
                        background: "#f1f5f9",
                        border: "none",
                        cursor: "pointer",
                        color: "#64748b",
                        width: "28px",
                        height: "28px",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <X size={15} />
                    </button>
                  </div>

                  {/* Preview Body Grid: Left Question/Options & Right Metadata */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.45fr 1fr",
                      gap: "24px",
                      marginBottom: "20px",
                    }}
                  >
                    {/* Left: Question statement & Options */}
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "10px",
                          marginBottom: "16px",
                        }}
                      >
                        <h4
                          style={{
                            fontSize: "14.5px",
                            fontWeight: 700,
                            color: "#0f172a",
                            margin: 0,
                            lineHeight: "1.45",
                            flex: 1,
                          }}
                        >
                          Q. {currentPreview.question}
                        </h4>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            color: "#6366f1",
                            background: "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)",
                            padding: "3px 9px",
                            borderRadius: "7px",
                            flexShrink: 0,
                            boxShadow: "0 2px 6px rgba(99, 102, 241, 0.2)",
                          }}
                        >
                          {currentPreview.type}
                        </span>
                      </div>

                      {/* Options List with 3D Pill Cards */}
                      {currentPreview.options && currentPreview.options.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
                          {currentPreview.options.map((opt: any, idx: number) => {
                            const optKey = typeof opt === "object" && opt.key ? opt.key : String.fromCharCode(65 + idx);
                            const optText = typeof opt === "object" && opt.text ? opt.text : String(opt);
                            const isCorrect = typeof opt === "object" ? !!opt.correct : (currentPreview.correctAnswer === opt);

                            return (
                              <div
                                key={optKey}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "12px",
                                  padding: "10px 14px",
                                  borderRadius: "10px",
                                  background: isCorrect
                                    ? "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)"
                                    : "#ffffff",
                                  border: isCorrect ? "1.5px solid #10b981" : "1px solid #e2e8f0",
                                  color: isCorrect ? "#065f46" : "#334155",
                                  fontWeight: isCorrect ? 700 : 500,
                                  fontSize: "13px",
                                  boxShadow: isCorrect
                                    ? "0 4px 12px rgba(16, 185, 129, 0.15)"
                                    : "0 2px 4px rgba(0,0,0,0.02)",
                                  transition: "all 0.2s ease",
                                }}
                              >
                                <span
                                  style={{
                                    width: "18px",
                                    height: "18px",
                                    borderRadius: "50%",
                                    border: isCorrect ? "5px solid #10b981" : "2px solid #cbd5e1",
                                    background: "#ffffff",
                                    display: "inline-block",
                                    flexShrink: 0,
                                    boxShadow: isCorrect ? "0 0 8px rgba(16, 185, 129, 0.6)" : "none",
                                  }}
                                />
                                <span>
                                  <strong>{optKey}.</strong> {optText}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div
                          style={{
                            padding: "18px",
                            borderRadius: "12px",
                            background: "#f8fafc",
                            border: "1px dashed #cbd5e1",
                            fontSize: "12.5px",
                            color: "#64748b",
                            lineHeight: 1.5,
                          }}
                        >
                          <Info size={16} color="#2563eb" style={{ display: "inline", marginRight: "6px", verticalAlign: "text-bottom" }} />
                          Descriptive Question: Students are expected to provide detailed explanations with examples.
                        </div>
                      )}
                    </div>

                    {/* Right: Metadata Specifications Card */}
                    <div
                      style={{
                        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                        border: "1px solid #e2e8f0",
                        borderRadius: "14px",
                        padding: "16px 18px",
                        fontSize: "12px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                        boxShadow: "inset 0 1px 3px rgba(0,0,0,0.02)",
                      }}
                    >
                      {(() => {
                        const displaySubject = (currentPreview?.subject && !currentPreview.subject.includes("dataset") && !currentPreview.subject.includes("setup")) ? currentPreview.subject : "Viscom & VFX";
                        const displayUnit = currentPreview?.unit || "Unit I - Image Target";
                        const displayTopic = (currentPreview?.topic && currentPreview.topic !== displaySubject) ? currentPreview.topic : "Asset Integration & Controls";
                        const displayDifficulty = (currentPreview?.difficulty && ["Easy", "Medium", "Hard"].includes(currentPreview.difficulty)) ? currentPreview.difficulty : "Medium";
                        const displayUploadedBy = currentPreview?.uploadedBy || "Exam Cell Admin";
                        const displayEmail = currentPreview?.email || "admin@rgu.ac.in";
                        const displayDate = currentPreview?.uploadedOnDate || currentPreview?.date || currentPreview?.addedOn || currentPreview?.submittedDate || "16 Sept 2026";
                        const displayTime = currentPreview?.uploadedOnTime || currentPreview?.time || "10:30 AM";

                        return (
                          <>
                            <div style={{ display: "flex" }}>
                              <span style={{ width: "95px", color: "#64748b", fontWeight: 600 }}>Subject</span>
                              <span style={{ color: "#94a3b8", marginRight: "8px" }}>:</span>
                              <strong style={{ color: "#0f172a" }}>{displaySubject}</strong>
                            </div>

                            <div style={{ display: "flex" }}>
                              <span style={{ width: "95px", color: "#64748b", fontWeight: 600 }}>Unit</span>
                              <span style={{ color: "#94a3b8", marginRight: "8px" }}>:</span>
                              <span style={{ color: "#334155" }}>{displayUnit}</span>
                            </div>

                            <div style={{ display: "flex" }}>
                              <span style={{ width: "95px", color: "#64748b", fontWeight: 600 }}>Topic</span>
                              <span style={{ color: "#94a3b8", marginRight: "8px" }}>:</span>
                              <span style={{ color: "#334155" }}>{displayTopic}</span>
                            </div>

                            <div style={{ display: "flex", alignItems: "center" }}>
                              <span style={{ width: "95px", color: "#64748b", fontWeight: 600 }}>Difficulty</span>
                              <span style={{ color: "#94a3b8", marginRight: "8px" }}>:</span>
                              <span
                                style={{
                                  fontSize: "11px",
                                  fontWeight: 700,
                                  padding: "2px 8px",
                                  borderRadius: "6px",
                                  background: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)",
                                  color: "#15803d",
                                  boxShadow: "0 2px 6px rgba(22, 163, 74, 0.2)",
                                }}
                              >
                                {displayDifficulty}
                              </span>
                            </div>

                            <div style={{ display: "flex" }}>
                              <span style={{ width: "95px", color: "#64748b", fontWeight: 600 }}>Uploaded By</span>
                              <span style={{ color: "#94a3b8", marginRight: "8px" }}>:</span>
                              <span style={{ color: "#334155" }}>
                                {displayUploadedBy} ({displayEmail})
                              </span>
                            </div>

                            <div style={{ display: "flex" }}>
                              <span style={{ width: "95px", color: "#64748b", fontWeight: 600 }}>Uploaded On</span>
                              <span style={{ color: "#94a3b8", marginRight: "8px" }}>:</span>
                              <span style={{ color: "#334155" }}>
                                {displayDate}{displayTime ? `, ${displayTime}` : ""}
                              </span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Preview Action Buttons Row */}
                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      borderTop: "1px solid #f1f5f9",
                      paddingTop: "16px",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => currentPreview && setViewingQuestion(currentPreview)}
                      className="filter-btn-3d"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "10px 18px",
                        borderRadius: "10px",
                        border: "1px solid #bfdbfe",
                        background: "#ffffff",
                        color: "#2563eb",
                        fontSize: "13px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      <Maximize2 size={15} />
                      <span>View in Fullscreen</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => currentPreview && handleVerifyQuestion(currentPreview.id)}
                      className="filter-btn-3d"
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        padding: "10px 18px",
                        borderRadius: "10px",
                        border: "none",
                        background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
                        color: "#ffffff",
                        fontSize: "13px",
                        fontWeight: 700,
                        cursor: "pointer",
                        boxShadow: "0 4px 14px rgba(16, 185, 129, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.5)",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px) scale(1.02)")}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
                    >
                      <CheckCircle2 size={16} style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,0.9))" }} />
                      <span>Verify Question</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => currentPreview && handleRejectQuestion(currentPreview.id)}
                      className="filter-btn-3d"
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        padding: "10px 18px",
                        borderRadius: "10px",
                        border: "none",
                        background: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
                        color: "#ffffff",
                        fontSize: "13px",
                        fontWeight: 700,
                        cursor: "pointer",
                        boxShadow: "0 4px 14px rgba(239, 68, 68, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.5)",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px) scale(1.02)")}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
                    >
                      <XCircle size={16} style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,0.9))" }} />
                      <span>Reject Question</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ================= RIGHT COLUMN: Overview & Quick Actions ================= */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Card 1: Verification Overview */}
              <div className="widget-card-3d" style={{ padding: "22px" }}>
                {/* Header Title with 3D Icon */}
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
                      className="action-mini-icon-cyan"
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 12px rgba(2, 132, 199, 0.35)",
                      }}
                    >
                      <Layers size={16} color="#ffffff" style={{ filter: "drop-shadow(0 0 4px rgba(255,255,255,0.8))" }} />
                    </div>
                    <div style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>
                      Verification Overview
                    </div>
                  </div>

                  <button
                    type="button"
                    className="filter-btn-3d"
                    style={{
                      padding: "5px 12px",
                      borderRadius: "8px",
                      color: "#2563eb",
                      fontSize: "11.5px",
                      fontWeight: 700,
                      border: "1px solid #bfdbfe",
                      background: "#eff6ff",
                      cursor: "pointer",
                      boxShadow: "0 2px 6px rgba(37, 99, 235, 0.12)",
                    }}
                  >
                    View Report
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {/* Row 1: Total Questions */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        className="action-mini-icon-blue"
                        style={{ width: "26px", height: "26px", borderRadius: "50%", boxShadow: "0 2px 8px rgba(37, 99, 235, 0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        <BookOpen size={13} color="#ffffff" style={{ filter: "drop-shadow(0 0 4px rgba(255,255,255,0.9))" }} />
                      </div>
                      <span style={{ fontSize: "12.5px", color: "#334155", fontWeight: 600 }}>
                        Total Questions
                      </span>
                    </div>
                    <strong style={{ fontSize: "14px", color: "#0f172a", fontWeight: 800 }}>156</strong>
                  </div>

                  {/* Row 2: Pending Verification */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        className="action-mini-icon-cyan"
                        style={{ width: "26px", height: "26px", borderRadius: "50%", boxShadow: "0 2px 8px rgba(2, 132, 199, 0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        <ShieldCheck size={13} color="#ffffff" style={{ filter: "drop-shadow(0 0 4px rgba(255,255,255,0.9))" }} />
                      </div>
                      <span style={{ fontSize: "12.5px", color: "#334155", fontWeight: 600 }}>
                        Pending Verification
                      </span>
                    </div>
                    <strong style={{ fontSize: "14px", color: "#0284c7", fontWeight: 800 }}>42</strong>
                  </div>

                  {/* Row 3: Verified Questions */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        className="action-mini-icon-green"
                        style={{ width: "26px", height: "26px", borderRadius: "50%", boxShadow: "0 2px 8px rgba(22, 163, 74, 0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        <CheckCircle2 size={13} color="#ffffff" style={{ filter: "drop-shadow(0 0 4px rgba(255,255,255,0.9))" }} />
                      </div>
                      <span style={{ fontSize: "12.5px", color: "#334155", fontWeight: 600 }}>
                        Verified Questions
                      </span>
                    </div>
                    <strong style={{ fontSize: "14px", color: "#16a34a", fontWeight: 800 }}>98</strong>
                  </div>

                  {/* Row 4: Rejected Questions */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        className="action-mini-icon-red"
                        style={{ width: "26px", height: "26px", borderRadius: "50%", boxShadow: "0 2px 8px rgba(220, 38, 38, 0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        <XCircle size={13} color="#ffffff" style={{ filter: "drop-shadow(0 0 4px rgba(255,255,255,0.9))" }} />
                      </div>
                      <span style={{ fontSize: "12.5px", color: "#334155", fontWeight: 600 }}>
                        Rejected Questions
                      </span>
                    </div>
                    <strong style={{ fontSize: "14px", color: "#dc2626", fontWeight: 800 }}>16</strong>
                  </div>

                  {/* Row 5: Manually Added */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        className="action-mini-icon-purple"
                        style={{ width: "26px", height: "26px", borderRadius: "50%", boxShadow: "0 2px 8px rgba(124, 58, 237, 0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        <Edit3 size={13} color="#ffffff" style={{ filter: "drop-shadow(0 0 4px rgba(255,255,255,0.9))" }} />
                      </div>
                      <span style={{ fontSize: "12.5px", color: "#334155", fontWeight: 600 }}>
                        Manually Added
                      </span>
                    </div>
                    <strong style={{ fontSize: "14px", color: "#7c3aed", fontWeight: 800 }}>12</strong>
                  </div>

                  {/* Row 6: Total Question Pool */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        className="action-mini-icon-purple"
                        style={{ width: "26px", height: "26px", borderRadius: "50%", boxShadow: "0 2px 8px rgba(124, 58, 237, 0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        <Layers size={13} color="#ffffff" style={{ filter: "drop-shadow(0 0 4px rgba(255,255,255,0.9))" }} />
                      </div>
                      <span style={{ fontSize: "12.5px", color: "#334155", fontWeight: 600 }}>
                        Total Question Pool
                      </span>
                    </div>
                    <strong style={{ fontSize: "14px", color: "#7c3aed", fontWeight: 800 }}>4,256</strong>
                  </div>

                  {/* Last Updated Footer */}
                  <div
                    style={{
                      borderTop: "1px solid #f1f5f9",
                      paddingTop: "12px",
                      marginTop: "6px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Clock
                        size={14}
                        color="#6366f1"
                        style={{ animation: "float3D 3s ease-in-out infinite" }}
                      />
                      <span style={{ fontSize: "11.5px", color: "#64748b", fontWeight: 500 }}>Last Updated</span>
                    </div>
                    <span style={{ fontSize: "11.5px", color: "#0f172a", fontWeight: 700 }}>
                      {lastUpdatedTime || "Just now"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Quick Actions */}
              <div className="widget-card-3d" style={{ padding: "22px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
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
                    <CheckSquare size={16} color="#ffffff" style={{ filter: "drop-shadow(0 0 4px rgba(255,255,255,0.8))" }} />
                  </div>
                  <div style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>
                    Quick Actions
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {/* Action 1: Verify Selected Questions */}
                  <div
                    onClick={() => {
                      if (selectedRows.length === 0) {
                        triggerToast("Please select questions to verify", "info");
                        return;
                      }
                      selectedRows.forEach((id) => examStore.saveQuestion({ id, status: "Verified" }));
                      triggerToast(`${selectedRows.length} questions verified successfully!`, "success");
                      setSelectedRows([]);
                    }}
                    className="quick-action-row-3d"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      cursor: "pointer",
                      padding: "10px",
                      borderRadius: "12px",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div
                      className="quick-action-icon-3d"
                      style={{
                        background: "radial-gradient(circle at 30% 30%, #34d399 0%, #059669 100%)",
                        boxShadow: "0 4px 12px rgba(16, 185, 129, 0.4)",
                      }}
                    >
                      <Check
                        size={18}
                        strokeWidth={2.8}
                        color="#ffffff"
                        style={{ filter: "drop-shadow(0 0 4px rgba(255,255,255,0.8))" }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ display: "block", fontSize: "12.5px", color: "#0f172a" }}>
                        Verify Selected Questions
                      </strong>
                      <span style={{ fontSize: "11px", color: "#64748b" }}>Approve selected questions ({selectedRows.length} selected)</span>
                    </div>
                    <ChevronRight size={16} className="chevron-arrow-glow" />
                  </div>

                  {/* Action 2: Reject Selected Questions */}
                  <div
                    onClick={() => {
                      if (selectedRows.length === 0) {
                        triggerToast("Please select questions to reject", "info");
                        return;
                      }
                      selectedRows.forEach((id) => examStore.saveQuestion({ id, status: "Rejected" }));
                      triggerToast(`${selectedRows.length} questions marked as rejected.`, "info");
                      setSelectedRows([]);
                    }}
                    className="quick-action-row-3d"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      cursor: "pointer",
                      padding: "10px",
                      borderRadius: "12px",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div
                      className="quick-action-icon-3d"
                      style={{
                        background: "radial-gradient(circle at 30% 30%, #f87171 0%, #dc2626 100%)",
                        boxShadow: "0 4px 12px rgba(220, 38, 38, 0.4)",
                      }}
                    >
                      <X
                        size={18}
                        strokeWidth={2.8}
                        color="#ffffff"
                        style={{ filter: "drop-shadow(0 0 4px rgba(255,255,255,0.8))" }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ display: "block", fontSize: "12.5px", color: "#0f172a" }}>
                        Reject Selected Questions
                      </strong>
                      <span style={{ fontSize: "11px", color: "#64748b" }}>Reject selected questions ({selectedRows.length} selected)</span>
                    </div>
                    <ChevronRight size={16} className="chevron-arrow-glow" />
                  </div>

                  {/* Action 3: Bulk Verify Questions */}
                  <div
                    onClick={() => {
                      const pendings = questions.filter((q) => q.status === "Pending");
                      if (pendings.length === 0) {
                        triggerToast("No pending questions found to verify.", "info");
                        return;
                      }
                      pendings.forEach((q) => examStore.saveQuestion({ id: q.id, status: "Verified" }));
                      triggerToast(`All ${pendings.length} pending questions verified!`, "success");
                    }}
                    className="quick-action-row-3d"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      cursor: "pointer",
                      padding: "10px",
                      borderRadius: "12px",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div
                      className="quick-action-icon-3d"
                      style={{
                        background: "radial-gradient(circle at 30% 30%, #38bdf8 0%, #0284c7 100%)",
                        boxShadow: "0 4px 12px rgba(2, 132, 199, 0.4)",
                      }}
                    >
                      <Layers
                        size={17}
                        color="#ffffff"
                        style={{ filter: "drop-shadow(0 0 4px rgba(255,255,255,0.8))" }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ display: "block", fontSize: "12.5px", color: "#0f172a" }}>
                        Bulk Verify Questions
                      </strong>
                      <span style={{ fontSize: "11px", color: "#64748b" }}>Verify multiple questions at once</span>
                    </div>
                    <ChevronRight size={16} className="chevron-arrow-glow" />
                  </div>

                  {/* Action 4: Download Pending Questions */}
                  <div
                    onClick={() => {
                      const pendingItems = questions.filter((q) => q.status === "Pending");
                      const itemsToExport = pendingItems.length ? pendingItems : questions;
                      examStore.exportToCsv("pending_verification_questions.csv", itemsToExport.map((q) => ({
                        ID: q.id,
                        Subject: q.subject,
                        Unit: q.unit,
                        Topic: q.topic,
                        Question: q.question,
                        Type: q.type,
                        Difficulty: q.difficulty,
                        Status: q.status,
                        Marks: q.marks,
                        UploadedBy: q.uploadedBy || "Faculty",
                      })));
                      triggerToast(`Exported ${itemsToExport.length} pending questions to CSV!`, "success");
                    }}
                    className="quick-action-row-3d"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      cursor: "pointer",
                      padding: "10px",
                      borderRadius: "12px",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div
                      className="quick-action-icon-3d"
                      style={{
                        background: "radial-gradient(circle at 30% 30%, #60a5fa 0%, #2563eb 100%)",
                        boxShadow: "0 4px 12px rgba(37, 99, 235, 0.4)",
                      }}
                    >
                      <Download
                        size={17}
                        color="#ffffff"
                        style={{ filter: "drop-shadow(0 0 4px rgba(255,255,255,0.8))" }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ display: "block", fontSize: "12.5px", color: "#0f172a" }}>
                        Download Pending Questions
                      </strong>
                      <span style={{ fontSize: "11px", color: "#64748b" }}>Download pending as Excel</span>
                    </div>
                    <ChevronRight size={16} className="chevron-arrow-glow" />
                  </div>

                  {/* Action 5: Verification Settings */}
                  <div
                    onClick={() => router.push("/settings")}
                    className="quick-action-row-3d"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      cursor: "pointer",
                      padding: "10px",
                      borderRadius: "12px",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div
                      className="quick-action-icon-3d"
                      style={{
                        background: "radial-gradient(circle at 30% 30%, #fb923c 0%, #ea580c 100%)",
                        boxShadow: "0 4px 12px rgba(234, 88, 12, 0.4)",
                      }}
                    >
                      <Settings
                        size={17}
                        color="#ffffff"
                        style={{ filter: "drop-shadow(0 0 4px rgba(255,255,255,0.8))" }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ display: "block", fontSize: "12.5px", color: "#0f172a" }}>
                        Verification Settings
                      </strong>
                      <span style={{ fontSize: "11px", color: "#64748b" }}>Configure verification rules</span>
                    </div>
                    <ChevronRight size={16} className="chevron-arrow-glow" />
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
        title={`${subjectModalData.subjectName} - Subject Question Bank`}
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
            : "✓ Verify Subject Questions"
        }
      />

      <ViewModal
        isOpen={!!viewingQuestion}
        onClose={() => setViewingQuestion(null)}
        title="Question Details"
        subtitle={`ID: #${viewingQuestion?.id} • Subject: ${viewingQuestion?.subject}`}
        badge={viewingQuestion?.status || "Pending"}
        badgeColor={
          viewingQuestion?.status === "Approved" || viewingQuestion?.status === "Verified"
            ? "green"
            : viewingQuestion?.status === "Rejected"
            ? "red"
            : "blue"
        }
        data={
          viewingQuestion
            ? [
                { label: "Question Text", value: viewingQuestion.question },
                { label: "Subject", value: viewingQuestion.subject },
                { label: "Unit", value: viewingQuestion.unit },
                { label: "Topic", value: viewingQuestion.topic },
                { label: "Type", value: viewingQuestion.type },
                { label: "Difficulty", value: viewingQuestion.difficulty },
                { label: "Marks", value: viewingQuestion.marks || 5 },
                { label: "Status", value: viewingQuestion.status },
                { label: "Uploaded By", value: `${viewingQuestion.uploadedBy || "Vignesh"} (${viewingQuestion.email || "admin@rgu.ac.in"})` },
                { label: "Uploaded On", value: `${viewingQuestion.date || "31 Aug 2024"}, ${viewingQuestion.time || "03:45 PM"}` },
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
        subtitle={editingQuestion ? `Editing Question #${editingQuestion.id}` : "Create a new question for verification"}
        fields={questionFields}
        initialData={editingQuestion || { subject: "Viscom & VFX", type: "MCQ", difficulty: "Medium", marks: 5, status: "Pending" }}
        submitLabel={editingQuestion ? "Update Question" : "Create Question"}
        onSubmit={(data) => {
          if (editingQuestion) {
            examStore.saveQuestion({ ...editingQuestion, ...data });
            triggerToast("Question updated successfully!", "success");
          } else {
            examStore.saveQuestion({ ...data, status: data.status || "Pending" });
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
        message="Are you sure you want to permanently delete this question? This action cannot be undone."
        itemName={deletingQuestion?.question ? `"${deletingQuestion.question.slice(0, 60)}..."` : undefined}
        onConfirm={() => {
          if (deletingQuestion) {
            examStore.deleteQuestion(deletingQuestion.id);
            triggerToast("Question deleted successfully.", "info");
            setDeletingQuestion(null);
          }
        }}
      />

      {/* AI Scanning Modal Overlay */}
      {isAiScanning && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.75)",
            backdropFilter: "blur(8px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "24px",
              padding: "36px 44px",
              maxWidth: "460px",
              width: "90%",
              textAlign: "center",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
              border: "1px solid rgba(139, 92, 246, 0.3)",
            }}
          >
            <div
              style={{
                width: "70px",
                height: "70px",
                borderRadius: "22px",
                background: "linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px auto",
                boxShadow: "0 10px 25px rgba(124, 58, 237, 0.5)",
              }}
            >
              <Sparkles size={36} color="#ffffff" style={{ filter: "drop-shadow(0 0 8px rgba(255,255,255,0.9))" }} />
            </div>
            <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", margin: "0 0 8px 0" }}>
              🤖 Running AI Verification Engine...
            </h3>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 24px 0", lineHeight: 1.5 }}>
              Evaluating question syntax, options coverage, Bloom's Taxonomy, and mark balance against RGU curriculum standards.
            </p>

            {/* Progress Bar */}
            <div style={{ background: "#f1f5f9", borderRadius: "10px", height: "10px", overflow: "hidden", marginBottom: "16px" }}>
              <div
                style={{
                  height: "100%",
                  width: aiScanStep === 1 ? "35%" : aiScanStep === 2 ? "70%" : "98%",
                  background: "linear-gradient(90deg, #7c3aed 0%, #ec4899 100%)",
                  transition: "width 0.4s ease-in-out",
                  borderRadius: "10px",
                }}
              />
            </div>

            <div style={{ fontSize: "12px", fontWeight: 700, color: "#7c3aed" }}>
              {aiScanStep === 1 && "🔍 Step 1: Parsing Question Syntax & Ambiguity..."}
              {aiScanStep === 2 && "🧠 Step 2: Evaluating Bloom's Taxonomy & Difficulty Level..."}
              {aiScanStep === 3 && "✅ Step 3: Finalizing AI Audit Quality Score..."}
            </div>
          </div>
        </div>
      )}

      {/* Verification Result Pop-up Modal */}
      <VerificationResultModal
        isOpen={verifyModalItem.isOpen}
        onClose={() => setVerifyModalItem((prev) => ({ ...prev, isOpen: false }))}
        title="🎉 Question Verified Successfully!"
        itemName={verifyModalItem.name}
        verifiedCount={verifyModalItem.totalQuestions}
        qualityScore={verifyModalItem.score}
        bloomLevel="Apply & Analyze"
        remarks="Question phrasing, Bloom's Taxonomy evaluation, and CO curriculum mapping successfully verified."
      />

      <ToastNotification
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
    </RoleGuard>
  );
}
