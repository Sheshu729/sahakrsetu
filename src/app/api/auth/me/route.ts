import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { getUserById, getAverageRating } from "@/lib/db";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ user: null });
  }

  const user = await getUserById(userId);
  if (!user) {
    return NextResponse.json({ user: null });
  }

  const avg_rating = await getAverageRating(user.id);

  return NextResponse.json({
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar_url: user.avatar_url,
      bio: user.bio,
      skills: user.skills,
      avg_rating,
    },
  });
}
