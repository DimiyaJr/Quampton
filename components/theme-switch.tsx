"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export const ThemeSwitch = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div style={{ width: "72px", height: "36px" }} />;

  const isDark = theme === "dark";

  return (
    <button
      aria-label={isDark ? "Switch to day mode" : "Switch to night mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "5px 10px 5px 6px",
        borderRadius: "999px",
        border: isDark ? "1.5px solid #334155" : "1.5px solid #e2e8f0",
        background: isDark ? "#1e293b" : "#f0f9ff",
        cursor: "pointer",
        transition: "all 0.25s ease",
        minWidth: "unset",
        minHeight: "unset",
        height: "36px",
        boxShadow: isDark
          ? "0 2px 8px rgba(0,0,0,0.4)"
          : "0 2px 8px rgba(14,165,233,0.12)",
      }}
    >
      <span
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "26px",
          height: "26px",
          borderRadius: "50%",
          background: isDark ? "#334155" : "#0ea5e9",
          transition: "background 0.25s ease",
          flexShrink: 0,
        }}
      >
        {isDark ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        )}
      </span>
      <span
        style={{
          fontSize: "12px",
          fontWeight: 600,
          color: isDark ? "#94a3b8" : "#0369a1",
          letterSpacing: "0.02em",
          transition: "color 0.25s ease",
          userSelect: "none",
        }}
      >
        {isDark ? "Night" : "Day"}
      </span>
    </button>
  );
};
