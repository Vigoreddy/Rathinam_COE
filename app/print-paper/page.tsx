"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Home,
  BookOpen,
  FileText,
  CheckSquare,
  Upload,
  Search,
  BarChart2,
  Bell,
  Edit3,
  Settings,
  Printer,
  Shield,
  ArrowRight,
  ChevronRight,
  School,
  Sparkles,
  Sliders,
  SlidersHorizontal,
  CheckCircle2,
  Layers,
  FileUp,
  Download,
  Eye,
  RefreshCw,
} from "lucide-react";
import { examStore, QuestionItem } from "../lib/examStore";
import { authStore, AuthUser, hasPermission } from "../lib/auth";
import RoleGuard from "../components/RoleGuard";
import PortalHeader from "../components/PortalHeader";
import PortalFooter from "../components/PortalFooter";
import { ToastNotification } from "../components/CrudModal";

export default function PrintPaperPage() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState("print-paper");
  const [currentUser, setCurrentUser] = useState<AuthUser>(() => authStore.getCurrentUser());

  useEffect(() => {
    const handleAuth = () => setCurrentUser(authStore.getCurrentUser());
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
    { id: "approval", label: "Approval", icon: CheckSquare, route: "/approval" },
    { id: "reports", label: "Reports", icon: BarChart2, route: "/reports" },
    { id: "notifications", label: "Notifications", icon: Bell, route: "/notifications" },
    { id: "manual-questions", label: "Manual Questions", icon: Edit3, route: "/manual-questions" },
    { id: "print-paper", label: "Print Question Paper", icon: Printer, badge: "Print", route: "/print-paper" },
    { id: "settings", label: "Settings", icon: Settings, route: "/settings" },
  ];

  const menuItems = rawMenuItems.filter((item) =>
    hasPermission(currentUser.role, item.route, currentUser.isSubjectFaculty)
  );

  // Store Questions
  const [allQuestions, setAllQuestions] = useState<QuestionItem[]>(() => examStore.getQuestions());

  useEffect(() => {
    const loadQs = () => setAllQuestions(examStore.getQuestions());
    loadQs();
    window.addEventListener("exam-cell-store-update", loadQs);
    return () => window.removeEventListener("exam-cell-store-update", loadQs);
  }, []);

  // Form Controls
  const subjectsList = Array.from(new Set(allQuestions.map((q) => (q.subject || "ENGINEERING GRAPHICS").trim())));
  const [selectedSubject, setSelectedSubject] = useState<string>(subjectsList[0] || "ENGINEERING GRAPHICS");
  const [examType, setExamType] = useState<string>("End Semester Examination (Regular)");
  const [maxMarks, setMaxMarks] = useState<number>(100);
  const [duration, setDuration] = useState<string>("3 Hours");
  const [semesterYear, setSemesterYear] = useState<string>("IV Semester / Academic Year 2024-2025");

  // Quantity Sliders / Inputs
  const [mcqCount, setMcqCount] = useState<number>(10);
  const [descriptiveCount, setDescriptiveCount] = useState<number>(5);
  const [diagramCount, setDiagramCount] = useState<number>(5);

  const [toast, setToast] = useState<{ message: string; isVisible: boolean; type?: "success" | "danger" }>({
    message: "",
    isVisible: false,
  });

  const showToast = (message: string, type: "success" | "danger" = "success") => {
    setToast({ message, isVisible: true, type });
    setTimeout(() => setToast((prev) => ({ ...prev, isVisible: false })), 3000);
  };

  const cleanQuestionText = (text: string) => {
    return (text || "").replace(/\s*\(Question\s*#\d+\)/gi, "").trim();
  };

  // Filter Questions based on subject selection
  const subjectQs = allQuestions.filter((q) => {
    const qSubj = (q.subject || "").trim().toLowerCase();
    const target = selectedSubject.trim().toLowerCase();
    return qSubj.includes(target) || target.includes(qSubj);
  });

  // Categorize questions
  const mcqQuestions = subjectQs.filter((q) => q.type === "MCQ" || q.type === "Short Answer" || (q.options && q.options.length > 0)).slice(0, mcqCount);
  const descriptiveQuestions = subjectQs.filter((q) => q.type === "Descriptive" && (!q.imageUrl && !(q as any).raw?.imageUrl)).slice(0, descriptiveCount);
  const diagramQuestions = subjectQs.filter((q) => (q.imageUrl || (q as any).raw?.imageUrl || q.type === "Problem Solving")).slice(0, diagramCount);

  // If filtered lists are shorter, pull from general subject pool
  const finalMcqs = mcqQuestions.length > 0 ? mcqQuestions : subjectQs.slice(0, mcqCount);
  const finalDescriptives = descriptiveQuestions.length > 0 ? descriptiveQuestions : subjectQs.slice(mcqCount, mcqCount + descriptiveCount);
  const finalDiagrams = diagramQuestions.length > 0 ? diagramQuestions : subjectQs.slice(mcqCount + descriptiveCount, mcqCount + descriptiveCount + diagramCount);

  const totalQuestionsInPaper = finalMcqs.length + finalDescriptives.length + finalDiagrams.length;

  // Print Action
  const handleTriggerPrint = () => {
    showToast("Opening browser print dialog... Formatting official paper PDF.");
    setTimeout(() => {
      window.print();
    }, 400);
  };

  return (
    <RoleGuard route="/print-paper">
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
          @media print {
            @page {
              size: A4 portrait;
              margin: 12mm 15mm 12mm 15mm;
            }
            html, body {
              background: #ffffff !important;
              margin: 0 !important;
              padding: 0 !important;
              width: 100% !important;
              height: auto !important;
              min-height: 0 !important;
              max-height: none !important;
              overflow: visible !important;
              font-size: 11pt !important;
            }
            .no-print, aside, header, footer, nav, button, [role="status"] {
              display: none !important;
              height: 0 !important;
              margin: 0 !important;
              padding: 0 !important;
              overflow: hidden !important;
            }
            .print-layout-container {
              display: block !important;
              width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              height: auto !important;
              min-height: 0 !important;
            }
            #official-printable-paper {
              position: static !important;
              width: 100% !important;
              max-width: 100% !important;
              padding: 0 !important;
              margin: 0 !important;
              box-shadow: none !important;
              border: none !important;
              background: #ffffff !important;
              page-break-after: avoid;
              break-after: avoid;
            }
            .question-block {
              page-break-inside: avoid;
              break-inside: avoid;
              margin-bottom: 12px !important;
            }
            .part-header {
              page-break-after: avoid;
              break-after: avoid;
              margin-top: 14px !important;
              margin-bottom: 10px !important;
            }
            .end-paper-footer {
              page-break-before: avoid;
              break-before: avoid;
              margin-top: 20px !important;
            }
          }
        `}</style>

        {/* Sidebar */}
        <aside
          className="no-print"
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
            <div style={{ padding: "6px 10px 24px 10px" }}>
              <img
                src="/images/rgu-logo.png"
                alt="Rathinam Global (Deemed to be University)"
                style={{ maxHeight: "38px", width: "auto", objectFit: "contain" }}
              />
            </div>

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
                        filter: isActive ? "drop-shadow(0 0 6px rgba(255,255,255,0.8))" : "none",
                        transition: "filter 0.2s ease",
                      }}
                    />
                    <span style={{ flex: 1, letterSpacing: "0.2px" }}>{item.label}</span>
                    {item.badge && <span className="badge-neon-3d">{item.badge}</span>}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="support-card-3d">
            <div className="shield-icon-3d">
              <Shield size={19} style={{ filter: "drop-shadow(0 0 6px rgba(96, 165, 250, 0.8))" }} />
            </div>
            <strong style={{ display: "block", color: "#ffffff", fontSize: "13.5px", marginBottom: "4px", fontWeight: 700 }}>
              Official COE Exam Cell
            </strong>
            <p style={{ fontSize: "11.5px", color: "#94a3b8", lineHeight: 1.4, margin: "0 0 14px 0" }}>
              Generates Word paper specification prints for all COE departments.
            </p>
          </div>
        </aside>

        {/* Main Workspace */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, height: "100vh", overflow: "hidden" }}>
          <div className="no-print">
            <PortalHeader activeRoute="print-paper" />
          </div>

          <main style={{ flex: 1, padding: "24px 28px", overflowY: "auto", overflowX: "hidden", width: "100%", boxSizing: "border-box" }}>
            {/* Header Title */}
            <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "22px", gap: "16px", flexWrap: "wrap" }}>
              <div>
                <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", margin: "0 0 6px 0", letterSpacing: "-0.4px", display: "flex", alignItems: "center", gap: "8px" }}>
                  Print Question Paper Generator 🖨️
                </h1>
                <p style={{ fontSize: "13.5px", color: "#64748b", margin: 0 }}>
                  Customize MCQ, Descriptive, and Diagram question counts for official paper prints.
                </p>
              </div>

              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <button
                  type="button"
                  onClick={handleTriggerPrint}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 22px",
                    borderRadius: "12px",
                    border: "none",
                    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                    color: "#ffffff",
                    fontSize: "13.5px",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(37, 99, 235, 0.4)",
                  }}
                >
                  <Printer size={16} />
                  <span>Print Question Paper (PDF)</span>
                </button>
              </div>
            </div>

            {/* Grid Layout: Configurator Controls (Left) & Live Word Paper Preview (Right) */}
            <div className="print-layout-container" style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: "22px", alignItems: "start" }}>
              {/* Left Configurator Column */}
              <div className="no-print" style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "20px", boxShadow: "0 4px 12px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column", gap: "18px" }}>
                <div style={{ fontSize: "15px", fontWeight: 800, color: "#1e293b", display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px" }}>
                  <SlidersHorizontal size={18} color="#2563eb" />
                  <span>Question Paper Builder</span>
                </div>

                {/* Subject Selector */}
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                    Select Subject Title:
                  </label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#f8fafc", fontSize: "13px", fontWeight: 700, color: "#1e40af" }}
                  >
                    {subjectsList.map((subj) => (
                      <option key={subj} value={subj}>
                        📚 {subj}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Examination Type */}
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                    Examination Format / Type:
                  </label>
                  <select
                    value={examType}
                    onChange={(e) => setExamType(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#ffffff", fontSize: "12.5px" }}
                  >
                    <option value="End Semester Examination (Regular)">End Semester Examination (Regular)</option>
                    <option value="Mid-Term Internal Assessment">Mid-Term Internal Assessment</option>
                    <option value="Continuous Assessment Test (CAT-I)">Continuous Assessment Test (CAT-I)</option>
                    <option value="Model Examination Paper">Model Examination Paper</option>
                  </select>
                </div>

                {/* Duration & Max Marks */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11.5px", fontWeight: 700, color: "#475569", marginBottom: "4px" }}>
                      Max Marks:
                    </label>
                    <select
                      value={maxMarks}
                      onChange={(e) => setMaxMarks(Number(e.target.value))}
                      style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "12.5px" }}
                    >
                      <option value={100}>100 Marks</option>
                      <option value={75}>75 Marks</option>
                      <option value={50}>50 Marks</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "11.5px", fontWeight: 700, color: "#475569", marginBottom: "4px" }}>
                      Duration:
                    </label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "12.5px" }}
                    >
                      <option value="3 Hours">3 Hours</option>
                      <option value="2 Hours">2 Hours</option>
                      <option value="1.5 Hours">1.5 Hours</option>
                    </select>
                  </div>
                </div>

                <div style={{ borderTop: "1px dashed #cbd5e1", paddingTop: "14px" }}>
                  <div style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a", marginBottom: "12px" }}>
                    📊 Question Type Breakdown Setup:
                  </div>

                  {/* MCQ Questions Slider/Input */}
                  <div style={{ marginBottom: "14px", background: "#f0f9ff", padding: "10px 12px", borderRadius: "10px", border: "1px solid #bae6fd" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 700, color: "#0369a1", marginBottom: "4px" }}>
                      <span>📝 Multiple Choice (MCQ) Questions</span>
                      <span>{mcqCount} Questions</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={25}
                      value={mcqCount}
                      onChange={(e) => setMcqCount(Number(e.target.value))}
                      style={{ width: "100%", accentColor: "#0284c7" }}
                    />
                  </div>

                  {/* Descriptive Questions Slider/Input */}
                  <div style={{ marginBottom: "14px", background: "#f0fdf4", padding: "10px 12px", borderRadius: "10px", border: "1px solid #bbf7d0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 700, color: "#15803d", marginBottom: "4px" }}>
                      <span>✍️ Descriptive / Short Answer Questions</span>
                      <span>{descriptiveCount} Questions</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={20}
                      value={descriptiveCount}
                      onChange={(e) => setDescriptiveCount(Number(e.target.value))}
                      style={{ width: "100%", accentColor: "#16a34a" }}
                    />
                  </div>

                  {/* Diagram Questions Slider/Input */}
                  <div style={{ marginBottom: "14px", background: "#faf5ff", padding: "10px 12px", borderRadius: "10px", border: "1px solid #e9d5ff" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 700, color: "#7e22ce", marginBottom: "4px" }}>
                      <span>📐 Diagram / Figure Attached Questions</span>
                      <span>{diagramCount} Questions</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={15}
                      value={diagramCount}
                      onChange={(e) => setDiagramCount(Number(e.target.value))}
                      style={{ width: "100%", accentColor: "#9333ea" }}
                    />
                  </div>
                </div>

                <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "11.5px", color: "#64748b" }}>
                  <strong>Summary:</strong> Total <strong>{totalQuestionsInPaper}</strong> questions selected from bank for <strong>{selectedSubject}</strong>.
                </div>

                <button
                  type="button"
                  onClick={handleTriggerPrint}
                  style={{
                    width: "100%",
                    padding: "11px",
                    borderRadius: "10px",
                    border: "none",
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    color: "#ffffff",
                    fontSize: "13px",
                    fontWeight: 800,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
                  }}
                >
                  <Printer size={16} />
                  <span>Print Official Paper</span>
                </button>
              </div>

              {/* Right Printable Word Document Paper Area */}
              <div
                id="official-printable-paper"
                style={{
                  background: "#ffffff",
                  border: "1px solid #cbd5e1",
                  borderRadius: "12px",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
                  padding: "40px 48px",
                  position: "relative",
                  overflow: "hidden",
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  color: "#0f172a",
                  lineHeight: 1.6,
                }}
              >
                {/* Header Specification */}
                <div style={{ textAlign: "center", borderBottom: "2px solid #0f172a", paddingBottom: "14px", marginBottom: "20px" }}>
                  <div style={{ fontSize: "18px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>
                    RATHINAM GLOBAL (DEEMED TO BE UNIVERSITY)
                  </div>
                  <div style={{ fontSize: "12.5px", fontWeight: 600, fontFamily: "sans-serif", color: "#334155", marginBottom: "6px" }}>
                    (An Autonomous Institution, Coimbatore - 641021 | Affiliated to UGC & AICTE)
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 700, textTransform: "uppercase", textDecoration: "underline" }}>
                    OFFICIAL END SEMESTER QUESTION PAPER SPECIFICATION
                  </div>
                  <div style={{ fontSize: "12px", fontFamily: "sans-serif", fontWeight: 600, color: "#475569", marginTop: "2px" }}>
                    {examType}
                  </div>
                </div>

                {/* Metadata Table */}
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "12.5px",
                    marginBottom: "20px",
                    background: "#fafafa",
                    border: "1px solid #0f172a",
                    fontFamily: "sans-serif",
                  }}
                >
                  <tbody>
                    <tr>
                      <td style={{ padding: "6px 12px", border: "1px solid #0f172a", fontWeight: 700, width: "18%", background: "#f1f5f9" }}>Course / Subject:</td>
                      <td style={{ padding: "6px 12px", border: "1px solid #0f172a", fontWeight: 700, color: "#1e40af" }}>{selectedSubject}</td>
                      <td style={{ padding: "6px 12px", border: "1px solid #0f172a", fontWeight: 700, width: "15%", background: "#f1f5f9" }}>Duration:</td>
                      <td style={{ padding: "6px 12px", border: "1px solid #0f172a", fontWeight: 600, width: "20%" }}>{duration}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "6px 12px", border: "1px solid #0f172a", fontWeight: 700, background: "#f1f5f9" }}>Semester/Year:</td>
                      <td style={{ padding: "6px 12px", border: "1px solid #0f172a", fontWeight: 600 }}>{semesterYear}</td>
                      <td style={{ padding: "6px 12px", border: "1px solid #0f172a", fontWeight: 700, background: "#f1f5f9" }}>Max. Marks:</td>
                      <td style={{ padding: "6px 12px", border: "1px solid #0f172a", fontWeight: 700, color: "#16a34a" }}>{maxMarks} Marks</td>
                    </tr>
                  </tbody>
                </table>

                {/* General Instructions */}
                <div style={{ fontSize: "11.5px", fontStyle: "italic", border: "1px dashed #cbd5e1", padding: "8px 14px", borderRadius: "6px", marginBottom: "22px", background: "#f8fafc", fontFamily: "sans-serif" }}>
                  <strong>Instructions:</strong> Answer all sections as per regulations. Draw neat diagrams wherever necessary. All dimensions are in mm unless specified otherwise.
                </div>

                {/* PART A: MCQ & Short Answer Questions */}
                {finalMcqs.length > 0 && (
                  <div style={{ marginBottom: "26px" }}>
                    <div className="part-header" style={{ textAlign: "center", borderBottom: "1.5px solid #0f172a", paddingBottom: "4px", marginBottom: "14px" }}>
                      <strong style={{ fontSize: "14px", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                        PART — A (MULTIPLE CHOICE & SHORT ANSWER QUESTIONS)
                      </strong>
                      <div style={{ fontSize: "11.5px", fontFamily: "sans-serif", color: "#475569", marginTop: "2px" }}>
                        Answer ALL Questions ({finalMcqs.length} × 2 = {finalMcqs.length * 2} Marks)
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      {finalMcqs.map((q, idx) => (
                        <div key={q.id || idx} className="question-block" style={{ fontSize: "13.5px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
                            <div style={{ flex: 1 }}>
                              <strong>Q{idx + 1}.</strong> {cleanQuestionText(q.question)}
                            </div>
                            <div style={{ fontWeight: 700, flexShrink: 0, fontSize: "13px" }}>[2]</div>
                          </div>

                          {q.options && q.options.length > 0 && (
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginTop: "8px", marginLeft: "20px", fontSize: "12.5px", fontFamily: "sans-serif" }}>
                              {q.options.map((opt: string, optIdx: number) => (
                                <div key={optIdx}>
                                  <strong>({String.fromCharCode(65 + optIdx)})</strong> {opt}
                                </div>
                              ))}
                            </div>
                          )}

                          <div style={{ display: "flex", gap: "12px", fontSize: "10.5px", color: "#64748b", fontFamily: "sans-serif", marginTop: "4px", marginLeft: "20px" }}>
                            <span>Unit: {q.unit || "Unit I"}</span>
                            {q.bloomLevel && <span>Bloom's: {q.bloomLevel}</span>}
                            <span>CO: CO{(idx % 4) + 1}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* PART B: Descriptive Questions */}
                {finalDescriptives.length > 0 && (
                  <div style={{ marginBottom: "26px" }}>
                    <div className="part-header" style={{ textAlign: "center", borderBottom: "1.5px solid #0f172a", paddingBottom: "4px", marginBottom: "14px" }}>
                      <strong style={{ fontSize: "14px", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                        PART — B (DESCRIPTIVE & ANALYTICAL QUESTIONS)
                      </strong>
                      <div style={{ fontSize: "11.5px", fontFamily: "sans-serif", color: "#475569", marginTop: "2px" }}>
                        Answer ALL Questions ({finalDescriptives.length} × 5 = {finalDescriptives.length * 5} Marks)
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                      {finalDescriptives.map((q, idx) => (
                        <div key={q.id || idx} className="question-block" style={{ fontSize: "13.5px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
                            <div style={{ flex: 1 }}>
                              <strong>Q{finalMcqs.length + idx + 1}.</strong> {cleanQuestionText(q.question)}
                            </div>
                            <div style={{ fontWeight: 700, flexShrink: 0, fontSize: "13px" }}>[5]</div>
                          </div>

                          <div style={{ display: "flex", gap: "12px", fontSize: "10.5px", color: "#64748b", fontFamily: "sans-serif", marginTop: "4px", marginLeft: "20px" }}>
                            <span>Unit: {q.unit || "Unit II"}</span>
                            {q.bloomLevel && <span>Bloom's: {q.bloomLevel}</span>}
                            <span>CO: CO{(idx % 4) + 1}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* PART C: Diagram / Problem-Solving Questions */}
                {finalDiagrams.length > 0 && (
                  <div style={{ marginBottom: "26px" }}>
                    <div className="part-header" style={{ textAlign: "center", borderBottom: "1.5px solid #0f172a", paddingBottom: "4px", marginBottom: "14px" }}>
                      <strong style={{ fontSize: "14px", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                        PART — C (PROBLEM SOLVING & DIAGRAM-BASED QUESTIONS)
                      </strong>
                      <div style={{ fontSize: "11.5px", fontFamily: "sans-serif", color: "#475569", marginTop: "2px" }}>
                        Answer ALL Questions ({finalDiagrams.length} × 10 = {finalDiagrams.length * 10} Marks)
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
                      {finalDiagrams.map((q, idx) => (
                        <div key={q.id || idx} className="question-block" style={{ fontSize: "13.5px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
                            <div style={{ flex: 1 }}>
                              <strong>Q{finalMcqs.length + finalDescriptives.length + idx + 1}.</strong> {cleanQuestionText(q.question)}
                            </div>
                            <div style={{ fontWeight: 700, flexShrink: 0, fontSize: "13px" }}>[{q.marks || 10}]</div>
                          </div>

                          {(q.imageUrl || (q as any).raw?.imageUrl) && (
                            <div style={{ marginTop: "8px", marginLeft: "20px", textAlign: "center", border: "1px solid #e2e8f0", padding: "8px", borderRadius: "8px", background: "#fafafa" }}>
                              <img src={q.imageUrl || (q as any).raw?.imageUrl} alt="Question Diagram" style={{ maxHeight: "170px", maxWidth: "100%", objectFit: "contain" }} />
                              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px", fontStyle: "italic" }}>
                                Figure Q{finalMcqs.length + finalDescriptives.length + idx + 1}: {q.diagramTitle || "Engineering Diagram"}
                              </div>
                            </div>
                          )}

                          <div style={{ display: "flex", gap: "12px", fontSize: "10.5px", color: "#64748b", fontFamily: "sans-serif", marginTop: "4px", marginLeft: "20px" }}>
                            <span>Unit: {q.unit || "Unit III"}</span>
                            {q.bloomLevel && <span>Bloom's: {q.bloomLevel}</span>}
                            <span>CO: CO{(idx % 4) + 1}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer Specification */}
                <div className="end-paper-footer" style={{ textAlign: "center", marginTop: "24px", borderTop: "1px solid #cbd5e1", paddingTop: "12px", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>
                  *** END OF QUESTION PAPER ***
                </div>
              </div>
            </div>
          </main>

          <div className="no-print">
            <PortalFooter />
          </div>
        </div>

        <ToastNotification
          message={toast.message}
          type={toast.type || "success"}
          isVisible={toast.isVisible}
          onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
        />
      </div>
    </RoleGuard>
  );
}
