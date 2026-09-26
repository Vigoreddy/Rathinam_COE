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
  Calendar,
  Filter,
  Check,
  Archive,
  Trash2,
  Eye,
  Plus,
  Clock,
  XCircle,
  Mail,
  SlidersHorizontal,
  Cloud,
  MoreHorizontal,
  ChevronLeft,
  Layers,
  Download,
} from "lucide-react";
import { examStore, NotificationItem as StoreNotificationItem } from "../lib/examStore";
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

export default function NotificationsPage() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState("notifications");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // CRUD state
  const [notifications, setNotifications] = useState<StoreNotificationItem[]>([]);
  const [viewingNotif, setViewingNotif] = useState<StoreNotificationItem | null>(null);
  const [editingNotif, setEditingNotif] = useState<StoreNotificationItem | null>(null);
  const [deletingNotif, setDeletingNotif] = useState<StoreNotificationItem | null>(null);
  const [isAddingNotif, setIsAddingNotif] = useState(false);

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

  useEffect(() => {
    const loadNotifs = () => {
      setNotifications(examStore.getNotifications());
    };
    loadNotifs();
    window.addEventListener("exam-cell-store-update", loadNotifs);
    return () => window.removeEventListener("exam-cell-store-update", loadNotifs);
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
    { id: "approval", label: "Approval", icon: CheckSquare, route: "/approval" },
    { id: "reports", label: "Reports", icon: BarChart2, route: "/reports" },
    { id: "notifications", label: "Notifications", icon: Bell, hasArrow: true, route: "/notifications" },
    { id: "manual-questions", label: "Manual Questions", icon: Edit3, badge: "New", route: "/manual-questions" },
    { id: "print-paper", label: "Print Question Paper", icon: Printer, badge: "Print", route: "/print-paper" },
    { id: "settings", label: "Settings", icon: Settings, route: "/settings" },
  ];

  const menuItems = rawMenuItems.filter((item) =>
    hasPermission(currentUser.role, item.route, currentUser.isSubjectFaculty)
  );

  const totalCount = notifications.length;
  const unreadCount = notifications.filter((n) => n.status.toLowerCase() === "unread").length;
  const readCount = notifications.filter((n) => n.status.toLowerCase() === "read").length;
  const highPriorityCount = notifications.filter((n) => n.priority.toLowerCase() === "high").length;

  const filteredNotifications = notifications.filter((n) => {
    if (selectedType !== "all") {
      const typeMap: Record<string, string> = {
        qb: "Question Bank",
        approval: "Approval",
        bulk: "Bulk Upload",
        verify: "Verify Questions",
        manual: "Manual Questions",
        system: "System",
        reports: "Reports",
      };
      const expectedType = typeMap[selectedType] || selectedType;
      if (n.type.toLowerCase() !== expectedType.toLowerCase()) return false;
    }
    if (selectedStatus !== "all" && n.status.toLowerCase() !== selectedStatus.toLowerCase()) return false;
    if (selectedPriority !== "all" && n.priority.toLowerCase() !== selectedPriority.toLowerCase()) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        n.title.toLowerCase().includes(q) ||
        n.description.toLowerCase().includes(q) ||
        n.relatedTo.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedType, selectedStatus, selectedPriority]);

  const itemsPerPage = 8;
  const totalPages = Math.max(1, Math.ceil(filteredNotifications.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedNotifications = filteredNotifications.slice(startIndex, startIndex + itemsPerPage);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredNotifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredNotifications.map((n) => n.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkMarkRead = () => {
    selectedIds.forEach((id) => {
      examStore.saveNotification({ id, status: "Read" });
    });
    triggerToast(`Marked ${selectedIds.length} notifications as Read`, "success");
    setSelectedIds([]);
  };

  const handleBulkMarkUnread = () => {
    selectedIds.forEach((id) => {
      examStore.saveNotification({ id, status: "Unread" });
    });
    triggerToast(`Marked ${selectedIds.length} notifications as Unread`, "info");
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Delete ${selectedIds.length} selected notifications?`)) {
      selectedIds.forEach((id) => {
        examStore.deleteNotification(id);
      });
      triggerToast(`Deleted ${selectedIds.length} notifications`, "info");
      setSelectedIds([]);
    }
  };

  const handleExportNotifs = () => {
    const rows = filteredNotifications.map((n) => ({
      ID: n.id,
      Title: n.title,
      Description: n.description,
      Type: n.type,
      Priority: n.priority,
      RelatedTo: n.relatedTo,
      Status: n.status,
      Time: n.exactTime || n.timeAgo,
    }));
    examStore.exportToCsv("notifications-export.csv", rows);
    triggerToast(`Exported ${rows.length} notifications to CSV!`, "success");
  };

  const handleReset = () => {
    setSelectedType("all");
    setSelectedStatus("all");
    setSelectedPriority("all");
    setSearchQuery("");
  };

  const notifFields: FormFieldDef[] = [
    { name: "title", label: "Notification Title", type: "text", required: true },
    { name: "description", label: "Description / Message Content", type: "textarea", required: true },
    {
      name: "type",
      label: "Notification Category",
      type: "select",
      options: ["Question Bank", "Approval", "Bulk Upload", "System", "Exam Cell"],
      required: true,
    },
    {
      name: "priority",
      label: "Priority Level",
      type: "select",
      options: ["High", "Medium", "Low"],
      required: true,
    },
    { name: "relatedTo", label: "Related Subject / Module", type: "text", required: true },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: ["Unread", "Read"],
      required: true,
    },
  ];

  return (
    <RoleGuard route="/notifications">
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
          <nav style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
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
                  className={`sidebar-btn-3d ${
                    isActive ? "sidebar-btn-active" : "sidebar-btn-inactive"
                  }`}
                >
                  <IconComp size={18} className="nav-icon-3d" />
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
                        filter: "drop-shadow(0 0 4px rgba(255,255,255,0.7))",
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
        <PortalHeader activeRoute="notifications" />


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
                <span>Notifications</span>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "32px",
                    height: "32px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
                    boxShadow: "0 4px 14px rgba(99, 102, 241, 0.45), inset 0 1px 2px rgba(255, 255, 255, 0.5)",
                    color: "#ffffff",
                    animation: "float3D 4s infinite ease-in-out",
                  }}
                >
                  <Bell size={18} style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,0.9)) drop-shadow(0 0 10px rgba(99, 102, 241, 0.8))" }} />
                </div>
              </h1>
              <p style={{ fontSize: "13.5px", color: "#64748b", margin: 0 }}>
                Stay updated with important alerts and activities across the system.
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

          {/* ================= Top 4 Metric Cards (Matching Bulk Upload / Reports 3D Glow) ================= */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "18px",
              marginBottom: "28px",
            }}
          >
            {/* Metric 1: Total Notifications - 3D Blue */}
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
                  <Bell
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
                Total Notifications
              </div>
              <div style={{ fontSize: "32px", fontWeight: 800, lineHeight: 1, marginBottom: "6px", textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
                {totalCount}
              </div>
              <div style={{ fontSize: "11.5px", opacity: 0.85 }}>All Time</div>
            </div>

            {/* Metric 2: Unread Notifications - 3D Cyan */}
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
                  <Mail
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
                Unread Notifications
              </div>
              <div style={{ fontSize: "32px", fontWeight: 800, lineHeight: 1, marginBottom: "6px", textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
                {unreadCount}
              </div>
              <div style={{ fontSize: "11.5px", opacity: 0.85 }}>Requires Attention</div>
            </div>

            {/* Metric 3: Read Notifications - 3D Emerald */}
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
                Read Notifications
              </div>
              <div style={{ fontSize: "32px", fontWeight: 800, lineHeight: 1, marginBottom: "6px", textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
                {readCount}
              </div>
              <div style={{ fontSize: "11.5px", opacity: 0.85 }}>Already Read</div>
            </div>

            {/* Metric 4: Archived Notifications - 3D Orange */}
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
                  <Archive
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
                High Priority Alerts
              </div>
              <div style={{ fontSize: "32px", fontWeight: 800, lineHeight: 1, marginBottom: "6px", textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
                {highPriorityCount}
              </div>
              <div style={{ fontSize: "11.5px", opacity: 0.85 }}>Urgent Attention</div>
            </div>
          </div>

          {/* ================= Main Section: Left Table & Right Sidebars ================= */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 310px",
              gap: "24px",
              alignItems: "start",
            }}
          >
            {/* ================= LEFT WIDE CARD: All Notifications Table ================= */}
            <div
              className="widget-card-3d"
              style={{
                background: "#ffffff",
                borderRadius: "20px",
                border: "1px solid #e2e8f0",
                padding: "24px",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.04)",
              }}
            >
              {/* Table Header Controls */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "18px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div className="action-mini-icon-blue" style={{ width: "32px", height: "32px" }}>
                    <Bell size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
                      All Notifications
                    </div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>
                      Manage alerts, events, and pending activity logs
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={handleExportNotifs}
                    className="filter-btn-3d"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 14px",
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0",
                      background: "#ffffff",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#475569",
                      cursor: "pointer",
                      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    <Download size={13} />
                    <span>Export CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      notifications.forEach((n) => examStore.saveNotification({ id: n.id, status: "Read" }));
                      triggerToast("All notifications marked as read!", "success");
                    }}
                    className="primary-btn-3d"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 15px",
                      borderRadius: "10px",
                      border: "none",
                      background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#ffffff",
                      cursor: "pointer",
                      boxShadow: "0 4px 14px rgba(99, 102, 241, 0.35)",
                    }}
                  >
                    <CheckCircle2 size={14} style={{ filter: "drop-shadow(0 0 3px rgba(255,255,255,0.8))" }} />
                    <span>Mark all as read</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsAddingNotif(true)}
                    className="primary-btn-3d"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 15px",
                      borderRadius: "10px",
                      border: "none",
                      background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#ffffff",
                      cursor: "pointer",
                      boxShadow: "0 4px 14px rgba(16, 185, 129, 0.35)",
                    }}
                  >
                    <Plus size={14} style={{ filter: "drop-shadow(0 0 3px rgba(255,255,255,0.8))" }} />
                    <span>Broadcast Notice</span>
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div style={{ position: "relative", marginBottom: "16px" }}>
                <Search
                  size={15}
                  color="#94a3b8"
                  style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px 10px 38px",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    background: "#f8fafc",
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
              </div>

              {/* Filter Bar */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr 1.6fr auto",
                  gap: "12px",
                  alignItems: "flex-end",
                  marginBottom: "20px",
                }}
              >
                {/* Type Filter */}
                <div>
                  <label style={{ display: "block", fontSize: "11px", color: "#64748b", marginBottom: "4px" }}>
                    Type
                  </label>
                  <div style={{ position: "relative" }}>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 24px 8px 10px",
                        borderRadius: "10px",
                        border: "1px solid #e2e8f0",
                        background: "#ffffff",
                        fontSize: "12px",
                        color: "#334155",
                        appearance: "none",
                        outline: "none",
                        cursor: "pointer",
                      }}
                    >
                      <option value="all">All Types</option>
                      <option value="qb">Question Bank</option>
                      <option value="approval">Approval</option>
                      <option value="bulk">Bulk Upload</option>
                      <option value="verify">Verify Questions</option>
                      <option value="manual">Manual Questions</option>
                      <option value="system">System</option>
                      <option value="reports">Reports</option>
                    </select>
                    <ChevronDown size={12} color="#94a3b8" style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label style={{ display: "block", fontSize: "11px", color: "#64748b", marginBottom: "4px" }}>
                    Status
                  </label>
                  <div style={{ position: "relative" }}>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 24px 8px 10px",
                        borderRadius: "10px",
                        border: "1px solid #e2e8f0",
                        background: "#ffffff",
                        fontSize: "12px",
                        color: "#334155",
                        appearance: "none",
                        outline: "none",
                        cursor: "pointer",
                      }}
                    >
                      <option value="all">All Status</option>
                      <option value="unread">Unread</option>
                      <option value="read">Read</option>
                    </select>
                    <ChevronDown size={12} color="#94a3b8" style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  </div>
                </div>

                {/* Priority Filter */}
                <div>
                  <label style={{ display: "block", fontSize: "11px", color: "#64748b", marginBottom: "4px" }}>
                    Priority
                  </label>
                  <div style={{ position: "relative" }}>
                    <select
                      value={selectedPriority}
                      onChange={(e) => setSelectedPriority(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 24px 8px 10px",
                        borderRadius: "10px",
                        border: "1px solid #e2e8f0",
                        background: "#ffffff",
                        fontSize: "12px",
                        color: "#334155",
                        appearance: "none",
                        outline: "none",
                        cursor: "pointer",
                      }}
                    >
                      <option value="all">All Priority</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                    <ChevronDown size={12} color="#94a3b8" style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  </div>
                </div>

                {/* Date Range */}
                <div>
                  <label style={{ display: "block", fontSize: "11px", color: "#64748b", marginBottom: "4px" }}>
                    Date Range
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="text"
                      defaultValue="01 Aug 2024 - 31 Aug 2024"
                      readOnly
                      style={{
                        width: "100%",
                        padding: "8px 32px 8px 10px",
                        borderRadius: "10px",
                        border: "1px solid #e2e8f0",
                        background: "#ffffff",
                        fontSize: "12px",
                        color: "#334155",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                    <Calendar
                      size={14}
                      color="#94a3b8"
                      style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                    />
                  </div>
                </div>

                {/* Reset Button */}
                <div>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="filter-btn-3d"
                    style={{
                      padding: "8px 18px",
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0",
                      background: "#ffffff",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#475569",
                      cursor: "pointer",
                    }}
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Bulk Actions Banner */}
              {selectedIds.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 18px",
                    marginBottom: "16px",
                    background: "linear-gradient(135deg, #ede9fe 0%, #e0e7ff 100%)",
                    border: "1px solid #c7d2fe",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(99, 102, 241, 0.15)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <CheckCircle2 size={18} color="#4f46e5" />
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#3730a3" }}>
                      {selectedIds.length} notification{selectedIds.length > 1 ? "s" : ""} selected
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      type="button"
                      onClick={handleBulkMarkRead}
                      style={{
                        padding: "6px 12px",
                        fontSize: "12px",
                        fontWeight: 600,
                        background: "#4f46e5",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                      }}
                    >
                      Mark Read
                    </button>
                    <button
                      type="button"
                      onClick={handleBulkMarkUnread}
                      style={{
                        padding: "6px 12px",
                        fontSize: "12px",
                        fontWeight: 600,
                        background: "#0ea5e9",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                      }}
                    >
                      Mark Unread
                    </button>
                    <button
                      type="button"
                      onClick={handleBulkDelete}
                      style={{
                        padding: "6px 12px",
                        fontSize: "12px",
                        fontWeight: 600,
                        background: "#ef4444",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                      }}
                    >
                      Delete Selected
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedIds([])}
                      style={{
                        padding: "6px 10px",
                        fontSize: "12px",
                        fontWeight: 600,
                        background: "#ffffff",
                        color: "#64748b",
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        cursor: "pointer",
                      }}
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}

              {/* Notifications Table */}
              <div className="no-scrollbar" style={{ overflowX: "auto", scrollbarWidth: "none", msOverflowStyle: "none" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <th style={{ padding: "10px 8px", width: "32px" }}>
                        <input
                          type="checkbox"
                          checked={selectedIds.length === filteredNotifications.length && filteredNotifications.length > 0}
                          onChange={toggleSelectAll}
                          style={{ cursor: "pointer", accentColor: "#4f46e5" }}
                        />
                      </th>
                      <th style={{ padding: "10px 10px", fontSize: "11.5px", fontWeight: 600, color: "#64748b" }}>
                        Notification
                      </th>
                      <th style={{ padding: "10px 10px", fontSize: "11.5px", fontWeight: 600, color: "#64748b" }}>
                        Type
                      </th>
                      <th style={{ padding: "10px 10px", fontSize: "11.5px", fontWeight: 600, color: "#64748b" }}>
                        Priority
                      </th>
                      <th style={{ padding: "10px 10px", fontSize: "11.5px", fontWeight: 600, color: "#64748b" }}>
                        Related To
                      </th>
                      <th style={{ padding: "10px 10px", fontSize: "11.5px", fontWeight: 600, color: "#64748b" }}>
                        Time
                      </th>
                      <th style={{ padding: "10px 10px", fontSize: "11.5px", fontWeight: 600, color: "#64748b" }}>
                        Status
                      </th>
                      <th style={{ padding: "10px 10px", fontSize: "11.5px", fontWeight: 600, color: "#64748b", textAlign: "center" }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedNotifications.map((item) => {
                      const isChecked = selectedIds.includes(item.id);

                      // Icon
                      const getIconDetails = () => {
                        if (item.type === "Question Bank") return { Icon: BookOpen, bg: "#ede9fe", col: "#7c3aed" };
                        if (item.type === "Approval") return { Icon: CheckCircle2, bg: "#dcfce7", col: "#16a34a" };
                        if (item.type === "Bulk Upload") return { Icon: Upload, bg: "#ffedd5", col: "#ea580c" };
                        return { Icon: Bell, bg: "#eff6ff", col: "#2563eb" };
                      };
                      const { Icon: IconComponent, bg: iconBg, col: iconColor } = getIconDetails();

                      // Priority Pill Styles
                      let priorityBg = "#fee2e2";
                      let priorityColor = "#ef4444";
                      if (item.priority === "Medium") {
                        priorityBg = "#fef3c7";
                        priorityColor = "#d97706";
                      } else if (item.priority === "Low") {
                        priorityBg = "#f1f5f9";
                        priorityColor = "#64748b";
                      }

                      // Status Pill Styles
                      const isUnread = item.status === "Unread";
                      const statusBg = isUnread ? "#eff6ff" : "#f1f5f9";
                      const statusColor = isUnread ? "#2563eb" : "#64748b";

                      return (
                        <tr
                          key={item.id}
                          className="table-row-3d"
                          style={{
                            borderBottom: "1px solid #f1f5f9",
                            background: isChecked ? "rgba(79, 70, 229, 0.04)" : "transparent",
                            transition: "all 0.2s ease",
                          }}
                        >
                          {/* Checkbox */}
                          <td style={{ padding: "14px 8px" }}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleSelect(item.id)}
                              style={{ cursor: "pointer", accentColor: "#4f46e5" }}
                            />
                          </td>

                          {/* Notification (Icon + Title + Description) */}
                          <td style={{ padding: "14px 10px", maxWidth: "280px" }}>
                            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                              <div
                                style={{
                                  width: "34px",
                                  height: "34px",
                                  borderRadius: "10px",
                                  background: iconBg,
                                  color: iconColor,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                  marginTop: "2px",
                                  boxShadow: `0 3px 10px ${iconColor}28, inset 0 1px 1px rgba(255,255,255,0.7)`,
                                  border: `1px solid ${iconColor}33`,
                                }}
                              >
                                <IconComponent size={17} style={{ filter: `drop-shadow(0 0 3px ${iconColor}77)` }} />
                              </div>
                              <div>
                                <strong style={{ display: "block", fontSize: "13px", color: "#0f172a", marginBottom: "2px" }}>
                                  {item.title}
                                </strong>
                                <span style={{ fontSize: "11px", color: "#64748b", lineHeight: 1.35, display: "block" }}>
                                  {item.description}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Type */}
                          <td style={{ padding: "14px 10px" }}>
                            <span
                              style={{
                                display: "inline-block",
                                padding: "4px 10px",
                                borderRadius: "8px",
                                fontSize: "11px",
                                fontWeight: 600,
                                background: item.typeBg || "#f1f5f9",
                                color: item.typeColor || "#475569",
                                border: `1px solid #e2e8f0`,
                              }}
                            >
                              {item.type}
                            </span>
                          </td>

                          {/* Priority */}
                          <td style={{ padding: "14px 10px" }}>
                            <span
                              style={{
                                display: "inline-block",
                                padding: "4px 10px",
                                borderRadius: "8px",
                                fontSize: "11px",
                                fontWeight: 700,
                                background: priorityBg,
                                color: priorityColor,
                                border: `1px solid ${priorityColor}25`,
                              }}
                            >
                              {item.priority}
                            </span>
                          </td>

                          {/* Related To */}
                          <td style={{ padding: "14px 10px", whiteSpace: "nowrap" }}>
                            <div style={{ fontSize: "12px", fontWeight: 600, color: "#1e293b" }}>
                              {item.relatedTo}
                            </div>
                            {item.relatedSub && (
                              <div style={{ fontSize: "11px", color: "#64748b" }}>
                                {item.relatedSub}
                              </div>
                            )}
                          </td>

                          {/* Time */}
                          <td style={{ padding: "14px 10px", whiteSpace: "nowrap" }}>
                            <div style={{ fontSize: "11.5px", fontWeight: 600, color: "#1e293b" }}>
                              {item.timeAgo}
                            </div>
                            <div style={{ fontSize: "10.5px", color: "#94a3b8" }}>
                              {item.exactTime}
                            </div>
                          </td>

                          {/* Status */}
                          <td style={{ padding: "14px 10px" }}>
                            <span
                              style={{
                                display: "inline-block",
                                padding: "4px 10px",
                                borderRadius: "8px",
                                fontSize: "11px",
                                fontWeight: 700,
                                background: statusBg,
                                color: statusColor,
                                border: `1px solid ${statusColor}30`,
                              }}
                            >
                              {item.status}
                            </span>
                          </td>

                          {/* Actions */}
                          <td style={{ padding: "14px 10px", textAlign: "center" }}>
                            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                              <CrudActionButtons
                                onView={() => setViewingNotif(item)}
                                onEdit={() => setEditingNotif(item)}
                                onDelete={() => setDeletingNotif(item)}
                                viewTitle="View Notification"
                                editTitle="Edit Notification"
                                deleteTitle="Delete Notification"
                                size={32}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  examStore.saveNotification({
                                    id: item.id,
                                    status: item.status === "Read" ? "Unread" : "Read",
                                  });
                                  triggerToast(`Marked as ${item.status === "Read" ? "Unread" : "Read"}`, "info");
                                }}
                                title={item.status === "Read" ? "Mark as Unread" : "Mark as Read"}
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
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {/* Pagination */}
              <Pagination
                currentPage={safeCurrentPage}
                totalItems={filteredNotifications.length}
                itemsPerPage={itemsPerPage}
                onPageChange={(p) => setCurrentPage(p)}
                itemName="notifications"
              />
            </div>

            {/* ================= RIGHT COLUMN: Summary & Quick Actions ================= */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Card 1: Notification Summary */}
              <div
                className="widget-card-3d"
                style={{
                  background: "#ffffff",
                  borderRadius: "20px",
                  padding: "20px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.04)",
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
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div className="action-mini-icon-blue" style={{ width: "30px", height: "30px" }}>
                      <Layers size={15} />
                    </div>
                    <span style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
                      Notification Summary
                    </span>
                  </div>
                  <button
                    type="button"
                    className="filter-btn-3d"
                    style={{
                      background: "linear-gradient(135deg, rgba(37,99,235,0.08), rgba(59,130,246,0.15))",
                      border: "1px solid rgba(59,130,246,0.25)",
                      color: "#2563eb",
                      fontSize: "11px",
                      fontWeight: 700,
                      padding: "4px 10px",
                      borderRadius: "8px",
                      cursor: "pointer",
                    }}
                  >
                    View All
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div className="action-mini-icon-purple" style={{ width: "26px", height: "26px" }}>
                        <BookOpen size={13} />
                      </div>
                      <span style={{ fontSize: "12.5px", color: "#334155", fontWeight: 500 }}>
                        Question Bank
                      </span>
                    </div>
                    <strong style={{ fontSize: "13.5px", color: "#0f172a" }}>
                      {notifications.filter((n) => n.type === "Question Bank").length}
                    </strong>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div className="action-mini-icon-green" style={{ width: "26px", height: "26px" }}>
                        <CheckCircle2 size={13} />
                      </div>
                      <span style={{ fontSize: "12.5px", color: "#334155", fontWeight: 500 }}>
                        Approval
                      </span>
                    </div>
                    <strong style={{ fontSize: "13.5px", color: "#0f172a" }}>
                      {notifications.filter((n) => n.type === "Approval").length}
                    </strong>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div className="action-mini-icon-blue" style={{ width: "26px", height: "26px" }}>
                        <CheckSquare size={13} />
                      </div>
                      <span style={{ fontSize: "12.5px", color: "#334155", fontWeight: 500 }}>
                        Verify Questions
                      </span>
                    </div>
                    <strong style={{ fontSize: "13.5px", color: "#0f172a" }}>
                      {notifications.filter((n) => n.type === "Verify Questions").length}
                    </strong>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div className="action-mini-icon-orange" style={{ width: "26px", height: "26px" }}>
                        <Upload size={13} />
                      </div>
                      <span style={{ fontSize: "12.5px", color: "#334155", fontWeight: 500 }}>
                        Bulk Upload
                      </span>
                    </div>
                    <strong style={{ fontSize: "13.5px", color: "#0f172a" }}>
                      {notifications.filter((n) => n.type === "Bulk Upload").length}
                    </strong>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div className="action-mini-icon-purple" style={{ width: "26px", height: "26px" }}>
                        <Edit3 size={13} />
                      </div>
                      <span style={{ fontSize: "12.5px", color: "#334155", fontWeight: 500 }}>
                        Manual Questions
                      </span>
                    </div>
                    <strong style={{ fontSize: "13.5px", color: "#0f172a" }}>
                      {notifications.filter((n) => n.type === "Manual Questions").length}
                    </strong>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div className="action-mini-icon-orange" style={{ width: "26px", height: "26px" }}>
                        <Bell size={13} />
                      </div>
                      <span style={{ fontSize: "12.5px", color: "#334155", fontWeight: 500 }}>
                        System
                      </span>
                    </div>
                    <strong style={{ fontSize: "13.5px", color: "#0f172a" }}>
                      {notifications.filter((n) => n.type === "System").length}
                    </strong>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div className="action-mini-icon-cyan" style={{ width: "26px", height: "26px" }}>
                        <BarChart2 size={13} />
                      </div>
                      <span style={{ fontSize: "12.5px", color: "#334155", fontWeight: 500 }}>
                        Reports
                      </span>
                    </div>
                    <strong style={{ fontSize: "13.5px", color: "#0f172a" }}>
                      {notifications.filter((n) => n.type === "Reports").length}
                    </strong>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div className="action-mini-icon-blue" style={{ width: "26px", height: "26px" }}>
                        <Cloud size={13} />
                      </div>
                      <span style={{ fontSize: "12.5px", color: "#334155", fontWeight: 500 }}>
                        Others / Exam Cell
                      </span>
                    </div>
                    <strong style={{ fontSize: "13.5px", color: "#0f172a" }}>
                      {notifications.filter((n) => !["Question Bank", "Approval", "Verify Questions", "Bulk Upload", "Manual Questions", "System", "Reports"].includes(n.type)).length}
                    </strong>
                  </div>

                  <div
                    style={{
                      borderTop: "1px solid #f1f5f9",
                      paddingTop: "12px",
                      marginTop: "4px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Clock size={14} color="#94a3b8" />
                      <span style={{ fontSize: "11.5px", color: "#64748b" }}>Live Status</span>
                    </div>
                    <span style={{ fontSize: "11.5px", color: "#059669", fontWeight: 700 }}>
                      Active & Synced
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Quick Actions */}
              <div
                className="widget-card-3d"
                style={{
                  background: "#ffffff",
                  borderRadius: "20px",
                  padding: "20px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.04)",
                }}
              >
                <div style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", marginBottom: "16px" }}>
                  Quick Actions
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {/* Action 1: Mark all as read */}
                  <div
                    onClick={() => {
                      notifications.forEach((n) => examStore.saveNotification({ id: n.id, status: "Read" }));
                      triggerToast("All notifications marked as read!", "success");
                    }}
                    className="activity-row-3d"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      cursor: "pointer",
                      padding: "8px",
                      borderRadius: "12px",
                    }}
                  >
                    <div className="action-mini-icon-blue" style={{ width: "36px", height: "36px" }}>
                      <Cloud size={17} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ display: "block", fontSize: "12.5px", color: "#0f172a" }}>
                        Mark all as read
                      </strong>
                      <span style={{ fontSize: "11px", color: "#64748b" }}>Mark all alerts as completed</span>
                    </div>
                    <ChevronRight size={16} color="#94a3b8" />
                  </div>

                  {/* Action 2: Archive all */}
                  <div
                    onClick={() => {
                      notifications.forEach((n) => examStore.saveNotification({ id: n.id, status: "Read" }));
                      triggerToast("All unread notifications archived to history.", "info");
                    }}
                    className="activity-row-3d"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      cursor: "pointer",
                      padding: "8px",
                      borderRadius: "12px",
                    }}
                  >
                    <div className="action-mini-icon-orange" style={{ width: "36px", height: "36px" }}>
                      <Archive size={17} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ display: "block", fontSize: "12.5px", color: "#0f172a" }}>
                        Archive all
                      </strong>
                      <span style={{ fontSize: "11px", color: "#64748b" }}>Archive all read notifications</span>
                    </div>
                    <ChevronRight size={16} color="#94a3b8" />
                  </div>

                  {/* Action 3: Notification Settings */}
                  <div
                    onClick={() => router.push("/settings")}
                    className="activity-row-3d"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      cursor: "pointer",
                      padding: "8px",
                      borderRadius: "12px",
                    }}
                  >
                    <div className="action-mini-icon-purple" style={{ width: "36px", height: "36px" }}>
                      <Settings size={17} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ display: "block", fontSize: "12.5px", color: "#0f172a" }}>
                        Notification Settings
                      </strong>
                      <span style={{ fontSize: "11px", color: "#64748b" }}>Configure portal preferences</span>
                    </div>
                    <ChevronRight size={16} color="#94a3b8" />
                  </div>

                  {/* Action 4: Clear all notifications */}
                  <div
                    onClick={() => {
                      if (window.confirm("Are you sure you want to clear all notifications?")) {
                        notifications.forEach((n) => examStore.deleteNotification(n.id));
                        triggerToast("All notifications cleared!", "info");
                      }
                    }}
                    className="activity-row-3d"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      cursor: "pointer",
                      padding: "8px",
                      borderRadius: "12px",
                    }}
                  >
                    <div className="action-mini-icon-red" style={{ width: "36px", height: "36px" }}>
                      <Trash2 size={17} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ display: "block", fontSize: "12.5px", color: "#0f172a" }}>
                        Clear all notifications
                      </strong>
                      <span style={{ fontSize: "11px", color: "#64748b" }}>Remove all notification items</span>
                    </div>
                    <ChevronRight size={16} color="#94a3b8" />
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
        isOpen={!!viewingNotif}
        onClose={() => setViewingNotif(null)}
        title="Notification Details"
        subtitle={`Category: ${viewingNotif?.type} • Priority: ${viewingNotif?.priority}`}
        badge={viewingNotif?.status || "Unread"}
        badgeColor={viewingNotif?.status === "Read" ? "green" : "blue"}
        data={
          viewingNotif
            ? [
                { label: "Notification Title", value: viewingNotif.title },
                { label: "Message", value: viewingNotif.description },
                { label: "Category", value: viewingNotif.type },
                { label: "Priority", value: viewingNotif.priority },
                { label: "Related To", value: viewingNotif.relatedTo },
                { label: "Status", value: viewingNotif.status },
                { label: "Time Ago", value: viewingNotif.timeAgo },
                { label: "Timestamp", value: viewingNotif.exactTime },
              ]
            : []
        }
      />

      <FormModal
        isOpen={isAddingNotif || !!editingNotif}
        onClose={() => {
          setIsAddingNotif(false);
          setEditingNotif(null);
        }}
        title={editingNotif ? "Edit Notification" : "Broadcast New Notification"}
        subtitle={editingNotif ? `Editing Notification #${editingNotif.id}` : "Send an alert to users and department staff"}
        fields={notifFields}
        initialData={
          editingNotif || {
            title: "",
            description: "",
            type: "System",
            priority: "Medium",
            relatedTo: "Exam Cell",
            status: "Unread",
          }
        }
        submitLabel={editingNotif ? "Update Notice" : "Broadcast Notice"}
        onSubmit={(data) => {
          if (editingNotif) {
            examStore.saveNotification({ ...editingNotif, ...data });
            triggerToast("Notification updated successfully!", "success");
          } else {
            examStore.saveNotification(data);
            triggerToast("New notification broadcasted!", "success");
          }
          setIsAddingNotif(false);
          setEditingNotif(null);
        }}
      />

      <DeleteModal
        isOpen={!!deletingNotif}
        onClose={() => setDeletingNotif(null)}
        title="Delete Notification"
        message="Are you sure you want to permanently delete this notification record?"
        itemName={deletingNotif?.title ? `"${deletingNotif.title}"` : undefined}
        onConfirm={() => {
          if (deletingNotif) {
            examStore.deleteNotification(deletingNotif.id);
            triggerToast("Notification deleted successfully.", "info");
            setDeletingNotif(null);
          }
        }}
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
