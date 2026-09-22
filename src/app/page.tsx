"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Wrench,
  Search,
  Droplets,
  Zap,
  Hammer,
  Paintbrush,
  SprayCan,
  Refrigerator,
  Shield,
  MapPin,
  ChevronDown,
  MoreHorizontal,
  Star,
  ArrowRight,
  Users,
  Briefcase,
  Globe,
  MessageCircle,
  Mail,
  Home,
} from "lucide-react";

const serviceCategories = [
  { name: "Plumbing", img: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&h=300&fit=crop&crop=center" },
  { name: "Electrical", img: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&h=300&fit=crop&crop=center" },
  { name: "Carpentry", img: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop&crop=center" },
  { name: "Cleaning", img: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop&crop=center" },
  { name: "Painting", img: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=300&fit=crop&crop=center" },
  { name: "AC & Cooling", img: "https://images.unsplash.com/photo-1631545806609-3c480b4c2986?w=400&h=300&fit=crop&crop=center" },
  { name: "Appliance Repair", img: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=300&fit=crop&crop=center" },
  { name: "Home Security", img: "https://images.unsplash.com/photo-1558002038-1055907df827?w=400&h=300&fit=crop&crop=center" },
  { name: "Masonry", img: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop&crop=center" },
  { name: "Gardening", img: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop&crop=center" },
  { name: "Furniture", img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop&crop=center" },
  { name: "Handyman", img: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop&crop=center" },
];

const navLinks = [
  { name: "Plumbing", href: "/register" },
  { name: "Electrical", href: "/register" },
  { name: "Carpentry", href: "/register" },
  { name: "Painting", href: "/register" },
];

const steps = [
  { num: 1, title: "Describe your task", desc: "Tell us about the home service you need. Be as detailed as possible." },
  { num: 2, title: "Choose a worker", desc: "Browse profiles, ratings, and reviews to find the right person." },
  { num: 3, title: "Get it done", desc: "Your worker arrives on time and completes the job to your satisfaction." },
];

interface Stats {
  total_workers: number;
  total_completed_jobs: number;
  avg_rating: number;
  total_users: number;
}

const testimonials = [
  { name: "Priya Sharma", role: "Homeowner", stars: 5, text: "Excellent service! The plumber arrived on time and fixed the leak quickly. Highly recommend HomeWork Connect." },
  { name: "Rahul Verma", role: "Electrician", stars: 5, text: "As a worker, this platform has helped me find consistent work and grow my business. Great experience so far." },
  { name: "Anjali Patel", role: "Homeowner", stars: 4, text: "I've used this for painting and carpentry work. The quality of workers is outstanding and the process is seamless." },
];

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  const statCards = [
    { value: (stats?.total_workers ?? 0).toLocaleString("en-IN"), label: "Workers" },
    { value: (stats?.total_completed_jobs ?? 0).toLocaleString("en-IN"), label: "Jobs Completed" },
    { value: stats?.avg_rating ? stats.avg_rating.toFixed(1) : "—", label: "Average Rating" },
    { value: (stats?.total_users ?? 0).toLocaleString("en-IN"), label: "Community Members" },
  ];

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Google Sans', 'Roboto', system-ui, sans-serif", background: "linear-gradient(180deg, #000000 0%, #1a1a1a 15%, #333333 30%, #555555 45%, #777777 55%, #999999 65%, #bbbbbb 75%, #dddddd 85%, #f0f0f0 95%, #ffffff 100%)" }}>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b" style={{ borderColor: "#333", backgroundColor: "rgba(13,13,13,0.9)", backdropFilter: "blur(20px)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left: Logo + Brand */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#333" }}>
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold leading-tight text-white">
              HomeWork
              <br />
              Connect
            </span>
          </Link>

          {/* Middle: Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium transition-colors hover:text-white"
                style={{ color: "#999" }}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right: Location + Search */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Location selector */}
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition-colors hover:bg-white/5"
              style={{ borderColor: "#444", color: "#ccc" }}
            >
              <MapPin className="w-4 h-4 text-white" />
              <span>Select location</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {/* Search bar */}
            <div
              className="flex items-center gap-2.5 px-5 py-2.5 rounded-full border text-sm"
              style={{ borderColor: "#444", color: "#888" }}
            >
              <Search className="w-4 h-4" />
              <input
                type="text"
                placeholder="Search for 'plumbing', 'electrician'..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="outline-none bg-transparent w-56"
                style={{ color: "#fff" }}
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-center">
            {/* Left (60%) - Heading + Service Category Grid */}
            <div className="lg:col-span-3">
              <h1
                className="font-bold leading-tight mb-8 text-white"
                style={{ fontSize: "clamp(36px, 5vw, 56px)" }}
              >
                Home services
                <br />
                at your doorstep
              </h1>

              {/* Service Category Grid Container */}
              <div
                className="inline-block rounded-3xl border p-6"
                style={{ borderColor: "#343a40", backgroundColor: "#1a1a1a" }}
              >
                <div className="grid grid-cols-4 gap-4">
                  {serviceCategories.map((cat) => (
                    <Link
                      key={cat.name}
                      href="/register"
                      className="flex flex-col rounded-2xl overflow-hidden transition-all hover:scale-[1.03] cursor-pointer group"
                      style={{ backgroundColor: "#2a2a2a", border: "1px solid #3a3a3a" }}
                    >
                      <div className="w-full h-28 overflow-hidden bg-[#f0f0f0]">
                        <img
                          src={cat.img}
                          alt={cat.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex items-center justify-between px-3 py-2.5">
                        <span className="text-xs font-semibold" style={{ color: "#e0e0e0" }}>
                          {cat.name}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5" style={{ color: "#888" }} />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Right (40%) - Photo Collage */}
            <div className="lg:col-span-2 hidden lg:block">
              <div className="grid grid-cols-2 gap-3">
                {/* Top: large image spanning full width */}
                <div className="col-span-2">
                  <img
                    src="https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=500&h=600&fit=crop"
                    alt="Plumber at work"
                    className="w-full h-56 object-cover rounded-2xl shadow-sm"
                  />
                </div>
                {/* Bottom left */}
                <div>
                  <img
                    src="https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=500&h=300&fit=crop"
                    alt="Electrician at work"
                    className="w-full h-40 object-cover rounded-2xl shadow-sm"
                  />
                </div>
                {/* Bottom right */}
                <div>
                  <img
                    src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&h=300&fit=crop"
                    alt="Cleaning service"
                    className="w-full h-40 object-cover rounded-2xl shadow-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold mb-3 text-white">How it works</h2>
            <p className="text-sm" style={{ color: "#bbb" }}>Three simple steps to get your job done</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.num} className="relative flex flex-col items-center text-center p-8 rounded-2xl border transition-all hover:shadow-lg" style={{ backgroundColor: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.1)" }}>
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-black font-bold text-lg mb-5" style={{ backgroundColor: "#fff" }}>
                  {step.num}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#bbb" }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {statCards.map((stat) => (
            <div key={stat.label} className="p-6 rounded-2xl text-center border" style={{ backgroundColor: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.2)" }}>
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm" style={{ color: "#ccc" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold mb-3 text-white">What people are saying</h2>
            <p className="text-sm" style={{ color: "#aaa" }}>What the community says about HomeWork Connect</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="p-6 rounded-2xl transition-all hover:shadow-lg" style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4" style={{ color: i < t.stars ? "#ffd43b" : "rgba(255,255,255,0.2)", fill: i < t.stars ? "#ffd43b" : "none" }} />
                  ))}
                </div>
                <p className="text-sm mb-4 leading-relaxed text-white">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                    {t.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{t.name}</div>
                    <div className="text-xs" style={{ color: "#aaa" }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Cards */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 rounded-2xl text-white relative overflow-hidden border" style={{ backgroundColor: "#222", borderColor: "#444" }}>
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
            <Home className="w-8 h-8 mb-4 relative z-10" />
            <h3 className="text-xl font-semibold mb-2 relative z-10">For Homeowners</h3>
            <p className="text-sm mb-6 leading-relaxed relative z-10" style={{ color: "#ccc" }}>
              Find trusted, skilled workers for all your home repair and maintenance needs. Post your job and get started today.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:shadow-lg relative z-10"
              style={{ backgroundColor: "rgba(255,255,255,0.5)", color: "#fff" }}
            >
              Post a Job <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-8 rounded-2xl text-white relative overflow-hidden border" style={{ backgroundColor: "#333", borderColor: "#444" }}>
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
            <Briefcase className="w-8 h-8 mb-4 relative z-10" />
            <h3 className="text-xl font-semibold mb-2 relative z-10">For Workers</h3>
            <p className="text-sm mb-6 leading-relaxed relative z-10" style={{ color: "#ccc" }}>
              Grow your business by finding new clients. Create your profile and start receiving job requests.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:shadow-lg relative z-10"
              style={{ backgroundColor: "rgba(255,255,255,0.5)", color: "#fff" }}
            >
              Find Work <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t" style={{ borderColor: "#ccc" }}>
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#333" }}>
                <Wrench className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-bold text-white">HomeWork Connect</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "#aaa" }}>
              Connecting homeowners with trusted workers for all home services.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3 text-white">Services</h4>
            <ul className="space-y-2">
              {serviceCategories.slice(0, 4).map((s) => (
                <li key={s.name}>
                  <Link href="/register" className="text-sm transition-colors hover:text-white" style={{ color: "#aaa" }}>{s.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3 text-white">Company</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="text-sm transition-colors hover:text-white" style={{ color: "#aaa" }}>About</Link></li>
              <li><Link href="/register" className="text-sm transition-colors hover:text-white" style={{ color: "#aaa" }}>For Homeowners</Link></li>
              <li><Link href="/register" className="text-sm transition-colors hover:text-white" style={{ color: "#aaa" }}>For Workers</Link></li>
              <li><Link href="/login" className="text-sm transition-colors hover:text-white" style={{ color: "#aaa" }}>Sign In</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3 text-white">Support</h4>
            <ul className="space-y-2">
              <li><Link href="/register" className="text-sm transition-colors hover:text-white" style={{ color: "#aaa" }}>Get Started</Link></li>
              <li><Link href="/login" className="text-sm transition-colors hover:text-white" style={{ color: "#aaa" }}>Sign In</Link></li>
              <li><Link href="/register" className="text-sm transition-colors hover:text-white" style={{ color: "#aaa" }}>Create Account</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-10 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderColor: "#ccc" }}>
          <p className="text-xs" style={{ color: "#aaa" }}>&copy; 2024 HomeWork Connect. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/register" className="transition-colors hover:text-white" style={{ color: "#aaa" }}><Globe className="w-4 h-4" /></Link>
            <Link href="/register" className="transition-colors hover:text-white" style={{ color: "#aaa" }}><MessageCircle className="w-4 h-4" /></Link>
            <Link href="/register" className="transition-colors hover:text-white" style={{ color: "#aaa" }}><Mail className="w-4 h-4" /></Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
