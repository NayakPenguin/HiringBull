"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import axios from "axios";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Company {
  id: string;
  name: string;
  description: string;
  logo: string|null;
  category: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  "TECH_GIANT",
  "FINTECH_GIANT",
  "INDIAN_STARTUP",
  "GLOBAL_STARTUP",
  "YCOMBINATOR",
  "MASS_HIRING",
  "HFT",
];

const MOCK_COMPANIES: Company[] = [];

const MONTHLY_DATA = [
  { month: "Jan", count: 2 },
  { month: "Feb", count: 5 },
  { month: "Mar", count: 4 },
  { month: "Apr", count: 8 },
  { month: "May", count: 7 },
  { month: "Jun", count: 12 },
  { month: "Jul", count: 10 },
  { month: "Aug", count: 15 },
  { month: "Sep", count: 13 },
  { month: "Oct", count: 18 },
  { month: "Nov", count: 16 },
  { month: "Dec", count: 22 },
];

const CATEGORY_COLORS: Record<string, string> = {
  TECH_GIANT:     "#4285F4",
  FINTECH_GIANT:  "#FBBC05",
  INDIAN_STARTUP: "#34A853",
  GLOBAL_STARTUP: "#EA4335",
  YCOMBINATOR:    "#FF6D00",
  MASS_HIRING:    "#9C27B0",
  HFT:            "#00ACC1",
};

// ─── SVG Line Chart ───────────────────────────────────────────────────────────
function LineChart({ data }: { data: { month: string; count: number }[] }) {
  const w = 100, h = 100;
  const max = Math.max(...data.map((d) => d.count), 1);
  const pts = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - (d.count / max) * (h - 10) - 5;
      return `${x},${y}`;
    })
    .join(" ");

  const areaPath = `M0,${h} ${data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - (d.count / max) * (h - 10) - 5;
      return `L${x},${y}`;
    })
    .join(" ")} L${w},${h} Z`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      style={{ width: "100%", height: "100%" }}
    >
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4285F4" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#4285F4" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#lineGrad)" />
      <polyline
        points={pts}
        fill="none"
        stroke="#4285F4"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Donut Chart ──────────────────────────────────────────────────────────────
function DonutChart({
  data,
}: {
  data: { label: string; value: number; color: string }[];
}) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = 38, cx = 50, cy = 50, strokeW = 14;
  const circ = 2 * Math.PI * r;
  let cum = 0;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      <svg width="100" height="100" style={{ flexShrink: 0 }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e8eaed" strokeWidth={strokeW} />
        {data.map((d, i) => {
          const fraction = d.value / total;
          const dash = fraction * circ;
          const rot = (cum / total) * 360 - 90;
          cum += d.value;
          if (d.value === 0) return null;
          return (
            <circle
              key={i}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={d.color}
              strokeWidth={strokeW}
              strokeDasharray={`${dash} ${circ - dash}`}
              transform={`rotate(${rot} ${cx} ${cy})`}
              strokeLinecap="butt"
            />
          );
        })}
        <text x={cx} y={cy - 4} textAnchor="middle" style={{ fontSize: 14, fontWeight: 700, fill: "#202124" }}>
          {total}
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" style={{ fontSize: 8, fill: "#9aa0a6" }}>
          Total
        </text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: d.color, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: "#5f6368", whiteSpace: "nowrap" }}>{d.label.replace(/_/g, " ")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Add Company Modal ────────────────────────────────────────────────────────
function AddCompanyModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (c: Company) => void;
}) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    logo: "",
    category: CATEGORIES[0],
  });
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
  const url = e.target.value;
  
  // Update the preview
  setLogoPreview(url);
  
  // Update the form state to send to the backend
  setForm((p) => ({ ...p, logo: url }));
}

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.description) return;
    setSaving(true);
    try {
      const response = await axios.post("http://localhost:4000/api/companies/", {
        name: form.name,
        description: form.description,
        category: form.category,
        logo:form.logo
      });
      console.log(response.data);
    } catch (err) {
      console.error(err);
    }
    setTimeout(() => {
      onAdd({
        id: String(Date.now()),
        name: form.name,
        description: form.description,
        logo: form.logo || form.name.slice(0, 2).toUpperCase(),
        category: form.category,
      });
      onClose();
    }, 600);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px 12px",
    border: "1px solid #dadce0",
    borderRadius: 4,
    fontSize: 14,
    color: "#202124",
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
    background: "#fff",
    transition: "border-color 0.15s",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.32)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 8,
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          padding: "32px 36px",
          width: "100%",
          maxWidth: 480,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <h3 style={{ fontSize: 17, fontWeight: 600, color: "#202124", margin: 0 }}>
            Add Company
          </h3>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#5f6368", lineHeight: 1, padding: 2 }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Logo Upload */}
           {/* Logo URL Input */}
<div>
  <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#5f6368", marginBottom: 8 }}>
    Company Logo URL{" "}
    <span style={{ fontSize: 11, fontWeight: 400, color: "#9aa0a6" }}>(optional)</span>
  </label>
  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
    
    {/* Preview Box */}
    <div
      style={{
        width: 56,
        height: 56,
        borderRadius: 8,
        border: "2px dashed #dadce0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        flexShrink: 0,
        background: "#f8f9fa",
      }}
    >
      {/* Note: Change 'logoPreview' to whatever state holds your string URL */}
      {logoPreview ? (
        <img src={logoPreview} alt="logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9aa0a6" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      )}
    </div>

    {/* String/URL Input Field */}
    <div style={{ flex: 1, maxWidth: 300 }}>
      <input 
        type="text" 
        value={logoPreview||""} 
        onChange={handleLogoChange} 
        placeholder="https://example.com/logo.png"
        style={{
          width: "100%",
          padding: "7px 12px",
          border: "1px solid #dadce0",
          borderRadius: 4,
          background: "#fff",
          fontSize: 13,
          color: "#3c4043",
          fontFamily: "inherit",
          boxSizing: "border-box",
          outline: "none",
        }} 
      />
      <p style={{ fontSize: 11, color: "#9aa0a6", marginTop: 4 }}>
        Enter a valid image URL
      </p>
    </div>
    
  </div>
</div>
          {/* Name */}
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#5f6368", marginBottom: 6 }}>
              Company Name <span style={{ color: "#ea4335" }}>*</span>
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Google"
              required
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#4285f4")}
              onBlur={(e) => (e.target.style.borderColor = "#dadce0")}
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#5f6368", marginBottom: 6 }}>
              Description <span style={{ color: "#ea4335" }}>*</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Brief description of the company..."
              rows={3}
              required
              style={{ ...inputStyle, resize: "vertical" }}
              onFocus={(e) => ((e.target as HTMLTextAreaElement).style.borderColor = "#4285f4")}
              onBlur={(e) => ((e.target as HTMLTextAreaElement).style.borderColor = "#dadce0")}
            />
          </div>

          {/* Category */}
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#5f6368", marginBottom: 6 }}>
              Category{" "}
              <span style={{ fontSize: 11, fontWeight: 400, color: "#9aa0a6" }}>(optional)</span>
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "8px 20px",
                border: "none",
                background: "none",
                fontSize: 14,
                color: "#4285f4",
                cursor: "pointer",
                fontFamily: "inherit",
                fontWeight: 500,
                borderRadius: 4,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: "8px 24px",
                border: "none",
                borderRadius: 4,
                background: saving ? "#a8c7fa" : "#4285f4",
                color: "#fff",
                fontSize: 14,
                fontWeight: 500,
                cursor: saving ? "default" : "pointer",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {saving && (
                <span
                  style={{
                    width: 13,
                    height: 13,
                    border: "2px solid rgba(255,255,255,0.4)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    display: "inline-block",
                    animation: "spin 0.7s linear infinite",
                  }}
                />
              )}
              {saving ? "Saving..." : "Add Company"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
  function DeleteModal({
  company,
  onClose,
  onConfirm,
}: {
  company: Company;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const handleDelete = async () => {
    try {
      const response = await axios.delete(
        `http://localhost:4000/api/companies/${company.id}`
      );

      console.log(response.data);

      onConfirm();
      onClose();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.32)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 8,
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          padding: "28px 32px",
          width: "100%",
          maxWidth: 380,
          textAlign: "center",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "rgba(234,67,53,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            fontSize: 20,
          }}
        >
          🗑️
        </div>

        <h3
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: "#202124",
            margin: "0 0 8px",
          }}
        >
          Delete {company.name}?
        </h3>

        <p
          style={{
            fontSize: 13,
            color: "#5f6368",
            lineHeight: 1.6,
            margin: "0 0 24px",
          }}
        >
          This action cannot be undone. All data associated with this company
          will be permanently removed.
        </p>

        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "center",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "8px 22px",
              border: "1px solid #dadce0",
              borderRadius: 4,
              background: "#fff",
              fontSize: 14,
              color: "#3c4043",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Cancel
          </button>

          <button
            onClick={handleDelete}
            style={{
              padding: "8px 22px",
              border: "none",
              borderRadius: 4,
              background: "#ea4335",
              fontSize: 14,
              color: "#fff",
              cursor: "pointer",
              fontFamily: "inherit",
              fontWeight: 500,
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
// ─── Main Dashboard Page ──────────────────────────────────────────────────────
export default function DashboardPage() {
  const [companies, setCompanies] = useState<Company[]>(MOCK_COMPANIES);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Company | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    axios
      .get("http://localhost:4000/api/companies")
      .then((res) => setCompanies(res.data))
      .catch((err) => console.error("Failed to fetch companies:", err));
  }, []);

  const filtered = useMemo(
    () =>
      companies.filter((c) => {
       const matchSearch =
  (c.name || "").toLowerCase().includes(search.toLowerCase()) ||
  (c.description || "").toLowerCase().includes(search.toLowerCase()) ||
  (c.category || "").toLowerCase().includes(search.toLowerCase());
        const matchCat =
          categoryFilter === "all" || c.category === categoryFilter;
        return matchSearch && matchCat;
      }),
    [companies, search, categoryFilter]
  );

  const categoryDistribution = CATEGORIES.map((cat) => ({
    label: cat,
    value: companies.filter((c) => c.category === cat).length,
    color: CATEGORY_COLORS[cat],
  })).filter((d) => d.value > 0);

  function toggleRow(id: string) {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function deleteSelected() {
    setCompanies((prev) => prev.filter((c) => !selectedRows.has(c.id)));
    setSelectedRows(new Set());
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;600;700&family=Roboto:wght@300;400;500;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Roboto', 'Google Sans', sans-serif; }
        .db-root { font-family: 'Roboto', 'Google Sans', sans-serif; background: #f8f9fa; min-height: 100vh; }
        .db-root input, .db-root select, .db-root textarea { font-family: 'Roboto', sans-serif; }
        .stat-card { animation: fadeUp 0.35s ease both; }
        .stat-card:nth-child(1) { animation-delay: 0.04s; }
        .stat-card:nth-child(2) { animation-delay: 0.08s; }
        .stat-card:nth-child(3) { animation-delay: 0.12s; }
        .stat-card:nth-child(4) { animation-delay: 0.16s; }
        .trow:hover { background: #f8f9fa; }
        .trow.selected { background: #e8f0fe; }
        .action-icon { opacity: 0; transition: opacity 0.15s; }
        .trow:hover .action-icon { opacity: 1; }
        .del-btn:hover { background: rgba(234,67,53,0.1) !important; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #dadce0; border-radius: 10px; }
        .tag { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 500; white-space: nowrap; }
        .header-btn { display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 4px; font-size: 13px; font-weight: 500; cursor: pointer; font-family: 'Roboto', sans-serif; transition: background 0.15s; }
      `}</style>

      <div className="db-root">
        {/* ── Top Bar ── */}
        <header
          style={{
            height: 56,
            background: "#fff",
            borderBottom: "1px solid #e8eaed",
            display: "flex",
            alignItems: "center",
            paddingInline: 20,
            gap: 14,
            position: "sticky",
            top: 0,
            zIndex: 200,
          }}
        >
          {/* Logo + Title */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginRight: 8 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                background: "linear-gradient(135deg, #4285f4, #34a853)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </div>
            <span style={{ fontSize: 16, fontWeight: 500, color: "#202124" }}>HiringBull Dashboard</span>
          </div>

          {/* Saved indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#5f6368", fontSize: 13 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Saved
          </div>

          <div style={{ flex: 1 }} />

          {/* Three-dots */}
          <button style={{ background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: "50%", color: "#5f6368" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>

          {/* Avatar */}
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "#4285f4",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 700,
              color: "#fff",
              cursor: "pointer",
            }}
          >
            A
          </div>
        </header>

        {/* ── Page Content ── */}
        <main style={{ padding: "24px 28px", maxWidth: 1400, margin: "0 auto" }}>

          {/* ── Row 1: Stat Cards + Charts ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(140px,1fr)) 2fr 1.5fr", gap: 16, marginBottom: 20, alignItems: "stretch" }}>

            {/* Stat Cards */}
            {[
              {
                label: "Total Companies",
                value: companies.length,
                delta: "+2 this week",
                color: "#34a853",
              },
              {
                label: "Total Categories",
                value: CATEGORIES.length,
                delta: "Active segments",
                color: "#4285f4",
              },
              {
                label: "Avg / Category",
                value: CATEGORIES.length > 0 ? (companies.length / CATEGORIES.length).toFixed(1) : "0",
                delta: "companies each",
                color: "#fbbc05",
              },
              {
                label: "Added This Month",
                value: 2,
                delta: "+5.4% vs last month",
                color: "#34a853",
              },
            ].map((s, i) => (
              <div
                key={i}
                className="stat-card"
                style={{
                  background: "#fff",
                  border: "1px solid #e8eaed",
                  borderRadius: 8,
                  padding: "16px 18px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: 110,
                }}
              >
                <p style={{ fontSize: 12, color: "#5f6368", fontWeight: 400, marginBottom: 8 }}>{s.label}</p>
                <div
                  style={{ fontSize: 28, fontWeight: 700, color: "#202124", letterSpacing: "-0.5px", lineHeight: 1 }}
                >
                  {s.value}
                </div>
                <p style={{ fontSize: 12, color: s.color, marginTop: 8, fontWeight: 500 }}>{s.delta}</p>
              </div>
            ))}

            {/* Line Chart Card */}
            <div
              style={{
                background: "#fff",
                border: "1px solid #e8eaed",
                borderRadius: 8,
                padding: "16px 18px",
              }}
            >
              <p style={{ fontSize: 12, color: "#5f6368", fontWeight: 500, marginBottom: 10 }}>
                Companies Over Time
              </p>
              <div style={{ display: "flex", gap: 20, marginBottom: 8 }}>
                <div>
                  <span style={{ fontSize: 11, color: "#9aa0a6" }}>Max</span>
                  <div style={{ fontSize: 11, color: "#5f6368" }}>
                    {Math.max(...MONTHLY_DATA.map((d) => d.count))}
                  </div>
                </div>
              </div>
              <div style={{ height: 80 }}>
                <LineChart data={MONTHLY_DATA} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                {["Jan", "Apr", "Jul", "Oct", "Dec"].map((m) => (
                  <span key={m} style={{ fontSize: 10, color: "#9aa0a6" }}>{m}</span>
                ))}
              </div>
            </div>

            {/* Donut Chart Card */}
            <div
              style={{
                background: "#fff",
                border: "1px solid #e8eaed",
                borderRadius: 8,
                padding: "16px 18px",
              }}
            >
              <p style={{ fontSize: 12, color: "#5f6368", fontWeight: 500, marginBottom: 12 }}>
                By Category
              </p>
              {categoryDistribution.length > 0 ? (
                <DonutChart data={categoryDistribution} />
              ) : (
                <div style={{ textAlign: "center", color: "#9aa0a6", fontSize: 12, paddingTop: 20 }}>
                  No data yet
                </div>
              )}
            </div>
          </div>

          {/* ── Row 2: Toolbar ── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 0,
              background: "#fff",
              border: "1px solid #e8eaed",
              borderBottom: "none",
              borderRadius: "8px 8px 0 0",
              padding: "10px 16px",
            }}
          >
            {/* Add Row */}
            <button
              className="header-btn"
              onClick={() => setShowAdd(true)}
              style={{
                border: "1px solid #dadce0",
                background: "#fff",
                color: "#3c4043",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4285f4" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span style={{ color: "#3c4043" }}>Add Company</span>
            </button>

            {/* Delete Selected */}
            <button
              className="header-btn"
              onClick={deleteSelected}
              disabled={selectedRows.size === 0}
              style={{
                border: "1px solid #dadce0",
                background: "#fff",
                color: selectedRows.size > 0 ? "#ea4335" : "#bdc1c6",
                cursor: selectedRows.size > 0 ? "pointer" : "default",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
              </svg>
              Delete{selectedRows.size > 0 ? ` (${selectedRows.size})` : ""}
            </button>

            {/* Category filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                padding: "7px 12px",
                border: "1px solid #dadce0",
                borderRadius: 4,
                fontSize: 13,
                color: "#3c4043",
                background: "#fff",
                cursor: "pointer",
                fontFamily: "inherit",
                outline: "none",
              }}
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c.replace(/_/g, " ")}</option>
              ))}
            </select>

            <div style={{ flex: 1 }} />

            {/* Search */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                border: "1px solid #dadce0",
                borderRadius: 4,
                padding: "7px 12px",
                background: "#fff",
                minWidth: 220,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9aa0a6" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                style={{
                  border: "none",
                  outline: "none",
                  fontSize: 13,
                  color: "#202124",
                  background: "transparent",
                  flex: 1,
                  fontFamily: "inherit",
                }}
              />
            </div>
          </div>

          {/* ── Row 3: Table ── */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #e8eaed",
              borderRadius: "0 0 8px 8px",
              overflow: "hidden",
            }}
          >
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #e8eaed" }}>
                    {/* Row number */}
                    <th style={{ width: 48, padding: "10px 12px", background: "#f8f9fa", color: "#5f6368", fontWeight: 500, textAlign: "center", fontSize: 12 }}>
                      #
                    </th>
                    {/* Checkbox */}
                    <th style={{ width: 40, padding: "10px 8px", background: "#f8f9fa" }}>
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRows(new Set(filtered.map((c) => c.id)));
                          } else {
                            setSelectedRows(new Set());
                          }
                        }}
                        checked={filtered.length > 0 && selectedRows.size === filtered.length}
                        style={{ cursor: "pointer" }}
                      />
                    </th>
                    {["Logo", "Name", "Description", "Category", "Actions"].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "10px 14px",
                          background: "#f8f9fa",
                          color: "#5f6368",
                          fontWeight: 500,
                          textAlign: "left",
                          fontSize: 12,
                          whiteSpace: "nowrap",
                          borderLeft: "1px solid #e8eaed",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: "48px 20px", textAlign: "center", color: "#9aa0a6", fontSize: 14 }}>
                        {search || categoryFilter !== "all"
                          ? "No companies match your search."
                          : "No companies yet. Click \"Add Company\" to get started."}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((company, idx) => {
                      const color = CATEGORY_COLORS[company.category] ?? "#5f6368";
                      const isSelected = selectedRows.has(company.id);
                      const isImg =
  typeof company.logo === "string" &&
  (company.logo.startsWith("data:") ||
    company.logo.startsWith("http"));

                      return (
                        <tr
                          key={company.id}
                          className={`trow${isSelected ? " selected" : ""}`}
                          style={{ borderBottom: "1px solid #e8eaed", cursor: "default" }}
                        >
                          {/* Row number */}
                          <td style={{ padding: "12px 12px", textAlign: "center", color: "#9aa0a6", fontSize: 12, borderRight: "1px solid #e8eaed" }}>
                            {idx + 1}
                          </td>
                          {/* Checkbox */}
                          <td style={{ padding: "12px 8px", textAlign: "center" }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleRow(company.id)}
                              style={{ cursor: "pointer" }}
                            />
                          </td>
                          {/* Logo */}
                          <td style={{ padding: "10px 14px", borderLeft: "1px solid #e8eaed" }}>
                            {isImg ? (
                              <img
                                src={company.logo}
                                alt={company.name}
                                style={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: 6,
                                  objectFit: "cover",
                                  border: "1px solid #e8eaed",
                                  display: "block",
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: 6,
                                  background: "#f1f3f4",
                                  border: "1px solid #e8eaed",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                }}
                              >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9aa0a6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                  <polyline points="9 22 9 12 15 12 15 22" />
                                </svg>
                              </div>
                            )}
                          </td>
                          {/* Name */}
                          <td style={{ padding: "12px 14px", borderLeft: "1px solid #e8eaed" }}>
                            <span style={{ fontWeight: 500, color: "#202124" }}>{company.name}</span>
                          </td>
                          {/* Description */}
                          <td style={{ padding: "12px 14px", maxWidth: 340, borderLeft: "1px solid #e8eaed" }}>
                            <span
                              style={{
                                color: "#5f6368",
                                lineHeight: 1.5,
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {company.description}
                            </span>
                          </td>
                          {/* Category */}
                          <td style={{ padding: "12px 14px", borderLeft: "1px solid #e8eaed" }}>
                            <span
                              className="tag"
                              style={{
                                background: `${color}18`,
                                color: color,
                                border: `1px solid ${color}40`,
                              }}
                            >
                              {(company.category || "UNCATEGORIZED").replace(/_/g, " ")}
                            </span>
                          </td>
                          {/* Actions */}
                          <td style={{ padding: "12px 14px", borderLeft: "1px solid #e8eaed" }}>
                            <button
                              className="action-icon del-btn"
                              onClick={() => setDeleteTarget(company)}
                              title="Delete"
                              style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                padding: 6,
                                borderRadius: 4,
                                color: "#ea4335",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                                <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            {filtered.length > 0 && (
              <div
                style={{
                  padding: "10px 16px",
                  borderTop: "1px solid #e8eaed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "#f8f9fa",
                }}
              >
                <span style={{ fontSize: 12, color: "#5f6368" }}>
                  Showing <strong style={{ color: "#202124" }}>{filtered.length}</strong> of{" "}
                  <strong style={{ color: "#202124" }}>{companies.length}</strong> companies
                </span>
                {selectedRows.size > 0 && (
                  <span style={{ fontSize: 12, color: "#4285f4", fontWeight: 500 }}>
                    {selectedRows.size} row{selectedRows.size > 1 ? "s" : ""} selected
                  </span>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      {showAdd && (
        <AddCompanyModal
          onClose={() => setShowAdd(false)}
          onAdd={(c) => setCompanies((prev) => [c, ...prev])}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          company={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => {
            setCompanies((prev) => prev.filter((c) => c.id !== deleteTarget.id));
            setDeleteTarget(null);
          }}
        />
      )}
    </>
  );
}
