"use client";

export function SkeletonCard() {
  return (
    <div className="p-6 rounded-2xl animate-pulse" style={{ backgroundColor: "#ffffff", border: "1px solid rgba(15,23,42,0.08)" }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="h-5 w-32 rounded" style={{ backgroundColor: "rgba(15,23,42,0.06)" }} />
        <div className="h-5 w-16 rounded-full" style={{ backgroundColor: "rgba(15,23,42,0.06)" }} />
      </div>
      <div className="h-4 w-48 rounded mb-3" style={{ backgroundColor: "rgba(15,23,42,0.06)" }} />
      <div className="h-4 w-full rounded mb-2" style={{ backgroundColor: "rgba(15,23,42,0.06)" }} />
      <div className="h-4 w-3/4 rounded mb-4" style={{ backgroundColor: "rgba(15,23,42,0.06)" }} />
      <div className="flex gap-4">
        <div className="h-3 w-24 rounded" style={{ backgroundColor: "rgba(15,23,42,0.06)" }} />
        <div className="h-3 w-20 rounded" style={{ backgroundColor: "rgba(15,23,42,0.06)" }} />
        <div className="h-3 w-28 rounded" style={{ backgroundColor: "rgba(15,23,42,0.06)" }} />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonProfile() {
  return (
    <div className="p-6 rounded-2xl animate-pulse" style={{ backgroundColor: "#ffffff", border: "1px solid rgba(15,23,42,0.08)" }}>
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full" style={{ backgroundColor: "rgba(15,23,42,0.06)" }} />
        <div>
          <div className="h-5 w-40 rounded mb-2" style={{ backgroundColor: "rgba(15,23,42,0.06)" }} />
          <div className="h-4 w-24 rounded" style={{ backgroundColor: "rgba(15,23,42,0.06)" }} />
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-4 w-full rounded" style={{ backgroundColor: "rgba(15,23,42,0.06)" }} />
        <div className="h-4 w-3/4 rounded" style={{ backgroundColor: "rgba(15,23,42,0.06)" }} />
      </div>
    </div>
  );
}
