import React, { useState } from "react";
import PriorityBadge from "../components/PriorityBadge";

const MOCK_EVENTS = [
  { id: "E-01", title: "Sprint Planning",        date: "2026-03-25", time: "10:00", duration: 90, priority: "High",   assignee: "team",         color: "#818cf8" },
  { id: "E-02", title: "API Doc Review",          date: "2026-03-25", time: "14:00", duration: 30, priority: "Medium", assignee: "priya.r",      color: "#38bdf8" },
  { id: "E-03", title: "Design Handoff",          date: "2026-03-26", time: "09:30", duration: 60, priority: "High",   assignee: "sara.chen",    color: "#818cf8" },
  { id: "E-04", title: "DB Migration Dry Run",    date: "2026-03-26", time: "15:00", duration: 45, priority: "High",   assignee: "sara.chen",    color: "#f43f5e" },
  { id: "E-05", title: "1:1 James",               date: "2026-03-27", time: "11:00", duration: 30, priority: "Low",    assignee: "james.wu",     color: "#22c55e" },
  { id: "E-06", title: "Load Test Setup",         date: "2026-03-27", time: "14:30", duration: 120,priority: "Medium", assignee: "james.wu",     color: "#38bdf8" },
  { id: "E-07", title: "Quarterly Review",        date: "2026-03-28", time: "13:00", duration: 90, priority: "High",   assignee: "team",         color: "#818cf8" },
  { id: "E-08", title: "Privacy Policy Sign-off", date: "2026-03-31", time: "10:00", duration: 30, priority: "Low",    assignee: "maya.patel",   color: "#22c55e" },
  { id: "E-09", title: "CI/CD Demo",              date: "2026-04-01", time: "16:00", duration: 45, priority: "Medium", assignee: "tom.blake",    color: "#38bdf8" },
  { id: "E-10", title: "Onboarding Workshop",     date: "2026-04-02", time: "09:00", duration: 120,priority: "High",   assignee: "sara.chen",    color: "#818cf8" },
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function buildCalendar(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

export default function Calendar() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState(today.getDate());
  const [view, setView] = useState("month"); // month | day

  const cells = buildCalendar(year, month);

  const eventsForDate = (d) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    return MOCK_EVENTS.filter((e) => e.date === dateStr);
  };

  const selectedDateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(selected).padStart(2, "0")}`;
  const selectedEvents = MOCK_EVENTS.filter((e) => e.date === selectedDateStr).sort((a, b) => a.time.localeCompare(b.time));

  const prevMonth = () => { if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1); };

  return (
    <div style={{ minHeight: "100vh", background: "#0b0e18", color: "#e2e8f0", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Top bar */}
      <header style={{ borderBottom: "1px solid #1e2535", padding: "0 32px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0f1319" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, background: "linear-gradient(135deg, #818cf8, #38bdf8)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>⬡</div>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 17, letterSpacing: "-0.02em" }}>TaskFlow</span>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#334155", marginLeft: 4 }}>/ calendar</span>
        </div>
        <div style={{ display: "flex", gap: 4, background: "#141824", border: "1px solid #1e2535", borderRadius: 8, padding: 3 }}>
          {["month", "day"].map((v) => (
            <button key={v} onClick={() => setView(v)} style={{ background: view === v ? "#1e2535" : "transparent", border: "none", color: view === v ? "#e2e8f0" : "#475569", borderRadius: 6, padding: "5px 14px", fontFamily: "'DM Mono', monospace", fontSize: 11, cursor: "pointer" }}>
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px" }}>
        <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
          {/* Calendar panel */}
          <div style={{ flex: 1 }}>
            {/* Month nav */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <button onClick={prevMonth} style={navBtn}>‹</button>
              <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.03em" }}>
                {MONTHS[month]} <span style={{ color: "#475569" }}>{year}</span>
              </span>
              <button onClick={nextMonth} style={navBtn}>›</button>
            </div>

            {/* Day headers */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 4 }}>
              {DAYS.map((d) => (
                <div key={d} style={{ textAlign: "center", fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#334155", letterSpacing: "0.08em", padding: "6px 0" }}>{d}</div>
              ))}
            </div>

            {/* Calendar grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
              {cells.map((day, i) => {
                if (!day) return <div key={i} />;
                const evs = eventsForDate(day);
                const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                const isSelected = day === selected;
                return (
                  <div
                    key={i}
                    onClick={() => setSelected(day)}
                    style={{
                      minHeight: 76,
                      background: isSelected ? "#1e2535" : "#141824",
                      border: `1px solid ${isSelected ? "#334155" : isToday ? "#818cf844" : "#1a2030"}`,
                      borderRadius: 10,
                      padding: "8px 9px",
                      cursor: "pointer",
                      transition: "all 0.12s",
                    }}
                  >
                    <div style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 12,
                      fontWeight: isToday ? 700 : 400,
                      color: isToday ? "#818cf8" : isSelected ? "#e2e8f0" : "#64748b",
                      marginBottom: 4,
                    }}>{day}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      {evs.slice(0, 2).map((ev) => (
                        <div key={ev.id} style={{ background: ev.color + "25", border: `1px solid ${ev.color}40`, borderRadius: 3, padding: "1px 5px", fontFamily: "'DM Mono', monospace", fontSize: 9, color: ev.color, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {ev.time} {ev.title}
                        </div>
                      ))}
                      {evs.length > 2 && <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#334155" }}>+{evs.length - 2} more</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Day detail panel */}
          <div style={{ width: 300, flexShrink: 0 }}>
            <div style={{ background: "#141824", border: "1px solid #1e2535", borderRadius: 14, padding: "22px 20px" }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16, marginBottom: 4 }}>
                {MONTHS[month]} {selected}
              </div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#475569", letterSpacing: "0.08em", marginBottom: 18 }}>
                {selectedEvents.length} EVENT{selectedEvents.length !== 1 ? "S" : ""}
              </div>

              {selectedEvents.length === 0 ? (
                <div style={{ color: "#334155", fontFamily: "'DM Mono', monospace", fontSize: 12, textAlign: "center", padding: "24px 0" }}>No events scheduled</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {selectedEvents.map((ev) => (
                    <div key={ev.id} style={{ background: "#0f1319", border: `1px solid ${ev.color}30`, borderLeft: `3px solid ${ev.color}`, borderRadius: 8, padding: "12px 13px" }}>
                      <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13, color: "#e2e8f0", marginBottom: 5 }}>{ev.title}</div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#475569" }}>
                          {ev.time} · {ev.duration}m
                        </div>
                        <PriorityBadge priority={ev.priority} />
                      </div>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#334155", marginTop: 5 }}>{ev.assignee}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming strip */}
            <div style={{ marginTop: 14, background: "#141824", border: "1px solid #1e2535", borderRadius: 14, padding: "18px 20px" }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#475569", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Upcoming</div>
              {MOCK_EVENTS.filter((e) => e.date >= `${year}-${String(month + 1).padStart(2, "0")}-${String(selected).padStart(2, "0")}`).slice(0, 4).map((ev) => (
                <div key={ev.id} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
                  <div style={{ width: 3, height: 36, background: ev.color, borderRadius: 2, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#cbd5e1", fontWeight: 500 }}>{ev.title}</div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#475569" }}>{ev.date} {ev.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const navBtn = {
  background: "#141824",
  border: "1px solid #1e2535",
  borderRadius: 8,
  color: "#475569",
  width: 32,
  height: 32,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  fontSize: 18,
  fontFamily: "sans-serif",
};
