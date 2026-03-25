import React, { useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");

  if (!user) {
    return <Login onLogin={(data) => setUser(data)} />;
  }

  return (
    <>
      {/* Nav tabs (only when logged in) */}
      <div style={{
        position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
        background: "#141824dd",
        backdropFilter: "blur(12px)",
        border: "1px solid #1e2535",
        borderRadius: 50,
        padding: "6px 8px",
        display: "flex",
        gap: 4,
        zIndex: 999,
        boxShadow: "0 8px 32px #000a",
      }}>
        {[
          { id: "dashboard", label: "⬛ Dashboard" },
          { id: "calendar",  label: "◫ Calendar" },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setPage(tab.id)} style={{
            background: page === tab.id ? "#1e2535" : "transparent",
            border: "none",
            color: page === tab.id ? "#e2e8f0" : "#475569",
            borderRadius: 40,
            padding: "7px 18px",
            fontFamily: "'DM Mono', monospace",
            fontSize: 12,
            cursor: "pointer",
            transition: "all 0.15s",
          }}>
            {tab.label}
          </button>
        ))}
        <button onClick={() => setUser(null)} style={{
          background: "transparent", border: "none", color: "#334155", borderRadius: 40,
          padding: "7px 14px", fontFamily: "'DM Mono', monospace", fontSize: 12, cursor: "pointer",
        }}>Sign out</button>
      </div>

      {page === "dashboard" && <Dashboard />}
      {page === "calendar"  && <Calendar />}
    </>
  );
}
