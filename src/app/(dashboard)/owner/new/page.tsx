"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { JOB_CATEGORIES } from "@/types";
import { Camera, X, Upload, ArrowLeft } from "lucide-react";

export default function NewPostPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("plumbing");
  const [budget, setBudget] = useState("");
  const [location, setLocation] = useState("");
  const [pincode, setPincode] = useState("");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setMediaFiles((prev) => [...prev, ...files]);
    setMediaPreviews((prev) => [...prev, ...newPreviews]);
  }

  function removeMedia(index: number) {
    URL.revokeObjectURL(mediaPreviews[index]);
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
    setMediaPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function startCamera() {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
      setStream(mediaStream);
      setShowCamera(true);
    } catch {
      setError("Camera access denied. Please allow camera permissions.");
    }
  }

  function capturePhoto() {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `photo-${Date.now()}.jpg`, { type: "image/jpeg" });
        const preview = URL.createObjectURL(blob);
        setMediaFiles((prev) => [...prev, file]);
        setMediaPreviews((prev) => [...prev, preview]);
      }
    }, "image/jpeg", 0.9);
    stopCamera();
  }

  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
    setShowCamera(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const uploadedUrls: string[] = [];
    for (const file of mediaFiles) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) uploadedUrls.push(data.url);
    }

    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        category,
        budget: Number(budget),
        location,
        pincode,
        media_urls: uploadedUrls,
      }),
    });

    if (res.ok) {
      router.push("/owner");
    } else {
      const data = await res.json();
      setError(data.error || "Failed to create post");
      setLoading(false);
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/owner"
          className="inline-flex items-center gap-2 mb-6 transition-colors"
          style={{ color: "#5a4a20" }}
        >
          <ArrowLeft className="w-4 h-4" /> Back to posts
        </Link>

        <h1 className="text-2xl font-bold mb-2" style={{ color: "#1a1a2e" }}>Post a New Job</h1>
        <p className="mb-8" style={{ color: "#5a4a20" }}>
          Describe the problem and upload photos so workers understand the task
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: "rgba(255,80,80,0.15)", color: "#ff6b6b" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "#1a1a2e" }}>Job Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-lg text-sm outline-none text-black"
              style={{ backgroundColor: "#fff", border: "1px solid #ddd", color: "#000" }}
              placeholder="e.g. Leaking kitchen pipe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "#1a1a2e" }}>Description</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-lg text-sm outline-none text-black resize-none"
              style={{ backgroundColor: "#fff", border: "1px solid #ddd", color: "#000" }}
              placeholder="Describe the issue in detail..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#1a1a2e" }}>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-lg text-sm outline-none text-black"
                style={{ backgroundColor: "#fff", border: "1px solid #ddd", color: "#000" }}
              >
                {JOB_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#1a1a2e" }}>Budget (INR)</label>
              <input
                type="text"
                inputMode="numeric"
                required
                value={budget}
                onChange={(e) => { const v = e.target.value.replace(/[^0-9]/g, ""); setBudget(v); }}
                className="w-full px-4 py-3 rounded-lg text-sm outline-none text-black"
                style={{ backgroundColor: "#fff", border: "1px solid #ddd", color: "#000" }}
                placeholder="e.g. 500"
              />
            </div>
          </div>

          <div className="grid grid-cols-[1fr_140px] gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#1a1a2e" }}>Location</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-3 rounded-lg text-sm outline-none text-black"
                style={{ backgroundColor: "#fff", border: "1px solid #ddd", color: "#000" }}
                placeholder="Area / landmark"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#1a1a2e" }}>Pincode</label>
              <input
                type="text"
                inputMode="numeric"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                className="w-full px-4 py-3 rounded-lg text-sm outline-none text-black"
                style={{ backgroundColor: "#fff", border: "1px solid #ddd", color: "#000" }}
                placeholder="560001"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "#1a1a2e" }}>Photos</label>
            <div className="flex gap-3 mb-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm transition-colors"
                style={{ border: "1px solid rgba(15,23,42,0.12)", color: "#1a1a2e" }}
              >
                <Upload className="w-4 h-4" /> Upload
              </button>
              <button
                type="button"
                onClick={startCamera}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm transition-colors"
                style={{ border: "1px solid rgba(15,23,42,0.12)", color: "#1a1a2e" }}
              >
                <Camera className="w-4 h-4" /> Camera
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
            />
            <canvas ref={canvasRef} className="hidden" />

            {showCamera && (
              <div className="relative rounded-lg overflow-hidden" style={{ border: "1px solid rgba(15,23,42,0.1)" }}>
                <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg" />
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="px-6 py-2.5 rounded-lg font-medium transition-colors"
                    style={{ backgroundColor: "#1a1a2e", color: "#F0B45B" }}
                  >
                    Capture
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-6 py-2.5 rounded-lg font-medium transition-colors"
                    style={{ backgroundColor: "#ffffff", color: "#1a1a2e", border: "1px solid rgba(15,23,42,0.12)" }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {mediaPreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-3">
                {mediaPreviews.map((preview, i) => (
                  <div key={i} className="relative group">
                    <img src={preview} alt="" className="w-full h-28 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => removeMedia(i)}
                      className="absolute top-1 right-1 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
            style={{ backgroundColor: "#1a1a2e", color: "#F0B45B" }}
          >
            {loading ? "Posting..." : "Post Job"}
          </button>
        </form>
      </div>
    </div>
  );
}
