import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";
import { createUser, getUserByEmail } from "@/lib/db";
import { setAuthCookie } from "@/lib/auth";
import { rateLimit, getClientKey } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    if (!rateLimit(getClientKey(request, "register"), 5, 60000)) {
      return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
    }

    const { full_name, email, phone, password, role } = await request.json();

    if (!full_name || !email || !password || !role) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (typeof full_name !== "string" || full_name.length < 2 || full_name.length > 100) {
      return NextResponse.json({ error: "Name must be 2-100 characters" }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    if (role !== "owner" && role !== "worker") {
      return NextResponse.json({ error: "Role must be owner or worker" }, { status: 400 });
    }

    const existing = await getUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const user = {
      id: uuid(),
      full_name: full_name.trim(),
      email: email.toLowerCase().trim(),
      phone: (phone || "").trim(),
      password_hash,
      role: role as "owner" | "worker",
      avatar_url: null,
      bio: "",
      skills: [],
      created_at: new Date().toISOString(),
    };

    await createUser(user);
    await setAuthCookie(user.id);

    return NextResponse.json({
      user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role },
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
