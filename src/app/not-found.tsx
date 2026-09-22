import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div style={{ background: "linear-gradient(180deg, #c8850a 0%, #d4940a 20%, #F0B45B 50%, #f5c878 80%, #fae3a0 100%)", minHeight: "100vh" }} className="flex items-center justify-center px-4">
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center w-20 h-20 rounded-full mx-auto" style={{ backgroundColor: "#1a1a2e" }}>
          <SearchX className="w-10 h-10" style={{ color: "#F0B45B" }} />
        </div>
        <h1 className="text-6xl font-bold" style={{ color: "#1a1a2e" }}>404</h1>
        <p className="text-xl" style={{ color: "#1a1a2e" }}>Page not found</p>
        <p className="text-sm" style={{ color: "#5a4a20" }}>
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 rounded-full transition-colors font-medium"
          style={{ backgroundColor: "#1a1a2e", color: "#F0B45B" }}
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
