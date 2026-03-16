"use client";
import { Button, Input } from "@nextui-org/react";
import React, { useState } from "react";
import Image from "next/image";

export default function AuthPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const apiUrl = `${supabaseUrl}/functions/v1/auth-login`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        window.location.href = "/Inventory";
      } else {
        setError(data.message || "Invalid username or password");
      }
    } catch {
      setError("An error occurred during login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
    }}>
      <div style={{
        background: "#ffffff",
        borderRadius: "20px",
        padding: "48px 40px",
        width: "100%",
        maxWidth: "440px",
        boxShadow: "0 25px 60px rgba(0,0,0,0.4)",
      }}>
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <Image
            src="/logo2.jpg"
            alt="Retail Flow"
            width={180}
            height={55}
            style={{ objectFit: "contain", marginBottom: "20px" }}
          />
          <h1 style={{ fontSize: "26px", fontWeight: "700", color: "#111827", margin: "0 0 8px" }}>
            Welcome back
          </h1>
          <p style={{ fontSize: "15px", color: "#6b7280", margin: 0 }}>
            Sign in to your account to continue
          </p>
        </div>

        {error && (
          <div style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#dc2626",
            padding: "12px 16px",
            borderRadius: "10px",
            marginBottom: "20px",
            fontSize: "14px",
            fontWeight: "500",
            textAlign: "center",
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Input
            label="Username"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            size="lg"
            variant="bordered"
            classNames={{
              inputWrapper: "border-gray-300 hover:border-sky-400 focus-within:border-sky-500",
            }}
          />
          <Input
            type="password"
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            size="lg"
            variant="bordered"
            classNames={{
              inputWrapper: "border-gray-300 hover:border-sky-400 focus-within:border-sky-500",
            }}
          />
          <Button
            type="submit"
            color="primary"
            size="lg"
            isLoading={loading}
            style={{
              marginTop: "8px",
              height: "52px",
              fontSize: "16px",
              fontWeight: "700",
              borderRadius: "10px",
              background: "#0ea5e9",
              color: "#ffffff",
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div style={{
          marginTop: "28px",
          padding: "16px",
          background: "#f8fafc",
          borderRadius: "10px",
          border: "1px solid #e2e8f0",
          textAlign: "center",
        }}>
          <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "6px", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Default Credentials
          </p>
          <p style={{ fontSize: "14px", color: "#374151", margin: 0 }}>
            <strong>Username:</strong> admin &nbsp;|&nbsp; <strong>Password:</strong> admin123
          </p>
        </div>
      </div>
    </div>
  );
}
