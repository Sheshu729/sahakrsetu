"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { JOB_CATEGORIES } from "@/types";
import type { JobCategory } from "@/types";
import { useToast } from "@/components/Toast";

export default function EditJobPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<JobCategory>("other");
  const [budget, setBudget] = useState("");
  const [location, setLocation] = useState("");
  const [pincode, setPincode] = useState("");

  useEffect(() => {
    async function loadJob() {
      try {
        const res = await fetch(`/api/jobs/${id}`);
        if (!res.ok) throw new Error("Failed");
        const job = await res.json();
        setTitle(job.title);
        setDescription(job.description);
        setCategory(job.category);
        setBudget(String(job.budget));
        setLocation(job.location);
        setPincode(job.pincode || "");
      } catch {
        toast("Failed to load job", "error");
      } finally {
        setLoading(false);
      }
    }
    loadJob();
  }, [id, toast]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, category, budget: Number(budget), location, pincode }),
      });
      if (!res.ok) throw new Error("Failed");
      toast("Job updated successfully", "success");
      router.push(`/owner/${id}`);
    } catch {
      toast("Failed to update job", "error");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-2xl mx-auto">
          <div className="h-4 w-24 rounded mb-6 animate-pulse" style={{ backgroundColor: "rgba(15,23,42,0.06)" }} />
          <div className="rounded-xl p-6 animate-pulse space-y-4" style={{ backgroundColor: "#ffffff", border: "1px solid rgba(15,23,42,0.08)" }}>
            <div className="h-10 rounded" style={{ backgroundColor: "rgba(15,23,42,0.06)" }} />
            <div className="h-24 rounded" style={{ backgroundColor: "rgba(15,23,42,0.06)" }} />
            <div className="h-10 rounded" style={{ backgroundColor: "rgba(15,23,42,0.06)" }} />
            <div className="h-10 rounded" style={{ backgroundColor: "rgba(15,23,42,0.06)" }} />
            <div className="h-10 rounded" style={{ backgroundColor: "rgba(15,23,42,0.06)" }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <Link
          href={`/owner/${id}`}
          className="inline-flex items-center gap-2 mb-6 transition-colors"
          style={{ color: "#5a4a20" }}
        >
          <ArrowLeft className="w-4 h-4" /> Back to job
        </Link>

        <div className="rounded-xl p-6" style={{ backgroundColor: "#ffffff", border: "1px solid rgba(15,23,42,0.08)", boxShadow: "0 1px 2px rgba(15,23,42,0.04)" }}>
          <h1 className="text-2xl font-bold mb-6" style={{ color: "#1a1a2e" }}>Edit Job</h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#1a1a2e" }}>Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-lg text-sm outline-none text-black"
                style={{ backgroundColor: "#fff", border: "1px solid #ddd", color: "#000" }}
                placeholder="Job title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#1a1a2e" }}>Description</label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-lg text-sm outline-none text-black resize-none"
                style={{ backgroundColor: "#fff", border: "1px solid #ddd", color: "#000" }}
                placeholder="Describe the job..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#1a1a2e" }}>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as JobCategory)}
                className="w-full px-4 py-3 rounded-lg text-sm outline-none text-black"
                style={{ backgroundColor: "#fff", border: "1px solid #ddd", color: "#000" }}
              >
                {JOB_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#1a1a2e" }}>Budget (INR)</label>
              <input
                type="text"
                inputMode="numeric"
                required
                value={budget}
                onChange={(e) => { const v = e.target.value.replace(/[^0-9]/g, ""); setBudget(v); }}
                className="w-full px-4 py-3 rounded-lg text-sm outline-none text-black"
                style={{ backgroundColor: "#fff", border: "1px solid #ddd", color: "#000" }}
                placeholder="e.g. 500"
              />
            </div>

            <div className="grid grid-cols-[1fr_140px] gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#1a1a2e" }}>Location</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg text-sm outline-none text-black"
                  style={{ backgroundColor: "#fff", border: "1px solid #ddd", color: "#000" }}
                  placeholder="Area / landmark"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#1a1a2e" }}>Pincode</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                  className="w-full px-4 py-3 rounded-lg text-sm outline-none text-black"
                  style={{ backgroundColor: "#fff", border: "1px solid #ddd", color: "#000" }}
                  placeholder="560001"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
              style={{ backgroundColor: "#1a1a2e", color: "#F0B45B" }}
            >
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
