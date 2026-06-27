// src/pages/LoginPage.js
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FormGroup, Spinner } from "../components/UI";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate   = useNavigate();
  const [form, setForm]   = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email.trim(), form.password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const msg = {
        "auth/user-not-found":   "No account found with this email.",
        "auth/wrong-password":   "Incorrect password.",
        "auth/invalid-email":    "Please enter a valid email address.",
        "auth/too-many-requests":"Too many attempts. Please try again later.",
      }[err.code] || "Sign-in failed. Please check your credentials.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 440, margin: "0 auto", padding: "2rem 1.25rem", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", gap: "1.5rem" }}>
      {/* Logo */}
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 6 }}>Record Share</div>
        <div style={{ fontSize: 15, color: "var(--text-secondary)" }}>Connect with expert record writers</div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.85rem", background: "#fff", padding: "1.5rem", borderRadius: 16, border: "1px solid var(--border)" }}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Sign in</div>

        <FormGroup label="Email address" error={error && " "}>
          <input type="email" placeholder="you@email.com" value={form.email} onChange={set("email")} required autoFocus />
        </FormGroup>

        <FormGroup label="Password" error={error}>
          <input type="password" placeholder="••••••••" value={form.password} onChange={set("password")} required />
        </FormGroup>

        <button type="submit" className="btn-primary btn-full" disabled={loading}>
          {loading ? <Spinner /> : "Sign in"}
        </button>

        <hr />
        <div style={{ fontSize: 13, textAlign: "center", color: "var(--text-secondary)" }}>
          No account?{" "}
          <Link to="/register" style={{ color: "var(--accent)", fontWeight: 600, textDecoration: "none" }}>
            Create one
          </Link>
        </div>
      </form>
    </div>
  );
      }
