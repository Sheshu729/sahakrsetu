"use client";

import { X } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative rounded-2xl p-6 w-full max-w-md shadow-xl" style={{ backgroundColor: "#fff", border: "1px solid #ddd" }}>
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 hover:text-black transition-colors"
          style={{ color: "#7a6a30" }}
        >
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-semibold mb-2" style={{ color: "#1a1a2e" }}>{title}</h3>
        <p className="text-sm mb-6" style={{ color: "#5a4a20" }}>{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
            style={{ border: "1px solid #ddd", color: "#5a4a20" }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
            style={{
              backgroundColor: danger ? "#d93025" : "#1a1a2e",
              color: danger ? "#fff" : "#F0B45B",
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
