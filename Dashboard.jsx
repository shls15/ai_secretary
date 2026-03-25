import React, { useState, useEffect } from "react";
import TaskCard from "../components/TaskCard";
import ApprovalModal from "../components/ApprovalModal";
import client from "../api/client";

const MOCK_TASKS = [
  { id: "TSK-001", title: "Redesign onboarding flow",       description: "Update user onboarding to reflect new brand guidelines and simplify the 5-step process.",        priority: "High",   assignee: "sara.chen",   status: "pending",   dueDate: "2026-04-10" },
  { id: "TSK-002", title: "Fix payment gateway timeout",    description: "Stripe webhook responses are timing out under load. Needs investigation into retry logic.",        priority: "High",   assignee: "james.wu",    status: "pending",   dueDate: "2026-03-30" },
  { id: "TSK-003", title: "Write API documentation",        description: "Document all v2 endpoints with request/response examples and authentication notes.",               priority: "Medium", assignee: "priya.r",     status: "approved",  dueDate: "2026-04-15" },
  { id: "TSK-004", title: "Set up CI/CD pipeline",          description: "Configure GitHub Actions for automated testing, staging deploys, and production releases.",         priority: "Medium", assignee: "tom.blake",   status: "pending",   dueDate: "2026-04-01" },
  { id: "TSK-005", title: "Migrate legacy database tables", description: "Move user_data and sessions tables to new schema. Requires zero-downtime migration strategy.",     priority: "High",   assignee: "sara.chen",   status: "rejected",  dueDate: "2026-03-28" },
  { id: "TSK-006", title: "Add dark mode to settings",      description: "Implement theme toggle using CSS variables. Persist preference in localStorage.",                  priority: "Low",    assignee: "lei.zhou",    status: "completed", dueDate: "2026-03-20" },
  { id: "TSK-007", title: "Load test checkout service",     description: "Run k6 load tests at 2× peak traffic. Identify bottlenecks and document findings.",               priority: "Medium", assignee: "james.wu",    status: "pending",   dueDate: "2026-04-05" },
  { id: "TSK-008", title: "Update privacy policy",          description: "Reflect GDPR Article 17 changes, update data retention clauses, have legal review.",              priority: "Low",    assignee: "maya.patel",  status: "approved",  dueDate: "2026-04-20" },
];

const STATUS_TABS = ["All", "Pending", "Approved", "Rejected", "Completed"];
const PRIORITY_OPTS = ["All", "High", "Medium", "Low"];

export default function Dashboard() {
  const [tasks, setTasks] = useState(MOCK_TASKS);
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [approvalTask, setApprovalTask] = useState(null);
  const [editTask, setEditTask] = useState(null);

  const counts = {
    All: tasks.length,
    Pending:   tasks.filter(t => t.status === "pending").length,
    Approved:  tasks.filter(t => t.status === "approved").length,
    Rejected:  tasks.filter(t => t.status === "rejected").length,
    Completed: tasks.filter(t => t.status === "completed").length,
  };

  const filtered = tasks.filter((t) => {
    if (statusFilter !== "All" && t.status !== statusFilter.toLowerCase()) return false;
    if (priorityFilter !== "All" && t.priority !== priorityFilter) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const update = (id, patch) => setTasks((prev) => prev.map((t) => t.id === id ? { ...t, ...patch } : t));

  const handleApprove = (task) => setApprovalTask(task);
  const handleReject  = (task) => { if (window.confirm(`Reject "${task.title}"?`)) update(task.id, { status: "rejected" }); };
  const handleEdit    = (task) => setEditTask(task);
  const handleComplete = (task) => update(task.id, { status: "completed" });

  const handleApprovalConfirm = (updated) => {
    update(updated.id, { ...updated, status: "approved" });
    setApprovalTask(null);
  };
  const handleEditConfirm = (updated) => {
    update(updated.id, updated);
    setEditTask(null);
  };

  const statCards = [
    { label: "Total",     value: tasks.length,                                            color: "#818cf8" },
    { label: "Pending",   value: tasks.filter(t => t.status === "pending").length,        color: "#f59e0b" },
    { label: "Approved",  value: tasks.filter(t => t.status === "approved").length,       color: "#22c55e" },
    { label: "Completed", value: tasks.filter(t => t.status === "completed").length,      color: "#38bdf8" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0b0e18", color: "#e2e8f0", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Top bar */}
      <header style={{ borderBottom: "1px solid #1e2535", padding: "0 32px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0f1319" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, background: "linear-gradient(135deg, #818cf8, #38bdf8)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>⬡</div>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 17, letterSpacing: "-0.02em" }}>TaskFlow</span>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#334155", marginLeft: 4 }}>/ dashboard</span>
        </div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#475569" }}>
          {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 32px" }}>
        {/* Page title */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 28, margin: 0, letterSpacing: "-0.03em" }}>Task Dashboard</h1>
          <p style={{ fontSize: 14, color: "#475569", margin: "4px 0 0" }}>Manage, approve, and track work across your team</p>
        </div>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
          {statCards.map((sc) => (
            <div key={sc.label} style={{ background: "#141824", border: "1px solid #1e2535", borderRadius: 12, padding: "18px 20px" }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#475569", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>{sc.label}</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 32, color: sc.color }}>{sc.value}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
          {/* Search */}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks…"
            style={{ background: "#141824", border: "1px solid #1e2535", borderRadius: 8, padding: "8px 13px", color: "#cbd5e1", fontFamily: "'DM Sans', sans-serif", fontSize: 13, outline: "none", minWidth: 200 }}
          />

          {/* Status tabs */}
          <div style={{ display: "flex", gap: 4, background: "#141824", border: "1px solid #1e2535", borderRadius: 8, padding: 3 }}>
            {STATUS_TABS.map((tab) => (
              <button key={tab} onClick={() => setStatusFilter(tab)} style={{
                background: statusFilter === tab ? "#1e2535" : "transparent",
                border: "none",
                color: statusFilter === tab ? "#e2e8f0" : "#475569",
                borderRadius: 6,
                padding: "5px 12px",
                fontFamily: "'DM Mono', monospace",
                fontSize: 11,
                cursor: "pointer",
                transition: "all 0.12s",
              }}>
                {tab} {tab !== "All" && <span style={{ opacity: 0.6 }}>{counts[tab]}</span>}
              </button>
            ))}
          </div>

          {/* Priority filter */}
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} style={{ background: "#141824", border: "1px solid #1e2535", borderRadius: 8, padding: "8px 12px", color: "#cbd5e1", fontFamily: "'DM Mono', monospace", fontSize: 11, outline: "none", cursor: "pointer" }}>
            {PRIORITY_OPTS.map((p) => <option key={p} value={p}>{p === "All" ? "All priorities" : p}</option>)}
          </select>
        </div>

        {/* Task grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#334155", fontFamily: "'DM Mono', monospace", fontSize: 13 }}>
            No tasks match your filters
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14 }}>
            {filtered.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onApprove={handleApprove}
                onReject={handleReject}
                onEdit={handleEdit}
                onComplete={handleComplete}
              />
            ))}
          </div>
        )}
      </main>

      <ApprovalModal task={approvalTask} onConfirm={handleApprovalConfirm} onClose={() => setApprovalTask(null)} />
      <ApprovalModal task={editTask}     onConfirm={handleEditConfirm}     onClose={() => setEditTask(null)} />
    </div>
  );
}
