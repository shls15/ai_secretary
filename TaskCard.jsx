import React, { useState } from "react";
import PriorityBadge from "./PriorityBadge";

export default function TaskCard({ task, onApprove, onReject, onEdit, onComplete }) {
  const [hovered, setHovered] = useState(false);

  const statusStyles = {
    pending:    { color: "#f59e0b", bg: "#f59e0b18", label: "Pending" },
    approved:   { color: "#22c55e", bg: "#22c55e18", label: "Approved" },
    rejected:   { color: "#ff2d2d", bg: "#ff2d2d18", label: "Rejected" },
    completed:  { color: "#818cf8", bg: "#818cf818", label: "Completed" },
  };
  const s = statusStyles[task.status] || statusStyles.pending;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "#1a1f2e" : "#141824",
        border: "1px solid",
        borderColor: hovered ? "#334155" : "#1e2535",
        borderRadius: 12,
        padding: "20px 22px",
        transition: "all 0.18s ease",
        transform: hovered ? "translateY(-2px)" : "none",
        boxShadow: hovered ? "0 8px 32px #0007" : "0 2px 8px #0004",
        cursor: "default",
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, color: "#e2e8f0", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {task.title}
          </div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#475569" }}>
            #{task.id} · {task.assignee}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, marginLeft: 12 }}>
          <PriorityBadge priority={task.priority} />
          <span style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 10,
            padding: "2px 8px",
            borderRadius: 4,
            background: s.bg,
            color: s.color,
            border: `1px solid ${s.color}33`,
            letterSpacing: "0.08em",
          }}>{s.label}</span>
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#64748b", lineHeight: 1.55, margin: "0 0 14px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {task.description}
        </p>
      )}

      {/* Due date */}
      {task.dueDate && (
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#475569", marginBottom: 14 }}>
          Due {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {task.status === "pending" && (
          <>
            <ActionBtn label="Approve" color="#22c55e" onClick={() => onApprove?.(task)} />
            <ActionBtn label="Reject"  color="#ff2d2d" onClick={() => onReject?.(task)} />
          </>
        )}
        <ActionBtn label="Edit" color="#818cf8" onClick={() => onEdit?.(task)} />
        {task.status !== "completed" && (
          <ActionBtn label="Complete" color="#38bdf8" onClick={() => onComplete?.(task)} />
        )}
      </div>
    </div>
  );
}

function ActionBtn({ label, color, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? color + "22" : "transparent",
        border: `1px solid ${color}44`,
        color: hov ? color : color + "aa",
        borderRadius: 6,
        padding: "5px 12px",
        fontFamily: "'DM Mono', monospace",
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.06em",
        cursor: "pointer",
        transition: "all 0.15s ease",
      }}
    >
      {label}
    </button>
  );
}
