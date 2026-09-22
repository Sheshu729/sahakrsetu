"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { formatDate, formatCurrency } from "@/lib/utils";
import { JOB_CATEGORIES, STATUS_COLORS } from "@/types";
import type { JobPost } from "@/types";
import { useToast } from "@/components/Toast";
import { ArrowLeft, MapPin, Calendar, IndianRupee, Send, MessageCircle, Star } from "lucide-react";

export default function WorkerJobDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [job, setJob] = useState<JobPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);
  const [message, setMessage] = useState("");
  const [proposedRate, setProposedRate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [messaging, setMessaging] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/jobs/${id}`);
        if (!res.ok) throw new Error("Job not found");
        const jobData = await res.json();
        setJob(jobData);
        setHasApplied(jobData.applications?.some((a: { worker_id: string }) => a.worker_id === user?.id) || false);
      } catch {
        toast("Failed to load job details", "error");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, user, toast]);

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: id, message, proposed_rate: Number(proposedRate) }),
      });

      if (res.ok) {
        setSuccess(true);
        toast("Application submitted successfully!", "success");
      } else {
        const data = await res.json();
        const msg = data.error || "Failed to apply";
        setError(msg);
        toast(msg, "error");
      }
    } catch {
      const msg = "Something went wrong. Please try again.";
      setError(msg);
      toast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleMessageOwner() {
    if (!user || !job) return;
    setMessaging(true);
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_id: job.id,
          owner_id: job.owner_id,
          worker_id: user.id,
        }),
      });
      if (!res.ok) throw new Error("Failed to create conversation");
      const conversation = await res.json();
      router.push(`/worker/messages/${conversation.id}`);
    } catch {
      toast("Failed to start conversation", "error");
    } finally {
      setMessaging(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-3xl mx-auto">
          <div className="h-4 w-24 rounded mb-6 animate-pulse" style={{ backgroundColor: "rgba(255,255,255,0.2)" }} />
          <div className="rounded-xl p-6 animate-pulse" style={{ backgroundColor: "rgba(255,255,255,0.35)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.5)" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-7 w-64 rounded" style={{ backgroundColor: "rgba(255,255,255,0.2)" }} />
              <div className="h-5 w-16 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.2)" }} />
            </div>
            <div className="h-5 w-24 rounded-full mb-4" style={{ backgroundColor: "rgba(255,255,255,0.2)" }} />
            <div className="h-4 w-full rounded mb-2" style={{ backgroundColor: "rgba(255,255,255,0.2)" }} />
            <div className="h-4 w-3/4 rounded mb-6" style={{ backgroundColor: "rgba(255,255,255,0.2)" }} />
            <div className="flex gap-6 mb-4">
              <div className="h-4 w-28 rounded" style={{ backgroundColor: "rgba(255,255,255,0.2)" }} />
              <div className="h-4 w-24 rounded" style={{ backgroundColor: "rgba(255,255,255,0.2)" }} />
              <div className="h-4 w-28 rounded" style={{ backgroundColor: "rgba(255,255,255,0.2)" }} />
            </div>
            <div className="h-4 w-40 rounded" style={{ backgroundColor: "rgba(255,255,255,0.2)" }} />
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="p-6">
        <div className="text-center py-20">
          <p style={{ color: "#5a4a20" }}>Job not found</p>
          <Link href="/worker" className="hover:underline mt-2 inline-block" style={{ color: "#F0B45B" }}>Back to jobs</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/worker" className="inline-flex items-center gap-2 mb-6 transition-colors" style={{ color: "#5a4a20" }}>
          <ArrowLeft className="w-4 h-4" /> Back to jobs
        </Link>

        <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: "rgba(255,255,255,0.35)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.5)" }}>
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-2xl font-bold" style={{ color: "#1a1a2e" }}>{job.title}</h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[job.status]}`}>{job.status}</span>
          </div>
          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium mb-4" style={{ backgroundColor: "rgba(255,255,255,0.35)", color: "#5a4a20", border: "1px solid rgba(255,255,255,0.5)" }}>
            {JOB_CATEGORIES.find((c) => c.value === job.category)?.label}
          </span>
          <p className="leading-relaxed mb-6" style={{ color: "#5a4a20" }}>{job.description}</p>
          <div className="flex items-center gap-6 text-sm mb-4" style={{ color: "#7a6a30" }}>
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {job.location}{job.pincode ? ` · ${job.pincode}` : ""}</span>
            <span className="flex items-center gap-1.5"><IndianRupee className="w-4 h-4" /> {formatCurrency(job.budget)}</span>
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {formatDate(job.created_at)}</span>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.5)" }}>
            <div>
              <p className="text-sm" style={{ color: "#5a4a20" }}>Posted by {job.profiles?.full_name}</p>
              {job.profiles?.skills && job.profiles.skills.length > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-3 h-3" style={{ color: "#F0B45B", fill: "#F0B45B" }} />
                  <span className="text-xs" style={{ color: "#7a6a30" }}>{job.profiles.skills.slice(0, 3).join(", ")}</span>
                </div>
              )}
            </div>
            <button
              onClick={handleMessageOwner}
              disabled={messaging || user?.id === job.owner_id}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              style={{ backgroundColor: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.5)", color: "#5a4a20" }}
            >
              <MessageCircle className="w-4 h-4" />
              {messaging ? "Starting..." : "Message Owner"}
            </button>
          </div>

          {job.media_urls && job.media_urls.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-3" style={{ color: "#7a6a30" }}>Media</h3>
              <div className="grid grid-cols-3 gap-3">
                {job.media_urls.map((url, i) => (
                  <img key={i} src={url} alt="" className="w-full h-32 object-cover rounded-lg" style={{ border: "1px solid rgba(255,255,255,0.5)" }} />
                ))}
              </div>
            </div>
          )}
        </div>

        {job.status !== "open" && !hasApplied ? (
          <div className="rounded-xl p-6 text-center" style={{ backgroundColor: "rgba(255,255,255,0.35)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.5)" }}>
            <p style={{ color: "#5a4a20" }}>This job is no longer accepting applications</p>
          </div>
        ) : hasApplied ? (
          <div className="rounded-xl p-6 text-center" style={{ backgroundColor: "rgba(255,255,255,0.35)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.5)" }}>
            <p className="font-medium" style={{ color: "#1a1a2e" }}>You have already applied to this job</p>
            <Link href="/worker/applications" className="text-sm mt-2 inline-block" style={{ color: "#F0B45B" }}>View your applications</Link>
          </div>
        ) : success ? (
          <div className="rounded-xl p-6 text-center" style={{ backgroundColor: "rgba(30,142,62,0.1)", border: "1px solid rgba(30,142,62,0.3)" }}>
            <p className="font-medium" style={{ color: "#69db7c" }}>Application submitted successfully!</p>
            <p className="text-sm mt-1" style={{ color: "#5a4a20" }}>The homeowner will review your application</p>
            <Link href="/worker" className="text-sm hover:underline mt-3 inline-block" style={{ color: "#F0B45B" }}>Browse more jobs</Link>
          </div>
        ) : (
          <div className="rounded-xl p-6" style={{ backgroundColor: "rgba(255,255,255,0.35)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.5)" }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: "#1a1a2e" }}>Apply for this job</h2>
            {error && (
              <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: "rgba(255,80,80,0.15)", color: "#ff6b6b" }}>{error}</div>
            )}
            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#5a4a20" }}>Your Message</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg text-sm outline-none text-black resize-none"
                  style={{ backgroundColor: "#fff", border: "1px solid #ddd", color: "#000" }}
                  placeholder="Explain why you're the right person for this job..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#5a4a20" }}>Your Rate (INR)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={proposedRate}
                  onChange={(e) => { const v = e.target.value.replace(/[^0-9]/g, ""); setProposedRate(v); }}
                  className="w-full px-4 py-3 rounded-lg text-sm outline-none text-black"
                  style={{ backgroundColor: "#fff", border: "1px solid #ddd", color: "#000" }}
                  placeholder="Your proposed rate"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ backgroundColor: "#1a1a2e", color: "#F0B45B" }}
              >
                <Send className="w-4 h-4" />
                {submitting ? "Submitting..." : "Submit Application"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
