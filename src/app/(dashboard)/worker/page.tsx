"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { formatDate, formatCurrency } from "@/lib/utils";
import { JOB_CATEGORIES } from "@/types";
import type { JobPost } from "@/types";
import { SkeletonList } from "@/components/Skeleton";
import { useToast } from "@/components/Toast";
import { MapPin, Calendar, IndianRupee, Briefcase, Search } from "lucide-react";

export default function WorkerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<(JobPost & { applications?: { worker_id: string }[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [pincode, setPincode] = useState("");

  useEffect(() => {
    async function fetchJobs() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.set("status", "open");
        if (filter !== "all") params.set("category", filter);
        if (pincode.trim()) params.set("pincode", pincode.trim());
        const res = await fetch(`/api/jobs?${params}`);
        if (!res.ok) throw new Error("Failed to fetch jobs");
        const data = await res.json();
        setJobs(Array.isArray(data.items) ? data.items : Array.isArray(data) ? data : []);
      } catch {
        toast("Failed to load jobs", "error");
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, [filter, pincode, toast]);

  const filteredJobs = jobs.filter((job) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      job.title.toLowerCase().includes(q) ||
      job.description.toLowerCase().includes(q) ||
      job.location.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold" style={{ color: "#1a1a2e" }}>Available Jobs</h1>
            <p className="mt-1" style={{ color: "#5a4a20" }}>Browse and apply to household service jobs</p>
          </div>
          <SkeletonList count={4} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold" style={{ color: "#1a1a2e" }}>Available Jobs</h1>
          <p className="mt-1" style={{ color: "#5a4a20" }}>Browse and apply to household service jobs</p>
        </div>

        <div className="relative mb-6 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#7a6a30" }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search jobs by title, description, or location..."
              className="w-full pl-11 pr-4 py-3 rounded-lg text-sm outline-none text-black"
              style={{ backgroundColor: "#fff", border: "1px solid #ddd", color: "#000" }}
            />
          </div>
          <input
            type="text"
            inputMode="numeric"
            value={pincode}
            onChange={(e) => setPincode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
            placeholder="Pincode"
            title="Filter jobs by pincode"
            className="w-32 px-3 py-3 rounded-lg text-sm outline-none text-black"
            style={{ backgroundColor: "#fff", border: "1px solid #ddd", color: "#000" }}
          />
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setFilter("all")}
            className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
            style={{
              backgroundColor: filter === "all" ? "#F0B45B" : "rgba(255,255,255,0.35)",
              color: filter === "all" ? "#1a1a2e" : "#5a4a20",
              border: `1px solid ${filter === "all" ? "#F0B45B" : "rgba(255,255,255,0.5)"}`,
            }}
          >
            All
          </button>
          {JOB_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setFilter(cat.value)}
              className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
                style={{
                  backgroundColor: filter === cat.value ? "#F0B45B" : "rgba(255,255,255,0.35)",
                  color: filter === cat.value ? "#1a1a2e" : "#5a4a20",
                  border: `1px solid ${filter === cat.value ? "#F0B45B" : "rgba(255,255,255,0.5)"}`,
                }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {filteredJobs.length === 0 ? (
          <div className="text-center py-20 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.35)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.5)" }}>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: "#1a1a2e" }}>
              <Briefcase className="w-8 h-8" style={{ color: "#F0B45B" }} />
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: "#1a1a2e" }}>No jobs available</h3>
            <p style={{ color: "#5a4a20" }}>
              {search.trim() ? "No jobs match your search. Try different keywords." : "Check back later for new job posts"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredJobs.map((job) => {
              const hasApplied = job.applications?.some((a) => a.worker_id === user?.id);
              return (
                <Link
                  key={job.id}
                  href={`/worker/${job.id}`}
                  className="block p-6 rounded-xl transition-colors"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.35)",
                    border: hasApplied ? "1px solid rgba(255,255,255,0.5)" : "1px solid rgba(255,255,255,0.5)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: "rgba(255,255,255,0.35)", color: "#5a4a20", border: "1px solid rgba(255,255,255,0.5)" }}>
                      {JOB_CATEGORIES.find((c) => c.value === job.category)?.label}
                    </span>
                    {hasApplied && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: "rgba(240,180,91,0.2)", color: "#F0B45B", border: "1px solid rgba(240,180,91,0.3)" }}>
                        Applied
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: "#1a1a2e" }}>{job.title}</h3>
                  <p className="text-sm line-clamp-2 mb-4" style={{ color: "#5a4a20" }}>{job.description}</p>
                  <div className="flex items-center gap-4 text-xs" style={{ color: "#7a6a30" }}>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}{job.pincode ? ` · ${job.pincode}` : ""}</span>
                    <span className="flex items-center gap-1"><IndianRupee className="w-3 h-3" /> {formatCurrency(job.budget)}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(job.created_at)}</span>
                  </div>
                  <p className="text-xs mt-3" style={{ color: "#7a6a30" }}>Posted by {job.profiles?.full_name}</p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
