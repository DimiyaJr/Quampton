"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { IconUser, IconMail, IconShieldCheck, IconIdBadge2, IconEdit, IconCheck, IconX } from "@tabler/icons-react";

const fieldStyle: React.CSSProperties = {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "10px",
  padding: "14px 18px",
  display: "flex",
  alignItems: "center",
  gap: "14px",
};

const labelStyle: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 600,
  color: "#94a3b8",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  marginBottom: "2px",
};

const valueStyle: React.CSSProperties = {
  fontSize: "15px",
  fontWeight: 500,
  color: "#1e293b",
};

const iconBox: React.CSSProperties = {
  width: "38px",
  height: "38px",
  borderRadius: "9px",
  background: "#e0f2fe",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

export default function ProfilePage() {
  const { user, setUser, token } = useAuth();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!user) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
        You are not logged in. Please <a href="/auth" style={{ color: "#2563eb" }}>sign in</a>.
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedUser = { ...user, full_name: fullName, email };
      setUser(updatedUser, token);
      setSuccess(true);
      setEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFullName(user.full_name || "");
    setEmail(user.email || "");
    setEditing(false);
  };

  const initials = (user.full_name || user.username || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", padding: "32px 16px" }}>
      <div style={{ maxWidth: "640px", margin: "0 auto" }}>
        <div style={{ background: "#fff", borderRadius: "16px", boxShadow: "0 4px 24px rgba(0,0,0,0.07)", overflow: "hidden" }}>
          {/* Header banner */}
          <div style={{ background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)", padding: "36px 32px 24px", position: "relative" }}>
            <div style={{
              width: "80px", height: "80px", borderRadius: "50%",
              background: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "28px", fontWeight: 700, color: "#0284c7",
              border: "4px solid rgba(255,255,255,0.9)",
              marginBottom: "16px",
            }}>
              {initials}
            </div>
            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#fff", margin: 0 }}>{user.full_name || user.username}</h2>
            <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)", marginTop: "4px" }}>
              <span style={{ background: "rgba(255,255,255,0.2)", padding: "2px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 600, textTransform: "capitalize" }}>
                {user.role || "user"}
              </span>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: "14px" }}>
            {success && (
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px", padding: "12px 16px", fontSize: "14px", color: "#16a34a", fontWeight: 500, display: "flex", alignItems: "center", gap: "8px" }}>
                <IconCheck size={16} /> Profile updated successfully.
              </div>
            )}

            {/* Username */}
            <div style={fieldStyle}>
              <div style={{ ...iconBox, background: "#e0f2fe" }}>
                <IconUser size={18} color="#0284c7" />
              </div>
              <div>
                <div style={labelStyle}>Username</div>
                <div style={valueStyle}>{user.username}</div>
              </div>
            </div>

            {/* Full Name */}
            <div style={fieldStyle}>
              <div style={{ ...iconBox, background: "#fef3c7" }}>
                <IconIdBadge2 size={18} color="#d97706" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={labelStyle}>Full Name</div>
                {editing ? (
                  <input
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    style={{ fontSize: "15px", fontWeight: 500, color: "#1e293b", border: "1px solid #cbd5e1", borderRadius: "6px", padding: "4px 10px", width: "100%" }}
                    autoFocus
                  />
                ) : (
                  <div style={valueStyle}>{user.full_name || "—"}</div>
                )}
              </div>
            </div>

            {/* Email */}
            <div style={fieldStyle}>
              <div style={{ ...iconBox, background: "#fce7f3" }}>
                <IconMail size={18} color="#db2777" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={labelStyle}>Email</div>
                {editing ? (
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={{ fontSize: "15px", fontWeight: 500, color: "#1e293b", border: "1px solid #cbd5e1", borderRadius: "6px", padding: "4px 10px", width: "100%" }}
                  />
                ) : (
                  <div style={valueStyle}>{user.email || "—"}</div>
                )}
              </div>
            </div>

            {/* Role */}
            <div style={fieldStyle}>
              <div style={{ ...iconBox, background: "#dcfce7" }}>
                <IconShieldCheck size={18} color="#16a34a" />
              </div>
              <div>
                <div style={labelStyle}>Role</div>
                <div style={{ ...valueStyle, textTransform: "capitalize" }}>{user.role || "user"}</div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
              {editing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{ flex: 1, padding: "11px", borderRadius: "9px", border: "none", background: "#0284c7", color: "#fff", fontWeight: 600, fontSize: "14px", cursor: saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                  >
                    <IconCheck size={16} /> {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={handleCancel}
                    style={{ padding: "11px 20px", borderRadius: "9px", border: "1px solid #e2e8f0", background: "#fff", color: "#374151", fontWeight: 500, fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                  >
                    <IconX size={16} /> Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  style={{ padding: "11px 24px", borderRadius: "9px", border: "1px solid #e2e8f0", background: "#fff", color: "#374151", fontWeight: 600, fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <IconEdit size={16} /> Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
