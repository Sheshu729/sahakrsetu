import { NextRequest, NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { getCurrentUserId, getCurrentUser } from "@/lib/auth";
import { createJob, getJobs, getUserById, getApplications } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const owner_id = searchParams.get("owner_id") || undefined;
  const status = searchParams.get("status") || undefined;
  const category = searchParams.get("category") || undefined;
  const search = searchParams.get("search") || undefined;
  const pincode = searchParams.get("pincode") || undefined;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");

  const { items: jobs, total } = await getJobs({ owner_id, status, category, search, pincode, page, limit });

  const enriched = await Promise.all(
    jobs.map(async (job) => {
      const owner = await getUserById(job.owner_id);
      const apps = await getApplications({ job_id: job.id });
      return {
        ...job,
        profiles: owner
          ? { full_name: owner.full_name, email: owner.email, phone: owner.phone, avatar_url: owner.avatar_url }
          : null,
        application_count: apps.length,
        applications: undefined,
      };
    })
  );

  return NextResponse.json({ items: enriched, total, page, limit });
}

export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getCurrentUser();
  if (!user || user.role !== "owner") {
    return NextResponse.json({ error: "Only owners can create jobs" }, { status: 403 });
  }

  const { title, description, category, budget, location, pincode, media_urls } = await request.json();

  if (!title || !description || !category || !location) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (pincode !== undefined && pincode !== null && pincode !== "" && !/^\d{6}$/.test(String(pincode))) {
    return NextResponse.json({ error: "Pincode must be a 6-digit number" }, { status: 400 });
  }

  if (typeof title !== "string" || title.length > 200) {
    return NextResponse.json({ error: "Title must be under 200 characters" }, { status: 400 });
  }

  if (typeof description !== "string" || description.length > 2000) {
    return NextResponse.json({ error: "Description must be under 2000 characters" }, { status: 400 });
  }

  const validBudget = Math.min(Math.max(Number(budget) || 0, 0), 10000000);

  const job = await createJob({
    id: uuid(),
    owner_id: userId,
    title: title.trim(),
    description: description.trim(),
    category,
    budget: validBudget,
    location: location.trim(),
    pincode: pincode ? String(pincode).trim() : "",
    media_urls: Array.isArray(media_urls) ? media_urls.slice(0, 10) : [],
    status: "open",
    created_at: new Date().toISOString(),
  });

  return NextResponse.json(job);
}
