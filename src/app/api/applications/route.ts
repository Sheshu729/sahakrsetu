import { NextRequest, NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { getCurrentUserId, getCurrentUser } from "@/lib/auth";
import {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  getJobById,
  getUserById,
  updateJob,
  createConversation,
  findConversation,
} from "@/lib/db";

export async function GET(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const worker_id = searchParams.get("worker_id") || undefined;
  const job_id = searchParams.get("job_id") || undefined;

  // Only allow viewing own applications or applications for own jobs
  const user = await getCurrentUser();
  if (user?.role === "worker" && worker_id && worker_id !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const apps = await getApplications({ worker_id, job_id });

  const enriched = await Promise.all(
    apps.map(async (app) => {
      const worker = await getUserById(app.worker_id);
      const job = await getJobById(app.job_id);
      return {
        ...app,
        profiles: worker
          ? { full_name: worker.full_name, email: worker.email, phone: worker.phone, avatar_url: worker.avatar_url }
          : null,
        job_posts: job
          ? { title: job.title, category: job.category, location: job.location, budget: job.budget, status: job.status }
          : null,
      };
    })
  );

  return NextResponse.json(enriched);
}

export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getCurrentUser();
  if (!user || user.role !== "worker") {
    return NextResponse.json({ error: "Only workers can apply" }, { status: 403 });
  }

  const { job_id, message, proposed_rate } = await request.json();

  if (!job_id || !message || typeof message !== "string") {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (message.length > 1000) {
    return NextResponse.json({ error: "Message must be under 1000 characters" }, { status: 400 });
  }

  const job = await getJobById(job_id);
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  if (job.status !== "open") {
    return NextResponse.json({ error: "Job is no longer accepting applications" }, { status: 400 });
  }

  const existing = await getApplications({ job_id, worker_id: userId });
  if (existing.length > 0) {
    return NextResponse.json({ error: "Already applied" }, { status: 409 });
  }

  const app = await createApplication({
    id: uuid(),
    job_id,
    worker_id: userId,
    message: message.trim(),
    proposed_rate: Math.min(Math.max(Number(proposed_rate) || 0, 0), 10000000),
    status: "pending",
    created_at: new Date().toISOString(),
  });

  return NextResponse.json(app);
}

export async function PATCH(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, status } = await request.json();
  if (!id || !status) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (status !== "accepted" && status !== "rejected") {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const app = await getApplicationById(id);
  if (!app) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  const job = await getJobById(app.job_id);
  if (!job || job.owner_id !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await updateApplication(id, { status });

  if (status === "accepted") {
    await updateJob(app.job_id, { status: "assigned" });
    const allApps = await getApplications({ job_id: app.job_id });
    for (const other of allApps) {
      if (other.id !== id && other.status === "pending") {
        await updateApplication(other.id, { status: "rejected" });
      }
    }

    // Auto-create conversation
    const existing = await findConversation(app.job_id, job.owner_id, app.worker_id);
    if (!existing) {
      await createConversation({
        id: uuid(),
        job_id: app.job_id,
        owner_id: job.owner_id,
        worker_id: app.worker_id,
        created_at: new Date().toISOString(),
      });
    }
  }

  return NextResponse.json({ ok: true });
}
