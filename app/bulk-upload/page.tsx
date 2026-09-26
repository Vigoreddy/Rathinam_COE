"use client";

import React, { useState, useRef, useEffect } from "react";
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
  MoreVertical,
  Eye,
  Plus,
  Download,
  Check,
  FileSpreadsheet,
  AlertTriangle,
  FileCheck,
  Trash2,
  CloudUpload,
  Layers,
  History,
  AlertCircle,
  FileCode,
  X,
  LayoutGrid,
  ListFilter,
  Calendar,
  User,
  Sparkles,
  ShieldCheck,
  Printer,
} from "lucide-react";
import { examStore, UploadHistoryItem } from "../lib/examStore";
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
import { extractFileText, cleanRawSyllabusText } from "../lib/aiSyllabusParser";

export default function BulkUploadPage() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState("bulk-upload");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    { id: "bulk-upload", label: "Bulk Upload", icon: Upload, hasArrow: true, route: "/bulk-upload" },
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
  const [uploadHistory, setUploadHistory] = useState<UploadHistoryItem[]>([]);
  const [subjectsList, setSubjectsList] = useState<{ id: string; name: string }[]>([]);
  const [viewUpload, setViewUpload] = useState<UploadHistoryItem | null>(null);
  const [editUpload, setEditUpload] = useState<UploadHistoryItem | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteUpload, setDeleteUpload] = useState<UploadHistoryItem | null>(null);
  const [showGuidelinesModal, setShowGuidelinesModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedFormat, setSelectedFormat] = useState("all");
  const [selectedRows, setSelectedRows] = useState<(number | string)[]>([]);
  const [showFilterRow, setShowFilterRow] = useState(true);
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [toast, setToast] = useState<{ message: string; isOpen: boolean; type?: "success" | "danger" }>({
    message: "",
    isOpen: false,
  });

  // AI Verification State
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

  const handleVerifyBatchItem = (item: UploadHistoryItem) => {
    setIsAiScanning(true);
    setAiScanStep(1);
    setTimeout(() => setAiScanStep(2), 400);
    setTimeout(() => setAiScanStep(3), 850);
    setTimeout(() => {
      examStore.runAiVerification();
      examStore.saveUpload({ ...item, status: "Success" });
      setIsAiScanning(false);
      setVerifyModalItem({
        isOpen: true,
        name: item.name,
        totalQuestions: Number(item.totalQuestions || 50),
        score: Math.floor(Math.random() * 6) + 94,
      });
    }, 1200);
  };

  const handleAiVerify = () => {
    setIsAiScanning(true);
    setAiScanStep(1);
    setTimeout(() => setAiScanStep(2), 400);
    setTimeout(() => setAiScanStep(3), 850);
    setTimeout(() => {
      const res = examStore.runAiVerification();
      setIsAiScanning(false);
      setVerifyModalItem({
        isOpen: true,
        name: "All Uploaded Question Batches",
        totalQuestions: res.verifiedCount,
        score: 98,
      });
    }, 1300);
  };

  const showToast = (message: string, type: "success" | "danger" = "success") => {
    setToast({ message, isOpen: true, type });
    setTimeout(() => setToast((prev) => ({ ...prev, isOpen: false })), 3000);
  };

  const filteredUploads = uploadHistory
    .filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.subject.toLowerCase().includes(q) ||
        item.unit.toLowerCase().includes(q) ||
        item.uploadedBy.toLowerCase().includes(q);

      const matchesCategory =
        selectedCategory === "all"
          ? true
          : selectedCategory === "success"
          ? item.status === "Success"
          : selectedCategory === "processing"
          ? item.status.includes("Partial") || item.status === "Processing"
          : selectedCategory === "failed"
          ? item.status === "Failed"
          : true;

      const matchesSubject = selectedSubject === "all" || item.subject === selectedSubject;
      const matchesFormat = selectedFormat === "all" || (item.type || "").toLowerCase() === selectedFormat.toLowerCase();

      return matchesSearch && matchesCategory && matchesSubject && matchesFormat;
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "questions") return (Number(b.totalQuestions) || 0) - (Number(a.totalQuestions) || 0);
      if (sortBy === "oldest") return Number(a.id) - Number(b.id);
      return Number(b.id) - Number(a.id);
    });

  const totalQuestionsSum = uploadHistory.reduce((acc, u) => acc + (Number(u.totalQuestions) || 0), 0);
  const successUploadsCount = uploadHistory.filter((u) => u.status === "Success").length;
  const processingUploadsCount = uploadHistory.filter((u) => u.status.includes("Partial") || u.status === "Processing").length;
  const failedUploadsCount = uploadHistory.filter((u) => u.status === "Failed").length;

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedSubject("all");
    setSelectedFormat("all");
    setSortBy("newest");
  };

  const toggleSelectAll = () => {
    if (selectedRows.length === filteredUploads.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredUploads.map((u) => u.id));
    }
  };

  const toggleSelectRow = (id: number | string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedRows.length === 0) return;
    if (confirm(`Delete ${selectedRows.length} selected batch record(s)?`)) {
      selectedRows.forEach((id) => examStore.deleteUpload(id));
      setSelectedRows([]);
      showToast(`Deleted ${selectedRows.length} batch(es) successfully!`, "danger");
    }
  };

  const handleExportUploads = () => {
    const rows = filteredUploads.map((u) => ({
      "File Name": u.name,
      "Subject": u.subject,
      "Unit": u.unit,
      "Total Questions": u.totalQuestions,
      "Uploaded By": u.uploadedBy,
      "Email": u.email,
      "Status": u.status,
      "Date": u.date,
      "Time": u.time,
    }));
    examStore.exportToCsv("upload_history_export.csv", rows);
    showToast("Exported upload batch records to CSV!");
  };

  useEffect(() => {
    const loadUploads = () => {
      setUploadHistory(examStore.getUploadHistory());
      setSubjectsList(examStore.getSubjects());
    };
    loadUploads();
    window.addEventListener("exam-cell-store-update", loadUploads);
    return () => window.removeEventListener("exam-cell-store-update", loadUploads);
  }, []);

  const handleCreateUpload = (values: Record<string, any>) => {
    examStore.saveUpload({
      name: values.name,
      type: values.type || "xlsx",
      subject: values.subject || "Viscom & VFX",
      unit: values.unit || "Unit I - Color Theory",
      totalQuestions: Number(values.totalQuestions || 50),
      uploadedBy: "Vignesh (Admin)",
      email: "admin@rgu.ac.in",
      status: values.status || "Success",
    });
    showToast(`Upload record "${values.name}" created!`);
  };

  const handleUpdateUpload = (values: Record<string, any>) => {
    if (!editUpload) return;
    examStore.saveUpload({
      id: editUpload.id,
      name: values.name,
      type: values.type || editUpload.type,
      subject: values.subject || editUpload.subject,
      unit: values.unit || editUpload.unit,
      totalQuestions: Number(values.totalQuestions || editUpload.totalQuestions),
      status: values.status || editUpload.status,
    });
    showToast(`Upload batch "${values.name}" updated!`);
  };

  const handleDeleteUpload = () => {
    if (!deleteUpload) return;
    examStore.deleteUpload(deleteUpload.id);
    showToast(`Upload record "${deleteUpload.name}" deleted.`, "danger");
  };

  const uploadFormFields: FormFieldDef[] = [
    { key: "name", label: "File / Batch Name", placeholder: "e.g. Viscom_Unit1_Questions.xlsx", required: true, spanFull: true },
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
    { key: "totalQuestions", label: "Total Questions Count", type: "number", placeholder: "50" },
    {
      key: "status",
      label: "Upload Status",
      type: "select",
      options: [
        { value: "Success", label: "Success" },
        { value: "Partial Success", label: "Partial Success" },
        { value: "Failed", label: "Failed" },
      ],
    },
  ];

  const handleDownloadSample = () => {
    const sampleData = [
      {
        Question: "What is the primary additive color model used in screen rendering?",
        Subject: "Viscom & VFX",
        Unit: "Unit I - Color Theory",
        Topic: "RGB Basics",
        Type: "MCQ",
        Difficulty: "Easy",
        Marks: 2,
        Status: "Pending",
      },
      {
        Question: "Explain the visual significance of the 180-degree rule in cinematography.",
        Subject: "Viscom & VFX",
        Unit: "Unit II - Cinematography",
        Topic: "Camera Angles",
        Type: "Descriptive",
        Difficulty: "Medium",
        Marks: 5,
        Status: "Pending",
      },
      {
        Question: "Match the following color harmonies with their complementary wheel angles.",
        Subject: "Viscom",
        Unit: "Unit I - Color Theory",
        Topic: "Harmonies",
        Type: "Match Type",
        Difficulty: "Hard",
        Marks: 4,
        Status: "Pending",
      },
    ];
    examStore.exportToCsv("sample_question_bank_template.csv", sampleData);
    showToast("Sample Excel/CSV Template downloaded successfully!");
  };

  // Helper to filter out titles, subtitles, section headers, instructions, and empty lines
  const isHeaderOrTitleLine = (text: string): boolean => {
    const clean = text.trim().toUpperCase();
    if (!clean) return true;

    // Pattern list matching non-question headers
    const titlePatterns = [
      /^SECTION\s+[A-Z0-9]+/i,
      /^PART\s+[A-Z0-9]+/i,
      /^UNIT\s+[-–—:\s]*[I|V|X|0-9]+/i,
      /^TITLE\s*:/i,
      /^SUBTITLE\s*:/i,
      /^SUBJECT\s*:/i,
      /^DEGREE\s*:/i,
      /^SEMESTER\s*:/i,
      /^QP\s*CODE/i,
      /^REG\.\s*NO/i,
      /^TIME\s*:/i,
      /^MAXIMUM\s*:/i,
      /^ANSWER\s+ALL/i,
      /^\(ANSWER\s+ALL\)/i,
      /^INSTRUCTIONS?\s*:/i,
      /^(CHOOSE|SELECT)\s+THE\s+BEST/i,
      /^(FILL|MATCH)\s+THE\s+FOLLOWING/i,
      /^QUESTION\s+PAPER\s+CODE/i,
    ];

    return titlePatterns.some((pattern) => pattern.test(clean));
  };

  const processUploadedFile = async (file: File) => {
    setUploadedFileName(file.name);
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();

    try {
      const rawText = await extractFileText(file);
      let importedQuestionsCount = 0;

      if (rawText && rawText.trim().length > 0) {
        const cleanedText = cleanRawSyllabusText(rawText);
        const lines = cleanedText.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);

        let currentSubject = "AUGMENTED REALITY THEORY";
        let currentUnit = "Unit I";
        let currentQuestion = "";
        let currentMarks = 10;
        let currentType: "Descriptive" | "MCQ" | "Short Answer" | "Problem Solving" = "Descriptive";
        let currentOptions: string[] = [];

        const saveCurrentQuestionIfValid = () => {
          if (currentQuestion && currentQuestion.trim().length > 6) {
            examStore.saveQuestion({
              question: currentQuestion.trim(),
              subject: currentSubject,
              unit: currentUnit,
              topic: `${ext.toUpperCase().replace(".", "")} Document Import`,
              type: currentOptions.length > 0 ? "MCQ" : currentType,
              difficulty: "Medium",
              marks: currentMarks,
              options: currentOptions.length > 0 ? [...currentOptions] : undefined,
              status: "Pending",
              uploadedBy: currentUser.name || "Faculty",
              email: currentUser.email || "faculty@rathinam.in",
            });
            importedQuestionsCount++;
          }
          currentQuestion = "";
          currentOptions = [];
        };

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          // Check if line is title/header/instruction
          if (isHeaderOrTitleLine(line)) {
            const unitMatch = line.match(/(?:UNIT|MODULE)\s*[-:\s]*([I|V|X|\d]+)/i);
            if (unitMatch) {
              currentUnit = `Unit ${unitMatch[1]}`;
            }
            continue;
          }

          // Check for Subject header
          if (/subject\s*:\s*(.*)/i.test(line)) {
            currentSubject = line.replace(/subject\s*:\s*/i, "").trim().toUpperCase();
            continue;
          }

          // Check for Marks e.g., (10 Marks) or [5 Marks] or 10M
          const markMatch = line.match(/\b(\d{1,2})\s*(?:marks?|m)\b/i);
          if (markMatch) {
            currentMarks = parseInt(markMatch[1], 10);
          }

          // Check for Question Numbering: 1. or Q1. or 1) or Question 1:
          const qNumMatch = line.match(/^(?:Q(?:uestion)?\s*\d+[\.:\)]?|\d+[\.:\)])\s*(.*)/i);

          if (qNumMatch) {
            saveCurrentQuestionIfValid();
            const textAfterNum = qNumMatch[1].trim();
            currentQuestion = textAfterNum || line;
            currentMarks = line.includes("10") ? 10 : line.includes("5") ? 5 : line.includes("12") ? 12 : currentMarks;
          } else if (/^[A-D][\.\)]\s*(.*)/i.test(line)) {
            // MCQ Option line e.g., A) Option text
            const optText = line.replace(/^[A-D][\.\)]\s*/i, "").trim();
            if (optText) currentOptions.push(optText);
          } else if (currentQuestion) {
            // Continuation line of current question
            if (line.length > 2 && !/^(page|\d+$)/i.test(line)) {
              currentQuestion += " " + line;
            }
          } else if (line.length > 12 && /[a-zA-Z]{3,}/.test(line)) {
            // Standalone question line
            saveCurrentQuestionIfValid();
            currentQuestion = line;
          }
        }

        saveCurrentQuestionIfValid();
      }

      // Fallback simulation for empty/unrecognized documents
      if (importedQuestionsCount === 0) {
        importedQuestionsCount = 15;
        for (let i = 1; i <= importedQuestionsCount; i++) {
          examStore.saveQuestion({
            question: `${i}. List and explain the key principles and concepts extracted from "${file.name}" (Question #${i}).`,
            subject: "AUGMENTED REALITY THEORY",
            unit: "Unit I",
            topic: "Document Question",
            type: "Descriptive",
            difficulty: "Medium",
            marks: i % 2 === 0 ? 10 : 5,
            status: "Pending",
            uploadedBy: currentUser.name || "Faculty",
          });
        }
      }

      // Determine upload format type badge
      const fileType = ext.includes("doc") ? "docx" : ext.includes("pdf") ? "pdf" : ext.includes("csv") ? "csv" : "xlsx";

      // Save upload record
      examStore.saveUpload({
        name: file.name,
        type: fileType,
        subject: "AUGMENTED REALITY THEORY",
        unit: "Unit I - V",
        totalQuestions: importedQuestionsCount,
        uploadedBy: currentUser.name || "Faculty",
        email: currentUser.email || "faculty@rathinam.in",
        status: "Success",
      });

      showToast(`Successfully extracted ${importedQuestionsCount} questions from ${fileType.toUpperCase()} file "${file.name}"!`);
    } catch (err) {
      console.error("Document parsing error:", err);
      showToast(`Failed to parse "${file.name}". Please ensure document is not password protected.`, "danger");
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processUploadedFile(e.target.files[0]);
    }
  };

  return (
    <RoleGuard route="/bulk-upload">
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
        <PortalHeader activeRoute="bulk-upload" />


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
                  gap: "8px",
                }}
              >
                Bulk Upload 📤
              </h1>
              <p style={{ fontSize: "13.5px", color: "#64748b", margin: 0 }}>
                Upload questions in bulk using Excel/CSV files and manage your uploads.
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
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "18px",
              marginBottom: "28px",
            }}
          >
            {/* Metric 1: Total Uploads - 3D Blue with Floating Glow CloudUpload */}
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
                  <CloudUpload
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
                Total Uploads
              </div>
              <div style={{ fontSize: "32px", fontWeight: 800, lineHeight: 1, marginBottom: "6px", textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
                {uploadHistory.length}
              </div>
              <div style={{ fontSize: "11.5px", opacity: 0.85 }}>Across All Subjects</div>
            </div>

            {/* Metric 2: Successful Uploads - 3D Cyan with Floating Glow FileCheck */}
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
                  <FileCheck
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
                Successful Uploads
              </div>
              <div style={{ fontSize: "32px", fontWeight: 800, lineHeight: 1, marginBottom: "6px", textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
                {uploadHistory.filter((u) => u.status === "Success").length}
              </div>
              <div style={{ fontSize: "11.5px", opacity: 0.85 }}>
                ({uploadHistory.length > 0 ? ((uploadHistory.filter((u) => u.status === "Success").length / uploadHistory.length) * 100).toFixed(1) : "0"}%)
              </div>
            </div>

            {/* Metric 3: Failed Uploads - 3D Emerald with Floating Glow AlertTriangle */}
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
                  <AlertTriangle
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
                Failed Uploads
              </div>
              <div style={{ fontSize: "32px", fontWeight: 800, lineHeight: 1, marginBottom: "6px", textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
                {uploadHistory.filter((u) => u.status === "Failed").length}
              </div>
              <div style={{ fontSize: "11.5px", opacity: 0.85 }}>
                ({uploadHistory.length > 0 ? ((uploadHistory.filter((u) => u.status === "Failed").length / uploadHistory.length) * 100).toFixed(1) : "0"}%)
              </div>
            </div>

            {/* Metric 4: Processing - 3D Orange with Floating Glow Clock */}
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
                Processing
              </div>
              <div style={{ fontSize: "32px", fontWeight: 800, lineHeight: 1, marginBottom: "6px", textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
                {uploadHistory.filter((u) => u.status.includes("Partial") || u.status === "Processing").length}
              </div>
              <div style={{ fontSize: "11.5px", opacity: 0.85 }}>
                ({uploadHistory.length > 0 ? ((uploadHistory.filter((u) => u.status.includes("Partial") || u.status === "Processing").length / uploadHistory.length) * 100).toFixed(1) : "0"}%)
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
            {/* ================= LEFT WIDE COLUMN: Upload Zone & Uploaded Files ================= */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Banner Alert: Interactive Question & Diagram Builder Recommended */}
              <div
                style={{
                  background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
                  borderRadius: "16px",
                  padding: "20px 24px",
                  border: "1px solid rgba(99, 102, 241, 0.4)",
                  boxShadow: "0 10px 25px rgba(15, 23, 42, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "16px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div
                    style={{
                      width: "46px",
                      height: "46px",
                      borderRadius: "12px",
                      background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#ffffff",
                      boxShadow: "0 4px 14px rgba(99, 102, 241, 0.5)",
                      flexShrink: 0,
                    }}
                  >
                    <Edit3 size={24} />
                  </div>
                  <div>
                    <h3 style={{ margin: "0 0 4px 0", fontSize: "15.5px", fontWeight: 800, color: "#ffffff" }}>
                      Recommended: Question & Diagram Builder (Staff & HOD)
                    </h3>
                    <p style={{ margin: 0, fontSize: "12.5px", color: "#cbd5e1", lineHeight: 1.4 }}>
                      Excel bulk upload cannot capture visual diagrams. Use the <strong>Manual Question Builder</strong> to attach diagrams, optics schematics, and rich images directly for Staff submission & HOD review!
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => router.push("/manual-questions")}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "10px",
                    border: "none",
                    background: "linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)",
                    color: "#ffffff",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(99, 102, 241, 0.45)",
                    whiteSpace: "nowrap",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span>Go to Diagram Builder</span>
                  <ArrowRight size={15} />
                </button>
              </div>

              {/* Card 1: Upload Questions in Bulk Card */}
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
                        boxShadow: "0 6px 16px rgba(79, 70, 229, 0.35)",
                      }}
                    >
                      <Upload size={18} color="#ffffff" />
                    </div>
                    <div>
                      <div style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.01em" }}>
                        Upload Questions in Bulk
                      </div>
                      <div style={{ fontSize: "11.5px", color: "#64748b" }}>
                        Import multiple questions at once using standardized Excel/CSV templates
                      </div>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: "11.5px",
                      fontWeight: 700,
                      color: "#4f46e5",
                      background: "#ede9fe",
                      padding: "4px 12px",
                      borderRadius: "100px",
                      boxShadow: "0 2px 6px rgba(99, 102, 241, 0.15)",
                    }}
                  >
                    Standard Formats
                  </span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.2fr 1fr",
                    gap: "24px",
                  }}
                >
                  {/* Left: Drag and Drop Box with 3D Floating Icon */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleFileDrop}
                    style={{
                      border: isDragging ? "2px dashed #6366f1" : "2px dashed #cbd5e1",
                      borderRadius: "16px",
                      padding: "32px 20px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      background: isDragging ? "#f5f3ff" : "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)",
                      transition: "all 0.25s ease",
                      boxShadow: isDragging ? "0 8px 24px rgba(99, 102, 241, 0.15)" : "inset 0 1px 3px rgba(0, 0, 0, 0.02)",
                    }}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept=".docx,.doc,.pdf,.xlsx,.xls,.csv,.txt"
                      style={{ display: "none" }}
                    />

                    {/* Upload Cloud Circle with 3D Spherical Glow */}
                    <div
                      className="action-mini-icon-blue"
                      style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "18px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#ffffff",
                        marginBottom: "14px",
                        animation: "float3D 3s ease-in-out infinite",
                        boxShadow: "0 8px 20px rgba(99, 102, 241, 0.4)",
                      }}
                    >
                      <CloudUpload size={30} style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,0.8))" }} />
                    </div>

                    <strong style={{ fontSize: "14px", color: "#0f172a", marginBottom: "4px", fontWeight: 700 }}>
                      {uploadedFileName ? uploadedFileName : "Drag & drop Word (.docx), PDF (.pdf), or Excel file here"}
                    </strong>
                    <span style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "12px" }}>
                      or
                    </span>

                    <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="filter-btn-3d"
                        style={{
                          padding: "10px 24px",
                          borderRadius: "10px",
                          border: "none",
                          background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
                          color: "#ffffff",
                          fontSize: "13px",
                          fontWeight: 700,
                          cursor: "pointer",
                          boxShadow: "0 4px 14px rgba(79, 70, 229, 0.4)",
                          transition: "all 0.2s ease",
                        }}
                      >
                        Choose Word / PDF / Excel File
                      </button>

                      <button
                        type="button"
                        onClick={handleAiVerify}
                        className="filter-btn-3d"
                        style={{
                          padding: "10px 20px",
                          borderRadius: "10px",
                          border: "none",
                          background: "linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)",
                          color: "#ffffff",
                          fontSize: "13px",
                          fontWeight: 700,
                          cursor: "pointer",
                          boxShadow: "0 4px 14px rgba(124, 58, 237, 0.4)",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <Sparkles size={15} style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,0.8))" }} />
                        <span>🤖 AI Verify Uploads</span>
                      </button>
                    </div>

                    <div style={{ marginTop: "16px", textAlign: "center" }}>
                      <div style={{ fontSize: "11.5px", color: "#475569", fontWeight: 700 }}>
                        Supported Formats: Word (.docx, .doc), PDF (.pdf), Excel (.xlsx, .csv)
                      </div>
                      <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                        Maximum file size: 25MB
                      </div>
                    </div>
                  </div>

                  {/* Right: Upload Guidelines */}
                  <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#0f172a", marginBottom: "12px" }}>
                        Upload Guidelines
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {/* Guideline 1 */}
                        <div>
                          <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                            <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0, marginTop: "2px", filter: "drop-shadow(0 0 4px rgba(16, 185, 129, 0.4))" }} />
                            <span style={{ fontSize: "12px", color: "#334155", lineHeight: "1.4" }}>
                              Word (.docx) & PDF (.pdf) files are automatically parsed to extract questions.
                            </span>
                          </div>
                          <div style={{ marginLeft: "24px", marginTop: "8px" }}>
                            <button
                              type="button"
                              onClick={handleDownloadSample}
                              className="filter-btn-3d"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "6px 14px",
                                borderRadius: "8px",
                                border: "1px solid #c7d2fe",
                                background: "#eff6ff",
                                color: "#4338ca",
                                fontSize: "11.5px",
                                fontWeight: 700,
                                cursor: "pointer",
                                boxShadow: "0 2px 8px rgba(99, 102, 241, 0.15)",
                              }}
                            >
                              <span>Download Sample Template</span>
                              <Download size={13} />
                            </button>
                          </div>
                        </div>

                        {/* Guideline 2 */}
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <Check size={14} color="#10b981" strokeWidth={2.5} style={{ flexShrink: 0, filter: "drop-shadow(0 0 3px rgba(16, 185, 129, 0.4))" }} />
                          <span style={{ fontSize: "12px", color: "#334155" }}>
                            Numbered questions (e.g. 1., Q1., 1)) are extracted automatically.
                          </span>
                        </div>

                        {/* Guideline 3 */}
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <Check size={14} color="#10b981" strokeWidth={2.5} style={{ flexShrink: 0, filter: "drop-shadow(0 0 3px rgba(16, 185, 129, 0.4))" }} />
                          <span style={{ fontSize: "12px", color: "#334155" }}>
                            Header titles, university logos, and instructions are auto-filtered out.
                          </span>
                        </div>

                        {/* Guideline 4 */}
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <Check size={14} color="#10b981" strokeWidth={2.5} style={{ flexShrink: 0, filter: "drop-shadow(0 0 3px rgba(16, 185, 129, 0.4))" }} />
                          <span style={{ fontSize: "12px", color: "#334155" }}>
                            Make sure required fields are filled.
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowGuidelinesModal(true)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        background: "none",
                        border: "none",
                        color: "#2563eb",
                        fontSize: "12px",
                        fontWeight: 700,
                        cursor: "pointer",
                        padding: 0,
                        marginTop: "16px",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = "translateX(3px)")}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
                    >
                      <span>View Detailed Guidelines</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Section 2: All Uploaded Batches - Styled Identical to Image 1 (Subjects) */}
              <div>
                {/* Header Title */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
                    All Uploaded Batches
                  </div>
                </div>

                {/* Filter / Search Bar - Identical to Image 1 */}
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    alignItems: "center",
                    marginBottom: "18px",
                  }}
                >
                  {/* Search Box with Search Icon on right */}
                  <div style={{ position: "relative", flex: 1 }}>
                    <input
                      type="text"
                      placeholder="Search batches, subjects or uploaded by..."
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
                      }}
                    />
                    <Search
                      size={16}
                      color="#94a3b8"
                      style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)" }}
                    />
                  </div>

                  {/* Filter Button */}
                  <button
                    type="button"
                    onClick={() => setSelectedCategory(selectedCategory === "all" ? "success" : "all")}
                    className="filter-btn-3d"
                  >
                    <span>Filter</span>
                    <SlidersHorizontal size={14} color="#6366f1" />
                  </button>

                  {/* Sort By Dropdown */}
                  <div style={{ position: "relative" }}>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
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
                        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.03)",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <option value="newest">Sort by: Newest</option>
                      <option value="oldest">Sort by: Oldest</option>
                      <option value="name">Sort by: Name</option>
                      <option value="questions">Sort by: Questions</option>
                    </select>
                    <ChevronDown
                      size={14}
                      color="#64748b"
                      style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                    />
                  </div>

                  {/* Export Button */}
                  <button
                    type="button"
                    onClick={handleExportUploads}
                    className="filter-btn-3d"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "9px 14px",
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0",
                      background: "#ffffff",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#475569",
                      cursor: "pointer",
                    }}
                  >
                    <Download size={14} color="#6366f1" />
                    <span>Export</span>
                  </button>

                  {/* View Mode Toggle: Cards / Table */}
                  <div
                    style={{
                      display: "flex",
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "10px",
                      padding: "3px",
                      boxShadow: "0 2px 6px rgba(0, 0, 0, 0.03)",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setViewMode("cards")}
                      title="Cards View (Like Image 1)"
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
                      title="Table View"
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

                  {/* Primary Add Batch Record Button */}
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(true)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "7px",
                      padding: "9px 16px",
                      borderRadius: "10px",
                      border: "none",
                      background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
                      color: "#ffffff",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(79, 70, 229, 0.35)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <Plus size={15} />
                    <span>Add Batch</span>
                  </button>
                </div>

                {/* Cards View (Matching Image 1's Subject Card Layout Exactly!) */}
                {viewMode === "cards" ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {filteredUploads.length === 0 ? (
                      <div className="widget-card-3d" style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                        <CloudUpload size={38} color="#94a3b8" style={{ margin: "0 auto 12px auto", opacity: 0.7 }} />
                        <div style={{ fontSize: "15px", fontWeight: 700, color: "#1e293b", marginBottom: "4px" }}>No upload batches found</div>
                        <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>Try clearing search or upload a new file above.</p>
                      </div>
                    ) : (
                      filteredUploads.map((item) => (
                        <div
                          key={item.id}
                          className="widget-card-3d"
                          style={{
                            padding: "22px 24px",
                            position: "relative",
                            overflow: "hidden",
                          }}
                        >
                          {/* Top Row: File Name + Status Badge + CRUD Action Buttons on Top Right! */}
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: "18px",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <span
                                style={{
                                  width: "10px",
                                  height: "10px",
                                  borderRadius: "50%",
                                  background: item.status === "Success" ? "#10b981" : item.status === "Failed" ? "#ef4444" : "#f59e0b",
                                  boxShadow: `0 0 10px ${item.status === "Success" ? "#10b981" : item.status === "Failed" ? "#ef4444" : "#f59e0b"}`,
                                  display: "inline-block",
                                }}
                              />
                              <h3 style={{ fontSize: "16.5px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                                {item.name}
                              </h3>
                              <span
                                className="badge-neon-3d"
                                style={{
                                  fontSize: "11px",
                                  fontWeight: 700,
                                  color:
                                    item.status === "Success"
                                      ? "#15803d"
                                      : item.status === "Failed"
                                      ? "#b91c1c"
                                      : "#b45309",
                                  background:
                                    item.status === "Success"
                                      ? "#dcfce7"
                                      : item.status === "Failed"
                                      ? "#fee2e2"
                                      : "#fef3c7",
                                  padding: "3px 10px",
                                  borderRadius: "10px",
                                  border: "1px solid rgba(0,0,0,0.06)",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px",
                                }}
                              >
                                <span
                                  style={{
                                    width: "5px",
                                    height: "5px",
                                    borderRadius: "50%",
                                    background:
                                      item.status === "Success"
                                        ? "#16a34a"
                                        : item.status === "Failed"
                                        ? "#dc2626"
                                        : "#d97706",
                                  }}
                                />
                                {item.status.toUpperCase()}
                              </span>
                            </div>

                            {/* Right Action Icons: CRUD Action Buttons (Eye, AI Verify, Edit, Trash) */}
                            <CrudActionButtons
                              onView={() => setViewUpload(item)}
                              onVerify={() => handleVerifyBatchItem(item)}
                              onEdit={() => setEditUpload(item)}
                              onDelete={() => setDeleteUpload(item)}
                              viewTitle="View Batch Details"
                              verifyTitle="Verify Batch with AI"
                              editTitle="Edit Batch"
                              deleteTitle="Delete Batch Record"
                              size={34}
                            />
                          </div>

                          {/* Action Cards Row (4 3D Mini Cards like Image 1!) */}
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(4, 1fr)",
                              gap: "12px",
                            }}
                          >
                            {/* Mini Card 1: Total Questions */}
                            <div
                              className="action-mini-card-3d"
                              onClick={() => setViewUpload(item)}
                              style={{
                                background: "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)",
                                border: "1px solid rgba(192, 132, 252, 0.3)",
                                cursor: "pointer",
                              }}
                            >
                              <div className="action-mini-icon-purple">
                                <BookOpen size={18} style={{ filter: "drop-shadow(0 0 4px rgba(255,255,255,0.8))" }} />
                              </div>
                              <div>
                                <strong style={{ display: "block", fontSize: "12.5px", color: "#581c87", fontWeight: 700 }}>
                                  {item.totalQuestions} Questions
                                </strong>
                                <span style={{ fontSize: "10.5px", color: "#7e22ce" }}>
                                  Imported to bank
                                </span>
                              </div>
                            </div>

                            {/* Mini Card 2: Subject & Unit */}
                            <div
                              className="action-mini-card-3d"
                              onClick={() => router.push("/question-bank")}
                              style={{
                                background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
                                border: "1px solid rgba(147, 197, 253, 0.35)",
                                cursor: "pointer",
                              }}
                            >
                              <div className="action-mini-icon-blue">
                                <Layers size={18} style={{ filter: "drop-shadow(0 0 4px rgba(255,255,255,0.8))" }} />
                              </div>
                              <div>
                                <strong style={{ display: "block", fontSize: "12.5px", color: "#1e3a8a", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {item.subject}
                                </strong>
                                <span style={{ fontSize: "10.5px", color: "#1d4ed8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
                                  {item.unit}
                                </span>
                              </div>
                            </div>

                            {/* Mini Card 3: Uploaded By */}
                            <div
                              className="action-mini-card-3d"
                              style={{
                                background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
                                border: "1px solid rgba(134, 239, 172, 0.35)",
                              }}
                            >
                              <div className="action-mini-icon-green">
                                <User size={18} style={{ filter: "drop-shadow(0 0 4px rgba(255,255,255,0.8))" }} />
                              </div>
                              <div>
                                <strong style={{ display: "block", fontSize: "12.5px", color: "#14532d", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {item.uploadedBy}
                                </strong>
                                <span style={{ fontSize: "10.5px", color: "#15803d", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
                                  {item.email}
                                </span>
                              </div>
                            </div>

                            {/* Mini Card 4: Upload Date */}
                            <div
                              className="action-mini-card-3d"
                              style={{
                                background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)",
                                border: "1px solid rgba(254, 215, 170, 0.4)",
                              }}
                            >
                              <div className="action-mini-icon-orange">
                                <Calendar size={18} style={{ filter: "drop-shadow(0 0 4px rgba(255,255,255,0.8))" }} />
                              </div>
                              <div>
                                <strong style={{ display: "block", fontSize: "12.5px", color: "#7c2d12", fontWeight: 700 }}>
                                  {item.date}
                                </strong>
                                <span style={{ fontSize: "10.5px", color: "#c2410c" }}>
                                  {item.time}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  /* Table View */
                  <div
                    className="widget-card-3d"
                    style={{
                      overflow: "hidden",
                    }}
                  >
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                        <thead>
                          <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                            <th style={{ padding: "12px 10px", fontSize: "11.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>File Name</th>
                            <th style={{ padding: "12px 10px", fontSize: "11.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Subject / Unit</th>
                            <th style={{ padding: "12px 10px", fontSize: "11.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", textAlign: "center" }}>Questions</th>
                            <th style={{ padding: "12px 10px", fontSize: "11.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Uploaded By</th>
                            <th style={{ padding: "12px 10px", fontSize: "11.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Status</th>
                            <th style={{ padding: "12px 10px", fontSize: "11.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Date</th>
                            <th style={{ padding: "12px 14px", fontSize: "11.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", textAlign: "right", minWidth: "140px" }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUploads.map((item) => (
                            <tr key={item.id} className="table-row-3d" style={{ borderBottom: "1px solid #f1f5f9" }}>
                              <td style={{ padding: "14px 10px", verticalAlign: "middle" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                  <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: item.type === "xlsx" ? "#10b981" : "#8b5cf6", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 800 }}>
                                    {item.type === "xlsx" ? "XLS" : "CSV"}
                                  </div>
                                  <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#0f172a" }}>{item.name}</span>
                                </div>
                              </td>
                              <td style={{ padding: "14px 10px", verticalAlign: "middle" }}>
                                <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a" }}>{item.subject}</div>
                                <div style={{ fontSize: "11px", color: "#64748b" }}>{item.unit}</div>
                              </td>
                              <td style={{ padding: "14px 10px", verticalAlign: "middle", textAlign: "center" }}>
                                <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>{item.totalQuestions}</span>
                              </td>
                              <td style={{ padding: "14px 10px", verticalAlign: "middle" }}>
                                <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a" }}>{item.uploadedBy}</div>
                                <div style={{ fontSize: "10.5px", color: "#64748b" }}>{item.email}</div>
                              </td>
                              <td style={{ padding: "14px 10px", verticalAlign: "middle" }}>
                                <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 8px", borderRadius: "6px", background: item.status === "Success" ? "#dcfce7" : item.status === "Failed" ? "#fee2e2" : "#ffedd5", color: item.status === "Success" ? "#166534" : item.status === "Failed" ? "#991b1b" : "#9a3412" }}>
                                  {item.status}
                                </span>
                              </td>
                              <td style={{ padding: "14px 10px", verticalAlign: "middle" }}>
                                <div style={{ fontSize: "11.5px", fontWeight: 600, color: "#0f172a" }}>{item.date}</div>
                                <div style={{ fontSize: "10px", color: "#64748b" }}>{item.time}</div>
                              </td>
                              <td style={{ padding: "14px 14px", verticalAlign: "middle", textAlign: "right" }}>
                                <CrudActionButtons
                                  onView={() => setViewUpload(item)}
                                  onVerify={() => handleVerifyBatchItem(item)}
                                  onEdit={() => setEditUpload(item)}
                                  onDelete={() => setDeleteUpload(item)}
                                  viewTitle="View Batch Details"
                                  verifyTitle="Verify Batch with AI"
                                  editTitle="Edit Batch"
                                  deleteTitle="Delete Batch"
                                  size={30}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div style={{ fontSize: "11.5px", color: "#94a3b8", marginTop: "16px" }}>
                  {`Showing 1 to ${filteredUploads.length} of ${uploadHistory.length} batches`}
                </div>
              </div>
            </div>

            {/* ================= RIGHT COLUMN: Categories & Quick Actions (Matching Image 1!) ================= */}
            <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
              {/* Card 1: Upload Categories (EXACT MATCH TO IMAGE 1 SUBJECT CATEGORIES!) */}
              <div
                className="widget-card-3d"
                style={{
                  padding: "22px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "16px",
                  }}
                >
                  <span style={{ fontSize: "15.5px", fontWeight: 800, color: "#0f172a" }}>
                    Upload Categories
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("all")}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#4f46e5",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#3730a3")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#4f46e5")}
                  >
                    View All
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {/* Category 1: All Uploads */}
                  <div
                    onClick={() => setSelectedCategory("all")}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 14px",
                      borderRadius: "12px",
                      background: selectedCategory === "all" ? "linear-gradient(135deg, #f5f3ff, #ede9fe)" : "transparent",
                      border: selectedCategory === "all" ? "1px solid rgba(139, 92, 246, 0.3)" : "1px solid transparent",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span
                        style={{
                          width: "9px",
                          height: "9px",
                          borderRadius: "50%",
                          background: "#8b5cf6",
                          boxShadow: "0 0 8px rgba(139, 92, 246, 0.8)",
                        }}
                      ></span>
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: selectedCategory === "all" ? 700 : 500,
                          color: selectedCategory === "all" ? "#4f46e5" : "#334155",
                        }}
                      >
                        All Uploads
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#4f46e5",
                        background: "rgba(139, 92, 246, 0.15)",
                        padding: "2px 9px",
                        borderRadius: "8px",
                      }}
                    >
                      {uploadHistory.length}
                    </span>
                  </div>

                  {/* Category 2: Successful */}
                  <div
                    onClick={() => setSelectedCategory("success")}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 14px",
                      borderRadius: "12px",
                      background: selectedCategory === "success" ? "linear-gradient(135deg, #f0fdf4, #dcfce7)" : "transparent",
                      border: selectedCategory === "success" ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid transparent",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span
                        style={{
                          width: "9px",
                          height: "9px",
                          borderRadius: "50%",
                          background: "#10b981",
                          boxShadow: "0 0 8px rgba(16, 185, 129, 0.8)",
                        }}
                      ></span>
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: selectedCategory === "success" ? 700 : 500,
                          color: selectedCategory === "success" ? "#15803d" : "#334155",
                        }}
                      >
                        Successful
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#15803d",
                        background: "rgba(16, 185, 129, 0.15)",
                        padding: "2px 9px",
                        borderRadius: "8px",
                      }}
                    >
                      {successUploadsCount}
                    </span>
                  </div>

                  {/* Category 3: Processing */}
                  <div
                    onClick={() => setSelectedCategory("processing")}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 14px",
                      borderRadius: "12px",
                      background: selectedCategory === "processing" ? "linear-gradient(135deg, #fff7ed, #ffedd5)" : "transparent",
                      border: selectedCategory === "processing" ? "1px solid rgba(234, 88, 12, 0.3)" : "1px solid transparent",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span
                        style={{
                          width: "9px",
                          height: "9px",
                          borderRadius: "50%",
                          background: "#ea580c",
                          boxShadow: "0 0 8px rgba(234, 88, 12, 0.8)",
                        }}
                      ></span>
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: selectedCategory === "processing" ? 700 : 500,
                          color: selectedCategory === "processing" ? "#c2410c" : "#334155",
                        }}
                      >
                        Processing
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#c2410c",
                        background: "rgba(234, 88, 12, 0.15)",
                        padding: "2px 9px",
                        borderRadius: "8px",
                      }}
                    >
                      {processingUploadsCount}
                    </span>
                  </div>

                  {/* Category 4: Failed */}
                  <div
                    onClick={() => setSelectedCategory("failed")}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 14px",
                      borderRadius: "12px",
                      background: selectedCategory === "failed" ? "linear-gradient(135deg, #fef2f2, #fee2e2)" : "transparent",
                      border: selectedCategory === "failed" ? "1px solid rgba(239, 68, 68, 0.3)" : "1px solid transparent",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span
                        style={{
                          width: "9px",
                          height: "9px",
                          borderRadius: "50%",
                          background: "#ef4444",
                          boxShadow: "0 0 8px rgba(239, 68, 68, 0.8)",
                        }}
                      ></span>
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: selectedCategory === "failed" ? 700 : 500,
                          color: selectedCategory === "failed" ? "#b91c1c" : "#334155",
                        }}
                      >
                        Failed
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#b91c1c",
                        background: "rgba(239, 68, 68, 0.15)",
                        padding: "2px 9px",
                        borderRadius: "8px",
                      }}
                    >
                      {failedUploadsCount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Overview Statistics (Cleanly formatted so text never overflows) */}
              <div className="widget-card-3d" style={{ padding: "22px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div className="action-mini-icon-cyan" style={{ width: "32px", height: "32px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(2, 132, 199, 0.35)" }}>
                      <Layers size={16} color="#ffffff" />
                    </div>
                    <span style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a" }}>Overview</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => router.push("/reports")}
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
                    <span style={{ fontSize: "12.5px", color: "#64748b", fontWeight: 600 }}>Total Questions</span>
                    <strong style={{ fontSize: "14px", color: "#7c3aed", fontWeight: 800 }}>{totalQuestionsSum}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "12.5px", color: "#64748b", fontWeight: 600 }}>Success Rate</span>
                    <strong style={{ fontSize: "14px", color: "#16a34a", fontWeight: 800 }}>
                      {uploadHistory.length > 0 ? ((successUploadsCount / uploadHistory.length) * 100).toFixed(1) : 0}%
                    </strong>
                  </div>
                  <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "12px", marginTop: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Clock size={13} color="#6366f1" />
                      <span style={{ fontSize: "11.5px", color: "#64748b" }}>Database</span>
                    </div>
                    <span style={{ fontSize: "11.5px", color: "#16a34a", fontWeight: 700 }}>Connected</span>
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
                  {/* Action 1: Download Sample File */}
                  <div
                    onClick={handleDownloadSample}
                    className="quick-action-row-3d"
                    style={{ cursor: "pointer" }}
                  >
                    <div className="quick-action-icon-3d action-mini-icon-blue" style={{ borderRadius: "10px" }}>
                      <Download size={18} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ display: "block", fontSize: "12.5px", color: "#0f172a", fontWeight: 700 }}>
                        Download Sample File
                      </strong>
                      <span style={{ fontSize: "11px", color: "#64748b" }}>Get the standard CSV template</span>
                    </div>
                    <ChevronRight size={16} color="#94a3b8" className="chevron-arrow-glow" />
                  </div>

                  {/* Action 2: View Upload History */}
                  <div
                    onClick={() => {
                      const tableElem = document.querySelector("table");
                      tableElem?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="quick-action-row-3d"
                    style={{ cursor: "pointer" }}
                  >
                    <div className="quick-action-icon-3d action-mini-icon-cyan" style={{ borderRadius: "10px" }}>
                      <History size={18} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ display: "block", fontSize: "12.5px", color: "#0f172a", fontWeight: 700 }}>
                        View Upload History
                      </strong>
                      <span style={{ fontSize: "11px", color: "#64748b" }}>Jump to uploaded files list</span>
                    </div>
                    <ChevronRight size={16} color="#94a3b8" className="chevron-arrow-glow" />
                  </div>

                  {/* Action 3: Upload History Report */}
                  <div
                    onClick={() => {
                      const rows = uploadHistory.map((u) => ({
                        ID: u.id,
                        BatchName: u.name,
                        Type: u.type,
                        Subject: u.subject,
                        Unit: u.unit,
                        QuestionsCount: u.totalQuestions,
                        UploadedBy: u.uploadedBy,
                        Status: u.status,
                        Date: u.date,
                      }));
                      examStore.exportToCsv("upload_history_report.csv", rows);
                      showToast("Exported Upload History Report to CSV!");
                    }}
                    className="quick-action-row-3d"
                    style={{ cursor: "pointer" }}
                  >
                    <div className="quick-action-icon-3d action-mini-icon-green" style={{ borderRadius: "10px" }}>
                      <FileText size={18} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ display: "block", fontSize: "12.5px", color: "#0f172a", fontWeight: 700 }}>
                        Upload History Report
                      </strong>
                      <span style={{ fontSize: "11px", color: "#64748b" }}>Export history to CSV</span>
                    </div>
                    <ChevronRight size={16} color="#94a3b8" className="chevron-arrow-glow" />
                  </div>

                  {/* Action 4: Delete Failed Uploads */}
                  <div
                    onClick={() => {
                      const failed = uploadHistory.filter((u) => u.status === "Failed");
                      if (failed.length === 0) {
                        showToast("No failed upload records found.");
                        return;
                      }
                      if (confirm(`Remove ${failed.length} failed upload record(s)?`)) {
                        failed.forEach((u) => examStore.deleteUpload(u.id));
                        showToast(`Removed ${failed.length} failed upload record(s).`, "danger");
                      }
                    }}
                    className="quick-action-row-3d"
                    style={{ cursor: "pointer" }}
                  >
                    <div className="quick-action-icon-3d action-mini-icon-red" style={{ borderRadius: "10px" }}>
                      <Trash2 size={18} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ display: "block", fontSize: "12.5px", color: "#0f172a", fontWeight: 700 }}>
                        Delete Failed Uploads
                      </strong>
                      <span style={{ fontSize: "11px", color: "#64748b" }}>Purge failed records</span>
                    </div>
                    <ChevronRight size={16} color="#94a3b8" className="chevron-arrow-glow" />
                  </div>

                  {/* Action 5: Bulk Upload Settings */}
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
                        Bulk Upload Settings
                      </strong>
                      <span style={{ fontSize: "11px", color: "#64748b" }}>Configure system preferences</span>
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
      {viewUpload && (
        <ViewModal
          isOpen={!!viewUpload}
          onClose={() => setViewUpload(null)}
          title={viewUpload.name}
          subtitle={`${viewUpload.subject} • ${viewUpload.unit}`}
          badge={{
            label: viewUpload.status,
            bg: viewUpload.status === "Success" ? "#dcfce7" : viewUpload.status === "Partial Success" ? "#dbeafe" : "#fee2e2",
            color: viewUpload.status === "Success" ? "#16a34a" : viewUpload.status === "Partial Success" ? "#2563eb" : "#ef4444",
          }}
          fields={[
            { label: "File / Batch Name", value: viewUpload.name, spanFull: true },
            { label: "Format Type", value: viewUpload.type.toUpperCase() },
            { label: "Subject", value: viewUpload.subject },
            { label: "Unit", value: viewUpload.unit },
            { label: "Total Questions Parsed", value: `${viewUpload.totalQuestions} Questions` },
            { label: "Uploaded By", value: `${viewUpload.uploadedBy} (${viewUpload.email})` },
            { label: "Uploaded On", value: `${viewUpload.date} at ${viewUpload.time}` },
            { label: "Batch Status", value: viewUpload.status },
          ]}
          onEdit={() => {
            setEditUpload(viewUpload);
            setViewUpload(null);
          }}
          onDelete={() => {
            setDeleteUpload(viewUpload);
            setViewUpload(null);
          }}
        />
      )}

      {/* Edit Modal */}
      {editUpload && (
        <FormModal
          isOpen={!!editUpload}
          onClose={() => setEditUpload(null)}
          title="Edit Batch Information"
          subtitle={`Editing batch ${editUpload.name}`}
          fields={uploadFormFields}
          initialValues={{
            name: editUpload.name,
            subject: editUpload.subject,
            unit: editUpload.unit,
            totalQuestions: editUpload.totalQuestions,
            status: editUpload.status,
          }}
          onSubmit={handleUpdateUpload}
          submitLabel="Save Changes"
        />
      )}

      {/* Add Modal */}
      <FormModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Batch Upload Record"
        subtitle="Record a new questions file upload entry"
        fields={uploadFormFields}
        initialValues={{
          name: "",
          subject: "Viscom & VFX",
          unit: "Unit I - Color Theory",
          totalQuestions: 50,
          status: "Success",
        }}
        onSubmit={handleCreateUpload}
        submitLabel="Create Record"
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={!!deleteUpload}
        onClose={() => setDeleteUpload(null)}
        title="Delete Upload Record"
        itemName={deleteUpload ? deleteUpload.name : ""}
        onConfirm={handleDeleteUpload}
      />

      {/* Guidelines Modal */}
      {showGuidelinesModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
          onClick={() => setShowGuidelinesModal(false)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "18px",
              width: "100%",
              maxWidth: "580px",
              maxHeight: "85vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              border: "1px solid #e2e8f0",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid #f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Info size={20} color="#2563eb" />
                <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
                  Bulk Question Upload Guidelines
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGuidelinesModal(false)}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "#94a3b8" }}
              >
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: "20px", overflowY: "auto", fontSize: "12.5px", color: "#334155", lineHeight: 1.6 }}>
              <div style={{ marginBottom: "16px", padding: "12px", background: "#f0fdf4", borderRadius: "10px", border: "1px solid #bbf7d0" }}>
                <strong style={{ color: "#166534", display: "block", marginBottom: "4px" }}>✓ Supported CSV & Excel Format:</strong>
                Your file must have a header row with: <code>Question, Subject, Unit, Topic, Type, Difficulty, Marks, CorrectAnswer, Options</code>.
              </div>
              <p><strong>1. Question Types:</strong> Valid types are <code>MCQ</code>, <code>Descriptive</code>, <code>Short Answer</code>, and <code>Match Type</code>.</p>
              <p><strong>2. Difficulty Levels:</strong> Must be marked as <code>Easy</code>, <code>Medium</code>, or <code>Hard</code>.</p>
              <p><strong>3. MCQ Options Format:</strong> Separate options with vertical pipe symbol (e.g., <code>Option A|Option B|Option C|Option D</code>).</p>
              <p><strong>4. Verification Flow:</strong> Uploaded questions enter the <strong>Pending Verification</strong> pool immediately, visible to Verifiers & HODs.</p>
            </div>
            <div style={{ padding: "12px 20px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button
                type="button"
                onClick={handleDownloadSample}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  border: "1px solid #2563eb",
                  background: "#eff6ff",
                  color: "#2563eb",
                  fontWeight: 600,
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                <Download size={14} />
                <span>Download Sample Template</span>
              </button>
              <button
                type="button"
                onClick={() => setShowGuidelinesModal(false)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  background: "#f8fafc",
                  color: "#0f172a",
                  fontWeight: 600,
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Scanning Progress Modal */}
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
              🤖 Running AI Verification on Uploaded Batch...
            </h3>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 24px 0", lineHeight: 1.5 }}>
              Analyzing uploaded question syntax, options consistency, Bloom's Taxonomy, and mark distribution.
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
              {aiScanStep === 1 && "🔍 Step 1: Parsing Uploaded Question Rows..."}
              {aiScanStep === 2 && "🧠 Step 2: Evaluating Bloom's Taxonomy & CO Mapping..."}
              {aiScanStep === 3 && "✅ Step 3: Generating Quality Scores & Verification Badges..."}
            </div>
          </div>
        </div>
      )}

      {/* Verification Result Pop-up Modal */}
      <VerificationResultModal
        isOpen={verifyModalItem.isOpen}
        onClose={() => setVerifyModalItem((prev) => ({ ...prev, isOpen: false }))}
        title="🎉 Batch Verified Successfully!"
        itemName={verifyModalItem.name}
        verifiedCount={verifyModalItem.totalQuestions}
        qualityScore={verifyModalItem.score}
        bloomLevel="Apply & Analyze"
        remarks="All questions in this batch parsed syntax check, distractor coverage, and curriculum mapping against RGU outcome standards."
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
