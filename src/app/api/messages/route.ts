import { NextRequest, NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { getCurrentUserId } from "@/lib/auth";
import {
  getMessages,
  createMessage,
  markMessagesRead,
  getConversation,
} from "@/lib/db";

export async function GET(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const conversation_id = searchParams.get("conversation_id");
  if (!conversation_id) {
    return NextResponse.json({ error: "conversation_id is required" }, { status: 400 });
  }

  const conversation = await getConversation(conversation_id);
  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }
  if (conversation.owner_id !== userId && conversation.worker_id !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await markMessagesRead(conversation_id, userId);
  const messages = await getMessages(conversation_id);
  return NextResponse.json({ items: messages });
}

export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { conversation_id, text } = await request.json();

  if (!conversation_id || !text) {
    return NextResponse.json({ error: "conversation_id and text are required" }, { status: 400 });
  }

  if (typeof text !== "string" || text.trim().length === 0) {
    return NextResponse.json({ error: "Text must be a non-empty string" }, { status: 400 });
  }

  if (text.length > 1000) {
    return NextResponse.json({ error: "Text must be under 1000 characters" }, { status: 400 });
  }

  const conversation = await getConversation(conversation_id);
  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }
  if (conversation.owner_id !== userId && conversation.worker_id !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const message = await createMessage({
    id: uuid(),
    conversation_id,
    sender_id: userId,
    text: text.trim(),
    read: false,
    created_at: new Date().toISOString(),
  });

  return NextResponse.json(message);
}
