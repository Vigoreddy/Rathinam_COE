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
  Printer,
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
  MoreVertical,
  Eye,
  Trash2,
  Plus,
  FileUp,
  FileSpreadsheet,
  AlertCircle,
  Database,
  Download,
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
  FormFieldDef,
  CrudActionButtons,
} from "../components/CrudModal";
import PortalFooter from "../components/PortalFooter";
import PortalHeader from "../components/PortalHeader";
import Pagination from "../components/Pagination";

export default function QuestionBankPage() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState("question-bank");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedUnit, setSelectedUnit] = useState("all");
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<(number | string)[]>([]);
  const [viewMode, setViewMode] = useState<"table" | "cards">("cards");

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
    { id: "question-bank", label: "Question Bank", icon: CheckSquare, hasArrow: true, route: "/question-bank" },
    { id: "bulk-upload", label: "Bulk Upload", icon: Upload, route: "/bulk-upload" },
    { id: "verify-questions", label: "Verify Questions", icon: Search, route: "/verify-questions" },
    { id: "approval", label: "Approval", icon: CheckSquare, route: "/approval" },
    { id: "reports", label: "Reports", icon: BarChart2, route: "/reports" },
    { id: "notifications", label: "Notifications", icon: Bell, route: "/notifications" },
    { id: "manual-questions", label: "Manual Questions", icon: Edit3, badge: "New", route: "/manual-questions" },
    { id: "print-paper", label: "Print Question Paper", icon: Printer, badge: "Print", route: "/print-paper" },
    { id: "settings", label: "Settings", icon: Settings, route: "/settings" },
  ];

  const menuItems = rawMenuItems.filter((item) =>
    hasPermission(currentUser.role, item.route, currentUser.isSubjectFaculty)
  );

  // Store state & Modals
  const [questionsList, setQuestionsList] = useState<QuestionItem[]>(() => examStore.getQuestions());
  const [viewQuestion, setViewQuestion] = useState<QuestionItem | null>(null);
  const [editQuestion, setEditQuestion] = useState<QuestionItem | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteQuestion, setDeleteQuestion] = useState<QuestionItem | null>(null);
  const [toast, setToast] = useState<{ message: string; isOpen: boolean; type?: "success" | "danger" }>({
    message: "",
    isOpen: false,
  });

  const showToast = (message: string, type: "success" | "danger" = "success") => {
    setToast({ message, isOpen: true, type });
    setTimeout(() => setToast((prev) => ({ ...prev, isOpen: false })), 3000);
  };

  useEffect(() => {
    const loadQuestions = () => {
      setQuestionsList(examStore.getQuestions());
    };
    loadQuestions();
    window.addEventListener("exam-cell-store-update", loadQuestions);
    return () => window.removeEventListener("exam-cell-store-update", loadQuestions);
  }, []);

  const handleCreateQuestion = (values: Record<string, any>) => {
    examStore.saveQuestion({
      question: values.question,
      subject: values.subject || "Viscom & VFX",
      unit: values.unit || "Unit I - Introduction",
      topic: values.topic || "Topic 1 - Basics",
      type: values.type || "Descriptive",
      difficulty: values.difficulty || "Medium",
      marks: Number(values.marks || 5),
      status: values.status || "Approved",
    });
    showToast("New question added to Question Bank!");
  };

  const handleUpdateQuestion = (values: Record<string, any>) => {
    if (!editQuestion) return;
    examStore.saveQuestion({
      id: editQuestion.id,
      question: values.question,
      subject: values.subject || editQuestion.subject,
      unit: values.unit || editQuestion.unit,
      topic: values.topic || editQuestion.topic,
      type: values.type || editQuestion.type,
      difficulty: values.difficulty || editQuestion.difficulty,
      marks: Number(values.marks || editQuestion.marks),
      status: values.status || editQuestion.status,
    });
    showToast("Question updated successfully!");
  };

  const handleDeleteQuestion = () => {
    if (!deleteQuestion) return;
    examStore.deleteQuestion(deleteQuestion.id);
    showToast("Question removed from bank.", "danger");
  };

  const questionFormFields: FormFieldDef[] = [
    { key: "question", label: "Question Text", type: "textarea", placeholder: "Enter complete question statement...", required: true, spanFull: true },
    {
      key: "subject",
      label: "Subject",
      type: "select",
      options: [
        { value: "Viscom & VFX", label: "Viscom & VFX" },
        { value: "Viscom", label: "Viscom" },
      ],
      required: true,
    },
    { key: "unit", label: "Unit", placeholder: "e.g. Unit I - Color Theory", required: true },
    { key: "topic", label: "Topic", placeholder: "e.g. Topic 1 - Color Basics" },
    {
      key: "type",
      label: "Question Type",
      type: "select",
      options: [
        { value: "MCQ", label: "MCQ" },
        { value: "Descriptive", label: "Descriptive" },
        { value: "Match Type", label: "Match Type" },
        { value: "Short Answer", label: "Short Answer" },
      ],
    },
    {
      key: "difficulty",
      label: "Difficulty Level",
      type: "select",
      options: [
        { value: "Easy", label: "Easy" },
        { value: "Medium", label: "Medium" },
        { value: "Hard", label: "Hard" },
      ],
    },
    { key: "marks", label: "Marks", type: "number", placeholder: "2" },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "Approved", label: "Approved" },
        { value: "Verified", label: "Verified" },
        { value: "Pending", label: "Pending" },
      ],
    },
  ];

  const filteredQuestions = questionsList.filter((q) => {
    const matchesSearch =
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.unit.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.subject.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSubject =
      selectedSubject === "all"
        ? true
        : selectedSubject === "vfx"
        ? q.subject.includes("VFX")
        : selectedSubject === "viscom"
        ? q.subject === "Viscom"
        : q.subject.toLowerCase().includes(selectedSubject.toLowerCase());

    const matchesUnit =
      selectedUnit === "all"
        ? true
        : q.unit.toLowerCase().includes(selectedUnit.toLowerCase()) ||
          (selectedUnit === "u1" && q.unit.includes("Unit I")) ||
          (selectedUnit === "u2" && q.unit.includes("Unit II")) ||
          (selectedUnit === "u3" && q.unit.includes("Unit III")) ||
          (selectedUnit === "u4" && q.unit.includes("Unit IV")) ||
          (selectedUnit === "u5" && q.unit.includes("Unit V"));

    const matchesTopic =
      selectedTopic === "all"
        ? true
        : q.topic.toLowerCase().includes(selectedTopic.toLowerCase());

    const matchesType =
      selectedType === "all"
        ? true
        : q.type.toLowerCase().includes(selectedType.toLowerCase());

    const matchesDiff =
      selectedDifficulty === "all"
        ? true
        : q.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();

    return matchesSearch && matchesSubject && matchesUnit && matchesTopic && matchesType && matchesDiff;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedSubject, selectedUnit, selectedTopic, selectedType, selectedDifficulty]);

  const itemsPerPage = 6;
  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedQuestions = filteredQuestions.slice(startIndex, startIndex + itemsPerPage);

  const totalQuestionsCount = questionsList.length;
  const totalVerifiedCount = questionsList.filter((q) => q.status === "Verified" || q.status === "Approved").length;
  const totalApprovedCount = questionsList.filter((q) => q.status === "Approved").length;
  const totalPendingCount = questionsList.filter((q) => q.status === "Pending").length;
  const totalRejectedCount = questionsList.filter((q) => q.status === "Rejected").length;

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

  const handleBulkDelete = () => {
    if (selectedRows.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedRows.length} selected question(s)?`)) {
      examStore.bulkDeleteQuestions(selectedRows.map(Number));
      setSelectedRows([]);
      showToast(`${selectedRows.length} question(s) deleted successfully.`, "danger");
    }
  };

  const handleBulkApprove = () => {
    if (selectedRows.length === 0) return;
    examStore.bulkUpdateQuestions(selectedRows.map(Number), "Approved");
    setSelectedRows([]);
    showToast(`${selectedRows.length} question(s) marked as Approved!`);
  };

  const handleBulkVerify = () => {
    if (selectedRows.length === 0) return;
    examStore.bulkUpdateQuestions(selectedRows.map(Number), "Verified");
    setSelectedRows([]);
    showToast(`${selectedRows.length} question(s) marked as Verified!`);
  };

  const handleExportQuestions = () => {
    const dataToExport = filteredQuestions.length > 0 ? filteredQuestions : questionsList;
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
      AddedOn: q.addedOn,
    }));
    examStore.exportToCsv("question_bank_export.csv", rows);
    showToast(`Exported ${rows.length} questions to CSV successfully!`);
  };

  const handleReset = () => {
    setSelectedSubject("all");
    setSelectedUnit("all");
    setSelectedTopic("all");
    setSelectedType("all");
    setSelectedDifficulty("all");
    setSearchQuery("");
  };

  return (
    <RoleGuard route="/question-bank">
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
      <style>{`
        @media (max-width: 1200px) {
          .qb-stat-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }
        @media (max-width: 1100px) {
          .qb-main-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 768px) {
          .qb-stat-grid {
            grid-template-columns: 1fr !important;
          }
          .qb-filter-row-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }
      `}</style>
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
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#ffffff",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.18)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
              e.currentTarget.style.transform = "translateY(0)";
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
        <PortalHeader activeRoute="question-bank" />


        {/* Scrollable Main Content */}
        <main
          style={{
            flex: 1,
            padding: "24px 28px",
            overflowY: "auto",
            overflowX: "hidden",
            minWidth: 0,
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          {/* Header & University Badge */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "22px",
              gap: "16px",
              flexWrap: "wrap",
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
                  gap: "8px",
                }}
              >
                Question Bank 🗄️
              </h1>
              <p style={{ fontSize: "13.5px", color: "#64748b", margin: 0 }}>
                Manage and view all questions in your question bank.
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

          {/* ================= Top 4 Metric Cards ================= */}
          <div
            className="qb-stat-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            {/* Metric 1: Total Questions - 3D Blue with Floating Glow Book */}
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
                {totalQuestionsCount}
              </div>
              <div style={{ fontSize: "11.5px", opacity: 0.85 }}>Across All Subjects</div>
            </div>

            {/* Metric 2: Verified Questions - 3D Cyan with Floating Glow ShieldCheck */}
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
                Verified Questions
              </div>
              <div style={{ fontSize: "32px", fontWeight: 800, lineHeight: 1, marginBottom: "6px", textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
                {totalVerifiedCount}
              </div>
              <div style={{ fontSize: "11.5px", opacity: 0.85 }}>
                ({totalQuestionsCount > 0 ? ((totalVerifiedCount / totalQuestionsCount) * 100).toFixed(1) : "0"}%)
              </div>
            </div>

            {/* Metric 3: Approved Questions - 3D Emerald with Floating Glow CheckCircle */}
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
                Approved Questions
              </div>
              <div style={{ fontSize: "32px", fontWeight: 800, lineHeight: 1, marginBottom: "6px", textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
                {totalApprovedCount}
              </div>
              <div style={{ fontSize: "11.5px", opacity: 0.85 }}>
                ({totalQuestionsCount > 0 ? ((totalApprovedCount / totalQuestionsCount) * 100).toFixed(1) : "0"}%)
              </div>
            </div>

            {/* Metric 4: Pending Approval - 3D Orange with Floating Glow Clock */}
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
                  <Clock
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
                Pending Approval
              </div>
              <div style={{ fontSize: "32px", fontWeight: 800, lineHeight: 1, marginBottom: "6px", textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
                {totalPendingCount}
              </div>
              <div style={{ fontSize: "11.5px", opacity: 0.85 }}>
                ({totalQuestionsCount > 0 ? ((totalPendingCount / totalQuestionsCount) * 100).toFixed(1) : "0"}%)
              </div>
            </div>
          </div>

          {/* ================= Main Content Grid ================= */}
          <div
            className="qb-main-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) 290px",
              gap: "20px",
              alignItems: "start",
            }}
          >
            {/* ================= LEFT WIDE COLUMN: All Questions ================= */}
            <div className="widget-card-3d" style={{ padding: "22px", minWidth: 0, maxWidth: "100%", overflow: "hidden" }}>
              {/* Header Title */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "18px",
                  gap: "12px",
                  flexWrap: "wrap",
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
                      boxShadow: "0 6px 16px rgba(79, 70, 229, 0.35)",
                    }}
                  >
                    <Database size={18} color="#ffffff" />
                  </div>
                  <div>
                    <div style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.01em" }}>
                      All Questions
                    </div>
                    <div style={{ fontSize: "11.5px", color: "#64748b" }}>
                      Browse, filter, and manage questions across all curriculum topics
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={handleExportQuestions}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "7px 14px",
                      borderRadius: "10px",
                      border: "1px solid #cbd5e1",
                      background: "#ffffff",
                      color: "#334155",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      boxShadow: "0 2px 6px rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    <Download size={14} color="#6366f1" />
                    <span>Export CSV</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsAddOpen(true)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "7px 14px",
                      borderRadius: "10px",
                      border: "none",
                      background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
                      color: "#ffffff",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(79, 70, 229, 0.35)",
                    }}
                  >
                    <Plus size={14} />
                    <span>Add Question</span>
                  </button>
                  <span
                    style={{
                      fontSize: "11.5px",
                      fontWeight: 700,
                      color: "#4f46e5",
                      background: "#ede9fe",
                      padding: "4px 12px",
                      borderRadius: "100px",
                    }}
                  >
                    {questionsList.length} Questions
                  </span>
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
                    background: "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)",
                    borderRadius: "12px",
                    border: "1px solid #c7d2fe",
                    marginBottom: "16px",
                  }}
                >
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#3730a3" }}>
                    {selectedRows.length} question(s) selected
                  </span>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      type="button"
                      onClick={handleBulkVerify}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "8px",
                        background: "#2563eb",
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

              {/* Filter Row 1: Search, Filter Button, Sort Dropdown */}
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                  marginBottom: "16px",
                  flexWrap: "wrap",
                }}
              >
                {/* Search Box with 3D Focus */}
                <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
                  <input
                    type="text"
                    placeholder="Search questions by keyword or topic..."
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
                      transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#6366f1";
                      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.15)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "#e2e8f0";
                      e.currentTarget.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.02)";
                    }}
                  />
                  <Search
                    size={16}
                    color="#6366f1"
                    style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)" }}
                  />
                </div>

                {/* Filter Button 3D */}
                <button
                  type="button"
                  className="filter-btn-3d"
                  style={{ flexShrink: 0 }}
                >
                  <span>Filter</span>
                  <SlidersHorizontal size={14} color="#6366f1" />
                </button>

                {/* Sort By Dropdown */}
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <select
                    style={{
                      padding: "9px 34px 9px 14px",
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0",
                      background: "#ffffff",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#475569",
                      cursor: "pointer",
                      appearance: "none",
                      outline: "none",
                      boxShadow: "0 2px 6px rgba(0, 0, 0, 0.02)",
                      transition: "all 0.2s ease",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#6366f1";
                      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.15)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "#e2e8f0";
                      e.currentTarget.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.02)";
                    }}
                  >
                    <option>Sort by: Newest</option>
                    <option>Sort by: Oldest</option>
                    <option>Sort by: Difficulty</option>
                  </select>
                  <ChevronDown
                    size={14}
                    color="#64748b"
                    style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                  />
                </div>

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

              {/* Filter Row 2: Secondary Filters (Subject, Unit, Topic, Type, Difficulty, Reset) */}
              <div
                className="qb-filter-row-2"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.2fr 1fr 1fr 1fr 1fr auto",
                  gap: "8px",
                  alignItems: "flex-end",
                  marginBottom: "18px",
                  paddingBottom: "16px",
                  borderBottom: "1px solid #f1f5f9",
                  minWidth: 0,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#64748b", marginBottom: "5px" }}>
                    Subject
                  </label>
                  <div style={{ position: "relative" }}>
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 24px 8px 8px",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        background: "#ffffff",
                        fontSize: "12px",
                        color: "#334155",
                        appearance: "none",
                        outline: "none",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        transition: "all 0.2s ease",
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "#6366f1")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
                    >
                      <option value="all">All Subjects</option>
                      <option value="vfx">Viscom & VFX</option>
                      <option value="viscom">Viscom</option>
                    </select>
                    <ChevronDown size={13} color="#94a3b8" style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  </div>
                </div>

                <div style={{ minWidth: 0 }}>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#64748b", marginBottom: "5px" }}>
                    Unit
                  </label>
                  <div style={{ position: "relative" }}>
                    <select
                      value={selectedUnit}
                      onChange={(e) => setSelectedUnit(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 24px 8px 8px",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        background: "#ffffff",
                        fontSize: "12px",
                        color: "#334155",
                        appearance: "none",
                        outline: "none",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        transition: "all 0.2s ease",
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "#6366f1")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
                    >
                      <option value="all">All Units</option>
                      <option value="u1">Unit I</option>
                      <option value="u2">Unit II</option>
                      <option value="u3">Unit III</option>
                      <option value="u4">Unit IV</option>
                      <option value="u5">Unit V</option>
                    </select>
                    <ChevronDown size={13} color="#94a3b8" style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  </div>
                </div>

                <div style={{ minWidth: 0 }}>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#64748b", marginBottom: "5px" }}>
                    Topic
                  </label>
                  <div style={{ position: "relative" }}>
                    <select
                      value={selectedTopic}
                      onChange={(e) => setSelectedTopic(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 24px 8px 8px",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        background: "#ffffff",
                        fontSize: "12px",
                        color: "#334155",
                        appearance: "none",
                        outline: "none",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        transition: "all 0.2s ease",
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "#6366f1")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
                    >
                      <option value="all">All Topics</option>
                      <option value="t1">Color Basics</option>
                      <option value="t2">Color Models</option>
                      <option value="t3">Composition</option>
                    </select>
                    <ChevronDown size={13} color="#94a3b8" style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  </div>
                </div>

                <div style={{ minWidth: 0 }}>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#64748b", marginBottom: "5px" }}>
                    Question Type
                  </label>
                  <div style={{ position: "relative" }}>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 24px 8px 8px",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        background: "#ffffff",
                        fontSize: "12px",
                        color: "#334155",
                        appearance: "none",
                        outline: "none",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        transition: "all 0.2s ease",
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "#6366f1")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
                    >
                      <option value="all">All Types</option>
                      <option value="mcq">MCQ</option>
                      <option value="descriptive">Descriptive</option>
                      <option value="match">Match Type</option>
                    </select>
                    <ChevronDown size={13} color="#94a3b8" style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  </div>
                </div>

                <div style={{ minWidth: 0 }}>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#64748b", marginBottom: "5px" }}>
                    Difficulty
                  </label>
                  <div style={{ position: "relative" }}>
                    <select
                      value={selectedDifficulty}
                      onChange={(e) => setSelectedDifficulty(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 24px 8px 8px",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        background: "#ffffff",
                        fontSize: "12px",
                        color: "#334155",
                        appearance: "none",
                        outline: "none",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        transition: "all 0.2s ease",
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "#6366f1")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
                    >
                      <option value="all">All Levels</option>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                    <ChevronDown size={13} color="#94a3b8" style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  </div>
                </div>

                <div style={{ flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="filter-btn-3d"
                    style={{
                      padding: "8px 14px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#475569",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Questions Table or Cards View */}
              {viewMode === "table" ? (
                <div
                  className="no-scrollbar"
                  style={{
                    overflowX: "auto",
                    width: "100%",
                    maxWidth: "100%",
                    borderRadius: "10px",
                    WebkitOverflowScrolling: "touch",
                  }}
                >
                  <table style={{ width: "100%", minWidth: "680px", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                        <th style={{ padding: "12px 8px", width: "32px" }}>
                          <input
                            type="checkbox"
                            checked={selectedRows.length === questionsList.length}
                            onChange={toggleSelectAll}
                            style={{ cursor: "pointer", accentColor: "#4f46e5" }}
                          />
                        </th>
                        <th style={{ padding: "12px 10px", fontSize: "11.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                          Question
                        </th>
                        <th style={{ padding: "12px 10px", fontSize: "11.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                          Subject / Unit / Topic
                        </th>
                        <th style={{ padding: "12px 8px", fontSize: "11.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                          Type
                        </th>
                        <th style={{ padding: "12px 8px", fontSize: "11.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                          Difficulty
                        </th>
                        <th style={{ padding: "12px 8px", fontSize: "11.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                          Status
                        </th>
                        <th style={{ padding: "12px 8px", fontSize: "11.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                          Added On
                        </th>
                        <th style={{ padding: "12px 8px", width: "28px" }} />
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
                              background: isChecked ? "rgba(99, 102, 241, 0.05)" : "transparent",
                              cursor: "pointer",
                            }}
                          >
                            <td style={{ padding: "14px 8px", verticalAlign: "top" }}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleRow(q.id)}
                                style={{ cursor: "pointer", marginTop: "3px", accentColor: "#4f46e5" }}
                              />
                            </td>

                            <td style={{ padding: "14px 10px", verticalAlign: "top", maxWidth: "250px", minWidth: "150px" }}>
                              <span
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
                              >
                                {q.question}
                              </span>
                              <div style={{ display: "flex", gap: "6px", marginTop: "5px", alignItems: "center" }}>
                                <span style={{ fontSize: "10.5px", color: "#64748b", fontWeight: 600 }}>
                                  #{q.id}
                                </span>
                                {q.marks !== undefined && (
                                  <span style={{ fontSize: "10.5px", color: "#6366f1", fontWeight: 600 }}>
                                    • {q.marks} Marks
                                  </span>
                                )}
                              </div>
                            </td>

                            <td style={{ padding: "14px 10px", verticalAlign: "top" }}>
                              <span style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "#1e293b" }}>
                                {q.subject}
                              </span>
                              <span style={{ display: "block", fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                                {q.unit}
                              </span>
                              <span style={{ display: "block", fontSize: "10.5px", color: "#94a3b8" }}>
                                {q.topic}
                              </span>
                            </td>

                            <td style={{ padding: "14px 8px", verticalAlign: "top" }}>
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

                            <td style={{ padding: "14px 8px", verticalAlign: "top" }}>
                              <span
                                style={{
                                  display: "inline-block",
                                  fontSize: "11px",
                                  fontWeight: 700,
                                  padding: "4px 10px",
                                  borderRadius: "8px",
                                  background:
                                    q.difficulty === "Easy"
                                      ? "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)"
                                      : "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                                  color:
                                    q.difficulty === "Easy"
                                      ? "#15803d"
                                      : "#b45309",
                                  border:
                                    q.difficulty === "Easy"
                                      ? "1px solid rgba(134, 239, 172, 0.5)"
                                      : "1px solid rgba(252, 211, 77, 0.5)",
                                  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.04)",
                                }}
                              >
                                {q.difficulty}
                              </span>
                            </td>

                            <td style={{ padding: "14px 8px", verticalAlign: "top" }}>
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "5px",
                                  fontSize: "11px",
                                  fontWeight: 700,
                                  padding: "4px 10px",
                                  borderRadius: "8px",
                                  background:
                                    q.status === "Approved"
                                      ? "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)"
                                      : q.status === "Verified"
                                      ? "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)"
                                      : "linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)",
                                  color:
                                    q.status === "Approved"
                                      ? "#166534"
                                      : q.status === "Verified"
                                      ? "#1e40af"
                                      : "#9a3412",
                                  border:
                                    q.status === "Approved"
                                      ? "1px solid #86efac"
                                      : q.status === "Verified"
                                      ? "1px solid #93c5fd"
                                      : "1px solid #fdba74",
                                  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.04)",
                                }}
                              >
                                <span
                                  style={{
                                    width: "6px",
                                    height: "6px",
                                    borderRadius: "50%",
                                    background:
                                      q.status === "Approved"
                                        ? "#16a34a"
                                        : q.status === "Verified"
                                        ? "#2563eb"
                                        : "#ea580c",
                                    boxShadow:
                                      q.status === "Approved"
                                        ? "0 0 6px #16a34a"
                                        : q.status === "Verified"
                                        ? "0 0 6px #2563eb"
                                        : "0 0 6px #ea580c",
                                  }}
                                />
                                {q.status}
                              </span>
                            </td>

                            <td style={{ padding: "14px 8px", verticalAlign: "top", fontSize: "12px", color: "#64748b", fontWeight: 500 }}>
                              {q.addedOn}
                            </td>

                            <td style={{ padding: "14px 8px", verticalAlign: "middle", textAlign: "right" }}>
                              <CrudActionButtons
                                onView={() => setViewQuestion(q)}
                                onEdit={() => setEditQuestion(q)}
                                onDelete={() => setDeleteQuestion(q)}
                                viewTitle="View Question Details"
                                editTitle="Edit Question"
                                deleteTitle="Delete Question"
                                size={34}
                              />
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
                          background: isChecked ? "#f0f4ff" : "#ffffff",
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
                          {/* Top Row: Checkbox, ID, Type badge, Status badge */}
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
                              <span style={{ fontSize: "11px", fontWeight: 700, color: "#6366f1", background: "#eef2ff", padding: "2px 7px", borderRadius: "6px" }}>
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
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px",
                                fontSize: "11px",
                                fontWeight: 700,
                                padding: "3px 9px",
                                borderRadius: "8px",
                                background:
                                  q.status === "Approved"
                                    ? "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)"
                                    : q.status === "Verified"
                                    ? "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)"
                                    : "linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)",
                                color:
                                  q.status === "Approved"
                                    ? "#166534"
                                    : q.status === "Verified"
                                    ? "#1e40af"
                                    : "#9a3412",
                                border:
                                  q.status === "Approved"
                                    ? "1px solid #86efac"
                                    : q.status === "Verified"
                                    ? "1px solid #93c5fd"
                                    : "1px solid #fdba74",
                              }}
                            >
                              <span
                                style={{
                                  width: "6px",
                                  height: "6px",
                                  borderRadius: "50%",
                                  background:
                                    q.status === "Approved"
                                      ? "#16a34a"
                                      : q.status === "Verified"
                                      ? "#2563eb"
                                      : "#ea580c",
                                }}
                              />
                              {q.status}
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

                          {/* Metadata: Subject, Unit, Topic */}
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "11.5px", color: "#64748b" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ fontWeight: 600, color: "#334155" }}>{q.subject}</span>
                              <span>•</span>
                              <span>{q.unit}</span>
                            </div>
                            {q.topic && (
                              <span style={{ fontSize: "11px", color: "#94a3b8" }}>{q.topic}</span>
                            )}
                          </div>
                        </div>

                        {/* Card Footer: Difficulty & Marks badge, Added on, and CrudActionButtons */}
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
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span
                              style={{
                                fontSize: "11px",
                                fontWeight: 700,
                                padding: "2px 8px",
                                borderRadius: "6px",
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
                            {q.marks !== undefined && (
                              <span
                                style={{
                                  fontSize: "11px",
                                  fontWeight: 600,
                                  padding: "2px 7px",
                                  borderRadius: "6px",
                                  background: "#f8fafc",
                                  color: "#64748b",
                                  border: "1px solid #e2e8f0",
                                }}
                              >
                                {q.marks}M
                              </span>
                            )}
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <CrudActionButtons
                              onView={() => setViewQuestion(q)}
                              onEdit={() => setEditQuestion(q)}
                              onDelete={() => setDeleteQuestion(q)}
                              viewTitle="View Question Details"
                              editTitle="Edit Question"
                              deleteTitle="Delete Question"
                              size={32}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Table Footer & Pagination */}
              <Pagination
                currentPage={safeCurrentPage}
                totalItems={filteredQuestions.length}
                itemsPerPage={itemsPerPage}
                onPageChange={(p) => setCurrentPage(p)}
                itemName="questions"
              />
            </div>

            {/* ================= RIGHT COLUMN: Overview & Quick Actions ================= */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px", minWidth: 0, width: "100%" }}>
              {/* Card 1: Question Bank Overview */}
              <div className="widget-card-3d" style={{ padding: "20px", minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "18px",
                    gap: "8px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
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
                        flexShrink: 0,
                      }}
                    >
                      <BarChart2 size={16} color="#ffffff" />
                    </div>
                    <span style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", whiteSpace: "nowrap" }}>
                      Overview
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
                      flexShrink: 0,
                    }}
                  >
                    View Report
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                      <div
                        className="action-mini-icon-blue"
                        style={{ width: "26px", height: "26px", borderRadius: "50%", boxShadow: "0 2px 8px rgba(37, 99, 235, 0.3)", flexShrink: 0 }}
                      >
                        <BookOpen size={13} color="#ffffff" />
                      </div>
                      <span style={{ fontSize: "12.5px", color: "#334155", fontWeight: 600, whiteSpace: "nowrap" }}>
                        Total Questions
                      </span>
                    </div>
                    <strong style={{ fontSize: "14px", color: "#0f172a", fontWeight: 800, flexShrink: 0 }}>{totalQuestionsCount}</strong>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                      <div
                        className="action-mini-icon-cyan"
                        style={{ width: "26px", height: "26px", borderRadius: "50%", boxShadow: "0 2px 8px rgba(2, 132, 199, 0.3)", flexShrink: 0 }}
                      >
                        <ShieldCheck size={13} color="#ffffff" />
                      </div>
                      <span style={{ fontSize: "12.5px", color: "#334155", fontWeight: 600, whiteSpace: "nowrap" }}>
                        Verified Questions
                      </span>
                    </div>
                    <strong style={{ fontSize: "14px", color: "#0284c7", fontWeight: 800, flexShrink: 0 }}>{totalVerifiedCount}</strong>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                      <div
                        className="action-mini-icon-green"
                        style={{ width: "26px", height: "26px", borderRadius: "50%", boxShadow: "0 2px 8px rgba(22, 163, 74, 0.3)", flexShrink: 0 }}
                      >
                        <CheckCircle2 size={13} color="#ffffff" />
                      </div>
                      <span style={{ fontSize: "12.5px", color: "#334155", fontWeight: 600, whiteSpace: "nowrap" }}>
                        Approved Questions
                      </span>
                    </div>
                    <strong style={{ fontSize: "14px", color: "#16a34a", fontWeight: 800, flexShrink: 0 }}>{totalApprovedCount}</strong>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                      <div
                        className="action-mini-icon-orange"
                        style={{ width: "26px", height: "26px", borderRadius: "50%", boxShadow: "0 2px 8px rgba(234, 88, 12, 0.3)", flexShrink: 0 }}
                      >
                        <Clock size={13} color="#ffffff" />
                      </div>
                      <span style={{ fontSize: "12.5px", color: "#334155", fontWeight: 600, whiteSpace: "nowrap" }}>
                        Pending Approval
                      </span>
                    </div>
                    <strong style={{ fontSize: "14px", color: "#ea580c", fontWeight: 800, flexShrink: 0 }}>{totalPendingCount}</strong>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                      <div
                        className="action-mini-icon-red"
                        style={{ width: "26px", height: "26px", borderRadius: "50%", boxShadow: "0 2px 8px rgba(220, 38, 38, 0.3)", flexShrink: 0 }}
                      >
                        <AlertCircle size={13} color="#ffffff" />
                      </div>
                      <span style={{ fontSize: "12.5px", color: "#334155", fontWeight: 600, whiteSpace: "nowrap" }}>
                        Rejected Questions
                      </span>
                    </div>
                    <strong style={{ fontSize: "14px", color: "#dc2626", fontWeight: 800, flexShrink: 0 }}>{totalRejectedCount}</strong>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                      <div
                        className="action-mini-icon-purple"
                        style={{ width: "26px", height: "26px", borderRadius: "50%", boxShadow: "0 2px 8px rgba(124, 58, 237, 0.3)", flexShrink: 0 }}
                      >
                        <Edit3 size={13} color="#ffffff" />
                      </div>
                      <span style={{ fontSize: "12.5px", color: "#334155", fontWeight: 600, whiteSpace: "nowrap" }}>
                        Manually Added
                      </span>
                    </div>
                    <strong style={{ fontSize: "14px", color: "#7c3aed", fontWeight: 800, flexShrink: 0 }}>
                      {questionsList.filter((q) => !q.id.toString().includes("import")).length}
                    </strong>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                      <div
                        className="action-mini-icon-blue"
                        style={{ width: "26px", height: "26px", borderRadius: "50%", boxShadow: "0 2px 8px rgba(37, 99, 235, 0.3)", flexShrink: 0 }}
                      >
                        <Upload size={13} color="#ffffff" />
                      </div>
                      <span style={{ fontSize: "12.5px", color: "#334155", fontWeight: 600, whiteSpace: "nowrap" }}>
                        Active Curriculum
                      </span>
                    </div>
                    <strong style={{ fontSize: "14px", color: "#2563eb", fontWeight: 800, flexShrink: 0 }}>
                      {Array.from(new Set(questionsList.map((q) => q.subject))).length} Subjects
                    </strong>
                  </div>

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
                      <Clock size={14} color="#6366f1" style={{ animation: "float3D 3s ease-in-out infinite" }} />
                      <span style={{ fontSize: "11.5px", color: "#64748b", fontWeight: 500 }}>System Status</span>
                    </div>
                    <span style={{ fontSize: "11.5px", color: "#16a34a", fontWeight: 700 }}>
                      Live Synchronized
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Quick Actions */}
              <div className="widget-card-3d" style={{ padding: "20px", minWidth: 0 }}>
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
                  {/* Action 1: Add New Question */}
                  <div
                    onClick={() => setIsAddOpen(true)}
                    className="quick-action-row-3d"
                    style={{ cursor: "pointer" }}
                  >
                    <div className="quick-action-icon-3d action-mini-icon-blue" style={{ borderRadius: "10px" }}>
                      <Plus size={18} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ display: "block", fontSize: "12.5px", color: "#0f172a", fontWeight: 700 }}>
                        Add New Question
                      </strong>
                      <span style={{ fontSize: "11px", color: "#64748b" }}>Create a single question</span>
                    </div>
                    <ChevronRight size={16} color="#94a3b8" className="chevron-arrow-glow" />
                  </div>

                  {/* Action 2: Bulk Upload Questions */}
                  <div
                    onClick={() => router.push("/bulk-upload")}
                    className="quick-action-row-3d"
                    style={{ cursor: "pointer" }}
                  >
                    <div className="quick-action-icon-3d action-mini-icon-cyan" style={{ borderRadius: "10px" }}>
                      <Upload size={18} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ display: "block", fontSize: "12.5px", color: "#0f172a", fontWeight: 700 }}>
                        Bulk Upload Questions
                      </strong>
                      <span style={{ fontSize: "11px", color: "#64748b" }}>Upload questions in batch</span>
                    </div>
                    <ChevronRight size={16} color="#94a3b8" className="chevron-arrow-glow" />
                  </div>

                  {/* Action 3: Import Questions */}
                  <div
                    onClick={() => router.push("/bulk-upload")}
                    className="quick-action-row-3d"
                    style={{ cursor: "pointer" }}
                  >
                    <div className="quick-action-icon-3d action-mini-icon-green" style={{ borderRadius: "10px" }}>
                      <FileUp size={18} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ display: "block", fontSize: "12.5px", color: "#0f172a", fontWeight: 700 }}>
                        Import Questions
                      </strong>
                      <span style={{ fontSize: "11px", color: "#64748b" }}>From CSV or Excel format</span>
                    </div>
                    <ChevronRight size={16} color="#94a3b8" className="chevron-arrow-glow" />
                  </div>

                  {/* Action 4: Question Settings */}
                  <div
                    onClick={() => router.push("/settings")}
                    className="quick-action-row-3d"
                    style={{ cursor: "pointer" }}
                  >
                    <div className="quick-action-icon-3d action-mini-icon-orange" style={{ borderRadius: "10px" }}>
                      <Settings size={18} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ display: "block", fontSize: "12.5px", color: "#0f172a", fontWeight: 700 }}>
                        Question Settings
                      </strong>
                      <span style={{ fontSize: "11px", color: "#64748b" }}>Rubrics & mark limits</span>
                    </div>
                    <ChevronRight size={16} color="#94a3b8" className="chevron-arrow-glow" />
                  </div>

                  {/* Action 5: Question Templates */}
                  <div
                    onClick={() => {
                      const templateData = [
                        { Question: "Sample MCQ: What is additive color model?", Subject: "Viscom & VFX", Unit: "Unit I - Color Theory", Topic: "Color Models", Type: "MCQ", Difficulty: "Easy", Marks: 2, Status: "Pending" },
                        { Question: "Sample Descriptive: Explain persistence of vision in animation.", Subject: "Viscom & VFX", Unit: "Unit II - Animation Principles", Topic: "Optics & Vision", Type: "Descriptive", Difficulty: "Medium", Marks: 5, Status: "Pending" }
                      ];
                      examStore.exportToCsv("question_bank_template.csv", templateData);
                      showToast("Downloaded sample question template CSV!");
                    }}
                    className="quick-action-row-3d"
                    style={{ cursor: "pointer" }}
                  >
                    <div className="quick-action-icon-3d action-mini-icon-purple" style={{ borderRadius: "10px" }}>
                      <FileSpreadsheet size={18} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ display: "block", fontSize: "12.5px", color: "#0f172a", fontWeight: 700 }}>
                        Question Templates
                      </strong>
                      <span style={{ fontSize: "11px", color: "#64748b" }}>Download standard CSV format</span>
                    </div>
                    <ChevronRight size={16} color="#94a3b8" className="chevron-arrow-glow" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Support Banner & Footer */}
          <PortalFooter />
        </main>
      </div>

      {/* View Modal */}
      {viewQuestion && (
        <ViewModal
          isOpen={!!viewQuestion}
          onClose={() => setViewQuestion(null)}
          title={`Question #${viewQuestion.id}`}
          subtitle={`${viewQuestion.subject} • ${viewQuestion.unit}`}
          badge={{
            label: viewQuestion.status,
            bg: viewQuestion.status === "Approved" ? "#dcfce7" : "#ede9fe",
            color: viewQuestion.status === "Approved" ? "#16a34a" : "#6366f1",
          }}
          fields={[
            { label: "Question Statement", value: viewQuestion.question, spanFull: true },
            { label: "Subject", value: viewQuestion.subject },
            { label: "Unit", value: viewQuestion.unit },
            { label: "Topic", value: viewQuestion.topic },
            { label: "Type", value: viewQuestion.type },
            { label: "Difficulty", value: viewQuestion.difficulty },
            { label: "Marks Allocated", value: `${viewQuestion.marks} Marks` },
            { label: "Status", value: viewQuestion.status },
            { label: "Added On", value: viewQuestion.addedOn || "Recently" },
          ]}
          onEdit={() => {
            setEditQuestion(viewQuestion);
            setViewQuestion(null);
          }}
          onDelete={() => {
            setDeleteQuestion(viewQuestion);
            setViewQuestion(null);
          }}
        />
      )}

      {/* Edit Modal */}
      {editQuestion && (
        <FormModal
          isOpen={!!editQuestion}
          onClose={() => setEditQuestion(null)}
          title={`Edit Question #${editQuestion.id}`}
          subtitle="Modify question details and metadata"
          fields={questionFormFields}
          initialValues={{
            question: editQuestion.question,
            subject: editQuestion.subject,
            unit: editQuestion.unit,
            topic: editQuestion.topic,
            type: editQuestion.type,
            difficulty: editQuestion.difficulty,
            marks: editQuestion.marks,
            status: editQuestion.status,
          }}
          onSubmit={handleUpdateQuestion}
          submitLabel="Save Changes"
        />
      )}

      {/* Add Modal */}
      <FormModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add New Question"
        subtitle="Create a new question entry in the Question Bank"
        fields={questionFormFields}
        initialValues={{
          question: "",
          subject: "Viscom & VFX",
          unit: "Unit I - Color Theory",
          topic: "Topic 1 - Color Basics",
          type: "Descriptive",
          difficulty: "Easy",
          marks: 2,
          status: "Approved",
        }}
        onSubmit={handleCreateQuestion}
        submitLabel="Add Question"
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={!!deleteQuestion}
        onClose={() => setDeleteQuestion(null)}
        title="Delete Question"
        itemName={deleteQuestion ? `Question #${deleteQuestion.id}: ${deleteQuestion.question.slice(0, 45)}...` : ""}
        onConfirm={handleDeleteQuestion}
      />

      {/* Toast Notification */}
      <ToastNotification
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
    </RoleGuard>
  );
}
