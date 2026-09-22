import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId, getCurrentUser } from "@/lib/auth";
import { getJobById, getUserById, getApplications, updateJob, deleteJob } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const job = await getJobById(id);
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const owner = await getUserById(job.owner_id);
  const apps = await getApplications({ job_id: id });

  const enrichedApps = await Promise.all(
    apps.map(async (app) => {
      const worker = await getUserById(app.worker_id);
      return {
        ...app,
        profiles: worker
          ? { full_name: worker.full_name, email: worker.email, phone: worker.phone, avatar_url: worker.avatar_url }
          : null,
      };
    })
  );

  return NextResponse.json({
    ...job,
    profiles: owner
      ? { full_name: owner.full_name, email: owner.email, phone: owner.phone, avatar_url: owner.avatar_url }
      : null,
    applications: enrichedApps,
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const job = await getJobById(id);
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  if (job.owner_id !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const allowed: Record<string, unknown> = {};
  if (typeof body.title === "string") allowed.title = body.title.trim().slice(0, 200);
  if (typeof body.description === "string") allowed.description = body.description.trim().slice(0, 2000);
  if (typeof body.category === "string") allowed.category = body.category;
  if (typeof body.budget === "number") allowed.budget = Math.min(Math.max(body.budget, 0), 10000000);
  if (typeof body.location === "string") allowed.location = body.location.trim().slice(0, 500);
  if (typeof body.pincode === "string") {
    const pc = body.pincode.trim();
    if (pc && !/^\d{6}$/.test(pc)) {
      return NextResponse.json({ error: "Pincode must be a 6-digit number" }, { status: 400 });
    }
    allowed.pincode = pc;
  }
  if (Array.isArray(body.media_urls)) allowed.media_urls = body.media_urls.slice(0, 10);
  if (typeof body.status === "string" && ["open", "completed", "cancelled"].includes(body.status)) {
    allowed.status = body.status;
  }

  const updated = await updateJob(id, allowed);
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getCurrentUser();
  const { id } = await params;
  const job = await getJobById(id);
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  if (job.owner_id !== userId && user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await deleteJob(id);
  return NextResponse.json({ ok: true });
}
