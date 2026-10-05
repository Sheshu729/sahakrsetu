"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/components/Toast";
import StarRating from "@/components/StarRating";
import { User, Mail, Phone, Edit3, Save, X, Star } from "lucide-react";

interface ProfileData {
  full_name?: string;
  email?: string;
  phone?: string;
  bio?: string;
  skills?: string[];
  avg_rating?: number;
}

interface ReviewItem {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
}

export default function WorkerProfilePage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch("/api/profile").then((r) => r.json()),
      user?.id
        ? fetch(`/api/reviews?reviewee_id=${user.id}`)
            .then((r) => r.json())
            .catch(() => ({ items: [] }))
        : Promise.resolve({ items: [] }),
    ])
      .then(([profileData, reviewsData]) => {
        if (!active) return;
        setProfile(profileData);
        setFullName(profileData.full_name || "");
        setPhone(profileData.phone || "");
        setBio(profileData.bio || "");
        setSkillsInput((profileData.skills || []).join(", "));
        setReviews(Array.isArray(reviewsData) ? reviewsData : reviewsData.items || []);
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
  }, [user?.id]);

  const handleSave = async () => {
    if (!fullName.trim()) {
      toast("Full name is required", "error");
      return;
    }
    setSaving(true);
    try {
      const skills = skillsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName.trim(), phone, bio, skills }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || "Failed to save");
      }
      setProfile(data);
      setEditing(false);
      await refreshUser();
      toast("Profile updated successfully", "success");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
      : "N/A";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div style={{ color: "#7a6a30" }}>Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6" style={{ color: "#1a1a2e" }}>My Profile</h1>

        <div className="rounded-xl p-6" style={{ backgroundColor: "#ffffff", border: "1px solid rgba(15,23,42,0.08)", boxShadow: "0 1px 2px rgba(15,23,42,0.04)" }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold overflow-hidden shrink-0" style={{ backgroundColor: "#1a1a2e", color: "#F0B45B" }}>
                {(fullName || user?.email || "W")
                  .split(/\s+/)
                  .map((w: string) => w[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-semibold" style={{ color: "#1a1a2e" }}>{fullName || "Worker"}</h2>
                <p className="text-sm" style={{ color: "#5a4a20" }}>Skilled Worker</p>
              </div>
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                type="button"
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shrink-0"
                style={{ backgroundColor: "#1a1a2e", color: "#F0B45B", border: "1px solid #1a1a2e" }}
              >
                <Edit3 size={16} />
                Edit
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: "rgba(15,23,42,0.04)" }}>
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

            <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: "rgba(15,23,42,0.04)" }}>
              <Mail size={18} style={{ color: "#7a6a30" }} />
              <div>
                <p className="text-xs" style={{ color: "#7a6a30" }}>Email</p>
                <p style={{ color: "#1a1a2e" }}>{profile?.email || user?.email || "Not set"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: "rgba(15,23,42,0.04)" }}>
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

            <div className="p-3 rounded-lg" style={{ backgroundColor: "rgba(15,23,42,0.04)" }}>
              <p className="text-xs mb-2" style={{ color: "#7a6a30" }}>Bio</p>
              {editing ? (
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full bg-transparent text-black outline-none rounded-lg p-2 resize-none"
                  style={{ border: "1px solid #ddd", color: "#000" }}
                />
              ) : (
                <p style={{ color: "#1a1a2e" }}>{bio || "No bio added yet."}</p>
              )}
            </div>

            <div className="p-3 rounded-lg" style={{ backgroundColor: "rgba(15,23,42,0.04)" }}>
              <p className="text-xs mb-2" style={{ color: "#7a6a30" }}>Skills</p>
              {editing ? (
                <input
                  type="text"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  placeholder="e.g. Plumbing, Electrical, Painting"
                  className="w-full bg-transparent text-black outline-none rounded-lg p-2"
                  style={{ border: "1px solid #ddd", color: "#000" }}
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {(profile?.skills || []).length > 0 ? (
                    (profile?.skills || []).map((skill: string, i: number) => (
                      <span key={i} className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: "rgba(240,180,91,0.15)", color: "#F0B45B", border: "1px solid rgba(240,180,91,0.3)" }}>
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p style={{ color: "#7a6a30" }}>No skills listed.</p>
                  )}
                </div>
              )}
            </div>

            <div className="p-3 rounded-lg" style={{ backgroundColor: "rgba(15,23,42,0.04)" }}>
              <div className="flex items-center gap-2">
                <Star size={18} style={{ color: "#F0B45B" }} />
                <p className="text-xs" style={{ color: "#7a6a30" }}>Average Rating</p>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <StarRating rating={parseFloat(avgRating) || 0} />
                <span className="font-medium" style={{ color: "#1a1a2e" }}>{avgRating}</span>
                <span className="text-sm" style={{ color: "#7a6a30" }}>({reviews.length} reviews)</span>
              </div>
            </div>
          </div>

          {editing && (
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                type="button"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
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
                  setBio(profile?.bio || "");
                  setSkillsInput((profile?.skills || []).join(", "));
                }}
                className="flex items-center gap-2 px-6 py-2 rounded-lg transition-colors"
                style={{ border: "1px solid rgba(0,0,0,0.15)", color: "#5a4a20" }}
              >
                <X size={16} />
                Cancel
              </button>
            </div>
          )}
        </div>

        {reviews.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-4" style={{ color: "#1a1a2e" }}>Reviews</h2>
            <div className="space-y-3">
              {reviews.map((review) => (
                <div key={review.id} className="rounded-xl p-4" style={{ backgroundColor: "#ffffff", border: "1px solid rgba(15,23,42,0.08)", boxShadow: "0 1px 2px rgba(15,23,42,0.04)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <StarRating rating={review.rating || 0} size="sm" />
                    <span className="text-sm" style={{ color: "#7a6a30" }}>
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: "#5a4a20" }}>{review.comment || "No comment"}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
