import React from "react";

const config = {
  High:   { label: "HIGH",   bg: "#ff2d2d22", color: "#ff2d2d", border: "#ff2d2d55", dot: "#ff2d2d" },
  Medium: { label: "MED",    bg: "#f59e0b22", color: "#f59e0b", border: "#f59e0b55", dot: "#f59e0b" },
  Low:    { label: "LOW",    bg: "#22c55e22", color: "#22c55e", border: "#22c55e55", dot: "#22c55e" },
};

export default function PriorityBadge({ priority = "Low" }) {
  const c = config[priority] || config.Low;
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      padding: "3px 9px",
      borderRadius: 4,
      background: c.bg,
      border: `1px solid ${c.border}`,
      color: c.color,
      fontFamily: "'DM Mono', monospace",
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: c.dot, flexShrink: 0 }} />
      {c.label}
    </span>
  );
}
