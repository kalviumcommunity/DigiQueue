"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed");
        return;
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Unable to login right now. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="portal-center">
      <div className="card" style={{ maxWidth: '420px', width: '100%' }}>
        <section className="page-hero" style={{ marginBottom: '16px' }}>
          <h1>Hospital Admin Login</h1>
          <p>Secure access for reception and queue management.</p>
        </section>

        <form className="form" onSubmit={handleLogin}>
          {error ? <p className="alert alert-warn">{error}</p> : null}

          <input
            type="text"
            placeholder="User ID"
            className="input"
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            autoComplete="username"
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="input"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
