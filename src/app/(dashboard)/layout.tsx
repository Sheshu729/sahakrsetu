"use client";

import Navbar from "@/components/Navbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(180deg, #f7f8fa 0%, #eef1f5 50%, #e8ecf2 100%)" }}
    >
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
