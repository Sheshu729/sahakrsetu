"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Wrench, Eye, EyeOff, Briefcase, Home } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

type Role = "owner" | "worker";

export default function RegisterPage() {
  const [role, setRole] = useState<Role | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { refreshUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      setError("Please select a role");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: name, email, phone, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      await refreshUser();
      if (role === "worker") router.push("/worker");
      else router.push("/owner");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{ background: "linear-gradient(180deg, #c8850a 0%, #d4940a 20%, #F0B45B 50%, #f5c878 80%, #fae3a0 100%)", fontFamily: "'Google Sans', 'Roboto', system-ui, sans-serif" }}
    >
      <div
        className="w-full max-w-md p-10 rounded-2xl border"
        style={{ backgroundColor: "rgba(255,255,255,0.35)", backdropFilter: "blur(20px)", borderColor: "rgba(255,255,255,0.5)" }}
      >
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: "#1a1a2e" }}
          >
            <Wrench className="w-6 h-6" style={{ color: "#F0B45B" }} />
          </div>
          <h1 className="text-xl font-medium" style={{ color: "#1a1a2e" }}>
            HomeWork Connect
          </h1>
        </div>

        <h2 className="text-2xl font-medium text-center mb-1" style={{ color: "#1a1a2e" }}>
          Create your account
        </h2>
        <p className="text-sm text-center mb-8" style={{ color: "#5a4a20" }}>
          Join HomeWork Connect today
        </p>

        {error && (
          <div
            className="mb-4 p-3 rounded-lg text-sm text-center"
            style={{ backgroundColor: "rgba(255,80,80,0.15)", color: "#ff6b6b" }}
          >
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => setRole("owner")}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all"
            style={{
              borderColor: role === "owner" ? "#1a1a2e" : "rgba(255,255,255,0.15)",
              backgroundColor: role === "owner" ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.04)",
            }}
          >
            <Home className="w-6 h-6" style={{ color: role === "owner" ? "#F0B45B" : "#5a4a20" }} />
            <span className="text-sm font-medium" style={{ color: role === "owner" ? "#F0B45B" : "#5a4a20" }}>
              Post Jobs
            </span>
            <span className="text-xs" style={{ color: "#7a6a30" }}>
              I&apos;m a homeowner
            </span>
          </button>
          <button
            type="button"
            onClick={() => setRole("worker")}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all"
            style={{
              borderColor: role === "worker" ? "#1a1a2e" : "rgba(255,255,255,0.15)",
              backgroundColor: role === "worker" ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.04)",
            }}
          >
            <Briefcase className="w-6 h-6" style={{ color: role === "worker" ? "#F0B45B" : "#5a4a20" }} />
            <span className="text-sm font-medium" style={{ color: role === "worker" ? "#F0B45B" : "#5a4a20" }}>
              Find Work
            </span>
            <span className="text-xs" style={{ color: "#7a6a30" }}>
              I&apos;m a worker
            </span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "#1a1a2e" }}>
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-colors focus:border-[#333]"
              style={{ borderColor: "#ddd", backgroundColor: "white", color: "#000" }}
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "#1a1a2e" }}>
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-colors focus:border-[#333]"
              style={{ borderColor: "#ddd", backgroundColor: "white", color: "#000" }}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "#1a1a2e" }}>
              Phone Number
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-colors focus:border-[#333]"
              style={{ borderColor: "#ddd", backgroundColor: "white", color: "#000" }}
              placeholder="+91 98765 43210"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "#1a1a2e" }}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 pr-10 rounded-lg border text-sm outline-none transition-colors focus:border-[#333]"
                style={{ borderColor: "#ddd", backgroundColor: "white", color: "#000" }}
                placeholder="Min. 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] hover:text-black"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-full text-sm font-medium transition-colors disabled:opacity-60"
            style={{ backgroundColor: "#1a1a2e", color: "#F0B45B" }}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-sm text-center mt-6" style={{ color: "#5a4a20" }}>
          Already have an account?{" "}
          <Link href="/login" className="font-medium hover:underline" style={{ color: "#1a1a2e" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
