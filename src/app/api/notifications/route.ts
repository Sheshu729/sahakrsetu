import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { getUnreadCount, getApplications, getJobs } from "@/lib/db";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const unreadMessages = await getUnreadCount(userId);

  let actionable = 0;
  const ownJobs = await getJobs({ owner_id: userId, status: "open", limit: 200 });
  for (const job of ownJobs.items) {
    const apps = await getApplications({ job_id: job.id });
    actionable += apps.filter((a) => a.status === "pending").length;
  }

  const myApps = await getApplications({ worker_id: userId });
  actionable += myApps.filter((a) => a.status === "accepted").length;

  return NextResponse.json({ unread_messages: unreadMessages, actionable });
}
