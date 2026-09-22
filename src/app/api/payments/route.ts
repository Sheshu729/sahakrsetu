import { NextRequest, NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { getCurrentUserId } from "@/lib/auth";
import { getJobById, getApplications, getPaymentByJob, createPayment } from "@/lib/db";

export async function GET(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const job_id = searchParams.get("job_id");
  if (!job_id) {
    return NextResponse.json({ error: "job_id is required" }, { status: 400 });
  }

  const job = await getJobById(job_id);
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const payment = await getPaymentByJob(job_id);
  return NextResponse.json({ payment: payment ?? null });
}

export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { job_id } = await request.json();
  if (!job_id) {
    return NextResponse.json({ error: "job_id is required" }, { status: 400 });
  }

  const job = await getJobById(job_id);
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }
  if (job.owner_id !== userId) {
    return NextResponse.json({ error: "Only the job owner can create a payment" }, { status: 403 });
  }
  if (job.status !== "completed") {
    return NextResponse.json({ error: "Payment is only available for completed jobs" }, { status: 400 });
  }

  const existing = await getPaymentByJob(job_id);
  if (existing) {
    return NextResponse.json({ payment: existing });
  }

  const apps = await getApplications({ job_id });
  const accepted = apps.find((a) => a.status === "accepted");
  if (!accepted) {
    return NextResponse.json({ error: "No worker assigned to this job" }, { status: 400 });
  }

  const payment = await createPayment({
    id: uuid(),
    job_id,
    payer_id: userId,
    payee_id: accepted.worker_id,
    amount: accepted.proposed_rate > 0 ? accepted.proposed_rate : job.budget,
    status: "pending",
    razorpay_order_id: null,
    created_at: new Date().toISOString(),
    paid_at: null,
  });

  return NextResponse.json({ payment }, { status: 201 });
}
