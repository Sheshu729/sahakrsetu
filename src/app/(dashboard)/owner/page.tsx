"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { formatDate, formatCurrency } from "@/lib/utils";
import { JOB_CATEGORIES, STATUS_COLORS } from "@/types";
import type { JobPost } from "@/types";
import { PlusCircle, MapPin, Calendar, IndianRupee, Inbox, Search } from "lucide-react";
import { SkeletonList } from "@/components/Skeleton";
import { useToast } from "@/components/Toast";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function OwnerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<(JobPost & { application_count: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    jobId: string;
    action: "complete" | "cancel";
  }>({ open: false, jobId: "", action: "complete" });
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    if (!user) return;
    setError(null);
    try {
      const params = new URLSearchParams({ owner_id: user.id });
      if (search.trim()) params.set("search", search.trim());
      const res = await fetch(`/api/jobs?${params}`);
      if (!res.ok) throw new Error("Failed to load jobs");
      const data = await res.json();
      setJobs(data.items || []);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }, [user, search]);

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true);
      fetchJobs();
    }, 0);
    return () => clearTimeout(t);
  }, [fetchJobs]);

  function handleStatusUpdate(jobId: string, status: "completed" | "cancelled") {
    setConfirmDialog({ open: true, jobId, action: status === "completed" ? "complete" : "cancel" });
  }

  async function confirmStatusUpdate() {
    const { jobId, action } = confirmDialog;
    const status = action === "complete" ? "completed" : "cancelled";
    setActionLoading(jobId);
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update job");
      setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status } : j)));
      toast(`Job marked as ${status}`, "success");
    } catch {
      toast("Failed to update job status", "error");
    } finally {
      setActionLoading(null);
      setConfirmDialog({ open: false, jobId: "", action: "complete" });
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#1a1a2e" }}>My Posts</h1>
            <p className="mt-1" style={{ color: "#5a4a20" }}>Manage your household service requests</p>
          </div>
          <Link href="/owner/new" className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-colors" style={{ backgroundColor: "#1a1a2e", color: "#F0B45B" }}>
            <PlusCircle className="w-4 h-4" /> New Post
          </Link>
        </div>
        <SkeletonList count={3} />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1a1a2e" }}>My Posts</h1>
          <p className="mt-1" style={{ color: "#5a4a20" }}>Manage your household service requests</p>
        </div>
        <Link href="/owner/new" className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-colors" style={{ backgroundColor: "#1a1a2e", color: "#F0B45B" }}>
          <PlusCircle className="w-4 h-4" /> New Post
        </Link>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#666" }} />
        <input
          type="text"
          placeholder="Search posts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none text-black"
          style={{ backgroundColor: "#fff", border: "1px solid #ddd", color: "#000" }}
        />
      </div>

      {error && (
        <div className="p-4 rounded-xl mb-6" style={{ backgroundColor: "rgba(255,80,80,0.15)", border: "1px solid rgba(255,80,80,0.3)" }}>
          <p className="text-sm" style={{ color: "#ff6b6b" }}>{error}</p>
          <button onClick={fetchJobs} className="text-sm underline mt-1" style={{ color: "#ff6b6b" }}>Retry</button>
        </div>
      )}

      {jobs.length === 0 ? (
        <div className="text-center py-20 rounded-2xl" style={{ backgroundColor: "rgba(255,255,255,0.35)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.5)" }}>
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: "#1a1a2e" }}>
            <Inbox className="w-8 h-8" style={{ color: "#F0B45B" }} />
          </div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: "#1a1a2e" }}>{search ? "No matching posts" : "No posts yet"}</h3>
          <p style={{ color: "#5a4a20" }}>
            {search ? "Try a different search term" : "Create your first job post to find skilled workers"}
          </p>
          {!search && (
            <Link href="/owner/new" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-colors mt-4" style={{ backgroundColor: "#1a1a2e", color: "#F0B45B" }}>
              <PlusCircle className="w-4 h-4" /> Create Post
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Link key={job.id} href={`/owner/${job.id}`} className="block p-6 rounded-xl transition-colors" style={{ backgroundColor: "rgba(255,255,255,0.35)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.5)" }}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold" style={{ color: "#1a1a2e" }}>{job.title}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[job.status]}`}>{job.status}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: "rgba(255,255,255,0.35)", color: "#5a4a20", border: "1px solid rgba(255,255,255,0.5)" }}>{JOB_CATEGORIES.find((c) => c.value === job.category)?.label}</span>
                  </div>
                  <p className="line-clamp-2 mb-3" style={{ color: "#5a4a20" }}>{job.description}</p>
                  <div className="flex items-center gap-4 text-sm" style={{ color: "#7a6a30" }}>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location}{job.pincode ? ` · ${job.pincode}` : ""}</span>
                    <span className="flex items-center gap-1"><IndianRupee className="w-3.5 h-3.5" /> {formatCurrency(job.budget)}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {formatDate(job.created_at)}</span>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "#1a1a2e" }}>
                    <span className="text-lg font-bold" style={{ color: "#F0B45B" }}>{job.application_count || 0}</span>
                  </div>
                  <div className="text-xs mt-1" style={{ color: "#7a6a30" }}>{(job.application_count || 0) === 1 ? "applicant" : "applicants"}</div>
                </div>
              </div>
              {(job.status === "assigned") && (
                <div className="flex gap-2 mt-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.5)" }} onClick={(e) => e.preventDefault()}>
                  <button
                    onClick={() => handleStatusUpdate(job.id, "completed")}
                    disabled={actionLoading === job.id}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    style={{ border: "1px solid #1e8e3e", color: "#69db7c" }}
                  >
                    Mark as Complete
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(job.id, "cancelled")}
                    disabled={actionLoading === job.id}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    style={{ border: "1px solid #d93025", color: "#ff6b6b" }}
                  >
                    Cancel
                  </button>
                </div>
              )}
              {job.status === "open" && (
                <div className="flex gap-2 mt-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.5)" }} onClick={(e) => e.preventDefault()}>
                  <button
                    onClick={() => handleStatusUpdate(job.id, "cancelled")}
                    disabled={actionLoading === job.id}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    style={{ border: "1px solid #d93025", color: "#ff6b6b" }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.action === "complete" ? "Mark as Complete?" : "Cancel Job?"}
        message={
          confirmDialog.action === "complete"
            ? "This will mark the job as completed. This action cannot be undone."
            : "This will cancel the job. This action cannot be undone."
        }
        confirmLabel={confirmDialog.action === "complete" ? "Complete" : "Cancel Job"}
        danger={confirmDialog.action === "cancel"}
        onConfirm={confirmStatusUpdate}
        onCancel={() => setConfirmDialog({ open: false, jobId: "", action: "complete" })}
      />
    </div>
  );
}
