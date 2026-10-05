"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageSquare } from "lucide-react";

interface Conversation {
  id: string;
  job_title?: string | null;
  other_user?: { full_name: string; avatar_url: string | null } | null;
  created_at: string;
}

export default function MessagesList({ basePath, emptyHint }: { basePath: string; emptyHint: string }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/conversations")
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        setConversations(Array.isArray(data) ? data : data.items || []);
      })
      .catch(() => {
        if (active) setConversations([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div style={{ color: "#5a4a20" }}>Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6" style={{ color: "#1a1a2e" }}>Messages</h1>

        {conversations.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-16 rounded-xl"
            style={{ backgroundColor: "#ffffff", border: "1px solid rgba(15,23,42,0.08)", boxShadow: "0 1px 2px rgba(15,23,42,0.04)" }}
          >
            <MessageSquare size={48} style={{ color: "#7a6a30" }} className="mb-4" />
            <h2 className="text-lg font-semibold mb-2" style={{ color: "#1a1a2e" }}>No conversations yet</h2>
            <p className="text-sm text-center max-w-xs" style={{ color: "#5a4a20" }}>{emptyHint}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv) => (
              <Link
                key={conv.id}
                href={`${basePath}/messages/${conv.id}`}
                className="block rounded-xl p-4 transition-colors"
                style={{ backgroundColor: "#ffffff", border: "1px solid rgba(15,23,42,0.08)", boxShadow: "0 1px 2px rgba(15,23,42,0.04)" }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{ backgroundColor: "#1a1a2e", color: "#F0B45B" }}
                    >
                      {(conv.other_user?.full_name || "U").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-medium" style={{ color: "#1a1a2e" }}>
                        {conv.other_user?.full_name || "Unknown User"}
                      </h3>
                      <p className="text-sm" style={{ color: "#5a4a20" }}>{conv.job_title || "Untitled Job"}</p>
                    </div>
                  </div>
                  <span className="text-xs whitespace-nowrap" style={{ color: "#7a6a30" }}>
                    {new Date(conv.created_at).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
