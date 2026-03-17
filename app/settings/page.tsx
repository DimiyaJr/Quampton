"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  IconLock,
  IconBell,
  IconLanguage,
  IconMoon,
  IconCheck,
  IconChevronRight,
} from "@tabler/icons-react";

const sectionTitle: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 700,
  color: "#94a3b8",
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  marginBottom: "8px",
  marginTop: "4px",
};

const card: React.CSSProperties = {
  background: "#fff",
  borderRadius: "14px",
  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
  overflow: "hidden",
};

const rowBase: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "16px 20px",
  borderBottom: "1px solid #f1f5f9",
  cursor: "pointer",
  transition: "background 0.15s",
};

const iconCircle = (bg: string): React.CSSProperties => ({
  width: "34px", height: "34px", borderRadius: "9px",
  background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
});

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("English");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passError, setPassError] = useState("");
  const [passSuccess, setPassSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChangePassword = async () => {
    setPassError("");
    if (!oldPass || !newPass || !confirmPass) { setPassError("All fields are required."); return; }
    if (newPass !== confirmPass) { setPassError("New passwords do not match."); return; }
    if (newPass.length < 6) { setPassError("Password must be at least 6 characters."); return; }

    setSaving(true);
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const token = localStorage.getItem("token");
      const res = await fetch(`${supabaseUrl}/functions/v1/update-user-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          "X-Auth-Token": token || "",
        },
        body: JSON.stringify({ oldPassword: oldPass, newPassword: newPass }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update password.");
      setPassSuccess(true);
      setOldPass(""); setNewPass(""); setConfirmPass("");
      setTimeout(() => { setPassSuccess(false); setShowPasswordModal(false); }, 2000);
    } catch (e: any) {
      setPassError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", border: "1px solid #d1d5db",
    borderRadius: "8px", fontSize: "14px", outline: "none",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", padding: "32px 16px" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "6px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#0f172a", marginBottom: "8px" }}>Settings</h1>

        {/* Account */}
        <div style={sectionTitle as any}>Account</div>
        <div style={card}>
          <div
            style={rowBase}
            onClick={() => setShowPasswordModal(true)}
            onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
            onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={iconCircle("#fee2e2")}>
                <IconLock size={17} color="#dc2626" />
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "#1e293b" }}>Change Password</div>
                <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "1px" }}>Update your account password</div>
              </div>
            </div>
            <IconChevronRight size={18} color="#cbd5e1" />
          </div>
        </div>

        {/* Preferences */}
        <div style={{ ...sectionTitle, marginTop: "16px" } as any}>Preferences</div>
        <div style={card}>
          {/* Notifications */}
          <div style={{ ...rowBase, cursor: "default" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={iconCircle("#fef3c7")}>
                <IconBell size={17} color="#d97706" />
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "#1e293b" }}>Notifications</div>
                <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "1px" }}>Enable system alerts</div>
              </div>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              style={{
                width: "46px", height: "26px", borderRadius: "13px", border: "none",
                background: notifications ? "#0284c7" : "#cbd5e1",
                cursor: "pointer", position: "relative", transition: "background 0.2s",
              }}
            >
              <span style={{
                position: "absolute", top: "3px",
                left: notifications ? "23px" : "3px",
                width: "20px", height: "20px", borderRadius: "50%",
                background: "#fff", transition: "left 0.2s",
                boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
              }} />
            </button>
          </div>

          {/* Dark Mode */}
          <div style={{ ...rowBase, cursor: "default" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={iconCircle("#ede9fe")}>
                <IconMoon size={17} color="#7c3aed" />
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "#1e293b" }}>Dark Mode</div>
                <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "1px" }}>Toggle dark appearance</div>
              </div>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              style={{
                width: "46px", height: "26px", borderRadius: "13px", border: "none",
                background: darkMode ? "#0284c7" : "#cbd5e1",
                cursor: "pointer", position: "relative", transition: "background 0.2s",
              }}
            >
              <span style={{
                position: "absolute", top: "3px",
                left: darkMode ? "23px" : "3px",
                width: "20px", height: "20px", borderRadius: "50%",
                background: "#fff", transition: "left 0.2s",
                boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
              }} />
            </button>
          </div>

          {/* Language */}
          <div style={{ ...rowBase, borderBottom: "none", cursor: "default" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={iconCircle("#dcfce7")}>
                <IconLanguage size={17} color="#16a34a" />
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "#1e293b" }}>Language</div>
                <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "1px" }}>Select display language</div>
              </div>
            </div>
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              style={{ fontSize: "13px", fontWeight: 500, color: "#374151", border: "1px solid #e2e8f0", borderRadius: "7px", padding: "5px 10px", cursor: "pointer", background: "#f8fafc" }}
            >
              <option>English</option>
              <option>Sinhala</option>
              <option>Tamil</option>
            </select>
          </div>
        </div>

        {/* Signed in as */}
        {user && (
          <div style={{ marginTop: "16px", background: "#fff", borderRadius: "14px", padding: "16px 20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "2px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Signed in as</div>
              <div style={{ fontSize: "15px", fontWeight: 600, color: "#1e293b" }}>{user.full_name || user.username}</div>
              <div style={{ fontSize: "12px", color: "#64748b" }}>{user.email}</div>
            </div>
            <button
              onClick={logout}
              style={{ padding: "9px 18px", borderRadius: "9px", border: "1px solid #fecaca", background: "#fff5f5", color: "#dc2626", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}
            >
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}
          onClick={e => { if (e.target === e.currentTarget) setShowPasswordModal(false); }}
        >
          <div style={{ background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "440px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", padding: "28px" }}>
            <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#111827", marginBottom: "20px" }}>Change Password</h3>

            {passError && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", fontWeight: 500, marginBottom: "14px" }}>
                {passError}
              </div>
            )}
            {passSuccess && (
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#16a34a", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", fontWeight: 500, marginBottom: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                <IconCheck size={15} /> Password changed successfully.
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "4px", display: "block" }}>Current Password</label>
                <input type="password" style={inputStyle} value={oldPass} onChange={e => setOldPass(e.target.value)} placeholder="Enter current password" />
              </div>
              <div>
                <label style={{ fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "4px", display: "block" }}>New Password</label>
                <input type="password" style={inputStyle} value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Enter new password" />
              </div>
              <div>
                <label style={{ fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "4px", display: "block" }}>Confirm New Password</label>
                <input type="password" style={inputStyle} value={confirmPass} onChange={e => setConfirmPass(e.target.value)} placeholder="Confirm new password" />
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button
                onClick={handleChangePassword}
                disabled={saving}
                style={{ flex: 1, padding: "11px", borderRadius: "9px", border: "none", background: saving ? "#94a3b8" : "#0284c7", color: "#fff", fontWeight: 600, fontSize: "14px", cursor: saving ? "not-allowed" : "pointer" }}
              >
                {saving ? "Updating..." : "Update Password"}
              </button>
              <button
                onClick={() => { setShowPasswordModal(false); setPassError(""); setOldPass(""); setNewPass(""); setConfirmPass(""); }}
                style={{ padding: "11px 20px", borderRadius: "9px", border: "1px solid #e5e7eb", background: "#fff", color: "#374151", fontWeight: 500, fontSize: "14px", cursor: "pointer" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
