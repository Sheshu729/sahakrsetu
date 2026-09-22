"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import Chat from "@/components/Chat";

export default function ChatPage({ backHref }: { backHref: string }) {
  const { id } = useParams();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 p-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
          <Link href={backHref} className="p-2 rounded-lg transition-colors" style={{ color: "#5a4a20" }}>
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-semibold" style={{ color: "#1a1a2e" }}>Conversation</h1>
        </div>
        <Chat conversationId={id as string} currentUserId={user.id} />
      </div>
    </div>
  );
}
