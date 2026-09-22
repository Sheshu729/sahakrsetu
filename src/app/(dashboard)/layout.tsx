"use client";

import Navbar from "@/components/Navbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(180deg, #c8850a 0%, #d4940a 20%, #F0B45B 50%, #f5c878 80%, #fae3a0 100%)" }}
    >
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
