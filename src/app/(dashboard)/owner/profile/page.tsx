"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/components/Toast";
import { User, Mail, Phone, Edit3, Save, X } from "lucide-react";

interface ProfileData {
  full_name?: string;
  email?: string;
  phone?: string;
  bio?: string;
  skills?: string[];
  avg_rating?: number;
}

export default function OwnerProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        setProfile(data);
        setFullName(data.full_name || "");
        setPhone(data.phone || "");
      })
      .catch(() => {
        if (active) toast("Failed to load profile", "error");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName, phone }),
      });
      if (!res.ok) throw new Error("Failed to save");
      const updated = await res.json();
      setProfile(updated);
      setEditing(false);
      toast("Profile updated successfully", "success");
    } catch {
      toast("Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div style={{ color: "#5a4a20" }}>Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6" style={{ color: "#1a1a2e" }}>My Profile</h1>

        <div className="rounded-xl p-6" style={{ backgroundColor: "rgba(255,255,255,0.35)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.5)" }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold" style={{ backgroundColor: "#1a1a2e", color: "#F0B45B" }}>
                {(fullName || user?.email?.[0] || "O").toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-semibold" style={{ color: "#1a1a2e" }}>{fullName || "Owner"}</h2>
                <p className="text-sm" style={{ color: "#5a4a20" }}>Property Owner</p>
              </div>
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors"
                style={{ border: "1px solid rgba(240,180,91,0.3)", color: "#F0B45B" }}
              >
                <Edit3 size={16} />
                Edit
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
              <User size={18} style={{ color: "#7a6a30" }} />
              <div className="flex-1">
                <p className="text-xs" style={{ color: "#7a6a30" }}>Full Name</p>
                {editing ? (
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-transparent outline-none py-1 text-black"
                    style={{ borderBottom: "1px solid #ddd", color: "#000" }}
                  />
                ) : (
                  <p style={{ color: "#1a1a2e" }}>{fullName || "Not set"}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
              <Mail size={18} style={{ color: "#7a6a30" }} />
              <div className="flex-1">
                <p className="text-xs" style={{ color: "#7a6a30" }}>Email</p>
                <p style={{ color: "#1a1a2e" }}>{profile?.email || user?.email || "Not set"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
              <Phone size={18} style={{ color: "#7a6a30" }} />
              <div className="flex-1">
                <p className="text-xs" style={{ color: "#7a6a30" }}>Phone</p>
                {editing ? (
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-transparent outline-none py-1 text-black"
                    style={{ borderBottom: "1px solid #ddd", color: "#000" }}
                  />
                ) : (
                  <p style={{ color: "#1a1a2e" }}>{phone || "Not set"}</p>
                )}
              </div>
            </div>
          </div>

          {editing && (
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors"
                style={{ backgroundColor: "#1a1a2e", color: "#F0B45B" }}
              >
                <Save size={16} />
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setFullName(profile?.full_name || "");
                  setPhone(profile?.phone || "");
                }}
                className="flex items-center gap-2 px-6 py-2 rounded-lg transition-colors"
                style={{ border: "1px solid rgba(255,255,255,0.15)", color: "#aaa" }}
              >
                <X size={16} />
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
