import React, { useState, useEffect } from "react";
import PriorityBadge from "./PriorityBadge";

export default function ApprovalModal({ task, onConfirm, onClose }) {
  const [form, setForm] = useState({ title: "", description: "", priority: "Medium", dueDate: "", notes: "" });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || "",
        description: task.description || "",
        priority: task.priority || "Medium",
        dueDate: task.dueDate || "",
        notes: "",
      });
      setTimeout(() => setVisible(true), 10);
    }
  }, [task]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 220);
  };

  const handleConfirm = () => {
    onConfirm?.({ ...task, ...form });
    handleClose();
  };

  if (!task) return null;

  return (
    <div
      onClick={handleClose}
      style={{
        position: "fixed", inset: 0,
        background: "#00000088",
        backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.22s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#141824",
          border: "1px solid #1e2535",
          borderRadius: 16,
          padding: "32px 36px",
          width: "100%",
          maxWidth: 520,
          boxShadow: "0 24px 80px #000a",
          transform: visible ? "translateY(0)" : "translateY(24px)",
          transition: "transform 0.22s ease",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, color: "#e2e8f0", marginBottom: 2 }}>
              Review Task
            </div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#475569" }}>#{task.id}</div>
          </div>
          <button onClick={handleClose} style={{ background: "none", border: "none", color: "#475569", fontSize: 20, cursor: "pointer", lineHeight: 1 }}>✕</button>
        </div>

        {/* Fields */}
        <Field label="Title">
          <Input value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
        </Field>

        <Field label="Description">
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            style={inputBase({ height: "auto", resize: "vertical" })}
          />
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Field label="Priority">
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} style={inputBase()}>
              {["High", "Medium", "Low"].map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Due Date">
            <Input type="date" value={form.dueDate} onChange={(v) => setForm({ ...form, dueDate: v })} />
          </Field>
        </div>

        <Field label="Approval Notes">
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={2}
            placeholder="Add notes for the assignee…"
            style={inputBase({ height: "auto", resize: "vertical" })}
          />
        </Field>

        {/* Preview badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, padding: "10px 14px", background: "#0f1319", borderRadius: 8, border: "1px solid #1e2535" }}>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#475569" }}>Preview:</span>
          <PriorityBadge priority={form.priority} />
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={handleClose} style={{ ...btnBase, background: "transparent", border: "1px solid #1e2535", color: "#64748b" }}>
            Cancel
          </button>
          <button onClick={handleConfirm} style={{ ...btnBase, background: "linear-gradient(135deg, #22c55e22, #22c55e11)", border: "1px solid #22c55e55", color: "#22c55e" }}>
            Approve Task
          </button>
        </div>
      </div>
    </div>
  );
}

const inputBase = (extra = {}) => ({
  width: "100%",
  background: "#0f1319",
  border: "1px solid #1e2535",
  borderRadius: 8,
  padding: "9px 12px",
  color: "#cbd5e1",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
  ...extra,
});

const btnBase = {
  padding: "9px 20px",
  borderRadius: 8,
  fontFamily: "'DM Mono', monospace",
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: "0.06em",
  cursor: "pointer",
  transition: "all 0.15s ease",
};

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#475569", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, type = "text", placeholder }) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      style={inputBase()}
    />
  );
}
