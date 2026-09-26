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
  Database,
  Hourglass,
  ChevronRight,
  Headphones,
  Info,
  Layers,
  FileCode,
  School,
  ChevronDown,
  Eye,
  Trash2,
  Plus,
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

export default function DashboardPage() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [q1Text, setQ1Text] = useState("");
  const [q1Marks, setQ1Marks] = useState("");
  const [q1Diff, setQ1Diff] = useState("");
  const [q2Text, setQ2Text] = useState("");
  const [q2Marks, setQ2Marks] = useState("");
  const [q2Diff, setQ2Diff] = useState("");
  const [manualCount, setManualCount] = useState(0);

  // Store state
  const [subjectsData, setSubjectsData] = useState<SubjectItem[]>([]);
  const [activitiesData, setActivitiesData] = useState<any[]>([]);
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

  useEffect(() => {
    const loadData = () => {
      setSubjectsData(examStore.getSubjects());
      setActivitiesData(examStore.getActivities());
    };
    loadData();
    window.addEventListener("exam-cell-store-update", loadData);
    return () => window.removeEventListener("exam-cell-store-update", loadData);
  }, []);

  const handleSaveManualQuestions = () => {
    if (!q1Text && !q2Text) {
      showToast("Please enter at least one question before saving.", "danger");
      return;
    }
    let added = 0;
    if (q1Text) {
      examStore.saveQuestion({
        question: q1Text,
        marks: Number(q1Marks || 2),
        difficulty: (q1Diff as any) || "Easy",
        subject: "Viscom & VFX",
        unit: "Unit I - Color Theory",
        topic: "Topic 1 - Color Basics",
        type: "Descriptive",
        status: "Pending",
      });
      added++;
    }
    if (q2Text) {
      examStore.saveQuestion({
        question: q2Text,
        marks: Number(q2Marks || 5),
        difficulty: (q2Diff as any) || "Medium",
        subject: "Viscom & VFX",
        unit: "Unit II - Color Models",
        topic: "Topic 2 - Color Models",
        type: "Descriptive",
        status: "Pending",
      });
      added++;
    }
    setManualCount((prev) => prev + added);
    examStore.logActivity(
      `Saved ${added} manual question(s)`,
      "Manual Questions",
      "Added to Viscom & VFX",
      currentUser.name || "Faculty"
    );
    showToast(`Successfully saved ${added} manual question(s)!`);
    setQ1Text("");
    setQ1Marks("");
    setQ1Diff("");
    setQ2Text("");
    setQ2Marks("");
    setQ2Diff("");
  };

  const handleCreateSubject = (values: Record<string, any>) => {
    examStore.saveSubject({
      name: values.name,
      code: values.code,
      credits: values.credits !== undefined ? Number(values.credits) : 3,
      totalQuestions: values.totalQuestions !== undefined ? Number(values.totalQuestions) : 0,
      status: values.status || "In Progress",
      school: values.school || "School of Media & Arts",
      department: values.department || "General",
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
      approved: Number(values.approved || editSubject.approved || 0),
      verified: Number(values.verified || editSubject.verified || 0),
      pending: Number(values.pending || editSubject.pending || 0),
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
        { value: "General", label: "General" },
        { value: "Visual Communication", label: "Visual Communication" },
        { value: "Viscom", label: "Viscom" },
        { value: "Visual Arts & VFX", label: "Visual Arts & VFX" },
        { value: "Film & Media", label: "Film & Media" },
        { value: "Computer Science", label: "Computer Science" },
        { value: "Information Technology", label: "Information Technology" },
        { value: "Electrical & Electronics", label: "Electrical & Electronics" },
        { value: "Mechanical Engineering", label: "Mechanical Engineering" },
        { value: "Management Studies", label: "Management Studies" },
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

  const totalQuestions = subjectsData.reduce((acc, s) => acc + Number(s.totalQuestions || s.total || 0), 0);
  const totalPending = subjectsData.reduce((acc, s) => acc + Number(s.pending || 0), 0);
  const totalApproved = subjectsData.reduce((acc, s) => acc + Number(s.approved || 0), 0);
  const totalVerified = subjectsData.reduce((acc, s) => acc + Number(s.verified || 0), 0);

  const rawMenuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, hasArrow: true, route: "/dashboard" },
    { id: "subjects", label: "Subjects", icon: BookOpen, route: "/subjects" },
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

  return (
    <RoleGuard route="/dashboard">
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
          {/* RGU Logo with 3D ambient glow */}
          <div style={{ padding: "6px 10px 24px 10px", position: "relative" }}>
            <img
              src="/images/rgu-logo.png"
              alt="Rathinam Global (Deemed to be University)"
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
        <PortalHeader activeRoute="dashboard" />


        {/* Scrollable Dashboard Body */}
        <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto", overflowX: "hidden", minWidth: 0, width: "100%", boxSizing: "border-box" }}>
          {/* Welcome Banner Row */}
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
                }}
              >
                {(() => {
                  const hr = new Date().getHours();
                  const greeting = hr < 12 ? "Good Morning" : hr < 17 ? "Good Afternoon" : "Good Evening";
                  return `${greeting}, ${currentUser.name} 👋`;
                })()}
              </h1>
              <p style={{ fontSize: "13.5px", color: "#64748b", margin: 0 }}>
                Logged in as <strong>{currentUser.roleTitle}</strong> ({currentUser.role}). Here&apos;s your workspace.
              </p>
            </div>

            {/* University Crest Badge with 3D Glow Icon */}
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

          {/* ================= 4 Top 3D Metric Stat Cards with 3D Glow Icons ================= */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "18px",
              marginBottom: "24px",
            }}
          >
            {/* Card 1: Total Subjects - 3D Blue/Indigo with Floating Glow Book */}
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
                {subjectsData.length}
              </div>
              <div style={{ fontSize: "11.5px", opacity: 0.85 }}>Assigned to You</div>
            </div>

            {/* Card 2: Total Question Bank - 3D Cyan with Floating Glow Database */}
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
                  <Database
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
                Total Question Bank
              </div>
              <div style={{ fontSize: "32px", fontWeight: 800, lineHeight: 1, marginBottom: "6px", textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
                {totalQuestions}
              </div>
              <div style={{ fontSize: "11.5px", opacity: 0.85 }}>All Your Questions</div>
            </div>

            {/* Card 3: Pending Approvals - 3D Emerald with Floating Glow Hourglass */}
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
                  <Hourglass
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
                Pending Approvals
              </div>
              <div style={{ fontSize: "32px", fontWeight: 800, lineHeight: 1, marginBottom: "6px", textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
                {String(totalPending).padStart(2, '0')}
              </div>
              <div style={{ fontSize: "11.5px", opacity: 0.85 }}>Awaiting Your Action</div>
            </div>

            {/* Card 4: Finalized Questions - 3D Orange with Floating Glow Check */}
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
                  <CheckCircle2
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
                Finalized Questions
              </div>
              <div style={{ fontSize: "32px", fontWeight: 800, lineHeight: 1, marginBottom: "6px", textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
                {totalApproved}
              </div>
              <div style={{ fontSize: "11.5px", opacity: 0.85 }}>Ready for Exams</div>
            </div>
          </div>

          {/* ================= Middle Row: 3 Panels ================= */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.05fr 1.15fr 1.25fr",
              gap: "20px",
              marginBottom: "24px",
            }}
          >
            {/* Panel 1: Subject Overview (3D Donut Chart with Neon Drop Shadow) */}
            <div className="widget-card-3d">
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", marginBottom: "16px" }}>
                Subject Overview
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flex: 1,
                  gap: "12px",
                }}
              >
                {/* SVG Donut with 3D Glowing Filter */}
                <div style={{ position: "relative", width: "140px", height: "140px" }}>
                  <svg
                    className="donut-svg-glow"
                    width="140"
                    height="140"
                    viewBox="0 0 140 140"
                    style={{ transform: "rotate(-90deg)" }}
                  >
                    {/* Background Circle */}
                    <circle
                      cx="70"
                      cy="70"
                      r="50"
                      fill="transparent"
                      stroke="#f1f5f9"
                      strokeWidth="20"
                    />
                    {totalQuestions > 0 &&
                      subjectsData.map((subj, idx) => {
                        const qCount = Number(subj.totalQuestions || subj.total || 0);
                        if (qCount === 0) return null;
                        const pct = qCount / totalQuestions;
                        const dashArray = `${pct * 314.15} 314.15`;
                        const color = subj.dotColor || (idx % 2 === 0 ? "#6366f1" : "#0284c7");
                        return (
                          <circle
                            key={subj.id}
                            cx="70"
                            cy="70"
                            r="50"
                            fill="transparent"
                            stroke={color}
                            strokeWidth="20"
                            strokeDasharray={dashArray}
                            strokeDashoffset="0"
                            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
                          />
                        );
                      })}
                  </svg>

                  {/* Donut Center 3D Badge */}
                  <div className="donut-center-badge-3d">
                    <span style={{ fontSize: "26px", fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>
                      {subjectsData.length}
                    </span>
                    <span style={{ fontSize: "10px", color: "#64748b", fontWeight: 600, marginTop: "2px" }}>
                      Total Subjects
                    </span>
                  </div>
                </div>

                {/* Legend with Glowing 3D Dots */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {subjectsData.map((subj, idx) => {
                    const qCount = Number(subj.totalQuestions || subj.total || 0);
                    const pct = totalQuestions > 0 ? ((qCount / totalQuestions) * 100).toFixed(1) : "0";
                    const color = subj.dotColor || (idx % 2 === 0 ? "#6366f1" : "#0284c7");
                    return (
                      <div key={subj.id} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span
                          style={{
                            width: "12px",
                            height: "12px",
                            borderRadius: "50%",
                            background: color,
                            boxShadow: `0 0 8px ${color}`,
                            flexShrink: 0,
                          }}
                        />
                        <div>
                          <div style={{ fontSize: "12.5px", fontWeight: 700, color: "#0f172a" }}>
                            {subj.name}
                          </div>
                          <div style={{ fontSize: "11px", color: "#64748b" }}>
                            {qCount} ({pct}%)
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Panel 2: Recent Activity with 3D Glowing Badges */}
            <div className="widget-card-3d">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <span style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
                  Recent Activity
                </span>
                <button
                  type="button"
                  onClick={() => router.push("/notifications")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#2563eb",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "color 0.2s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#4f46e5")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#2563eb")}
                >
                  View All
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {activitiesData.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "32px 12px", color: "#94a3b8", fontSize: "12.5px" }}>
                    No recent activity recorded yet.
                  </div>
                ) : (
                  activitiesData.slice(0, 5).map((act) => (
                    <div key={act.id} className="activity-row-3d">
                      <div className="activity-badge-3d activity-badge-blue">
                        <FileCode size={15} style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))" }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "12.5px", fontWeight: 600, color: "#0f172a" }}>
                          {act.activity}
                        </div>
                        <div style={{ fontSize: "11px", color: "#64748b" }}>{act.details || act.module}</div>
                      </div>
                      <span style={{ fontSize: "11px", color: "#94a3b8", flexShrink: 0 }}>{act.dateTime}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Panel 3: Manual Questions with 3D Glowing Button */}
            <div className="widget-card-3d">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "4px",
                }}
              >
                <span style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
                  Manual Questions
                </span>
                <button
                  type="button"
                  style={{
                    background: "none",
                    border: "none",
                    color: "#2563eb",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "color 0.2s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#4f46e5")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#2563eb")}
                >
                  View All
                </button>
              </div>
              <p style={{ fontSize: "11.5px", color: "#64748b", margin: "0 0 14px 0" }}>
                Add 2 questions manually for final question paper.
              </p>

              {/* Question 1 */}
              <div style={{ marginBottom: "12px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#334155",
                    marginBottom: "4px",
                  }}
                >
                  Question 1
                </label>
                <textarea
                  placeholder="Enter your question here..."
                  value={q1Text}
                  onChange={(e) => setQ1Text(e.target.value)}
                  style={{
                    width: "100%",
                    height: "44px",
                    padding: "8px 10px",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    background: "#f8fafc",
                    fontSize: "12px",
                    resize: "none",
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
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "4px" }}>
                  <div>
                    <span style={{ fontSize: "10px", color: "#64748b" }}>Marks</span>
                    <select
                      value={q1Marks}
                      onChange={(e) => setQ1Marks(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "5px 8px",
                        borderRadius: "6px",
                        border: "1px solid #e2e8f0",
                        background: "#ffffff",
                        fontSize: "11px",
                        color: "#334155",
                        outline: "none",
                        transition: "border-color 0.2s ease",
                      }}
                    >
                      <option value="">Select</option>
                      <option value="2">2 Marks</option>
                      <option value="5">5 Marks</option>
                      <option value="10">10 Marks</option>
                      <option value="16">16 Marks</option>
                    </select>
                  </div>
                  <div>
                    <span style={{ fontSize: "10px", color: "#64748b" }}>Difficulty</span>
                    <select
                      value={q1Diff}
                      onChange={(e) => setQ1Diff(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "5px 8px",
                        borderRadius: "6px",
                        border: "1px solid #e2e8f0",
                        background: "#ffffff",
                        fontSize: "11px",
                        color: "#334155",
                        outline: "none",
                        transition: "border-color 0.2s ease",
                      }}
                    >
                      <option value="">Select</option>
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Question 2 */}
              <div style={{ marginBottom: "14px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#334155",
                    marginBottom: "4px",
                  }}
                >
                  Question 2
                </label>
                <textarea
                  placeholder="Enter your question here..."
                  value={q2Text}
                  onChange={(e) => setQ2Text(e.target.value)}
                  style={{
                    width: "100%",
                    height: "44px",
                    padding: "8px 10px",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    background: "#f8fafc",
                    fontSize: "12px",
                    resize: "none",
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
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "4px" }}>
                  <div>
                    <span style={{ fontSize: "10px", color: "#64748b" }}>Marks</span>
                    <select
                      value={q2Marks}
                      onChange={(e) => setQ2Marks(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "5px 8px",
                        borderRadius: "6px",
                        border: "1px solid #e2e8f0",
                        background: "#ffffff",
                        fontSize: "11px",
                        color: "#334155",
                        outline: "none",
                      }}
                    >
                      <option value="">Select</option>
                      <option value="2">2 Marks</option>
                      <option value="5">5 Marks</option>
                      <option value="10">10 Marks</option>
                      <option value="16">16 Marks</option>
                    </select>
                  </div>
                  <div>
                    <span style={{ fontSize: "10px", color: "#64748b" }}>Difficulty</span>
                    <select
                      value={q2Diff}
                      onChange={(e) => setQ2Diff(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "5px 8px",
                        borderRadius: "6px",
                        border: "1px solid #e2e8f0",
                        background: "#ffffff",
                        fontSize: "11px",
                        color: "#334155",
                        outline: "none",
                      }}
                    >
                      <option value="">Select</option>
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "10px", marginTop: "auto" }}>
                <button
                  type="button"
                  onClick={handleSaveManualQuestions}
                  style={{
                    flex: 1,
                    padding: "9px 12px",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    background: "#f8fafc",
                    color: "#2563eb",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#eff6ff";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#f8fafc";
                    e.currentTarget.style.transform = "none";
                  }}
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/question-bank")}
                  className="btn-3d-glow-primary"
                >
                  Final Question Bank
                </button>
              </div>
            </div>
          </div>

          {/* ================= Lower Row: Table + Status Checklist ================= */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2.2fr 1.25fr",
              gap: "20px",
              marginBottom: "24px",
            }}
          >
            {/* Subject Wise Question Bank Table with 3D Glowing Status Pills */}
            <div className="widget-card-3d" style={{ justifyContent: "space-between" }}>
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "16px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
                      Subject Wise Question Bank
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAddOpen(true)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        padding: "4px 10px",
                        borderRadius: "8px",
                        border: "none",
                        background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
                        color: "#ffffff",
                        fontSize: "11px",
                        fontWeight: 600,
                        cursor: "pointer",
                        boxShadow: "0 2px 8px rgba(79, 70, 229, 0.3)",
                      }}
                    >
                      <Plus size={13} />
                      <span>Add Subject</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => router.push("/subjects")}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#2563eb",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "color 0.2s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#4f46e5")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#2563eb")}
                  >
                    View All
                  </button>
                </div>

                <div className="no-scrollbar" style={{ overflowX: "auto", scrollbarWidth: "none", msOverflowStyle: "none" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <th style={{ padding: "10px 12px", fontSize: "11px", fontWeight: 600, color: "#64748b" }}>
                          Subject
                        </th>
                        <th style={{ padding: "10px 12px", fontSize: "11px", fontWeight: 600, color: "#64748b", textAlign: "center" }}>
                          Total Questions
                        </th>
                        <th style={{ padding: "10px 12px", fontSize: "11px", fontWeight: 600, color: "#64748b", textAlign: "center" }}>
                          Verified
                        </th>
                        <th style={{ padding: "10px 12px", fontSize: "11px", fontWeight: 600, color: "#64748b", textAlign: "center" }}>
                          Approved
                        </th>
                        <th style={{ padding: "10px 12px", fontSize: "11px", fontWeight: 600, color: "#64748b", textAlign: "center" }}>
                          Pending
                        </th>
                        <th style={{ padding: "10px 12px", fontSize: "11px", fontWeight: 600, color: "#64748b", textAlign: "center" }}>
                          Status
                        </th>
                        <th style={{ padding: "10px 12px", fontSize: "11px", fontWeight: 600, color: "#64748b", textAlign: "center" }}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjectsData.map((row) => (
                        <tr key={row.id} style={{ borderBottom: "1px solid #f8fafc", transition: "background 0.2s ease" }}>
                          <td style={{ padding: "14px 12px", fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
                            <div>{row.name || (row as any).subject}</div>
                            <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 500 }}>{row.code}</span>
                          </td>
                          <td style={{ padding: "14px 12px", fontSize: "13px", fontWeight: 600, color: "#334155", textAlign: "center" }}>
                            {row.totalQuestions ?? (row as any).total ?? 0}
                          </td>
                          <td style={{ padding: "14px 12px", fontSize: "13px", fontWeight: 600, color: "#334155", textAlign: "center" }}>
                            {row.verified ?? 0}
                          </td>
                          <td style={{ padding: "14px 12px", fontSize: "13px", fontWeight: 600, color: "#334155", textAlign: "center" }}>
                            {row.approved ?? 0}
                          </td>
                          <td style={{ padding: "14px 12px", fontSize: "13px", fontWeight: 600, color: "#334155", textAlign: "center" }}>
                            {String(row.pending ?? 0).padStart(2, '0')}
                          </td>
                          <td style={{ padding: "14px 12px", textAlign: "center" }}>
                            <span className="status-pill-in-progress-3d">
                              <span className="status-dot-pulse-3d" />
                              {row.status}
                            </span>
                          </td>
                          <td style={{ padding: "14px 12px", textAlign: "center" }}>
                            <CrudActionButtons
                              onView={() => setViewSubject(row)}
                              onEdit={() => setEditSubject(row)}
                              onDelete={() => setDeleteSubject(row)}
                              viewTitle="View Subject Details"
                              editTitle="Edit Subject"
                              deleteTitle="Delete Subject"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={{ fontSize: "11.5px", color: "#94a3b8", marginTop: "16px" }}>
                {`Showing 1 to ${subjectsData.length} of ${subjectsData.length} subjects`}
              </div>
            </div>

            {/* Question Bank Status Checklist with 3D Glowing Hover Items */}
            <div className="widget-card-3d">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <span style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
                  Question Bank Status
                </span>
                <button
                  type="button"
                  style={{
                    background: "none",
                    border: "none",
                    color: "#2563eb",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "color 0.2s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#4f46e5")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#2563eb")}
                >
                  View Report
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div className="checklist-row-3d">
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <CheckSquare size={16} color="#64748b" className="checklist-icon-glow" />
                    <span style={{ fontSize: "12.5px", color: "#334155", fontWeight: 500 }}>
                      Total Questions
                    </span>
                  </div>
                  <strong style={{ fontSize: "13.5px", color: "#0f172a" }}>{totalQuestions}</strong>
                </div>

                <div className="checklist-row-3d">
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <CheckSquare size={16} color="#64748b" className="checklist-icon-glow" />
                    <span style={{ fontSize: "12.5px", color: "#334155", fontWeight: 500 }}>
                      Verified Questions
                    </span>
                  </div>
                  <strong style={{ fontSize: "13.5px", color: "#0f172a" }}>{totalVerified}</strong>
                </div>

                <div className="checklist-row-3d">
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <CheckSquare size={16} color="#64748b" className="checklist-icon-glow" />
                    <span style={{ fontSize: "12.5px", color: "#334155", fontWeight: 500 }}>
                      Approved Questions
                    </span>
                  </div>
                  <strong style={{ fontSize: "13.5px", color: "#0f172a" }}>{totalApproved}</strong>
                </div>

                <div className="checklist-row-3d">
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <CheckSquare size={16} color="#64748b" className="checklist-icon-glow" />
                    <span style={{ fontSize: "12.5px", color: "#334155", fontWeight: 500 }}>
                      Manual Questions (Vignesh)
                    </span>
                  </div>
                  <strong style={{ fontSize: "13.5px", color: "#0f172a" }}>{manualCount}</strong>
                </div>

                <div className="checklist-row-3d">
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <CheckSquare size={16} color="#64748b" className="checklist-icon-glow" />
                    <span style={{ fontSize: "12.5px", color: "#334155", fontWeight: 500 }}>
                      Final Question Bank
                    </span>
                  </div>
                  <strong style={{ fontSize: "13.5px", color: "#0f172a" }}>{totalApproved}</strong>
                </div>
              </div>
            </div>
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
          title={viewSubject.name || (viewSubject as any).subject}
          subtitle={`Subject Code: ${viewSubject.code}`}
          badge={{
            label: viewSubject.status,
            bg: viewSubject.status === "Completed" ? "#dcfce7" : "#e0e7ff",
            color: viewSubject.status === "Completed" ? "#16a34a" : "#4338ca",
          }}
          fields={[
            { label: "Subject Name", value: viewSubject.name || (viewSubject as any).subject, spanFull: true },
            { label: "Subject Code", value: viewSubject.code },
            { label: "Credits", value: `${viewSubject.credits || 3} Credits` },
            { label: "Total Questions", value: viewSubject.totalQuestions ?? (viewSubject as any).total ?? 0 },
            { label: "Verified Questions", value: viewSubject.verified ?? 0 },
            { label: "Approved Questions", value: viewSubject.approved ?? 0 },
            { label: "Pending Questions", value: viewSubject.pending ?? 0 },
            { label: "Department", value: viewSubject.department || "Visual Communication" },
            { label: "Semester", value: viewSubject.semester || "Semester 3" },
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
            name: editSubject.name || (editSubject as any).subject,
            code: editSubject.code,
            credits: editSubject.credits || 3,
            totalQuestions: editSubject.totalQuestions ?? (editSubject as any).total ?? 0,
            status: editSubject.status,
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
        title="Add New Subject"
        subtitle="Create a new subject in the Exam Cell registry"
        fields={subjectFormFields}
        initialValues={{
          name: "",
          code: "",
          credits: 4,
          totalQuestions: 0,
          status: "In Progress",
          department: "Visual Communication",
          semester: "Semester 3",
        }}
        onSubmit={handleCreateSubject}
        submitLabel="Create Subject"
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={!!deleteSubject}
        onClose={() => setDeleteSubject(null)}
        title="Delete Subject"
        itemName={deleteSubject ? `${deleteSubject.name || (deleteSubject as any).subject} (${deleteSubject.code})` : ""}
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

