import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId, getCurrentUser } from "@/lib/auth";
import {
  getStats,
  getUserById,
  updateUser,
} from "@/lib/db";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.email !== "admin@homework.com")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const stats = await getStats();
  return NextResponse.json(stats);
}

export async function PATCH(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.email !== "admin@homework.com")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { user_id, action } = await request.json();

  if (!user_id || !action) {
    return NextResponse.json({ error: "Missing user_id or action" }, { status: 400 });
  }

  if (action !== "ban" && action !== "set_admin") {
    return NextResponse.json({ error: "Invalid action. Use 'ban' or 'set_admin'" }, { status: 400 });
  }

  const targetUser = await getUserById(user_id);
  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  let updates;
  if (action === "ban") {
    updates = { role: "worker" as const, bio: "" };
  } else {
    updates = { role: "admin" as const };
  }

  const updatedUser = await updateUser(user_id, updates);
  return NextResponse.json({ user: updatedUser });
}
