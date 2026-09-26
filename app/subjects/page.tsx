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
  Layers,
  ChevronRight,
  Headphones,
  Info,
  School,
  Bookmark,
  Filter,
  ChevronDown,
  Globe,
  PlusCircle,
  FileSpreadsheet,
  SlidersHorizontal,
  FolderPlus,
  FileUp,
  Eye,
  Trash2,
  Plus,
  Download,
} from "lucide-react";
import { examStore, SubjectItem } from "../lib/examStore";
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

export default function SubjectsPage() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState("subjects");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);

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
    { id: "subjects", label: "Subjects", icon: BookOpen, hasArrow: true, route: "/subjects" },
    { id: "syllabus", label: "Syllabus", icon: FileText, route: "/syllabus" },
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
  const [viewSubject, setViewSubject] = useState<SubjectItem | null>(null);
  const [editSubject, setEditSubject] = useState<SubjectItem | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteSubject, setDeleteSubject] = useState<SubjectItem | null>(null);
  const [toast, setToast] = useState<{ message: string; isOpen: boolean; type?: "success" | "danger" }>({
    message: "",
    isOpen: false,
  });

  const showToast = (message: string, type: "success" | "danger" = "success") => {
    setToast({ message, isOpen: true, type });
    setTimeout(() => setToast((prev) => ({ ...prev, isOpen: false })), 3000);
  };

  useEffect(() => {
    const loadSubjects = () => {
      setSubjectsList(examStore.getSubjects());
    };
    loadSubjects();
    window.addEventListener("exam-cell-store-update", loadSubjects);
    return () => window.removeEventListener("exam-cell-store-update", loadSubjects);
  }, []);

  const [selectedSchool, setSelectedSchool] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  // COE Bulk Add Modal State
  const [isBulkAddOpen, setIsBulkAddOpen] = useState(false);
  const [bulkActiveTab, setBulkActiveTab] = useState<"rows" | "preset" | "csv">("rows");
  const [bulkSelectedSchool, setBulkSelectedSchool] = useState("School of Media & Arts");
  const [bulkSelectedDepartment, setBulkSelectedDepartment] = useState("Visual Communication");
  const [bulkSelectedSemester, setBulkSelectedSemester] = useState("Semester 1");
  const [bulkAddRows, setBulkAddRows] = useState<{ name: string; code: string; credits: number }[]>([
    { name: "", code: "", credits: 3 },
    { name: "", code: "", credits: 4 },
  ]);
  const [bulkRawText, setBulkRawText] = useState("");

  const handleOpenBulkAdd = () => {
    if (currentUser.role !== "COE") {
      showToast("Access Restricted: Only Controller of Examinations (COE) role can perform Bulk Subject Add!", "danger");
      return;
    }
    setIsBulkAddOpen(true);
  };

  const handleLoadPresetPack = () => {
    let presetRows: { name: string; code: string; credits: number }[] = [];
    if (bulkSelectedDepartment === "Computer Science" || bulkSelectedSchool.includes("Computer")) {
      presetRows = [
        { name: "Data Structures & Algorithms", code: "24CS301", credits: 4 },
        { name: "Database Management Systems", code: "24CS302", credits: 4 },
        { name: "Computer Networks", code: "24CS303", credits: 3 },
        { name: "Operating Systems", code: "24CS304", credits: 4 },
        { name: "Artificial Intelligence Basics", code: "24CS305", credits: 3 },
      ];
    } else if (bulkSelectedDepartment === "Information Technology") {
      presetRows = [
        { name: "Web Application Development", code: "24IT301", credits: 4 },
        { name: "Cloud Computing Architectures", code: "24IT302", credits: 4 },
        { name: "Cyber Security Fundamentals", code: "24IT303", credits: 3 },
        { name: "DevOps & CI/CD Pipelines", code: "24IT304", credits: 3 },
        { name: "Mobile App Development Lab", code: "24IT305", credits: 2 },
      ];
    } else if (bulkSelectedDepartment.includes("Visual") || bulkSelectedDepartment.includes("Film")) {
      presetRows = [
        { name: "3D Digital Modeling & Sculpting", code: "24VFX301", credits: 4 },
        { name: "Motion Graphics & Visual Effects", code: "24VFX302", credits: 4 },
        { name: "Audio-Visual Production", code: "24VFX303", credits: 3 },
        { name: "Media Ethics & Copyright Law", code: "24VFX304", credits: 3 },
        { name: "Portfolio & Showreel Workshop", code: "24VFX305", credits: 2 },
      ];
    } else {
      presetRows = [
        { name: "Core Discipline Paper I", code: "24SUB101", credits: 4 },
        { name: "Core Discipline Paper II", code: "24SUB102", credits: 4 },
        { name: "Applied Practical & Lab", code: "24SUB103", credits: 2 },
        { name: "Department Elective Paper", code: "24SUB104", credits: 3 },
        { name: "Research Methodology", code: "24SUB105", credits: 3 },
      ];
    }
    setBulkAddRows(presetRows);
    setBulkActiveTab("rows");
    showToast(`Loaded 5 sample subjects for ${bulkSelectedDepartment}!`);
  };

  const handleSubmitBulkAdd = () => {
    let itemsToCreate: { name: string; code: string; credits: number; school: string; department: string; semester: string }[] = [];

    if (bulkActiveTab === "rows" || bulkActiveTab === "preset") {
      const validRows = bulkAddRows.filter((r) => r.name.trim().length > 0);
      if (validRows.length === 0) {
        showToast("Please enter at least one subject name in the rows.", "danger");
        return;
      }
      itemsToCreate = validRows.map((r, i) => ({
        name: r.name.trim(),
        code: r.code.trim() || `SUB-${100 + i}`,
        credits: Number(r.credits || 3),
        school: bulkSelectedSchool,
        department: bulkSelectedDepartment,
        semester: bulkSelectedSemester,
      }));
    } else if (bulkActiveTab === "csv") {
      if (!bulkRawText.trim()) {
        showToast("Please paste CSV/text lines before submitting.", "danger");
        return;
      }
      const lines = bulkRawText.split("\n").map((l) => l.trim()).filter(Boolean);
      itemsToCreate = lines.map((line, i) => {
        const parts = line.split(",").map((p) => p.trim());
        if (parts.length >= 2) {
          return {
            code: parts[0],
            name: parts[1],
            credits: Number(parts[2] || 3),
            school: bulkSelectedSchool,
            department: bulkSelectedDepartment,
            semester: bulkSelectedSemester,
          };
        }
        return {
          code: `SUB-${100 + i}`,
          name: line,
          credits: 3,
          school: bulkSelectedSchool,
          department: bulkSelectedDepartment,
          semester: bulkSelectedSemester,
        };
      });
    }

    if (itemsToCreate.length > 0) {
      examStore.saveBulkSubjects(itemsToCreate);
      showToast(`Successfully bulk added ${itemsToCreate.length} subjects to ${bulkSelectedDepartment} under ${bulkSelectedSchool}!`);
      setIsBulkAddOpen(false);
      setBulkAddRows([{ name: "", code: "", credits: 3 }]);
      setBulkRawText("");
    }
  };

  const handleCreateSubject = (values: Record<string, any>) => {
    examStore.saveSubject({
      name: values.name,
      code: values.code,
      credits: values.credits !== undefined ? Number(values.credits) : 3,
      totalQuestions: values.totalQuestions !== undefined ? Number(values.totalQuestions) : 0,
      status: values.status || "In Progress",
      school: values.school || "School of Media & Arts",
      department: values.department || "Visual Communication",
      semester: values.semester || "Semester 1",
    });
    showToast(`Subject "${values.name}" created successfully!`);
    setIsAddOpen(false);
  };

  const handleUpdateSubject = (values: Record<string, any>) => {
    if (!editSubject) return;
    examStore.saveSubject({
      id: editSubject.id,
      name: values.name,
      code: values.code,
      credits: values.credits !== undefined ? Number(values.credits) : editSubject.credits,
      totalQuestions: values.totalQuestions !== undefined ? Number(values.totalQuestions) : editSubject.totalQuestions,
      status: values.status || editSubject.status,
      school: values.school || editSubject.school || "School of Media & Arts",
      department: values.department || editSubject.department,
      semester: values.semester || editSubject.semester,
    });
    showToast(`Subject "${values.name}" updated successfully!`);
    setEditSubject(null);
  };

  const handleDeleteSubject = () => {
    if (!deleteSubject) return;
    examStore.deleteSubject(deleteSubject.id);
    showToast(`Subject "${deleteSubject.name}" deleted permanently.`, "danger");
    setDeleteSubject(null);
  };

  const handleExportSubjects = () => {
    examStore.exportToCsv(
      "subjects_list",
      subjectsList.map((s) => ({
        ID: s.id,
        Name: s.name,
        Code: s.code,
        School: s.school || "School of Media & Arts",
        Department: s.department || "Visual Communication",
        Semester: s.semester || "Semester 1",
        Credits: s.credits || 3,
        TotalQuestions: s.totalQuestions || s.total || 0,
        Status: s.status,
      }))
    );
    showToast("Exported subjects to CSV successfully!");
  };

  const handleDownloadSubjectTemplate = () => {
    examStore.exportToCsv("sample_subjects_template", [
      {
        Name: "Advanced Computer Graphics",
        Code: "24VFX301",
        School: "School of Media & Arts",
        Department: "Visual Communication",
        Semester: "Semester 5",
        Credits: 4,
        TotalQuestions: 100,
        Status: "In Progress",
      },
    ]);
    showToast("Downloaded sample subject template!");
  };

  const subjectFormFields: FormFieldDef[] = [
    {
      key: "school",
      label: "School / Faculty",
      type: "select",
      options: [
        { value: "School of Media & Arts", label: "School of Media & Arts" },
        { value: "School of Computer Science & IT", label: "School of Computer Science & IT" },
        { value: "School of Engineering", label: "School of Engineering" },
        { value: "School of Management & Commerce", label: "School of Management & Commerce" },
        { value: "School of Sciences & Humanities", label: "School of Sciences & Humanities" },
      ],
    },
    {
      key: "department",
      label: "Department",
      type: "select",
      options: [
        { value: "Visual Communication", label: "Visual Communication" },
        { value: "Visual Arts & VFX", label: "Visual Arts & VFX" },
        { value: "Film & Media", label: "Film & Media" },
        { value: "Computer Science", label: "Computer Science" },
        { value: "Information Technology", label: "Information Technology" },
        { value: "Electrical & Electronics", label: "Electrical & Electronics" },
        { value: "Mechanical Engineering", label: "Mechanical Engineering" },
        { value: "Management Studies", label: "Management Studies" },
        { value: "General", label: "General" },
      ],
    },
    {
      key: "semester",
      label: "Semester",
      type: "select",
      options: [
        { value: "Semester 0", label: "Semester 0" },
        { value: "Semester 1", label: "Semester 1" },
        { value: "Semester 2", label: "Semester 2" },
        { value: "Semester 3", label: "Semester 3" },
        { value: "Semester 4", label: "Semester 4" },
        { value: "Semester 5", label: "Semester 5" },
        { value: "Semester 6", label: "Semester 6" },
        { value: "Semester 7", label: "Semester 7" },
        { value: "Semester 8", label: "Semester 8" },
      ],
    },
    { key: "name", label: "Subject Name", placeholder: "e.g. Visual Communication", required: true, spanFull: true },
    { key: "code", label: "Subject Code", placeholder: "e.g. 24VFX101", required: true },
    { key: "credits", label: "Credits", type: "number", placeholder: "e.g. 4" },
    { key: "totalQuestions", label: "Total Questions", type: "number", placeholder: "0" },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "In Progress", label: "In Progress" },
        { value: "Completed", label: "Completed" },
        { value: "Pending", label: "Pending" },
        { value: "Not Started", label: "Not Started" },
      ],
    },
  ];

  const filteredSubjects = subjectsList.filter((sub) => {
    const matchesSearch =
      sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.code.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all"
        ? true
        : selectedCategory === "inprogress"
        ? sub.status === "In Progress"
        : selectedCategory === "completed"
        ? sub.status === "Completed"
        : selectedCategory === "notstarted"
        ? sub.status === "Not Started"
        : true;

    const matchesSchool =
      selectedSchool === "all" ? true : (sub.school || "School of Media & Arts") === selectedSchool;

    const matchesDepartment =
      selectedDepartment === "all" ? true : (sub.department || "Visual Communication") === selectedDepartment;

    return matchesSearch && matchesCategory && matchesSchool && matchesDepartment;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedSchool, selectedDepartment, sortBy]);

  const itemsPerPage = 4;
  const totalPages = Math.max(1, Math.ceil(filteredSubjects.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedSubjects = filteredSubjects.slice(startIndex, startIndex + itemsPerPage);

  const totalSubjectsCount = subjectsList.length;
  const activeSubjectsCount = subjectsList.filter((s) => s.status === "In Progress").length;
  const completedSubjectsCount = subjectsList.filter((s) => s.status === "Completed").length;
  const notStartedSubjectsCount = subjectsList.filter((s) => s.status === "Not Started").length;
  const totalCreditsCount = subjectsList.reduce((acc, s) => acc + (Number(s.credits) || 3), 0);
  const totalQuestionsCount = subjectsList.reduce((acc, s) => acc + (Number(s.totalQuestions) || 0), 0);


  return (
    <RoleGuard route="/subjects">
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
          {/* RGU Logo with 3D ambient glow */}
          <div style={{ padding: "6px 10px 24px 10px", position: "relative" }}>
            <img
              src="/images/rgu-logo.png"
              alt="Rathinam Global University"
              style={{
                maxHeight: "38px",
                width: "auto",
                objectFit: "contain",
                filter: "drop-shadow(0 0 12px rgba(99, 102, 241, 0.35))",
                transition: "filter 0.3s ease",
              }}
            />
          </div>

          {/* Navigation Items with 3D Glow Icons and Animations */}
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
                  <span className="nav-icon-3d" style={{ display: "flex", alignItems: "center" }}>
                    <IconComp size={18} />
                  </span>
                  <span style={{ flex: 1 }}>{item.label}</span>

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
                        transition: "transform 0.2s ease",
                        filter: "drop-shadow(0 0 4px rgba(255,255,255,0.6))",
                      }}
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* 3D Need Help Box with Floating Glowing Shield */}
        <div className="support-card-3d">
          <div className="shield-icon-3d">
            <Shield size={20} />
          </div>
          <strong style={{ display: "block", color: "#ffffff", fontSize: "13.5px", marginBottom: "4px" }}>
            Need Help?
          </strong>
          <p style={{ fontSize: "11.5px", color: "#94a3b8", lineHeight: 1.4, margin: "0 0 14px 0" }}>
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
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(99, 102, 241, 0.25)";
              e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.5)";
              e.currentTarget.style.boxShadow = "0 0 15px rgba(99, 102, 241, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.2)";
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
        <PortalHeader activeRoute="subjects" />


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
                  fontSize: "24px",
                  fontWeight: 800,
                  color: "#0f172a",
                  margin: "0 0 6px 0",
                  letterSpacing: "-0.4px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                Subjects 📒
              </h1>
              <p style={{ fontSize: "13.5px", color: "#64748b", margin: 0 }}>
                Manage and view all subjects in your examination workspace.
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
                <strong style={{ display: "block", fontSize: "12.5px", color: "#0f172a", whiteSpace: "nowrap" }}>
                  Rathinam Global (Deemed to be University)
                </strong>
                <span style={{ fontSize: "11px", color: "#64748b", whiteSpace: "nowrap" }}>Coimbatore, Tamil Nadu</span>
              </div>
            </div>
          </div>

          {/* ================= Top 4 3D Metric Stat Cards with 3D Glow Icons ================= */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "18px",
              marginBottom: "28px",
            }}
          >
            {/* Metric 1: Total Subjects - 3D Blue/Indigo with Floating Glow Book */}
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
                      filter: "drop-shadow(0 0 8px rgba(255,255,255,0.9)) drop-shadow(0 0 14px rgba(96, 165, 250, 0.8))",
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
                {totalSubjectsCount}
              </div>
              <div style={{ fontSize: "11.5px", opacity: 0.85 }}>Assigned to You</div>
            </div>

            {/* Metric 2: Active Subjects - 3D Cyan with Floating Glow Layers */}
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
                  <Layers
                    size={23}
                    color="#ffffff"
                    style={{
                      filter: "drop-shadow(0 0 8px rgba(255,255,255,0.9)) drop-shadow(0 0 14px rgba(56, 189, 248, 0.8))",
                    }}
                  />
                </div>
                <div className="stat-arrow-btn-3d">
                  <ArrowRight size={14} color="#ffffff" />
                </div>
              </div>
              <div style={{ fontSize: "12px", opacity: 0.9, marginBottom: "4px", fontWeight: 500 }}>
                Active Subjects
              </div>
              <div style={{ fontSize: "32px", fontWeight: 800, lineHeight: 1, marginBottom: "6px", textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
                {activeSubjectsCount}
              </div>
              <div style={{ fontSize: "11.5px", opacity: 0.85 }}>Currently Active</div>
            </div>

            {/* Metric 3: Completed Subjects - 3D Emerald with Floating Glow Check */}
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
                Completed Subjects
              </div>
              <div style={{ fontSize: "32px", fontWeight: 800, lineHeight: 1, marginBottom: "6px", textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
                {completedSubjectsCount}
              </div>
              <div style={{ fontSize: "11.5px", opacity: 0.85 }}>All Completed</div>
            </div>

            {/* Metric 4: Total Credits - 3D Orange with Floating Glow Bookmark */}
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
                  <Bookmark
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
                Total Credits
              </div>
              <div style={{ fontSize: "32px", fontWeight: 800, lineHeight: 1, marginBottom: "6px", textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
                {totalQuestionsCount}
              </div>
              <div style={{ fontSize: "11.5px", opacity: 0.85 }}>Across All Subjects</div>
            </div>
          </div>

          {/* ================= Main Content Container (Full Width) ================= */}
          <div style={{ width: "100%" }}>
            {/* ================= All Subjects ================= */}
            <div>
              {/* Header Title */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
                  All Subjects
                </div>
              </div>

              {/* Filter / Search Bar */}
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                  marginBottom: "14px",
                  flexWrap: "wrap",
                }}
              >
                {/* Search Box */}
                <div style={{ position: "relative", flex: 1, minWidth: "180px" }}>
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

                {/* Status Filter Dropdown */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{
                    padding: "9px 12px",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    background: "#ffffff",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    color: "#334155",
                    cursor: "pointer",
                    outline: "none",
                    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.02)",
                  }}
                >
                  <option value="all">Status: All Statuses</option>
                  <option value="inprogress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="notstarted">Not Started</option>
                </select>

                {/* School Filter Dropdown */}
                <select
                  value={selectedSchool}
                  onChange={(e) => setSelectedSchool(e.target.value)}
                  style={{
                    padding: "9px 12px",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    background: "#ffffff",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    color: "#334155",
                    cursor: "pointer",
                    outline: "none",
                    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.02)",
                  }}
                >
                  <option value="all">School: All Schools</option>
                  <option value="School of Media & Arts">School of Media & Arts</option>
                  <option value="School of Computer Science & IT">School of Computer Science & IT</option>
                  <option value="School of Engineering">School of Engineering</option>
                  <option value="School of Management & Commerce">School of Management & Commerce</option>
                  <option value="School of Sciences & Humanities">School of Sciences & Humanities</option>
                </select>

                {/* Department Filter Dropdown */}
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  style={{
                    padding: "9px 12px",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    background: "#ffffff",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    color: "#334155",
                    cursor: "pointer",
                    outline: "none",
                    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.02)",
                  }}
                >
                  <option value="all">Department: All Departments</option>
                  <option value="Visual Communication">Visual Communication</option>
                  <option value="Visual Arts & VFX">Visual Arts & VFX</option>
                  <option value="Film & Media">Film & Media</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electrical & Electronics">Electrical & Electronics</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Management Studies">Management Studies</option>
                  <option value="General">General</option>
                </select>

                {/* Sort By Dropdown */}
                <div style={{ position: "relative" }}>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{
                      padding: "9px 30px 9px 12px",
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0",
                      background: "#ffffff",
                      fontSize: "12.5px",
                      fontWeight: 600,
                      color: "#475569",
                      cursor: "pointer",
                      appearance: "none",
                      outline: "none",
                    }}
                  >
                    <option value="newest">Sort: Newest</option>
                    <option value="name">Sort: Name</option>
                    <option value="code">Sort: Code</option>
                  </select>
                  <ChevronDown
                    size={14}
                    color="#64748b"
                    style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                  />
                </div>

                {/* Primary Add Subject Button */}
                <button
                  type="button"
                  onClick={() => setIsAddOpen(true)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "9px 15px",
                    borderRadius: "10px",
                    border: "none",
                    background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
                    color: "#ffffff",
                    fontSize: "12.5px",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(79, 70, 229, 0.35)",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Plus size={15} />
                  <span>Manual Add</span>
                </button>

                {/* COE Bulk Add Subjects Button (COE Exclusive) */}
                {currentUser.role === "COE" && (
                  <button
                    type="button"
                    onClick={handleOpenBulkAdd}
                    title="COE Bulk Add Subjects Authorized"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "9px 16px",
                      borderRadius: "10px",
                      border: "1px solid #a7f3d0",
                      background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
                      color: "#ffffff",
                      fontSize: "12.5px",
                      fontWeight: 700,
                      cursor: "pointer",
                      boxShadow: "0 4px 14px rgba(16, 185, 129, 0.35)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <Shield size={15} color="#ffffff" />
                    <span>COE Bulk Subject Add</span>
                  </button>
                )}
              </div>

              {/* Subject Cards List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {paginatedSubjects.map((sub) => (
                  <div
                    key={sub.id}
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
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <span
                          style={{
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            background: sub.dotColor || "#6366f1",
                            boxShadow: `0 0 10px ${sub.dotColor || "#6366f1"}, 0 0 4px ${sub.dotColor || "#6366f1"}`,
                            display: "inline-block",
                          }}
                        />
                        <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                          {sub.name}
                        </h3>
                        <span
                          style={{
                            fontSize: "10.5px",
                            fontWeight: 700,
                            color: "#4f46e5",
                            background: "#eef2ff",
                            padding: "2px 8px",
                            borderRadius: "6px",
                            border: "1px solid #c7d2fe",
                          }}
                        >
                          {sub.code}
                        </span>
                        <span
                          style={{
                            fontSize: "10.5px",
                            fontWeight: 600,
                            color: "#6d28d9",
                            background: "#f3e8ff",
                            padding: "2px 8px",
                            borderRadius: "6px",
                            border: "1px solid #e9d5ff",
                          }}
                        >
                          {sub.school || "School of Media & Arts"}
                        </span>
                        <span
                          style={{
                            fontSize: "10.5px",
                            fontWeight: 600,
                            color: "#0284c7",
                            background: "#e0f2fe",
                            padding: "2px 8px",
                            borderRadius: "6px",
                            border: "1px solid #bae6fd",
                          }}
                        >
                          {sub.department || "Visual Communication"}
                        </span>
                        <span
                          style={{
                            fontSize: "10.5px",
                            fontWeight: 600,
                            color: "#475569",
                            background: "#f1f5f9",
                            padding: "2px 8px",
                            borderRadius: "6px",
                          }}
                        >
                          {sub.semester || "Semester 1"}
                        </span>
                        <span
                          className="badge-neon-3d"
                          style={{
                            fontSize: "10.5px",
                            fontWeight: 700,
                            color: sub.status === "Completed" ? "#15803d" : sub.status === "Not Started" ? "#475569" : "#1d4ed8",
                            background: sub.status === "Completed" ? "#dcfce7" : sub.status === "Not Started" ? "#f1f5f9" : "#dbeafe",
                            padding: "2px 8px",
                            borderRadius: "8px",
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
                              background: sub.status === "Completed" ? "#16a34a" : sub.status === "Not Started" ? "#64748b" : "#2563eb",
                            }}
                          />
                          {sub.status}
                        </span>
                      </div>

                      {/* Right Action Icons (View, Edit, Delete) */}
                      <CrudActionButtons
                        onView={() => setViewSubject(sub)}
                        onEdit={() => setEditSubject(sub)}
                        onDelete={() => setDeleteSubject(sub)}
                        viewTitle="View Subject Details"
                        editTitle="Edit Subject"
                        deleteTitle="Delete Subject"
                        size={34}
                      />
                    </div>

                    {/* Action Cards Row (4 3D Mini Glowing Cards) */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gap: "12px",
                      }}
                    >
                      {/* Mini Card 1: View Contents */}
                      <div
                        className="action-mini-card-3d"
                        onClick={() => setViewSubject(sub)}
                        style={{
                          background: "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)",
                          border: "1px solid rgba(192, 132, 252, 0.3)",
                          cursor: "pointer",
                        }}
                      >
                        <div className="action-mini-icon-purple">
                          <Globe size={18} style={{ filter: "drop-shadow(0 0 4px rgba(255,255,255,0.8))" }} />
                        </div>
                        <div>
                          <strong style={{ display: "block", fontSize: "12.5px", color: "#581c87", fontWeight: 700 }}>
                            View Contents
                          </strong>
                          <span style={{ fontSize: "10.5px", color: "#7e22ce" }}>
                            Explore units & topics
                          </span>
                        </div>
                      </div>

                      {/* Mini Card 2: Add Questions */}
                      <div
                        className="action-mini-card-3d"
                        onClick={() => router.push("/manual-questions")}
                        style={{
                          background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
                          border: "1px solid rgba(147, 197, 253, 0.35)",
                          cursor: "pointer",
                        }}
                      >
                        <div className="action-mini-icon-blue">
                          <PlusCircle size={18} style={{ filter: "drop-shadow(0 0 4px rgba(255,255,255,0.8))" }} />
                        </div>
                        <div>
                          <strong style={{ display: "block", fontSize: "12.5px", color: "#1e40af", fontWeight: 700 }}>
                            Add Questions
                          </strong>
                          <span style={{ fontSize: "10.5px", color: "#2563eb" }}>
                            Manually add questions
                          </span>
                        </div>
                      </div>

                      {/* Mini Card 3: Question Bank */}
                      <div
                        className="action-mini-card-3d"
                        onClick={() => router.push("/question-bank")}
                        style={{
                          background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
                          border: "1px solid rgba(134, 239, 172, 0.35)",
                          cursor: "pointer",
                        }}
                      >
                        <div className="action-mini-icon-green">
                          <Layers size={18} style={{ filter: "drop-shadow(0 0 4px rgba(255,255,255,0.8))" }} />
                        </div>
                        <div>
                          <strong style={{ display: "block", fontSize: "12.5px", color: "#166534", fontWeight: 700 }}>
                            Question Bank
                          </strong>
                          <span style={{ fontSize: "10.5px", color: "#15803d" }}>
                            Manage question bank
                          </span>
                        </div>
                      </div>

                      {/* Mini Card 4: Reports */}
                      <div
                        className="action-mini-card-3d"
                        onClick={() => router.push("/reports")}
                        style={{
                          background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)",
                          border: "1px solid rgba(253, 186, 116, 0.35)",
                          cursor: "pointer",
                        }}
                      >
                        <div className="action-mini-icon-orange">
                          <BarChart2 size={18} style={{ filter: "drop-shadow(0 0 4px rgba(255,255,255,0.8))" }} />
                        </div>
                        <div>
                          <strong style={{ display: "block", fontSize: "12.5px", color: "#9a3412", fontWeight: 700 }}>
                            Reports
                          </strong>
                          <span style={{ fontSize: "10.5px", color: "#c2410c" }}>
                            View analytics
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Table pagination note */}
              <Pagination
                currentPage={safeCurrentPage}
                totalItems={filteredSubjects.length}
                itemsPerPage={itemsPerPage}
                onPageChange={(p) => setCurrentPage(p)}
                itemName="subjects"
              />
            </div>

            {/* ================= RIGHT COLUMN: Categories & Quick Actions ================= */}
          </div>

          {/* Support Banner & Footer */}
          <PortalFooter />
        </main>
      </div>

      {/* View Modal */}
      {viewSubject && (
        <ViewModal
          isOpen={!!viewSubject}
          onClose={() => setViewSubject(null)}
          title={viewSubject.name}
          subtitle={`Subject Code: ${viewSubject.code}`}
          badge={{
            label: viewSubject.status,
            bg: viewSubject.status === "Completed" ? "#dcfce7" : "#e0e7ff",
            color: viewSubject.status === "Completed" ? "#16a34a" : "#4338ca",
          }}
          fields={[
            { label: "Subject Name", value: viewSubject.name, spanFull: true },
            { label: "Subject Code", value: viewSubject.code },
            { label: "School / Faculty", value: viewSubject.school || "School of Media & Arts" },
            { label: "Department", value: viewSubject.department || "Visual Communication" },
            { label: "Semester", value: viewSubject.semester || "Semester 3" },
            { label: "Credits", value: `${viewSubject.credits || 3} Credits` },
            { label: "Total Questions", value: viewSubject.totalQuestions || 0 },
            { label: "Verified Questions", value: viewSubject.verified ?? 0 },
            { label: "Approved Questions", value: typeof viewSubject.approved === "number" ? viewSubject.approved : viewSubject.approved || 0 },
            { label: "Status", value: viewSubject.status },
          ]}
          onEdit={() => {
            setEditSubject(viewSubject);
            setViewSubject(null);
          }}
          onDelete={() => {
            setDeleteSubject(viewSubject);
            setViewSubject(null);
          }}
        />
      )}

      {/* Edit Modal */}
      {editSubject && (
        <FormModal
          isOpen={!!editSubject}
          onClose={() => setEditSubject(null)}
          title="Edit Subject"
          subtitle={`Modifying details for ${editSubject.code}`}
          fields={subjectFormFields}
          initialValues={{
            name: editSubject.name,
            code: editSubject.code,
            credits: editSubject.credits || 3,
            totalQuestions: editSubject.totalQuestions || 0,
            status: editSubject.status,
            school: editSubject.school || "School of Media & Arts",
            department: editSubject.department || "Visual Communication",
            semester: editSubject.semester || "Semester 3",
          }}
          onSubmit={handleUpdateSubject}
          submitLabel="Save Changes"
        />
      )}

      {/* Add Modal */}
      <FormModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add New Subject (School / Dept Wise)"
        subtitle="Create a new subject assigned to a School and Department"
        fields={subjectFormFields}
        initialValues={{
          name: "",
          code: "",
          credits: 4,
          totalQuestions: 0,
          status: "In Progress",
          school: "School of Media & Arts",
          department: "Visual Communication",
          semester: "Semester 1",
        }}
        onSubmit={handleCreateSubject}
        submitLabel="Create Subject"
      />

      {/* ================= COE BULK ADD SUBJECTS MODAL ================= */}
      {isBulkAddOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              width: "100%",
              maxWidth: "780px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              border: "1px solid #e2e8f0",
              padding: "28px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #059669, #10b981)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ffffff",
                    boxShadow: "0 4px 14px rgba(16, 185, 129, 0.4)",
                  }}
                >
                  <Shield size={22} />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <h2 style={{ fontSize: "19px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                      COE Bulk Add Subjects
                    </h2>
                    <span style={{ fontSize: "11px", fontWeight: 700, background: "#dcfce7", color: "#15803d", padding: "2px 8px", borderRadius: "6px", border: "1px solid #bbf7d0" }}>
                      COE Login Authorized
                    </span>
                  </div>
                  <p style={{ fontSize: "12.5px", color: "#64748b", margin: "2px 0 0 0" }}>
                    Bulk create subjects grouped by target School and Department
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBulkAddOpen(false)}
                style={{ background: "#f1f5f9", border: "none", borderRadius: "8px", width: "32px", height: "32px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontWeight: 700 }}
              >
                ✕
              </button>
            </div>

            {/* Target Selection: School & Department */}
            <div style={{ background: "#f8fafc", padding: "16px 18px", borderRadius: "14px", border: "1px solid #e2e8f0", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                  Target School
                </label>
                <select
                  value={bulkSelectedSchool}
                  onChange={(e) => setBulkSelectedSchool(e.target.value)}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "12.5px", fontWeight: 600, color: "#0f172a" }}
                >
                  <option value="School of Media & Arts">School of Media & Arts</option>
                  <option value="School of Computer Science & IT">School of Computer Science & IT</option>
                  <option value="School of Engineering">School of Engineering</option>
                  <option value="School of Management & Commerce">School of Management & Commerce</option>
                  <option value="School of Sciences & Humanities">School of Sciences & Humanities</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                  Target Department
                </label>
                <select
                  value={bulkSelectedDepartment}
                  onChange={(e) => setBulkSelectedDepartment(e.target.value)}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "12.5px", fontWeight: 600, color: "#0f172a" }}
                >
                  <option value="Visual Communication">Visual Communication</option>
                  <option value="Visual Arts & VFX">Visual Arts & VFX</option>
                  <option value="Film & Media">Film & Media</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electrical & Electronics">Electrical & Electronics</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Management Studies">Management Studies</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                  Target Semester
                </label>
                <select
                  value={bulkSelectedSemester}
                  onChange={(e) => setBulkSelectedSemester(e.target.value)}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "12.5px", fontWeight: 600, color: "#0f172a" }}
                >
                  {Array.from({ length: 9 }).map((_, i) => (
                    <option key={i} value={`Semester ${i}`}>Semester {i}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Input Methods Tabs */}
            <div style={{ display: "flex", gap: "10px", borderBottom: "1px solid #e2e8f0", paddingBottom: "10px" }}>
              <button
                type="button"
                onClick={() => setBulkActiveTab("rows")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontSize: "12.5px",
                  fontWeight: 700,
                  border: "none",
                  background: bulkActiveTab === "rows" ? "#4f46e5" : "#f1f5f9",
                  color: bulkActiveTab === "rows" ? "#ffffff" : "#475569",
                  cursor: "pointer",
                }}
              >
                Multi-Subject Rows
              </button>
              <button
                type="button"
                onClick={() => setBulkActiveTab("preset")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontSize: "12.5px",
                  fontWeight: 700,
                  border: "none",
                  background: bulkActiveTab === "preset" ? "#4f46e5" : "#f1f5f9",
                  color: bulkActiveTab === "preset" ? "#ffffff" : "#475569",
                  cursor: "pointer",
                }}
              >
                ⚡ Quick 1-Click Sample Pack
              </button>
              <button
                type="button"
                onClick={() => setBulkActiveTab("csv")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontSize: "12.5px",
                  fontWeight: 700,
                  border: "none",
                  background: bulkActiveTab === "csv" ? "#4f46e5" : "#f1f5f9",
                  color: bulkActiveTab === "csv" ? "#ffffff" : "#475569",
                  cursor: "pointer",
                }}
              >
                Paste Raw CSV Text
              </button>
            </div>

            {/* Tab Content */}
            {bulkActiveTab === "rows" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 34px", gap: "10px", fontSize: "11.5px", fontWeight: 700, color: "#64748b", padding: "0 4px" }}>
                  <span>SUBJECT NAME</span>
                  <span>SUBJECT CODE</span>
                  <span>CREDITS</span>
                  <span></span>
                </div>
                {bulkAddRows.map((row, idx) => (
                  <div key={idx} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 34px", gap: "10px", alignItems: "center" }}>
                    <input
                      type="text"
                      placeholder={`e.g. Subject Name ${idx + 1}`}
                      value={row.name}
                      onChange={(e) => {
                        const updated = [...bulkAddRows];
                        updated[idx].name = e.target.value;
                        setBulkAddRows(updated);
                      }}
                      style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                    />
                    <input
                      type="text"
                      placeholder="e.g. 24SUB101"
                      value={row.code}
                      onChange={(e) => {
                        const updated = [...bulkAddRows];
                        updated[idx].code = e.target.value;
                        setBulkAddRows(updated);
                      }}
                      style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                    />
                    <input
                      type="number"
                      placeholder="Credits"
                      value={row.credits}
                      onChange={(e) => {
                        const updated = [...bulkAddRows];
                        updated[idx].credits = Number(e.target.value);
                        setBulkAddRows(updated);
                      }}
                      style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
                    />
                    {bulkAddRows.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => setBulkAddRows(bulkAddRows.filter((_, i) => i !== idx))}
                        style={{ background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca", borderRadius: "8px", height: "34px", cursor: "pointer", fontWeight: 700 }}
                      >
                        ✕
                      </button>
                    ) : (
                      <div />
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setBulkAddRows([...bulkAddRows, { name: "", code: "", credits: 3 }])}
                  style={{ padding: "8px 14px", background: "#eef2ff", color: "#4f46e5", border: "1px dashed #6366f1", borderRadius: "8px", fontSize: "12.5px", fontWeight: 700, cursor: "pointer", alignSelf: "flex-start", marginTop: "4px" }}
                >
                  + Add Another Subject Row
                </button>
              </div>
            )}

            {bulkActiveTab === "preset" && (
              <div style={{ background: "#eff6ff", padding: "18px", borderRadius: "12px", border: "1px solid #bfdbfe" }}>
                <h4 style={{ margin: "0 0 6px 0", fontSize: "14px", fontWeight: 700, color: "#1e40af" }}>
                  Curriculum Sample Pack for {bulkSelectedDepartment}
                </h4>
                <p style={{ fontSize: "12.5px", color: "#1e3a8a", margin: "0 0 14px 0" }}>
                  Clicking the button below will prefill 5 standard curriculum subjects configured for <strong>{bulkSelectedDepartment}</strong> ({bulkSelectedSchool} • {bulkSelectedSemester}):
                </p>
                <button
                  type="button"
                  onClick={handleLoadPresetPack}
                  style={{ padding: "10px 18px", background: "#2563eb", color: "#ffffff", border: "none", borderRadius: "8px", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}
                >
                  ⚡ Fill 5 Sample Subjects into Rows
                </button>
              </div>
            )}

            {bulkActiveTab === "csv" && (
              <div>
                <label style={{ display: "block", fontSize: "12.5px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                  Paste CSV Lines (Format: Subject Code, Subject Name, Credits)
                </label>
                <textarea
                  rows={6}
                  placeholder={`24CS101, Data Structures & Algorithms, 4\n24CS102, Database Management Systems, 4\n24CS103, Operating Systems, 3`}
                  value={bulkRawText}
                  onChange={(e) => setBulkRawText(e.target.value)}
                  style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", fontFamily: "monospace" }}
                />
              </div>
            )}

            {/* Modal Actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", paddingTop: "14px", borderTop: "1px solid #e2e8f0" }}>
              <button
                type="button"
                onClick={() => setIsBulkAddOpen(false)}
                style={{ padding: "9px 18px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#ffffff", fontSize: "13px", fontWeight: 600, color: "#475569", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitBulkAdd}
                style={{ padding: "9px 22px", borderRadius: "8px", border: "none", background: "linear-gradient(135deg, #059669 0%, #10b981 100%)", color: "#ffffff", fontSize: "13px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(16, 185, 129, 0.35)" }}
              >
                Bulk Create Subjects
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={!!deleteSubject}
        onClose={() => setDeleteSubject(null)}
        title="Delete Subject"
        itemName={deleteSubject ? `${deleteSubject.name} (${deleteSubject.code})` : ""}
        onConfirm={handleDeleteSubject}
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
