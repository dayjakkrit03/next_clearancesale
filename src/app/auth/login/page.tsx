// src/app/auth/login/page.tsx

"use client";
import { useState } from "react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    const next = new URLSearchParams(window.location.search).get("next") || "/admin/clearance/categories";
    const res = await fetch("/api/auth/dev-login", { method: "POST", body: JSON.stringify({ next }) });
    const { redirectTo } = await res.json();
    window.location.href = redirectTo;
  }

  return (
    <div className="min-h-[60vh] grid place-items-center">
      <div className="p-6 rounded-xl border w-[360px]">
        <h1 className="text-xl font-bold mb-4">Admin Login (DEV)</h1>
        <p className="text-sm text-muted-foreground mb-4">
          ปุ่มนี้จะตั้งค่า cookie <code>admin_session=1</code> เพื่อเข้า /admin ได้
        </p>
        <button onClick={handleLogin} disabled={loading} className="btn btn-primary w-full">
          {loading ? "Signing in..." : "Sign in as Admin"}
        </button>
      </div>
    </div>
  );
}
