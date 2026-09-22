"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { formatDate, formatCurrency } from "@/lib/utils";
import { JOB_CATEGORIES, STATUS_COLORS } from "@/types";
import type { Application } from "@/types";
import { SkeletonList } from "@/components/Skeleton";
import { useToast } from "@/components/Toast";
import { FileText, MapPin, IndianRupee, Calendar } from "lucide-react";

export default function WorkerApplicationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function fetchApplications() {
      try {
        const res = await fetch(`/api/applications?worker_id=${user!.id}`);
        if (!res.ok) throw new Error("Failed to fetch applications");
        const data = await res.json();
        setApplications(Array.isArray(data) ? data : data.items || []);
      } catch {
        toast("Failed to load applications", "error");
      } finally {
        setLoading(false);
      }
    }
    fetchApplications();
  }, [user, toast]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold" style={{ color: "#1a1a2e" }}>My Applications</h1>
            <p className="mt-1" style={{ color: "#5a4a20" }}>Track the status of your job applications</p>
          </div>
          <SkeletonList count={3} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold" style={{ color: "#1a1a2e" }}>My Applications</h1>
          <p className="mt-1" style={{ color: "#5a4a20" }}>Track the status of your job applications</p>
        </div>

        {applications.length === 0 ? (
          <div className="text-center py-20 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.35)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.5)" }}>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: "#1a1a2e" }}>
              <FileText className="w-8 h-8" style={{ color: "#F0B45B" }} />
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: "#1a1a2e" }}>No applications yet</h3>
            <p className="mb-6" style={{ color: "#5a4a20" }}>Start applying to jobs to see them here</p>
            <Link href="/worker" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-colors" style={{ backgroundColor: "#1a1a2e", color: "#F0B45B" }}>
              Browse Jobs
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app.id} className="p-6 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.35)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.5)" }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold" style={{ color: "#1a1a2e" }}>{app.job_posts?.title}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[app.status]}`}>{app.status}</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: "rgba(255,255,255,0.35)", color: "#5a4a20", border: "1px solid rgba(255,255,255,0.5)" }}>
                      {JOB_CATEGORIES.find((c) => c.value === app.job_posts?.category)?.label}
                    </span>
                  </div>
                  <Link href={`/worker/${app.job_id}`} className="text-sm hover:underline" style={{ color: "#F0B45B" }}>View Job</Link>
                </div>
                <p className="text-sm mb-4" style={{ color: "#5a4a20" }}>{app.message}</p>
                <div className="flex items-center gap-6 text-xs" style={{ color: "#7a6a30" }}>
                  <span className="flex items-center gap-1"><IndianRupee className="w-3 h-3" /> Your rate: {formatCurrency(app.proposed_rate)}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {app.job_posts?.location}</span>
                  <span>Job budget: {formatCurrency(app.job_posts?.budget || 0)}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Applied: {formatDate(app.created_at)}</span>
                </div>
                {app.status === "accepted" && (
                  <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: "rgba(30,142,62,0.1)", border: "1px solid rgba(30,142,62,0.3)" }}>
                    <p className="text-sm" style={{ color: "#69db7c" }}>You have been selected for this job! Contact the homeowner to proceed.</p>
                  </div>
                )}
                {app.status === "rejected" && (
                  <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: "rgba(255,80,80,0.15)", border: "1px solid rgba(255,80,80,0.3)" }}>
                    <p className="text-sm" style={{ color: "#ff6b6b" }}>This application was not selected. Keep applying to other jobs.</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
