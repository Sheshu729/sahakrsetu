"use client";

import MessagesList from "@/components/MessagesList";

export default function OwnerMessagesPage() {
  return (
    <MessagesList
      basePath="/owner"
      emptyHint="Your conversations with workers will appear here once you start chatting."
    />
  );
}
