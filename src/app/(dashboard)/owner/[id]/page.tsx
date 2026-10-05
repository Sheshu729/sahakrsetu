"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { formatDate, formatCurrency } from "@/lib/utils";
import { JOB_CATEGORIES, STATUS_COLORS } from "@/types";
import type { Application, JobPost } from "@/types";
import { ArrowLeft, MapPin, Calendar, IndianRupee, Check, X, User, Edit, Trash2, MessageCircle, CreditCard, Star } from "lucide-react";
import { useToast } from "@/components/Toast";
import ConfirmDialog from "@/components/ConfirmDialog";
import { SkeletonProfile } from "@/components/Skeleton";
import StarRating from "@/components/StarRating";
import ReviewModal from "@/components/ReviewModal";
import type { Payment } from "@/types";

export default function PostDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [job, setJob] = useState<JobPost | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [workerRatings, setWorkerRatings] = useState<Record<string, number>>({});
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: "complete" | "cancel" | "delete";
  }>({ open: false, action: "complete" });
  const [payment, setPayment] = useState<Payment | null>(null);
  const [paying, setPaying] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewed, setReviewed] = useState(false);

  const loadPayment = async (jobId: string) => {
    try {
      const res = await fetch(`/api/payments?job_id=${jobId}`);
      if (res.ok) {
        const data = await res.json();
        setPayment(data.payment || null);
      }
    } catch {}
  };

  const checkReviewed = async (jobId: string, revieweeId: string) => {
    try {
      const res = await fetch(`/api/reviews?job_id=${jobId}&reviewee_id=${revieweeId}`);
      if (res.ok) {
        const data = await res.json();
        const items = Array.isArray(data) ? data : data.items || [];
        setReviewed(items.length > 0);
      }
    } catch {}
  };

  useEffect(() => {
    if (!user) return;
    async function loadJob() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/jobs/${id}`);
        if (!res.ok) throw new Error("Failed to load job");
        const data = await res.json();
        setJob(data);
        setApplications(data.applications || []);
        loadPayment(data.id);
        const acc = (data.applications || []).find(
          (a: Application) => a.status === "accepted"
        );
        if (data.status === "completed" && acc) {
          checkReviewed(data.id, acc.worker_id);
        }
      } catch {
        setError("Failed to load job details");
      } finally {
        setLoading(false);
      }
    }
    loadJob();
  }, [id, user]);

  useEffect(() => {
    if (applications.length === 0) return;
    const uniqueWorkerIds = [...new Set(applications.map((a) => a.worker_id))];
    uniqueWorkerIds.forEach(async (wid) => {
      try {
        const res = await fetch(`/api/reviews?reviewee_id=${wid}`);
        if (res.ok) {
          const reviews = await res.json();
          if (reviews.length > 0) {
            const avg = reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviews.length;
            setWorkerRatings((prev) => ({ ...prev, [wid]: Math.round(avg * 10) / 10 }));
          }
        }
      } catch {
        // ignore
      }
    });
  }, [applications]);

  async function handleDecision(appId: string, decision: "accepted" | "rejected") {
    setActionLoading(appId);
    try {
      const res = await fetch("/api/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: appId, status: decision }),
      });
      if (!res.ok) throw new Error("Failed");

      if (decision === "accepted") {
        setJob((prev) => (prev ? { ...prev, status: "assigned" } : null));
      }

      setApplications((prev) =>
        prev.map((app) =>
          app.id === appId
            ? { ...app, status: decision }
            : decision === "accepted"
            ? { ...app, status: "rejected" as const }
            : app
        )
      );
      toast(`Applicant ${decision}`, "success");
    } catch {
      toast("Failed to update application", "error");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleStatusUpdate(status: "completed" | "cancelled") {
    if (!job) return;
    setActionLoading("status");
    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed");
      setJob((prev) => (prev ? { ...prev, status } : null));
      toast(`Job marked as ${status}`, "success");
      if (status === "completed") {
        await fetch(`/api/payments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ job_id: job.id }),
        }).catch(() => {});
        await loadPayment(job.id);
      }
    } catch {
      toast("Failed to update job status", "error");
    } finally {
      setActionLoading(null);
      setConfirmDialog({ open: false, action: "complete" });
    }
  }

  async function handleDelete() {
    if (!job) return;
    setActionLoading("delete");
    try {
      const res = await fetch(`/api/jobs/${job.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast("Job deleted", "success");
      router.push("/owner");
    } catch {
      toast("Failed to delete job", "error");
    } finally {
      setActionLoading(null);
      setConfirmDialog({ open: false, action: "delete" });
    }
  }

  async function handlePay() {
    if (!job) return;
    setPaying(true);
    try {
      let pay = payment;
      if (!pay) {
        const createRes = await fetch("/api/payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ job_id: job.id }),
        });
        if (createRes.ok) {
          pay = (await createRes.json()).payment;
          setPayment(pay);
        }
      }
      if (!pay) throw new Error("No payment");
      const res = await fetch(`/api/payments/${job.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "pay" }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setPayment(data.payment);
      toast("Payment successful!", "success");
      if (acceptedApp && !reviewed) setReviewOpen(true);
    } catch {
      toast("Payment failed. Please try again.", "error");
    } finally {
      setPaying(false);
    }
  }

  async function handleMessageWorker(workerId: string) {
    if (!user || !job) return;
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: job.id, owner_id: user.id, worker_id: workerId }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      router.push(`/owner/messages/${data.id}`);
    } catch {
      toast("Failed to start conversation", "error");
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <Link href="/owner" className="inline-flex items-center gap-2 mb-6 transition-colors" style={{ color: "#5a4a20" }}>
          <ArrowLeft className="w-4 h-4" /> Back to posts
        </Link>
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2"><SkeletonProfile /></div>
          <div className="col-span-1"><SkeletonProfile /></div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="p-8 text-center py-20">
        <p style={{ color: "#5a4a20" }}>{error || "Job not found"}</p>
          <Link href="/owner" className="hover:underline mt-2 inline-block" style={{ color: "#F0B45B" }}>
            Back to posts
          </Link>
      </div>
    );
  }

  const acceptedApp = applications.find((a) => a.status === "accepted");

  return (
    <div className="p-8">
      <Link href="/owner" className="inline-flex items-center gap-2 mb-6 transition-colors" style={{ color: "#5a4a20" }}>
        <ArrowLeft className="w-4 h-4" /> Back to posts
      </Link>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: "#ffffff", border: "1px solid rgba(15,23,42,0.08)", boxShadow: "0 1px 2px rgba(15,23,42,0.04)" }}>
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-2xl font-bold" style={{ color: "#1a1a2e" }}>{job.title}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[job.status]}`}>{job.status}</span>
            </div>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium mb-4" style={{ backgroundColor: "rgba(15,23,42,0.04)", color: "#5a4a20", border: "1px solid rgba(15,23,42,0.1)" }}>
              {JOB_CATEGORIES.find((c) => c.value === job.category)?.label}
            </span>
            <p className="leading-relaxed mb-6" style={{ color: "#5a4a20" }}>{job.description}</p>
            <div className="flex items-center gap-6 text-sm" style={{ color: "#7a6a30" }}>
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {job.location}{job.pincode ? ` · ${job.pincode}` : ""}</span>
              <span className="flex items-center gap-1.5"><IndianRupee className="w-4 h-4" /> {formatCurrency(job.budget)}</span>
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {formatDate(job.created_at)}</span>
            </div>
            {job.media_urls && job.media_urls.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-6">
                {job.media_urls.map((url, i) => (
                  <img key={i} src={url} alt="" className="w-full h-32 object-cover rounded-lg" />
                ))}
              </div>
            )}

            <div className="flex gap-2 mt-6 pt-4" style={{ borderTop: "1px solid rgba(15,23,42,0.08)" }}>
              <Link
                href={`/owner/${job.id}/edit`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                style={{ border: "1px solid rgba(15,23,42,0.12)", color: "#9a6b1f" }}
              >
                <Edit className="w-3.5 h-3.5" /> Edit Job
              </Link>
              {(job.status === "assigned") && (
                <>
                  <button
                    onClick={() => setConfirmDialog({ open: true, action: "complete" })}
                    disabled={actionLoading === "status"}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    style={{ border: "1px solid #1e8e3e", color: "#69db7c" }}
                  >
                    <Check className="w-3.5 h-3.5" /> Mark as Complete
                  </button>
                  <button
                    onClick={() => setConfirmDialog({ open: true, action: "cancel" })}
                    disabled={actionLoading === "status"}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    style={{ border: "1px solid #d93025", color: "#ff6b6b" }}
                  >
                    <X className="w-3.5 h-3.5" /> Cancel
                  </button>
                </>
              )}
              {job.status === "open" && (
                <button
                  onClick={() => setConfirmDialog({ open: true, action: "cancel" })}
                  disabled={actionLoading === "status"}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  style={{ border: "1px solid #d93025", color: "#ff6b6b" }}
                >
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
              )}
              <button
                onClick={() => setConfirmDialog({ open: true, action: "delete" })}
                disabled={actionLoading === "delete"}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                style={{ border: "1px solid #d93025", color: "#ff6b6b" }}
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Job
              </button>
            </div>
          </div>
        </div>

        <div className="col-span-1">
          <div className="rounded-xl p-6" style={{ backgroundColor: "#ffffff", border: "1px solid rgba(15,23,42,0.08)", boxShadow: "0 1px 2px rgba(15,23,42,0.04)" }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: "#1a1a2e" }}>Applicants ({applications.length})</h2>
            {applications.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: "#7a6a30" }}>No applications yet. Workers will apply soon.</p>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 rounded-xl transition-colors"
                    style={{
                      border: app.status === "accepted" ? "1px solid rgba(30,142,62,0.4)" : app.status === "rejected" ? "1px solid rgba(217,48,37,0.25)" : "1px solid rgba(15,23,42,0.1)",
                      backgroundColor: app.status === "accepted" ? "rgba(30,142,62,0.05)" : app.status === "rejected" ? "rgba(217,48,37,0.04)" : "rgba(15,23,42,0.03)",
                      opacity: app.status === "rejected" ? 0.5 : 1,
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: "#1a1a2e" }}>
                        <User className="w-4 h-4" style={{ color: "#F0B45B" }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium" style={{ color: "#1a1a2e" }}>{app.profiles?.full_name}</p>
                        <p className="text-xs" style={{ color: "#7a6a30" }}>{app.profiles?.phone}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[app.status]}`}>{app.status}</span>
                    </div>
                    {workerRatings[app.worker_id] !== undefined && (
                      <div className="mb-2">
                        <StarRating rating={workerRatings[app.worker_id]} size="sm" />
                      </div>
                    )}
                    <p className="text-sm mb-3" style={{ color: "#5a4a20" }}>{app.message}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold" style={{ color: "#1a1a2e" }}>{formatCurrency(app.proposed_rate)}</span>
                      <div className="flex gap-2">
                        {app.status === "pending" && job.status === "open" && (
                          <>
                            <button
                              onClick={() => handleDecision(app.id, "accepted")}
                              disabled={actionLoading === app.id}
                              className="p-1.5 rounded-lg transition-colors disabled:opacity-50"
                              style={{ backgroundColor: "rgba(30,142,62,0.1)", color: "#1e8e3e" }}
                              title="Accept"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDecision(app.id, "rejected")}
                              disabled={actionLoading === app.id}
                              className="p-1.5 rounded-lg transition-colors disabled:opacity-50"
                              style={{ backgroundColor: "rgba(217,48,37,0.1)", color: "#d93025" }}
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleMessageWorker(app.worker_id)}
                          className="p-1.5 rounded-lg transition-colors"
                          style={{ backgroundColor: "rgba(15,23,42,0.06)", color: "#1a1a2e" }}
                          title="Message Worker"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {acceptedApp && (
              <div className="mt-4 p-4 rounded-xl" style={{ backgroundColor: "rgba(30,142,62,0.1)", border: "1px solid rgba(30,142,62,0.3)" }}>
                <p className="text-sm font-medium mb-1" style={{ color: "#1e8e3e" }}>Worker Selected</p>
                <p className="text-sm" style={{ color: "#1a1a2e" }}>{acceptedApp.profiles?.full_name}</p>
                <p className="text-xs" style={{ color: "#7a6a30" }}>{acceptedApp.profiles?.phone}</p>
              </div>
            )}

            {job.status === "completed" && acceptedApp && (
              <div className="mt-4 p-4 rounded-xl" style={{ backgroundColor: "rgba(240,180,91,0.1)", border: "1px solid rgba(240,180,91,0.3)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-4 h-4" style={{ color: "#F0B45B" }} />
                  <p className="text-sm font-medium" style={{ color: "#1a1a2e" }}>
                    Payment {payment?.status === "completed" ? "Completed" : "Due"}
                  </p>
                </div>
                {payment ? (
                  <p className="text-lg font-semibold mb-3" style={{ color: "#1a1a2e" }}>
                    ₹{payment.amount.toLocaleString("en-IN")}
                  </p>
                ) : (
                  <p className="text-xs mb-3" style={{ color: "#7a6a30" }}>Preparing payment…</p>
                )}
                {payment && payment.status !== "completed" && (
                  <button
                    onClick={handlePay}
                    disabled={paying}
                    className="w-full py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    style={{ backgroundColor: "#1a1a2e", color: "#F0B45B" }}
                  >
                    {paying ? "Processing..." : `Pay ₹${payment.amount.toLocaleString("en-IN")}`}
                  </button>
                )}
                {payment?.status === "completed" && (
                  <p className="text-xs" style={{ color: "#69db7c" }}>
                    Paid{payment.paid_at ? ` on ${new Date(payment.paid_at).toLocaleDateString()}` : ""}
                  </p>
                )}
                {payment?.status === "completed" && !reviewed && (
                  <button
                    onClick={() => setReviewOpen(true)}
                    className="w-full mt-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    style={{ border: "1px solid rgba(240,180,91,0.3)", color: "#F0B45B" }}
                  >
                    <Star className="w-4 h-4" /> Rate this worker
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {acceptedApp && (
        <ReviewModal
          open={reviewOpen}
          jobId={job.id}
          revieweeId={acceptedApp.worker_id}
          onClose={() => setReviewOpen(false)}
          onSubmit={() => {
            setReviewed(true);
            toast("Review submitted. Thank you!", "success");
          }}
        />
      )}

      <ConfirmDialog
        open={confirmDialog.open}
        title={
          confirmDialog.action === "complete"
            ? "Mark as Complete?"
            : confirmDialog.action === "cancel"
            ? "Cancel Job?"
            : "Delete Job?"
        }
        message={
          confirmDialog.action === "complete"
            ? "This will mark the job as completed. This action cannot be undone."
            : confirmDialog.action === "cancel"
            ? "This will cancel the job. This action cannot be undone."
            : "This will permanently delete this job. This action cannot be undone."
        }
        confirmLabel={
          confirmDialog.action === "complete"
            ? "Complete"
            : confirmDialog.action === "cancel"
            ? "Cancel Job"
            : "Delete"
        }
        danger
        onConfirm={
          confirmDialog.action === "delete"
            ? handleDelete
            : () => handleStatusUpdate(confirmDialog.action === "complete" ? "completed" : "cancelled")
        }
        onCancel={() => setConfirmDialog({ open: false, action: "complete" })}
      />
    </div>
  );
}
