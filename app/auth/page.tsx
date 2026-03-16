"use client"
import { Button, Input, Image } from "@nextui-org/react";
import React, { useState } from "react";

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
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/Inventory';
      } else {
        setError(data.message || "Login failed");
      }
    } catch (error) {
      console.error("An error occurred:", error);
      setError("An error occurred during login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "70vh", width: "100%" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, padding: "40px", background: "rgba(255,255,255,0.05)", borderRadius: "16px", minWidth: "400px" }}>
        <Image src="/logo.jpg" alt="logo" width={200} height={200} />
        <h2 style={{ fontSize: "28px", fontWeight: "600", margin: "10px 0" }}>Inventory System</h2>
        <h3 style={{ fontSize: "20px", fontWeight: "400", color: "#888" }}>Login to your account</h3>
        {error && (
          <div style={{
            color: "#ff4444",
            background: "rgba(255,68,68,0.1)",
            padding: "12px 20px",
            borderRadius: "8px",
            width: "100%",
            textAlign: "center",
            fontWeight: "500"
          }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 15, width: "100%" }}>
          <Input
            isClearable
            label="Username"
            placeholder="Enter your username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            size="lg"
            variant="bordered"
          />
          <Input
            isClearable
            type="password"
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            size="lg"
            variant="bordered"
          />
          <Button
            type="submit"
            color="primary"
            radius="md"
            size="lg"
            isLoading={loading}
            style={{
              marginTop: "10px",
              fontWeight: "600",
              fontSize: "16px"
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
        <div style={{ marginTop: "20px", fontSize: "14px", color: "#666", textAlign: "center" }}>
          <p>Default credentials:</p>
          <p><strong>Username:</strong> admin | <strong>Password:</strong> admin123</p>
        </div>
      </div>
    </div>
  );
}