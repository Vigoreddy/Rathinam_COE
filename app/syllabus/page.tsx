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
  ChevronUp,
  ChevronDown,
  Headphones,
  Info,
  School,
  SlidersHorizontal,
  FolderPlus,
  FileUp,
  Eye,
  Trash2,
  Plus,
  Clock,
  Layers,
  BookMarked,
  Download,
  Sparkles,
  Cpu,
  FileCode,
  Check,
  UploadCloud,
  X,
  RefreshCw,
} from "lucide-react";
import { parseSyllabusDocument, extractFileText, ParsedSyllabusResult } from "../lib/aiSyllabusParser";
import { examStore, SyllabusUnit, SubjectItem } from "../lib/examStore";
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

export default function SyllabusPage() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState("syllabus");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("AtoZ");
  const [expandedSubject, setExpandedSubject] = useState<string | null>("viscom-vfx");

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
    { id: "syllabus", label: "Syllabus", icon: FileText, hasArrow: true, route: "/syllabus" },
    { id: "question-bank", label: "Question Bank", icon: CheckSquare, route: "/question-bank" },
    { id: "bulk-upload", label: "Bulk Upload", icon: Upload, route: "/bulk-upload" },
    { id: "verify-questions", label: "Verify Questions", icon: Search, route: "/verify-questions" },
    { id: "approval", label: "Approval", icon: CheckSquare, route: "/approval" },
    { id: "reports", label: "Reports", icon: BarChart2, route: "/reports" },
    { id: "notifications", label: "Notifications", icon: Bell, route: "/notifications" },
    { id: "manual-questions", label: "Manual Questions", icon: Edit3, badge: "New", route: "/manual-questions" },
    { id: "settings", label: "Settings", icon: Settings, route: "/settings" },
  ];

  const menuItems = rawMenuItems.filter((item) =>
    hasPermission(currentUser.role, item.route, currentUser.isSubjectFaculty)
  );

  // Store state & Modals
  const [subjectsList, setSubjectsList] = useState<SubjectItem[]>([]);
  const [unitsList, setUnitsList] = useState<SyllabusUnit[]>([]);
  const [viewUnit, setViewUnit] = useState<SyllabusUnit | null>(null);
  const [editUnit, setEditUnit] = useState<SyllabusUnit | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [defaultAddSubject, setDefaultAddSubject] = useState("Viscom & VFX");
  const [deleteUnit, setDeleteUnit] = useState<SyllabusUnit | null>(null);
  const [toast, setToast] = useState<{ message: string; isOpen: boolean; type?: "success" | "danger" }>({
    message: "",
    isOpen: false,
  });

  const showToast = (message: string, type: "success" | "danger" = "success") => {
    setToast({ message, isOpen: true, type });
    setTimeout(() => setToast((prev) => ({ ...prev, isOpen: false })), 3000);
  };

  // AI Parser Modal States
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiStep, setAiStep] = useState<"upload" | "parsing" | "preview">("upload");
  const [parsingProgress, setParsingProgress] = useState(0);
  const [parsingLabel, setParsingLabel] = useState("");
  const [parsedData, setParsedData] = useState<ParsedSyllabusResult | null>(null);
  const [targetSubjectName, setTargetSubjectName] = useState("");
  const aiFileRef = React.useRef<HTMLInputElement>(null);

  const handleProcessAiFile = async (file: File) => {
    if (!file) return;
    setAiStep("parsing");
    setParsingProgress(15);
    setParsingLabel("Decompressing Word XML & reading document text...");

    try {
      const text = await extractFileText(file);

      setTimeout(() => {
        setParsingProgress(50);
        setParsingLabel("Extracting Course Outcomes (CO1 - CO5) & Units...");
      }, 300);

      setTimeout(() => {
        setParsingProgress(85);
        setParsingLabel("Mapping Sub-topics and CO correlations...");
      }, 600);

      setTimeout(() => {
        const result = parseSyllabusDocument(file.name, text);
        setParsedData(result);
        setTargetSubjectName(result.subjectName || subjectsList[0]?.name || "Viscom & VFX");
        setParsingProgress(100);
        setParsingLabel("AI Curriculum extraction complete!");
        setAiStep("preview");
      }, 900);
    } catch (err) {
      console.error("AI File extraction failed:", err);
      showToast("Error extracting text from document", "danger");
      setAiStep("upload");
    }
  };

  const handleConfirmAiImport = () => {
    if (!parsedData || parsedData.units.length === 0) return;

    const subjName = targetSubjectName.trim() || parsedData.subjectName || "Uploaded Subject";
    
    // Check if subject exists in store, if not, create it
    const existingSubj = subjectsList.find(
      (s) => s.name.toLowerCase() === subjName.toLowerCase()
    );
    if (!existingSubj) {
      examStore.saveSubject({
        name: subjName,
        code: parsedData.subjectCode || `SUB-${Math.floor(100 + Math.random() * 900)}`,
        department: parsedData.department || "General",
        semester: parsedData.semester || "Semester 1",
        status: "In Progress",
      });
    }

    // Save all extracted units
    parsedData.units.forEach((u) => {
      examStore.saveUnit({
        num: u.num,
        name: u.name,
        topics: u.topicsCount,
        docs: 1,
        subject: subjName,
        subtopics: u.subtopics,
        coMapping: u.coMapping,
      });
    });

    examStore.logActivity(
      `AI Imported syllabus document: ${parsedData.units.length} Units`,
      "Syllabus Management",
      subjName
    );

    showToast(`Successfully imported ${parsedData.units.length} syllabus units for ${subjName}!`);
    setIsAiModalOpen(false);
    setAiStep("upload");
    setParsedData(null);
  };

  const fileImportRef = React.useRef<HTMLInputElement>(null);
  const materialUploadRef = React.useRef<HTMLInputElement>(null);

  const handleImportSyllabusFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    examStore.saveUnit({
      num: `0${unitsList.length + 1}`,
      name: `Unit ${unitsList.length + 1} - Imported from ${file.name.replace(/\.[^/.]+$/, "")}`,
      topics: 4,
      docs: 1,
      subject: defaultAddSubject || "Viscom & VFX",
    });
    examStore.logActivity(`Imported syllabus: ${file.name}`, "Syllabus Management", defaultAddSubject);
    showToast(`Successfully imported syllabus units from ${file.name}!`);
    e.target.value = "";
  };

  const handleUploadMaterialFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    examStore.logActivity(`Uploaded study material: ${file.name}`, "Syllabus Management", defaultAddSubject);
    showToast(`Study material "${file.name}" uploaded successfully!`);
    e.target.value = "";
  };

  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>(() => examStore.getLastUpdated());

  useEffect(() => {
    const loadStoreData = () => {
      const subjs = examStore.getSubjects();
      setSubjectsList(subjs);
      setUnitsList(examStore.getUnits());
      setLastUpdatedTime(examStore.getLastUpdated());
      if (subjs.length > 0 && !defaultAddSubject) {
        setDefaultAddSubject(subjs[0].name);
      }
    };
    loadStoreData();
    examStore.syncFromSupabase().then(() => loadStoreData());
    window.addEventListener("exam-cell-store-update", loadStoreData);
    return () => window.removeEventListener("exam-cell-store-update", loadStoreData);
  }, []);

  const totalUnitsCount = unitsList.length;
  const totalTopicsCount = unitsList.reduce((acc, u) => acc + (Number(u.topics) || 0), 0);
  const totalDocsCount = unitsList.reduce((acc, u) => acc + (Number(u.docs) || 0), 0);
  const subjectsWithSyllabusCount = new Set(unitsList.map((u) => u.subject).filter(Boolean)).size;

  const handleCreateUnit = (values: Record<string, any>) => {
    const subjTarget = values.subject || defaultAddSubject || (subjectsList[0]?.name ?? "Viscom & VFX");
    examStore.saveUnit({
      num: values.num,
      name: values.name,
      topics: Number(values.topics || 3),
      docs: Number(values.docs || 0),
      subject: subjTarget,
    });
    examStore.logActivity(`Added syllabus unit: ${values.name}`, "Syllabus Management", subjTarget);
    showToast(`Unit "${values.name}" added successfully!`);
    setIsAddOpen(false);
  };

  const handleUpdateUnit = (values: Record<string, any>) => {
    if (!editUnit) return;
    const subjTarget = values.subject || editUnit.subject;
    examStore.saveUnit({
      id: editUnit.id,
      num: values.num,
      name: values.name,
      topics: Number(values.topics || editUnit.topics),
      docs: Number(values.docs || editUnit.docs),
      subject: subjTarget,
    });
    examStore.logActivity(`Updated syllabus unit: ${values.name}`, "Syllabus Management", subjTarget);
    showToast(`Unit "${values.name}" updated successfully!`);
    setEditUnit(null);
  };

  const handleDeleteUnit = () => {
    if (!deleteUnit) return;
    examStore.deleteUnit(deleteUnit.id);
    examStore.logActivity(`Deleted syllabus unit: ${deleteUnit.name}`, "Syllabus Management", deleteUnit.subject);
    showToast(`Unit "${deleteUnit.name}" deleted permanently.`, "danger");
    setDeleteUnit(null);
  };

  const handleExportSyllabus = () => {
    examStore.exportToCsv(
      "syllabus_curriculum",
      unitsList.map((u) => ({
        ID: u.id,
        UnitNumber: u.num,
        UnitTitle: u.name,
        Subject: u.subject,
        TopicsCount: u.topics,
        DocumentsCount: u.docs,
      }))
    );
    showToast("Exported syllabus curriculum to CSV!");
  };

  const subjectOptions =
    subjectsList.length > 0
      ? subjectsList.map((s) => ({ value: s.name, label: `${s.name} (${s.code})` }))
      : [
          { value: "Viscom & VFX", label: "Viscom & VFX" },
          { value: "Viscom", label: "Viscom" },
        ];

  const unitFormFields: FormFieldDef[] = [
    { key: "num", label: "Unit Number", placeholder: "e.g. 01 or Unit I", required: true },
    {
      key: "subject",
      label: "Subject",
      type: "select",
      options: subjectOptions,
      required: true,
    },
    { key: "name", label: "Unit Title", placeholder: "e.g. Unit I - Introduction to Visual Media", required: true, spanFull: true },
    { key: "topics", label: "Number of Topics", type: "number", placeholder: "3" },
    { key: "docs", label: "Documents / Reference Files", type: "number", placeholder: "1" },
  ];

  const filteredSubjects = subjectsList
    .filter((subj) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        subj.name.toLowerCase().includes(q) ||
        subj.code.toLowerCase().includes(q) ||
        (subj.department && subj.department.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      if (sortBy === "AtoZ") return a.name.localeCompare(b.name);
      if (sortBy === "ZtoA") return b.name.localeCompare(a.name);
      if (sortBy === "code") return a.code.localeCompare(b.code);
      return 0;
    });

  const colorPalettes = [
    { accent: "#6366f1", bgPill: "linear-gradient(135deg, #ede9fe, #ddd6fe)", textPill: "#6366f1", btnGrad: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)", shadow: "rgba(79, 70, 229, 0.3)" },
    { accent: "#0284c7", bgPill: "linear-gradient(135deg, #e0f2fe, #bae6fd)", textPill: "#0284c7", btnGrad: "linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)", shadow: "rgba(2, 132, 199, 0.3)" },
    { accent: "#10b981", bgPill: "linear-gradient(135deg, #d1fae5, #a7f3d0)", textPill: "#10b981", btnGrad: "linear-gradient(135deg, #059669 0%, #10b981 100%)", shadow: "rgba(16, 185, 129, 0.3)" },
    { accent: "#f59e0b", bgPill: "linear-gradient(135deg, #fef3c7, #fde68a)", textPill: "#d97706", btnGrad: "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)", shadow: "rgba(217, 119, 6, 0.3)" },
    { accent: "#ec4899", bgPill: "linear-gradient(135deg, #fce7f3, #fbcfe8)", textPill: "#db2777", btnGrad: "linear-gradient(135deg, #db2777 0%, #ec4899 100%)", shadow: "rgba(219, 39, 119, 0.3)" },
  ];


  return (
    <RoleGuard route="/syllabus">
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
        <PortalHeader activeRoute="syllabus" />


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
                Syllabus 📄
              </h1>
              <p style={{ fontSize: "13.5px", color: "#64748b", margin: 0 }}>
                Manage and view syllabus for all subjects.
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
              <div>
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
            {/* Metric 1: Total Subjects - 3D Blue with Floating Glow Book */}
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
                Total Subjects
              </div>
              <div style={{ fontSize: "32px", fontWeight: 800, lineHeight: 1, marginBottom: "6px", textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
                {subjectsWithSyllabusCount}
              </div>
              <div style={{ fontSize: "11.5px", opacity: 0.85 }}>With Syllabus</div>
            </div>

            {/* Metric 2: Total Units - 3D Cyan with Floating Glow FileText */}
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
                  <FileText
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
                Total Units
              </div>
              <div style={{ fontSize: "32px", fontWeight: 800, lineHeight: 1, marginBottom: "6px", textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
                {totalUnitsCount}
              </div>
              <div style={{ fontSize: "11.5px", opacity: 0.85 }}>Across All Subjects</div>
            </div>

            {/* Metric 3: Total Topics - 3D Emerald with Floating Glow CheckCircle */}
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
                Total Topics
              </div>
              <div style={{ fontSize: "32px", fontWeight: 800, lineHeight: 1, marginBottom: "6px", textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
                {totalTopicsCount}
              </div>
              <div style={{ fontSize: "11.5px", opacity: 0.85 }}>Across All Units</div>
            </div>

            {/* Metric 4: Total Documents - 3D Orange with Floating Glow FileText */}
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
                  <FileText
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
                Total Documents
              </div>
              <div style={{ fontSize: "32px", fontWeight: 800, lineHeight: 1, marginBottom: "6px", textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
                {totalDocsCount}
              </div>
              <div style={{ fontSize: "11.5px", opacity: 0.85 }}>Study Materials</div>
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
            {/* ================= LEFT WIDE COLUMN: All Syllabus ================= */}
            <div>
              {/* Section Header */}
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", marginBottom: "14px" }}>
                All Syllabus
              </div>

              {/* Filter / Search Bar */}
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "center",
                  marginBottom: "18px",
                }}
              >
                {/* Search Box */}
                <div style={{ position: "relative", flex: 1 }}>
                  <input
                    type="text"
                    placeholder="Search subjects..."
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
                  className="filter-btn-3d"
                >
                  <span>Filter</span>
                  <SlidersHorizontal size={14} />
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
                    <option value="AtoZ">Sort by: A to Z</option>
                    <option value="ZtoA">Sort by: Z to A</option>
                    <option value="newest">Sort by: Newest</option>
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
                  onClick={handleExportSyllabus}
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

                {/* AI Syllabus Upload Button */}
                <button
                  type="button"
                  onClick={() => {
                    setAiStep("upload");
                    setParsedData(null);
                    setIsAiModalOpen(true);
                  }}
                  className="filter-btn-3d"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "7px",
                    padding: "9px 16px",
                    borderRadius: "10px",
                    border: "1px solid rgba(99, 102, 241, 0.4)",
                    background: "linear-gradient(135deg, #ede9fe 0%, #e0e7ff 100%)",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#4f46e5",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(99, 102, 241, 0.15)",
                    transition: "all 0.25s ease",
                  }}
                >
                  <Sparkles size={15} color="#6366f1" />
                  <span>Upload Syllabus (AI)</span>
                </button>

                {/* Add Unit Button */}
                <button
                  type="button"
                  onClick={() => setIsAddOpen(true)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "9px 16px",
                    borderRadius: "10px",
                    border: "none",
                    background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
                    color: "#ffffff",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)",
                  }}
                >
                  <Plus size={15} />
                  <span>Add Unit</span>
                </button>
              </div>

              {/* Accordion List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {filteredSubjects.length === 0 ? (
                  <div
                    className="widget-card-3d"
                    style={{
                      padding: "40px 20px",
                      textAlign: "center",
                      color: "#64748b",
                    }}
                  >
                    <BookOpen size={36} color="#94a3b8" style={{ marginBottom: "12px", opacity: 0.7 }} />
                    <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b", margin: "0 0 6px 0" }}>
                      No Subjects Found
                    </h3>
                    <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
                      {subjectsList.length === 0
                        ? "No subjects added yet. Add a subject in the Subjects page to manage syllabus."
                        : "No subjects match your search criteria."}
                    </p>
                  </div>
                ) : (
                  filteredSubjects.map((subj, index) => {
                    const subjKey = subj.id || subj.code || subj.name;
                    const isExpanded = expandedSubject === subjKey || expandedSubject === subj.name || (expandedSubject === null && index === 0);
                    const palette = colorPalettes[index % colorPalettes.length];

                    const subjUnits = unitsList.filter((u) => {
                      if (!u.subject) return false;
                      const sName = u.subject.trim().toLowerCase();
                      const targetName = subj.name.trim().toLowerCase();
                      const targetCode = subj.code.trim().toLowerCase();
                      return sName === targetName || sName === targetCode;
                    });

                    const subjTopicsCount = subjUnits.reduce((acc, u) => acc + (Number(u.topics) || 0), 0);
                    const subjDocsCount = subjUnits.reduce((acc, u) => acc + (Number(u.docs) || 0), 0);

                    return (
                      <div
                        key={subjKey}
                        className="widget-card-3d"
                        style={{
                          padding: "22px 24px",
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        {/* Top Row */}
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
                                background: palette.accent,
                                boxShadow: `0 0 10px ${palette.accent}, 0 0 4px ${palette.accent}`,
                                display: "inline-block",
                              }}
                            />
                            <h3 style={{ fontSize: "16.5px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                              {subj.name}
                            </h3>
                            <span
                              className="badge-neon-3d"
                              style={{
                                fontSize: "11px",
                                fontWeight: 700,
                                color: "#15803d",
                                background: "#dcfce7",
                                padding: "3px 10px",
                                borderRadius: "10px",
                                border: "1px solid rgba(34, 197, 94, 0.3)",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#16a34a" }} />
                              {subj.status || "Active"}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setExpandedSubject(isExpanded ? "" : subjKey)
                            }
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              padding: "7px 16px",
                              borderRadius: "10px",
                              border: "1px solid #e2e8f0",
                              background: "#ffffff",
                              fontSize: "12.5px",
                              fontWeight: 700,
                              color: "#334155",
                              cursor: "pointer",
                              transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
                              boxShadow: "0 2px 5px rgba(0,0,0,0.04)",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "#f1f5f9";
                              e.currentTarget.style.transform = "translateX(2px)";
                              e.currentTarget.style.borderColor = palette.accent;
                              e.currentTarget.style.color = palette.textPill;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "#ffffff";
                              e.currentTarget.style.transform = "translateX(0)";
                              e.currentTarget.style.borderColor = "#e2e8f0";
                              e.currentTarget.style.color = "#334155";
                            }}
                          >
                            <span>View Details</span>
                            {isExpanded ? (
                              <ChevronUp size={14} />
                            ) : (
                              <ChevronDown size={14} />
                            )}
                          </button>
                        </div>

                        {/* Stats Row */}
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1.2fr 1.2fr 1.4fr 1.4fr",
                            gap: "14px",
                            marginBottom: isExpanded ? "20px" : "0",
                            padding: "12px 16px",
                            background: "#f8fafc",
                            borderRadius: "14px",
                            border: "1px solid rgba(226, 232, 240, 0.7)",
                          }}
                        >
                          <div>
                            <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "4px", fontWeight: 600 }}>
                              Subject Code
                            </div>
                            <div style={{ fontSize: "14.5px", fontWeight: 800, color: "#0f172a" }}>
                              {subj.code}
                            </div>
                          </div>

                          <div>
                            <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "4px", fontWeight: 600 }}>
                              Total Units
                            </div>
                            <div style={{ fontSize: "14.5px", fontWeight: 800, color: "#0f172a" }}>
                              {subjUnits.length}
                            </div>
                          </div>

                          <div>
                            <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "4px", fontWeight: 600 }}>
                              Total Topics
                            </div>
                            <div style={{ fontSize: "14.5px", fontWeight: 800, color: "#0f172a" }}>
                              {subjTopicsCount}
                            </div>
                          </div>

                          <div>
                            <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "4px", fontWeight: 600 }}>
                              Documents
                            </div>
                            <div style={{ fontSize: "14.5px", fontWeight: 800, color: "#0f172a" }}>
                              {subjDocsCount}
                            </div>
                          </div>
                        </div>

                        {/* Syllabus Structure Nested Box */}
                        {isExpanded && (
                          <div
                            style={{
                              background: "#f8fafc",
                              border: "1px solid #e2e8f0",
                              borderRadius: "16px",
                              padding: "18px 20px",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: "14px",
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: 800, color: "#1e293b" }}>
                                <div
                                  style={{
                                    width: "28px",
                                    height: "28px",
                                    borderRadius: "8px",
                                    background: palette.bgPill,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: palette.textPill,
                                    boxShadow: `0 2px 6px ${palette.shadow}`,
                                  }}
                                >
                                  <BookMarked size={16} />
                                </div>
                                <span>Syllabus Structure ({subj.name})</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setDefaultAddSubject(subj.name);
                                  setIsAddOpen(true);
                                }}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "5px",
                                  padding: "4px 10px",
                                  borderRadius: "8px",
                                  border: "none",
                                  background: palette.btnGrad,
                                  color: "#ffffff",
                                  fontSize: "11px",
                                  fontWeight: 600,
                                  cursor: "pointer",
                                  boxShadow: `0 2px 8px ${palette.shadow}`,
                                }}
                              >
                                <Plus size={13} />
                                <span>Add Unit</span>
                              </button>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                              {subjUnits.length === 0 ? (
                                <div style={{ padding: "20px", textAlign: "center", color: "#94a3b8", fontSize: "12.5px" }}>
                                  No syllabus units added yet for {subj.name}. Click "+ Add Unit" or "Upload Syllabus (AI)" to add one.
                                </div>
                              ) : (
                                subjUnits.map((u) => (
                                  <div key={u.id || u.num} className="unit-row-3d" style={{ flexDirection: "column", alignItems: "flex-start", gap: "10px", padding: "14px 18px" }}>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                                      <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0 }}>
                                        <span
                                          className="unit-pill-3d"
                                          style={{
                                            background: palette.bgPill,
                                            color: palette.textPill,
                                            boxShadow: `0 2px 6px ${palette.shadow}`,
                                          }}
                                        >
                                          {u.num}
                                        </span>
                                        <span style={{ fontSize: "13.5px", fontWeight: 700, color: "#1e293b" }}>
                                          {u.name}
                                        </span>
                                      </div>

                                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                        {u.coMapping && u.coMapping.length > 0 && (
                                          <div style={{ display: "flex", gap: "4px" }}>
                                            {u.coMapping.map((co) => (
                                              <span
                                                key={co}
                                                style={{
                                                  fontSize: "10px",
                                                  fontWeight: 800,
                                                  color: "#4f46e5",
                                                  background: "#e0e7ff",
                                                  padding: "2px 7px",
                                                  borderRadius: "6px",
                                                  border: "1px solid rgba(99, 102, 241, 0.3)",
                                                }}
                                              >
                                                {co}
                                              </span>
                                            ))}
                                          </div>
                                        )}
                                        <span style={{ fontSize: "11.5px", color: "#475569", fontWeight: 600 }}>
                                          {u.topics} Topics
                                        </span>
                                        <span
                                          style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "5px",
                                            fontSize: "11.5px",
                                            color: "#64748b",
                                            fontWeight: 600,
                                          }}
                                        >
                                          <FileText size={14} color={palette.accent} style={{ filter: `drop-shadow(0 0 3px ${palette.accent})` }} />
                                          {u.docs} Docs
                                        </span>
                                        <CrudActionButtons
                                          onView={() => setViewUnit(u)}
                                          onEdit={() => setEditUnit(u)}
                                          onDelete={() => setDeleteUnit(u)}
                                          viewTitle="View Unit Details"
                                          editTitle="Edit Unit"
                                          deleteTitle="Delete Unit"
                                          size={32}
                                        />
                                      </div>
                                    </div>

                                    {u.subtopics && u.subtopics.length > 0 && (
                                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", width: "100%", paddingLeft: "42px" }}>
                                        {u.subtopics.map((st, sIdx) => (
                                          <span
                                            key={sIdx}
                                            style={{
                                              fontSize: "11px",
                                              color: "#475569",
                                              background: "#f1f5f9",
                                              padding: "3px 10px",
                                              borderRadius: "8px",
                                              border: "1px solid #e2e8f0",
                                              fontWeight: 500,
                                            }}
                                          >
                                            • {st}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Table pagination note */}
              <div style={{ fontSize: "11.5px", color: "#94a3b8", marginTop: "16px" }}>
                Showing {filteredSubjects.length > 0 ? 1 : 0} to {filteredSubjects.length} of {subjectsList.length} subjects
              </div>
            </div>

            {/* ================= RIGHT COLUMN: Overview & Quick Actions ================= */}
            <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
              {/* Card 1: Syllabus Overview */}
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
                    marginBottom: "18px",
                  }}
                >
                  <span style={{ fontSize: "15.5px", fontWeight: 800, color: "#0f172a" }}>
                    Syllabus Overview
                  </span>
                  <button
                    type="button"
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
                    View Report
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 8px", borderRadius: "10px", background: "#f8fafc" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div className="action-mini-icon-purple" style={{ width: "30px", height: "30px" }}>
                        <BookOpen size={15} />
                      </div>
                      <span style={{ fontSize: "12.5px", color: "#334155", fontWeight: 600 }}>
                        Total Subjects
                      </span>
                    </div>
                    <strong style={{ fontSize: "14px", color: "#0f172a", fontWeight: 800 }}>{subjectsWithSyllabusCount}</strong>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 8px", borderRadius: "10px", background: "#f8fafc" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div className="action-mini-icon-blue" style={{ width: "30px", height: "30px" }}>
                        <FileText size={15} />
                      </div>
                      <span style={{ fontSize: "12.5px", color: "#334155", fontWeight: 600 }}>
                        Total Units
                      </span>
                    </div>
                    <strong style={{ fontSize: "14px", color: "#0f172a", fontWeight: 800 }}>{totalUnitsCount}</strong>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 8px", borderRadius: "10px", background: "#f8fafc" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div className="action-mini-icon-green" style={{ width: "30px", height: "30px" }}>
                        <Edit3 size={15} />
                      </div>
                      <span style={{ fontSize: "12.5px", color: "#334155", fontWeight: 600 }}>
                        Total Topics
                      </span>
                    </div>
                    <strong style={{ fontSize: "14px", color: "#0f172a", fontWeight: 800 }}>{totalTopicsCount}</strong>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 8px", borderRadius: "10px", background: "#f8fafc" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div className="action-mini-icon-orange" style={{ width: "30px", height: "30px" }}>
                        <FileText size={15} />
                      </div>
                      <span style={{ fontSize: "12.5px", color: "#334155", fontWeight: 600 }}>
                        Total Documents
                      </span>
                    </div>
                    <strong style={{ fontSize: "14px", color: "#0f172a", fontWeight: 800 }}>{totalDocsCount}</strong>
                  </div>

                  <div
                    style={{
                      borderTop: "1px solid #e2e8f0",
                      paddingTop: "12px",
                      marginTop: "4px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Clock size={15} color="#6366f1" style={{ filter: "drop-shadow(0 0 4px rgba(99, 102, 241, 0.4))" }} />
                      <span style={{ fontSize: "11.5px", color: "#64748b", fontWeight: 600 }}>Last Updated</span>
                    </div>
                    <span style={{ fontSize: "11.5px", color: "#0f172a", fontWeight: 700 }}>
                      {lastUpdatedTime || "Just now"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Quick Actions */}
              <div
                className="widget-card-3d"
                style={{
                  padding: "22px",
                }}
              >
                <div style={{ fontSize: "15.5px", fontWeight: 800, color: "#0f172a", marginBottom: "16px" }}>
                  Quick Actions
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {/* Action 1: Add New Syllabus */}
                  <div
                    className="quick-action-row-3d"
                    onClick={() => {
                      setDefaultAddSubject("Viscom & VFX");
                      setIsAddOpen(true);
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <div
                      className="quick-action-icon-3d"
                      style={{
                        background: "linear-gradient(135deg, #dbeafe, #bfdbfe)",
                        color: "#1d4ed8",
                        boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)",
                      }}
                    >
                      <FolderPlus size={18} style={{ filter: "drop-shadow(0 0 4px rgba(37, 99, 235, 0.4))" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ display: "block", fontSize: "12.5px", color: "#0f172a", fontWeight: 700 }}>
                        Add New Syllabus
                      </strong>
                      <span style={{ fontSize: "11px", color: "#64748b" }}>Create syllabus for a subject</span>
                    </div>
                    <ChevronRight size={16} color="#94a3b8" className="chevron-arrow-glow" />
                  </div>

                  {/* Action 2: Import Syllabus */}
                  <div
                    className="quick-action-row-3d"
                    onClick={() => fileImportRef.current?.click()}
                  >
                    <input
                      type="file"
                      ref={fileImportRef}
                      style={{ display: "none" }}
                      accept=".pdf,.doc,.docx,.csv"
                      onChange={handleImportSyllabusFile}
                    />
                    <div
                      className="quick-action-icon-3d"
                      style={{
                        background: "linear-gradient(135deg, #ede9fe, #ddd6fe)",
                        color: "#6d28d9",
                        boxShadow: "0 4px 12px rgba(109, 40, 217, 0.25)",
                      }}
                    >
                      <FileUp size={18} style={{ filter: "drop-shadow(0 0 4px rgba(109, 40, 217, 0.4))" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ display: "block", fontSize: "12.5px", color: "#0f172a", fontWeight: 700 }}>
                        Import Syllabus
                      </strong>
                      <span style={{ fontSize: "11px", color: "#64748b" }}>Import from PDF/Word/CSV</span>
                    </div>
                    <ChevronRight size={16} color="#94a3b8" className="chevron-arrow-glow" />
                  </div>

                  {/* Action 3: Upload Study Material */}
                  <div
                    className="quick-action-row-3d"
                    onClick={() => materialUploadRef.current?.click()}
                  >
                    <input
                      type="file"
                      ref={materialUploadRef}
                      style={{ display: "none" }}
                      accept=".pdf,.doc,.docx,.ppt,.pptx"
                      onChange={handleUploadMaterialFile}
                    />
                    <div
                      className="quick-action-icon-3d"
                      style={{
                        background: "linear-gradient(135deg, #ffedd5, #fed7aa)",
                        color: "#c2410c",
                        boxShadow: "0 4px 12px rgba(194, 65, 12, 0.25)",
                      }}
                    >
                      <Upload size={18} style={{ filter: "drop-shadow(0 0 4px rgba(194, 65, 12, 0.4))" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ display: "block", fontSize: "12.5px", color: "#0f172a", fontWeight: 700 }}>
                        Upload Study Material
                      </strong>
                      <span style={{ fontSize: "11px", color: "#64748b" }}>Add notes, PDFs, references</span>
                    </div>
                    <ChevronRight size={16} color="#94a3b8" className="chevron-arrow-glow" />
                  </div>

                  {/* Action 4: Syllabus Settings */}
                  <div
                    className="quick-action-row-3d"
                    onClick={() => router.push("/settings")}
                  >
                    <div
                      className="quick-action-icon-3d"
                      style={{
                        background: "linear-gradient(135deg, #fef3c7, #fde68a)",
                        color: "#b45309",
                        boxShadow: "0 4px 12px rgba(180, 83, 9, 0.25)",
                      }}
                    >
                      <Settings size={18} style={{ filter: "drop-shadow(0 0 4px rgba(180, 83, 9, 0.4))" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ display: "block", fontSize: "12.5px", color: "#0f172a", fontWeight: 700 }}>
                        Syllabus Settings
                      </strong>
                      <span style={{ fontSize: "11px", color: "#64748b" }}>Manage syllabus settings</span>
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
      {viewUnit && (
        <ViewModal
          isOpen={!!viewUnit}
          onClose={() => setViewUnit(null)}
          title={viewUnit.name}
          subtitle={`Subject: ${viewUnit.subject || "Viscom & VFX"}`}
          badge={{
            label: `Unit ${viewUnit.num}`,
            bg: "#e0e7ff",
            color: "#4338ca",
          }}
          fields={[
            { label: "Unit Title", value: viewUnit.name, spanFull: true },
            { label: "Unit Number", value: viewUnit.num },
            { label: "Subject", value: viewUnit.subject || "Viscom & VFX" },
            { label: "Topics Count", value: `${viewUnit.topics} Topics` },
            { label: "Document References", value: `${viewUnit.docs} Documents uploaded` },
          ]}
          onEdit={() => {
            setEditUnit(viewUnit);
            setViewUnit(null);
          }}
          onDelete={() => {
            setDeleteUnit(viewUnit);
            setViewUnit(null);
          }}
        />
      )}

      {/* Edit Modal */}
      {editUnit && (
        <FormModal
          isOpen={!!editUnit}
          onClose={() => setEditUnit(null)}
          title="Edit Syllabus Unit"
          subtitle={`Modifying ${editUnit.num} for ${editUnit.subject}`}
          fields={unitFormFields}
          initialValues={{
            num: editUnit.num,
            name: editUnit.name,
            subject: editUnit.subject || "Viscom & VFX",
            topics: editUnit.topics,
            docs: editUnit.docs,
          }}
          onSubmit={handleUpdateUnit}
          submitLabel="Save Changes"
        />
      )}

      {/* Add Modal */}
      <FormModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add New Syllabus Unit"
        subtitle="Create a new unit and topic structure"
        fields={unitFormFields}
        initialValues={{
          num: `0${unitsList.length + 1}`,
          name: "",
          subject: defaultAddSubject,
          topics: 3,
          docs: 1,
        }}
        onSubmit={handleCreateUnit}
        submitLabel="Create Unit"
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={!!deleteUnit}
        onClose={() => setDeleteUnit(null)}
        title="Delete Unit"
        itemName={deleteUnit ? `${deleteUnit.num} - ${deleteUnit.name}` : ""}
        onConfirm={handleDeleteUnit}
      />

      {/* Toast Notification */}
      <ToastNotification
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", isOpen: false })}
      />

      {/* ================================= AI SYLLABUS UPLOAD & PREVIEW MODAL ================================= */}
      {isAiModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            className="widget-card-3d"
            style={{
              width: "100%",
              maxWidth: "750px",
              maxHeight: "90vh",
              background: "#ffffff",
              borderRadius: "20px",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "20px 24px",
                background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: "rgba(99, 102, 241, 0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid rgba(99, 102, 241, 0.4)",
                  }}
                >
                  <Sparkles size={20} color="#818cf8" />
                </div>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 800, margin: 0, color: "#ffffff" }}>
                    AI Syllabus Document Parser
                  </h3>
                  <span style={{ fontSize: "11.5px", color: "#a5b4fc" }}>
                    Upload document & auto-extract Course Outcomes (COs), Units, and Subtopics
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAiModalOpen(false)}
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "none",
                  color: "#94a3b8",
                  borderRadius: "8px",
                  padding: "6px",
                  cursor: "pointer",
                  display: "flex",
                }}
              >
                <X size={18} color="#ffffff" />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: "24px", overflowY: "auto", flex: 1 }}>
              {/* STEP 1: Upload View */}
              {aiStep === "upload" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <input
                    type="file"
                    ref={aiFileRef}
                    accept=".txt,.pdf,.docx,.doc,.csv,.json"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleProcessAiFile(file);
                    }}
                  />

                  <div
                    onClick={() => aiFileRef.current?.click()}
                    style={{
                      border: "2px dashed #818cf8",
                      borderRadius: "16px",
                      padding: "36px 20px",
                      textAlign: "center",
                      background: "#f8fafc",
                      cursor: "pointer",
                      transition: "all 0.25s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#eff6ff";
                      e.currentTarget.style.borderColor = "#4f46e5";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#f8fafc";
                      e.currentTarget.style.borderColor = "#818cf8";
                    }}
                  >
                    <UploadCloud size={44} color="#6366f1" style={{ marginBottom: "12px", filter: "drop-shadow(0 4px 8px rgba(99, 102, 241, 0.25))" }} />
                    <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#1e293b", margin: "0 0 6px 0" }}>
                      Click or Drag & Drop Syllabus Document Here
                    </h4>
                    <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 14px 0" }}>
                      Supports Syllabus Documents: <strong>.pdf, .docx, .txt, .csv, .json</strong>
                    </p>
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#4f46e5",
                        background: "#e0e7ff",
                        padding: "7px 18px",
                        borderRadius: "10px",
                        display: "inline-block",
                      }}
                    >
                      Browse Syllabus File
                    </span>
                  </div>

                  {/* Preset / Sample Text Quick Test */}
                  <div
                    style={{
                      background: "#f1f5f9",
                      borderRadius: "14px",
                      padding: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <strong style={{ display: "block", fontSize: "12.5px", color: "#1e293b" }}>
                        Need a sample syllabus document format?
                      </strong>
                      <span style={{ fontSize: "11.5px", color: "#64748b" }}>
                        Test AI parsing instantly with sample Course Outcomes & Units document text
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const sampleText = `Subject: Data Structures and Algorithms
Course Code: CS201
Department: Computer Science
Semester: Semester 3

Course Outcomes:
CO1: Understand basic linear data structures including arrays, linked lists, stacks, and queues.
CO2: Analyze non-linear data structures such as trees, binary search trees, and heaps.
CO3: Apply graph algorithms including BFS, DFS, and shortest path calculations.
CO4: Evaluate hashing techniques and collision resolution strategies.

UNIT 1 - Introduction to Linear Data Structures [CO1]
1. Abstract Data Types (ADTs)
2. Arrays and Memory Representation
3. Stacks: Operations and Applications (Expression Evaluation)
4. Queues: Circular Queues and Double Ended Queues

UNIT 2 - Non-Linear Data Structures & Trees [CO2]
1. Binary Tree Traversals (Inorder, Preorder, Postorder)
2. Binary Search Trees (BST): Insertion and Deletion
3. AVL Trees and Height Balancing
4. Heap Structures & Priority Queues

UNIT 3 - Graph Algorithms & Traversal [CO3]
1. Graph Representation: Adjacency Matrix and List
2. Depth First Search (DFS) & Breadth First Search (BFS)
3. Minimum Spanning Trees: Kruskal and Prim Algorithms
4. Shortest Path: Dijkstra's Algorithm

UNIT 4 - Hashing & Sorting Techniques [CO4]
1. Hash Functions and Hash Tables
2. Collision Resolution: Chaining and Open Addressing
3. Advanced Sorting: Quick Sort, Merge Sort, and Heap Sort
`;
                        const sampleFile = new File([sampleText], "Sample_Syllabus_CS201.txt", { type: "text/plain" });
                        handleProcessAiFile(sampleFile);
                      }}
                      style={{
                        padding: "7px 14px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        background: "#ffffff",
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#334155",
                        cursor: "pointer",
                      }}
                    >
                      Load Sample Syllabus
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: AI Parsing Progress View */}
              {aiStep === "parsing" && (
                <div style={{ padding: "40px 20px", textAlign: "center" }}>
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #ede9fe, #ddd6fe)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 20px auto",
                      boxShadow: "0 0 20px rgba(99, 102, 241, 0.4)",
                    }}
                  >
                    <Cpu size={28} color="#6366f1" className="animate-spin" />
                  </div>
                  <h4 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: "0 0 8px 0" }}>
                    AI Parsing Syllabus Document...
                  </h4>
                  <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "20px" }}>
                    {parsingLabel}
                  </p>

                  <div
                    style={{
                      width: "100%",
                      height: "8px",
                      background: "#e2e8f0",
                      borderRadius: "4px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${parsingProgress}%`,
                        height: "100%",
                        background: "linear-gradient(90deg, #4f46e5, #06b6d4)",
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: AI Parsed Preview & Confirm Step */}
              {aiStep === "preview" && parsedData && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {/* Top Target Subject Selector */}
                  <div
                    style={{
                      background: "#f8fafc",
                      borderRadius: "14px",
                      padding: "16px 20px",
                      border: "1px solid #e2e8f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "16px",
                    }}
                  >
                    <div>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                        Target Subject
                      </span>
                      <h4 style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", margin: "2px 0 0 0" }}>
                        {targetSubjectName} ({parsedData.subjectCode})
                      </h4>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <label style={{ fontSize: "12px", fontWeight: 600, color: "#475569" }}>
                        Bind to Subject:
                      </label>
                      <select
                        value={targetSubjectName}
                        onChange={(e) => setTargetSubjectName(e.target.value)}
                        style={{
                          padding: "7px 12px",
                          borderRadius: "8px",
                          border: "1px solid #cbd5e1",
                          fontSize: "12.5px",
                          fontWeight: 700,
                          color: "#1e293b",
                          background: "#ffffff",
                        }}
                      >
                        {subjectsList.map((s) => (
                          <option key={s.id || s.code} value={s.name}>
                            {s.name} ({s.code})
                          </option>
                        ))}
                        <option value={parsedData.subjectName}>+ Create New: {parsedData.subjectName}</option>
                      </select>
                    </div>
                  </div>

                  {/* Course Outcomes (COs) Badges */}
                  <div>
                    <h5 style={{ fontSize: "13px", fontWeight: 800, color: "#1e293b", marginBottom: "8px" }}>
                      Extracted Course Outcomes ({parsedData.courseOutcomes.length} COs)
                    </h5>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                      {parsedData.courseOutcomes.map((co) => (
                        <div
                          key={co.code}
                          style={{
                            padding: "8px 12px",
                            background: "#e0e7ff",
                            borderRadius: "8px",
                            border: "1px solid rgba(99, 102, 241, 0.3)",
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "8px",
                          }}
                        >
                          <span style={{ fontSize: "11px", fontWeight: 800, color: "#4338ca", background: "#ffffff", padding: "2px 6px", borderRadius: "4px" }}>
                            {co.code}
                          </span>
                          <span style={{ fontSize: "11.5px", color: "#312e81", lineHeight: "1.3" }}>
                            {co.description}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Parsed Units Breakdown */}
                  <div>
                    <h5 style={{ fontSize: "13px", fontWeight: 800, color: "#1e293b", marginBottom: "10px" }}>
                      Parsed Syllabus Units ({parsedData.units.length} Units)
                    </h5>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {parsedData.units.map((u) => (
                        <div
                          key={u.id}
                          style={{
                            padding: "14px 16px",
                            background: "#ffffff",
                            border: "1px solid #e2e8f0",
                            borderRadius: "12px",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <span style={{ fontSize: "11px", fontWeight: 800, color: "#0284c7", background: "#e0f2fe", padding: "3px 8px", borderRadius: "6px" }}>
                                {u.num}
                              </span>
                              <strong style={{ fontSize: "13.5px", color: "#0f172a" }}>
                                {u.name}
                              </strong>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              {u.coMapping.map((co) => (
                                <span key={co} style={{ fontSize: "10px", fontWeight: 800, color: "#16a34a", background: "#dcfce7", padding: "2px 6px", borderRadius: "4px" }}>
                                  {co}
                                </span>
                              ))}
                            </div>
                          </div>

                          {u.subtopics.length > 0 && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "6px" }}>
                              {u.subtopics.map((st, idx) => (
                                <span key={idx} style={{ fontSize: "11px", color: "#475569", background: "#f1f5f9", padding: "2px 8px", borderRadius: "6px" }}>
                                  • {st}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: "16px 24px",
                background: "#f8fafc",
                borderTop: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <button
                type="button"
                onClick={() => setIsAiModalOpen(false)}
                style={{
                  padding: "9px 18px",
                  borderRadius: "10px",
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#475569",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>

              {aiStep === "preview" && (
                <button
                  type="button"
                  onClick={handleConfirmAiImport}
                  style={{
                    padding: "9px 20px",
                    borderRadius: "10px",
                    border: "none",
                    background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
                    color: "#ffffff",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Check size={16} />
                  <span>Confirm & Import Syllabus ({parsedData?.units.length} Units)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
    </RoleGuard>
  );
}
