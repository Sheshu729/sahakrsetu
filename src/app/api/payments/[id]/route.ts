import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { getPaymentByJob, getJobById, updatePayment } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const action = body?.action;

  if (action !== "pay") {
    return NextResponse.json({ error: "Invalid action. Use 'pay'" }, { status: 400 });
  }

  const job = await getJobById(id);
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }
  if (job.owner_id !== userId) {
    return NextResponse.json({ error: "Only the job owner can pay" }, { status: 403 });
  }

  const payment = await getPaymentByJob(id);
  if (!payment) {
    return NextResponse.json({ error: "No payment found for this job" }, { status: 404 });
  }
  if (payment.status === "completed") {
    return NextResponse.json({ payment });
  }

  // Razorpay-ready: when RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET are set, create a real
  // order here and return { razorpay: { order_id, key_id } } for checkout.js.
  // Without keys, demo mode completes the payment instantly.
  const hasRazorpay = Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
  const razorpayOrderId = hasRazorpay
    ? `order_demo_${payment.id.slice(0, 8)}`
    : null;

  const updated = await updatePayment(payment.id, {
    status: "completed",
    paid_at: new Date().toISOString(),
    razorpay_order_id: razorpayOrderId,
  });
  if (!updated) {
    return NextResponse.json({ error: "Payment update failed" }, { status: 500 });
  }

  return NextResponse.json({ payment: updated, demo: !hasRazorpay });
}
