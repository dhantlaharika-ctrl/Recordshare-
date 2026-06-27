// src/components/UI.js
import React from "react";

/* ── Avatar ─────────────────────────────────────────── */
const COLORS = ["#2563eb","#059669","#d97706","#7c3aed","#dc2626","#0891b2","#db2777","#65a30d"];
export function colorFor(uid = "") {
  let n = 0;
  for (let i = 0; i < uid.length; i++) n += uid.charCodeAt(i);
  return COLORS[n % COLORS.length];
}
export function initials(name = "") {
  return name.trim().split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}
export function Avatar({ user, size = 38 }) {
  const color = colorFor(user?.uid || user?.id || "");
  const fs = size > 44 ? 18 : size > 32 ? 14 : 12;
  return (
    <div className="avatar" style={{ width: size, height: size, background: color + "18", color, fontSize: fs }}>
      {user?.photoURL
        ? <img src={user.photoURL} alt="" style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }} />
        : initials(user?.name || user?.displayName || "?")}
    </div>
  );
}

/* ── Stars ──────────────────────────────────────────── */
export function Stars({ value = 0, onChange, size = 22, readonly = false }) {
  return (
    <div className="stars">
      {[1,2,3,4,5].map(i => (
        <span
          key={i}
          className={`star ${i <= value ? "filled" : "empty"} ${readonly ? "readonly" : ""}`}
          style={{ fontSize: size }}
          onClick={() => !readonly && onChange && onChange(i)}
        >★</span>
      ))}
    </div>
  );
}

/* ── Badge ──────────────────────────────────────────── */
export function Badge({ children, variant = "gray" }) {
  return <span className={`badge badge-${variant}`}>{children}</span>;
}

/* ── Modal ──────────────────────────────────────────── */
export function Modal({ title, onClose, children }) {
  React.useEffect(() => {
    const handler = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);
  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ── Spinner ────────────────────────────────────────── */
export function Spinner({ dark = false }) {
  return <div className={`spinner${dark ? " dark" : ""}`} />;
}

/* ── Category badge ─────────────────────────────────── */
const CAT_VARIANT = { Legal: "blue", Medical: "amber", Business: "green", Academic: "gray", Other: "gray" };
export function CategoryBadge({ cat }) {
  return <Badge variant={CAT_VARIANT[cat] || "gray"}>{cat}</Badge>;
}

/* ── FormGroup ──────────────────────────────────────── */
export function FormGroup({ label, error, children }) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      {children}
      {error && <span className="form-error">⚠ {error}</span>}
    </div>
  );
}

/* ── InfoBox ────────────────────────────────────────── */
export function InfoBox({ variant = "info", icon, children }) {
  return (
    <div className={`info-box ${variant}`}>
      {icon && <span>{icon}</span>}
      <span>{children}</span>
    </div>
  );
}

/* ── EmptyState ─────────────────────────────────────── */
export function EmptyState({ icon, message }) {
  return (
    <div className="empty-state">
      <div style={{ fontSize: 40, marginBottom: 10, opacity: 0.4 }}>{icon || "📭"}</div>
      <div>{message}</div>
    </div>
  );
                    }
