import { NextRequest, NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { getCurrentUserId } from "@/lib/auth";
import { getConversations, findConversation, createConversation, getJobById, getUserById } from "@/lib/db";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const conversations = await getConversations(userId);

  const enriched = await Promise.all(
    conversations.map(async (conv) => {
      const job = await getJobById(conv.job_id);
      const otherUserId = conv.owner_id === userId ? conv.worker_id : conv.owner_id;
      const otherUser = await getUserById(otherUserId);
      return {
        ...conv,
        job_title: job?.title || null,
        other_user: otherUser
          ? { full_name: otherUser.full_name, avatar_url: otherUser.avatar_url }
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

  const { job_id, owner_id, worker_id } = await request.json();

  if (!job_id || !owner_id || !worker_id) {
    return NextResponse.json({ error: "Missing job_id, owner_id, or worker_id" }, { status: 400 });
  }

  const existing = await findConversation(job_id, owner_id, worker_id);
  if (existing) {
    return NextResponse.json(existing);
  }

  const conversation = await createConversation({
    id: uuid(),
    job_id,
    owner_id,
    worker_id,
    created_at: new Date().toISOString(),
  });

  return NextResponse.json(conversation, { status: 201 });
}
