import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { getConversation, getMessages, getUserById } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const conversation = await getConversation(id);

  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  if (conversation.owner_id !== userId && conversation.worker_id !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const messages = await getMessages(id);

  const enriched = await Promise.all(
    messages.map(async (msg) => {
      const sender = await getUserById(msg.sender_id);
      return {
        ...msg,
        full_name: sender?.full_name || null,
        avatar_url: sender?.avatar_url || null,
      };
    })
  );

  return NextResponse.json({ items: enriched });
}
