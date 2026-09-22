import { NextRequest, NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { getCurrentUserId } from "@/lib/auth";
import {
  getReviews,
  createReview,
  getJobById,
  getApplications,
  getUserById,
} from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const reviewee_id = searchParams.get("reviewee_id") || undefined;
  const job_id = searchParams.get("job_id") || undefined;

  if (!reviewee_id && !job_id) {
    return NextResponse.json(
      { error: "reviewee_id or job_id is required" },
      { status: 400 }
    );
  }

  const reviews = await getReviews({ reviewee_id, job_id });

  const enriched = await Promise.all(
    reviews.map(async (review) => {
      const reviewer = await getUserById(review.reviewer_id);
      return {
        ...review,
        reviewer: reviewer
          ? { full_name: reviewer.full_name, avatar_url: reviewer.avatar_url }
          : null,
      };
    })
  );

  return NextResponse.json({ items: enriched });
}

export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { job_id, reviewee_id, rating, comment } = await request.json();

  if (!job_id || !reviewee_id || rating === undefined) {
    return NextResponse.json(
      { error: "job_id, reviewee_id, and rating are required" },
      { status: 400 }
    );
  }

  const ratingNum = Number(rating);
  if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return NextResponse.json(
      { error: "Rating must be an integer between 1 and 5" },
      { status: 400 }
    );
  }

  if (comment && typeof comment === "string" && comment.length > 500) {
    return NextResponse.json(
      { error: "Comment must be under 500 characters" },
      { status: 400 }
    );
  }

  const job = await getJobById(job_id);
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }
  if (job.status !== "completed") {
    return NextResponse.json(
      { error: "Can only review completed jobs" },
      { status: 400 }
    );
  }

  const applications = await getApplications({ job_id });
  const isParticipant =
    job.owner_id === userId ||
    applications.some((a) => a.worker_id === userId);

  if (!isParticipant) {
    return NextResponse.json(
      { error: "You are not part of this job" },
      { status: 403 }
    );
  }

  const review = await createReview({
    id: uuid(),
    job_id,
    reviewer_id: userId,
    reviewee_id,
    rating: ratingNum,
    comment: typeof comment === "string" ? comment.trim() : "",
    created_at: new Date().toISOString(),
  });

  return NextResponse.json(review);
}
