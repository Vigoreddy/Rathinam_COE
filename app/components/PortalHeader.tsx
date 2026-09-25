"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  Bell,
  Home,
  BookOpen,
  FileText,
  CheckSquare,
  Upload,
  BarChart2,
  Settings,
  Edit3,
  X,
  ArrowRight,
  User,
  LogOut,
  Sliders,
  Shield,
  Clock,
  Sparkles,
  ChevronRight,
  Layers,
  HelpCircle,
  Menu,
} from "lucide-react";
import { examStore, SubjectItem, QuestionItem, NotificationItem, MessageItem } from "../lib/examStore";
import { authStore, AuthUser, UserRole, hasPermission } from "../lib/auth";

interface PortalHeaderProps {
  activeRoute?: string;
  onCustomSearch?: (query: string) => void;
}

export default function PortalHeader({ activeRoute, onCustomSearch }: PortalHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Dropdown states
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMailOpen, setIsMailOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const mailRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Direct Messaging modal state
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [msgRecipientRole, setMsgRecipientRole] = useState<"HOD" | "DEAN" | "COE" | "STAFF" | "All">("HOD");
  const [msgSubject, setMsgSubject] = useState("");
  const [msgContent, setMsgContent] = useState("");
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [msgToast, setMsgToast] = useState("");

  // Auth user state
  const [currentUser, setCurrentUser] = useState<AuthUser>(() => authStore.getCurrentUser());

  useEffect(() => {
    const handleAuth = () => {
      setCurrentUser(authStore.getCurrentUser());
    };
    handleAuth();
    window.addEventListener("exam-cell-auth-update", handleAuth);
    return () => window.removeEventListener("exam-cell-auth-update", handleAuth);
  }, []);

  // Close mobile drawer when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Data from store
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  const unreadMailCount = messages.filter((m) => m.status === "Unread").length;

  const rawMobileNavItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, route: "/dashboard" },
    { id: "subjects", label: "Subjects", icon: BookOpen, route: "/subjects" },
    { id: "syllabus", label: "Syllabus", icon: FileText, route: "/syllabus" },
    { id: "question-bank", label: "Question Bank", icon: CheckSquare, route: "/question-bank" },
    { id: "manual-questions", label: "Manual Questions", icon: Edit3, route: "/manual-questions" },
    { id: "bulk-upload", label: "Bulk Upload", icon: Upload, route: "/bulk-upload" },
    { id: "verify-questions", label: "Verify Questions", icon: Shield, route: "/verify-questions" },
    { id: "approval", label: "Approval", icon: CheckSquare, route: "/approval" },
    { id: "reports", label: "Reports & Analytics", icon: BarChart2, route: "/reports" },
    { id: "notifications", label: "Notifications", icon: Bell, route: "/notifications", badge: unreadNotifCount > 0 ? String(unreadNotifCount) : undefined },
    { id: "settings", label: "Settings", icon: Settings, route: "/settings" },
  ];

  const mobileNavItems = rawMobileNavItems.filter((item) =>
    hasPermission(currentUser.role, item.route, currentUser.isSubjectFaculty)
  );

  useEffect(() => {
    const loadData = () => {
      try {
        const subs = examStore.getSubjects();
        const qs = examStore.getQuestions();
        const notifs = examStore.getNotifications();
        const msgs = examStore.getMessages ? examStore.getMessages() : [];
        setSubjects(subs || []);
        setQuestions(qs || []);
        setNotifications(notifs || []);
        setMessages(msgs || []);
        const unread = notifs.filter((n) => n.status === "Unread").length;
        setUnreadNotifCount(unread);
      } catch (err) {
        console.error("Failed to load header data:", err);
      }
    };

    loadData();
    window.addEventListener("exam-cell-store-update", loadData);
    return () => window.removeEventListener("exam-cell-store-update", loadData);
  }, []);

  // Global keyboard shortcut: Cmd + K or Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
      }
      if (e.key === "Escape") {
        setIsSearchOpen(false);
        setIsNotifOpen(false);
        setIsMailOpen(false);
        setIsProfileOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (searchContainerRef.current && !searchContainerRef.current.contains(target)) {
        setIsSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(target)) {
        setIsNotifOpen(false);
      }
      if (mailRef.current && !mailRef.current.contains(target)) {
        setIsMailOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Static Navigation Targets
  const rawPortalPages = [
    { id: "dashboard", label: "Dashboard", desc: "Overview, stats & quick actions", icon: Home, route: "/dashboard" },
    { id: "subjects", label: "Subjects", desc: "Manage courses, syllabus & credits", icon: BookOpen, route: "/subjects" },
    { id: "syllabus", label: "Syllabus", desc: "Units, modules & learning outcomes", icon: FileText, route: "/syllabus" },
    { id: "question-bank", label: "Question Bank", desc: "View, filter & search questions", icon: CheckSquare, route: "/question-bank" },
    { id: "bulk-upload", label: "Bulk Upload", desc: "Import Excel, CSV & syllabus files", icon: Upload, route: "/bulk-upload" },
    { id: "verify-questions", label: "Verify Questions", desc: "Review, edit & verify question pool", icon: Search, route: "/verify-questions" },
    { id: "approval", label: "Approval", desc: "HOD & Dean question approval workflow", icon: CheckSquare, route: "/approval" },
    { id: "reports", label: "Reports & Analytics", desc: "Exam metrics, audits & CSV export", icon: BarChart2, route: "/reports" },
    { id: "notifications", label: "Notifications", desc: "System updates, alerts & reminders", icon: Bell, route: "/notifications" },
    { id: "manual-questions", label: "Manual Questions", desc: "Add single or multiple questions manually", icon: Edit3, route: "/manual-questions" },
    { id: "settings", label: "Settings", desc: "System preferences, roles & backup", icon: Settings, route: "/settings" },
  ];

  const portalPages = rawPortalPages.filter((page) =>
    hasPermission(currentUser.role, page.route, currentUser.isSubjectFaculty)
  );

  // Filter items based on searchQuery
  const q = searchQuery.trim().toLowerCase();

  const filteredPages = q
    ? portalPages.filter((p) => p.label.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q) || p.id.includes(q))
    : portalPages.slice(0, 4); // Show quick shortcuts when query is empty

  const filteredSubjects = q
    ? subjects.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.code.toLowerCase().includes(q) ||
          (s.department && s.department.toLowerCase().includes(q))
      ).slice(0, 4)
    : [];

  const filteredQuestions = q
    ? questions.filter(
        (item) =>
          item.question.toLowerCase().includes(q) ||
          item.subject.toLowerCase().includes(q) ||
          item.unit.toLowerCase().includes(q) ||
          item.status.toLowerCase().includes(q)
      ).slice(0, 4)
    : [];

  const totalResultsCount = filteredPages.length + filteredSubjects.length + filteredQuestions.length;

  // Flattened items for keyboard navigation
  const allResults: { type: "page" | "subject" | "question"; data: any; route: string }[] = [
    ...filteredPages.map((p) => ({ type: "page" as const, data: p, route: p.route })),
    ...filteredSubjects.map((s) => ({
      type: "subject" as const,
      data: s,
      route: `/subjects?search=${encodeURIComponent(s.code || s.name)}`,
    })),
    ...filteredQuestions.map((item) => ({
      type: "question" as const,
      data: item,
      route: `/question-bank?search=${encodeURIComponent(item.question.slice(0, 25))}`,
    })),
  ];

  const handleSelectResult = (item: { type: "page" | "subject" | "question"; data: any; route: string }) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    if (onCustomSearch && item.type === "question") {
      onCustomSearch(item.data.question);
    }
    router.push(item.route);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isSearchOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsSearchOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1 < allResults.length ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : allResults.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (allResults[selectedIndex]) {
        handleSelectResult(allResults[selectedIndex]);
      } else if (q) {
        // Fallback: navigate to question bank or subjects with query
        setIsSearchOpen(false);
        router.push(`/question-bank?search=${encodeURIComponent(searchQuery)}`);
      }
    } else if (e.key === "Escape") {
      setIsSearchOpen(false);
    }
  };

  return (
    <>
      <header
        className="portal-header-bar"
        style={{
          height: "72px",
          background: "#ffffff",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 32px",
          flexShrink: 0,
          position: "relative",
          zIndex: 40,
          boxSizing: "border-box",
          width: "100%",
        }}
      >
        {/* ======================= LEFT: MOBILE TOGGLE & SEARCH BAR ======================= */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0, maxWidth: "460px" }}>
          <button
            type="button"
            className="portal-mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(true)}
            title="Open Navigation Menu"
            aria-label="Open Navigation Menu"
          >
            <Menu size={22} color="#1e293b" />
          </button>

          <div
            ref={searchContainerRef}
            className="portal-header-search-wrap"
            style={{
              position: "relative",
              flex: 1,
              minWidth: 0,
              maxWidth: "420px",
            }}
          >
            <div
              className="header-search-box"
          style={{
            position: "relative",
            width: "100%",
            display: "flex",
            alignItems: "center",
            borderRadius: "10px",
            border: isSearchOpen ? "1px solid #6366f1" : "1px solid #e2e8f0",
            background: "#f8fafc",
            boxShadow: isSearchOpen ? "0 0 0 3px rgba(99, 102, 241, 0.15)" : "none",
            transition: "all 0.2s ease",
          }}
        >
          <Search
            size={17}
            color={isSearchOpen ? "#6366f1" : "#94a3b8"}
            className="search-icon-glow"
            style={{
              position: "absolute",
              left: "14px",
              pointerEvents: "none",
              transition: "all 0.2s ease",
            }}
          />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedIndex(0);
              if (!isSearchOpen) setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search anything..."
            style={{
              width: "100%",
              padding: "9px 80px 9px 40px",
              borderRadius: "10px",
              border: "none",
              background: "transparent",
              fontSize: "13.5px",
              color: "#1e293b",
              outline: "none",
              fontFamily: "inherit",
            }}
          />

          {/* Right badge & clear button */}
          <div
            style={{
              position: "absolute",
              right: "10px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  searchInputRef.current?.focus();
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  padding: "2px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  color: "#94a3b8",
                  borderRadius: "50%",
                }}
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
            <span
              onClick={() => {
                searchInputRef.current?.focus();
                setIsSearchOpen(true);
              }}
              style={{
                fontSize: "11px",
                color: "#94a3b8",
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                padding: "2px 6px",
                borderRadius: "6px",
                fontWeight: 600,
                cursor: "pointer",
                userSelect: "none",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              ⌘ K
            </span>
          </div>
        </div>

        {/* -------------------- LIVE SEARCH RESULTS / COMMAND PALETTE DROPDOWN -------------------- */}
        {isSearchOpen && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              left: 0,
              width: "560px",
              maxWidth: "92vw",
              background: "#ffffff",
              borderRadius: "14px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 18px 40px -8px rgba(15, 23, 42, 0.16), 0 0 0 1px rgba(0, 0, 0, 0.04)",
              zIndex: 100,
              maxHeight: "440px",
              overflowY: "auto",
              padding: "10px 0",
              animation: "slideDownFade 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {/* Header info */}
            <div
              style={{
                padding: "6px 16px 10px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid #f1f5f9",
                fontSize: "11px",
                color: "#64748b",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              <span>{q ? `Search Results (${totalResultsCount})` : "Quick Navigation & Shortcuts"}</span>
              <span style={{ textTransform: "none", fontWeight: 500, color: "#94a3b8" }}>
                ↑↓ to navigate • ↵ to select • Esc to close
              </span>
            </div>

            {/* No results state */}
            {q && totalResultsCount === 0 && (
              <div style={{ padding: "36px 20px", textAlign: "center", color: "#64748b" }}>
                <Search size={32} color="#cbd5e1" style={{ margin: "0 auto 10px auto", display: "block" }} />
                <p style={{ margin: "0 0 6px 0", fontWeight: 600, color: "#1e293b", fontSize: "14px" }}>
                  No matches found for &quot;{searchQuery}&quot;
                </p>
                <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>
                  Try searching for a subject code (e.g. 24VFX101), course name, or question topic.
                </p>
                <div style={{ marginTop: "14px", display: "flex", gap: "8px", justifyContent: "center" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSearchOpen(false);
                      router.push("/question-bank");
                    }}
                    style={{
                      background: "#f1f5f9",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#475569",
                      cursor: "pointer",
                    }}
                  >
                    Open Question Bank
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSearchOpen(false);
                      router.push("/subjects");
                    }}
                    style={{
                      background: "#f1f5f9",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#475569",
                      cursor: "pointer",
                    }}
                  >
                    View All Subjects
                  </button>
                </div>
              </div>
            )}

            {/* Section 1: Portal Navigation / Pages */}
            {filteredPages.length > 0 && (
              <div style={{ padding: "6px 0" }}>
                <div
                  style={{
                    padding: "4px 16px 6px 16px",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#94a3b8",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Layers size={13} color="#6366f1" />
                  <span>PAGES & MODULES</span>
                </div>
                {filteredPages.map((page, idx) => {
                  const IconComp = page.icon;
                  const itemIndex = idx;
                  const isSelected = selectedIndex === itemIndex;

                  return (
                    <div
                      key={page.id}
                      onClick={() => handleSelectResult({ type: "page", data: page, route: page.route })}
                      onMouseEnter={() => setSelectedIndex(itemIndex)}
                      style={{
                        padding: "8px 16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        background: isSelected ? "#f5f3ff" : "transparent",
                        borderLeft: isSelected ? "3px solid #6366f1" : "3px solid transparent",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div
                          style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "8px",
                            background: isSelected ? "#e0e7ff" : "#f1f5f9",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: isSelected ? "#4f46e5" : "#64748b",
                          }}
                        >
                          <IconComp size={16} />
                        </div>
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b" }}>{page.label}</div>
                          <div style={{ fontSize: "11px", color: "#64748b" }}>{page.desc}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#94a3b8", fontSize: "11.5px" }}>
                        <span>Go</span>
                        <ChevronRight size={13} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Section 2: Subjects from Store */}
            {filteredSubjects.length > 0 && (
              <div style={{ padding: "6px 0", borderTop: "1px solid #f1f5f9" }}>
                <div
                  style={{
                    padding: "4px 16px 6px 16px",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#94a3b8",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <BookOpen size={13} color="#10b981" />
                  <span>SUBJECTS & COURSES</span>
                </div>
                {filteredSubjects.map((sub, idx) => {
                  const itemIndex = filteredPages.length + idx;
                  const isSelected = selectedIndex === itemIndex;

                  return (
                    <div
                      key={sub.id || sub.code}
                      onClick={() =>
                        handleSelectResult({
                          type: "subject",
                          data: sub,
                          route: `/subjects?search=${encodeURIComponent(sub.code || sub.name)}`,
                        })
                      }
                      onMouseEnter={() => setSelectedIndex(itemIndex)}
                      style={{
                        padding: "8px 16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        background: isSelected ? "#ecfdf5" : "transparent",
                        borderLeft: isSelected ? "3px solid #10b981" : "3px solid transparent",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: sub.dotColor || "#6366f1",
                          }}
                        />
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b" }}>{sub.name}</div>
                          <div style={{ fontSize: "11px", color: "#64748b" }}>
                            Code: <strong style={{ color: "#334155" }}>{sub.code}</strong> • {sub.credits} Credits •{" "}
                            {sub.department || "Design Dept"}
                          </div>
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          padding: "2px 8px",
                          borderRadius: "10px",
                          background: sub.status === "Completed" ? "#dcfce7" : "#e0e7ff",
                          color: sub.status === "Completed" ? "#166534" : "#4338ca",
                        }}
                      >
                        {sub.status || "Active"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Section 3: Questions from Store */}
            {filteredQuestions.length > 0 && (
              <div style={{ padding: "6px 0", borderTop: "1px solid #f1f5f9" }}>
                <div
                  style={{
                    padding: "4px 16px 6px 16px",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#94a3b8",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <CheckSquare size={13} color="#f59e0b" />
                  <span>MATCHING QUESTIONS</span>
                </div>
                {filteredQuestions.map((question, idx) => {
                  const itemIndex = filteredPages.length + filteredSubjects.length + idx;
                  const isSelected = selectedIndex === itemIndex;

                  return (
                    <div
                      key={question.id}
                      onClick={() =>
                        handleSelectResult({
                          type: "question",
                          data: question,
                          route: `/question-bank?search=${encodeURIComponent(question.question.slice(0, 25))}`,
                        })
                      }
                      onMouseEnter={() => setSelectedIndex(itemIndex)}
                      style={{
                        padding: "8px 16px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                        cursor: "pointer",
                        background: isSelected ? "#fffbeb" : "transparent",
                        borderLeft: isSelected ? "3px solid #f59e0b" : "3px solid transparent",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "12.5px",
                          fontWeight: 500,
                          color: "#1e293b",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {question.question}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          fontSize: "11px",
                          color: "#64748b",
                        }}
                      >
                        <span>{question.subject}</span>
                        <span>•</span>
                        <span>{question.unit}</span>
                        <span>•</span>
                        <span>{question.marks} Marks</span>
                        <span
                          style={{
                            marginLeft: "auto",
                            fontSize: "10px",
                            fontWeight: 700,
                            padding: "1px 6px",
                            borderRadius: "4px",
                            background:
                              question.status === "Approved"
                                ? "#dcfce7"
                                : question.status === "Pending"
                                ? "#fef3c7"
                                : "#e0e7ff",
                            color:
                              question.status === "Approved"
                                ? "#166534"
                                : question.status === "Pending"
                                ? "#b45309"
                                : "#4338ca",
                          }}
                        >
                          {question.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Footer quick tips */}
            <div
              style={{
                padding: "10px 16px 4px 16px",
                borderTop: "1px solid #f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "11px",
                color: "#94a3b8",
              }}
            >
              <span>Quick jump to any module or content instantly</span>
              <span
                onClick={() => {
                  setIsSearchOpen(false);
                  router.push(`/question-bank?search=${encodeURIComponent(searchQuery)}`);
                }}
                style={{ color: "#6366f1", fontWeight: 600, cursor: "pointer" }}
              >
                Search all in Question Bank →
              </span>
            </div>
          </div>
        )}
      </div>
    </div>

        {/* ======================= RIGHT: NOTIFICATIONS, MESSAGES & PROFILE ======================= */}
        <div className="portal-header-actions" style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          {/* Notification Bell */}
          <div ref={notifRef} style={{ position: "relative" }}>
            <div
              className="header-icon-btn-3d"
              onClick={() => {
                setIsNotifOpen(!isNotifOpen);
                setIsMailOpen(false);
                setIsProfileOpen(false);
              }}
              style={{ cursor: "pointer", position: "relative" }}
              title="Notifications"
            >
              <Bell size={20} color="#475569" className="bell-icon-shake" style={{ transition: "all 0.2s ease" }} />
              <span className="radar-badge-3d">{unreadNotifCount}</span>
            </div>

            {/* Quick Notification Dropdown */}
            {isNotifOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 12px)",
                  right: 0,
                  width: "min(360px, calc(100vw - 24px))",
                  maxWidth: "calc(100vw - 24px)",
                  background: "#ffffff",
                  borderRadius: "14px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 18px 40px -8px rgba(15, 23, 42, 0.16)",
                  padding: "14px",
                  zIndex: 100,
                  animation: "slideDownFade 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                  paddingBottom: "8px",
                  borderBottom: "1px solid #f1f5f9",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>Notifications</span>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      background: "#fee2e2",
                      color: "#dc2626",
                      padding: "2px 6px",
                      borderRadius: "10px",
                    }}
                  >
                    {unreadNotifCount} new
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (typeof examStore.markAllNotificationsRead === "function") {
                      examStore.markAllNotificationsRead();
                    }
                    setNotifications((prev) => prev.map((n) => ({ ...n, status: "Read" })));
                    setUnreadNotifCount(0);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "11.5px",
                    color: "#6366f1",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Mark all read
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "260px", overflowY: "auto" }}>
                {notifications.slice(0, 4).map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      setIsNotifOpen(false);
                      router.push("/notifications");
                    }}
                    style={{
                      padding: "8px 10px",
                      borderRadius: "8px",
                      background: notif.status === "Unread" ? "#f8fafc" : "#ffffff",
                      border: "1px solid #f1f5f9",
                      cursor: "pointer",
                      transition: "background 0.15s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = notif.status === "Unread" ? "#f8fafc" : "#ffffff")
                    }
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "12.5px", fontWeight: 600, color: "#1e293b" }}>{notif.title}</span>
                      <span style={{ fontSize: "10px", color: "#94a3b8" }}>{notif.timeAgo || "Just now"}</span>
                    </div>
                    <div
                      style={{
                        fontSize: "11.5px",
                        color: "#64748b",
                        marginTop: "2px",
                        lineHeight: "1.4",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {notif.description}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: "12px", paddingTop: "8px", borderTop: "1px solid #f1f5f9", textAlign: "center" }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsNotifOpen(false);
                    router.push("/notifications");
                  }}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "8px",
                    background: "#f1f5f9",
                    border: "none",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#475569",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  View All Notifications →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mail Icon */}
        <div ref={mailRef} style={{ position: "relative" }}>
          <div
            className="header-icon-btn-3d"
            onClick={() => {
              setIsMailOpen(!isMailOpen);
              setIsNotifOpen(false);
              setIsProfileOpen(false);
            }}
            style={{ cursor: "pointer", position: "relative" }}
            title="Messages"
          >
            <div
              style={{
                width: "20px",
                height: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                className="mail-icon-shake"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#475569"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ transition: "all 0.2s ease" }}
              >
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </div>
            {unreadMailCount > 0 && <span className="radar-badge-3d">{unreadMailCount}</span>}
          </div>

          {/* Quick Messages Dropdown */}
          {isMailOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 12px)",
                right: 0,
                width: "min(340px, calc(100vw - 24px))",
                maxWidth: "calc(100vw - 24px)",
                background: "#ffffff",
                borderRadius: "14px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 18px 40px -8px rgba(15, 23, 42, 0.16)",
                padding: "14px",
                zIndex: 100,
                animation: "slideDownFade 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "10px",
                  paddingBottom: "8px",
                  borderBottom: "1px solid #f1f5f9",
                }}
              >
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>Direct Messages</span>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    background: unreadMailCount > 0 ? "#fee2e2" : "#e0e7ff",
                    color: unreadMailCount > 0 ? "#dc2626" : "#4338ca",
                    padding: "2px 8px",
                    borderRadius: "10px",
                  }}
                >
                  {unreadMailCount > 0 ? `${unreadMailCount} unread` : "0 unread"}
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "240px", overflowY: "auto" }}>
                {messages.length === 0 ? (
                  <div style={{ padding: "16px 8px", textAlign: "center", color: "#94a3b8", fontSize: "12px", lineHeight: 1.4 }}>
                    No messages yet. Click <strong>Send Message</strong> below to contact HOD, Dean, or COE directly.
                  </div>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => {
                        if (examStore.markMessageRead) examStore.markMessageRead(m.id);
                        setMessages((prev) => prev.map((item) => (item.id === m.id ? { ...item, status: "Read" } : item)));
                      }}
                      style={{
                        padding: "9px 11px",
                        borderRadius: "8px",
                        background: m.status === "Unread" ? "#eff6ff" : "#f8fafc",
                        border: "1px solid #f1f5f9",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <strong style={{ fontSize: "12px", color: "#1e293b" }}>{m.senderName} ({m.senderRole})</strong>
                        <span style={{ fontSize: "10px", color: "#94a3b8" }}>{m.timeAgo || "Just now"}</span>
                      </div>
                      <div style={{ fontSize: "11.5px", fontWeight: 600, color: "#4f46e5", marginTop: "2px" }}>
                        {m.subject}
                      </div>
                      <div style={{ fontSize: "11px", color: "#64748b", marginTop: "1px", lineHeight: "1.3", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        To: {m.recipientName} • {m.content}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div style={{ marginTop: "12px", paddingTop: "10px", borderTop: "1px solid #f1f5f9", display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsMailOpen(false);
                    setIsComposeOpen(true);
                  }}
                  style={{
                    flex: 1,
                    padding: "8px",
                    borderRadius: "8px",
                    background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
                    border: "none",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#ffffff",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(79, 70, 229, 0.3)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  <span>✉️ Send New Message</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Trigger with Role Pill */}
        <div ref={profileRef} style={{ position: "relative" }}>
          <div
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotifOpen(false);
              setIsMailOpen(false);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              cursor: "pointer",
              padding: "4px 10px 4px 6px",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              background: "#f8fafc",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#f8fafc")}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: currentUser.avatarBg || "#6366f1",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "13px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
              }}
            >
              {currentUser.name.charAt(0)}
            </div>
            <div className="portal-header-user-text" style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>{currentUser.name}</span>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 800,
                    padding: "1px 6px",
                    borderRadius: "6px",
                    background:
                      currentUser.role === "COE"
                        ? "#dcfce7"
                        : currentUser.role === "DEAN"
                        ? "#f3e8ff"
                        : currentUser.role === "HOD"
                        ? "#e0f2fe"
                        : "#f1f5f9",
                    color:
                      currentUser.role === "COE"
                        ? "#15803d"
                        : currentUser.role === "DEAN"
                        ? "#7e22ce"
                        : currentUser.role === "HOD"
                        ? "#0369a1"
                        : "#475569",
                  }}
                >
                  {currentUser.role}
                </span>
              </div>
              <span style={{ fontSize: "10.5px", color: "#64748b" }}>{currentUser.department}</span>
            </div>
          </div>

          {/* User Profile Popover */}
          {isProfileOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 12px)",
                right: 0,
                width: "280px",
                maxWidth: "calc(100vw - 24px)",
                background: "#ffffff",
                borderRadius: "16px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 20px 45px -10px rgba(15, 23, 42, 0.18)",
                padding: "16px",
                zIndex: 100,
                animation: "slideDownFade 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              {/* Header profile info */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px", paddingBottom: "12px", borderBottom: "1px solid #f1f5f9" }}>
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "50%",
                    background: currentUser.avatarBg || "#6366f1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: "16px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                >
                  {currentUser.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#0f172a" }}>{currentUser.name}</div>
                  <div style={{ fontSize: "11px", color: "#64748b" }}>{currentUser.email}</div>
                  <div style={{ fontSize: "11px", fontWeight: 600, color: "#6366f1", marginTop: "2px" }}>{currentUser.roleTitle}</div>
                </div>
              </div>

              {/* Interactive Role Switcher Section */}
              <div style={{ marginBottom: "14px", padding: "10px", borderRadius: "10px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "8px" }}>
                  Switch Role (Testing)
                </span>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "6px" }}>
                  {(["STAFF", "HOD", "DEAN", "COE"] as UserRole[]).map((roleKey) => (
                    <button
                      key={roleKey}
                      type="button"
                      onClick={() => {
                        authStore.loginAs(roleKey);
                        setIsProfileOpen(false);
                      }}
                      style={{
                        padding: "6px 8px",
                        borderRadius: "6px",
                        border: currentUser.role === roleKey ? "2px solid #6366f1" : "1px solid #cbd5e1",
                        background: currentUser.role === roleKey ? "#e0e7ff" : "#ffffff",
                        color: currentUser.role === roleKey ? "#4338ca" : "#334155",
                        fontSize: "11.5px",
                        fontWeight: 700,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {roleKey}
                    </button>
                  ))}
                </div>

                {/* HOD Subject Faculty Toggle */}
                {currentUser.role === "HOD" && (
                  <div style={{ marginTop: "10px", paddingTop: "8px", borderTop: "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: "11px", fontWeight: 600, color: "#475569", marginBottom: "4px" }}>
                      Is Subject Faculty?
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        authStore.toggleHodSubjectFaculty();
                      }}
                      style={{
                        width: "100%",
                        padding: "6px 10px",
                        borderRadius: "6px",
                        border: "none",
                        background: currentUser.isSubjectFaculty ? "#dcfce7" : "#fee2e2",
                        color: currentUser.isSubjectFaculty ? "#15803d" : "#dc2626",
                        fontSize: "11.5px",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>{currentUser.isSubjectFaculty ? "YES (Subject Access Allowed)" : "NO (Subject Access Restricted)"}</span>
                      <span>⚙️</span>
                    </button>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    router.push("/settings");
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 10px",
                    borderRadius: "8px",
                    background: "transparent",
                    border: "none",
                    fontSize: "12.5px",
                    color: "#334155",
                    fontWeight: 500,
                    cursor: "pointer",
                    textAlign: "left",
                    width: "100%",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <Settings size={15} color="#64748b" />
                  <span>Account Settings</span>
                </button>

                <div style={{ height: "1px", background: "#f1f5f9", margin: "4px 0" }} />

                <button
                  type="button"
                  onClick={() => {
                    authStore.logout();
                    setIsProfileOpen(false);
                    router.push("/");
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 10px",
                    borderRadius: "8px",
                    background: "transparent",
                    border: "none",
                    fontSize: "12.5px",
                    color: "#ef4444",
                    fontWeight: 600,
                    cursor: "pointer",
                    textAlign: "left",
                    width: "100%",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#fef2f2")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <LogOut size={15} color="#ef4444" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>

    {/* ======================= MOBILE NAVIGATION DRAWER & BACKDROP ======================= */}
    {isMobileMenuOpen && (
      <div
        className="portal-mobile-drawer-overlay"
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <aside
          className="mobile-drawer-aside"
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            {/* Top Drawer Header with Brand Logo & Close button */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "6px 8px 18px 8px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                marginBottom: "14px",
              }}
            >
              <img
                src="/images/rgu-logo.png"
                alt="Rathinam Global University"
                style={{
                  maxHeight: "34px",
                  width: "auto",
                  objectFit: "contain",
                  filter: "drop-shadow(0 0 10px rgba(99, 102, 241, 0.4))",
                }}
              />
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                title="Close Navigation"
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: "8px",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  cursor: "pointer",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Navigation Links */}
            <nav style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1, overflowY: "auto" }}>
              {mobileNavItems.map((item) => {
                const IconComp = item.icon;
                const isActive = activeRoute === item.id || (pathname && pathname.includes(item.id));

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      router.push(item.route);
                    }}
                    className={`sidebar-btn-3d ${isActive ? "sidebar-btn-active" : "sidebar-btn-inactive"}`}
                    style={{
                      padding: "10px 12px",
                      fontSize: "13px",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      width: "100%",
                      cursor: "pointer",
                    }}
                  >
                    <span className="nav-icon-3d" style={{ display: "flex", alignItems: "center" }}>
                      <IconComp size={18} />
                    </span>
                    <span style={{ flex: 1, textAlign: "left", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {item.label}
                    </span>

                    {item.badge && (
                      <span className="badge-neon-3d">
                        {item.badge}
                      </span>
                    )}

                    <ChevronRight
                      size={15}
                      color="#ffffff"
                      style={{ opacity: 0.6 }}
                    />
                  </button>
                );
              })}
            </nav>

            {/* Support & Sign Out Card in Drawer */}
            <div style={{ paddingTop: "14px", borderTop: "1px solid rgba(255, 255, 255, 0.08)", marginTop: "12px" }}>
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
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
                  background: "rgba(99, 102, 241, 0.2)",
                  border: "1px solid rgba(99, 102, 241, 0.35)",
                  color: "#ffffff",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  marginBottom: "8px",
                }}
              >
                <Shield size={14} color="#818cf8" />
                <span>Contact Support</span>
                <ArrowRight size={13} />
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  router.push("/");
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "10px",
                  background: "rgba(239, 68, 68, 0.12)",
                  border: "1px solid rgba(239, 68, 68, 0.25)",
                  color: "#f87171",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <LogOut size={14} color="#f87171" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </aside>
      </div>
    )}

      {/* ================= COMPOSE DIRECT MESSAGE MODAL ================= */}
      {isComposeOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
          onClick={() => setIsComposeOpen(false)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              width: "100%",
              maxWidth: "500px",
              padding: "24px",
              boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.25)",
              border: "1px solid #e2e8f0",
              animation: "scaleIn 0.2s ease-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  ✉️
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 800, color: "#0f172a" }}>
                    Send Direct Message
                  </h3>
                  <span style={{ fontSize: "11.5px", color: "#64748b" }}>
                    From: {currentUser.name} ({currentUser.roleTitle})
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsComposeOpen(false)}
                style={{ background: "#f1f5f9", border: "none", borderRadius: "50%", width: "30px", height: "30px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <X size={15} color="#64748b" />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!msgContent.trim()) return;

                const recipientMap: Record<string, string> = {
                  HOD: "Dr. T.J RAJU (HOD)",
                  DEAN: "Dr. V Rajlakshmi (Dean Academic Affairs)",
                  COE: "Dr. Rajubalaji (Controller of Examinations)",
                  STAFF: "Mr. Vignesh M (Faculty / Staff)",
                  All: "All Academic Authorities",
                };

                if (examStore.sendMessage) {
                  examStore.sendMessage({
                    senderName: currentUser.name,
                    senderRole: currentUser.roleTitle || currentUser.role,
                    senderEmail: currentUser.email,
                    recipientRole: msgRecipientRole,
                    recipientName: recipientMap[msgRecipientRole] || "Academic Authority",
                    subject: msgSubject || "Academic Question Notice",
                    content: msgContent,
                  });
                }

                setMsgToast(`Message successfully sent to ${recipientMap[msgRecipientRole]}!`);
                setTimeout(() => setMsgToast(""), 3500);

                setMsgSubject("");
                setMsgContent("");
                setIsComposeOpen(false);
              }}
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "5px" }}>
                  Select Recipient
                </label>
                <select
                  value={msgRecipientRole}
                  onChange={(e: any) => setMsgRecipientRole(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13px",
                    color: "#0f172a",
                    outline: "none",
                    background: "#ffffff",
                    cursor: "pointer",
                  }}
                >
                  <option value="HOD">Dr. T.J RAJU — HOD / Associate Dean</option>
                  <option value="DEAN">Dr. V Rajlakshmi — Dean Academic Affairs</option>
                  <option value="COE">Dr. Rajubalaji — Controller of Examinations (COE)</option>
                  <option value="STAFF">Mr. Vignesh M — Faculty / Staff</option>
                  <option value="All">All Department Heads & Verifiers</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "5px" }}>
                  Message Subject
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Question Bank Review Request for Unit II"
                  value={msgSubject}
                  onChange={(e) => setMsgSubject(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13px",
                    color: "#0f172a",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#334155", display: "block", marginBottom: "5px" }}>
                  Message Content
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Type your official message or query here..."
                  value={msgContent}
                  onChange={(e) => setMsgContent(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13px",
                    color: "#0f172a",
                    outline: "none",
                    resize: "vertical",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "6px" }}>
                <button
                  type="button"
                  onClick={() => setIsComposeOpen(false)}
                  style={{
                    padding: "9px 16px",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    color: "#475569",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "9px 22px",
                    borderRadius: "10px",
                    border: "none",
                    background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
                    color: "#ffffff",
                    fontSize: "12.5px",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(79, 70, 229, 0.4)",
                  }}
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Message Toast Notification */}
      {msgToast && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 99999,
            background: "#0f172a",
            color: "#ffffff",
            padding: "12px 20px",
            borderRadius: "12px",
            fontSize: "13px",
            fontWeight: 600,
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>💬 {msgToast}</span>
        </div>
      )}
  </>
  );
}
