"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { Users, Briefcase, FileText, Star, ShieldAlert } from "lucide-react";

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<{ total_users: number; total_jobs: number; total_applications: number; total_reviews: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user || (user.role !== "admin" && user.email !== "admin@homework.com")) {
      const t = setTimeout(() => {
        setError(true);
        setLoading(false);
      }, 0);
      return () => clearTimeout(t);
    }
    let active = true;
    fetch("/api/admin")
      .then((r) => r.json())
      .then((data) => {
        if (active) {
          setStats(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div style={{ background: "linear-gradient(180deg, #c8850a 0%, #d4940a 20%, #F0B45B 50%, #f5c878 80%, #fae3a0 100%)", minHeight: "100vh" }} className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 rounded-xl animate-pulse" style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: "linear-gradient(180deg, #c8850a 0%, #d4940a 20%, #F0B45B 50%, #f5c878 80%, #fae3a0 100%)", minHeight: "100vh" }} className="flex items-center justify-center">
        <div className="text-center">
          <ShieldAlert className="w-16 h-16 mx-auto mb-4" style={{ color: "#ff6b6b" }} />
          <h1 className="text-2xl font-semibold mb-2" style={{ color: "#1a1a2e" }}>Access Denied</h1>
          <p style={{ color: "#5a4a20" }}>You don&apos;t have admin access.</p>
        </div>
      </div>
    );
  }

  const cards = [
    { label: "Total Users", value: stats?.total_users || 0, icon: Users, color: "#4dabf7" },
    { label: "Total Jobs", value: stats?.total_jobs || 0, icon: Briefcase, color: "#da77f2" },
    { label: "Applications", value: stats?.total_applications || 0, icon: FileText, color: "#69db7c" },
    { label: "Reviews", value: stats?.total_reviews || 0, icon: Star, color: "#F0B45B" },
  ];

  return (
    <div style={{ background: "linear-gradient(180deg, #c8850a 0%, #d4940a 20%, #F0B45B 50%, #f5c878 80%, #fae3a0 100%)", minHeight: "100vh" }}>
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-2xl font-semibold mb-6" style={{ color: "#1a1a2e" }}>Admin Dashboard</h1>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => (
            <div key={card.label} className="rounded-xl p-6" style={{ backgroundColor: "rgba(255,255,255,0.35)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.5)" }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: `${card.color}22` }}>
                <card.icon className="w-5 h-5" style={{ color: card.color }} />
              </div>
              <p className="text-2xl font-semibold" style={{ color: "#1a1a2e" }}>{card.value.toLocaleString()}</p>
              <p className="text-sm" style={{ color: "#5a4a20" }}>{card.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
