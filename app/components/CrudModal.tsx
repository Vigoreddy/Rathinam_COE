"use client";

import React, { useEffect, useMemo, useState } from "react";
import { X, Trash2, Edit3, Eye, CheckCircle2, AlertTriangle, Save, Info, Sparkles, Check } from "lucide-react";

// ======================== VIEW MODAL ========================
export interface ViewField {
  label: string;
  value: React.ReactNode;
  spanFull?: boolean;
}

export interface ViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  badge?: any; // string | { label: string; bg?: string; color?: string }
  badgeColor?: string;
  fields?: ViewField[];
  data?: any; // ViewField[] | Record<string, any>
  onEdit?: () => void;
  onDelete?: () => void;
  onVerify?: () => void;
  verifyLabel?: string;
  questionsList?: any[];
}

export function ViewModal({
  isOpen,
  onClose,
  title,
  subtitle,
  badge,
  badgeColor,
  fields,
  data,
  onEdit,
  onDelete,
  onVerify,
  verifyLabel = "Verify Question",
  questionsList,
}: ViewModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Compute normalized fields
  const normalizedFields: ViewField[] = useMemo(() => {
    if (fields && Array.isArray(fields) && fields.length > 0) {
      return fields;
    }
    if (Array.isArray(data)) {
      return data.map((item: any) => ({
        label: item.label || item.key || item.name || "Field",
        value: item.value ?? item.text ?? "—",
        spanFull: item.spanFull,
      }));
    }
    if (data && typeof data === "object") {
      return Object.entries(data)
        .filter(([k]) => !["id", "dotColor", "typeBg", "typeColor", "raw"].includes(k))
        .map(([k, v]) => ({
          label: k.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()),
          value: typeof v === "object" && v !== null ? JSON.stringify(v) : String(v ?? "—"),
        }));
    }
    return [];
  }, [fields, data]);

  // Compute normalized badge
  const normalizedBadge = useMemo(() => {
    if (!badge) return null;
    if (typeof badge === "object" && badge.label) return badge;
    if (typeof badge === "string") {
      const lower = badge.toLowerCase();
      let bg = "#e0e7ff";
      let color = "#4338ca";

      if (badgeColor === "green" || lower.includes("active") || lower.includes("success") || lower.includes("approv") || lower.includes("verif") || lower.includes("completed")) {
        bg = "#dcfce7";
        color = "#16a34a";
      } else if (badgeColor === "red" || lower.includes("reject") || lower.includes("fail") || lower.includes("danger") || lower.includes("error")) {
        bg = "#fee2e2";
        color = "#dc2626";
      } else if (badgeColor === "yellow" || lower.includes("pend") || lower.includes("warn") || lower.includes("medium") || lower.includes("progress")) {
        bg = "#fef3c7";
        color = "#d97706";
      } else if (badgeColor === "blue") {
        bg = "#eff6ff";
        color = "#2563eb";
      }
      return { label: badge, bg, color };
    }
    return null;
  }, [badge, badgeColor]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(6px)",
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        className="crud-modal-box"
        style={{
          width: "100%",
          maxWidth: questionsList && questionsList.length > 0 ? "760px" : "640px",
          maxHeight: "88vh",
          background: "#ffffff",
          borderRadius: "20px",
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(226, 232, 240, 0.8)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            background: "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, rgba(79, 70, 229, 0.15), rgba(99, 102, 241, 0.25))",
                color: "#4f46e5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Eye size={22} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#0f172a" }}>
                  {title}
                </h3>
                {normalizedBadge && (
                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: 700,
                      background: normalizedBadge.bg,
                      color: normalizedBadge.color,
                    }}
                  >
                    {normalizedBadge.label}
                  </span>
                )}
              </div>
              {subtitle && (
                <p style={{ margin: "4px 0 0", fontSize: "12.5px", color: "#64748b" }}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              background: "#ffffff",
              color: "#64748b",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: "24px", overflowY: "auto", flex: 1 }}>
          {normalizedFields.length === 0 && (!questionsList || questionsList.length === 0) ? (
            <div style={{ padding: "30px", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>
              No specific details available for this record.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {normalizedFields.length > 0 && (
                <div
                  className="crud-form-grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "14px",
                  }}
                >
                  {normalizedFields.map((f, i) => (
                    <div
                      key={i}
                      style={{
                        gridColumn: f.spanFull ? "span 2" : "span 1",
                        background: "#f8fafc",
                        borderRadius: "12px",
                        padding: "12px 14px",
                        border: "1px solid #f1f5f9",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                          color: "#64748b",
                          marginBottom: "5px",
                        }}
                      >
                        {f.label}
                      </div>
                      <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#1e293b", lineHeight: 1.5 }}>
                        {f.value || "—"}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Render Diagram / Image Attachment Preview if present */}
              {(data?.imageUrl || data?.raw?.imageUrl) && (
                <div
                  style={{
                    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                    borderRadius: "16px",
                    padding: "18px",
                    border: "1px solid rgba(56, 189, 248, 0.3)",
                    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.25)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "18px" }}>🖼️</span>
                      <strong style={{ color: "#38bdf8", fontSize: "13.5px", fontWeight: 700 }}>
                        Attached Question Diagram / Figure
                      </strong>
                      <span style={{ background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 700 }}>
                        {data?.diagramType || data?.raw?.diagramType || "Illustration"}
                      </span>
                    </div>
                  </div>

                  <div style={{ width: "100%", borderRadius: "12px", overflow: "hidden", background: "#020617", border: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "center", alignItems: "center", padding: "12px" }}>
                    <img
                      src={data?.imageUrl || data?.raw?.imageUrl}
                      alt={data?.diagramTitle || "Question Diagram"}
                      style={{ maxWidth: "100%", maxHeight: "280px", objectFit: "contain", borderRadius: "8px" }}
                    />
                  </div>

                  {(data?.diagramTitle || data?.raw?.diagramTitle) && (
                    <div style={{ fontSize: "12.5px", color: "#e2e8f0", fontWeight: 600, textAlign: "center", fontStyle: "italic" }}>
                      {data?.diagramTitle || data?.raw?.diagramTitle}
                    </div>
                  )}
                </div>
              )}

              {/* Parsed Questions Preview Section */}
              {questionsList && questionsList.length > 0 && (
                <div style={{ marginTop: "6px" }}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#334155", marginBottom: "12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span>Inspection Preview ({questionsList.length} Questions)</span>
                      <span style={{ fontSize: "11px", background: "#e0e7ff", color: "#4338ca", padding: "2px 8px", borderRadius: "12px", fontWeight: 700 }}>
                        Categorized by Marks
                      </span>
                    </div>
                    <div style={{ fontSize: "11.5px", color: "#64748b" }}>
                      5 Marks: {questionsList.filter(q => Number(q.marks || 5) === 5).length} | 10 Marks: {questionsList.filter(q => Number(q.marks) === 10).length} | 12 Marks: {questionsList.filter(q => Number(q.marks) === 12).length}
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxHeight: "380px", overflowY: "auto", paddingRight: "4px" }}>
                    {[5, 10, 12].map((mVal) => {
                      const markGroup = questionsList.filter((q) => (Number(q.marks) || 5) === mVal);
                      if (markGroup.length === 0) return null;

                      const badgeBg = mVal === 5 ? "#eff6ff" : mVal === 10 ? "#f0fdf4" : "#faf5ff";
                      const badgeColor = mVal === 5 ? "#1d4ed8" : mVal === 10 ? "#15803d" : "#7e22ce";
                      const badgeBorder = mVal === 5 ? "#bfdbfe" : mVal === 10 ? "#bbf7d0" : "#e9d5ff";

                      return (
                        <div key={mVal} style={{ background: "#f8fafc", border: `1px solid ${badgeBorder}`, borderRadius: "14px", padding: "14px" }}>
                          <div style={{ fontSize: "12.5px", fontWeight: 800, color: badgeColor, marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ background: badgeBg, padding: "3px 10px", borderRadius: "8px", border: `1px solid ${badgeBorder}` }}>
                              📌 Section ({mVal} Marks Questions) — {markGroup.length} Question(s)
                            </span>
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {markGroup.map((q, qIdx) => (
                              <div
                                key={q.id || qIdx}
                                style={{
                                  background: "#ffffff",
                                  border: "1px solid #e2e8f0",
                                  borderRadius: "12px",
                                  padding: "12px 16px",
                                  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.02)",
                                }}
                              >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px", marginBottom: "6px" }}>
                                  <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#0f172a", lineHeight: 1.4 }}>
                                    Q{qIdx + 1}. {q.question || q.statement}
                                  </div>
                                  <span style={{ fontSize: "11px", fontWeight: 700, background: badgeBg, color: badgeColor, padding: "2px 8px", borderRadius: "6px", flexShrink: 0 }}>
                                    {mVal} Marks
                                  </span>
                                </div>

                                <div style={{ display: "flex", gap: "12px", fontSize: "11.5px", color: "#64748b", flexWrap: "wrap", marginTop: "4px" }}>
                                  <span>Type: <strong>{q.type || "Descriptive"}</strong></span>
                                  <span>Difficulty: <strong>{q.difficulty || "Medium"}</strong></span>
                                  <span>Unit: <strong>{q.unit || "Unit I"}</strong></span>
                                  {q.bloomLevel && <span style={{ color: "#7c3aed" }}>Bloom's: <strong>{q.bloomLevel}</strong></span>}
                                </div>

                                {q.options && q.options.length > 0 && (
                                  <div style={{ marginTop: "8px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", fontSize: "12px", background: "#f8fafc", padding: "8px 10px", borderRadius: "8px" }}>
                                    {q.options.map((opt: string, optIdx: number) => (
                                      <div key={optIdx} style={{ color: "#334155" }}>
                                        <strong>{String.fromCharCode(65 + optIdx)}.</strong> {opt}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid #f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#ffffff",
          }}
        >
          <div>
            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onDelete();
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 14px",
                  borderRadius: "10px",
                  border: "1px solid #fee2e2",
                  background: "#fff1f2",
                  color: "#e11d48",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            )}
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "8px 18px",
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
                background: "#ffffff",
                color: "#475569",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Close
            </button>

            {onVerify && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onVerify();
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  padding: "8px 20px",
                  borderRadius: "10px",
                  border: "none",
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(16, 185, 129, 0.4)",
                  transition: "all 0.2s ease",
                }}
              >
                <Sparkles size={15} color="#ffffff" style={{ filter: "drop-shadow(0 0 4px rgba(255,255,255,0.8))" }} />
                <span>{verifyLabel}</span>
              </button>
            )}

            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit();
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 18px",
                  borderRadius: "10px",
                  border: "none",
                  background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(79, 70, 229, 0.35)",
                }}
              >
                <Edit3 size={14} />
                <span>Edit Item</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ======================== EDIT / ADD FORM MODAL ========================
export interface FormFieldDef {
  key?: string;
  name?: string;
  label?: string;
  type?: "text" | "number" | "select" | "textarea" | string;
  options?: any[];
  placeholder?: string;
  required?: boolean;
  spanFull?: boolean;
}

export interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  fields?: FormFieldDef[];
  initialValues?: Record<string, any>;
  initialData?: Record<string, any>;
  onSubmit: (values: Record<string, any>) => void;
  submitLabel?: string;
}

export function FormModal({
  isOpen,
  onClose,
  title,
  subtitle,
  fields = [],
  initialValues,
  initialData,
  onSubmit,
  submitLabel = "Save Changes",
}: FormModalProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const prevIsOpenRef = React.useRef(false);

  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      const init = initialValues || initialData || {};
      setFormData({ ...init });
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (key: string, val: any) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(6px)",
        padding: "16px",
      }}
    >
      <div
        className="crud-modal-box"
        style={{
          width: "100%",
          maxWidth: "620px",
          maxHeight: "90vh",
          background: "#ffffff",
          borderRadius: "20px",
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(226, 232, 240, 0.8)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            background: "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, rgba(79, 70, 229, 0.12), rgba(99, 102, 241, 0.2))",
                color: "#4f46e5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Edit3 size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#0f172a" }}>
                {title}
              </h3>
              {subtitle && (
                <p style={{ margin: "3px 0 0", fontSize: "12.5px", color: "#64748b" }}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              background: "#ffffff",
              color: "#64748b",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
          <div style={{ padding: "24px", overflowY: "auto", flex: 1 }}>
            <div
              className="crud-form-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "16px",
              }}
            >
              {fields.map((f, i) => {
                const fieldKey = f.key || f.name || `field_${i}`;
                const fieldLabel = f.label || fieldKey;
                const val = formData[fieldKey] !== undefined ? formData[fieldKey] : "";
                const isFull = f.spanFull || f.type === "textarea";

                return (
                  <div
                    key={fieldKey || i}
                    style={{
                      gridColumn: isFull ? "span 2" : "span 1",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    <label
                      style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#334155",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <span>{fieldLabel}</span>
                      {f.required && <span style={{ color: "#ef4444" }}>*</span>}
                    </label>

                    {f.type === "image" || f.type === "file" || fieldKey === "imageUrl" ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {val ? (
                          <div
                            style={{
                              position: "relative",
                              border: "1px solid #cbd5e1",
                              borderRadius: "12px",
                              padding: "10px",
                              background: "#0f172a",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <img
                              src={val}
                              alt="Diagram Preview"
                              style={{ maxHeight: "180px", maxWidth: "100%", objectFit: "contain", borderRadius: "8px" }}
                            />
                            <button
                              type="button"
                              onClick={() => handleChange(fieldKey, "")}
                              style={{
                                padding: "4px 12px",
                                borderRadius: "6px",
                                background: "#ef4444",
                                color: "#ffffff",
                                border: "none",
                                fontSize: "11px",
                                fontWeight: 700,
                                cursor: "pointer",
                              }}
                            >
                              Remove Diagram Image
                            </button>
                          </div>
                        ) : (
                          <div
                            style={{
                              border: "2px dashed #94a3b8",
                              borderRadius: "12px",
                              padding: "16px",
                              textAlign: "center",
                              background: "#f8fafc",
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                            }}
                            onClick={() => {
                              const input = document.createElement("input");
                              input.type = "file";
                              input.accept = "image/*";
                              input.onchange = (e: any) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (evt) => {
                                    handleChange(fieldKey, evt.target?.result as string);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              };
                              input.click();
                            }}
                          >
                            <div style={{ fontSize: "24px", marginBottom: "4px" }}>🖼️</div>
                            <div style={{ fontSize: "12.5px", fontWeight: 700, color: "#3b82f6" }}>
                              Click or Drag & Drop Image/Diagram File
                            </div>
                            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                              Supports PNG, JPG, SVG, WebP (Max 5MB)
                            </div>
                          </div>
                        )}
                      </div>
                    ) : f.type === "textarea" ? (
                      <textarea
                        required={f.required}
                        value={val}
                        placeholder={f.placeholder}
                        onChange={(e) => handleChange(fieldKey, e.target.value)}
                        rows={3}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          borderRadius: "10px",
                          border: "1px solid #cbd5e1",
                          fontSize: "13.5px",
                          color: "#0f172a",
                          outline: "none",
                          fontFamily: "inherit",
                          resize: "vertical",
                          boxSizing: "border-box",
                        }}
                      />
                    ) : f.type === "select" ? (
                      <select
                        required={f.required}
                        value={val}
                        onChange={(e) => handleChange(fieldKey, e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          borderRadius: "10px",
                          border: "1px solid #cbd5e1",
                          fontSize: "13.5px",
                          color: "#0f172a",
                          outline: "none",
                          background: "#ffffff",
                          fontFamily: "inherit",
                          boxSizing: "border-box",
                          cursor: "pointer",
                        }}
                      >
                        {val &&
                          f.options &&
                          !f.options.some((opt: any) =>
                            typeof opt === "object" ? opt.value === val || opt.label === val : opt === val
                          ) && <option value={val}>{val}</option>}
                        {f.options?.map((opt: any, optIdx: number) => {
                          const optVal = typeof opt === "object" && opt !== null ? opt.value ?? opt.label : opt;
                          const optLabel = typeof opt === "object" && opt !== null ? opt.label ?? opt.value : opt;
                          return (
                            <option key={optVal ?? optIdx} value={optVal}>
                              {optLabel}
                            </option>
                          );
                        })}
                      </select>
                    ) : (
                      <input
                        type={f.type || "text"}
                        required={f.required}
                        value={val}
                        placeholder={f.placeholder}
                        onChange={(e) =>
                          handleChange(fieldKey, f.type === "number" ? Number(e.target.value) : e.target.value)
                        }
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          borderRadius: "10px",
                          border: "1px solid #cbd5e1",
                          fontSize: "13.5px",
                          color: "#0f172a",
                          outline: "none",
                          fontFamily: "inherit",
                          boxSizing: "border-box",
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              padding: "16px 24px",
              borderTop: "1px solid #f1f5f9",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "12px",
              background: "#ffffff",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "9px 18px",
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
                background: "#ffffff",
                color: "#475569",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                padding: "9px 22px",
                borderRadius: "10px",
                border: "none",
                background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(79, 70, 229, 0.4)",
              }}
            >
              <Save size={15} />
              <span>{submitLabel}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ======================== DELETE CONFIRMATION MODAL ========================
export interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  itemName?: string;
  message?: string;
  onConfirm: () => void;
}

export function DeleteModal({
  isOpen,
  onClose,
  title = "Delete Item",
  itemName,
  message,
  onConfirm,
}: DeleteModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(6px)",
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        className="crud-modal-box"
        style={{
          width: "100%",
          maxWidth: "460px",
          background: "#ffffff",
          borderRadius: "20px",
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(226, 232, 240, 0.8)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: "28px 24px 20px", textAlign: "center" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "#fef2f2",
              border: "1px solid #fee2e2",
              color: "#ef4444",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "16px",
            }}
          >
            <AlertTriangle size={28} />
          </div>

          <h3 style={{ margin: "0 0 8px", fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>
            {title}
          </h3>

          <p style={{ margin: 0, fontSize: "13.5px", color: "#64748b", lineHeight: 1.5 }}>
            {message || (
              <>
                Are you sure you want to permanently delete{" "}
                <strong style={{ color: "#0f172a" }}>{itemName ? `"${itemName}"` : "this item"}</strong>?
                This action cannot be undone.
              </>
            )}
          </p>
        </div>

        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid #f1f5f9",
            background: "#f8fafc",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "10px",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "9px 18px",
              borderRadius: "10px",
              border: "1px solid #e2e8f0",
              background: "#ffffff",
              color: "#475569",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "9px 20px",
              borderRadius: "10px",
              border: "none",
              background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
              color: "#ffffff",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(239, 68, 68, 0.35)",
            }}
          >
            <Trash2 size={14} />
            <span>Delete Permanently</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ======================== TOAST NOTIFICATION ========================
export function ToastNotification({
  message,
  isOpen,
  isVisible: isVisProp,
  onClose,
  type = "success",
}: {
  message?: string | null;
  isOpen?: boolean;
  isVisible?: boolean;
  onClose: () => void;
  type?: "success" | "danger" | "error" | "info" | string;
}) {
  const isVisible = isOpen !== undefined ? isOpen : isVisProp !== undefined ? isVisProp : !!message;
  if (!isVisible || !message) return null;

  const bg =
    type === "danger" || type === "error"
      ? "#dc2626"
      : type === "info"
      ? "#2563eb"
      : "#0f172a";

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "12px 18px",
        borderRadius: "12px",
        background: bg,
        color: "#ffffff",
        fontSize: "13px",
        fontWeight: 600,
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
      }}
    >
      <CheckCircle2 size={16} color="#34d399" />
      <span>{message}</span>
      <button
        type="button"
        onClick={onClose}
        style={{
          background: "transparent",
          border: "none",
          color: "rgba(255, 255, 255, 0.7)",
          cursor: "pointer",
          marginLeft: "8px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}

// ======================== VERIFICATION POP-UP MODAL ========================
export function VerificationResultModal({
  isOpen,
  onClose,
  title = "AI Verification Complete!",
  itemName,
  qualityScore = 98,
  bloomLevel = "Apply & Analyze",
  verifiedCount = 1,
  remarks,
}: {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  itemName?: string;
  qualityScore?: number;
  bloomLevel?: string;
  verifiedCount?: number;
  remarks?: string;
}) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(8px)",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "24px",
          width: "90%",
          maxWidth: "480px",
          padding: "32px",
          textAlign: "center",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
          border: "1px solid rgba(124, 58, 237, 0.3)",
          position: "relative",
          animation: "scaleIn 0.25s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            position: "absolute",
            top: "18px",
            right: "18px",
            background: "#f1f5f9",
            border: "none",
            borderRadius: "50%",
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#64748b",
          }}
        >
          <X size={16} />
        </button>

        {/* Floating Glowing Icon */}
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "22px",
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px auto",
            boxShadow: "0 10px 25px rgba(16, 185, 129, 0.45)",
          }}
        >
          <CheckCircle2 size={40} color="#ffffff" style={{ filter: "drop-shadow(0 0 8px rgba(255,255,255,0.9))" }} />
        </div>

        <h3 style={{ fontSize: "21px", fontWeight: 800, color: "#0f172a", margin: "0 0 6px 0", letterSpacing: "-0.02em" }}>
          {title}
        </h3>
        <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 20px 0" }}>
          {itemName ? `Audit verification passed for "${itemName}"` : "Question repository passed AI quality audit."}
        </p>

        {/* Verification Summary Card */}
        <div
          style={{
            background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
            border: "1px solid #bbf7d0",
            borderRadius: "16px",
            padding: "18px",
            marginBottom: "22px",
            textAlign: "left",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#166534" }}>AI Verification Status</span>
            <span
              style={{
                fontSize: "11.5px",
                fontWeight: 800,
                background: "#16a34a",
                color: "#ffffff",
                padding: "3px 10px",
                borderRadius: "20px",
                boxShadow: "0 2px 6px rgba(22, 163, 74, 0.3)",
              }}
            >
              🤖 AI VERIFIED ({qualityScore}%)
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "12px", color: "#15803d", fontWeight: 600 }}>
            <div>
              <span style={{ opacity: 0.8, display: "block", fontSize: "11px" }}>Verified Items:</span>
              <strong>{verifiedCount} Question(s)</strong>
            </div>
            <div>
              <span style={{ opacity: 0.8, display: "block", fontSize: "11px" }}>Bloom's Level:</span>
              <strong>{bloomLevel}</strong>
            </div>
          </div>

          <div style={{ marginTop: "12px", paddingTop: "10px", borderTop: "1px solid rgba(22, 163, 74, 0.2)", fontSize: "11.5px", color: "#166534", lineHeight: 1.4 }}>
            💡 {remarks || "Questions phrasing syntax, distractor balance, and CO curriculum mapping successfully verified."}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "12px",
            border: "none",
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            color: "#ffffff",
            fontSize: "14px",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(16, 185, 129, 0.4)",
            transition: "all 0.2s ease",
          }}
        >
          OK, Great!
        </button>
      </div>
    </div>
  );
}

export { CrudActionButtons } from "./CrudActionButtons";
export type { CrudActionButtonsProps } from "./CrudActionButtons";
