"use client";

import { useState, useEffect, useRef } from "react";
import { Send, ArrowLeft } from "lucide-react";

interface Message {
  id: string;
  sender_id: string;
  text: string;
  read: boolean;
  created_at: string;
  full_name?: string | null;
}

interface ChatProps {
  conversationId: string;
  currentUserId: string;
}

export default function Chat({ conversationId, currentUserId }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchMessages() {
      try {
        const res = await fetch(`/api/conversations/${conversationId}`);
        const data = await res.json();
        setMessages(data.items || []);
      } catch {}
    }
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation_id: conversationId, text: text.trim() }),
      });
      setText("");
      const res = await fetch(`/api/conversations/${conversationId}`);
      const data = await res.json();
      setMessages(data.items || []);
    } catch {}
    setSending(false);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => {
          const isMine = msg.sender_id === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl ${
                isMine
                  ? "rounded-br-md"
                  : "rounded-bl-md"
              }`} style={{
                backgroundColor: isMine ? "#1a1a2e" : "rgba(255,255,255,0.1)",
                color: isMine ? "#F0B45B" : "#fff",
              }}>
                {!isMine && msg.full_name && (
                  <p className="text-xs font-medium mb-1 opacity-70">{msg.full_name}</p>
                )}
                <p className="text-sm">{msg.text}</p>
                <p className="text-[10px] mt-1" style={{ color: isMine ? "rgba(240,180,91,0.6)" : "#aaa" }}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 border-t" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
        <div className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 rounded-full text-sm outline-none text-black"
            style={{ backgroundColor: "#fff", border: "1px solid #ddd", color: "#000" }}
          />
          <button
            type="submit"
            disabled={!text.trim() || sending}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
            style={{ backgroundColor: "#1a1a2e", color: "#F0B45B" }}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
