import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { getUserById, updateUser, getAverageRating } from "@/lib/db";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getUserById(userId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const avg_rating = await getAverageRating(userId);

  const { password_hash, ...safeProfile } = user;
  return NextResponse.json({ ...safeProfile, avg_rating });
}

export async function PATCH(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const allowed = ["full_name", "phone", "bio", "skills", "avatar_url"];
  const updates: Record<string, unknown> = {};

  for (const key of allowed) {
    if (key in body) {
      updates[key] = body[key];
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 }
    );
  }

  if (updates.full_name !== undefined) {
    if (typeof updates.full_name !== "string" || !updates.full_name.trim()) {
      return NextResponse.json(
        { error: "full_name must be a non-empty string" },
        { status: 400 }
      );
    }
    updates.full_name = (updates.full_name as string).trim();
  }

  if (updates.phone !== undefined && typeof updates.phone !== "string") {
    return NextResponse.json({ error: "phone must be a string" }, { status: 400 });
  }

  if (updates.bio !== undefined && typeof updates.bio !== "string") {
    return NextResponse.json({ error: "bio must be a string" }, { status: 400 });
  }

  if (updates.skills !== undefined && !Array.isArray(updates.skills)) {
    return NextResponse.json({ error: "skills must be an array" }, { status: 400 });
  }

  if (updates.avatar_url !== undefined && updates.avatar_url !== null && typeof updates.avatar_url !== "string") {
    return NextResponse.json({ error: "avatar_url must be a string or null" }, { status: 400 });
  }

  const updated = await updateUser(userId, updates);
  if (!updated) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { password_hash, ...safeProfile } = updated;
  return NextResponse.json(safeProfile);
}
