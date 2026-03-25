import React, { useState } from "react";
import { setToken } from "../api/client";
import client from "../api/client";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) { setError("Both fields are required."); return; }
    setLoading(true); setError("");
    try {
      const { data } = await client.post("/auth/login", { email, password });
      setToken(data.token);
      onLogin?.(data);
    } catch (e) {
      setError(e.response?.data?.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0b0e18", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
      {/* Background grid */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(#1e253511 1px, transparent 1px), linear-gradient(90deg, #1e253511 1px, transparent 1px)", backgroundSize: "48px 48px", pointerEvents: "none" }} />
      {/* Glow */}
      <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 600, background: "radial-gradient(circle, #818cf81a 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ position: "relative", width: "100%", maxWidth: 420, padding: "0 20px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, #818cf8, #38bdf8)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⬡</div>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22, color: "#e2e8f0", letterSpacing: "-0.02em" }}>TaskFlow</span>
          </div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#475569", marginTop: 8, marginBottom: 0 }}>Sign in to your workspace</p>
        </div>

        {/* Card */}
        <div style={{ background: "#141824", border: "1px solid #1e2535", borderRadius: 20, padding: "36px 32px", boxShadow: "0 24px 80px #000b" }}>
          <Field label="Email address">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="you@company.com"
              style={inp}
            />
          </Field>

          <Field label="Password">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="••••••••"
              style={inp}
            />
          </Field>

          {error && (
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#ff2d2d", background: "#ff2d2d15", border: "1px solid #ff2d2d30", borderRadius: 8, padding: "8px 12px", marginBottom: 16 }}>
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              background: loading ? "#1e2535" : "linear-gradient(135deg, #818cf8, #6366f1)",
              border: "none",
              borderRadius: 10,
              color: loading ? "#475569" : "#fff",
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700,
              fontSize: 14,
              cursor: loading ? "not-allowed" : "pointer",
              letterSpacing: "0.02em",
              transition: "all 0.2s ease",
              boxShadow: loading ? "none" : "0 4px 24px #818cf840",
            }}
          >
            {loading ? "Signing in…" : "Sign in →"}
          </button>
        </div>

        <p style={{ textAlign: "center", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#1e2535", marginTop: 24 }}>
          JWT · Token stored in memory only
        </p>
      </div>
    </div>
  );
}

const inp = {
  width: "100%",
  background: "#0f1319",
  border: "1px solid #1e2535",
  borderRadius: 8,
  padding: "10px 13px",
  color: "#cbd5e1",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s",
};

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: "block", fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#475569", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}
