"use client";

import { useState } from "react";
import { X } from "lucide-react";
import StarRating from "./StarRating";

interface ReviewModalProps {
  open: boolean;
  jobId: string;
  revieweeId: string;
  onClose: () => void;
  onSubmit: () => void;
}

export default function ReviewModal({ open, jobId, revieweeId, onClose, onSubmit }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: jobId, reviewee_id: revieweeId, rating, comment: comment.trim() }),
      });
      if (res.ok) {
        onSubmit();
        onClose();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to submit review");
      }
    } catch {
      setError("Failed to submit review");
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative rounded-2xl p-6 w-full max-w-md shadow-xl animate-fade-in" style={{ backgroundColor: "#1a1a1a", border: "1px solid #333" }}>
        <button onClick={onClose} className="absolute top-4 right-4 hover:text-white transition-colors" style={{ color: "#aaa" }}>
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-semibold mb-2 text-white">Rate this worker</h3>
        <p className="text-sm mb-6" style={{ color: "#aaa" }}>How was your experience?</p>

        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: "rgba(255,80,80,0.15)", color: "#ff6b6b" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-center">
            <StarRating rating={rating} size="lg" interactive onChange={setRating} />
          </div>

          <div>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
              className="w-full px-4 py-3 rounded-xl text-sm resize-none outline-none text-black"
              style={{ backgroundColor: "#fff", border: "1px solid #ddd", color: "#000" }}
              placeholder="Tell us about your experience (optional)"
            />
            <p className="text-xs text-right mt-1" style={{ color: "#666" }}>{comment.length}/500</p>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm transition-colors"
              style={{ border: "1px solid rgba(255,255,255,0.15)", color: "#aaa" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
              style={{ backgroundColor: "#1a1a2e", color: "#F0B45B" }}
            >
              {loading ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
