"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Wrench, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { refreshUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Invalid email or password"); setLoading(false); return; }
      await refreshUser();
      const role = data.user?.role;
      const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const next = params?.get("next");
      if (next && next.startsWith("/") && !next.startsWith("//")) {
        router.push(next);
      } else if (role === "worker") router.push("/worker");
      else if (role === "admin") router.push("/admin");
      else router.push("/owner");
    } catch { setError("Something went wrong. Please try again."); setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "linear-gradient(180deg, #c8850a 0%, #d4940a 20%, #F0B45B 50%, #f5c878 80%, #fae3a0 100%)", fontFamily: "'Google Sans', 'Roboto', system-ui, sans-serif" }}>
      <div className="w-full max-w-md p-10 rounded-2xl border" style={{ backgroundColor: "rgba(255,255,255,0.35)", borderColor: "rgba(255,255,255,0.5)", backdropFilter: "blur(20px)" }}>
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: "#1a1a2e" }}>
            <Wrench className="w-6 h-6" style={{ color: "#F0B45B" }} />
          </div>
          <h1 className="text-xl font-semibold" style={{ color: "#1a1a2e" }}>HomeWork Connect</h1>
        </div>
        <h2 className="text-2xl font-semibold text-center mb-1" style={{ color: "#1a1a2e" }}>Sign in</h2>
        <p className="text-sm text-center mb-8" style={{ color: "#5a4a20" }}>Continue to HomeWork Connect</p>

        {error && <div className="mb-4 p-3 rounded-lg text-sm text-center" style={{ backgroundColor: "rgba(255,80,80,0.15)", color: "#ff6b6b" }}>{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "#1a1a2e" }}>Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
              className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none placeholder-[#999] transition-colors focus:border-[#1a1a2e]"
              style={{ backgroundColor: "white", borderColor: "#ddd", color: "#000" }} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "#1a1a2e" }}>Password</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password"
                className="w-full px-4 py-2.5 pr-10 rounded-lg border text-sm outline-none placeholder-[#999] transition-colors focus:border-[#1a1a2e]"
                style={{ backgroundColor: "white", borderColor: "#ddd", color: "#000" }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] hover:text-black">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full py-2.5 rounded-full text-sm font-medium transition-colors disabled:opacity-60 hover:opacity-90" style={{ backgroundColor: "#1a1a2e", color: "#F0B45B" }}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <p className="text-sm text-center mt-6" style={{ color: "#5a4a20" }}>
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium hover:underline" style={{ color: "#1a1a2e" }}>Create account</Link>
        </p>
      </div>
    </div>
  );
}
