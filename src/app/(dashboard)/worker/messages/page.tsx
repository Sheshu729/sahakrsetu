"use client";

import MessagesList from "@/components/MessagesList";

export default function WorkerMessagesPage() {
  return (
    <MessagesList
      basePath="/worker"
      emptyHint="Your conversations with homeowners will appear here once you start chatting."
    />
  );
}
