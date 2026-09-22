"use client";

import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export default function StarRating({ rating, size = "md", interactive = false, onChange }: StarRatingProps) {
  const sizeMap = { sm: "w-3 h-3", md: "w-4 h-4", lg: "w-6 h-6" };

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange?.(star)}
          className={`${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform`}
        >
          <Star
            className={`${sizeMap[size]} ${
              star <= rating
                ? "fill-[#F0B45B] text-[#F0B45B]"
                : "fill-none text-[#dadce0]"
            }`}
          />
        </button>
      ))}
    </div>
  );
}
