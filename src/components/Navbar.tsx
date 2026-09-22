"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import {
  Wrench,
  LayoutDashboard,
  PlusCircle,
  Briefcase,
  FileText,
  LogOut,
  Menu,
  X,
  MessageSquare,
  Bell,
} from "lucide-react";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notif, setNotif] = useState({ unread_messages: 0, actionable: 0 });
  const pathname = usePathname();

  useEffect(() => {
    if (!user) return;
    let active = true;
    async function fetchNotif() {
      try {
        const res = await fetch("/api/notifications");
        if (!res.ok) return;
        const data = await res.json();
        if (active) setNotif(data);
      } catch {}
    }
    fetchNotif();
    const interval = setInterval(fetchNotif, 15000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [user]);

  if (!user) return null;

  const isOwner = user.role === "owner";

  const ownerLinks = [
    { href: "/owner", label: "My Posts", icon: LayoutDashboard },
    { href: "/owner/new", label: "New Post", icon: PlusCircle },
    { href: "/owner/messages", label: "Messages", icon: MessageSquare },
  ];

  const workerLinks = [
    { href: "/worker", label: "Available Jobs", icon: Briefcase },
    { href: "/worker/applications", label: "My Applications", icon: FileText },
    { href: "/worker/messages", label: "Messages", icon: MessageSquare },
  ];

  const navLinks = isOwner ? ownerLinks : workerLinks;
  const profileHref = user.role === "admin" ? "/admin" : `/${user.role}/profile`;
  const messagesHref = isOwner ? "/owner/messages" : "/worker/messages";
  const notifCount = notif.unread_messages + notif.actionable;

  return (
    <>
      <nav className="sticky top-0 z-50 border-b" style={{ backgroundColor: "rgba(255,255,255,0.3)", backdropFilter: "blur(20px)", borderColor: "rgba(255,255,255,0.5)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg" style={{ color: "#1a1a2e" }}>
              <span className="flex items-center justify-center w-8 h-8 rounded-full" style={{ backgroundColor: "#1a1a2e" }}>
                <Wrench className="w-5 h-5" style={{ color: "#F0B45B" }} />
              </span>
              HomeWork Connect
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-2 px-3 py-2 rounded-full text-sm transition-colors"
                    style={{ color: isActive ? "#F0B45B" : "#5a4a20" }}
                  >
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
              <Link
                href={profileHref}
                className="flex items-center gap-2 px-3 py-2 rounded-full text-sm transition-colors"
                style={{ color: "#5a4a20" }}
              >
                Profile
              </Link>
              <Link
                href={messagesHref}
                className="relative p-2 rounded-full transition-colors"
                style={{ color: "#5a4a20" }}
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {notifCount > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center"
                    style={{ backgroundColor: "#ff6b6b", color: "#fff" }}
                  >
                    {notifCount > 9 ? "9+" : notifCount}
                  </span>
                )}
              </Link>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium" style={{ backgroundColor: "#1a1a2e", color: "#F0B45B" }}>
                  {user.full_name?.charAt(0)?.toUpperCase() || "U"}
                </span>
                <span className="text-sm" style={{ color: "#1a1a2e" }}>
                  {user.full_name}
                  <span className="ml-2 px-2 py-0.5 rounded text-xs" style={{ backgroundColor: "#1a1a2e", color: "#F0B45B" }}>
                    {user.role}
                  </span>
                </span>
              </div>
              <button
                onClick={signOut}
                className="text-sm transition-colors hover:text-[#ff6b6b]"
                style={{ color: "#5a4a20" }}
              >
                Sign out
              </button>
            </div>

            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-full transition-colors"
              style={{ color: "#5a4a20" }}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-72 border-l flex flex-col" style={{ backgroundColor: "rgba(255,255,255,0.9)", backdropFilter: "blur(20px)", borderColor: "rgba(0,0,0,0.1)" }}>
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "rgba(0,0,0,0.1)" }}>
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 font-bold" style={{ color: "#1a1a2e" }}
              >
                <span className="flex items-center justify-center w-8 h-8 rounded-full" style={{ backgroundColor: "#1a1a2e" }}>
                  <Wrench className="w-5 h-5" style={{ color: "#F0B45B" }} />
                </span>
                HomeWork Connect
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-full transition-colors"
                style={{ color: "#5a4a20" }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-full transition-colors"
                    style={{ color: isActive ? "#F0B45B" : "#5a4a20" }}
                  >
                    <link.icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                );
              })}
              <Link
                href={profileHref}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-full transition-colors"
                style={{ color: "#5a4a20" }}
              >
                Profile
              </Link>
              <Link
                href={messagesHref}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-full transition-colors"
                style={{ color: "#5a4a20" }}
              >
                <Bell className="w-5 h-5" />
                Notifications
                {notifCount > 0 && (
                  <span
                    className="ml-auto min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center"
                    style={{ backgroundColor: "#ff6b6b", color: "#fff" }}
                  >
                    {notifCount > 9 ? "9+" : notifCount}
                  </span>
                )}
              </Link>
            </div>

            <div className="p-4 border-t space-y-3" style={{ borderColor: "rgba(0,0,0,0.1)" }}>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium" style={{ backgroundColor: "#1a1a2e", color: "#F0B45B" }}>
                  {user.full_name?.charAt(0)?.toUpperCase() || "U"}
                </span>
                <div className="text-sm">
                  <div className="font-medium" style={{ color: "#1a1a2e" }}>{user.full_name}</div>
                  <div className="text-xs" style={{ color: "#5a4a20" }}>{user.role}</div>
                </div>
              </div>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  signOut();
                }}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-full transition-colors hover:text-[#ff6b6b]"
                style={{ color: "#5a4a20" }}
              >
                <LogOut className="w-5 h-5" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
